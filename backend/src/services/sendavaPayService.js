const axios = require('axios');
const crypto = require('crypto');
const logger = require('../config/logger');

const BASE_URL = process.env.SENDAVAPAY_BASE_URL || 'https://sendavapay.com/api/v1';
const API_KEY = process.env.SENDAVAPAY_API_KEY;

const authHeaders = () => ({
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
});

const createPayment = async ({ amount, currency, description, externalReference, customerEmail, customerPhone, customerName, redirectUrl, metadata }) => {
  if (!API_KEY) {
    throw Object.assign(new Error('Clé SendavaPay non configurée (SENDAVAPAY_API_KEY)'), { statusCode: 500 });
  }

  const payload = {
    amount: Number(amount),
    currency: currency || 'XOF',
    ...(description && { description: String(description).slice(0, 255) }),
    ...(externalReference && { externalReference: String(externalReference) }),
    ...(customerEmail && { customerEmail: String(customerEmail) }),
    ...(customerPhone && { customerPhone: String(customerPhone) }),
    ...(customerName && { customerName: String(customerName).slice(0, 100) }),
    ...(redirectUrl && { redirectUrl: String(redirectUrl) }),
    ...(metadata && { metadata }),
  };

  try {
    const response = await axios.post(`${BASE_URL}/create-payment`, payload, {
      headers: authHeaders(),
      timeout: 30000,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.response?.data?.error || error.message;
    logger.error(`Erreur SendavaPay createPayment: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    const err = new Error(typeof msg === 'string' ? msg : 'Erreur lors de la création du paiement Mobile Money');
    err.statusCode = error.response?.status || 502;
    err.details = error.response?.data;
    throw err;
  }
};

const verifyPayment = async (reference) => {
  if (!API_KEY) {
    throw Object.assign(new Error('Clé SendavaPay non configurée'), { statusCode: 500 });
  }

  try {
    const response = await axios.post(`${BASE_URL}/verify-payment`, { reference: String(reference) }, {
      headers: authHeaders(),
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message || error.message;
    logger.error(`Erreur SendavaPay verifyPayment (${reference}): ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    const err = new Error(typeof msg === 'string' ? msg : 'Erreur vérification paiement');
    err.statusCode = error.response?.status || 502;
    throw err;
  }
};

const verifyWebhookSignature = (rawBody, signature, secret) => {
  if (!secret || !signature) return false;
  try {
    const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
    const parsed = JSON.parse(bodyStr);
    const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(parsed)).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const signatureBuf = Buffer.from(signature, 'utf8');
    if (expectedBuf.length !== signatureBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch {
    return false;
  }
};

module.exports = { createPayment, verifyPayment, verifyWebhookSignature };
