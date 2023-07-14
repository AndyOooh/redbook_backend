import { body } from 'express-validator';
import { User } from '../../models/user.model.js';

const usersValidator = {
  register: [
    body('first_name')
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('First name must be minimum 2 characters.'),
    body('last_name')
      .trim()
      .isLength({ min: 2, max: 30 })
      .withMessage('Last name must be minimum 2 characters.'),

    body('email')
      .normalizeEmail()
      .isEmail()
      .withMessage('Please enter a valid email address')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject('An account with this email address already exists.');
          }
        });
      }),
    body('password')
      .trim()
      .isLength({ min: 3, max: 40 })
      .withMessage('Password must be 3 - 40 characters.'),
  ],
};

export default usersValidator;
