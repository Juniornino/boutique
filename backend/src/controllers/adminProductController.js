const Product = require('../models/mongo/Product');
const prisma = require('../config/prisma');
const redis = require('../config/redis');
const logger = require('../config/logger');
const { importKeys } = require('../services/licenseService');
const { paginate } = require('../utils/paginate');
const { LICENSE_STATUS, REDIS_KEYS } = require('../constants');

const invalidateProductCache = async () => {
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', 'products:*', 'COUNT', 100);
    cursor = nextCursor;
    if (keys.length) await redis.del(...keys);
  } while (cursor !== '0');
};

// ─── Produits CRUD ──────────────────────────────────────────────────────────

const createProduct = async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();

    await prisma.productRef.create({
      data: {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        promotionalPrice: product.promotionalPrice || null,
      }
    });

    await invalidateProductCache();
    logger.info(`Produit créé: id=${product._id}, name=${product.name}, adminId=${req.user.id}, ip=${req.ip}`);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé.' });

    await prisma.productRef.update({
      where: { id: product._id.toString() },
      data: { name: product.name, price: product.price, promotionalPrice: product.promotionalPrice || null }
    });

    await invalidateProductCache();
    logger.info(`Produit modifié: id=${req.params.id}, adminId=${req.user.id}, ip=${req.ip}`);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé.' });

    await invalidateProductCache();
    logger.info(`Produit désactivé: id=${req.params.id}, adminId=${req.user.id}, ip=${req.ip}`);
    res.json({ success: true, message: 'Produit désactivé.' });
  } catch (error) {
    next(error);
  }
};

const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file?.filename) {
      return res.status(400).json({ success: false, message: 'Aucune image envoyée.' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    }

    const relativePath = `/uploads/products/${req.file.filename}`;
    const apiBase =
      process.env.API_PUBLIC_URL ||
      `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${apiBase.replace(/\/$/, '')}${relativePath}`;
    product.image = imageUrl;
    await product.save();
    await invalidateProductCache();

    res.json({ success: true, data: { image: imageUrl }, message: 'Image du produit mise à jour.' });
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { page, limit, take, skip } = paginate(req.query);
    const { search, status } = req.query;
    const filters = {};

    if (status === 'active') filters.isActive = true;
    if (status === 'inactive') filters.isActive = false;
    if (search) filters.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(filters).sort({ updatedAt: -1 }).skip(skip).limit(take),
      Product.countDocuments(filters)
    ]);

    const productIds = products.map(p => p._id.toString());
    const pgCounts = await prisma.licenseKey.groupBy({
      by: ['productId', 'status'],
      where: { productId: { in: productIds } },
      _count: { id: true }
    });

    const countMap = new Map();
    for (const r of pgCounts) {
      const existing = countMap.get(r.productId) || {
        [LICENSE_STATUS.AVAILABLE]: 0,
        [LICENSE_STATUS.SOLD]: 0,
        [LICENSE_STATUS.RESERVED]: 0,
      };
      existing[r.status] = r._count.id;
      countMap.set(r.productId, existing);
    }

    const enriched = products.map(p => {
      const counts = countMap.get(p._id.toString()) || {
        [LICENSE_STATUS.AVAILABLE]: 0,
        [LICENSE_STATUS.SOLD]: 0,
        [LICENSE_STATUS.RESERVED]: 0,
      };
      return {
        ...p.toObject(),
        availableKeysCount: counts[LICENSE_STATUS.AVAILABLE],
        soldCount: counts[LICENSE_STATUS.SOLD],
        reservedCount: counts[LICENSE_STATUS.RESERVED],
      };
    });

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─── Clés de licence ────────────────────────────────────────────────────────

const bulkImportKeys = async (req, res, next) => {
  try {
    const { inserted, skipped } = await importKeys(req.params.id, req.body.keys);
    logger.info(`Import bulk: productId=${req.params.id}, inserted=${inserted}, skipped=${skipped}, adminId=${req.user.id}, ip=${req.ip}`);
    const message = skipped > 0
      ? `${inserted} clé(s) importée(s). ${skipped} doublon(s) ignoré(s).`
      : `${inserted} clé(s) importée(s) avec succès.`;
    res.json({ success: true, message, data: { inserted, skipped } });
  } catch (error) {
    next(error);
  }
};

const getKeys = async (req, res, next) => {
  try {
    const { take, skip } = paginate(req.query);
    const keys = await prisma.licenseKey.findMany({
      where: { productId: req.params.id },
      take,
      skip,
      select: { id: true, status: true, createdAt: true, code: true }
    });

    const filteredKeys = keys.map(k => ({
      ...k,
      code: k.status === LICENSE_STATUS.AVAILABLE ? k.code : 'HIDDEN'
    }));

    res.json({ success: true, data: filteredKeys });
  } catch (error) {
    next(error);
  }
};

const updateKey = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Clé invalide.' });
    }

    const existing = await prisma.licenseKey.findUnique({ where: { id: req.params.keyId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Clé non trouvée.' });
    }

    const key = await prisma.licenseKey.update({
      where: { id: req.params.keyId },
      data: { code: code.trim() }
    });

    if (existing.status === LICENSE_STATUS.AVAILABLE) {
      const redisKey = REDIS_KEYS.availableKeys(existing.productId);
      await redis.lrem(redisKey, 0, existing.code).catch(() => {});
      await redis.lpush(redisKey, key.code).catch(() => {});
    }

    logger.info(`Clé modifiée: keyId=${key.id}, productId=${existing.productId}, adminId=${req.user.id}, ip=${req.ip}`);
    res.json({ success: true, data: key, message: 'Clé modifiée avec succès.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Clé non trouvée.' });
    }
    next(error);
  }
};

const deleteKey = async (req, res, next) => {
  try {
    const key = await prisma.licenseKey.findUnique({ where: { id: req.params.keyId } });
    if (!key) return res.status(404).json({ success: false, message: 'Clé non trouvée.' });

    await prisma.licenseKey.delete({ where: { id: req.params.keyId } });

    await redis.lrem(REDIS_KEYS.availableKeys(key.productId), 0, key.code).catch(() => {});

    if (key.status === LICENSE_STATUS.AVAILABLE) {
      await Product.findByIdAndUpdate(key.productId, {
        $inc: { availableKeysCount: -1 }
      }).catch(err => logger.warn(`Décrement availableKeysCount (deleteKey ${key.id}): ${err.message}`));
    }

    logger.info(`Clé supprimée: keyId=${key.id}, productId=${key.productId}, adminId=${req.user.id}, ip=${req.ip}`);
    res.json({ success: true, message: 'Clé supprimée avec succès.' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'Clé non trouvée.' });
    }
    next(error);
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  getProducts,
  bulkImportKeys,
  getKeys,
  updateKey,
  deleteKey,
};
