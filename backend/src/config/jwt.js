const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
  const payload = { id: user._id.toString(), email: user.email, role: user.role };
  const accessToken  = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken };
};

module.exports = { generateTokens };