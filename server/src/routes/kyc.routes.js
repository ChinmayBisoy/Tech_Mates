const express = require('express');
const kycController = require('../controllers/kyc.controller');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const { imageUpload } = require('../middleware/upload.middleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// User KYC routes
router.post('/submit', verifyJWT, kycController.submitKYC);
router.post('/resubmit', verifyJWT, kycController.resubmitKYC);
router.get('/status', verifyJWT, kycController.getKYCStatus);

// Document upload
router.post(
  '/upload-document',
  verifyJWT,
  uploadLimiter,
  imageUpload.single('document'),
  kycController.uploadDocument
);

// Admin routes
router.get('/admin/pending', verifyJWT, requireRole('admin'), kycController.getPendingKYC);
router.post('/admin/:userId/approve', verifyJWT, requireRole('admin'), kycController.approveKYC);
router.post('/admin/:userId/reject', verifyJWT, requireRole('admin'), kycController.rejectKYC);

module.exports = router;
