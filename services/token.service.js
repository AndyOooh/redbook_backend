import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/VARS.js';

export const generateToken = (payload, expiresIn) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn });
};

// export const verifyToken = async token => {
//   if (!token) {
//     const error = new Error('No token provided');
//     error.status = 401;
//     next(error);
//   }
//   const decoded = await jwt.verify(token, process.env.JWT_SECRET);
//   if (!decoded) {
//     const error = new Error('Invalid token');
//     error.status = 401;
//     next(error);
//   }
//   return decoded;
// };
