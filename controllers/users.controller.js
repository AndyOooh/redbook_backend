import { User } from '../models/user.model.js';
import { createUserObject } from './auth.helpers.js';

// @desc get a user
// @route GET /api/users/:id
// @access Public
export const getUser = async (req, res, next) => {
  const { id: userId } = req.params;
  const { type } = req.query;

  console.log('userId', userId);
  console.log('req.params', req.params);
  console.log('req.query', req.query);

  try {
    let user;

    if (type === 'profile') {
      // const foundUser = await User.findById(userId).exec();
      const foundUser = await User.findOne({ username: userId }).exec();
      console.log('foundUser', foundUser);
      const { id, rest } = createUserObject(foundUser._doc);
      user = { id, ...rest };
    } else {
      user = await User.findById(userId)
        .select('first_name last_name username picture gender')
        .exec();
    }
    console.log('user in response: ', user);
    res.status(200).json(user);
  } catch (error) {
    console.log('error in getUser: ', error);
    next(error);
  }
};

// @desc get a user
// @route GET /api/users/:id
// @access Public

export const getProfile = async (req, res, next) => {
  const { id: userId } = req.params;

  try {
    const user = await User.findById(userId)
      // .select('first_name last_name username picture gender')
      .exec();
    res.status(200).json(user);
  } catch (error) {
    console.log('error in getUser: ', error);
    next(error);
  }

  res.status(200).json({ 'Hi from getProfile': userId });
};

// export const getCurrentUser = async (req, res, next) => {
//     const {id} = req.user;
//     console.log('user in getCurrentUser: ', req.user);
//   try {
//     const { email, first_name, verified } = await User.findById(id);
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

// export const getUsers = async (req, res, next) => {
//     console.log('req.body in getUsers', req.body);

//     try {
//       const users = await User.find();

//       console.log('users', users);
//       res.status(200).json(users);
//     } catch (error) {
//       return next(error);
//     }
//   };
