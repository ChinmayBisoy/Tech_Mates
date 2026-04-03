const express = require('express');
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const { fundMilestoneSchema, requestPayoutSchema } = require('../validators/payment.validator');

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Payment routes working!', timestamp: new Date() });
});

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

router.post(
  '/fund-milestone',
  verifyJWT,
  requireRole('client'),
  validate(fundMilestoneSchema),
  paymentController.fundMilestone
);

router.post(
  '/release-milestone',
  verifyJWT,
  requireRole('client'),
  validate(fundMilestoneSchema),
  paymentController.releaseMilestone
);

router.post(
  '/refund-milestone',
  verifyJWT,
  requireRole('admin'),
  validate(fundMilestoneSchema),
  paymentController.refundMilestone
);

router.get(
  '/earnings',
  verifyJWT,
  requireRole('developer'),
  paymentController.getEarnings
);

router.post(
  '/payout',
  verifyJWT,
  requireRole('developer'),
  validate(requestPayoutSchema),
  paymentController.requestPayout
);

// Withdrawal endpoints (Transaction 2: Developer → Bank)
router.post(
  '/withdrawal/initiate',
  verifyJWT,
  requireRole('developer'),
  paymentController.initiateWithdrawal
);

router.get(
  '/withdrawal/history',
  verifyJWT,
  paymentController.getWithdrawalHistory
);

// Payment verification endpoints
router.post(
  '/verify-milestone',
  verifyJWT,
  paymentController.verifyMilestonePayment
);

// Transaction history
router.get(
  '/transactions/history',
  verifyJWT,
  paymentController.getTransactionHistory
);

// Admin withdrawal management
router.post(
  '/admin/withdrawal/:withdrawalId/process',
  verifyJWT,
  requireRole('admin'),
  paymentController.processWithdrawal
);

router.post(
  '/admin/withdrawal/:withdrawalId/cancel',
  verifyJWT,
  requireRole('admin'),
  paymentController.cancelWithdrawal
);

module.exports = router;
