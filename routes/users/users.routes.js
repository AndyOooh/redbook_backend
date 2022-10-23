import express from 'express';
import {
  getUser,
  updateProfilePhoto,
  updateUser,
  friendRequest,
  deleteUser,
  createUser,
} from '../../controllers/users.controller.js';

import { isAuth } from '../../middleware/isAuth.js';
import { multiUploader } from '../../middleware/multerMulti.js';
import { singleUploader } from '../../middleware/multerSingle.js';
import usersValidator from './users.validator.js';

const router = express.Router();

// router.get('/', isAuth, getUsers);
router.post('/', usersValidator.register, createUser);
router.route('/:username').get(isAuth, getUser);
router.route('/:id').put(isAuth, updateUser).delete(deleteUser);

// router.route('/:id').delete(isAuth, deleteUser);
router.route('/:id/update-images').put(isAuth, singleUploader, updateProfilePhoto);
// router.route('/:id/update').put(isAuth, updateUser);
router.route('/friendRequest').put(isAuth, friendRequest);

export default router;
