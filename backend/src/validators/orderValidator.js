const Joi = require('joi');

const cartItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const checkoutSessionSchema = Joi.object({
  paymentMethod: Joi.string().valid('mobile_money', 'card').default('mobile_money'),
  phoneNumber: Joi.string().max(32).optional().allow(''),
  operator: Joi.string().valid('MTN', 'Orange', 'Moov', 'TMoney', 'Wave', 'Airtel', 'Vodacom').optional(),
  country: Joi.string().valid('CM', 'CI', 'SN', 'TG', 'BJ', 'BF', 'ML', 'GN', 'GA', 'CG', 'CD').default('CM'),
});

module.exports = { cartItemSchema, checkoutSessionSchema };