import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../config/VARS.js';
import { User } from '../models/user.model.js';
import { Code } from '../models/code.model.js';
import { sendEmail } from '../services/email.service.js';
import { generateToken } from '../services/token.service.js';
import {
  createUserObject,
  generateCode,
  resetCodeEmailOptions,
  verificationEmailOPtions,
} from './auth.helpers.js';

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

  await existingUser?.save();

  res.clearCookie('refresh_token', { httpOnly: true });
  res.sendStatus(204);
};

// ---------------------------------------- /refresh ----------------------------------------
// @desc Refresh user access token
// @route GET /api/auth/refresh
// @access Private
export const refreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  const decoded = await jwt.decode(cookies.refresh_token, REFRESH_TOKEN_SECRET);
  if (!cookies?.refresh_token) return res.sendStatus(401);
  const refreshToken = cookies.refresh_token;
  res.clearCookie('refresh_token', {
    httpOnly: true,
    // sameSite: 'None',
    // secure: true
  });

  const existingUser = await User.findOne({ refreshToken })
    .populate('friends', 'first_name last_name username pictures')
    .exec();

  // Detected refresh token reuse!
  if (!existingUser) {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.sendStatus(403); //Forbidden
      // Delete refresh tokens of hacked user
      const hackedUser = await User.findOne({ email: decoded.email }).exec();
      if (hackedUser) {
        hackedUser.refreshToken = '';
        await hackedUser.save();
      }
    });
    return res.sendStatus(403); //Forbidden
  }

  // const newRefreshTokenArray = existingUser.refreshToken.filter(rt => rt !== refreshToken);

  // evaluate jwt /rewrite to get rid of cb - its alreasy
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      // expired refresh token
      console.log('expired refreshToken: ', err);
      existingUser.refreshToken = '';
      const result = await existingUser.save();
    }
    if (err || existingUser.email !== decoded.email) return res.sendStatus(403);

    // Refresh token was still valid
    // const roles = Object.values(existingUser.roles);
    const { id, email, username } = existingUser;
    const newRefreshToken = generateToken({ email }, REFRESH_TOKEN_SECRET, '2h');

    // Saving refreshToken with current user
    existingUser.refreshToken = newRefreshToken;
    const savedUser = await existingUser.save();

    // Creates Secure Cookie with new refresh token
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      // secure: true,
      // sameSite: 'None',
      // maxAge: 24 * 60 * 60 * 1000,
    });

    const newAccessToken = generateToken({ username, id }, ACCESS_TOKEN_SECRET, '2h');
    const { rest, details } = createUserObject(savedUser._doc);

    res.json({ user: { id, details, ...rest }, accessToken: newAccessToken });
  });
};

// ---------------------------------------- /login ----------------------------------------
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
    // const existingUser = await User.findOne({ email }).select(' -createdAt -updatedAt -__v');
    const existingUser = await User.findOne({ email })
      .populate('friends', 'first_name last_name username pictures')
      .select(' -createdAt -updatedAt -__v');

    if (!existingUser) {
      const error = new Error('Wrong credentials');
      error.statusCode = 404;
      return next(error);
    }

    // const { _id: id, password, createdAt, ...rest } = existingUser._doc; //before refactoring to auth.helpers for use in register and refresh
    const { id, password, rest } = createUserObject(existingUser._doc);

    const isMatch = await bcrypt.compare(loginPassword, password);
    if (!isMatch) {
      const error = new Error('Wrong credentials');
      error.statusCode = 400;
      return next(error);
    }

    const newRefreshToken = generateToken({ email }, REFRESH_TOKEN_SECRET, '7d');
    const newAccessToken = generateToken(
      { email, id, username: existingUser.username },
      ACCESS_TOKEN_SECRET,
      '7d'
    );

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
  const userId = req.user.id;
  const verificationToken = req.params.token;

  try {
    const decodedToken = await jwt.verify(verificationToken, REFRESH_TOKEN_SECRET);
    if (decodedToken.id !== userId) {
      const error = new Error('You are not uthorized to verify this account');
      error.statusCode = 401;
      return next(error);
      // throw error;
    }

    const user = await User.findById(decodedToken.id);
    if (user?.verified) {
      const error = new Error('This account is already verified');
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
    await sendEmail(email, subject, html);

    return res.status(200).json({
      message: 'A verification link has been sent to your email.',
    });
  } catch (error) {
    // res.status(500).json({ message: error.message });
    return next(error);
  }
};

export const sendResetPasswordCode = async (req, res, next) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email }).select('-password');
    const code = generateCode(5);
    const newCode = await Code.findOneAndUpdate(
      { user: user._id },
      { code: code },
      { upsert: true, new: true }
    );

    const { subject, html } = resetCodeEmailOptions(user.first_name, newCode.code);
    await sendEmail(email, subject, html);
    return res.status(200).json({
      message: 'Email reset code has been sent to your email',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validateResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const existingCode = await Code.findOne({ user: user._id });
    if (existingCode.code !== code) {
      return res.status(400).json({
        message: 'Verification code is wrong..',
      });
    }
    return res.status(200).json({ message: 'ok' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res, next) => {
  const { email, password } = req.body;

  const hashedPw = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate(
    { email },
    {
      password: hashedPw,
    }
  );
  return res.status(200).json({ message: 'ok' });
};
