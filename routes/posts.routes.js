import express from 'express';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from '../controllers/posts.controller.js';

import { isAuth } from '../middleware/isAuth.js';
import { multiUploader } from '../config/multer.js';

const router = express.Router();

router.route('/').get(isAuth, getPosts).post(isAuth, multiUploader, createPost);

router.route('/:id').get(getPost).put(updatePost).delete(deletePost);

export default router;
