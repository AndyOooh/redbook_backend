import express from 'express';

import authRoutes from './auth/auth.routes.js';
import postsRoutes from './posts.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);

export default router;
