# Razorpay Integration - Quick Setup (5 Minutes)

## Step 1: Get Razorpay Keys (1 min)
1. Go to https://dashboard.razorpay.com
2. Login with your account
3. Go to Settings → API Keys
4. Copy **Key ID** and **Key Secret**
5. Go to Settings → Webhooks
6. Create webhook for: `https://yourserver.com/api/payments/razorpay/webhook`
7. Copy **Webhook Secret**

## Step 2: Update Backend Environment (1 min)

**File:** `server/.env`

```env
# ADD THESE LINES:
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 3: Update Frontend Environment (1 min)

**File:** `frontend/.env`

```env
# ADD THIS LINE:
VITE_RAZORPAY_KEY_ID=your_key_id_here
```

## Step 4: Test the Integration (2 min)

### Backend Test
```bash
cd server
npm start
```

### Frontend Test
```bash
cd frontend
npm run dev
```

### API Test
```bash
# Create order
curl -X POST http://localhost:3000/api/payments/razorpay/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractId": "123",
    "milestoneId": "456",
    "amount": 50000
  }'
```

## Step 5: Integrate with Your Components

### For Milestone Payments
```jsx
import { razorpayAPI } from '@/api/razorpay.api'
import RazorpayPaymentButton from '@/components/payment/RazorpayPayment'

// In your component
const handlePayment = async () => {
  const order = await razorpayAPI.createRazorpayOrder(
    contractId,
    milestoneId,
    50000 // amount in paise
  )
  
  setOrderId(order.orderId)
}
```

### For Subscriptions
```jsx
const order = await razorpayAPI.createSubscriptionOrder('pro', 99900)
```

### For Payouts
```jsx
const order = await razorpayAPI.createPayoutOrder(50000) // ₹500 minimum
```

## Test Payment Details
```
Card: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
OTP: Any 6 digits
```

## ✅ Done!

Your Razorpay integration is now ready:
- ✅ Milestone payments
- ✅ Subscription payments
- ✅ Payout requests
- ✅ Webhook handling
- ✅ Payment verification

**Next:** Test with real payments in live mode after sandbox testing.

