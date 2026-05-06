const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { cartItemSchema } = require('../validators/orderValidator');

const router = express.Router();

router.use(verifyToken);

router.get('/', getCart);
router.post('/', validate(cartItemSchema), addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;