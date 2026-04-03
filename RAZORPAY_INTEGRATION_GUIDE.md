# Razorpay Payment Integration - Tech-Mates Platform

## Overview
Complete Razorpay integration for:
- ✅ Milestone Payments (Client → Developer)
- ✅ Subscription Payments
- ✅ Developer Payouts (Developer → Bank)
- ✅ Webhook handling & verification

---

## Installation & Setup

### 1. Backend Setup

#### Install Razorpay Package
```bash
cd server
npm install razorpay
```

#### Environment Variables (.env)
```env
# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

**How to get these keys:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Settings → API Keys
3. Copy Key ID and Key Secret
4. For webhook secret: Settings → Webhooks → Create webhook for your server URL

#### Files Created/Modified
- ✅ `server/src/config/razorpay.js` - Configuration
- ✅ `server/src/services/razorpay.service.js` - Service layer
- ✅ `server/src/controllers/payment.controller.js` - Updated with Razorpay methods
- ✅ `server/src/routes/payment.routes.js` - New routes added

---

### 2. Frontend Setup

#### Install Razorpay SDK
Already included via CDN in the RazorpayPayment component.

#### Environment Variables (.env)
```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

#### Files Created
- ✅ `frontend/src/api/razorpay.api.js` - API calls
- ✅ `frontend/src/components/payment/RazorpayPayment.jsx` - Payment component

---

## API Endpoints

### 1. Create Order for Milestone Payment
**POST** `/api/payments/razorpay/create-order`

Request:
```json
{
  "contractId": "contract_id",
  "milestoneId": "milestone_id",
  "amount": 50000
}
```

Response:
```json
{
  "statusCode": 200,
  "data": {
    "orderId": "order_xxx",
    "amount": 50000,
    "currency": "INR",
    "transactionId": "trans_xxx"
  }
}
```

### 2. Verify Razorpay Payment
**POST** `/api/payments/razorpay/verify`

Request:
```json
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_xxx"
}
```

Response:
```json
{
  "statusCode": 200,
  "data": {
    "transactionId": "trans_xxx",
    "status": "released",
    "amount": 50000
  }
}
```

### 3. Create Order for Subscription
**POST** `/api/payments/razorpay/subscription`

Request:
```json
{
  "planId": "pro",
  "amount": 99900
}
```

### 4. Create Order for Payout
**POST** `/api/payments/razorpay/payout`

Request:
```json
{
  "amount": 50000
}
```

### 5. Razorpay Webhook
**POST** `/api/payments/razorpay/webhook`

No auth required. Razorpay sends webhook events.

---

## Frontend Usage

### Load Razorpay Script
In your App layout or main component:

```jsx
import { useRazorpayScript } from '@/components/payment/RazorpayPayment'

export function App() {
  useRazorpayScript()
  // ... rest of component
}
```

### Use Payment Component
```jsx
import { RazorpayPaymentButton } from '@/components/payment/RazorpayPayment'
import { razorpayAPI } from '@/api/razorpay.api'

export function PayMilestoneModal() {
  const [orderId, setOrderId] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCreateOrder = async () => {
    setLoading(true)
    try {
      const response = await razorpayAPI.createRazorpayOrder(
        contractId,
        milestoneId,
        50000
      )
      setOrderId(response.orderId)
    } catch (error) {
      showToast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (response) => {
    try {
      const result = await razorpayAPI.verifyRazorpayPayment(
        response.razorpay_order_id,
        response.razorpay_payment_id,
        response.razorpay_signature
      )
      showToast.success('Payment successful!')
    } catch (error) {
      showToast.error(error.message)
    }
  }

  return (
    <div>
      <button onClick={handleCreateOrder}>Create Order</button>
      
      {orderId && (
        <RazorpayPaymentButton
          orderId={orderId}
          amount={50000}
          email="client@example.com"
          onSuccess={handlePaymentSuccess}
          onError={(error) => showToast.error(error.message)}
        />
      )}
    </div>
  )
}
```

---

## Payment Flow

### Milestone Payment Flow
1. Client initiates payment for milestone
2. Frontend calls `POST /api/payments/razorpay/create-order`
3. Backend creates Razorpay order, stores transaction
4. Frontend opens Razorpay checkout
5. Customer completes payment
6. Frontend receives payment response
7. Frontend calls `POST /api/payments/razorpay/verify`
8. Backend verifies payment signature
9. Backend credits developer wallet
10. Backend returns success

### Webhook Flow
1. Razorpay sends webhook event
2. Backend verifies webhook signature
3. Backend updates transaction status based on event
4. Returns 200 OK

---

## Security

### Signature Verification
All payments are verified using HMAC-SHA256 signatures:

```javascript
// Frontend verification happens automatically
// Backend verifies in controller

const body = `${razorpayOrderId}|${razorpayPaymentId}`
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex')

const isValid = expectedSignature === razorpaySignature
```

### PCI Compliance
- ❌ Never handle card details directly
- ✅ Use Razorpay checkout (hosted)
- ✅ All sensitive data on Razorpay servers

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid signature | Tampering or wrong secret | Check RAZORPAY_KEY_SECRET |
| Order not found | Transaction DB issue | Check order creation |
| Insufficient balance | Developer wallet low | Request only available amount |
| KYC not verified | Developer not verified | Complete KYC first |

---

## Testing

### Test Credentials
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
```

### Test Webhook
Use [Razorpay Webhook Tester](https://razorpay.com/webhook-tester) or:

```bash
curl -X POST http://localhost:3000/api/payments/razorpay/webhook \
  -H "x-razorpay-signature: test_signature" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.authorized",
    "payload": {
      "payment": {
        "entity": "payment",
        "id": "pay_test123"
      }
    }
  }'
```

---

## Troubleshooting

### "Razorpay SDK not loaded"
- Check if script loaded successfully
- Verify CDN link in component
- Check browser console for errors

### "Invalid signature"
- Verify RAZORPAY_KEY_SECRET is correct
- Check orderId and paymentId match
- Ensure signature matches format: `orderId|paymentId`

### "Order not found"
- Check if order was created successfully
- Verify Transaction model schemahas orderId field
- Check database connection

### Webhook not receiving events
- Verify webhook URL is publicly accessible
- Check Razorpay webhook configuration
- Verify webhook secret matches
- Check server logs for incoming webhooks

---

## Next Steps

1. ✅ Set up environment variables with actual Razorpay keys
2. ✅ Test on sandbox with test credentials
3. ✅ Configure webhook URL in Razorpay dashboard
4. ✅ Integrate with milestone payment modal
5. ✅ Integrate with subscription flow
6. ✅ Integrate with payout system
7. ✅ Test with real payments (live mode)

---

## Support
For issues or questions, refer to:
- [Razorpay Docs](https://razorpay.com/docs)
- [Razorpay Support](https://support.razorpay.com)

