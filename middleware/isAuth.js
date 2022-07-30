import jwt from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET } from '../config/VARS.js';
import { errorCreator } from '../services/error.service.js';

export const isAuth = async (req, res, next) => {
  console.log('in isAuth middleware');
  const authHeader = req.headers.authorization;
  console.log('authHeader:', authHeader);
  if (!authHeader) {
    // errorCreator('Not Authorized', 401);
    const error = new Error('Not Authorized');
    error.status = 401;
    return next(error);
  }

  try {
    const token = authHeader.split(' ')[1];
    const decodedToken = await jwt.verify(token, REFRESH_TOKEN_SECRET);
    console.log('decodedToken', decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.log('in isAuth error: ', error);
    return next(error);
  }
};
