import express from 'express';

import authRoutes from './auth/auth.routes.js';
import postsRoutes from './posts.routes.js';
import usersRoutes from './users/users.routes.js';

const router = express.Router();

router.use('/', authRoutes);
router.use('/posts', postsRoutes);
router.use('/users', usersRoutes);

export default router;
