const express = require('express');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const subscriptionController = require('../controllers/subscription.controller');
const { createSubscriptionSchema } = require('../validators/subscription.validator');

const router = express.Router();

router.post(
  '/upgrade',
  verifyJWT,
  requireRole('developer'),
  validate(createSubscriptionSchema),
  subscriptionController.createSubscription
);

router.delete(
  '/cancel',
  verifyJWT,
  requireRole('developer'),
  subscriptionController.cancelSubscription
);

router.get(
  '/',
  verifyJWT,
  requireRole('developer'),
  subscriptionController.getSubscription
);

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  subscriptionController.handleWebhook
);

module.exports = router;
