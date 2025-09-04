// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const multer = require('multer');

// // Check if environment variables are loaded
// // console.log('Environment check:');
// // console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing');
// // console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
// // console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Validate configuration
// if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
//   throw new Error('Missing Cloudinary environment variables. Please check your .env file.');
// }

// // Test cloudinary connection
// const testCloudinaryConnection = () => {
//   return new Promise((resolve, reject) => {
//     cloudinary.api.ping((error, result) => {
//       if (error) {
//         console.error('Cloudinary connection failed:', error);
//         reject(error);
//       } else {
//         console.log('Cloudinary connected successfully:', result);
//         resolve(result);
//       }
//     });
//   });
// };

// // Call test on startup
// testCloudinaryConnection().catch(console.error);

// // Configure storage for dishes
// const dishStorage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'foodApp/dishes',
//     allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//     transformation: [{ quality: 'auto', fetch_format: 'auto' }],
//     public_id: (req, file) => {
//       const timestamp = Date.now();
//       const random = Math.round(Math.random() * 1E9);
//       return `dish_${timestamp}_${random}`;
//     }
//   }
// });

// // Configure storage for restaurants
// const restaurantStorage = new CloudinaryStorage({
//   cloudinary,
//   params: (req, file) => {
//     let folder = 'foodApp/restaurants';
//     let publicId = `restaurant_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    
//     // Different folders based on file field
//     if (file.fieldname === 'logo') {
//       folder = 'foodApp/restaurants/logos';
//       publicId = `logo_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
//     } else if (file.fieldname === 'coverImage') {
//       folder = 'foodApp/restaurants/covers';
//       publicId = `cover_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
//     }

//     return {
//       folder,
//       allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
//       transformation: [{ quality: 'auto', fetch_format: 'auto' }],
//       public_id: publicId
//     };
//   }
// });

// // File filter function
// const fileFilter = (req, file, cb) => {
//   console.log('File filter - Field name:', file.fieldname);
//   console.log('File filter - Original name:', file.originalname);
//   console.log('File filter - Mimetype:', file.mimetype);
  
//   // Check file type
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     const error = new Error('Only image files are allowed!');
//     error.code = 'INVALID_FILE_TYPE';
//     cb(error, false);
//   }
// };

// // Configure multer for single file upload (dishes)
// const uploadSingle = multer({
//   storage: dishStorage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//     files: 1 // Only allow 1 file
//   },
//   fileFilter
// });

// // Configure multer for multiple files (restaurants)
// const uploadMultiple = multer({
//   storage: restaurantStorage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit per file
//     files: 2 // Allow only 2 files (logo + coverImage)
//   },
//   fileFilter
// });

// // Error handling middleware for multer
// const handleMulterError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     console.error('Multer error:', err);
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ message: 'File too large (max 5MB)' });
//     }
//     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//       return res.status(400).json({ 
//         message: `Unexpected field name: ${err.field}. Expected: image, logo, or coverImage` 
//       });
//     }
//     if (err.code === 'LIMIT_FILE_COUNT') {
//       return res.status(400).json({ message: 'Too many files. Maximum 2 files allowed (logo and coverImage).' });
//     }
//   }
  
//   if (err.code === 'INVALID_FILE_TYPE') {
//     return res.status(400).json({ message: err.message });
//   }
  
//   next(err);
// };

// // Export different upload configurations
// module.exports = { 
//   cloudinary,
//   upload: uploadSingle, // For dishes (single file)
//   uploadMultiple, // For restaurants (multiple files)
//   handleMulterError,
//   // Specific upload methods
//   single: (fieldName) => uploadSingle.single(fieldName),
//   fields: (fieldsArray) => uploadMultiple.fields(fieldsArray)
// };
// 📁 config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables. Please check your .env file.');
}

const testCloudinaryConnection = () => {
  return new Promise((resolve, reject) => {
    cloudinary.api.ping((error, result) => {
      if (error) {
        console.error('Cloudinary connection failed:', error);
        reject(error);
      } else {
        console.log('Cloudinary connected successfully:', result);
        resolve(result);
      }
    });
  });
};
testCloudinaryConnection().catch(console.error);

const dishStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'foodApp/dishes',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    public_id: (req, file) => `dish_${Date.now()}_${Math.round(Math.random() * 1E9)}`
  }
});

const restaurantStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    let folder = 'foodApp/restaurants';
    let publicId = `restaurant_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    if (file.fieldname === 'logo') {
      folder = 'foodApp/restaurants/logos';
      publicId = `logo_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    } else if (file.fieldname === 'coverImage') {
      folder = 'foodApp/restaurants/covers';
      publicId = `cover_${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    }
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      public_id: publicId
    };
  }
});

const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'foodApp/reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    public_id: (req, file) => `review_${Date.now()}_${Math.round(Math.random() * 1E9)}`
  }
});

const fileFilter = (req, file, cb) => {
  console.log('File filter - Field name:', file.fieldname);
  console.log('File filter - Original name:', file.originalname);
  console.log('File filter - Mimetype:', file.mimetype);

  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    const error = new Error('Only image files are allowed!');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

const uploadSingle = multer({
  storage: dishStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter
});

const uploadMultiple = multer({
  storage: restaurantStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter
});

const uploadReviewImages = multer({
  storage: reviewStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: `Unexpected field name: ${err.field}. Expected: image, logo, or coverImage` });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum 2 files allowed (logo and coverImage).' });
    }
  }

  if (err.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({ message: err.message });
  }

  next(err);
};

module.exports = {
  cloudinary,
  upload: uploadSingle,
  uploadMultiple,
  uploadReviewImages,
  handleMulterError,
  single: (fieldName) => uploadSingle.single(fieldName),
  fields: (fieldsArray) => uploadMultiple.fields(fieldsArray)
};
