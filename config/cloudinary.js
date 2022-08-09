import { v2 as cloudinary } from 'cloudinary';

import { CLOUD_API_KEY, CLOUD_API_SECRET, CLOUD_NAME } from './VARS.js';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

// export default cloudinary;

export const uploadToCloudinary = async (imagePath, folder) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,

    folder: 'redbook/users/' + folder,
  };

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result;
  } catch (error) {
    console.log('error: ', error);
  }
};
