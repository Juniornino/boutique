const Product = require('../models/mongo/Product');
const prisma = require('../config/prisma');
const redis = require('../config/redis');
const logger = require('../config/logger');
const { sendRefundConfirmation } = require('../services/emailService');
const { paginate } = require('../utils/paginate');
const { ORDER_STATUS, LICENSE_STATUS, VALID_ORDER_STATUSES, REDIS_KEYS } = require('../constants');

// ─── Commandes ──────────────────────────────────────────────────────────────

const getOrders = async (req, res, next) => {
  try {
    const { page, limit, take, skip } = paginate(req.query);
    const { status, productId, dateFrom, dateTo } = req.query;

    const filters = {};
    if (status && VALID_ORDER_STATUSES.includes(status)) filters.status = status;
    if (productId) filters.productId = productId;
    if (dateFrom || dateTo) {
      filters.createdAt = {};
      if (dateFrom) filters.createdAt.gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        filters.createdAt.lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: filters,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: { user: true, product: true }
      }),
      prisma.order.count({ where: filters })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const refundOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { licenseKey: true, user: true }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }
    if (order.status === ORDER_STATUS.REFUNDED) {
      return res.status(409).json({ success: false, message: 'Cette commande a déjà été remboursée.' });
    }
    if (order.status !== ORDER_STATUS.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Seules les commandes COMPLETED peuvent être remboursées.'
      });
    }
    if (!order.paymentReference) {
      return res.status(400).json({
        success: false,
        message: 'Aucune référence de paiement associée à cette commande.'
      });
    }

    const licenseKey = order.licenseKey;

    try {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: { status: ORDER_STATUS.REFUNDED }
        });

        if (licenseKey) {
          await tx.licenseKey.update({
            where: { id: licenseKey.id },
            data: { status: LICENSE_STATUS.AVAILABLE, orderId: null }
          });
        }
      });
    } catch (prismaErr) {
      logger.error(`CRITIQUE: Remboursement Prisma échoué — orderId=${id}, ref=${order.paymentReference}: ${prismaErr.message}`);
      throw prismaErr;
    }

    if (licenseKey?.code) {
      await redis.lpush(REDIS_KEYS.availableKeys(order.productId), licenseKey.code).catch(() => {});
    }

    if (licenseKey) {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { availableKeysCount: 1, soldCount: -1 }
      }).catch(err => logger.warn(`Mise à jour stock MongoDB (refund ${id}): ${err.message}`));
    }

    const emailAddress = order.user?.email;
    if (emailAddress) {
      sendRefundConfirmation({
        to: emailAddress,
        orderId: id,
        amount: Number(order.totalAmount),
      }).catch(err => logger.error(`Email remboursement non envoyé (orderId: ${id}): ${err.message}`));
    }

    logger.info(`Remboursement: orderId=${id}, ref=${order.paymentReference}, adminId=${req.user.id}, ip=${req.ip}`);
    res.json({ success: true, message: 'Remboursement effectué avec succès.' });
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { licenseKey: true, user: true, product: true },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Commande non trouvée.' });
    }

    const licenseKey = order.licenseKey;
    const shouldReturnKeyToStock = Boolean(licenseKey) && order.status === ORDER_STATUS.COMPLETED;

    await prisma.$transaction(async (tx) => {
      if (licenseKey) {
        await tx.licenseKey.update({
          where: { id: licenseKey.id },
          data: { status: LICENSE_STATUS.AVAILABLE, orderId: null },
        });
      }

      await tx.order.delete({ where: { id } });
    });

    if (shouldReturnKeyToStock && licenseKey?.code) {
      await redis.lpush(REDIS_KEYS.availableKeys(order.productId), licenseKey.code).catch(() => {});

      await Product.findByIdAndUpdate(order.productId, {
        $inc: { availableKeysCount: 1, soldCount: -1 },
      }).catch((err) => logger.warn(`Mise à jour stock MongoDB (delete ${id}): ${err.message}`));
    }

    logger.info(`Suppression commande: orderId=${id}, status=${order.status}, adminId=${req.user.id}, ip=${req.ip}`);
    res.json({ success: true, message: 'Commande supprimée.' });
  } catch (error) {
    next(error);
  }
};

// ─── Clients ────────────────────────────────────────────────────────────────

const getCustomers = async (req, res, next) => {
  try {
    const { page, limit, take, skip } = paginate(req.query);

    const aggregated = await prisma.order.groupBy({
      by: ['userId'],
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const sorted = aggregated
      .map((row) => ({
        userId: row.userId,
        orders: row._count.id,
        total: Number(row._sum.totalAmount || 0),
      }))
      .sort((a, b) => b.total - a.total);

    const total = sorted.length;
    const paginated = sorted.slice(skip, skip + take);

    const userIds = paginated.map((r) => r.userId);
    const userRefs = userIds.length
      ? await prisma.userRef.findMany({
          where: { id: { in: userIds } },
          select: { id: true, email: true },
        })
      : [];
    const userMap = Object.fromEntries(userRefs.map((u) => [u.id, u.email]));

    const customers = paginated.map((row) => {
      const email = userMap[row.userId] || '';
      return {
        id: row.userId,
        email,
        name: email.split('@')[0] || 'Client',
        orders: row.orders,
        total: row.total,
      };
    });

    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  refundOrder,
  deleteOrder,
  getCustomers,
};
