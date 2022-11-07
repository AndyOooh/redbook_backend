import express from 'express';
import {
  getUser,
  updateProfilePhoto,
  updateUser,
  friendRequest,
  deleteUser,
  createUser,
  searchUserName,
  getUsers,
} from '../../controllers/users.controller.js';

import { isAuth } from '../../middleware/isAuth.js';
import { singleUploader } from '../../middleware/multerSingle.js';
import usersValidator from './users.validator.js';

const router = express.Router();

router.route('/search').get(isAuth, searchUserName);
router.route('/friendRequest').put(isAuth, friendRequest);
router.route('/').get(isAuth, getUsers).post(usersValidator.register, createUser);
router.route('/:username').get(isAuth, getUser);
router.route('/:id').put(isAuth, updateUser).delete(deleteUser);

// router.route('/:id').delete(isAuth, deleteUser);
router.route('/:id/update-images').put(isAuth, singleUploader, updateProfilePhoto);

export default router;
