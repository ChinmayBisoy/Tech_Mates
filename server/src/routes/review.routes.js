const express = require('express');
const reviewController = require('../controllers/review.controller');
const validate = require('../middleware/validate.middleware');
const { verifyJWT } = require('../middleware/auth.middleware');
const { submitReviewSchema } = require('../validators/review.validator');

const router = express.Router();

router.post(
  '/',
  verifyJWT,
  validate(submitReviewSchema),
  reviewController.submitReview
);

router.get('/user/:userId', reviewController.getReviewsForUser);
router.get('/listing/:listingId', reviewController.getReviewsForListing);

module.exports = router;
