const express = require('express');
const { getMyOrders, getOrderById } = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(verifyToken);

router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;