import express from 'express';
import { multiUploader } from '../config/multer.js';
import { getUser, getProfile, updateProfilePhoto } from '../controllers/users.controller.js';

import { isAuth } from '../middleware/isAuth.js';

const router = express.Router();

// router.route('/').get(isAuth, getPosts).post(isAuth, multiUploader, createPost);

router.route('/:id').get(getUser);
router.route('/:id/update').put(isAuth, multiUploader, updateProfilePhoto);


export default router;
