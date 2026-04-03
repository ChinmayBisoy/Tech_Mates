# Quick Implementation Guide 🚀

## What You Need to Do

### Step 1: Install Razorpay Package
```bash
cd server
npm install razorpay
```

### Step 2: Update `.env` with Payment Keys

```env
# Razorpay (get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=rzp_test_your_secret

# Stripe (already have? update if needed)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_PRO_PRICE_ID=price_xxx  
STRIPE_MAX_PRICE_ID=price_xxx
```

### Step 3: Create Razorpay Config (Copy This)

Create file: `server/src/config/razorpay.js`

```javascript
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
```

### Step 4: Add Payment Controller Functions

**File**: `server/src/controllers/payment.controller.js` (Add these functions)

```javascript
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// Create Razorpay Order for UPI
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, planId } = req.validatedBody || req.body;

  const order = await razorpay.orders.create({
    amount: Math.floor(amount),
    currency: 'INR',
    receipt: `order_${req.user._id}_${Date.now()}`,
    notes: {
      userId: String(req.user._id),
      planId,
      planName: planId === 'pro' ? 'Pro' : 'Max',
    },
  });

  res.json(new ApiResponse(200, { 
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  }));
});

// Verify Razorpay Payment
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    throw new ApiError(400, 'Invalid payment signature');
  }

  // Payment verified - create subscription
  const subscription = await subscriptionService.createSubscription(
    req.user._id,
    planId
  );

  res.json(new ApiResponse(200, subscription, 'Payment verified and subscription created'));
});

// Create Payout Request
const createPayout = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, accountDetails } = req.validatedBody || req.body;
  const user = await User.findById(req.user._id);

  if (!user.kycVerified) {
    throw new ApiError(400, 'KYC verification required for payouts');
  }

  // Validate minimum amount
  if (amount < 50000) { // ₹500 in paise
    throw new ApiError(400, 'Minimum payout amount is ₹500');
  }

  // Create transaction record
  const transaction = await Transaction.create({
    userId: req.user._id,
    type: 'payout',
    amount: amount,
    status: 'pending',
    method: paymentMethod,
    bankDetails: paymentMethod === 'bank' ? {
      accountNumber: accountDetails.accountNumber.slice(-4),
      ifscCode: accountDetails.ifscCode,
      accountHolderName: accountDetails.accountHolderName,
    } : null,
    upiId: paymentMethod === 'upi' ? accountDetails.upiId : null,
  });

  res.json(new ApiResponse(200, transaction, 'Payout request created successfully'));
});

// Add these to exports at bottom:
module.exports = {
  // ... existing exports
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPayout,
};
```

### Step 5: Add Routes

**File**: `server/src/routes/payment.routes.js` (Replace with this)

```javascript
const express = require('express');
const paymentController = require('../controllers/payment.controller');
const validate = require('../middleware/validate.middleware');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const { fundMilestoneSchema, requestPayoutSchema } = require('../validators/payment.validator');

const router = express.Router();

// Webhooks (no auth needed)
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

// Existing routes
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

// NEW: Razorpay Order Creation
router.post(
  '/razorpay-order',
  verifyJWT,
  paymentController.createRazorpayOrder
);

// NEW: Verify Razorpay Payment
router.post(
  '/verify-razorpay',
  verifyJWT,
  paymentController.verifyRazorpayPayment
);

// NEW: Create Payout Request
router.post(
  '/payout',
  verifyJWT,
  requireRole('developer'),
  paymentController.createPayout
);

module.exports = router;
```

### Step 6: Update Frontend - Create UPI Payment Component

**File**: `frontend/src/components/payment/UPIPaymentForm.jsx` (NEW FILE)

```jsx
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { showToast } from '@/lib/toast'
import { Smartphone, Loader2 } from 'lucide-react'

export function UPIPaymentForm({ amount, planId, planName, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleUPIPayment = async () => {
    setLoading(true)
    try {
      // Step 1: Create order
      const orderResponse = await fetch('/api/payments/razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          amount: Math.floor(amount * 100), // Convert to paise
          planId,
        }),
      })

      const orderData = await orderResponse.json()
      if (!orderData.data) {
        throw new Error('Failed to create order')
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Add to .env
        order_id: orderData.data.orderId,
        amount: Math.floor(amount * 100),
        currency: 'INR',
        description: `Tech-Mates ${planName} Subscription`,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        notes: {
          userId: user?._id,
          planId,
        },
        handler: async (response) => {
          // Step 3: Verify payment
          const verifyResponse = await fetch('/api/payments/verify-razorpay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user?.token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            }),
          })

          const verified = await verifyResponse.json()
          if (verifyResponse.ok) {
            showToast.success('Payment successful! Subscription activated.')
            onSuccess(verified.data)
          } else {
            showToast.error('Payment verification failed')
          }
        },
        theme: {
          color: '#3399cc',
        },
      }

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        const checkout = new window.Razorpay(options)
        checkout.open()
      }
      document.body.appendChild(script)
    } catch (error) {
      showToast.error(error.message || 'Payment failed')
      console.error('UPI Payment Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleUPIPayment}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Smartphone className="w-5 h-5" />
      )}
      {loading ? 'Processing...' : 'Pay with UPI'}
    </button>
  )
}
```

### Step 7: Update SubscriptionCheckout to Use UPI

**File**: `frontend/src/pages/SubscriptionCheckout.jsx`

**Replace the payment method tabs section with:**

```jsx
{/* Payment Method Tabs */}
<div className="space-y-4">
  <div className="flex gap-2 overflow-x-auto pb-2">
    {[
      { id: 'upi', label: '📱 UPI', icon: Smartphone },
      { id: 'card', label: '💳 Card', icon: CreditCard },
    ].map((method) => (
      <button
        key={method.id}
        onClick={() => setPaymentMethod(method.id)}
        className={`whitespace-nowrap px-4 py-2 rounded-lg font-medium transition-all ${
          paymentMethod === method.id
            ? 'bg-accent-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
        }`}
      >
        {method.label}
      </button>
    ))}
  </div>

  {/* UPI Payment */}
  {paymentMethod === 'upi' && (
    <UPIPaymentForm
      amount={selectedPlan.price}
      planId={planId}
      planName={selectedPlan.name}
      onSuccess={handlePaymentSuccess}
    />
  )}

  {/* Card Payment - TODO: Add Stripe integration */}
  {paymentMethod === 'card' && (
    <div className="p-4 bg-blue-50 rounded-lg text-center">
      <p className="text-blue-900">Card payment integration coming soon</p>
    </div>
  )}
</div>
```

### Step 8: Add Razorpay Key to Frontend `.env`

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

---

## Testing Checklist

- [ ] Create test Razorpay account
- [ ] Add keys to `.env` files
- [ ] Run `npm install razorpay` in server
- [ ] Update routes
- [ ] Add payment controller functions
- [ ] Create UPI payment component
- [ ] Update SubscriptionCheckout page
- [ ] Test UPI payment flow with test numbers from Razorpay docs
- [ ] Verify payment creates subscription
- [ ] Test withdrawal flow

---

## Test Payment Numbers (Razorpay)

**Successful UPI:**
```
UPI ID: success@razorpay
```

Check docs: https://razorpay.com/docs/payments/payment-gateway/test-cards/

---

## What's Next?

1. After UPI works → Add Card via Stripe
2. After payments work → Integrate withdrawals (bank + UPI)
3. Add webhook handlers for payment status updates
4. Test production mode before going live

---

## Troubleshooting

**"Razorpay is not defined"**
- Make sure Razorpay script is loaded in HTML or use npm package

**"Invalid signature"**
- Check that RAZORPAY_KEY_SECRET is correct in `.env`

**"Module not found: razorpay"**
- Run: `npm install razorpay` in server directory

**Payment doesn't create subscription**
- Check that `subscriptionService.createSubscription` is called in `verifyRazorpayPayment`
- Check logs for errors
