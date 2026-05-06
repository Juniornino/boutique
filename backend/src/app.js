require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const path = require('path');
const errorHandler = require('./middlewares/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Requis derrière un reverse proxy (ngrok, Nginx, etc.)
app.set('trust proxy', 1);

// Connect to MongoDB (unless in test environment)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Security middlewares
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Corps brut requis pour la vérification HMAC des webhooks (SendavaPay, Whop)
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
app.use('/api/checkout/whop-webhook', express.raw({ type: 'application/json' }));

// Fichiers produits (/uploads) — sans préfixe /api
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, '..', 'public', 'uploads'))
);

// Body parser (limite relevée pour import JSON de clés en masse)
app.use(express.json({ limit: '600kb' }));
app.use(express.urlencoded({ extended: true, limit: '600kb' }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting (Global)
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(globalLimiter);

// Logging
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check for load balancer
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

module.exports = app;
