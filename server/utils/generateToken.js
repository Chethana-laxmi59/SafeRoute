import jwt from 'jsonwebtoken';

/**
 * Generate a signed JSON Web Token (JWT) containing the user's ID
 * @param {string} id - User ObjectId string
 * @returns {string} - Signed JWT
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

export default generateToken;

