const Product = require('../models/mongo/Product');
const redis = require('../config/redis');
const { paginate } = require('../utils/paginate');
const { findOrCreateStoreSettings } = require('./adminSettingsController');
const { REDIS_KEYS, PRODUCTS_CACHE_TTL_SECONDS } = require('../constants');

const getProducts = async (req, res, next) => {
  try {
    const { page, limit, take, skip } = paginate(req.query);
    const { category, search } = req.query;

    const cacheKey = REDIS_KEYS.productsCache({ category, search, page, limit });
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached) });
    }

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter).skip(skip).limit(take);
    await redis.set(cacheKey, JSON.stringify(products), 'EX', PRODUCTS_CACHE_TTL_SECONDS);

    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Produit non trouvé.' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

const getStoreSettingsPublic = async (req, res, next) => {
  try {
    const settings = await findOrCreateStoreSettings();
    res.json({
      success: true,
      data: {
        name: settings.name || '',
        email: settings.email || '',
        phone: settings.phone || '',
        description: settings.description || '',
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProductById, getStoreSettingsPublic };