const express = require('express');
const walletController = require('../controllers/wallet.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// All routes require authentication
router.use(verifyJWT);

router.get('/', asyncHandler(walletController.getWallet));

router.get('/transactions', asyncHandler(walletController.getTransactions));

router.post(
  '/transaction',
  asyncHandler(walletController.createTransaction)
);

router.post(
  '/withdraw',
  asyncHandler(walletController.requestWithdrawal)
);

router.post(
  '/deposit',
  asyncHandler(walletController.depositFunds)
);

module.exports = router;
