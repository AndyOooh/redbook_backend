import express from 'express';
import {
  getUser,
  // getProfile,
  updateProfilePhoto,
  updateUser,
  friendRequest,
  deleteUser,
} from '../controllers/users.controller.js';

import { isAuth } from '../middleware/isAuth.js';
import { multiUploader } from '../middleware/multerMulti.js';
import { singleUploader } from '../middleware/multerSingle.js';

const router = express.Router();

// router.route('/:id').delete(isAuth, deleteUser);
router.route('/:id').delete(deleteUser);
router.route('/:username').get(isAuth, getUser);
router.route('/:id/update-images').put(isAuth, singleUploader, updateProfilePhoto);
router.route('/:id/update').put(isAuth, updateUser);
router.route('/friendRequest').put(isAuth, friendRequest);

export default router;
