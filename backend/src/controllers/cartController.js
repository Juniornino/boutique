const redis = require('../config/redis');
const { REDIS_KEYS, CART_TTL_SECONDS } = require('../constants');

const getCart = async (req, res, next) => {
  try {
    const cart = await redis.get(REDIS_KEYS.cart(req.user.id));
    res.json({ success: true, data: cart ? JSON.parse(cart) : [] });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const cartKey = REDIS_KEYS.cart(req.user.id);
    let cart = await redis.get(cartKey);
    cart = cart ? JSON.parse(cart) : [];

    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cart[itemIndex].quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    await redis.set(cartKey, JSON.stringify(cart), 'EX', CART_TTL_SECONDS);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cartKey = REDIS_KEYS.cart(req.user.id);
    let cart = await redis.get(cartKey);
    if (!cart) return res.status(404).json({ success: false, message: 'Panier vide.' });

    cart = JSON.parse(cart);
    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cart[itemIndex].quantity = quantity;
      await redis.set(cartKey, JSON.stringify(cart), 'EX', CART_TTL_SECONDS);
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cartKey = REDIS_KEYS.cart(req.user.id);
    let cart = await redis.get(cartKey);
    if (cart) {
      cart = JSON.parse(cart).filter(item => item.productId !== productId);
      await redis.set(cartKey, JSON.stringify(cart), 'EX', CART_TTL_SECONDS);
    }
    res.json({ success: true, data: cart || [] });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await redis.del(REDIS_KEYS.cart(req.user.id));
    res.json({ success: true, message: 'Panier vidé.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };