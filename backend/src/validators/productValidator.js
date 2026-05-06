const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().max(200).required(),
  description: Joi.string().required(),
  price: Joi.number().min(0).required(),
  promotionalPrice: Joi.number().min(0).optional().allow(null, ''),
  category: Joi.string().valid('OS', 'OFFICE', 'SECURITY', 'UTILITY', 'OTHER').required(),
  image: Joi.string().uri().optional(),
  publisher: Joi.string().optional(),
  version: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const bulkKeysSchema = Joi.object({
  keys: Joi.string().max(500000).required(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().max(200).optional(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  promotionalPrice: Joi.number().min(0).optional().allow(null, ''),
  category: Joi.string().valid('OS', 'OFFICE', 'SECURITY', 'UTILITY', 'OTHER').optional(),
  image: Joi.string().uri().optional(),
  publisher: Joi.string().optional(),
  version: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

module.exports = { productSchema, updateProductSchema, bulkKeysSchema };