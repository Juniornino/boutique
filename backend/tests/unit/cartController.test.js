jest.mock('../../src/config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
}));

const redis = require('../../src/config/redis');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../../src/controllers/cartController');

const buildRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('cartController', () => {
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCart retourne un panier vide si rien en redis', async () => {
    redis.get.mockResolvedValue(null);
    const req = { user: { id: 'u1' } };
    const res = buildRes();

    await getCart(req, res, next);

    expect(redis.get).toHaveBeenCalledWith('cart:u1');
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
  });

  it('addToCart ajoute un article puis persiste redis', async () => {
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue('OK');
    const req = { user: { id: 'u1' }, body: { productId: 'p1', quantity: 2 } };
    const res = buildRes();

    await addToCart(req, res, next);

    expect(redis.set).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ productId: 'p1', quantity: 2 }],
    });
  });

  it('updateCartItem retourne 404 si panier absent', async () => {
    redis.get.mockResolvedValue(null);
    const req = { user: { id: 'u1' }, params: { productId: 'p1' }, body: { quantity: 5 } };
    const res = buildRes();

    await updateCartItem(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Panier vide.',
    });
  });

  it('removeFromCart supprime un article du panier', async () => {
    redis.get.mockResolvedValue(JSON.stringify([
      { productId: 'p1', quantity: 1 },
      { productId: 'p2', quantity: 2 },
    ]));
    redis.set.mockResolvedValue('OK');
    const req = { user: { id: 'u1' }, params: { productId: 'p1' } };
    const res = buildRes();

    await removeFromCart(req, res, next);

    expect(redis.set).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ productId: 'p2', quantity: 2 }],
    });
  });

  it('clearCart vide le panier redis', async () => {
    redis.del.mockResolvedValue(1);
    const req = { user: { id: 'u1' } };
    const res = buildRes();

    await clearCart(req, res, next);

    expect(redis.del).toHaveBeenCalledWith('cart:u1');
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Panier vidé.' });
  });
});
