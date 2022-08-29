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
    format: 'auto',
    quality: 'auto',
  };

  try {
    const result = await cloudinary.uploader.upload(imagePath, options);
    return result;
  } catch (error) {
    console.log('error: ', error);
  }
};

export const uploadToCloudinary = async ({ files, username, type, postId, commentId }) => {
  console.log('files in cloidiagry: ', files);
  const pathArray = files.images?.map(image => image.path);

  if (!pathArray?.length > 0) {
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

  let images = [];

  try {
    // Upload images to Cloudinary if any
    if (pathArray && pathArray.length > 0) {
      for (let i = 0; i < pathArray.length; i++) {
        const uploadedImages = await upload(pathArray[i], folder);
        console.log('images: ', uploadedImages);
        // images.push({ url: uploadedImages.secure_url, id: uploadedImages.asset_id });
        images.push(uploadedImages);
      }
    }
  } catch (error) {
    console.log('error in uploadToCloudinary: ', error);
  }
  return images;
};
