import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

import { dwightId, michaelScottId, User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { createUserObject, verificationEmailOPtions } from './auth.helpers.js';
import { getFriendship } from './users.helpers.js';
import { nameCase, updateNestedObject } from '../utils/helperFunctions.js';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, USEEMAIL } from '../config/VARS.js';
import { generateToken } from '../services/token.service.js';
import { sendEmail } from '../services/email.service.js';

const { ObjectId } = mongoose.Types;
// ---------------------------------------- /register ----------------------------------------
// @desc Create new user
// @route POST /api/auth/register
// @access Public
export const createUser = async (req, res, next) => {
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
  const first_name_cased = nameCase(first_name);
  const last_name_cased = nameCase(last_name);
  req.body.first_name = first_name_cased;
  req.body.last_name = last_name_cased;

  const newRefreshToken = generateToken({ email }, REFRESH_TOKEN_SECRET, '7d');

  // Save user to database
  let createdUser;
  try {
    createdUser = await User.create({
      ...req.body,
      full_name: `${first_name_cased} ${last_name_cased}`,
      username: first_name + last_name + Math.random().toString(),
      password: await bcrypt.hash(password, 10),
      refreshToken: newRefreshToken,
    });

    await createdUser.populate('friends', 'first_name last_name username pictures');

    const { id, rest } = createUserObject(createdUser._doc);

    // Send verification email
    if (USEEMAIL === 'true') {
      const { subject, html } = verificationEmailOPtions(id, first_name);
      await sendEmail(email, subject, html);
    }

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
    });

    const newAccessToken = generateToken(
      { email, id, username: rest.username },
      ACCESS_TOKEN_SECRET,
      '7d'
    );

    // Update Michael Scott to be first friend:
    const firstFriendId = michaelScottId;
    const firstFriend = await User.findById(firstFriendId).exec();
    if (!firstFriend) {
      null;
    } else {
      firstFriend.friends.push(createdUser._id);
      firstFriend.following.push(createdUser._id);
      firstFriend.followers.push(createdUser._id);
      await firstFriend.save();
    }

    // Update Dwight Schrute to send first friend request:
    const firstRequestorId = dwightId;
    const firstRequestor = await User.findById(firstRequestorId).exec();
    if (!firstRequestor) {
      null;
    } else {
      firstRequestor.following.push(createdUser._id);
      firstRequestor.requestsSent.push(createdUser._id);
      await firstRequestor.save();
    }

    // Send response
    res.status(200).json({
      user: { id, ...rest },
      accessToken: newAccessToken,
    });
  } catch (error) {
    // delete user in db if verification email failed?
    return next(error);
  }
};

// @desc get a user
// @route GET /api/users/:id
// @access Public
export const getUser = async (req, res, next) => {
  const { username } = req.params;
  const { type } = req.query;
  const { id: userId } = req.user;

  try {
    let user;
    if (type === 'profile') {
      const foundUser = await User.findOne({ username: username })
        .populate('friends', 'first_name last_name username pictures')
        .lean();
      if (!foundUser) {
        res.status(404).json({ message: 'User not found' });
      }
      const friendship = getFriendship(foundUser, userId);
      const postPicturesArray = await Post.find({ user: foundUser._id, type: 'feed' })
        .select('images -_id')
        .lean();
      const postPictures = postPicturesArray.reduce((prev, curr) => [...prev, ...curr.images], []);
      const { id, rest } = createUserObject(foundUser); // omit ._doc bc lean()
      user = { id, friendship, postPictures, ...rest };
    } else if (type === 'comment') {
      user = await User.findById(username)
        .select('first_name last_name username pictures gender')
        .exec();
    }
    if (user?.friends) {
      user.friends = user.friends.map(friend => {
        return {
          ...friend,
          pictures: friend.pictures.slice(0, 1),
        };
      });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc update a user's profile or cover photo. Takes a type in req.query
// @route PUT /api/users/:id/update-images
// @access Private
export const updateProfilePhoto = async (req, res, next) => {
  const type = req.query.type; //use this in uploadtocloudinary
  const image = req.file || JSON.parse(req.body.image);

  const { id, username } = req.user;
  const { id: profileUserId } = req.params;

  if (profileUserId !== id) {
    return res.status(401).json({
      message: 'You are not authorized to update this profile',
    });
  }

  const isTypeProfile = type === 'profile';
  const selector = isTypeProfile ? 'pictures -_id' : 'covers -_id';
  const field = isTypeProfile ? 'pictures' : 'covers';

  let picsToReturn;
  try {
    if (image.usedBefore) {
      const returnedImages = await User.findById(profileUserId).select(selector).exec();
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
  } catch (error) {}
};

// @desc update a user document
// @route PUT /api/users/:id/update
// @access Private
export const updateUser = async (req, res) => {
  const { id } = req.user;
  const { id: profileUserId } = req.params;
  const { path, isArray } = req.query; // isArray is a string and must be true if field to update is an array

  if (profileUserId != 'undefined' && profileUserId != id) {
    return res.status(401).json({
      message: 'You are not authorized to update this profile',
    });
  }

  let user = await User.findById(id).exec();
  if (!user) return res.status(404).json({ message: 'User not found' });

  try {
    if (!path || path === '' || path === 'undefined') {
      let [field, value] = Object.entries(req.body)[0];
      if (isArray === 'true') {
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { $addToSet: { [field]: value } },
          { new: true }
        ).exec();
        return res.status(200).json({ message: 'User updated successfully', updatedUser });
      } else {
        user[field] = value;
      }
    } else {
      let value = Object.values(req.body)[0]; // to allow multiple fields updated at once, we need to iterate over req.body and use updateNestedObject on every uteration. or just update many. now we are doing neither.
      updateNestedObject(user, path, value, isArray);
    }
    await user.save();
    return res.status(200).json({ message: 'User updated successfully', user }); // Maybe just send back fields that were updated? frontend can handle this.
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error });
  }
};

// @desc anything with friend requests: add, accept/reject, delete, unfriend, follow, unfollow
// @route PUT /api/users/friendRequest?=type={type}
// @access Private
export const friendRequest = async (req, res, next) => {
  const { id: senderId } = req.user;
  const { body } = req;
  const { receiverId } = req.body;
  const { type } = req.query;

  if (senderId === receiverId) {
    const message =
      type === 'add'
        ? "You can't send a friend request to yourself"
        : type === 'accept'
        ? "You can't be friends with yourself"
        : type === 'cancel'
        ? "You can't cancel a request to yourself"
        : type === 'reject'
        ? "You can't reject a request from yourself"
        : type === 'unfriend'
        ? "You can't unfriend yourself"
        : type === 'follow'
        ? "You can't follow yourself"
        : type === 'unfollow'
        ? "You can't unfollow yourself"
        : null;
    return res.status(400).json({ message: message });
  }

  try {
    const query = 'friends requestsSent requestsReceived following followers';
    let sender = await User.findById(senderId).select(query).exec();
    // sender = sender.createUserObject(sender._doc);
    let receiver = await User.findById(receiverId).select(query).exec();
    if (!receiver) {
      return res.status(401).json({ message: 'User not found' });
    }
    let message = '';

    if (type === 'add') {
      if (receiver.friends?.includes(senderId)) {
        res.status(400).json({ message: 'This person is already in your friends list' });
      } else if (receiver.requestsReceived?.includes(senderId)) {
        res.status(400).json({ message: "You've already requested this person" });
      } else if (sender.requestsReceived?.includes(receiverId)) {
        res.status(400).json({ message: 'This person has already sent you a friend request' });
      } else {
        receiver.requestsReceived?.push(senderId);
        !receiver.followers?.includes(senderId) && receiver.followers?.push(senderId);
        await receiver.save();

        sender.requestsSent?.push(receiverId);
        !sender.following?.includes(receiverId) && sender.following?.push(receiverId);
        await sender.save();
        message = 'Friend request sent';
      }
    } else if (type === 'accept') {
      if (!receiver.requestsSent?.includes(senderId)) {
        res.status(400).json({ message: 'No friend request from this user' });
      } else {
        !receiver.following.includes(senderId) && receiver.following.push(senderId);
        !receiver.followers?.includes(senderId) && receiver.followers?.push(senderId); // should check of already there.
        receiver.requestsSent?.pull(senderId);
        receiver.friends?.push(senderId);
        await receiver.save();

        // only because we add a friend:
        const friendsPopulated = await User.findById(receiverId)
          .select('friends')
          .populate('friends', 'first_name last_name pictures')
          .lean();
        const friendsOnePicture = friendsPopulated.friends.map(friend => {
          return { ...friend, pictures: [friend.pictures[0]] };
        });
        receiver = { ...receiver._doc, friends: friendsOnePicture };

        !sender.followers?.includes(receiverId) && sender.followers?.push(receiverId);
        !sender.following?.includes(receiverId) && sender.following?.push(receiverId);
        sender.requestsReceived?.pull(receiverId);
        sender.friends?.push(receiverId);
        await sender.save();
        message = 'Friend request accepted';
      }
    } else if (type === 'cancel') {
      if (!receiver.requestsReceived?.includes(senderId)) {
        return res.status(400).json({ message: "You haven't sent this person a friend request" });
      } else {
        receiver.requestsReceived?.pull(senderId);
        receiver.followers?.pull(senderId);
        await receiver.save();

        sender.requestsSent?.pull(receiverId);
        sender.following?.pull(receiverId);
        await sender.save();
        message = 'Friend request cancelled';
      }
    } else if (type === 'reject') {
      if (!sender.requestsReceived?.includes(receiverId)) {
        return res.status(400).json({ message: 'No friend request from this user' });
      } else {
        sender.requestsReceived?.pull(receiverId);
        sender.followers?.pull(receiverId);
        await sender.save();

        receiver.requestsSent?.pull(senderId); //should not be pulled?, unless we have blocking feature (should be easy to implememt)
        receiver.following?.pull(senderId);
        await receiver.save();

        message = 'Friend request rejected';
      }
    } else if (type === 'unfriend') {
      if (!sender.friends?.includes(receiverId)) {
        return res.status(400).json({ message: "You don't have this person as a friend" });
      } else {
        sender.friends?.pull(receiverId);
        sender.following?.pull(receiverId);
        sender.followers?.pull(receiverId);
        await sender.save();

        receiver.friends?.pull(senderId);
        receiver.following?.pull(senderId); //should not be pulled?, unless we have blocking feature (should be easy to implememt)
        receiver.followers?.pull(senderId);
        await receiver.save();

        message = 'Unfriended';
      }
    } else if (type === 'follow') {
      if (receiver.followers?.includes(senderId)) {
        res.status(400).json({ message: 'You already follow this user' });
      } else {
        receiver.followers?.push(senderId);
        await receiver.save();

        sender.following?.push(receiverId);
        await sender.save();

        message = 'Follow request sent';
      }
    } else if (type === 'unfollow') {
      if (!sender.following?.includes(receiverId)) {
        res.status(400).json({ message: 'You do not follow this user' });
      } else {
        sender.following?.pull(receiverId);
        await sender.save();

        receiver.followers?.pull(senderId);
        await receiver.save();

        message = 'Unfollowed';
      }
    }

    sender = createUserObject(sender._doc).rest;
    // const updatedReceiver
    if (type !== 'accept') {
      receiver = createUserObject(receiver._doc).rest;
    }
    receiver.friendship = getFriendship(receiver, senderId);

    res.status(200).json({ message: message, data: { sender, receiver } });
  } catch (error) {
    res.json({ error: error });
  }
};

export const deleteUser = async (req, res) => {
  const { id: userId } = req.params;
  try {
    const user = await User.deleteOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.clearCookie('refresh_token', { httpOnly: true });
    res.status(200).json({ message: `User ${userId} deleted`, data: user });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error });
  }
};

export const searchUserName = async (req, res) => {
  const { term } = req.query;
  try {
    const users = await User.aggregate([
      {
        $search: {
          index: 'fullName',
          compound: {
            should: [
              {
                autocomplete: {
                  path: 'full_name',
                  query: term,
                  // fuzzy: { maxEdits: 2 },
                  score: { boost: { value: 3 } },
                },
              },
              {
                text: {
                  path: 'last_name',
                  query: term,
                  fuzzy: { maxEdits: 1 },
                  // score: { boost: { value: 3 } },
                },
              },
            ],
          },
        },
      },
      {
        $project: {
          full_name: 1,
          pictures: 1,
          score: { $meta: 'searchScore' },
          username: 1,
        },
      },
    ]);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error });
  }
};

export const getUsers = async (req, res, next) => {
  const queryString = req.query;
  const { _id } = req.query;

  const userObjectIds = _id?.split(',').map(id => ObjectId(id.trim()));
  let users;
  try {
    if (_id) {
      users = await User.find({ _id: { $in: userObjectIds } }).select(
        'full_name username pictures'
      );
    } else {
      users = await User.find({ search }); // not finished.
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
