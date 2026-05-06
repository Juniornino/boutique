// ─── Status enums (mirrors Prisma enums for runtime use) ────────────────────
const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
});

const LICENSE_STATUS = Object.freeze({
  AVAILABLE: 'AVAILABLE',
  SOLD: 'SOLD',
  RESERVED: 'RESERVED',
});

const VALID_ORDER_STATUSES = Object.values(ORDER_STATUS);

// ─── Redis key prefixes ─────────────────────────────────────────────────────
const REDIS_KEYS = Object.freeze({
  availableKeys: (productId) => `available_keys:${productId}`,
  cart: (userId) => `cart:${userId}`,
  productsCache: (params) => `products:${JSON.stringify(params)}`,
});

// ─── TTL / Timeouts ─────────────────────────────────────────────────────────
const CART_TTL_SECONDS = parseInt(process.env.CART_TTL_SECONDS || '86400', 10);
const PRODUCTS_CACHE_TTL_SECONDS = 300;
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_PASSWORD_TTL_MS = 15 * 60 * 1000;

// ─── Limits ─────────────────────────────────────────────────────────────────
const MAX_KEYS_PER_IMPORT = 10_000;
const LOW_STOCK_THRESHOLD = 10;
const BCRYPT_ROUNDS_DEFAULT = 12;

// ─── Payment methods ────────────────────────────────────────────────────────
const PAYMENT_METHOD = Object.freeze({
  MOBILE_MONEY: 'mobile_money',
  CARD: 'card',
});

module.exports = {
  ORDER_STATUS,
  LICENSE_STATUS,
  VALID_ORDER_STATUSES,
  REDIS_KEYS,
  CART_TTL_SECONDS,
  PRODUCTS_CACHE_TTL_SECONDS,
  ACCESS_TOKEN_MAX_AGE_MS,
  REFRESH_TOKEN_MAX_AGE_MS,
  RESET_PASSWORD_TTL_MS,
  MAX_KEYS_PER_IMPORT,
  LOW_STOCK_THRESHOLD,
  BCRYPT_ROUNDS_DEFAULT,
  PAYMENT_METHOD,
};
