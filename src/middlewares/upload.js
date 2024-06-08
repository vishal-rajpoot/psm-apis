import multer from 'multer';

function checkFileType(file, cb) {
  if (
    file.fieldname === 'user_selfie' ||
    file.fieldname === 'meter_image' ||
    file.fieldname === 'user_profile_image'
  ) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  } else {
    cb(null, false);
  }
}

const isUploaded = multer({
  dest: 'assets/day_details_uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

const isMda = multer({
  dest: 'assets/mda_documents_data/',
});

export { isUploaded, isMda };
