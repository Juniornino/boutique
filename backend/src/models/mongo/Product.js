const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  promotionalPrice: { type: Number },
  category: { type: String, enum: ['OS', 'OFFICE', 'SECURITY', 'UTILITY', 'OTHER'], required: true },
  image: { type: String },
  publisher: { type: String },
  version: { type: String },
  isActive: { type: Boolean, default: true },
  availableKeysCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);