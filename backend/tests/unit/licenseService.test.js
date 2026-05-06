jest.mock('../../src/config/prisma', () => ({
  licenseKey: {
    createMany: jest.fn(),
  },
}));

jest.mock('../../src/config/redis', () => ({
  lpush: jest.fn(),
  rpop: jest.fn(),
}));

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
}));

jest.mock('../../src/models/mongo/Product', () => ({
  findByIdAndUpdate: jest.fn(),
}));

const prisma = require('../../src/config/prisma');
const redis = require('../../src/config/redis');
const Product = require('../../src/models/mongo/Product');
const logger = require('../../src/config/logger');
const { importKeys, popAvailableKey } = require('../../src/services/licenseService');

describe('licenseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('importKeys lève une erreur si aucune clé valide', async () => {
    await expect(importKeys('p1', '\n  \n', 'admin-1')).rejects.toThrow('Aucune clé valide trouvée');
  });

  it('importKeys insère les clés et met à jour redis + mongo', async () => {
    prisma.licenseKey.createMany.mockResolvedValue({ count: 2 });
    redis.lpush.mockResolvedValue(2);
    Product.findByIdAndUpdate.mockResolvedValue({});

    const result = await importKeys('p1', 'KEY-A\nKEY-B\n', 'admin-1');

    expect(prisma.licenseKey.createMany).toHaveBeenCalledWith({
      data: [
        { code: 'KEY-A', productId: 'p1', status: 'AVAILABLE' },
        { code: 'KEY-B', productId: 'p1', status: 'AVAILABLE' },
      ],
      skipDuplicates: true,
    });
    expect(redis.lpush).toHaveBeenCalledWith('available_keys:p1', 'KEY-A', 'KEY-B');
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p1', {
      $inc: { availableKeysCount: 2 },
    });
    expect(logger.info).toHaveBeenCalled();
    expect(result).toBe(2);
  });

  it('popAvailableKey retourne la clé poppée depuis redis', async () => {
    redis.rpop.mockResolvedValue('KEY-Z');
    const key = await popAvailableKey('p1');
    expect(redis.rpop).toHaveBeenCalledWith('available_keys:p1');
    expect(key).toBe('KEY-Z');
  });
});
