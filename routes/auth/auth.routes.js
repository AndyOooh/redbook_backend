import express from 'express';
import {
  verify,
  login,
  register,
  resendVerificationEmail,
} from '../../controllers/auth.controller.js';
import { isAuth } from '../../middleware/isAuth.js';
import authValidator from './auth.validator.js';

console.log('in auth.routes.js');

const router = express.Router();

router.post('/register', authValidator.register, register);
router.post('/login', login);
router.post('/verify/:token', isAuth, verify);
router.post('/resendverify', isAuth, resendVerificationEmail);

export default router;
