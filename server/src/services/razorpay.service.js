const razorpay = require('../config/razorpay');
const ApiError = require('../utils/ApiError');
const crypto = require('crypto');

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in paise
 * @param {object} metadata - Custom metadata
 * @returns {object} Razorpay order details
 */
const createOrder = async (amount, metadata = {}) => {
  try {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ApiError(400, 'Amount must be a positive integer in paise');
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: metadata,
    });

    console.log('[RazorpayService] Order created:', order.id);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      createdAt: order.created_at,
    };
  } catch (error) {
    console.error('[RazorpayService] Order creation failed:', error);
    throw new ApiError(500, `Failed to create Razorpay order: ${error.message}`);
  }
};

/**
 * Verify payment signature
 * @param {string} razorpayOrderId - Order ID from Razorpay
 * @param {string} razorpayPaymentId - Payment ID from Razorpay
 * @param {string} razorpaySignature - Signature from Razorpay
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    console.log('[RazorpayService] Signature verification:');
    console.log('  Expected:', expectedSignature);
    console.log('  Received:', razorpaySignature);

    const isValid = expectedSignature === razorpaySignature;
    console.log('  Valid:', isValid);

    return isValid;
  } catch (error) {
    console.error('[RazorpayService] Signature verification error:', error);
    return false;
  }
};

/**
 * Fetch payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {object} Payment details
 */
const fetchPayment = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    console.log('[RazorpayService] Payment fetched:', paymentId);

    return {
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      description: payment.description,
      notes: payment.notes,
      createdAt: payment.created_at,
    };
  } catch (error) {
    console.error('[RazorpayService] Payment fetch failed:', error);
    throw new ApiError(500, `Failed to fetch payment: ${error.message}`);
  }
};

/**
 * Capture payment (authorize and capture)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to capture in paise
 * @returns {object} Captured payment details
 */
const capturePayment = async (paymentId, amount) => {
  try {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ApiError(400, 'Amount must be a positive integer in paise');
    }

    const payment = await razorpay.payments.capture(paymentId, amount);
    console.log('[RazorpayService] Payment captured:', paymentId);

    return {
      paymentId: payment.id,
      orderId: payment.order_id,
      amount: payment.amount,
      status: payment.status,
    };
  } catch (error) {
    console.error('[RazorpayService] Payment capture failed:', error);
    throw new ApiError(500, `Failed to capture payment: ${error.message}`);
  }
};

/**
 * Create refund for payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paise (optional, full refund if not provided)
 * @returns {object} Refund details
 */
const createRefund = async (paymentId, amount = null) => {
  try {
    const payload = {
      payment_id: paymentId,
    };

    if (amount) {
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new ApiError(400, 'Refund amount must be a positive integer in paise');
      }
      payload.amount = amount;
    }

    const refund = await razorpay.refunds.create(payload);
    console.log('[RazorpayService] Refund created:', refund.id);

    return {
      refundId: refund.id,
      paymentId: refund.payment_id,
      amount: refund.amount,
      status: refund.status,
      createdAt: refund.created_at,
    };
  } catch (error) {
    console.error('[RazorpayService] Refund creation failed:', error);
    throw new ApiError(500, `Failed to create refund: ${error.message}`);
  }
};

/**
 * Create transfer to beneficiary account
 * @param {string} accountId - Beneficiary account ID
 * @param {number} amount - Amount in paise
 * @param {string} description - Transfer description
 * @returns {object} Transfer details
 */
const createTransfer = async (accountId, amount, description = '') => {
  try {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ApiError(400, 'Amount must be a positive integer in paise');
    }

    const transfer = await razorpay.transfers.create({
      account: accountId,
      amount,
      currency: 'INR',
      description,
    });

    console.log('[RazorpayService] Transfer created:', transfer.id);

    return {
      transferId: transfer.id,
      accountId: transfer.recipient_id,
      amount: transfer.amount,
      status: transfer.status,
      createdAt: transfer.created_at,
    };
  } catch (error) {
    console.error('[RazorpayService] Transfer creation failed:', error);
    throw new ApiError(500, `Failed to create transfer: ${error.message}`);
  }
};

/**
 * Verify webhook signature
 * @param {object} body - Request body
 * @param {string} signature - X-Razorpay-Signature header
 * @returns {boolean} True if webhook is valid
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    // Skip verification if webhook secret not configured (for testing)
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.log('[RazorpayService] ⚠️ Webhook signature verification skipped (RAZORPAY_WEBHOOK_SECRET not set)');
      return true; // Allow webhook without verification during testing
    }

    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(bodyStr)
      .digest('hex');

    console.log('[RazorpayService] Webhook signature verification:');
    console.log('  Expected:', expectedSignature);
    console.log('  Received:', signature);

    const isValid = expectedSignature === signature;
    console.log('  Valid:', isValid);

    return isValid;
  } catch (error) {
    console.error('[RazorpayService] Webhook verification error:', error);
    return false;
  }
};

module.exports = {
  createOrder,
  verifyPaymentSignature,
  fetchPayment,
  capturePayment,
  createRefund,
  createTransfer,
  verifyWebhookSignature,
};
