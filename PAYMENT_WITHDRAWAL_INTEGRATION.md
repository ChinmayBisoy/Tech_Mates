# Payment & Withdrawal Integration Guide

## Overview
Tech-Mates supports 4 payment methods (Card, UPI, Razorpay, Crypto) and 2 withdrawal methods (Bank, UPI). Here's how to implement them.

---

## PART 1: PAYMENT METHODS

### Option A: Card Payments via Stripe ✅ (Mostly Ready)

**What's already done:**
- Stripe config exists
- Subscription controller creates Stripe subscriptions
- Need to: Connect frontend Stripe Elements

**Frontend Implementation:**

1. Install Stripe.js:
```bash
npm install @stripe/react-stripe-js @stripe/js
```

2. Create `CardPaymentElement.jsx`:
```jsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { showToast } from '@/lib/toast'

export function CardPaymentElement({ onPaymentSuccess, amount, planId }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    if (!stripe || !elements) return

    setIsProcessing(true)
    
    try {
      // 1. Create payment intent on backend
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.floor(amount * 100), // Convert to paise
          planId 
        }),
      })
      const { clientSecret } = await response.json()

      // 2. Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })

      if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent)
      }
    } catch (error) {
      showToast.error(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div>
      <CardElement />
      <button onClick={handlePayment} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  )
}
```

3. Wrap app with Stripe provider in `App.jsx`:
```jsx
import { loadStripe } from '@stripe/js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Your app */}
    </Elements>
  )
}
```

**Backend Endpoint - Add to `payment.controller.js`:**
```javascript
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { amount, planId } = req.validatedBody || req.body
  const user = await User.findById(req.user._id)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.floor(amount),
    currency: 'inr',
    metadata: {
      userId: String(req.user._id),
      planId,
    },
  })

  res.json(new ApiResponse(200, { clientSecret: paymentIntent.client_secret }))
})
```

---

### Option B: UPI via Razorpay

**Setup:**
1. Create Razorpay account at https://razorpay.com
2. Get API Key and Secret
3. Add to `.env`:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

**Frontend Implementation (`UPIPayment.jsx`):**
```jsx
import { useState } from 'react'
import { Smartphone, AlertCircle, Loader2 } from 'lucide-react'
import { showToast } from '@/lib/toast'

export function UPIPayment({ amount, planId, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [upiId, setUpiId] = useState('')

  const handleUPIPayment = async () => {
    if (!upiId) {
      showToast.error('Please enter your UPI ID')
      return
    }

    setLoading(true)
    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payments/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.floor(amount * 100),
          planId,
          paymentMethod: 'upi',
        }),
      })
      const orderData = await orderResponse.json()

      // Open Razorpay checkout
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      
      script.onload = () => {
        const options = {
          key: 'YOUR_RAZORPAY_KEY_ID',
          order_id: orderData.order_id,
          handler: async (response) => {
            // Verify payment on backend
            const verified = await fetch('/api/payments/verify-razorpay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            if (verified.ok) {
              showToast.success('Payment successful!')
              onSuccess()
            }
          },
          prefill: {
            method: 'upi',
          },
        }
        new window.Razorpay(options).open()
      }

      document.body.appendChild(script)
    } catch (error) {
      showToast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Enter UPI ID (yourname@bank)"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button
        onClick={handleUPIPayment}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        {loading ? <Loader2 className="animate-spin" /> : 'Pay with UPI'}
      </button>
    </div>
  )
}
```

**Backend Endpoints - Add to `payment.controller.js`:**
```javascript
const Razorpay = require('razorpay')
const crypto = require('crypto')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, planId } = req.validatedBody || req.body

  const order = await razorpay.orders.create({
    amount: Math.floor(amount),
    currency: 'INR',
    receipt: `order_${req.user._id}_${Date.now()}`,
    notes: {
      userId: String(req.user._id),
      planId,
    },
  })

  res.json(new ApiResponse(200, { order_id: order.id }))
})

const verifyRazorpay = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generated_signature === razorpay_signature) {
    // Create subscription
    const subscription = await subscriptionService.createSubscription(
      req.user._id,
      req.body.planId
    )
    res.json(new ApiResponse(200, subscription, 'Payment verified'))
  } else {
    throw new ApiError(400, 'Invalid payment signature')
  }
})
```

---

## PART 2: WITHDRAWAL METHODS

### Option A: Bank Transfer via Razorpay Payouts

**Frontend Implementation (`BankWithdrawal.jsx`):**
```jsx
import { useState } from 'react'
import { Wallet, AlertCircle } from 'lucide-react'

export function BankWithdrawal({ availableBalance, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifsc: '',
    accountHolder: '',
    accountType: 'savings', // or 'current'
  })

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) < 500) {
      showToast.error('Minimum withdrawal is ₹500')
      return
    }

    if (parseFloat(amount) > availableBalance) {
      showToast.error('Insufficient balance')
      return
    }

    try {
      const response = await fetch('/api/wallet/create-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.floor(parseFloat(amount) * 100),
          method: 'bank',
          bankDetails,
        }),
      })

      if (response.ok) {
        showToast.success('Withdrawal request submitted')
        onSuccess()
      }
    } catch (error) {
      showToast.error(error.message)
    }
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border">
      <h3 className="font-semibold text-lg">Bank Transfer</h3>
      
      <input
        type="number"
        placeholder="Amount (min ₹500)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      <input
        type="text"
        placeholder="Account Number"
        value={bankDetails.accountNumber}
        onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
        className="w-full px-4 py-2 border rounded-lg"
      />

      <input
        type="text"
        placeholder="IFSC Code"
        value={bankDetails.ifsc}
        onChange={(e) => setBankDetails({...bankDetails, ifsc: e.target.value})}
        className="w-full px-4 py-2 border rounded-lg"
      />

      <select
        value={bankDetails.accountType}
        onChange={(e) => setBankDetails({...bankDetails, accountType: e.target.value})}
        className="w-full px-4 py-2 border rounded-lg"
      >
        <option value="savings">Savings</option>
        <option value="current">Current</option>
      </select>

      <button
        onClick={handleWithdraw}
        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold"
      >
        Request Withdrawal
      </button>
    </div>
  )
}
```

**Backend Endpoint - Add to `wallet.routes.js`:**
```javascript
router.post(
  '/create-payout',
  verifyJWT,
  walletController.createPayout
)
```

**Backend Controller - Add to `wallet.controller.js`:**
```javascript
const Razorpay = require('razorpay')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const createPayout = asyncHandler(async (req, res) => {
  const { amount, method, bankDetails } = req.validatedBody || req.body
  const user = await User.findById(req.user._id)

  if (!user.kycVerified) {
    throw new ApiError(400, 'KYC verification required')
  }

  // Validate bank details
  if (!bankDetails.accountNumber || !bankDetails.ifsc) {
    throw new ApiError(400, 'Bank details required')
  }

  // Create payout via Razorpay
  const payout = await razorpay.payouts.create({
    accountNumber: bankDetails.accountNumber,
    ifsc: bankDetails.ifsc,
    mode: 'NEFT', // NEFT or IMPS
    amount: Math.floor(amount),
    purpose: 'payout',
    narration: 'Developer earnings payout',
    reference_id: `payout_${req.user._id}_${Date.now()}`,
  })

  // Deduct from wallet
  const transaction = await Transaction.create({
    userId: req.user._id,
    type: 'payout_request',
    amount: amount,
    status: 'pending',
    method: 'bank',
    bankDetails: {
      accountNumber: bankDetails.accountNumber.slice(-4), // Store last 4 digits only
      ifsc: bankDetails.ifsc,
    },
    razorpayPayoutId: payout.id,
  })

  res.json(new ApiResponse(200, transaction, 'Payout request created'))
})
```

---

## PART 3: Update Routes

**Add to `server/src/routes/payment.routes.js`:**
```javascript
router.post('/create-payment-intent', verifyJWT, paymentController.createPaymentIntent)
router.post('/create-razorpay-order', verifyJWT, paymentController.createRazorpayOrder)
router.post('/verify-razorpay', verifyJWT, paymentController.verifyRazorpay)

// Webhooks
router.post('/stripe-webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook)
router.post('/razorpay-webhook', express.raw({type: 'application/json'}), paymentController.handleRazorpayWebhook)
```

---

## PART 4: Environment Variables

Add to `.env`:
```
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_MAX_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

---

## Implementation Order

1. ✅ **Card Payment** - Use existing Stripe setup, just add frontend Stripe Elements
2. **UPI Payment** - Add Razorpay integration for UPI
3. **Bank Withdrawal** - Add Razorpay Payouts
4. **UPI Withdrawal** - Add UPI ID payout support
5. **Crypto (Optional)** - Via Coinbase Commerce or Binance Pay

---

## Testing

Use test credentials:
- Razorpay Test: https://razorpay.com/docs/payments/payment-gateway/test-cards/
- Stripe Test: 4242 4242 4242 4242

---

## Security Notes

⚠️ **IMPORTANT:**
- Never log full card/bank details
- Store only last 4 digits
- Use HTTPS always
- Verify all webhook signatures
- Keep API keys in environment variables only
