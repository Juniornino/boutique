const express = require('express');
const { getProducts, getProductById, getStoreSettingsPublic } = require('../controllers/productController');

const router = express.Router();

router.get('/', getProducts);
router.get('/store-settings', getStoreSettingsPublic);
router.get('/:id', getProductById);

module.exports = router;