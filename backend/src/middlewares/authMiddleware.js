const jwt = require('jsonwebtoken');
const User = require('../models/mongo/User');

const verifyToken = (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Accès non autorisé.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('role');
    if (user && user.role === 'ADMIN') {
      return next();
    }
    res.status(403).json({ success: false, message: 'Accès refusé. Réservé aux administrateurs.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la vérification des droits.' });
  }
};

module.exports = { verifyToken, requireAdmin };