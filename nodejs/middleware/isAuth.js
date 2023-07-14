import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/VARS.js';
import { errorCreator } from '../services/error.service.js';

export const isAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // errorCreator('Not Authorized', 401);
    const error = new Error('Not Authorized');
    error.status = 401;
    return next(error);
  }
  try {
    const accessToken = authHeader.split(' ')[1];
    const decodedToken = await jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    // const decodedToken = await jwt.verify(token, REFRESH_TOKEN_SECRET);
    req.user = decodedToken;
    console.log('🚀 isAuth.js, decodedToken.username: ', decodedToken.username);
    next();
  } catch (error) {
    console.log('in isAuth error: ', error);
    return next(error);
  }
};
