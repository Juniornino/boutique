const bcrypt = require('bcryptjs');
const Product = require('../models/mongo/Product');
const User = require('../models/mongo/User');
const StoreSettings = require('../models/mongo/StoreSettings');
const prisma = require('../config/prisma');
const logger = require('../config/logger');
const { BCRYPT_ROUNDS_DEFAULT, LOW_STOCK_THRESHOLD, ORDER_STATUS } = require('../constants');

const toActivity = ({ title, desc, type, at }) => ({
  title,
  desc,
  type,
  at: at instanceof Date ? at.toISOString() : at,
});

// ─── Profil administrateur ──────────────────────────────────────────────────

const updateAdminProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const updates = {};

    if (typeof firstName === 'string') updates.firstName = firstName.trim();
    if (typeof lastName === 'string') updates.lastName = lastName.trim();

    if (typeof email === 'string' && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé.' });
      }
      updates.email = normalizedEmail;
    }

    if (typeof password === 'string' && password.trim()) {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS || BCRYPT_ROUNDS_DEFAULT, 10);
      updates.password = await bcrypt.hash(password.trim(), await bcrypt.genSalt(rounds));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

    if (updates.email) {
      await prisma.userRef.update({
        where: { id: req.user.id },
        data: { email: updates.email }
      });
    }

    res.json({ success: true, data: user, message: 'Profil administrateur mis à jour.' });
  } catch (error) {
    next(error);
  }
};

// ─── Paramètres de boutique ─────────────────────────────────────────────────

const findOrCreateStoreSettings = async () => {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({});
  }
  return settings;
};

const getStoreSettings = async (req, res, next) => {
  try {
    const settings = await findOrCreateStoreSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateStoreSettings = async (req, res, next) => {
  try {
    const payload = {
      name: String(req.body?.name || '').trim(),
      email: String(req.body?.email || '').trim(),
      phone: String(req.body?.phone || '').trim(),
      description: String(req.body?.description || '').trim()
    };

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create(payload);
    } else {
      Object.assign(settings, payload);
      await settings.save();
    }

    res.json({ success: true, data: settings, message: 'Paramètres de boutique mis à jour.' });
  } catch (error) {
    next(error);
  }
};

// ─── Activités & notifications ──────────────────────────────────────────────

const getSystemActivities = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 10), 50);

    const [failedOrders, recentKeys, lowStockProducts] = await Promise.all([
      prisma.order.findMany({
        where: { status: ORDER_STATUS.FAILED },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 10),
      }),
      prisma.licenseKey.findMany({
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 20),
        select: { createdAt: true, productId: true },
      }),
      Product.find({ isActive: true, availableKeysCount: { $lt: LOW_STOCK_THRESHOLD } })
        .select('name availableKeysCount updatedAt')
        .sort({ availableKeysCount: 1 })
        .limit(Math.min(limit, 10)),
    ]);

    const productIds = [...new Set(recentKeys.map((k) => k.productId))];
    const productRefs = productIds.length
      ? await prisma.productRef.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [];
    const productRefMap = Object.fromEntries(productRefs.map((p) => [p.id, p.name]));

    const keyAgg = new Map();
    for (const k of recentKeys) {
      const cur = keyAgg.get(k.productId) || { count: 0, latestAt: k.createdAt };
      cur.count += 1;
      if (k.createdAt > cur.latestAt) cur.latestAt = k.createdAt;
      keyAgg.set(k.productId, cur);
    }

    const importActivities = [...keyAgg.entries()]
      .slice(0, 5)
      .map(([productId, agg]) =>
        toActivity({
          title: 'Importation détectée',
          desc: `${agg.count} clé(s) ajoutée(s) pour ${productRefMap[productId] || productId}`,
          type: 'success',
          at: agg.latestAt,
        })
      );

    const stockActivities = (lowStockProducts || []).map((p) =>
      toActivity({
        title: 'Alerte Stock Bas',
        desc: `${p.name} : seulement ${Number(p.availableKeysCount || 0)} clé(s) restantes`,
        type: 'warning',
        at: p.updatedAt || new Date(),
      })
    );

    const paymentActivities = (failedOrders || []).map((o) =>
      toActivity({
        title: 'Erreur de paiement',
        desc: `Commande ${o.id} marquée FAILED`,
        type: 'danger',
        at: o.createdAt,
      })
    );

    const activities = [...paymentActivities, ...stockActivities, ...importActivities]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, limit);

    res.json({ success: true, data: activities });
  } catch (error) {
    next(error);
  }
};

const getNotificationsSummary = async (req, res, next) => {
  try {
    const [failedCount, lowStockCount] = await Promise.all([
      prisma.order.count({ where: { status: ORDER_STATUS.FAILED } }),
      Product.countDocuments({ isActive: true, availableKeysCount: { $lt: LOW_STOCK_THRESHOLD } }),
    ]);

    const count = Number(failedCount || 0) + Number(lowStockCount || 0);
    res.json({ success: true, data: { count, failedPayments: failedCount, lowStock: lowStockCount } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateAdminProfile,
  getStoreSettings,
  updateStoreSettings,
  getSystemActivities,
  getNotificationsSummary,
  findOrCreateStoreSettings,
};
