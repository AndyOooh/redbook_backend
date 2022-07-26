import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/VARS.js';
import { User } from '../models/user.model.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { generateToken } from '../services/token.service.js';
import { verificationEmailOPtions } from './auth.helpers.js';

// ---------------------------------------- register ----------------------------------------
// @desc Create new user
// @route POST /api/auth/register
// @access Public
// TODO return entire user object as done in login
export const register = async (req, res, next) => {
  // Error handling -------------------------------------------------------
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    // error.message = errors[0].msg;
    error.message = errors.errors.map(err => err.msg).join(', ');
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const { first_name, last_name, email, password } = req.body;

  // Save user to database
  try {
    const createdUser = await User.create({
      ...req.body,
      username: first_name + last_name + Math.random().toString(),
      password: await bcrypt.hash(password, 10),
    });

    console.log('createdUser: ', createdUser);

    // Destructure: We need id and can send 'rest' object in reponse without password etc.
    const {
      _id: id,
      password: createdPassword,
      details,
      createdAt,
      updatedAt,
      __v,
      ...rest
    } = createdUser._doc;

    console.log('past destrict createdUser');

    // Send verification email
    const { subject, html } = verificationEmailOPtions(id, first_name);
    await sendVerificationEmail(email, subject, html);

    console.log('past sendVerificationEmail');

    // Send response
    res.status(201).json({
      id,
      token: generateToken({ id, email }, '7d'),
      ...rest,
    });
  } catch (error) {
    // console.log('in register, error:', error.response.data.error_description);
    console.log('in register, error:', error);
    // delete user in db if verification email failed?
    return next(error);
  }
};

// ---------------------------------------- login ----------------------------------------
// @desc Log user in
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
  const { email, password: loginPassword } = req.body;
  if (!email || !loginPassword) {
    const error = new Error('All fields are required');
    error.statusCode = 400;
    return next(error);
  }
  try {
    const existingUser = await User.findOne({ email }).select(
      '-details -createdAt -updatedAt -__v'
    );

    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const { _id: id, password, ...rest } = existingUser._doc;
    const isMatch = await bcrypt.compare(loginPassword, password);
    if (!isMatch) {
      const error = new Error('Invalid password');
      error.statusCode = 400;
      return next(error);
    }
    res.status(200).json({
      id,
      token: generateToken({ id, email }, '7d'),
      ...rest,
    });
  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------- verify ----------------------------------------
// @desc Verify user account
// @route POST /api/auth/verify
// @access Private
export const verify = async (req, res, next) => {
  console.log('req.user in verifyAccount', req.user);
  const userId = req.user.id;
  const verificationToken = req.params.token;

  console.log('verificationToken backend: ', verificationToken);

  console.log('userId', userId);

  try {
    const decodedToken = await jwt.verify(verificationToken, JWT_SECRET);
    console.log('decoded', decodedToken);
    if (decodedToken.id !== userId) {
      const error = new Error('You are not uthorized to verify this account');
      error.statusCode = 401;
      return next(error);
      // throw error;
    }

    const user = await User.findById(decodedToken.id);
    console.log('user in verify: ', user);
    if (user.verified) {
      const error = new Error('This email is already verified');
      error.statusCode = 400;
      return next(error);
    }

    user.verified = true;
    await user.save();
    return res.status(200).json({ message: 'Account verified' });
  } catch (error) {
    return next(error);
  }
};

// ---------------------------------------- resend verification email ----------------------------------------
// @desc Resend email with verification link
// @route POST /api/auth/resendverify
// @access Private
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { email, first_name, verified } = await User.findById(id);
    if (verified === true) {
      const error = new Error('This account is already verified.');
      error.statusCode = 400;
      return next(error);
    }
    const { subject, html } = verificationEmailOPtions(id, first_name);
    await sendVerificationEmail(email, subject, html);

    return res.status(200).json({
      message: 'Email verification link has been sent to your email.',
    });
  } catch (error) {
    // res.status(500).json({ message: error.message });
    return next(error);
  }
};

// export const findUser = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email }).select("-password");
//     if (!user) {
//       return res.status(400).json({
//         message: "Account does not exists.",
//       });
//     }
//     return res.status(200).json({
//       email: user.email,
//       picture: user.picture,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const sendResetPasswordCode = async (req, res, next) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email }).select("-password");
//     await Code.findOneAndRemove({ user: user._id });
//     const code = generateCode(5);
//     const savedCode = await new Code({
//       code,
//       user: user._id,
//     }).save();
//     sendResetCode(user.email, user.first_name, code);
//     return res.status(200).json({
//       message: "Email reset code has been sent to your email",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const validateResetCode = async (req, res, next) => {
//   try {
//     const { email, code } = req.body;
//     const user = await User.findOne({ email });
//     const Dbcode = await Code.findOne({ user: user._id });
//     if (Dbcode.code !== code) {
//       return res.status(400).json({
//         message: "Verification code is wrong..",
//       });
//     }
//     return res.status(200).json({ message: "ok" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const changePassword = async (req, res, next) => {
//   const { email, password } = req.body;

//   const cryptedPassword = await bcrypt.hash(password, 12);
//   await User.findOneAndUpdate(
//     { email },
//     {
//       password: cryptedPassword,
//     }
//   );
//   return res.status(200).json({ message: "ok" });
// };
