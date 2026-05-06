const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/** Prise en charge de SMTP_* (.env.example) et EMAIL_* (configs existantes). */
const smtpHost = () => process.env.SMTP_HOST || process.env.EMAIL_HOST;
const smtpPort = () => parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
const smtpUser = () => process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = () =>
  (process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');
const smtpFromRaw = () => process.env.SMTP_FROM || process.env.EMAIL_FROM;
const isSmtpConfigured = () => Boolean(smtpHost() && smtpUser() && smtpPass());

const resolveFrom = () => {
  const raw = smtpFromRaw();
  if (raw) {
    if (raw.includes('<') && raw.includes('>')) return raw;
    return `"Boutique Licences" <${raw}>`;
  }
  return `"Boutique Licences" <${smtpUser()}>`;
};

const createTransporter = () => {
  const port = smtpPort();
  return nodemailer.createTransport({
    host: smtpHost(),
    port,
    secure: port === 465,
    auth: {
      user: smtpUser(),
      pass: smtpPass(),
    },
    ...(smtpHost() === 'smtp.gmail.com'
      ? { requireTLS: true, tls: { minVersion: 'TLSv1.2' } }
      : {}),
  });
};

const sendLicenseKey = async ({ to, productName, licenseKey, orderId, amount }) => {
  if (!isSmtpConfigured()) {
    logger.warn(`Email clé de licence non envoyé — SMTP non configuré (orderId: ${orderId})`);
    return;
  }

  const transporter = createTransporter();
  const from = resolveFrom();
  const supportEmail = process.env.SUPPORT_EMAIL || smtpUser();
  const supportWhatsApp = process.env.SUPPORT_WHATSAPP || '';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#1e40af;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Votre cl&#233; de licence est pr&#234;te &#10003;</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;margin:0 0 16px;">Bonjour,</p>
      <p style="color:#374151;margin:0 0 24px;">
        Merci pour votre achat. Voici votre cl&#233; de licence pour
        <strong>${productName}</strong>&nbsp;:
      </p>

      <div style="background:#1e293b;border-radius:8px;padding:20px 24px;text-align:center;margin-bottom:24px;">
        <code style="color:#f1f5f9;font-size:20px;font-weight:bold;letter-spacing:3px;font-family:monospace;">
          ${licenseKey}
        </code>
      </div>

      <h3 style="color:#374151;margin:0 0 8px;">Instructions d'activation :</h3>
      <ol style="color:#4b5563;margin:0 0 24px;padding-left:20px;line-height:1.8;">
        <li>T&#233;l&#233;chargez et installez le logiciel depuis le site officiel.</li>
        <li>Lors de l'installation ou au premier lancement, choisissez "Activer avec une cl&#233;".</li>
        <li>Copiez et collez la cl&#233; ci-dessus.</li>
        <li>Confirmez l'activation.</li>
      </ol>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#6b7280;font-size:13px;margin:0 0 6px;">
        <strong>N&#176; de commande :</strong> ${orderId}
      </p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">
        <strong>Montant pay&#233; :</strong> ${Number(amount).toLocaleString('fr-FR')} FCFA
      </p>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#6b7280;font-size:12px;text-align:center;margin:0 0 8px;">
        Besoin d'aide&nbsp;? Contactez notre support&nbsp;:
        <a href="mailto:${supportEmail}" style="color:#1e40af;">${supportEmail}</a>
        ${supportWhatsApp ? `&nbsp;|&nbsp;WhatsApp&nbsp;: <strong>${supportWhatsApp}</strong>` : ''}
      </p>
      <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0;">
        Cette cl&#233; est &#233;galement accessible dans votre espace client &#224; tout moment.
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from,
    to,
    subject: `Votre clé ${productName} — Commande ${orderId}`,
    html,
  });

  logger.info(`Email clé de licence envoyé (orderId: ${orderId}, to: ${to})`);
};

const sendRefundConfirmation = async ({ to, orderId, amount }) => {
  if (!isSmtpConfigured()) {
    logger.warn(`Email remboursement non envoyé — SMTP non configuré (orderId: ${orderId})`);
    return;
  }

  const transporter = createTransporter();
  const from = resolveFrom();
  const supportEmail = process.env.SUPPORT_EMAIL || smtpUser();

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#dc2626;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">Confirmation de remboursement</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;margin:0 0 16px;">Bonjour,</p>
      <p style="color:#374151;margin:0 0 24px;">
        Votre remboursement a bien &#233;t&#233; trait&#233;. Le montant de
        <strong>${Number(amount).toLocaleString('fr-FR')} FCFA</strong>
        sera cr&#233;dit&#233; selon les d&#233;lais de votre op&#233;rateur.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#6b7280;font-size:13px;margin:0 0 6px;">
        <strong>N&#176; de commande :</strong> ${orderId}
      </p>
      <p style="color:#6b7280;font-size:13px;margin:0 0 24px;">
        <strong>Montant rembours&#233; :</strong> ${Number(amount).toLocaleString('fr-FR')} FCFA
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
        Une question ? Contactez-nous :
        <a href="mailto:${supportEmail}" style="color:#1e40af;">${supportEmail}</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from,
    to,
    subject: `Remboursement confirmé — Commande ${orderId}`,
    html,
  });

  logger.info(`Email remboursement envoyé (orderId: ${orderId}, to: ${to})`);
};

const sendPasswordResetEmail = async ({ to, resetToken }) => {
  if (!isSmtpConfigured()) {
    logger.warn(`Email réinitialisation mot de passe non envoyé — SMTP non configuré (to: ${to})`);
    return;
  }

  const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const resetUrl = `${baseUrl}/restaurer-mot-de-passe?token=${encodeURIComponent(resetToken)}`;

  const transporter = createTransporter();
  const from = resolveFrom();
  const supportEmail = process.env.SUPPORT_EMAIL || smtpUser();

  const html = `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#1e40af;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">R&#233;initialisation du mot de passe</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;margin:0 0 16px;">Bonjour,</p>
      <p style="color:#374151;margin:0 0 24px;">
        Vous avez demand&#233; &#224; r&#233;initialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer (lien valide 15 minutes)&nbsp;:
      </p>
      <div style="text-align:center;margin:0 0 24px;">
        <a href="${resetUrl}" style="display:inline-block;background:#1e40af;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;">
          Choisir un nouveau mot de passe
        </a>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0 0 16px;word-break:break-all;">
        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:<br />
        <a href="${resetUrl}" style="color:#1e40af;">${resetUrl}</a>
      </p>
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Si vous n&#8217;&#234;tes pas &#224; l&#8217;origine de cette demande, ignorez cet email.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
      <p style="color:#6b7280;font-size:12px;text-align:center;margin:0;">
        Support&nbsp;: <a href="mailto:${supportEmail}" style="color:#1e40af;">${supportEmail}</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html,
    text: `Réinitialisez votre mot de passe : ${resetUrl}\n\nCe lien expire dans 15 minutes.`,
  });

  logger.info(`Email réinitialisation mot de passe envoyé (to: ${to})`);
};

module.exports = {
  sendLicenseKey,
  sendRefundConfirmation,
  sendPasswordResetEmail,
  isSmtpConfigured,
};
