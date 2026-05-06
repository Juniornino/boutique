const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  firstName: { type: String },
  lastName: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  resetPasswordTokenHash: { type: String },
  resetPasswordExpiresAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
