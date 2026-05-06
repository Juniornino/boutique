const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, stack: err.stack, path: req.path });
  const status  = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Une erreur est survenue.'
    : err.message;
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;