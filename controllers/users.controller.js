import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { createUserObject } from './auth.helpers.js';

import cloudinary from '../config/cloudinary.js';

// @desc get a user
// @route GET /api/users/:id
// @access Public
export const getUser = async (req, res, next) => {
  const { id: userId } = req.params;
  const { type } = req.query;

  console.log('in getUser');
  console.log('userId', userId);
  console.log('req.params', req.params);
  console.log('req.query', req.query);

  try {
    let user;

    if (type === 'profile') {
      // const foundUser = await User.findById(userId).exec();
      const foundUser = await User.findOne({ username: userId }).exec();
      console.log('foundUser', foundUser);
      if (!foundUser) {
        return res.status(404).json({
          message: 'User not found',
        });
      }
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

// @desc update a user's profile photo
// @route PUT /api/users/:id/update
// @access Private

export const updateProfilePhoto = async (req, res, next) => {
  console.log('in updateProfilePhoto');
  console.log('req.body: ', req.body);
  console.log('req.files: ', req.files);
  console.log('req.file: ', req.file);
  console.log('req.params ', req.params);

  console.log(typeof req.body.images);

  console.log('req.query ', req.query); //?type=profile or cover
  // const type = req.query.type; use this in uploadtocloudinary

  const { files } = req;
  const { id, username } = req.user;
  const { id: userId } = req.params;

  if (userId !== id) {
    return res.status(401).json({
      message: 'You are not authorized to update this profile',
    });
  }

  try {
    // const images = await uploadToCloudinary({ files, username, type: 'profile' });
    const images = await cloudinary.uploader.upload(req.body.images.file, {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      folder: 'redbook/users/' + username,
    });


    // const images = await uploadToCloudinary({ files: req.body.images, username, type: 'profile' });
    console.log('🚀 ~ file: users.controller.js ~ line 88 ~ updateProfilePhoto ~ images', images);
  } catch (error) {
    console.log('🚀 ~ file: users.controller.js ~ line 91 ~ updateProfilePhoto ~ error', error);
  }

  // upload to cloudinary
  // update user.profile_photo
  // not here: send another request on 'save' to create a post 'changed thir profile photo'

  // send image url in response
  res.status(200).json({ message: 'Profile photo updated' });
};
