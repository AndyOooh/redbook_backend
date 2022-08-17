import express from 'express';
import { getUser } from '../controllers/users.controller.js';

import { isAuth } from '../middleware/isAuth.js';
// import { multiUploader } from '../config/multer.js';

const router = express.Router();

// router.route('/').get(isAuth, getPosts).post(isAuth, multiUploader, createPost);

router.route('/:id').get(getUser);

export default router;
