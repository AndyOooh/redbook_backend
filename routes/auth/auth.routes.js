import express from 'express';
import { activate, login, register } from '../../controllers/auth.controller.js';
import { isAuth } from '../../middleware/isAuth.js';
import authValidator from './auth.validator.js';

console.log('in auth.routes.js');

const router = express.Router();



router.post('/register', authValidator.register, register);
router.post('/login', login);
// router.use('/activate/:token', activate);
router.post('/activate/:token', isAuth, activate);

export default router;
