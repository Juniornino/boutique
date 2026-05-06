const request = require('supertest');
const app = require('../src/app');
const Product = require('../src/models/mongo/Product');
const redis = require('../src/config/redis');

// Mock Mongoose model and Redis
jest.mock('../src/models/mongo/Product');
jest.mock('../src/config/redis');

describe('Product API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return products from cache if available', async () => {
      const mockProducts = [{ name: 'Test Product', price: 100 }];
      redis.get.mockResolvedValue(JSON.stringify(mockProducts));

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockProducts);
      expect(redis.get).toHaveBeenCalled();
      expect(Product.find).not.toHaveBeenCalled();
    });

    it('should fetch products from DB if not in cache', async () => {
      redis.get.mockResolvedValue(null);
      const mockProducts = [{ name: 'DB Product', price: 200 }];
      
      // Mock Mongoose chain: Product.find().skip().limit()
      const mockQuery = {
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts)
      };
      Product.find.mockReturnValue(mockQuery);

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockProducts);
      expect(Product.find).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 404 if product not found', async () => {
      Product.findById.mockResolvedValue(null);

      const res = await request(app).get('/api/products/nonexistentid');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });

    it('should return product details if found', async () => {
      const mockProduct = { _id: '123', name: 'Found Product' };
      Product.findById.mockResolvedValue(mockProduct);

      const res = await request(app).get('/api/products/123');

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual(mockProduct);
    });
  });
});
