import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { createUserObject } from './auth.helpers.js';
import { getFriendship } from './users.helpers.js';

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
      let foundUser = await User.findOne({ username: username })
        .populate('friends', 'first_name last_name username pictures')
        .lean();
      const friendship = getFriendship(foundUser, userId);
      const { id, rest } = createUserObject(foundUser); // omit ._doc bc lean()
      user = { id, friendship, ...rest };
    } else if (type === 'comment') {
      console.log('if type === comment, username: ', username);
      user = await User.findById(username)
        .select('first_name last_name username pictures gender')
        .exec();
        console.log('🚀 ~ file: users.controller.js ~ line 28 ~ user', user);
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
    console.log('error in getUser: ', error);
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

// @desc update a user document
// @route PUT /api/users/:id/update
// @access Private
export const updateUser = async (req, res, next) => {
  const { id, username } = req.user;
  const { id: profileUserId } = req.params;
  const { field } = req.query;

  if (profileUserId !== id) {
    return res.status(401).json({
      message: 'You are not authorized to update this profile',
    });
  }

  try {
    let user = await User.findById(id).exec();
    user[field] = { ...user[field], ...req.body };
    const updatedUserDetails = await user.save();

    return res
      .status(200)
      .json({ message: 'User updated successfully', userData: updatedUserDetails[field] });
  } catch (error) {
    console.log('error', error);
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
    console.log('sent to self***********');
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
        console.log('🚀 ~ file: users.controller.js ~ line 208 ~ receiver', receiver);
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
    console.log('🚀users.controller.js ~ line 303 ~ error', error);
    res.json({ error: error });
  }
};
