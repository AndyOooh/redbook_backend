console.log('inside app-config');
import { FRONTEND_URL } from './VARS.js';

export const corsConfig = {
  origin: [FRONTEND_URL, 'http://localhost:3001'],
  credentials: true,
};
