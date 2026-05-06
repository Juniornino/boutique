const prisma = require('../config/prisma');
const Product = require('../models/mongo/Product');
const { paginate } = require('../utils/paginate');

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { take, skip } = paginate(req.query);

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { licenseKey: { select: { code: true } } },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    const productIds = [...new Set(orders.map(o => o.productId))];
    const products = await Product.find({ _id: { $in: productIds } })
      .select('name image category price');

    const productMap = Object.fromEntries(
      products.map(p => [p._id.toString(), p])
    );

    const result = orders.map(order => ({
      ...order,
      product: productMap[order.productId] ?? null,
      licenseKey: order.licenseKey?.code || null
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { licenseKey: { select: { code: true } } }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Commande non trouvée.' });

    const product = await Product.findById(order.productId).select('name image category price');

    res.json({ success: true, data: { ...order, product } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyOrders, getOrderById };