const prisma = require('../config/prisma');
const redis = require('../config/redis');
const Product = require('../models/mongo/Product');
const { MAX_KEYS_PER_IMPORT, LICENSE_STATUS, REDIS_KEYS } = require('../constants');

const importKeys = async (productId, keysText) => {
  const keyCodes = keysText
    .split('\n')
    .map(k => k.trim())
    .filter(k => k && !k.startsWith('#'));

  if (!keyCodes.length) throw new Error('Aucune clé valide trouvée');
  if (keyCodes.length > MAX_KEYS_PER_IMPORT) {
    throw new Error(`Import limité à ${MAX_KEYS_PER_IMPORT} clés par requête (reçu : ${keyCodes.length})`);
  }

  // Dédoublonnage de l'import lui-même
  const uniqueCodes = [...new Set(keyCodes)];

  // Codes déjà présents en PostgreSQL
  const existing = await prisma.licenseKey.findMany({
    where: { code: { in: uniqueCodes } },
    select: { code: true },
  });
  const existingSet = new Set(existing.map(k => k.code));

  const newCodes = uniqueCodes.filter(c => !existingSet.has(c));
  const skipped = uniqueCodes.length - newCodes.length;

  if (!newCodes.length) {
    return { inserted: 0, skipped };
  }

  // Insert PostgreSQL (skipDuplicates = filet de sécurité contre les race conditions)
  const result = await prisma.licenseKey.createMany({
    data: newCodes.map(code => ({ code, productId, status: LICENSE_STATUS.AVAILABLE })),
    skipDuplicates: true,
  });

  const inserted = result.count;

  if (inserted > 0) {
    // Query back the actually inserted keys to push only the correct ones to Redis
    const insertedKeys = await prisma.licenseKey.findMany({
      where: { productId, code: { in: newCodes }, status: LICENSE_STATUS.AVAILABLE },
      select: { code: true },
    });
    const toRedis = insertedKeys.map(k => k.code);
    if (toRedis.length) {
      await redis.lpush(REDIS_KEYS.availableKeys(productId), ...toRedis);
    }

    // Incrémenter le stock MongoDB par le nombre réel d'insertions
    await Product.findByIdAndUpdate(productId, {
      $inc: { availableKeysCount: inserted },
    });
  }

  return { inserted, skipped };
};

const popAvailableKey = async (productId) => {
  const keyCode = await redis.rpop(REDIS_KEYS.availableKeys(productId));
  return keyCode;
};

module.exports = { importKeys, popAvailableKey };
