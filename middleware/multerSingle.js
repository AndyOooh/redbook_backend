import { multerConfig } from '../config/multer.js';

export const singleUploader = multerConfig.single('image');

