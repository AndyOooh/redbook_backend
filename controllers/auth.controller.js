import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { ACCESS_TOKEN_SECRET, NODE_ENV, REFRESH_TOKEN_SECRET } from '../config/VARS.js';
import { User } from '../models/user.model.js';
import { sendVerificationEmail } from '../services/email.service.js';
import { generateToken } from '../services/token.service.js';
import { createUserObject, verificationEmailOPtions } from './auth.helpers.js';


// ---------------------------------------- /logout ----------------------------------------
// @desc Log a user out
// @route POST /api/auth/logout
// @access Public
export const logout = async (req, res) => {
  // On client, also delete the accessToken

  const { refresh_token } = req.cookies;
  if (!refresh_token) return res.sendStatus(204); //No content

  // Is refreshToken in db?
  const existingUser = await User.findOne({ refresh_token }).exec();
  if (existingUser) {
    existingUser.refreshToken = null;
  }

  await existingUser.save();

  res.clearCookie('refresh_token', { httpOnly: true });
  res.sendStatus(204);
};

// ---------------------------------------- /refresh ----------------------------------------
// @desc Refresh user access token
// @route GET /api/auth/refresh
// @access Private
export const refreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refresh_token) return res.sendStatus(401);
  const refreshToken = cookies.refresh_token;
  console.log(' in refreshAccessToken refreshToken999', refreshToken);
  res.clearCookie('refresh_token', {
    httpOnly: true,
    // sameSite: 'None',
    // secure: true
  });

  const existingUser = await User.findOne({ refreshToken }).exec();

  // Detected refresh token reuse!
  if (!existingUser) {
    console.log('no user with this refresh token, token will be deleted');
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.sendStatus(403); //Forbidden
      // Delete refresh tokens of hacked user
      const hackedUser = await User.findOne({ username: decoded.username }).exec();
      hackedUser.refreshToken = '';
      const result = await hackedUser.save();
    });
    return res.sendStatus(403); //Forbidden
  }

  // const newRefreshTokenArray = existingUser.refreshToken.filter(rt => rt !== refreshToken);

  // evaluate jwt
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      // expired refresh token
      console.log('expired refreshToken: ', err);
      existingUser.refreshToken = '';
      const result = await existingUser.save();
    }
    console.log('decoded', decoded);
    if (err || existingUser.email !== decoded.email) return res.sendStatus(403);
    console.log('after......');

    // Refresh token was still valid
    // const roles = Object.values(existingUser.roles);
    const newAccessToken = generateToken({ email: existingUser.email }, ACCESS_TOKEN_SECRET, '2h');
    const newRefreshToken = generateToken(
      { email: existingUser.email },
      REFRESH_TOKEN_SECRET,
      '2d'
    );

    // Saving refreshToken with current user
    existingUser.refreshToken = newRefreshToken;
    const savedUser = await existingUser.save();
    console.log('in refreshToken, savedUser', savedUser);

    // Creates Secure Cookie with new refresh token
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'None',
      // maxAge: 24 * 60 * 60 * 1000,
    });

    const { id, rest } = createUserObject(savedUser._doc);

    res.json({ user: { id, ...rest }, accessToken: newAccessToken });
  });
};

// ---------------------------------------- /register ----------------------------------------
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
    error.statusCode = 422;
    error.data = errors.array();
    return next(error);
  }

  const { first_name, last_name, email, password } = req.body;

  const newRefreshToken = generateToken({ email }, REFRESH_TOKEN_SECRET, '7d');
  const newAccessToken = generateToken({ email }, ACCESS_TOKEN_SECRET, '7d');

  // Save user to database
  try {
    const createdUser = await User.create({
      ...req.body,
      username: first_name + last_name + Math.random().toString(),
      password: await bcrypt.hash(password, 10),
      refreshToken: newRefreshToken,
    });

    console.log('createdUser: ', createdUser);

    const { id, rest } = createUserObject(createdUser._doc);

    // Send verification email
    const { subject, html } = verificationEmailOPtions(id, first_name);
    await sendVerificationEmail(email, subject, html);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
    });

    // Send response
    res.status(200).json({
      user: { id, ...rest },
      accessToken: newAccessToken,
    });
  } catch (error) {
    // console.log('in register, error:', error.response.data.error_description);
    console.log('in register, error:', error);
    // delete user in db if verification email failed?
    return next(error);
  }
};

// ---------------------------------------- /login ----------------------------------------
// @desc Log user in
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
  console.log('in login req.body:', req.body);

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

    // const { _id: id, password, createdAt, ...rest } = existingUser._doc; //before refactoring to auth.helpers for use in register and refresh
    const { id, password, rest } = createUserObject(existingUser._doc);

    const isMatch = await bcrypt.compare(loginPassword, password);
    if (!isMatch) {
      const error = new Error('Invalid password');
      error.statusCode = 400;
      return next(error);
    }

    const newRefreshToken = generateToken({ email }, REFRESH_TOKEN_SECRET, '7d');
    const newAccessToken = generateToken({ email }, ACCESS_TOKEN_SECRET, '7d');

    existingUser.refreshToken = newRefreshToken;
    await existingUser.save();

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      // secure: NODE_ENV === 'production' ? true : false,
      // secure: false,
      // sameSite: 'None',
      // maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      user: { id, ...rest },
      accessToken: newAccessToken,
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
    const decodedToken = await jwt.verify(verificationToken, REFRESH_TOKEN_SECRET);
    console.log('decoded', decodedToken);
    if (decodedToken.id !== userId) {
      const error = new Error('You are not uthorized to verify this account');
      error.statusCode = 401;
      return next(error);
      // throw error;
    }

    const user = await User.findById(decodedToken.id);
    console.log('user in verify: ', user);
    if (user?.verified) {
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
  console.log('req.user in resendVerificationEmail666666', req.user);
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
