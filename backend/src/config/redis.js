const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on('connect', () => {
  logger.info('Redis connecté avec succès');
});

redis.on('error', (err) => {
  logger.error(`Erreur Redis: ${err.message}`);
});

module.exports = redis;