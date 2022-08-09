import { v4 as uuidv4 } from 'uuid';

import { uploadToCloudinary } from '../config/cloudinary.js';
import Post from '../models/post.model.js';

// TODO use asynchandler or create one
// TODO refactor if(!post)
// TODO (optional): Export all functions at the bottom of file for better overview (like in commonjs).

// @desc Create new post
// @route POST /api/posts
// @access Private
export const createPost = async (req, res, next) => {
  console.log('in createPost');
  console.log('req.body: ', req.body);
  console.log('req.files: ', req.files);
  console.log('req.file: ', req.file);
  console.log('req.user: ', req.user);

  const { user } = req;

  const postId = uuidv4();
  console.log('postId: ', postId);

  try {
    const pathArray = req.files?.images?.map(image => image.path);

    const folder = `${user.id}/posts/${postId}`;
    let images = [];

    // Upload images to Cloudinary
    if (pathArray && pathArray.length > 0) {
      for (let i = 0; i < pathArray.length; i++) {
        const result = await uploadToCloudinary(pathArray[i], folder);
        images.push(result.secure_url);
      }
    }
    console.log('images: ', images);

    // Create post
    const post = await new Post({ ...req.body, _id: postId, user: user.id, images: images }).save(); 
    console.log('poståååååååååååååååååååå: ', post);
    res.json(post);
  } catch (error) {
    console.log('error: ', error);
  }
};

// @desc get all posts
// @route GET /api/posts
// @access Public
export const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({});
    res.status(200).json({ posts });
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

// @desc Update post
// @route PUT /api/posts:id
// @access Private
export const updatePost = async (req, res, next) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(postId, {
      title,
      content,
    });
    if (!post) {
      const error = new Error('Post not found');
      error.status = 404;
      throw error; //WHYYYYY not next(error)? We are in async
      // next(error);
    }
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};

// @desc Delete post
// @route DELETE /api/posts:id
// @access Private
export const deletePost = async (req, res, next) => {
  const postId = req.params.id;
  try {
    const post = await Post.findByIdAndDelete(postId);
    if (!post) {
      const error = new Error('Post not found');
      error.status = 404;
      throw error; //WHYYYYY not next(error)? We are in async
      // next(error);
    }
    res.status(200).json({ post });
  } catch (error) {
    next(error);
  }
};
