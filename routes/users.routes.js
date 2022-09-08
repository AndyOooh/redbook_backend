import express from 'express';
import { getUser, getProfile, updateProfilePhoto } from '../controllers/users.controller.js';

import { isAuth } from '../middleware/isAuth.js';
import { multiUploader } from '../middleware/multerMulti.js';
import { singleUploader } from '../middleware/multerSingle.js';

const router = express.Router();

// router.route('/').get(isAuth, getPosts).post(isAuth, multiUploader, createPost);

router.route('/:id').get(getUser);
// router.route('/:id/update').put(isAuth, multiUploader, updateProfilePhoto);
router.route('/:id/update').put(isAuth, singleUploader, updateProfilePhoto);


export default router;

