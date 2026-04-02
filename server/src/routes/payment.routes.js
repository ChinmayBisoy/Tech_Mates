const express = require('express');
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const { fundMilestoneSchema, requestPayoutSchema } = require('../validators/payment.validator');

const router = express.Router();

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

module.exports = router;
