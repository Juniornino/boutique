const axios = require('axios');
const logger = require('../config/logger');

/**
 * Service d'envoi WhatsApp via l'API WhatsApp Business (Cloud API — Meta).
 *
 * Variables d'environnement requises :
 *   WHATSAPP_API_URL      — ex: https://graph.facebook.com/v18.0/<PHONE_NUMBER_ID>/messages
 *   WHATSAPP_ACCESS_TOKEN — Bearer token permanent (ou temporaire en dev)
 *
 * Si les variables ne sont pas configurées, les envois sont silencieusement ignorés
 * (comme le service email).
 */

const apiUrl = process.env.WHATSAPP_API_URL;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

const isConfigured = () => Boolean(apiUrl && accessToken);

/**
 * Envoie un message texte WhatsApp à un numéro donné.
 * @param {{ to: string, body: string }} params
 *   - to : numéro international sans « + » (ex: "237670000000")
 *   - body : contenu texte du message
 */
const sendTextMessage = async ({ to, body }) => {
  if (!isConfigured()) {
    logger.warn(`WhatsApp non envoyé — API non configurée (to: ${to})`);
    return;
  }

  try {
    await axios.post(
      apiUrl,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );
    logger.info(`WhatsApp envoyé (to: ${to})`);
  } catch (error) {
    const msg = error.response?.data?.error?.message || error.message;
    logger.error(`Erreur WhatsApp (to: ${to}): ${msg}`);
  }
};

/**
 * Envoie la clé de licence au client par WhatsApp.
 * @param {{ to: string, productName: string, licenseKey: string, orderId: string }} params
 */
const sendLicenseKeyWhatsApp = async ({ to, productName, licenseKey, orderId }) => {
  const body =
    `✅ Votre clé de licence est prête !\n\n` +
    `Produit : ${productName}\n` +
    `Clé : ${licenseKey}\n` +
    `Commande : ${orderId}\n\n` +
    `Instructions :\n` +
    `1. Téléchargez le logiciel depuis le site officiel\n` +
    `2. Choisissez "Activer avec une clé"\n` +
    `3. Collez la clé ci-dessus\n\n` +
    `Merci pour votre achat — Support 7j/7`;

  await sendTextMessage({ to, body });
};

module.exports = { sendTextMessage, sendLicenseKeyWhatsApp, isConfigured };
