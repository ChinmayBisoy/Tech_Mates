# Client-to-Developer Milestone Payments Guide

## Overview
When clients hire developers for projects, payments are made via **Milestones** (escrow). This ensures security for both parties.

---

## Payment Flow

```
1. CONTRACT CREATED
   ├─ Client posts project with milestones
   └─ Developer accepts (contract created)

2. CLIENT FUNDS MILESTONE
   ├─ Client selects payment method (Card/UPI/Razorpay)
   ├─ Payment processed (Stripe/Razorpay)
   └─ Money held in escrow

3. DEVELOPER COMPLETES WORK
   ├─ Developer submits deliverables
   └─ Milestone status: "in_progress" → "completed"

4. CLIENT RELEASES PAYMENT
   ├─ Client verifies work
   └─ Clicks "Release Payment" OR auto-release after 7 days

5. MONEY DISTRIBUTED
   ├─ Platform takes 10% fee
   ├─ Developer gets 90% in wallet
   └─ Developer can withdraw anytime (₹500+ min)
```

---

## Backend Implementation

### Update: `server/src/services/escrow.service.js`

**Replace `fundMilestone` function to support multiple payment methods:**

```javascript
const fundMilestone = async (contractId, milestoneId, clientId, paymentMethod = 'stripe') => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });
  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  if (String(contract.clientId) !== String(clientId)) {
    throw new ApiError(403, 'Only contract client can fund this milestone');
  }

  const milestone = findMilestone(contract, milestoneId);
  if (milestone.status !== 'pending') {
    throw new ApiError(400, 'Only pending milestones can be funded');
  }

  const developer = await User.findById(contract.developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  const milestoneAmount = Number(milestone.amount || 0);
  if (!Number.isInteger(milestoneAmount) || milestoneAmount <= 0) {
    throw new ApiError(400, 'Milestone amount must be a positive integer in paise');
  }

  const { platformFee, developerEarnings, rate } = calculateCommission(milestoneAmount, developer);

  let paymentData = {
    contractId: String(contractId),
    milestoneId: String(milestoneId),
    clientId: String(clientId),
    developerId: String(contract.developerId),
    amount: milestoneAmount,
  };

  // Generate payment based on method
  let paymentResponse = {};

  if (paymentMethod === 'stripe') {
    const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
      milestoneAmount,
      'inr',
      paymentData
    );
    paymentResponse = { clientSecret, paymentIntentId, paymentMethod: 'stripe' };
  } else if (paymentMethod === 'razorpay') {
    const razorpay = require('../config/razorpay');
    const order = await razorpay.orders.create({
      amount: milestoneAmount,
      currency: 'INR',
      receipt: `milestone_${contractId}_${milestoneId}`,
      notes: paymentData,
    });
    paymentResponse = { orderId: order.id, paymentMethod: 'razorpay' };
  } else if (paymentMethod === 'upi') {
    // For UPI, we'll use Razorpay as well
    const razorpay = require('../config/razorpay');
    const order = await razorpay.orders.create({
      amount: milestoneAmount,
      currency: 'INR',
      receipt: `milestone_${contractId}_${milestoneId}`,
      notes: paymentData,
    });
    paymentResponse = { orderId: order.id, paymentMethod: 'upi' };
  }

  // Update milestone status
  milestone.status = 'awaiting_payment';
  await contract.save();

  // Create transaction record
  const transaction = await Transaction.create({
    contractId: contract._id,
    milestoneId: String(milestone._id),
    clientId: contract.clientId,
    developerId: contract.developerId,
    amount: milestoneAmount,
    platformFee,
    developerEarnings,
    commissionRate: rate,
    stripePaymentIntentId: paymentResponse.paymentIntentId || null,
    razorpayOrderId: paymentResponse.orderId || null,
    paymentMethod: paymentMethod,
    status: 'pending',
    type: 'milestone_payment',
  });

  return {
    ...paymentResponse,
    transaction,
    developerEarnings,
  };
};
```

---

### Update: `server/src/controllers/payment.controller.js`

**Update `fundMilestone` function to accept payment method:**

```javascript
const fundMilestone = asyncHandler(async (req, res) => {
  const { contractId, milestoneId, paymentMethod = 'stripe' } = req.validatedBody || req.body;

  const result = await escrowService.fundMilestone(
    contractId,
    milestoneId,
    req.user._id,
    paymentMethod
  );

  res.json(
    new ApiResponse(
      200,
      {
        clientSecret: result.clientSecret,
        orderId: result.orderId,
        transaction: result.transaction,
        developerEarnings: result.developerEarnings,
        paymentMethod: result.paymentMethod,
      },
      'Milestone funding initiated'
    )
  );
});

// New: Verify Milestone Payment (Razorpay)
const verifyMilestonePayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, contractId, milestoneId } = req.body;
  const crypto = require('crypto');
  const razorpay = require('../config/razorpay');

  // Verify signature
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    throw new ApiError(400, 'Invalid payment signature');
  }

  // Update transaction as paid
  const transaction = await Transaction.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      status: 'held',
      razorpayPaymentId: razorpay_payment_id,
    },
    { new: true }
  );

  // Update milestone status to in_progress
  const contract = await Contract.findById(contractId);
  const milestone = findMilestone(contract, milestoneId);
  milestone.status = 'in_progress';
  await contract.save();

  res.json(new ApiResponse(200, transaction, 'Milestone payment verified'));
});
```

---

### Update: `server/src/routes/payment.routes.js`

```javascript
// Add these routes:
router.post(
  '/fund-milestone',
  verifyJWT,
  requireRole('client'),
  validate(fundMilestoneSchema),
  paymentController.fundMilestone
);

router.post(
  '/verify-milestone-payment',
  verifyJWT,
  paymentController.verifyMilestonePayment
);
```

---

## Frontend Implementation

### 1. Create Milestone Payment Method Selector

**File**: `frontend/src/components/contracts/MilestonePaymentModal.jsx`

```jsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { X, Loader2, CreditCard, Smartphone, AlertCircle } from 'lucide-react'
import { showToast } from '@/lib/toast'
import * as contractAPI from '@/api/contract.api'
import { UPIPaymentForm } from '@/components/payment/UPIPaymentForm'
import { StripeCardForm } from '@/components/payment/StripeCardForm'

export function MilestonePaymentModal({ milestone, contract, onClose, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [orderData, setOrderData] = useState(null)

  const fundMutation = useMutation({
    mutationFn: async (method) => {
      const response = await fetch('/api/payments/fund-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: contract._id,
          milestoneId: milestone._id,
          paymentMethod: method,
        }),
      })
      return response.json()
    },
    onSuccess: (data) => {
      setOrderData(data.data)
    },
    onError: (error) => {
      showToast.error(error.message)
    },
  })

  const handlePaymentSuccess = () => {
    showToast.success('Payment successful! Milestone funded.')
    onSuccess()
    onClose()
  }

  if (orderData) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-surface rounded-2xl p-8 max-w-md w-full space-y-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Complete Payment
          </h2>

          <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Milestone Amount</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{(milestone.amount / 100).toFixed(2)}
            </p>
          </div>

          {/* Payment Form */}
          {paymentMethod === 'razorpay' && (
            <UPIPaymentForm
              amount={milestone.amount / 100}
              planId={contract._id}
              planName={`Milestone: ${milestone.title}`}
              onSuccess={handlePaymentSuccess}
              metadata={{
                contractId: contract._id,
                milestoneId: milestone._id,
              }}
            />
          )}

          {paymentMethod === 'stripe' && (
            <StripeCardForm
              amount={milestone.amount / 100}
              onSuccess={handlePaymentSuccess}
              metadata={{
                contractId: contract._id,
                milestoneId: milestone._id,
              }}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-surface rounded-2xl p-8 max-w-md w-full space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fund Milestone
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Select a payment method to fund this milestone
          </p>
        </div>

        {/* Milestone Details */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
            {milestone.title}
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            ₹{(milestone.amount / 100).toFixed(2)}
          </p>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Choose Payment Method
          </p>

          <button
            onClick={() => {
              setPaymentMethod('razorpay')
              fundMutation.mutate('razorpay')
            }}
            disabled={fundMutation.isPending}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'razorpay'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">UPI / Razorpay</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Fastest & most secure
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setPaymentMethod('stripe')
              fundMutation.mutate('stripe')
            }}
            disabled={fundMutation.isPending}
            className={`w-full p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'stripe'
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Debit / Credit Card</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Visa, Mastercard, Amex
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Funds will be held in escrow until you release them after the developer completes the work.
          </p>
        </div>
      </div>
    </div>
  )
}
```

### 2. Add Payment Modal to Contract Detail Page

**File**: `frontend/src/pages/contracts/[contractId].jsx` (Where milestones are displayed)

```jsx
import { MilestonePaymentModal } from '@/components/contracts/MilestonePaymentModal'

export default function ContractDetailPage() {
  const [selectedMilestone, setSelectedMilestone] = useState(null)

  return (
    <>
      {/* Existing Contract Details */}

      {/* Milestones List */}
      <div className="space-y-4">
        {contract.milestones.map((milestone) => (
          <div key={milestone._id} className="p-4 border rounded-lg">
            <h3>{milestone.title}</h3>
            <p>₹{(milestone.amount / 100).toFixed(2)}</p>

            {/* Fund Milestone Button - Only for pending milestones */}
            {milestone.status === 'pending' && (
              <button
                onClick={() => setSelectedMilestone(milestone)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Fund Milestone
              </button>
            )}

            {milestone.status === 'in_progress' && (
              <span className="text-yellow-600">In Progress</span>
            )}

            {milestone.status === 'completed' && (
              <button
                onClick={() => handleReleaseMilestone(milestone._id)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Release Payment
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {selectedMilestone && (
        <MilestonePaymentModal
          milestone={selectedMilestone}
          contract={contract}
          onClose={() => setSelectedMilestone(null)}
          onSuccess={() => {
            // Refetch contract data
            refetch()
          }}
        />
      )}
    </>
  )
}
```

---

## Money Distribution Example

**Scenario:** Client funds ₹1000 milestone

```
Platform Fee (10%)  = ₹100
Developer Earnings  = ₹900

1. Payment held in escrow (status: "held")
2. Developer completes work
3. Client clicks "Release Payment"
4. ₹900 added to developer's wallet
5. ₹100 added to platform revenue
6. Developer can withdraw ₹900 anytime (min ₹500)
```

---

## Current Milestone Statuses

- `pending` - Not yet funded
- `awaiting_payment` - Payment initiated, awaiting confirmation
- `in_progress` - Funded, developer working
- `completed` - Developer submitted, awaiting client release
- `released` - Payment released to developer
- `disputed` - In dispute, admin to resolve
- `cancelled` - Cancelled by mutual agreement

---

## Security Features

✅ Escrow holds money until release
✅ Platform fee deducted automatically
✅ Auto-release after 7 days if client doesn't active release
✅ Dispute resolution by admin
✅ All transactions logged
✅ Payment verification via signature
✅ KYC verification for large payouts

---

## API Endpoints

```
POST /api/payments/fund-milestone
  Input: { contractId, milestoneId, paymentMethod }
  Output: { clientSecret, orderId, transaction, developerEarnings }

POST /api/payments/verify-milestone-payment
  Input: { razorpay_order_id, razorpay_payment_id, razorpay_signature, contractId, milestoneId }
  Output: { transaction, message }

POST /api/payments/release-milestone
  Input: { contractId, milestoneId }
  Output: { transaction, developerWallet }

GET /api/payments/milestone-history
  Output: [ { milestone, transaction, status }... ]
```

---

## Testing Steps

1. ✅ Client logs in
2. ✅ Accepts a developer's proposal (contract created)
3. ✅ Views contract milestones
4. ✅ Clicks "Fund Milestone"
5. ✅ Selects payment method (UPI/Card)
6. ✅ Enters payment details
7. ✅ Payment processes
8. ✅ Milestone moves to "in_progress"
9. ✅ Developer completes work
10. ✅ Client clicks "Release Payment"
11. ✅ Money goes to developer's wallet
12. ✅ Developer withdraws to bank/UPI

---

## Next Steps

1. Implement milestone payment modal component
2. Add verification endpoint for Razorpay payments
3. Update contract detail page with payment button
4. Test full payment-to-withdrawal flow
5. Add notification when payment is released
6. Send email to developer when payment is received
