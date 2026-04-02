const express = require('express');
const adminController = require('../controllers/admin.controller');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { resolveDisputeSchema } = require('../validators/purchase.validator');
const {
  banUserSchema,
  rejectListingSchema,
  analyticsQuerySchema,
} = require('../validators/admin.validator');

const router = express.Router();

router.use(verifyJWT);
router.use(requireRole('admin'));

router.get('/users', adminController.getAllUsers);

router.put('/users/:id/ban', validate(banUserSchema), adminController.banUser);

router.put('/users/:id/unban', adminController.unbanUser);

router.put('/users/:id/verify', adminController.verifyUser);

router.delete('/users/:id', adminController.deleteUser);

router.get('/listings/pending', adminController.getPendingListings);

router.put('/listings/:id/approve', adminController.approveListing);

router.put('/listings/:id/reject', validate(rejectListingSchema), adminController.rejectListing);

router.get('/disputes', adminController.getAllDisputes);

router.get('/disputes/:id', adminController.getDisputeById);

router.put('/disputes/:id/resolve', validate(resolveDisputeSchema), adminController.resolveDispute);

router.get('/analytics', validate(analyticsQuerySchema, 'query'), adminController.getPlatformAnalytics);

router.get('/analytics/revenue', adminController.getRevenueChart);

module.exports = router;
