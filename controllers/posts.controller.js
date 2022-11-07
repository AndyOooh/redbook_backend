import { v4 as uuidv4 } from 'uuid';

// import { upload } from '../config/cloudinary.js';
import mongoose from 'mongoose';
import { Post } from '../models/post.model.js';
import { Reaction } from '../models/reaction.model.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';
import { Comment } from '../models/comment.model.js';
// import { Reaction } from '../models/reaction.model.js';
const { ObjectId } = mongoose.Types;

// TODO use asynchandler or create one
// TODO refactor if(!post)
// TODO (optional): Export all functions at the bottom of file for better overview (as in commonjs).

// @desc Create new post
// @route POST /api/posts
// @access Private
export const createPost = async (req, res, next) => {
  const { text } = req.body;
  const { user, files } = req;
  const type = req.query.type;

  const checkedBackground = req.body.background === 'null' ? null : req.body.background;

  // const postId = uuidv4();
  const postId = new ObjectId();

  let images;
  try {
    if (type === 'cover' || type === 'profile') {
      images = [JSON.parse(req.body.image)]; // TODO: figure out the correct format. Maybe from request payload (ImageCropper)
    } else if (type === 'feed') {
      images = await uploadToCloudinary({
        files,
        username: user.username,
        postId: postId.toString(),
      });
    }

    // Create post
    const post = await new Post({
      text,
      type,
      _id: postId,
      user: user.id,
      images: images,
      background: checkedBackground,
    }).save();
    console.log('New post: ', post);
    res.json({ message: 'Post created successfully' });
  } catch (error) {
    console.log('error: ', error);
  }
};

// @desc get all posts
// @route GET /api/posts
// @access Public
export const getPosts = async (req, res, next) => {
  let filter = {};
  console.log('req.query in getPosts: ', req.query);

  // filter should be an object simialr to {user: user._id}, where _id corresponds to the user id in MongoDb.
  if (req.query) {
    filter = { ...filter, ...req.query };
  }

  console.log('filter: ', filter);

  try {
    const posts = await Post.find(filter)
      .populate('user', 'first_name last_name pictures covers username gender')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'first_name last_name pictures',
          perDocumentLimit: 1,
          // limit: {
          //   path: 'comments.pictures',
          // },
        },
      })
      // .populate('comments')
      // .populate('comments.user', 'first_name last_name pictures')
      .populate('reactions')
      .sort({ createdAt: -1 })
      .exec();
    const { _id: id, ...rest } = posts;
    res.status(200).json(posts);
  } catch (error) {
    next(error);
  }
};

// @desc get one post
// @route GET /api/posts:id
// @access Public
export const getPost = async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.status = 404;
      throw error; //WHYYYYY not next(error)? We are in async
      // next(error);
    }
    res.status(200).json({ post });
  } catch (error) {
    console.log('error: ', error);
    error.message = 'Post not found 2';
    next(error);
  }
};

// @desc Delete post
// @route DELETE /api/posts:id
// @access Private
export const deletePost = async (req, res, next) => {
  const { id: userId } = req.user;
  const postId = req.params.id;
  console.log('🚀 ~ file: posts.controller.js ~ line 134 ~ userId', userId);
  try {
    const postToDelete = await Post.findById(postId);
    console.log('🚀 ~ file: posts.controller.js ~ line 137 ~ postToDelete', postToDelete);
    if (!postToDelete) {
      const error = new Error('Post not found');
      error.status = 404;
      throw error; //WHYYYYY not next(error)? We are in async
      // next(error);
    } else if (postToDelete.user != userId) {
      // not type checking bc userId is string.
      const error = new Error('Unauthorized');
      error.status = 401;
      throw error;
    }
    await Post.deleteOne({ _id: postId });
    res.status(200).json({ message: 'Deleted post', post: postToDelete });
  } catch (error) {
    console.log('🚀 deletePost error: ', error);
    next(error);
  }
};

export const createPostReaction = async (req, res, next) => {
  console.log('🚀 createPostReaction req.body');
  const { id: userId } = req.user;
  const { type } = req.body;
  const { id: postId } = req.params;
  console.log('🚀 ~ file: posts.controller.js ~ line 156 ~ postId', postId);
  console.log('🚀 ~ file: posts.controller.js ~ line 153 ~ reaction', type);

  try {
    const existingReaction = await Reaction.findOne({ post: postId, user: userId });
    console.log('🚀 ~ file: posts.controller.js ~ line 161 ~ existingReaction', existingReaction);
    if (existingReaction) {
      if (existingReaction.type === type) {
        await Reaction.deleteOne({ _id: existingReaction._id });
        return res.status(200).json({ message: 'Reaction deleted' });
      } else {
        // have to add the runValidators option to make sure the type is one of the enum values when not using document.save().
        await Reaction.updateOne(
          { _id: existingReaction._id }, // where
          { type: type }, // what to update
          { runValidators: true } // options
        );
        return res.status(200).json({ message: 'Reaction updated' });
      }
    }

    const newReaction = await Reaction.create({
      type: type,
      post: postId,
      user: userId,
    });

    const post = await Post.findById(postId);
    post.reactions.push(newReaction._id);
    await post.save();

    res.status(200).json({ message: 'Reaction created' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Reaction not created' });
    console.log('error: ', error);
  }
};

// @desc Update post
// @route PUT /api/posts:id
// @access Private
export const createComment = async (req, res, next) => {
  const { user, files } = req;
  const { text } = req.body;
  const postId = req.params.id;
  const commentId = new ObjectId();

  // create comment model. make sure to delete comments on delet post and user. also, populate comment when getting post/posts <-- maybe this can be set with hook?

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const images = await uploadToCloudinary({
      files,
      username: user.username,
      postId,
      commentId: commentId.toString(),
    });

    const comment = { _id: commentId, text, images, user: user.id, post: postId };
    const newComment = await Comment.create(comment);

    post.comments.unshift(comment._id);
    const savedPost = await post.save();



    res.status(200).json({ message: 'Comment created successfully', savedPost });
  } catch (error) {
    console.log('error: ', error);
  }
};

export const deleteComment = async (req, res) => {
  const { id: postId, commentId } = req.params;
  const { id: userId } = req.user;

  try {
    const post = await Post.findById(postId).populate('comments');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = post.comments.find(comment => {
      return comment._id == commentId;
    });
    if (comment.user != userId || !comment) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    post.comments.filter(comment => comment != commentId); // shallow comparison again. Should be fine for now.
    await post.save();

    await Comment.deleteOne({ _id: commentId });

    res.status(200).json({ message: 'Comment deleted successfully', post });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong. Comment not deleted' });
    console.log('error: ', error);
  }
};
