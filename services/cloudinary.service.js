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

  let image;
  let images = [];

  try {
    if (file) {
      const uploadedImage = await upload(file.path, folder);
      image = { url: uploadedImage.secure_url, id: uploadedImage.asset_id };
    } else {
      const pathArray = files?.map(image => image.path);
      for (let i = 0; i < pathArray.length; i++) {
        const uploadedImages = await upload(pathArray[i], folder);
        images.push({ url: uploadedImages.secure_url, id: uploadedImages.asset_id });
      }
    }
  } catch (error) {
    console.log('error in uploadToCloudinary: ', error);
  }
  return file ? image : images;
};
