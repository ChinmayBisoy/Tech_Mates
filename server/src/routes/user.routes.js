const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { imageUpload } = require('../middleware/upload.middleware');
const { updateProfileSchema, searchDeveloperSchema } = require('../validators/user.validator');

const router = express.Router();

router.get('/search', validate(searchDeveloperSchema, 'query'), userController.searchDevelopers);
router.get('/me', verifyJWT, userController.getMyProfile);
router.get('/:id', userController.getPublicProfile);

router.put(
  '/me',
  verifyJWT,
  validate(updateProfileSchema),
  userController.updateProfile
);

router.post(
  '/me/avatar',
  verifyJWT,
  uploadLimiter,
  imageUpload.single('avatar'),
  userController.uploadAvatar
);

router.get(
  '/me/dashboard',
  verifyJWT,
  userController.getDashboard
);

module.exports = router;
