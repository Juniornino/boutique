const crypto = require('crypto');
const logger = require('../config/logger');

// XAF → USD conversion (configure via WHOP_XAF_TO_USD_RATE env)
const XAF_TO_USD = Number(process.env.WHOP_XAF_TO_USD_RATE) || 0.0016;

// Lazy-loaded Whop client (ESM package, loaded via dynamic import)
let _whopClient = null;
const getClient = async () => {
  if (_whopClient) return _whopClient;
  const apiKey = process.env.WHOP_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('WHOP_API_KEY non configuré'), { statusCode: 500 });
  }
  const { Whop } = await import('@whop/sdk');
  _whopClient = new Whop({ apiKey });
  return _whopClient;
};

const createCheckoutSession = async ({ amountXAF, orderId, productName, redirectUrl }) => {
  const companyId = process.env.WHOP_COMPANY_ID;
  if (!companyId) {
    throw Object.assign(new Error('WHOP_COMPANY_ID non configuré'), { statusCode: 500 });
  }

  const amountUSD = Math.max(0.5, parseFloat((Number(amountXAF) * XAF_TO_USD).toFixed(2)));

  const client = await getClient();

  try {
    const checkout = await client.checkoutConfigurations.create({
      mode: 'payment',
      plan: {
        company_id: companyId,
        currency: 'usd',
        plan_type: 'one_time',
        initial_price: amountUSD,
        ...(productName ? { title: productName } : {}),
      },
      redirect_url: redirectUrl || undefined,
      metadata: {
        order_id: orderId,
        product_name: productName,
      },
    });

    logger.info(`Whop checkout créé: ${checkout.id} — orderId: ${orderId} — ${amountUSD} USD`);
    return {
      sessionId: checkout.id,
      planId: checkout.plan?.id,
      purchaseUrl: checkout.purchase_url || null,
      amountUSD,
    };
  } catch (error) {
    const msg = error?.message || 'Erreur création session Whop';
    logger.error(`Whop createCheckoutSession: ${msg}`);
    const err = new Error(msg);
    err.statusCode = error?.status || 502;
    throw err;
  }
};

// Whop webhook verification — tolérant à plusieurs variantes de signature
// Header: webhook-signature = "v1,<base64>" (peut contenir plusieurs sigs séparées par espace)
// On essaie toutes les combinaisons (contenu signé × encodage du secret)
// pour absorber les différences entre versions de l'API Whop.
const verifyWebhookSignature = (bodyText, headers, secret) => {
  try {
    const sigHeader = headers['webhook-signature'];
    if (!sigHeader) return false;

    // Extraire les valeurs base64 de toutes les signatures v1
    const candidates = sigHeader
      .split(' ')
      .map((s) => s.split(','))
      .filter(([v, val]) => v === 'v1' && val)
      .map(([, val]) => Buffer.from(val, 'base64'));
    if (candidates.length === 0) return false;

    // Variantes de décodage du secret
    const secretVariants = [];
    if (secret.startsWith('whsec_')) {
      secretVariants.push(Buffer.from(secret.slice(6), 'base64'));
    } else if (secret.startsWith('ws_')) {
      secretVariants.push(Buffer.from(secret.slice(3), 'hex'));
    }
    secretVariants.push(Buffer.from(secret)); // secret brut tel quel

    // Variantes de contenu signé
    const msgId = headers['webhook-id'];
    const timestamp = headers['webhook-timestamp'];
    const contentVariants = [bodyText];
    if (msgId && timestamp) {
      contentVariants.push(`${msgId}.${timestamp}.${bodyText}`);
    }

    // Essayer toutes les combinaisons
    for (const sec of secretVariants) {
      for (const content of contentVariants) {
        const digest = crypto.createHmac('sha256', sec).update(content).digest();
        for (const cand of candidates) {
          if (cand.length === digest.length && crypto.timingSafeEqual(cand, digest)) {
            return true;
          }
        }
      }
    }
    return false;
  } catch {
    return false;
  }
};

const parseWebhookPayload = (bodyText) => {
  return JSON.parse(bodyText);
};

module.exports = { createCheckoutSession, verifyWebhookSignature, parseWebhookPayload };
