const express = require('express');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const listingController = require('../controllers/listing.controller');

const router = express.Router();

router.get('/', verifyJWT, requireRole('client'), listingController.getWishlist);
router.post('/:listingId', verifyJWT, requireRole('client'), listingController.addToWishlist);
router.delete('/:listingId', verifyJWT, requireRole('client'), listingController.removeFromWishlist);

module.exports = router;
