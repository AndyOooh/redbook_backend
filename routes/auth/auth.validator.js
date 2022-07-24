import { body } from 'express-validator';
import { User } from '../../models/user.model.js';

const authValidator = {
  register: [
    body('first_name')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('First name must be minimum 3 characters.'),
    body('last_name')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Last name must be minimum 3 characters.'),
    // body('username')
    //   .trim()
    //   .isLength({ min: 3 })
    //   .withMessage('Username must be minimum 3 characters long')
    //   .custom((value, { req }) => {
    //     return User.findOne({ username: value }).then(user => {
    //       //refactore like email?
    //       if (user) {
    //         return Promise.reject('Username already exists');
    //       }
    //     });
    //   }),
    body('email')
      .normalizeEmail()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject('Email address already exists.');
          }
        });
      }),
    body('password')
      .trim()
      .isLength({ min: 3, max: 40 })
      .withMessage('Password must be 3 - 40 characters.'),
  ],

  // login: [
  //   body('email')
  //     .required('Email is required'),
  //   body('password')
  //     .required('Password is required')
  // ],
};

export default authValidator;
