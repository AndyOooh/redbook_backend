import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { createUserObject } from './auth.helpers.js';

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
      const { id, details, rest } = createUserObject(foundUser._doc);
      user = { id, details, ...rest };
    } else {
      // shoudl be else If (type === 'post' (name it whatever) and needs to be matched on frontend request. I belive the only other use case for now is to show in comments/posts )
      user = await User.findById(userId)
        .select('first_name last_name username pictures gender')
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

// Not in use since getUser has types (I think)
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
  console.log('req.file: ', req.file);
  console.log('req.params ', req.params);
  console.log('req.query ', req.query); //?type=profile or cover

  const type = req.query.type; //use this in uploadtocloudinary
  const image = req.file || JSON.parse(req.body.image);

  const { id, username } = req.user;
  const { id: profileUserId } = req.params;

  if (profileUserId !== id) {
    return res.status(401).json({
      message: 'You are not authorized to update this profile',
    });
  }

  let selector;
  let field;

  if (type === 'profile') {
    selector = 'pictures -_id';
    field = 'pictures';
  } else if (type === 'cover') {
    selector = 'covers -_id';
    field = 'covers';
  }

  let picsToReturn;
  try {
    if (image.usedBefore) {
      const returnedImages = await User.findById(profileUserId).select(selector).exec();
      // const objvalues = returnedImages[field];

      const newImagesArray = returnedImages[field]?.filter(img => img.id !== image.id);

      newImagesArray.unshift(image);
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          [field]: newImagesArray,
        },
        { new: true }
      ).exec();
      picsToReturn = updatedUser[field];
    } else if (image) {
      const uploadedImage = await uploadToCloudinary({ file: image, username, type: type });
      console.log('🚀 ~ file: users.controller.js ~ line 123 ~ uploadedImage', uploadedImage);
      const imageToStore = { ...uploadedImage, usedBefore: true };
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          $push: {
            [field]: { $each: [imageToStore], $position: 0 },
          },
        },
        { new: true }
      );
      picsToReturn = updatedUser[field];
    } else {
      return res.status(400).json({ message: 'No image found in request' });
    }
    return res.status(200).json(picsToReturn);
  } catch (error) {
    console.log('🚀 ~ file: users.controller.js ~ line 99 ~ updateProfilePhoto ~ error', error);
  }
};
