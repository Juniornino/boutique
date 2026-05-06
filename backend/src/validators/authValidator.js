const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[A-Z])(?=.*[0-9])/).required().messages({
    'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule et un chiffre.'
  }),
  firstName: Joi.string().trim().max(100).optional(),
  lastName: Joi.string().trim().max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().min(10).max(512).required(),
  password: Joi.string().min(8).max(128).pattern(/^(?=.*[A-Z])(?=.*[0-9])/).required().messages({
    'string.pattern.base': 'Le mot de passe doit contenir au moins une majuscule et un chiffre.'
  }),
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema };
