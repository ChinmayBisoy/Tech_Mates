# Complete Payment Flow Architecture 🏗️

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TECH-MATES PAYMENTS                      │
└─────────────────────────────────────────────────────────────┘

                    💰 3 PAYMENT TYPES

┌─────────────────────┬─────────────────────┬──────────────────┐
│   SUBSCRIPTION      │  MILESTONE PAYMENT  │   WITHDRAWAL     │
│   (Developer)       │  (Client → Dev)     │   (Developer)    │
├─────────────────────┼─────────────────────┼──────────────────┤
│ Card                │ Card                │ Bank Transfer    │
│ UPI                 │ UPI                 │ UPI Direct       │
│ Razorpay            │ Razorpay            │ Razorpay Payouts │
│ Crypto              │ Crypto (future)     │                  │
└─────────────────────┴─────────────────────┴──────────────────┘
```

---

## 1️⃣ SUBSCRIPTION PAYMENTS (One-Time: ₹839 or ₹4,145)

### Flow
```
Developer
   ↓
Selects Pro/Max Plan
   ↓
SubscriptionCheckout Page
   ↓
Chooses Payment Method (UPI/Card)
   ↓
Payment Gateway (Razorpay/Stripe)
   ↓
Payment Verified
   ↓
Subscription Created
   ↓
Database Updated
   ↓
Success Page + Email
```

### Components Involved
- **Frontend**: `SubscriptionCheckout.jsx` + `UPIPaymentForm.jsx`
- **Backend**: `subscription.controller.js` + `subscription.service.js`
- **Gateway**: Razorpay (UPI), Stripe (Card)

### Status
✅ Partially Ready - Need to connect frontend to Razorpay/Stripe

---

## 2️⃣ MILESTONE PAYMENTS (Project Progress - Variable Amount)

### Flow
```
1. CLIENT-DEVELOPER AGREEMENT
   Client posts project → Developer proposes → Client accepts
   ↓
2. CONTRACT WITH MILESTONES
   Project split into milestones (e.g., 50% design, 50% coding)
   ↓
3. FUND MILESTONE
   Client clicks "Fund Milestone" → Selects payment method
   ↓
4. PAYMENT PROCESSING
   Payment gateway processes money
   ↓
5. ESCROW HOLD
   Money held (not given to dev yet) - Status: "held"
   Platform fee (10%) calculated and separated
   ↓
6. DEVELOPER COMPLETES WORK
   Developer uploads deliverables
   Milestone status: "in_progress" → "completed"
   ↓
7. CLIENT APPROVAL
   Client verifies work → "Release Payment"
   OR Auto-release after 7 days
   ↓
8. MONEY DISTRIBUTION
   Developer gets 90% in wallet
   Platform gets 10%
   ↓
9. TRANSACTION COMPLETE
   Status: "released"
```

### Components Involved
- **Frontend**: 
  - `MilestonePaymentModal.jsx` (Payment method selector)
  - Contract detail page (display milestones)
  - `UPIPaymentForm.jsx` (reused)
  
- **Backend**: 
  - `payment.controller.js` → `fundMilestone()`
  - `escrow.service.js` → handles escrow logic
  - `transaction.model.js` → stores payment records

- **Gateway**: Razorpay (UPI), Stripe (Card)

### Status
🔄 Needs Implementation - Core logic exists, need payment method integration

---

## 3️⃣ WITHDRAWALS (Developer Cashes Out)

### Flow
```
1. DEVELOPER'S WALLET
   Has earned money from completed milestones
   Available: ₹5000, Pending: ₹2000
   ↓
2. INITIATE WITHDRAWAL
   Developer clicks "Withdraw"
   Min: ₹500, Max: Available balance
   ↓
3. SELECT METHOD
   Bank Transfer (NEFT/IMPS) → Account + IFSC
   UPI Direct → UPI ID
   ↓
4. KYC VERIFICATION CHECK
   ✓ KYC verified → proceed
   ✗ KYC pending → show KYC form
   ↓
5. PAYMENT PROCESSOR
   Send via Razorpay Payouts API
   Status: "pending"
   ↓
6. PROCESSING (2-5 DAYS)
   Bank processes transfer
   Developer gets notification
   ↓
7. COMPLETED
   Money in developer's bank/UPI
   Status: "completed"
```

### Components Involved
- **Frontend**: 
  - `PayoutManagement.jsx` (form)
  - `PayoutHistory.jsx` (shows previous withdrawals)
  - `BankWithdrawal.jsx` (NEW - needs creation)

- **Backend**: 
  - `wallet.controller.js` → `createPayout()`
  - `wallet.service.js` → payout logic
  - Razorpay Payouts API

- **Gateway**: Razorpay Payouts

### Status
🔄 Partially Ready - UI exists, backend needs Razorpay integration

---

## Money Flow Diagram

```
CLIENT
  ↓
  Funds Milestone (₹1000)
  ↓
PAYMENT GATEWAY (Razorpay/Stripe)
  ↓
TECH-MATES ESCROW
  ├─ Developer Earnings (90%) = ₹900
  └─ Platform Fee (10%) = ₹100
  ↓
CLIENT RELEASES PAYMENT
  ↓
DEVELOPER WALLET
  ├─ Balance: +₹900
  └─ Can Withdraw: ₹900
  ↓
DEVELOPER WITHDRAWS
  ↓
BANK/UPI (+ Razorpay Payouts)
  ↓
DEVELOPER'S ACCOUNT
  Money Received!
```

---

## Environment Variables Needed

```env
# Razorpay (for UPI, Milestones, Withdrawals)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=secret_xxx

# Stripe (for Card payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_PRO_PRICE_ID=price_xxx
STRIPE_MAX_PRICE_ID=price_xxx

# Frontend only
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## API Endpoints Map

### Subscriptions
```
POST   /api/payments/razorpay-order          Create payment order
POST   /api/payments/verify-razorpay         Verify & create subscription
GET    /api/payments/subscription            Get subscription status
POST   /api/payments/subscription/cancel     Cancel subscription
```

### Milestones
```
POST   /api/payments/fund-milestone          Client funds milestone
POST   /api/payments/verify-milestone        Verify milestone payment
POST   /api/payments/release-milestone       Release payment to dev
GET    /api/payments/earnings                Dev sees earnings
```

### Withdrawals
```
POST   /api/wallet/create-payout             Request withdrawal
GET    /api/wallet/payouts                   Payout history
GET    /api/wallet/balance                   Current balance
```

---

## Implementation Priority

### Phase 1: Subscriptions ✅
- [ ] Fix Razorpay UPI integration
- [ ] Add UPIPaymentForm component
- [ ] Test end-to-end

### Phase 2: Milestone Payments 🚀
- [ ] Create MilestonePaymentModal
- [ ] Update fundMilestone with payment methods
- [ ] Add payment verification endpoint
- [ ] Update contract detail page

### Phase 3: Withdrawals 🔄
- [ ] Create BankWithdrawal component
- [ ] Implement Razorpay Payouts
- [ ] Add withdrawal endpoints
- [ ] Test bank transfer

### Phase 4: Advanced Features 📈
- [ ] Crypto payments
- [ ] Payment analytics
- [ ] Automated payouts
- [ ] Tax reporting

---

## Security Checklist

✅ All payments encrypted (HTTPS only)
✅ Webhook signatures verified
✅ API keys in environment variables
✅ Transaction logging enabled
✅ Escrow holds money until release
✅ Platform fee secured first
✅ KYC required for withdrawals
✅ Rate limiting on payment endpoints
✅ Error messages don't leak sensitive info
✅ Test mode before production

---

## File Dependencies

```
frontend/src/
├── pages/
│   ├── Subscription.jsx                    (plans list)
│   ├── SubscriptionCheckout.jsx            (payment flow)
│   └── SubscriptionSuccess.jsx             (success page)
├── components/
│   ├── payment/
│   │   ├── UPIPaymentForm.jsx              (reused for all)
│   │   └── StripeCardForm.jsx              (for cards)
│   ├── earnings/
│   │   ├── PayoutManagement.jsx            (UI form)
│   │   └── PayoutHistory.jsx               (past payouts)
│   └── contracts/
│       └── MilestonePaymentModal.jsx       (NEW - needs creation)
└── pages/Earnings.jsx                      (withdraw button)

server/src/
├── controllers/
│   ├── subscription.controller.js          (subscriptions)
│   ├── payment.controller.js               (milestones + withdrawals)
│   └── wallet.controller.js                (wallet/payout ops)
├── services/
│   ├── subscription.service.js             (subscription logic)
│   ├── escrow.service.js                   (milestone escrow)
│   ├── payment.service.js                  (earnings calc)
│   └── wallet.service.js                   (wallet ops)
├── config/
│   ├── stripe.js                           (Stripe SDK)
│   └── razorpay.js                         (Razorpay SDK)
├── models/
│   ├── subscription.model.js               (subscription data)
│   ├── transaction.model.js                (all txn records)
│   └── contract.model.js                   (milestone data)
└── routes/
    ├── payment.routes.js                   (all payment endpoints)
    └── wallet.routes.js                    (withdrawal endpoints)
```

---

## Testing Scenario

```
DEVELOPER FLOW:
1. Login as developer
2. Navigate to Subscription
3. Select Pro plan (₹839)
4. Choose UPI payment
5. Complete payment via test UPI
6. Get subscription badge

CLIENT FLOW:
1. Login as client
2. Post project ($500 = ₹40,000)
3. Developer proposes, client accepts
4. Contract created with 2 milestones (₹20,000 each)
5. Fund first milestone
6. Choose UPI payment
7. Complete payment
8. Wait for developer to complete work
9. Click "Release Payment"
10. Developer gets ₹18,000 (90% of ₹20,000)

DEVELOPER WITHDRAWAL:
1. Navigate to Earnings
2. See available balance: ₹18,000
3. Click "Withdraw"
4. Enter bank details or UPI ID
5. Request withdrawal
6. Money processes in 2-5 days
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Payment stuck at pending | Check Razorpay webhook setup |
| Signature verification failed | Verify RAZORPAY_KEY_SECRET in .env |
| Escrow not holding money | Check escrow.service.js status updates |
| Developer not seeing money | Check transaction query & wallet balance |
| Withdrawal not processing | Verify bank details are correct IFSC format |

---

## Notes

- All amounts in **paise** (₹1 = 100 paise) in API
- Display amounts in **rupees** (₹) in UI
- Platform fee always 10% (configurable in config)
- Minimum milestone: ₹100 (10,000 paise)
- Minimum withdrawal: ₹500 (50,000 paise)
- Auto-release milestone if not released in 7 days
