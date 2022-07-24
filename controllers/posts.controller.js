import Post from '../models/post.model.js';

// TODO use asynchandler or create one
// TODO refactor if(!post)
// TODO (optional): Export all functions at the bottom of file for better overview (like in commonjs).

// @desc Create new post
// @route POST /api/posts
// @access Private
export const createPost = async (req, res, next) => {
  console.log('req.body: ', req.body);
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400);
    const error = new Error('Title and content are required');
    next(error);
  }
  const createdPost = await Post.create({
    title,
    content,
    // user: req.user._id,
  });

  return res.status(201).json({
    message: 'Post created successfully',
    data: createdPost,
  });
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
