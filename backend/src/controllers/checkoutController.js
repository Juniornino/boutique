const prisma = require('../config/prisma');
const redis = require('../config/redis');
const sendavaPayService = require('../services/sendavaPayService');
const whopService = require('../services/whopService');
const { popAvailableKey } = require('../services/licenseService');
const { sendLicenseKey } = require('../services/emailService');
const { sendLicenseKeyWhatsApp } = require('../services/whatsappService');
const Product = require('../models/mongo/Product');
const logger = require('../config/logger');
const { ORDER_STATUS, LICENSE_STATUS, REDIS_KEYS, PAYMENT_METHOD } = require('../constants');

// ─── Helpers (SRP: each sub-step is its own function) ───────────────────────

const restoreRedisKey = async (productId, keyCode) => {
  if (keyCode) {
    await redis.lpush(REDIS_KEYS.availableKeys(productId), keyCode).catch(() => {});
  }
};

const assignLicenseKeyTransaction = async (orderId, productId, poppedKeyCode) => {
  let keyWasAssigned = false;
  const assignableStatuses = [LICENSE_STATUS.AVAILABLE, LICENSE_STATUS.RESERVED];

  await prisma.$transaction(async (tx) => {
    const locked = await tx.order.findUnique({ where: { id: orderId } });
    if (!locked || locked.status === ORDER_STATUS.COMPLETED) return;

    let key = null;
    if (poppedKeyCode) {
      key = await tx.licenseKey.findFirst({
        where: { code: poppedKeyCode, status: { in: assignableStatuses }, orderId: null },
      });
    }
    if (!key) {
      key = await tx.licenseKey.findFirst({
        where: { productId: locked.productId, status: { in: assignableStatuses }, orderId: null },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!key) throw new Error('Aucune clé disponible');

    await tx.licenseKey.update({
      where: { id: key.id },
      data: { status: LICENSE_STATUS.SOLD, orderId },
    });

    await tx.order.update({
      where: { id: orderId },
      data: { status: ORDER_STATUS.COMPLETED },
    });

    keyWasAssigned = true;
  });

  return keyWasAssigned;
};

const decrementMongoStock = (productId) => {
  Product.findByIdAndUpdate(productId, { $inc: { availableKeysCount: -1, soldCount: 1 } }).catch(
    (err) => logger.warn(`Décrement availableKeysCount (${productId}): ${err.message}`)
  );
};

const sendPostOrderNotifications = (orderId, updated) => {
  if (!updated.licenseKey?.code) return;

  Promise.all([
    prisma.userRef.findUnique({ where: { id: updated.userId } }),
    prisma.productRef.findUnique({ where: { id: updated.productId } }),
  ])
    .then(([userRef, productRef]) => {
      if (!userRef) {
        logger.warn(`UserRef introuvable pour userId=${updated.userId} (orderId: ${orderId})`);
        return;
      }
      const productName = productRef?.name || 'Logiciel';

      sendLicenseKey({
        to: userRef.email,
        productName,
        licenseKey: updated.licenseKey.code,
        orderId: updated.id,
        amount: updated.totalAmount,
      }).catch((err) =>
        logger.error(`Email post-commande non envoyé (orderId: ${orderId}): ${err.message}`)
      );

      if (userRef.phone) {
        sendLicenseKeyWhatsApp({
          to: userRef.phone,
          productName,
          licenseKey: updated.licenseKey.code,
          orderId: updated.id,
        }).catch((err) =>
          logger.warn(`WhatsApp post-commande non envoyé (orderId: ${orderId}): ${err.message}`)
        );
      }
    })
    .catch((err) =>
      logger.error(`Notification post-commande échouée (orderId: ${orderId}): ${err.message}`)
    );
};

const getPaymentErrorStatus = (error) =>
  error.statusCode && error.statusCode >= 400 && error.statusCode < 500
    ? error.statusCode
    : 502;

const rollbackOrder = (orderId) =>
  prisma.order.delete({ where: { id: orderId } }).catch(() => {});

const parseRawBody = (rawBody) =>
  JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody));

// ─── Core business logic ────────────────────────────────────────────────────

const fulfillOrderAfterPayment = async (orderId) => {
  const lockResult = await prisma.order.updateMany({
    where: { id: orderId, status: { not: ORDER_STATUS.COMPLETED } },
    data: { status: ORDER_STATUS.PROCESSING },
  });
  if (lockResult.count === 0) {
    return prisma.order.findUnique({ where: { id: orderId } });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Commande introuvable');

  let poppedKeyCode = null;
  let keyWasAssigned = false;

  try {
    poppedKeyCode = await popAvailableKey(order.productId);
    keyWasAssigned = await assignLicenseKeyTransaction(orderId, order.productId, poppedKeyCode);
  } catch (err) {
    if (poppedKeyCode && !keyWasAssigned) {
      await restoreRedisKey(order.productId, poppedKeyCode);
    }
    throw err;
  }

  if (poppedKeyCode && !keyWasAssigned) {
    await restoreRedisKey(order.productId, poppedKeyCode);
    return prisma.order.findUnique({ where: { id: orderId } });
  }

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: { licenseKey: { select: { code: true } } },
  });

  decrementMongoStock(order.productId);
  await redis.del(REDIS_KEYS.cart(updated.userId));
  sendPostOrderNotifications(orderId, updated);

  logger.info(`Commande ${orderId} complétée`);
  return updated;
};

// ─── Route handlers ─────────────────────────────────────────────────────────

const createSession = async (req, res, next) => {
  try {
    const { phoneNumber, operator, country, paymentMethod = PAYMENT_METHOD.MOBILE_MONEY } = req.body;
    const userId = req.user.id;

    const cartStr = await redis.get(REDIS_KEYS.cart(userId));
    if (!cartStr) return res.status(400).json({ success: false, message: 'Panier vide.' });

    const cart = JSON.parse(cartStr);
    if (!cart.length) return res.status(400).json({ success: false, message: 'Panier invalide.' });

    const productIds = [...new Set(cart.map((i) => i.productId))];
    const productRefs = await prisma.productRef.findMany({ where: { id: { in: productIds } } });
    const productMap = Object.fromEntries(productRefs.map((p) => [p.id, p]));

    for (const item of cart) {
      if (!productMap[item.productId]) return res.status(404).json({ success: false, message: `Produit ${item.productId} non trouvé.` });
    }

    const customerName = (req.user.name || req.user.email?.split('@')[0] || 'Client').slice(0, 100);

    // Current architecture: one order per cart item (single-product model)
    const item = cart[0];
    const productRef = productMap[item.productId];
    const unitPrice = (productRef.promotionalPrice && Number(productRef.promotionalPrice) > 0) ? Number(productRef.promotionalPrice) : Number(productRef.price);
    const totalAmount = unitPrice * (item.quantity || 1);

    const order = await prisma.order.create({
      data: {
        userId,
        productId: item.productId,
        totalAmount,
        status: ORDER_STATUS.PENDING,
      },
    });

    if (paymentMethod === PAYMENT_METHOD.CARD) {
      return createCardSession(req, res, order, productRef, totalAmount);
    }

    const customerEmail = req.user.email || undefined;
    return createMobileMoneySession(req, res, order, productRef, totalAmount, {
      phoneNumber, customerName, customerEmail,
    });
  } catch (error) {
    next(error);
  }
};

const createCardSession = async (req, res, order, productRef, effectivePrice) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectUrl = frontendUrl.startsWith('https://') ? `${frontendUrl}/order-success` : undefined;

  let whopData;
  try {
    whopData = await whopService.createCheckoutSession({
      amountXAF: Number(effectivePrice),
      orderId: order.id,
      productName: productRef.name,
      redirectUrl,
    });
  } catch (e) {
    await rollbackOrder(order.id);
    return res.status(getPaymentErrorStatus(e)).json({
      success: false, message: e.message || 'Paiement carte indisponible',
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference: whopData.sessionId },
  });

  return res.json({
    success: true,
    data: {
      step: 'card',
      sessionId: whopData.sessionId,
      planId: whopData.planId,
      purchaseUrl: whopData.purchaseUrl,
      amountUSD: whopData.amountUSD,
      orderId: order.id,
    },
  });
};

const createMobileMoneySession = async (req, res, order, productRef, effectivePrice, { phoneNumber, customerName, customerEmail }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectUrl = frontendUrl.startsWith('https://') ? `${frontendUrl}/order-success` : undefined;

  let paymentData;
  try {
    paymentData = await sendavaPayService.createPayment({
      amount: Number(effectivePrice),
      currency: 'XOF',
      description: `${productRef.name} — Commande #${order.id.slice(0, 8)}`,
      externalReference: order.id,
      customerPhone: phoneNumber ? String(phoneNumber).replace(/\D/g, '') : undefined,
      customerName,
      customerEmail,
      redirectUrl,
      metadata: { orderId: order.id, productId: order.productId },
    });
  } catch (e) {
    await rollbackOrder(order.id);
    return res.status(getPaymentErrorStatus(e)).json({
      success: false, message: e.message || 'Paiement indisponible',
    });
  }

  const data = paymentData?.data || paymentData;
  const reference = data?.reference;
  const paymentUrl = data?.paymentUrl;

  if (!reference) {
    await rollbackOrder(order.id);
    return res.status(502).json({
      success: false, message: 'Référence de paiement manquante dans la réponse SendavaPay.',
    });
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { paymentReference: reference },
  });

  logger.info(`Paiement SendavaPay initié — orderId: ${order.id}, référence: ${reference}`);

  return res.json({
    success: true,
    data: {
      step: 'pending',
      reference,
      paymentUrl,
      orderId: order.id,
      message: 'Finalisez votre paiement via le lien SendavaPay.',
    },
  });
};

const handleWebhook = async (req, res) => {
  try {
    const rawBody = req.body;
    const signature = req.headers['x-sendavapay-signature'];
    const event = req.headers['x-sendavapay-event'];
    const secret = process.env.SENDAVAPAY_WEBHOOK_SECRET;

    if (!secret) {
      logger.error('Webhook SendavaPay: SENDAVAPAY_WEBHOOK_SECRET non configuré — requête rejetée');
      return res.status(500).send('Webhook secret non configuré');
    }

    if (!sendavaPayService.verifyWebhookSignature(rawBody, signature, secret)) {
      logger.warn('Webhook SendavaPay: signature invalide');
      return res.status(401).send('Signature invalide');
    }

    const payload = parseRawBody(rawBody);
    const data = payload.data || payload;
    const reference = data?.reference || data?.txid;

    const isSuccess = event === 'payment.completed' || data?.status === 'completed';
    const isFailed = event === 'payment.failed' || data?.status === 'failed';

    if ((isSuccess || isFailed) && reference) {
      const order = await prisma.order.findUnique({ where: { paymentReference: reference } });

      if (!order) {
        logger.warn(`Webhook SendavaPay: aucune commande pour la référence ${reference}`);
        return res.status(200).send('OK');
      }

      if (order.status === ORDER_STATUS.COMPLETED) {
        return res.status(200).send('OK');
      }

      if (isSuccess) {
        try {
          await fulfillOrderAfterPayment(order.id);
        } catch (err) {
          logger.error(`Webhook SendavaPay fulfill (${order.id}): ${err.message}`);
          return res.status(500).send('Erreur interne');
        }
      } else if (isFailed) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: ORDER_STATUS.FAILED },
        }).catch(() => {});
        logger.info(`Commande ${order.id} marquée FAILED via webhook SendavaPay`);
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    logger.error(`Webhook SendavaPay: ${error.message}`);
    return res.status(500).send('Erreur interne');
  }
};

const getSessionStatus = async (req, res, next) => {
  try {
    const reference = req.params.id;

    const order = await prisma.order.findUnique({ where: { paymentReference: reference } });
    if (!order) return res.status(404).json({ success: false, message: 'Commande introuvable.' });

    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Accès refusé.' });
    }

    if (order.status === ORDER_STATUS.COMPLETED) {
      return res.json({ success: true, data: { step: 'completed', reference } });
    }
    if (order.status === ORDER_STATUS.FAILED) {
      return res.json({ success: true, data: { step: 'failed', reference, message: 'Paiement échoué.' } });
    }

    let verifyData;
    try {
      verifyData = await sendavaPayService.verifyPayment(reference);
    } catch (e) {
      return res.json({ success: true, data: { step: 'pending', reference, message: 'Vérification en cours...' } });
    }

    const verifyPayload = verifyData?.data || verifyData;
    const status = verifyPayload?.status;

    if (status === 'completed') {
      try {
        await fulfillOrderAfterPayment(order.id);
      } catch (err) {
        logger.error(`getSessionStatus fulfill (${order.id}): ${err.message}`);
        return res.status(500).json({ success: false, message: err.message });
      }
      return res.json({ success: true, data: { step: 'completed', reference } });
    }

    if (status === 'failed' || status === 'cancelled') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: ORDER_STATUS.FAILED },
      }).catch(() => {});
      return res.json({
        success: true,
        data: { step: 'failed', reference, message: verifyData?.message || 'Paiement échoué ou annulé.' },
      });
    }

    return res.json({
      success: true,
      data: { step: 'pending', reference, message: verifyData?.message || 'En attente de confirmation...' },
    });
  } catch (error) {
    next(error);
  }
};

const handleWhopWebhook = async (req, res) => {
  try {
    const rawBody = req.body;
    const bodyText = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
    const secret = process.env.WHOP_WEBHOOK_SECRET || '';

    if (!secret) {
      logger.error('Webhook Whop: WHOP_WEBHOOK_SECRET non configuré — requête rejetée');
      return res.status(500).send('Webhook secret non configuré');
    }

    if (!whopService.verifyWebhookSignature(bodyText, req.headers, secret)) {
      logger.warn('Webhook Whop: signature invalide', {
        headers: Object.fromEntries(
          Object.entries(req.headers).filter(([k]) =>
            k.startsWith('webhook') || k.startsWith('x-whop') || k === 'content-type'
          )
        ),
        bodyPreview: bodyText.slice(0, 120),
      });
      return res.status(401).send('Signature invalide');
    }

    const payload = whopService.parseWebhookPayload(bodyText);
    // Whop envoie action (ex: "payment.succeeded") et non type
    const eventType = payload.action || payload.type;

    if (eventType === 'payment.succeeded') {
      const payment = payload.data || {};

      // Recherche de l'order_id dans tous les chemins possibles du payload Whop
      const orderId =
        payment?.metadata?.order_id ||
        payment?.checkout_session?.metadata?.order_id ||
        payment?.checkout_configuration?.metadata?.order_id ||
        payment?.plan?.metadata?.order_id ||
        payload?.metadata?.order_id;

      // Identifiants de checkout Whop pour fallback (paymentReference)
      const whopCheckoutIds = [
        payment?.checkout_session_id,
        payment?.checkout_session?.id,
        payment?.checkout_configuration_id,
        payment?.checkout_configuration?.id,
        payment?.plan_id,
        payment?.plan?.id,
      ].filter(Boolean);

      // Fallback : retrouver la commande via paymentReference (sessionId Whop stocké à la création)
      let order = null;
      if (orderId) {
        order = await prisma.order.findUnique({ where: { id: orderId } });
      }
      if (!order && whopCheckoutIds.length > 0) {
        order = await prisma.order.findFirst({
          where: { paymentReference: { in: whopCheckoutIds } },
        });
        if (order) logger.info(`Webhook Whop: commande retrouvée via paymentReference (${order.id})`);
      }

      if (!order) {
        logger.warn('Webhook Whop: commande introuvable', {
          orderIdTried: orderId || null,
          whopCheckoutIds,
          payloadKeys: Object.keys(payload),
          dataKeys: Object.keys(payment),
          dataPreview: JSON.stringify(payment).slice(0, 800),
        });
        return res.status(200).send('OK');
      }

      if (order.status === ORDER_STATUS.COMPLETED) {
        return res.status(200).send('OK');
      }

      try {
        await fulfillOrderAfterPayment(order.id);
      } catch (err) {
        logger.error(`Webhook Whop fulfill (${order.id}): ${err.message}`);
        return res.status(500).send('Erreur interne');
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    logger.error(`Webhook Whop: ${error.message}`);
    return res.status(500).send('Erreur interne');
  }
};

module.exports = { createSession, handleWebhook, getSessionStatus, handleWhopWebhook };
