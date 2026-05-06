const app = require('./app');
const logger = require('./config/logger');
const { isSmtpConfigured } = require('./services/emailService');

const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL', 'MONGODB_URI'];
const WARN_ENV = ['SENDAVAPAY_API_KEY'];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    logger.error(`Variable d'environnement requise manquante : ${key}`);
    process.exit(1);
  }
}
for (const key of WARN_ENV) {
  if (!process.env[key]) {
    logger.warn(`Variable d'environnement non configuree : ${key} -- fonctionnalite desactivee`);
  }
}
if (!isSmtpConfigured()) {
  logger.warn(
    "SMTP non configure (variables SMTP_* ou EMAIL_* manquantes) — envoi d'emails desactive"
  );
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});