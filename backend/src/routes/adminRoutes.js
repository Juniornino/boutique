const express = require('express');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  bulkImportKeys,
  uploadProductImage,
  getKeys,
  updateKey,
  deleteKey,
  getProducts,
  getCustomers,
  getOrders,
  refundOrder,
  deleteOrder,
  updateAdminProfile,
  getStoreSettings,
  updateStoreSettings,
  getSystemActivities,
  getNotificationsSummary,
} = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { productSchema, updateProductSchema, bulkKeysSchema } = require('../validators/productValidator');
const { uploadProductImageMw } = require('../middlewares/uploadProductImage');

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.post('/products', validate(productSchema), createProduct);
router.put('/products/:id', validate(updateProductSchema), updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products', getProducts);
router.post('/products/:id/image', uploadProductImageMw, uploadProductImage);
router.post('/products/:id/keys', validate(bulkKeysSchema), bulkImportKeys);
router.get('/products/:id/keys', getKeys);
router.put('/products/:id/keys/:keyId', updateKey);
router.delete('/products/:id/keys/:keyId', deleteKey);
router.get('/orders', getOrders);
router.post('/orders/:id/refund', refundOrder);
router.delete('/orders/:id', deleteOrder);
router.get('/customers', getCustomers);
router.put('/profile', updateAdminProfile);
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);
router.get('/activities', getSystemActivities);
router.get('/notifications/summary', getNotificationsSummary);

module.exports = router;