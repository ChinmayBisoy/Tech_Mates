# Three Money Transactions in Tech-Mates 💰

## Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    3 MONEY FLOWS                               │
└────────────────────────────────────────────────────────────────┘

TRANSACTION 1: CLIENT → DEVELOPER (Milestone Payment)
    Client funds milestone 
         ↓
    Money held in escrow
         ↓
    Developer completes work
         ↓
    Client releases payment
         ↓
    Developer's wallet: +₹X

TRANSACTION 2: DEVELOPER → DEVELOPER'S BANK (Withdrawal)
    Developer clicks "Withdraw"
         ↓
    Enters bank/UPI details
         ↓
    Requests ₹Y from wallet
         ↓
    Razorpay processes payout
         ↓
    Money in developer's bank account

TRANSACTION 3: DEVELOPER → TECH-MATES (Subscription)
    Developer clicks "Upgrade to Pro/Max"
         ↓
    Selects payment method (UPI/Card)
         ↓
    Pays ₹839 or ₹4,145
         ↓
    Subscription activated
         ↓
    Developer gets Pro/Max features
```

---

## Transaction 1️⃣: Client → Developer (Milestone Payment)

### Goal
Client pays developer for completed project work

### Money Flow
```
CLIENT'S BANK
     ↓ (payment)
TECH-MATES PAYMENT PROCESSOR (Razorpay/Stripe)
     ↓
TECH-MATES ESCROW ACCOUNT
     ├─ Platform Fee (10%) → Platform Revenue
     └─ Developer Earnings (90%) → Developer Wallet
```

### Steps

#### **Step 1: Client Funds Milestone**
```javascript
// Frontend: Client clicks "Fund Milestone" → Selects UPI
const fundMilestone = async (milestoneId) => {
  const response = await fetch('/api/payments/fund-milestone', {
    method: 'POST',
    body: JSON.stringify({
      contractId: contract._id,
      milestoneId,
      paymentMethod: 'razorpay', // or 'stripe'
    }),
  })
  return response.json() // Returns orderId, clientSecret, transaction
}

// Backend: Create order
router.post('/fund-milestone', (req, res) => {
  // Input: contractId, milestoneId, paymentMethod
  // Output: payment order details (Razorpay order or Stripe client secret)
  // Status: Transaction created with status "pending"
})
```

#### **Step 2: Payment Gateway Processes**
```
Client enters UPI ID or Card details
         ↓
Google Pay / Razorpay / Stripe processes
         ↓
Money deducted from client's bank
         ↓
Razorpay/Stripe returns payment confirmation
```

#### **Step 3: Backend Verifies Payment**
```javascript
router.post('/verify-milestone-payment', (req, res) => {
  // Input: razorpay_payment_id, razorpay_signature, contractId, milestoneId
  // Verify signature using RAZORPAY_KEY_SECRET
  // Update transaction: status = "held"
  // Update milestone: status = "in_progress"
  // Output: confirmed transaction
})
```

Example:
```javascript
const verifyMilestonePayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  // Verify with backend secret key
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generated_signature === razorpay_signature) {
    // Payment verified ✅
    // Store: Transaction.razorpayPaymentId = razorpay_payment_id
    // Status: Transaction.status = "held"
    // Calculate fees
  }
}
```

#### **Step 4: Money Held in Escrow**
```
Example: Milestone amount = ₹10,000

Calculation:
├─ Gross amount: ₹10,000
├─ Platform fee (10%): ₹1,000
└─ Developer earnings: ₹9,000

Database Record:
{
  type: 'milestone_payment',
  amount: 10000,          // Total paid by client
  platformFee: 1000,      // 10%
  developerEarnings: 9000, // 90%
  status: 'held',         // Escrow
  razorpayPaymentId: 'pay_xxx',
}
```

#### **Step 5: Developer Completes Work**
```
Developer uploads deliverables
        ↓
Milestone: "in_progress" → "completed"
        ↓
Client notified to review
```

#### **Step 6: Client Releases Payment**
```javascript
router.post('/release-milestone', (req, res) => {
  // Input: contractId, milestoneId
  // Only client can release
  // Update transaction: status = "released"
  // Add to developer's wallet:
  //   wallet.availableBalance += 9000
  //   wallet.totalEarnings += 9000
  // Add to platform revenue: 1000
})
```

#### **Step 7: Developer Gets Money in Wallet**

```
BEFORE RELEASE:
┌─────────────────────────────────┐
│ Developer Wallet                │
├─────────────────────────────────┤
│ Available Balance:  ₹5,000      │
│ Pending Earnings:   ₹2,000      │
│ Total Earned:       ₹7,000      │
└─────────────────────────────────┘

AFTER RELEASE:
┌─────────────────────────────────┐
│ Developer Wallet                │
├─────────────────────────────────┤
│ Available Balance:  ₹14,000      │ ← +₹9,000
│ Pending Earnings:   ₹0          │
│ Total Earned:       ₹16,000     │ ← +₹9,000
└─────────────────────────────────┘
```

### Database Changes

```javascript
// Transaction record
{
  _id: ObjectId(),
  type: 'milestone_payment',
  contractId: ObjectId(),
  milestoneId: ObjectId(),
  clientId: ObjectId(),
  developerId: ObjectId(),
  amount: 10000,
  platformFee: 1000,
  developerEarnings: 9000,
  commissionRate: 10,
  paymentMethod: 'razorpay',
  razorpayPaymentId: 'pay_xxx',
  status: 'released', // pending → held → released
  createdAt: Date,
  releasedAt: Date, // When client released
}

// Wallet update
{
  userId: developerId,
  availableBalance: 14000, // +9000
  totalEarnings: 16000,    // +9000
  pendingEarnings: 0,      // -9000
}

// Milestone update
{
  _id: milestoneId,
  status: 'released', // pending → awaiting_payment → in_progress → completed → released
}
```

---

## Transaction 2️⃣: Developer → Developer's Bank (Withdrawal)

### Goal
Developer withdraws earned money to their bank account or UPI

### Money Flow
```
DEVELOPER'S WALLET
     ↓ (withdrawal request)
TECH-MATES PROCESSING
     ↓
RAZORPAY PAYOUTS API
     ↓
BANK NETWORK (NEFT/IMPS)
     ↓
DEVELOPER'S BANK ACCOUNT
```

### Steps

#### **Step 1: Developer Views Earnings**
```
Developer → Earnings Dashboard
Sees:
├─ Available Balance: ₹14,000
├─ Pending Earnings: ₹2,000 (waiting for client release)
└─ Total Earned: ₹16,000

Click "Withdraw" button
```

#### **Step 2: Enter Withdrawal Details**
```jsx
// Frontend: PayoutManagement.jsx or BankWithdrawal.jsx

const handleWithdraw = async () => {
  const data = {
    amount: 10000,          // ₹10,000
    method: 'bank',         // or 'upi'
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'John Doe',
      accountType: 'savings',
    },
    // OR for UPI:
    upiId: 'johndoe@okhdfcbank',
  }

  const response = await fetch('/api/wallet/create-payout', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

#### **Step 3: Backend Validation**
```javascript
router.post('/wallet/create-payout', (req, res) => {
  // Check: Amount >= ₹500 (minimum)
  // Check: Amount <= Available Balance
  // Check: KYC verified
  // Check: Bank details valid IFSC format
  
  if (amount < 50000) { // ₹500 in paise
    return res.error('Minimum withdrawal is ₹500')
  }
  
  if (!user.kycVerified) {
    return res.error('KYC verification required')
  }
})
```

#### **Step 4: Create Payout via Razorpay**
```javascript
const createPayout = async (developerId, amount, bankDetails) => {
  const razorpay = require('razorpay')
  
  const payout = await razorpay.payouts.create({
    accountNumber: bankDetails.accountNumber,
    ifsc: bankDetails.ifscCode,
    mode: 'NEFT', // NEFT for ₹100k+, IMPS for < ₹100k
    amount: amount, // in paise
    purpose: 'payout',
    narration: 'Developer earnings payout',
    reference_id: `payout_${developerId}_${Date.now()}`,
  })
  
  return payout
}
```

#### **Step 5: Deduct from Developer's Wallet**
```javascript
// Wallet deduction
wallet.availableBalance -= 10000 // ₹10,000
wallet.totalWithdrawn += 10000

// Transaction record
{
  type: 'payout',
  developerId,
  amount: 10000,
  method: 'bank',
  status: 'pending', // pending → processing → completed
  razorpayPayoutId: 'pout_xxx',
  bankDetails: {
    accountNumber: '****7890', // Hide most digits
    ifscCode: 'SBIN0001234',
  },
}
```

#### **Step 6: Money Processes (2-5 Days)**
```
Day 1: Withdrawal requested
       Status: "pending"
       ↓
Day 2-3: Bank processes via NEFT/IMPS
         Status: "processing"
         ↓
Day 4-5: Money in developer's account
         Status: "completed"
         Email: "Withdrawal completed! ₹10,000 received"
```

### Wallet State During Withdrawal

```
BEFORE:
Available Balance: ₹14,000
Total Withdrawn: ₹5,000

DURING:
Available Balance: ₹4,000     ← -₹10,000 immediately
Total Withdrawn: ₹15,000     ← Pending completion
Status: Payout in progress

AFTER (2-5 days):
Available Balance: ₹4,000
Total Withdrawn: ₹15,000
Status: Payout completed ✅
```

---

## Transaction 3️⃣: Developer → Tech-Mates (Subscription)

### Goal
Developer upgrades to Pro or Max subscription

### Money Flow
```
DEVELOPER'S BANK / PAYMENT METHOD
     ↓ (payment)
PAYMENT GATEWAY (Razorpay/Stripe)
     ↓
TECH-MATES SUBSCRIPTION ACCOUNT
     ↓
SUBSCRIPTION ACTIVATED
```

### Steps

#### **Step 1: Developer Views Plans**
```
Developer → Subscription page
Sees 3 plans:
├─ Free (current)
│  └─ Basic features
├─ Pro (₹839/month)
│  └─ Advanced features + Badge
└─ Max (₹4,145/month)
   └─ All features + Premium badge + Priority support
```

#### **Step 2: Click Upgrade**
```
Developer clicks "Upgrade to Pro"
     ↓
Redirected to SubscriptionCheckout page
     ↓
Shows: "Plan: Pro", "Amount: ₹839"
```

#### **Step 3: Select Payment Method**
```jsx
const paymentMethods = [
  { id: 'upi', label: 'UPI (Fastest)', recommended: true },
  { id: 'card', label: 'Credit/Debit Card' },
]

Developer selects: UPI
```

#### **Step 4: Process Payment**
```javascript
// Frontend: Create Razorpay order
const createOrder = async () => {
  const response = await fetch('/api/payments/razorpay-order', {
    method: 'POST',
    body: JSON.stringify({
      amount: 83900,  // ₹839 in paise
      planId: 'pro',
    }),
  })
  const { orderId } = await response.json()
  
  // Open Razorpay checkout
  const options = {
    key: 'rzp_test_xxx',
    order_id: orderId,
    handler: (response) => {
      // Verify payment
      verifyRazorpayPayment(response)
    },
  }
  new window.Razorpay(options).open()
}
```

#### **Step 5: Backend Creates Subscription**
```javascript
router.post('/subscription/upgrade', (req, res) => {
  // Input: planId ('pro' or 'max')
  // Create subscription record:
  // {
  //   userId,
  //   plan: 'pro',
  //   status: 'active',
  //   amountPaid: 83900,
  //   currentPeriodStart: now,
  //   currentPeriodEnd: now + 30 days,
  //   cancellationScheduled: false,
  // }
  
  // Update user:
  // user.subscription = 'pro'
  // user.subscriptionStatus = 'active'
})
```

#### **Step 6: Subscription Activated**
```
✅ Subscription Created
   Plan: Pro
   Amount: ₹839
   Valid Until: April 3, 2027
   
✅ User Features Updated
   Badge added: "Pro Developer"
   Featured listings enabled
   Priority support enabled

✅ Success Page
   Shows what's unlocked
   Link to dashboard
```

### Database Changes

```javascript
// Subscription record
{
  _id: ObjectId(),
  userId: developerId,
  stripeSubscriptionId: 'sub_xxx' OR 'free-123',
  stripeCustomerId: 'cus_xxx',
  plan: 'pro',
  status: 'active',
  amount: 83900, // ₹839 in paise
  currentPeriodStart: Date,
  currentPeriodEnd: Date(+30 days),
  cancelAtPeriodEnd: false,
  createdAt: Date,
  updatedAt: Date,
}

// User updated
{
  _id: developerId,
  subscription: 'pro',
  subscriptionStatus: 'active',
  subscriptionId: ObjectId(subscription._id),
  subscriptionEnddate: Date,
}

// Transaction record
{
  type: 'subscription_payment',
  userId: developerId,
  plan: 'pro',
  amount: 83900,
  paymentMethod: 'razorpay',
  razorpayPaymentId: 'pay_xxx',
  status: 'completed',
  createdAt: Date,
}
```

---

## Complete Developer Wallet Lifecycle

```
DAY 1: Developer starts
┌─────────────────────────────┐
│ Available Balance:  ₹0      │
│ Total Earned:       ₹0      │
│ Total Withdrawn:    ₹0      │
│ Subscription:       Free    │
└─────────────────────────────┘

DAY 5: First milestone released
┌─────────────────────────────┐
│ Available Balance:  ₹9,000   │ ← +₹9,000 (90% of ₹10k)
│ Total Earned:       ₹9,000   │
│ Total Withdrawn:    ₹0       │
│ Subscription:       Free    │
└─────────────────────────────┘

DAY 10: Upgrades to Pro subscription
┌─────────────────────────────┐
│ Available Balance:  ₹8,161   │ ← -₹839 (subscription)
│ Total Earned:       ₹9,000   │
│ Total Withdrawn:    ₹0       │
│ Subscription:       Pro      │ ✅
└─────────────────────────────┘

DAY 15: Second milestone released
┌─────────────────────────────┐
│ Available Balance:  ₹17,161  │ ← +₹9,000 (90% of ₹10k)
│ Total Earned:       ₹18,000  │
│ Total Withdrawn:    ₹0       │
│ Subscription:       Pro      │
└─────────────────────────────┘

DAY 20: Withdraws ₹10,000
┌─────────────────────────────┐
│ Available Balance:  ₹7,161   │ ← -₹10,000 (withdrawal)
│ Total Earned:       ₹18,000  │
│ Total Withdrawn:    ₹10,000  │ (pending)
│ Subscription:       Pro      │
└─────────────────────────────┘

DAY 25: Withdrawal completed
┌─────────────────────────────┐
│ Available Balance:  ₹7,161   │
│ Total Earned:       ₹18,000  │
│ Total Withdrawn:    ₹10,000  │ ✅ Completed
│ Subscription:       Pro      │ (expires: Apr 2027)
└─────────────────────────────┘
```

---

## Transaction Summary Table

| Transaction | From | To | Amount | Status | Time |
|-------------|------|-----|--------|--------|------|
| Milestone Payment | Client Bank | Developer Wallet | ₹9,000 (90%) | Pending client release | Instant after payment |
| Platform Fee | Client Bank | Tech-Mates | ₹1,000 (10%) | Automatic | Instant after payment |
| Withdrawal | Developer Wallet | Developer Bank | ₹10,000 | Pending | 2-5 days |
| Subscription | Developer Bank | Tech-Mates | ₹839 | Paid | Monthly/Yearly |

---

## API Endpoints for All 3 Transactions

### Transaction 1: Milestone Payments
```
POST   /api/payments/fund-milestone
       Input: { contractId, milestoneId, paymentMethod }
       Output: { orderId/clientSecret, transaction }

POST   /api/payments/verify-milestone-payment
       Input: { razorpay_payment_id, razorpay_signature, contractId }
       Output: { transaction, status: 'held' }

POST   /api/payments/release-milestone
       Input: { contractId, milestoneId }
       Output: { transaction, status: 'released', walletUpdated }
```

### Transaction 2: Withdrawals
```
POST   /api/wallet/create-payout
       Input: { amount, method, bankDetails/upiId }
       Output: { transaction, status: 'pending', razorpayPayoutId }

GET    /api/wallet/balance
       Output: { availableBalance, totalEarnings, totalWithdrawn }

GET    /api/wallet/payouts
       Output: [ { payout1, payout2, ... } ]
```

### Transaction 3: Subscriptions
```
POST   /api/payments/razorpay-order
       Input: { amount, planId }
       Output: { orderId }

POST   /api/payments/verify-razorpay
       Input: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
       Output: { subscription, status: 'active' }

GET    /api/payments/subscription
       Output: { plan, status, expiryDate }

POST   /api/payments/subscription/cancel
       Output: { status: 'scheduled_for_cancellation' }
```

---

## Wallet Balance Formula

```
WALLET BALANCE AT ANY TIME = 

  Total Earned from Milestones
  - Total Withdrawn to Bank
  - Subscription Fees Paid
  + Any Refunds/Adjustments

Example:
  Milestone 1 released: +₹9,000
  Milestone 2 released: +₹9,000
  Subscription (Pro):   -₹839
  Withdrawal to bank:   -₹10,000
  ────────────────────
  Current Balance:      ₹7,161
```

---

## Integration Checklist

- [ ] **Transaction 1: Milestone Payments**
  - [ ] `fundMilestone()` backend endpoint
  - [ ] Payment gateway integration (Razorpay/Stripe)
  - [ ] Payment verification
  - [ ] Money distribution (90% / 10%)
  - [ ] Escrow system

- [ ] **Transaction 2: Withdrawals**
  - [ ] Razorpay Payouts API integration
  - [ ] Withdrawal form UI
  - [ ] Wallet deduction logic
  - [ ] KYC verification check
  - [ ] Payout history tracking

- [ ] **Transaction 3: Subscriptions**
  - [ ] Payment method selection (UPI/Card)
  - [ ] Razorpay order creation
  - [ ] Payment verification
  - [ ] Subscription activation
  - [ ] Auto-renewal handling

---

## Testing Scenarios

### Scenario 1: Full Cycle
```
1. Developer creates account (Free)
2. Client hires developer for ₹10,000 project (2 milestones)
3. Client funds milestone 1 (₹5,000)
4. Developer completes milestone 1
5. Client releases ₹5,000 → Dev gets ₹4,500
6. Developer upgrades to Pro (pays ₹839)
7. Developer's balance: ₹3,661
8. Developer withdraws ₹3,000 to bank
9. Money arrives in 2-5 days
10. Client funds milestone 2 (₹5,000)
11. Dev completes, client releases
12. Dev gets ₹4,500 (total in wallet: ₹5,500 assuming withdrawal completed)
```

### Expected Results
```
Total Earned:           ₹9,000
Subscription Paid:      ₹839
Withdrawal Completed:   ₹3,000
Current Balance:        ₹5,161 ✓
```

---

## Security Notes

⚠️ **Critical**:
- All amounts in **paise** in database
- Display in **rupees** in UI
- Verify all payment signatures with secret keys
- Never log full bank details
- Store only last 4 digits
- KYC required before withdrawal
- Rate limit withdrawal requests
- Use HTTPS only for all payments
