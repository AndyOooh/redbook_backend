import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { createUserObject } from './auth.helpers.js';

// @desc get a user
// @route GET /api/users/:id
// @access Public
export const getUser = async (req, res, next) => {
  const { username } = req.params;
  const { type } = req.query;

  try {
    let user;

    if (type === 'currentUser') {
      user = await User.findOne({ username: username })
        .select('friends following followers requestsSent requestsReceived')
        .populate('friends', 'first_name last_name pictures', {
          path: 'pictures',
          perDocumentLimit: 2,
        })
        .exec();
      // .populate({
      //   path: 'friends',
      //   // Get friends of friends - populate the 'friends' array for every friend
      //   populate: { path: 'pictures' },
      //   // Special option that tells Mongoose to execute a separate query
      //   // for each `story` to make sure we get 2 fans for each story.
      //   perDocumentLimit: 2,
      // });
    } else if (type === 'profile') {
      // const foundUser = await User.findById(userId).exec();
      const foundUser = await User.findOne({ username: username })
        .populate('friends', 'first_name last_name ')
        .populate({
          path: 'friends',
          // Get friends of friends - populate the 'friends' array for every friend
          populate: { path: 'pictures' },
          // Special option that tells Mongoose to execute a separate query
          // for each `story` to make sure we get 2 fans for each story.
          perDocumentLimit: 2,
        })
        .exec();
      if (!foundUser) {
        return res.status(404).json({
          message: 'User not found',
        });
      }
      console.log('🚀 ~ file: users.controller.js ~ line 23 ~ foundUser', foundUser);
      const { id, details, rest } = createUserObject(foundUser._doc);
      user = { id, details, ...rest };
    } else {
      // shoudl be else If (type === 'post' (name it whatever) and needs to be matched on frontend request. I belive the only other use case for now is to show in comments/posts )
      user = await User.findOne({ username: username })
        .select('first_name last_name username pictures gender')
        .exec();
    }
    res.status(200).json(user);
  } catch (error) {
    console.log('error in getUser: ', error);
    next(error);
  }
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

export const updateUser = async (req, res, next) => {
  console.log('🚀 ~ file: users.controller.js ~ line 141 ~ req.body', req.body);
  const { id, username } = req.user;
  console.log('🚀 ~ file: users.controller.js ~ line 143 ~ req.user', req.user);
  const { id: profileUserId } = req.params;
  console.log('🚀 ~ file: users.controller.js ~ line 144 ~ req.params', req.params);
  const { field } = req.query;
  console.log('🚀 ~ file: users.controller.js ~ line 147 ~ req.query', req.query);
  console.log('🚀 ~ file: users.controller.js ~ line 147 ~ field', field);

  if (profileUserId !== id) {
    return res.status(401).json({
      message: 'You are not authorized to update this profile',
    });
  }

  try {
    // const foundUser = User.findById(user.id).exec();
    // console.log('🚀 ~ file: users.controller.js ~ line 151 ~ foundUser', foundUser);
    // if (!foundUser) {
    //   return res.status(401).json({
    //     message: "User doesn't exist",
    //   });
    // }

    // the probelm is: we are overwriting details as it has nested objects. we either have to send the entire updated object (dont)
    // or we have to update the nested objects separately (do)
    // maybe spread them and use save() instead of updateOne
    // problem with the above is we dont know which properties we will update. and even if we spread the entire user document,
    // we will have to update the nested objects separately.
    // I think we need a way to iterate through the user documenet or just the detais property (in wgich case this should be a func
    // specificalyfor details - and therefore named as such)
    // we may need an advanced function. what are the ones that call themselves called? recursive?
    // the above was (temp at least) solved by using $set. later replaced by save() + spread

    let user = await User.findById(id).exec();
    user[field] = { ...user[field], ...req.body };
    const updatedUserDetails = await user.save();

    // const updatedUserDetails = await User.findOneAndUpdate(
    //   id,
    //   // have to use $set to update nested objects without overwriting the entire object.
    //   { $set: { details: { ...req.body } } },
    //   { new: true }
    // )
    //   // .exec()
    //   .select('details -_id');

    console.log(
      '🚀 ~ file: users.controller.js ~ line 162 ~ updatedUserDetails',
      updatedUserDetails[field]
    );
    return res
      .status(200)
      .json({ message: 'User updated successfully', userData: updatedUserDetails[field] });
    // return res.status(200).json({ updatedUser });
  } catch (error) {
    console.log('error', error);
  }
};

// @desc anything with friend requests: add(send), accept/reject, delete
// @route PUT /api/users/friendRequest?=type={type}
// @access Private
export const friendRequest = async (req, res, next) => {
  const { id: senderId } = req.user;
  const { body } = req;
  console.log('🚀 ~ file: users.controller.js ~ line 204 ~ body', body);
  const { receiverId } = req.body;
  const { type } = req.query;
  console.log('🚀 ~ file: users.controller.js ~ line 205 ~ type', type);
  console.log('🚀 ~ file: users.controller.js ~ line 204 ~ receiverId', receiverId);

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
    const sender = await User.findById(senderId).select(query).exec();
    const receiver = await User.findById(receiverId).select(query).exec();
    if (!receiver) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (type === 'add') {
      if (receiver.friends?.includes(senderId)) {
        res.status(400).json({ message: 'This person is already in your friends list' });
      } else if (receiver.requestsReceived?.includes(senderId)) {
        res.status(400).json({ message: "You've already requested this person" });
      } else if (sender.requestsReceived?.includes(receiverId)) {
        res.status(400).json({ message: 'This person has already sent you a friend request' });
      } else {
        receiver.requestsReceived?.push(senderId);
        receiver.followers?.push(senderId);
        await receiver.save();

        sender.requestsSent?.push(receiverId);
        sender.following?.push(receiverId);
        await sender.save();

        res.status(200).json({
          data: { requestsSent: sender.requestsSent, following: sender.following },
          message: 'Friend request sent',
        });
      }
    } else if (type === 'accept') {
      if (!receiver.requestsSent?.includes(senderId)) {
        res.status(400).json({ message: 'No friend request from this user' });
      } else {
        // receiver.requestsSent = receiver.requestsSent.filter((id) => id !== senderId);
        receiver.requestsSent?.pull(senderId);
        // receiver.followers?.push(senderId); find a way to make sure unique. Might have to do validation
        receiver.following?.push(senderId);
        receiver.friends?.push(senderId);
        await receiver.save();

        sender.requestsReceived?.pull(receiverId);
        // sender.followers?.push(receiverId); find a way to make sure unique. Might have to do validation
        sender.following?.push(receiverId);
        sender.friends?.push(receiverId);
        await sender.save();

        res.status(200).json({
          data: {
            friends: sender.friends,
            requestsReceived: sender.requestsReceived,
            followers: sender.followers,
            following: sender.following,
          },
          message: 'Friend request accepted',
        });
      }
    } else if (type === 'cancel') {
      if (!receiver.requestsReceived?.includes(senderId)) {
        res.status(400).json({ message: "You haven't sent this person a friend request" });
      } else {
        receiver.requestsReceived?.pull(senderId);
        receiver.followers?.pull(senderId);
        await receiver.save();

        sender.requestsSent?.pull(receiverId);
        sender.following?.pull(receiverId);
        await sender.save();

        res.status(200).json({
          data: {
            requestsSent: sender.requestsSent,
            following: sender.following,
          },
          message: 'Friend request cancelled',
        });
      }
    } else if (type === 'reject') {
      if (!sender.requestsReceived?.includes(receiverId)) {
        res.status(400).json({ message: 'No friend request from this user' });
      } else {
        sender.requestsReceived?.pull(receiverId);
        sender.followers?.pull(receiverId);
        await sender.save();

        // receiver.requestsSent?.pull(senderId); should not be pulled, unless we have blocking feature (should be easy to implememt)
        receiver.following?.pull(senderId);
        await receiver.save();

        res.status(200).json({
          data: {
            requestsReceived: sender.requestsReceived,
            followers: sender.followers,
          },
          message: 'Friend request rejected',
        });
      }
    } else if (type === 'unfriend') {
      if (!sender.friends?.includes(receiverId)) {
        res.status(400).json({ message: "You don't have this person as a friend" });
      } else {
        sender.friends?.pull(receiverId);
        sender.following?.pull(receiverId);
        sender.followers?.pull(receiverId);
        await sender.save();

        receiver.friends?.pull(senderId);
        // receiver.following?.pull(senderId); should not be pulled, unless we have blocking feature (should be easy to implememt)
        receiver.followers?.pull(senderId);
        await receiver.save();

        res.status(200).json({
          data: {
            friends: sender.friends,
            followers: sender.followers,
            following: sender.following,
          },
          message: 'Unfriended',
        });
      }
    } else if (type === 'follow') {
      if (receiver.followers?.includes(senderId)) {
        res.status(400).json({ message: 'You already follow this user' });
      } else {
        receiver.followers?.push(senderId);
        await receiver.save();

        sender.following?.push(receiverId);
        await sender.save();

        res.status(200).json({
          data: { following: sender.following },
          message: 'Follow request sent',
        });
      }
    } else if (type === 'unfollow') {
      if (!sender.following?.includes(receiverId)) {
        res.status(400).json({ message: 'You do not follow this user' });
      } else {
        sender.following?.pull(receiverId);
        await sender.save();

        receiver.followers?.pull(senderId);
        await receiver.save();

        res.status(200).json({
          data: { following: sender.following },
          message: 'Unfollowed',
        });
      }
    }
  } catch (error) {
    console.log('🚀users.controller.js ~ line 235 ~ error', error);
    res.json({ error: error });
  }
};
