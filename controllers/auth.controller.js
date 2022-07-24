import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { FRONTEND_URL, JWT_SECRET } from '../config/VARS.js';
import { User } from '../models/user.model.js';
import { sendActivationEmail } from '../services/email.service.js';
import { generateToken } from '../services/token.service.js';

// @desc Create new user
// @route POST /api/auth/register
// @access Public
export const register = async (req, res, next) => {
  // Error handling -------------------------------------------------------
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    // error.message = errors[0].msg;
    error.message = errors.errors.map(err => err.msg).join(', ');
    error.status = 422;
    error.data = errors.array();
    return next(error);
  }

  const { first_name, last_name, password } = req.body;

  // Save user to database ---------------------------------------------------
  try {
    const createdUser = await User.create({
      ...req.body,
      username: first_name + last_name + Math.random().toString(),
      password: await bcrypt.hash(password, 10),
    });

    const { _id: id, username, email, picture, verified } = createdUser;

    // Send activation email ---------------------------------------------------
    const subject = 'Redbook account activation';
    const activationToken = generateToken({ id, email, verified }, '7d');
    const activationLink = `${FRONTEND_URL}/activate?activationToken=${activationToken}`;
    const html = `<div style="max-width:70rem;margin-bottom:1rem;display:flex;align-items:center;gap:1rem;font-family:Roboto;font-weight:600;color:#3b5998"><img src="https://res.cloudinary.com/dmhcnhtng/image/upload/v1645134414/logo_cs1si5.png" alt="" style="width:3rem"><span>Action required : Activate your Redbook account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${first_name}</span><div style="padding:2rem 0"><span style="padding:1.5rem 0">You recently created an account on Redbook. To complete your registration, please confirm your account.</span></div><a href=${activationLink} style="width:20rem;padding:1rem 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">Confirm your account</a><br><div style="padding-top:2rem"><span style="margin:1.5rem 0;color:#898f9c">Redbook allows you to stay in touch with all your friends, once registered on Redbook, you can share photos, organize events and much more.</span></div></div>`;
    await sendActivationEmail(email, subject, html);

    // Send response -----------------------------------------------------------
    res.status(201).json({
      first_name,
      last_name,
      username,
      email,
      picture,
      verified,
      token: generateToken({ id, first_name, email }, '7d'),
    });
  } catch (error) {
    // console.log('in register, error:', error.response.data.error_description);
    console.log('in register, error:', error);
    // delete user in db if activation email failed?
    return next(error);
  }
};

// @desc Log user in
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('in login, email:', email);
  if (!email || !password) {
    const error = new Error('All fields are required');
    error.status = 400;
    return next(error);
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const error = new Error('User not found');
      error.status = 404;
      return next(error);
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      const error = new Error('Invalid password');
      error.status = 400;
      return next(error);
    }
    const { _id: id, name } = existingUser;

    res.status(200).json({
      id,
      name,
      email,
      token: generateToken({ id, name, email }, '7d'),
    });
  } catch (error) {
    return next(error);
  }
};

// @desc Activate user account
// @route POST /api/auth/activate
// @access Private
export const activate = async (req, res, next) => {
  console.log('req.user in activateAccount', req.user);
  const userId = req.user.id;
  const activationToken = req.params.token;

  console.log('userId', userId);

  try {
    const decodedToken = await jwt.verify(activationToken, JWT_SECRET);
    console.log('decoded', decodedToken);
    if (decodedToken.id !== userId) {
      const error = new Error('You are not uthorized to activate this account');
      error.statusCode = 401;
      return next(error);
      // throw error;
    }

    const user = await User.findById(decodedToken.id);
    if (user.verified) {
      const error = new Error('This email is already verified');
      error.statusCode = 400;
      return next(error);
      // return res.status(400).json({ message: 'This email is already verified' });
    }

    user.verified = true;
    await user.save();
    return res.status(200).json({ message: 'Account activated' });
  } catch (error) {
    return next(error);
  }
};
//  ------------------------------------------------------------------------
