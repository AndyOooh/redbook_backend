import jwt from 'jsonwebtoken';

export const generateToken = (payload, secret, expiresIn) => {
  console.log('in generateToken', payload, secret, expiresIn);
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
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
