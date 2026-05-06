jest.mock('../../src/config/logger', () => ({
  error: jest.fn(),
}));

jest.mock('axios', () => {
  const post = jest.fn();
  const get = jest.fn();
  return {
    create: jest.fn(() => ({ post, get })),
    __mockApi: { post, get },
  };
});

const axios = require('axios');
const logger = require('../../src/config/logger');
const { createCheckout, verifyPulseSignature, getSale } = require('../../src/services/chariowService');

describe('chariowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createCheckout retourne response.data en cas de succès', async () => {
    const payload = { data: { step: 'payment', purchase: { id: 'sal_1' } } };
    axios.__mockApi.post.mockResolvedValue({ data: payload });

    const result = await createCheckout({
      productId: 'prd_1',
      email: 'a@b.com',
      firstName: 'A',
      lastName: 'B',
      phone: { number: '670000000', country_code: 'CM' },
      redirectUrl: 'https://ok.test',
      customMetadata: { order_id: 'ord-1' },
    });

    expect(result).toEqual(payload);
    expect(axios.__mockApi.post).toHaveBeenCalled();
  });

  it('verifyPulseSignature retourne true pour une signature HMAC valide (corps brut)', () => {
    const rawBody = Buffer.from(JSON.stringify({ event: 'successful.sale' }), 'utf8');
    const secret = 'secret';
    const crypto = require('crypto');
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    expect(verifyPulseSignature(rawBody, signature, secret)).toBe(true);
  });

  it('getSale relaie une erreur métier en cas d’échec API', async () => {
    axios.__mockApi.get.mockRejectedValue(new Error('network error'));

    await expect(getSale('sal_404')).rejects.toThrow('Impossible de récupérer la vente Chariow');
    expect(logger.error).toHaveBeenCalled();
  });
});
