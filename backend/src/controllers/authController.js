const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/mongo/User');
const prisma = require('../config/prisma');
const { generateTokens } = require('../config/jwt');
const logger = require('../config/logger');
const { sendPasswordResetEmail } = require('../services/emailService');
const { setAuthCookies, clearAuthCookies } = require('../helpers/cookieHelper');
const { BCRYPT_ROUNDS_DEFAULT, RESET_PASSWORD_TTL_MS } = require('../constants');

const register = async (req, res, next) => {
  try {
    const { password, firstName, lastName } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email déjà utilisé.' });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS_DEFAULT, 10));
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword, firstName, lastName });
    await user.save();

    await prisma.userRef.create({
      data: { id: user._id.toString(), email: user.email }
    });

    const tokens = generateTokens(user);
    setAuthCookies(res, tokens);

    res.status(201).json({ success: true, message: 'Inscription réussie.' });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = (req.body.email || '').trim().toLowerCase();
    
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      logger.warn(`Tentative de connexion échouée (email: ${email}, IP: ${req.ip})`);
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Tentative de connexion échouée (email: ${email}, IP: ${req.ip})`);
      return res.status(401).json({ success: false, message: 'Identifiants invalides.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = generateTokens(user);
    setAuthCookies(res, tokens);

    res.json({ success: true, message: 'Connexion réussie.' });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const logout = (req, res) => {
  clearAuthCookies(res);
  res.json({ success: true, message: 'Déconnexion réussie.' });
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email });

    // Always return a generic message to avoid email enumeration.
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn(
          `Mot de passe oublie : aucun compte MongoDB pour "${email}" — aucun email envoye`
        );
      }
      return res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpiresAt = new Date(Date.now() + RESET_PASSWORD_TTL_MS);

    user.resetPasswordTokenHash = resetPasswordTokenHash;
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();

    logger.info(`Demande de réinitialisation (email: ${email}, IP: ${req.ip})`);

    try {
      await sendPasswordResetEmail({ to: email, resetToken });
    } catch (err) {
      logger.error(`Échec envoi email réinitialisation (email: ${email}): ${err.message}`);
    }

    return res.json({
      success: true,
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      data: process.env.NODE_ENV === 'development' ? { resetToken } : undefined
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token invalide ou expiré.' });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS_DEFAULT, 10));
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.json({ success: true, message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    next(error);
  }
};

const refreshTokenHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token manquant.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Refresh token invalide ou expiré.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Utilisateur introuvable ou désactivé.' });
    }

    const tokens = generateTokens(user);
    setAuthCookies(res, tokens);

    res.json({ success: true, message: 'Token rafraîchi.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me, logout, forgotPassword, resetPassword, refreshTokenHandler };
