const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY, 
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET 
});

const uploadToCloudinary = async (req, res, next) => {
    if (!req.file) {
      return res.status(400).send('No files were uploaded. Try uploading an image');
    }
  
    const file = req.file;
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'profile-photos', // Specify the folder in Cloudinary where you want to store the images
    });
  
    if (result.url && result.public_id) {
      req.file.cloudinaryUrl = result.url;
      req.file.public_id = result.public_id;
    } else {
      res.status(400).send('Failed to upload image');
    }
  
    next();
  };


module.exports = uploadToCloudinary