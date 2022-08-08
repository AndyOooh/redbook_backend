import express from 'express';
import {
  verify,
  login,
  register,
  resendVerificationEmail,
  refreshAccessToken,
  logout,
  findUser,
  sendResetPasswordCode,
  validateResetCode,
  changePassword,
} from '../../controllers/auth.controller.js';
import { isAuth } from '../../middleware/isAuth.js';
import authValidator from './auth.validator.js';

console.log('in auth.routes.js');

const router = express.Router();

router.post('/register', authValidator.register, register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/refresh', refreshAccessToken);
router.patch('/verify/:token', isAuth, verify);
router.post('/resendverify', isAuth, resendVerificationEmail);

router.post('/findUser', findUser);
router.post('/resetPassword', sendResetPasswordCode);
router.post('/validateResetCode', validateResetCode);
router.post('/changePassword', changePassword);

export default router;
