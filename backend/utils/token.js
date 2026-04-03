const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT Token
 */
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Generate Access Token
 */
const generateAccessToken = (user) => {
  return generateToken({
    id: user._id,
    email: user.email,
    role: user.role
  }, '1d');
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (user) => {
  return generateToken({
    id: user._id,
    type: 'refresh'
  }, '7d');
};

/**
 * Verify Token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode Token (without verification)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Generate tokens pair
 */
const generateTokens = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

module.exports = {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyToken,
  decodeToken
};
