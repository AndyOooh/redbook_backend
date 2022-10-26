import express from 'express';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  createComment,
  createPostReaction,
  // updateComment,
  deleteComment,
} from '../controllers/posts.controller.js';
// import { createPostReaction } from '../controllers/reactions.controller.js';

import { isAuth } from '../middleware/isAuth.js';
import { multiUploader } from '../middleware/multerMulti.js';

const router = express.Router();

router.route('/').get(isAuth, getPosts).post(isAuth, multiUploader, createPost);

router.route('/:id').get(getPost).put(isAuth, multiUploader, createComment).delete(isAuth, deletePost);
router.route('/:id/:commentId')
// .put(isAuth, updateComment)
.delete(isAuth, deleteComment);

router.route('/:id/reaction').post(isAuth, createPostReaction);

export default router;
