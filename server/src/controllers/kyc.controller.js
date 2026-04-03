const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Submit KYC verification with personal info and documents
 * @route POST /api/kyc/submit
 */
const submitKYC = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    address,
    city,
    state,
    zipCode,
    country = 'India',
    phone,
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !dateOfBirth || !address || !city || !state || !zipCode || !phone) {
    throw new ApiError(400, 'All personal information fields are required');
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Initialize KYC if not exists
  if (!user.kyc) {
    user.kyc = {
      status: 'pending',
      personalInfo: {},
      documents: {},
    };
  }

  // Update personal info
  user.kyc.personalInfo = {
    firstName,
    lastName,
    dateOfBirth: new Date(dateOfBirth),
    gender,
    address,
    city,
    state,
    zipCode,
    country,
    phone,
  };

  // Check if all documents are uploaded
  const hasAllDocuments =
    user.kyc.documents?.pan?.url &&
    user.kyc.documents?.aadhar?.url &&
    user.kyc.documents?.selfie?.url &&
    user.kyc.documents?.addressProof?.url;

  if (!hasAllDocuments) {
    throw new ApiError(400, 'All documents (PAN, Aadhar, Selfie, Address Proof) are required');
  }

  // Mark as submitted
  user.kyc.status = 'submitted';
  user.kyc.submittedAt = new Date();

  // Save user
  await user.save();

  res.json(
    new ApiResponse(200, { kycStatus: user.kyc.status }, 'KYC submitted successfully. Admin will review soon.')
  );
});

/**
 * Save KYC personal information (Step 1 - Draft)
 * @route POST /api/kyc/save-personal-info
 */
const savePersonalInfo = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    address,
    city,
    state,
    zipCode,
    country = 'India',
    phone,
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !dateOfBirth || !address || !city || !state || !zipCode || !phone) {
    throw new ApiError(400, 'All personal information fields are required');
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Initialize KYC if not exists
  if (!user.kyc) {
    user.kyc = {
      status: 'pending',
      personalInfo: {},
      documents: {},
    };
  }

  // Update personal info (keep status as 'pending' until all documents are uploaded)
  user.kyc.personalInfo = {
    firstName,
    lastName,
    dateOfBirth: new Date(dateOfBirth),
    gender,
    address,
    city,
    state,
    zipCode,
    country,
    phone,
  };

  // Save user
  await user.save();

  res.json(
    new ApiResponse(200, { 
      personalInfo: user.kyc.personalInfo,
      status: 'pending' 
    }, 'Personal information saved successfully. Please proceed to upload documents.')
  );
});

/**
 * Upload a single KYC document
 * @route POST /api/kyc/upload-document
 */
const uploadDocument = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { documentType } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'Document file is required');
  }

  if (!['pan', 'aadhar', 'selfie', 'addressProof'].includes(documentType)) {
    throw new ApiError(400, 'Invalid document type. Must be one of: pan, aadhar, selfie, addressProof');
  }

  // Validate file size (max 5MB)
  if (req.file.size > 5 * 1024 * 1024) {
    throw new ApiError(400, 'File size must not exceed 5MB');
  }

  // Validate file type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!allowedMimes.includes(req.file.mimetype)) {
    throw new ApiError(400, 'Only JPEG, JPG, and PNG images are allowed');
  }

  try {
    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `kyc/${userId}`,
      resource_type: 'auto',
    });

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Initialize KYC if not exists
    if (!user.kyc) {
      user.kyc = {
        status: 'pending',
        personalInfo: {},
        documents: {},
      };
    }

    // Update document
    if (!user.kyc.documents) {
      user.kyc.documents = {};
    }

    user.kyc.documents[documentType] = {
      url: result.secure_url,
      uploadedAt: new Date(),
    };

    // Save user
    await user.save();

    res.json(
      new ApiResponse(200, { documentUrl: result.secure_url }, `${documentType} uploaded successfully`)
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to upload document to cloud storage');
  }
});

/**
 * Get KYC verification status
 * @route GET /api/kyc/status
 */
const getKYCStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select('kyc');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const kycStatus = user.kyc || {
    status: 'pending',
    personalInfo: {},
    documents: {},
  };

  res.json(
    new ApiResponse(200, kycStatus, 'KYC status fetched successfully')
  );
});

/**
 * Get all pending KYC submissions (Admin only)
 * @route GET /api/admin/kyc/pending
 */
const getPendingKYC = asyncHandler(async (req, res) => {
  const users = await User.find({ 'kyc.status': 'submitted' })
    .select('_id name email kyc createdAt')
    .sort({ 'kyc.submittedAt': -1 });

  res.json(
    new ApiResponse(200, users, 'Pending KYC submissions fetched successfully')
  );
});

/**
 * Approve KYC verification (Admin only)
 * @route POST /api/admin/kyc/:userId/approve
 */
const approveKYC = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.kyc) {
    throw new ApiError(400, 'User has not submitted KYC');
  }

  if (user.kyc.status !== 'submitted') {
    throw new ApiError(400, `Cannot approve KYC with status: ${user.kyc.status}`);
  }

  user.kyc.status = 'verified';
  user.kyc.verifiedAt = new Date();

  await user.save();

  res.json(
    new ApiResponse(200, { kycStatus: 'verified' }, 'KYC verified successfully')
  );
});

/**
 * Reject KYC verification (Admin only)
 * @route POST /api/admin/kyc/:userId/reject
 */
const rejectKYC = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.kyc) {
    throw new ApiError(400, 'User has not submitted KYC');
  }

  if (user.kyc.status !== 'submitted') {
    throw new ApiError(400, `Cannot reject KYC with status: ${user.kyc.status}`);
  }

  user.kyc.status = 'rejected';
  user.kyc.rejectionReason = reason;
  user.kyc.rejectedAt = new Date();

  await user.save();

  res.json(
    new ApiResponse(200, { kycStatus: 'rejected', reason }, 'KYC rejected and user notified')
  );
});

/**
 * Resubmit KYC after rejection
 * @route POST /api/kyc/resubmit
 */
const resubmitKYC = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    address,
    city,
    state,
    zipCode,
    country = 'India',
    phone,
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !dateOfBirth || !address || !city || !state || !zipCode || !phone) {
    throw new ApiError(400, 'All personal information fields are required');
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.kyc || user.kyc.status !== 'rejected') {
    throw new ApiError(400, 'KYC is not in rejected state');
  }

  // Update personal info
  user.kyc.personalInfo = {
    firstName,
    lastName,
    dateOfBirth: new Date(dateOfBirth),
    gender,
    address,
    city,
    state,
    zipCode,
    country,
    phone,
  };

  // Check if all documents are uploaded
  const hasAllDocuments =
    user.kyc.documents?.pan?.url &&
    user.kyc.documents?.aadhar?.url &&
    user.kyc.documents?.selfie?.url &&
    user.kyc.documents?.addressProof?.url;

  if (!hasAllDocuments) {
    throw new ApiError(400, 'All documents (PAN, Aadhar, Selfie, Address Proof) are required');
  }

  // Reset status to submitted
  user.kyc.status = 'submitted';
  user.kyc.submittedAt = new Date();
  user.kyc.rejectionReason = null;
  user.kyc.rejectedAt = null;

  // Save user
  await user.save();

  res.json(
    new ApiResponse(200, { kycStatus: 'submitted' }, 'KYC resubmitted successfully. Admin will review soon.')
  );
});

module.exports = {
  submitKYC,
  savePersonalInfo,
  uploadDocument,
  getKYCStatus,
  getPendingKYC,
  approveKYC,
  rejectKYC,
  resubmitKYC,
};
