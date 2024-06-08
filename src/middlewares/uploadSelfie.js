import multer from 'multer';
import isUploaded from './upload';

const uploadImage = (req, res, next) => {
  isUploaded.fields([{ name: 'user_profile_image', maxCount: 1 }])(
    req,
    res,
    (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          req.file = null;
          next();
        } else {
          return res
            .status(400)
            .json({ error: 'Multer Error', message: err.message });
        }
      } else if (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      next();
    }
  );
};

export default uploadImage;
