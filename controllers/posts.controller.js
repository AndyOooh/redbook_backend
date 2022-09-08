import { v4 as uuidv4 } from 'uuid';

// import { upload } from '../config/cloudinary.js';
import Post from '../models/post.model.js';
import { uploadToCloudinary } from '../services/cloudinary.service.js';

// TODO use asynchandler or create one
// TODO refactor if(!post)
// TODO (optional): Export all functions at the bottom of file for better overview (as in commonjs).

// @desc Create new post
// @route POST /api/posts
// @access Private
export const createPost = async (req, res, next) => {
  console.log('in createPost');
  console.log('req.body: ', req.body);
  console.log('req.files: ', req.files);
  console.log('req.file: ', req.file);

  const { text } = req.body;
  const image = JSON.parse(req.body.image);
  const { user, files } = req;
  const type = req.query.type;
  console.log('🚀 ~ file: posts.controller.js ~ line 23 ~ type', type);

  const checkedBackground = req.body.background === 'null' ? null : req.body.background;

  const postId = uuidv4();

  let images;
  try {
    if (type === 'cover' || type === 'profile') {
      images = [image]; // TODO: figure out the correct format. Maybe from request payload (ImageCropper)
    } else if (!type) {
      images = await uploadToCloudinary({ files, username: user.username, postId });
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
    res.json(post);
  } catch (error) {
    console.log('error: ', error);
  }
};

// @desc Update post
// @route PUT /api/posts:id
// @access Private
export const createComment = async (req, res, next) => {
  console.log('in createComment------------------------------------------------------');
  console.log('req.body: ', req.body);

  const { user, files } = req;
  const { text } = req.body;
  const postId = req.params.id;
  const commentId = uuidv4();

  console.log('req.params: ', req.params);
  console.log('files: ', files);

  try {
    const images = await uploadToCloudinary({ files, username: user.username, postId, commentId });

    const comment = { _id: commentId, text, images, commentBy: user.id };

    // Create comment
    const savedComment = await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment },
    });
    console.log('Post with new comment: ', savedComment);
    res.status(200).json(savedComment);
  } catch (error) {
    console.log('error: ', error);
  }
};

// @desc get all posts
// @route GET /api/posts
// @access Public
export const getPosts = async (req, res, next) => {
  console.log('in getPosts');
  let filter = {};
  console.log('req.query in getPosts: ', req.query);

  if (req.query) {
    filter = { ...filter, ...req.query };
  }

  console.log('filter: ', filter);

  try {
    const posts = await Post.find(filter)
      .populate('user', 'first_name last_name pictures username gender')
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
