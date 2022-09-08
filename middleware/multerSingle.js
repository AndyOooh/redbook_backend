import { multerConfig } from '../config/multer.js';

console.log('in multer SINGLE')

// export const singleUploader = multerConfig.single({ name: 'image' });
export const singleUploader = multerConfig.single('image');

