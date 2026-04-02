const multer = require('multer');
const ApiError = require('../utils/ApiError');

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    cb(new ApiError(400, 'Only image files are allowed'));
    return;
  }

  cb(null, true);
};

const imageUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

const multiImageUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter: imageFileFilter,
});

const attachmentUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = {
  imageUpload,
  multiImageUpload,
  attachmentUpload,
};
