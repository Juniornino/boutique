jest.mock('../../src/models/mongo/Product', () => ({
  find: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../../src/config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock('../../src/utils/paginate', () => ({
  paginate: jest.fn(() => ({ page: 0, limit: 20, take: 20, skip: 0 })),
}));

const Product = require('../../src/models/mongo/Product');
const redis = require('../../src/config/redis');
const { getProducts, getProductById } = require('../../src/controllers/productController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('productController', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getProducts retourne les données du cache si présentes', async () => {
    const cached = [{ _id: 'p1', name: 'Produit cache' }];
    redis.get.mockResolvedValue(JSON.stringify(cached));
    const req = { query: {} };
    const res = buildRes();

    await getProducts(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, data: cached });
    expect(Product.find).not.toHaveBeenCalled();
  });

  it('getProducts interroge la DB et met en cache si cache vide', async () => {
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue('OK');
    const dbData = [{ _id: 'p1', name: 'Produit DB' }];
    const queryMock = {
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(dbData),
    };
    Product.find.mockReturnValue(queryMock);

    const req = { query: { category: 'OS', search: 'Windows' } };
    const res = buildRes();

    await getProducts(req, res, next);

    expect(Product.find).toHaveBeenCalledWith({
      isActive: true,
      category: 'OS',
      $text: { $search: 'Windows' },
    });
    expect(redis.set).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, data: dbData });
  });

  it('getProductById retourne 404 si produit introuvable', async () => {
    Product.findById.mockResolvedValue(null);
    const req = { params: { id: 'unknown' } };
    const res = buildRes();

    await getProductById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Produit non trouvé.',
    });
  });
});
