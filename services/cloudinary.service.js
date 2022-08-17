import cloudinary from '../config/cloudinary.js';

const upload = async (imagePath, folder) => {
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

export const uploadToCloudinary = async (files, userId, postId, commentId) => {
  const pathArray = files.images?.map(image => image.path);

  if (!pathArray?.length > 0) {
    console.log('no images to upload');
    return;
  }

  const folder = commentId
    ? `${userId}/posts/${postId}/comments/${commentId}`
    : `${userId}/posts/${postId}`;

  let images = [];

  try {
    // Upload images to Cloudinary if any
    if (pathArray && pathArray.length > 0) {
      for (let i = 0; i < pathArray.length; i++) {
        const uploadedImages = await upload(pathArray[i], folder);
        console.log('images: ', uploadedImages);
        images.push({ url: uploadedImages.secure_url, id: uploadedImages.asset_id });
      }
    }
  } catch (error) {
    console.log('error in uploadToCloudinary: ', error);
  }
  return images;
};
