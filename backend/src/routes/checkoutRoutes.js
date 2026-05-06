const express = require('express');
const { createSession, handleWebhook, getSessionStatus, handleWhopWebhook } = require('../controllers/checkoutController');
const { verifyToken } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { checkoutSessionSchema } = require('../validators/orderValidator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const checkoutLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

router.post('/session', verifyToken, checkoutLimiter, validate(checkoutSessionSchema), createSession);
router.post('/webhook', handleWebhook);
router.post('/whop-webhook', handleWhopWebhook);
router.get('/session/:id', verifyToken, getSessionStatus);

module.exports = router;