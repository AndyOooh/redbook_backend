import express from 'express';
import {
  verify,
  login,
  resendVerificationEmail,
  refreshAccessToken,
  logout,
  sendResetPasswordCode,
  validateResetCode,
  changePassword,
} from '../../controllers/auth.controller.js';
import { isAuth } from '../../middleware/isAuth.js';

console.log('in auth.routes.js');

const router = express.Router();

router.get('/', (req, res) => {
  console.log('Ping, it works!');
  res.send('auth routes');
});

router.post('/login', login);
router.post('/logout', logout);

router.get('/refresh', refreshAccessToken);
router.patch('/verify/:token', isAuth, verify);
router.post('/resendverify', isAuth, resendVerificationEmail);

router.post('/resetPassword', sendResetPasswordCode);
router.post('/validateResetCode', validateResetCode);
router.post('/changePassword', changePassword);

export default router;
