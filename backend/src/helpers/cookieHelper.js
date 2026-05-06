const { ACCESS_TOKEN_MAX_AGE_MS, REFRESH_TOKEN_MAX_AGE_MS } = require('../constants');

const isProduction = () => process.env.NODE_ENV === 'production';

const buildCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'Strict' : 'Lax',
  maxAge,
});

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie('accessToken', accessToken, buildCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
  res.cookie('refreshToken', refreshToken, buildCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));
};

const clearAuthCookies = (res) => {
  const opts = { httpOnly: true, secure: isProduction(), sameSite: isProduction() ? 'Strict' : 'Lax' };
  res.clearCookie('accessToken', opts);
  res.clearCookie('refreshToken', opts);
};

module.exports = { setAuthCookies, clearAuthCookies };
