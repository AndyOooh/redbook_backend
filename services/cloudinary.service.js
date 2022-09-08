import cloudinary from '../config/cloudinary.js';
import { NODE_ENV } from '../config/VARS.js';

const upload = async (imagePath, folder) => {
  const baseFolder = NODE_ENV === 'development' ? 'redbook/development/users/' : 'redbook/users/';

  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    // folder: 'redbook/users/' + folder,

    // New after watching cloudinary video
    folder: baseFolder + folder,
    // format: 'auto',
    // quality: 'auto',
  };

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result;
  } catch (error) {
    console.log('🚀 ~ file: cloudinary.service.js ~ line 23 ~ upload ~ error', error);
  }
};

export const uploadToCloudinary = async ({ files, file, username, type, postId, commentId }) => {
  console.log('🚀 ~ file: cloudinary.service.js ~ line 28 ~ type', type);
  console.log('files in uploadToCloudinary: ', files);
  console.log('file in uploadToCloudinary: ', file);

  const numImages = files?.length;

  if (!numImages > 0 && !file) {
    // replace with error
    console.log('no images to upload');
    return;
  }

  const folder = commentId
    ? `${username}/posts/${postId}/comments/${commentId}`
    : postId
    ? `${username}/posts/${postId}`
    : type === 'profile'
    ? `${username}/profile`
    : type === 'cover'
    ? `${username}/cover`
    : ``;

  console.log('🚀 ~ file: cloudinary.service.js ~ line 41 ~ folder', folder);

  let image;
  let images = [];

  try {
    if (file) {
      console.log('single image');
      // const uploadedImage = await upload(pathArray[0], folder);
      const uploadedImage = await upload(file.path, folder);
      image = { url: uploadedImage.secure_url, id: uploadedImage.asset_id };
    } else {
      console.log('multiple images');
      const pathArray = files?.map(image => image.path);
      for (let i = 0; i < pathArray.length; i++) {
        const uploadedImages = await upload(pathArray[i], folder);
        images.push({ url: uploadedImages.secure_url, id: uploadedImages.asset_id });
      }
    }
  } catch (error) {
    console.log('error in uploadToCloudinary: ', error);
  }

  console.log('🚀 ~ file: cloudinary.service.js ~ line 75 ~ image', image);
  return file ? image : images;
};
