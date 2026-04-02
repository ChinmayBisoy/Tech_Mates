const express = require('express');
const listingController = require('../controllers/listing.controller');
const validate = require('../middleware/validate.middleware');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const { isPro } = require('../middleware/isPro.middleware');
const { createListingSchema, updateListingSchema } = require('../validators/listing.validator');

const router = express.Router();

router.get('/', listingController.getListings);
router.get('/my', verifyJWT, requireRole('developer'), listingController.getMyListings);
router.get('/pending', verifyJWT, requireRole('admin'), listingController.getPendingListings);
router.get('/:slug', listingController.getListingBySlug);

router.post(
  '/',
  verifyJWT,
  requireRole('developer'),
  isPro,
  validate(createListingSchema),
  listingController.createListing
);

router.put(
  '/:id',
  verifyJWT,
  requireRole('developer'),
  validate(updateListingSchema),
  listingController.updateListing
);

router.delete(
  '/:id',
  verifyJWT,
  requireRole('developer'),
  listingController.deleteListing
);

router.put(
  '/:id/submit-review',
  verifyJWT,
  requireRole('developer'),
  isPro,
  listingController.submitForReview
);

router.put(
  '/:id/approve',
  verifyJWT,
  requireRole('admin'),
  listingController.adminApproveListing
);

router.put(
  '/:id/reject',
  verifyJWT,
  requireRole('admin'),
  listingController.adminRejectListing
);

module.exports = router;
