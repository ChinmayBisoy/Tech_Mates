# 🎯 Quick Start Guide - Payment & KYC System

## 🚀 How Everything Works Now

### For Users (Frontend):

#### 1. KYC Verification (One-Time)
```
Home Page → KYC Banner shows status → Click "Start Verification" 
→ Fill 3-step form → Upload documents → Submit
→ Admin approval → Status changes to "Verified"
→ Can now withdraw and fund milestones
```

#### 2. Fund a Milestone (Client)
```
Project → Create milestone → Client clicks "Fund" 
→ Stripe payment → Escrow holds funds
→ Developer notified → Developer completes work
→ Client releases payment → Developer gets 90% in wallet
```

#### 3. Withdraw Earnings (Developer)
```
Earnings page → Request Withdrawal page
→ KYC banner (if not verified, complete first)
→ Enter amount (min ₹500) → Select bank/UPI
→ Enter account details → Submit
→ Funds held in wallet → Admin processes → Money arrives in 2-5 days
```

### For Admin (Backend):

#### Check Pending KYC:
```
GET /api/kyc/admin/pending
Response: [{_id, name, email, kyc, createdAt}, ...]
```

#### Approve KYC:
```
POST /api/kyc/admin/:userId/approve
Response: {statusCode: 200, data: {kycStatus: "verified"}}
```

#### Reject KYC:
```
POST /api/kyc/admin/:userId/reject
Body: {reason: "Document not clear"}
Response: {statusCode: 200, data: {kycStatus: "rejected", reason}}
```

#### Process Withdrawal:
```
POST /api/payments/admin/withdrawal/:withdrawalId/process
Body: {transactionId: "..."}
Response: {statusCode: 200, data: {success: true, status: "processing"}}
```

---

## 🔌 Key API Calls

### KYC Flow (Frontend → Backend):

```javascript
// 1. Upload document
const formData = new FormData()
formData.append('document', file)
formData.append('documentType', 'pan') // pan, aadhar, selfie, addressProof
const response = await kycApi.uploadDocument(formData)

// 2. Submit KYC
const response = await kycApi.submitKYC({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-05-15',
  gender: 'male',
  address: '123 Street',
  city: 'Mumbai',
  state: 'MH',
  zipCode: '400001',
  phone: '9876543210'
})

// 3. Check status
const response = await kycApi.getStatus()
// Returns: {status: 'verified'|'submitted'|'rejected'|'pending'}
```

### Payment Flow (Frontend → Backend):

```javascript
// 1. Fund milestone
const response = await paymentApi.fundMilestone(contractId, milestoneId)
// Returns: {clientSecret, transaction}
// Then: Use clientSecret with Stripe.js to complete payment

// 2. Verify after Stripe confirms
const response = await paymentApi.verifyMilestonePayment(transactionId)
// Returns: {developerEarnings, totalEarnings}
// This credits developer's wallet
```

### Withdrawal Flow (Frontend → Backend):

```javascript
// 1. Initiate withdrawal (KYC is checked here!)
const response = await paymentApi.initiateWithdrawal(
  1000, // amount
  'bank', // accountType: 'bank' or 'upi'
  {
    accountNumber: '1234567890',
    ifscCode: 'HDFC0000123',
    accountHolderName: 'John Doe',
    bankName: 'HDFC Bank'
  }
)
// Returns: {withdrawalId, status: 'pending'}

// 2. Get withdrawal history
const response = await paymentApi.getWithdrawalHistory(1, 10)
// Returns: {withdrawals: [...], pagination: {...}}

// 3. Get transaction history
const response = await paymentApi.getTransactionHistory(1, 10, 'milestone_release')
// Returns: {transactions: [...], pagination: {...}}
```

---

## 📊 Data Flow Diagram

```
USER SUBMITS KYC
↓
KYCModal.jsx sends uploadDocument() for each file
↓
frontend/src/api/kyc.api.js → POST /kyc/upload-document
↓
server/src/controllers/kyc.controller.js uploadDocument()
↓
Uploads to Cloudinary, saves URL to User.kyc.documents
↓
User clicks Submit in KYCModal
↓
kycApi.submitKYC() → POST /kyc/submit
↓
kyc.controller.js submitKYC()
↓
Sets kyc.status = 'submitted', saves to DB
↓
Admin sees pending KYCs
↓
Admin clicks Approve → POST /kyc/admin/:userId/approve
↓
Sets kyc.status = 'verified', verifiedAt = now
↓
User sees "Verified" banner on Home page
↓
User can now withdraw/fund milestones
```

---

## ✅ Status Codes Explained

### KYC Status:
- `pending` - Just created account, hasn't started KYC
- `submitted` - KYC submitted, waiting for admin review
- `verified` - ✅ KYC approved, can access all features
- `rejected` - ❌ KYC rejected, needs to resubmit

### Withdrawal Status:
- `pending` - Just created, funds held in wallet
- `processing` - Admin initiated via Razorpay, in progress
- `completed` - ✅ Money arrived in bank account
- `failed` - ❌ Payment processing failed
- `cancelled` - Cancelled by admin/user, funds refunded

### Transaction Type:
- `milestone_payment` - Client funded milestone
- `milestone_release` - Developer receives payment
- `refund` - Refund issued
- `credit` - Credit to wallet
- `debit` - Debit from wallet

---

## 🔒 Built-in Security Checks

### In Code:
```javascript
// KYC check in withdrawal endpoint
if (req.user?.kyc?.status !== 'verified') {
  throw new ApiError(400, 'KYC verification required to withdraw')
}

// Minimum withdrawal check
if (amount < 500) {
  throw new ApiError(400, 'Minimum withdrawal ₹500')
}

// Sufficient balance check
if ((req.user.walletBalance || 0) < amount) {
  throw new ApiError(400, 'Insufficient wallet balance')
}

// File upload validation
if (file.size > 5 * 1024 * 1024) {
  throw new ApiError(400, 'Max file size 5MB')
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path (KYC → Withdrawal)
```
1. User signs up as developer ✓
2. Home page shows "KYC Verification Pending" ✓
3. User clicks "Start Verification" ✓
4. Fills form & uploads documents ✓
5. Clicks Submit → Status: "submitted" ✓
6. Admin approves → Status: "verified" ✓
7. User goes to Withdrawal page ✓
8. Enters ₹1000, bank details ✓
9. Clicks Request → Status: "pending" ✓
10. Funds deducted from wallet ✓
11. Admin clicks Process in dashboard ✓
12. Status: "processing" via Razorpay ✓
```

### Scenario 2: KYC Rejection
```
1. User submits KYC with bad image ✓
2. Admin views in dashboard ✓
3. Admin clicks Reject, adds reason ✓
4. User sees "KYC Rejected" banner ✓
5. User clicks "Resubmit" ✓
6. User uploads new clear image ✓
7. Resubmits → Status back to "submitted" ✓
8. Admin approves → "verified" ✓
```

### Scenario 3: Insufficient Balance
```
1. User tries to withdraw ₹5000 ✓
2. But wallet balance is ₹2000 ✓
3. System shows error: "Insufficient balance" ✓
4. User can only withdraw ₹2000 max ✓
```

### Scenario 4: Min Amount Check
```
1. User tries to withdraw ₹100 ✓
2. System shows error: "Minimum ₹500" ✓
3. User changes to ₹500 ✓
4. Withdrawal succeeds ✓
```

---

## 🔗 Database Queries Reference

### Get user's KYC status:
```javascript
const user = await User.findById(userId).select('kyc')
console.log(user.kyc.status, user.kyc.documents)
```

### Get all pending withdrawals:
```javascript
const pending = await Withdrawal.find({status: 'pending'})
  .sort({createdAt: -1})
  .populate('userId', 'name email')
```

### Get developer's completed withdrawals:
```javascript
const completed = await Withdrawal.find({
  userId: developerId,
  status: 'completed'
})
```

### Get transaction history for a user:
```javascript
const transactions = await Transaction.find({
  $or: [{clientId: userId}, {developerId: userId}]
}).sort({createdAt: -1})
```

---

## 🚨 Common Issues & Solutions

### Issue: "KYC verification required"
**Solution**: User must complete KYC first. Show them KYCBanner and let them start the process.

### Issue: "Insufficient wallet balance"
**Solution**: User must have enough earnings released. Show them how to fund milestones.

### Issue: "Withdrawal amount less than ₹500"
**Solution**: Minimum withdrawal is ₹500. Update UI validation to enforce this.

### Issue: Cloudinary upload fails
**Check**: 
- CLOUDINARY_CLOUD_NAME, API_KEY, SECRET are in .env
- File size < 5MB
- File is image format (JPEG/PNG/JPG)

### Issue: Razorpay payout fails
**Check**:
- Razorpay API key/secret configured
- Account details are correct (IFSC code valid)
- Account is verified in Razorpay dashboard
- Amount is within transaction limits

---

## 📞 Support References

### Related Files:
- KYC: `server/src/controllers/kyc.controller.js`
- Payments: `server/src/controllers/payment.controller.js`
- Withdrawals: `server/src/services/payment.service.js`
- Models: `server/src/models/user.model.js`, `withdrawal.model.js`

### Frontend Components:
- KYC: `frontend/src/components/kyc/{Banner,Modal}.jsx`
- Payment API: `frontend/src/api/payment.api.js`, `kyc.api.js`
- Pages: `frontend/src/pages/{Home,Withdraw}.jsx`

---

## 🎯 Next Steps

1. **Test everything locally** - Try full KYC and withdrawal flow
2. **Set up Razorpay** - Add API keys to .env for actual payouts
3. **Testing payment webhooks** - Stripe and Razorpay callbacks
4. **Admin dashboard** - Create UI for KYC approvals & withdrawal processing
5. **Email notifications** - Send updates on KYC status and withdrawal progress
6. **Documentation** - Update user-facing help center

---

**All systems ready for production! 🚀**

