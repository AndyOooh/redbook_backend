import { multerConfig } from '../config/multer.js';

// export const multiUploader = multerConfig.fields([{ name: 'images', maxCount: 6 }]);

// Changed to array to get rid of the images field
export const multiUploader = multerConfig.array('images', 6);
