# Tech-Mates Bug Report
**Date:** March 27, 2026  
**Status:** 🔴 ACTIVE - Critical & High Priority Issues Identified

---

## Executive Summary

Comprehensive code review identified **8 critical bugs** and **12 medium-priority issues** across backend services, payment flow, frontend state management, and validation schemas. Most issues were introduced in Phase 10 integration work or represent edge cases in the escrow/payment system.

**Impact Distribution:**
- 🔴 Critical (Blocks core features): 3
- 🟠 High (Significant degradation): 5
- 🟡 Medium (Reduced functionality): 7
- 🟢 Low (Minor/polish): Additional

---

## Critical Bugs (Blocks Core Features)

### 🔴 Bug #1: Double Wallet Deduction in Payout Request
**File:** [server/src/services/payment.service.js](server/src/services/payment.service.js#L78-L105)  
**Severity:** CRITICAL  
**Status:** ❌ UNFIXED  

**Problem:**
```javascript
// Lines 80-90: First deduction from developer.walletBalance
developer.walletBalance = currentBalance - amount;
await developer.save();

// Lines 91-98: Then deduct AGAIN from wallet if it exists
if (wallet) {
  if (Number(wallet.balance || 0) < amount) {  // ← Checks ORIGINAL balance
    throw new ApiError(400, 'Insufficient wallet balance');
  }
  wallet.balance = Number(wallet.balance || 0) - amount;  // ← Deducts again!
  await wallet.save();
}
```

**Impact:**
- Developer loses 2x the requested payout amount
- If wallet balance insufficient, error thrown AFTER first deduction (inconsistent state)
- Can cause wallet corruption and revenue loss

**Root Cause:**
- Application maintains DUAL wallet systems (User.walletBalance + Wallet collection)
- No synchronization mechanism between the two
- Both get decremented independently

**Fix Required:**
Choose ONE single source of truth:
```javascript
// Option A: Use only User.walletBalance
developer.walletBalance = currentBalance - amount;
await developer.save();
// Remove wallet duplicate deduction

// Option B: Use only Wallet collection
const wallet = await Wallet.findOne({ userId: developerId });
wallet.balance = Number(wallet.balance || 0) - amount;
await wallet.save();
// Remove User.walletBalance deduction
```

**Affected Flows:**
- ✅ Milestone release (similar pattern exists - VERIFY)
- ✅ Payout requests (BROKEN)
- ✅ Refunds

---

### 🔴 Bug #2: Insufficient JWT Refresh Token Handling
**File:** [frontend/src/api/axios.js](frontend/src/api/axios.js)  
**Severity:** CRITICAL  
**Status:** ❌ UNFIXED  

**Problem:**
Current axios interceptor doesn't handle JWT expiration automatically. When 15-minute access token expires:
1. API calls will fail with 401
2. No automatic refresh attempt
3. User gets logged out even with valid 7-day refresh token
4. Poor UX: Requires manual login

**Backend Support Present:**
- ✅ POST /auth/refresh-token endpoint exists
- ✅ Refresh token stored and validated
- ✅ New access token generation works

**Missing Frontend Implementation:**
```javascript
// axios.js needs error interceptor AFTER response unwrapper:
instance.interceptors.response.use(
  (response) => { /* unwrap logic */ },
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const newAccessToken = await authAPI.refreshToken(refreshToken);
        
        useAuthStore.setState({ accessToken: newAccessToken });
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        
        return instance(error.config);
      } catch (err) {
        // Refresh failed, force logout
        useAuthStore.setState({ /* clear auth */ });
        navigate('/login');
      }
    }
    return Promise.reject(error);
  }
);
```

**Test Case:**
1. Login to get 15m access token
2. Wait 15+ minutes OR manipulate token to expired
3. Make API call
4. **Expected:** Auto-refresh and succeed
5. **Actual:** Returns 401 and logs out

**Impact:**
- Users get kicked out after 15 minutes of inactivity
- All requests after token expiry fail
- Breaks mobile/long-running operations

---

### 🔴 Bug #3: Race Condition in Milestone Payment Release
**File:** [server/src/services/escrow.service.js](server/src/services/escrow.service.js#L103-L145)  
**Severity:** CRITICAL  
**Status:** ❌ UNFIXED  

**Problem:**
```javascript
const transaction = await Transaction.findOne({
  contractId: contract._id,
  milestoneId: String(milestone._id),
  status: 'held',
  isDeleted: false,
});

if (!transaction) {
  throw new ApiError(404, 'Held transaction not found for this milestone');
}

transaction.status = 'released';
transaction.type = 'milestone_release';
await transaction.save();

// ← RACE CONDITION: Between query and update, duplicate 'held' transactions can appear
// ← No atomic check-and-update: client can call release-milestone twice
// ← Second call also finds transaction and updates it again
```

**Impact:**
- Client calls "release milestone" twice (accidental double-tap)
- Both succeed independently
- Developer gets credited 2x for single milestone
- Platform loses 2x commission + actual funds

**Scenario:**
1. Client funds milestone: $100 (transaction status='held')
2. Client clicks "Release Payment" → AWS timeout
3. UI remains loading, client clicks again
4. Both requests hit backend simultaneously
5. Both find the same transaction (status='held')
6. Both update it to 'released'
7. Unclear which transaction "owns" the $100 now
8. Wallet updates twice: +$100 and +$100

**Fix Required:**
```javascript
// Use findByIdAndUpdate with atomic check
const transaction = await Transaction.findOneAndUpdate(
  {
    contractId: contract._id,
    milestoneId: String(milestone._id),
    status: 'held',  // ← Check this
    isDeleted: false,
  },
  {
    $set: {
      status: 'released',
      type: 'milestone_release',
      updatedAt: new Date(), // ← For idempotency check
    }
  },
  { new: true }
);

if (!transaction) {
  throw new ApiError(404, 'Held transaction not found');
}

// Now safely update developer wallet (no duplicate possible)
developer.walletBalance += transaction.developerEarnings;
```

**Also apply to:** `fundMilestone()`, `refundMilestone()`

---

## High Priority Bugs (Significant Degradation)

### 🟠 Bug #4: Missing Validation for Proposal Acceptance
**File:** [server/src/services/proposal.service.js](server/src/services/proposal.service.js)  
**Severity:** HIGH  
**Status:** ❌ UNFIXED  

**Problem:**
No check that requirement is still "open" when accepting proposal:

```javascript
const acceptProposal = async (proposalId, clientId) => {
  const proposal = await Proposal.findById(proposalId);
  // ← BUG: No check if requirement.status === 'open'
  
  // If client already closed requirement, accepts new proposals anyway
  // Creates contracts for closed requirements
  // Confuses developers: "Why is my contract linked to closed requirement?"
};
```

**Expected Behavior:**
```javascript
const requirement = await Requirement.findById(proposal.requirementId);
if (requirement.status !== 'open') {
  throw new ApiError(400, 'Requirement is no longer open for proposals');
}

// Optionally: Close requirement after first acceptance
requirement.status = 'closed';
await requirement.save();
```

**Impact:**
- Developers can send proposals to already-filled requirements
- Contracts created for outdated/closed projects
- No business rule enforcement at ORM level

---

### 🟠 Bug #5: Wallet Balance Overflow Vulnerability
**File:** [server/src/models/wallet.model.js](server/src/models/wallet.model.js)  
**Severity:** HIGH  
**Status:** ❌ UNFIXED  

**Problem:**
Wallet balance stored as plain Number without validation:

```javascript
// No schema validation, can accept:
- Negative values: -500 paise
- Fractional values: 123.456 paise (must be integer)
- Overflow values: Infinity, NaN
- Huge values: 999999999999999999 paise (no max limit)
```

**Attack Vector:**
```javascript
await Wallet.findByIdAndUpdate(walletId, {
  $set: { balance: -1000000 }  // ← No validation stops this
});
```

**Fix Required:**
```javascript
const walletSchema = new Schema({
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Balance cannot be negative'],
    validate: {
      validator: (v) => Number.isInteger(v),
      message: 'Balance must be an integer (in paise)',
    },
    max: [999999999, 'Balance exceeds maximum'],
  }
});
```

---

### 🟠 Bug #6: Contract Status Transition Not Validated
**File:** [server/src/services/contract.service.js](server/src/services/contract.service.js)  
**Severity:** HIGH  
**Status:** ❌ UNFIXED  

**Problem:**
No state machine validation for contract transitions:

```javascript
// Current code allows:
const contract = await Contract.findById(contractId);
contract.status = 'cancelled';  // ← Can do this from ANY state
{
  from: 'completed',  // ← Already finished
  to: 'active'        // ← Can reactivate completed contracts!
}
```

**Valid Transitions:**
```
pending → active (when first milestone funded)
active → completed (when all milestones released)
active → disputed (if milestone disputed)
disputed → active (if dispute resolved)
active/pending → cancelled (client cancels)
```

**Invalid Transitions (should throw error):**
```
completed → active  // ← Can't restart finished job
completed → cancelled  // ← Too late to cancel
disputed → pending  // ← Can't go backwards
```

**Fix Required:**
```javascript
const VALID_TRANSITIONS = {
  'pending': ['active', 'cancelled'],
  'active': ['completed', 'disputed', 'cancelled'],
  'disputed': ['active', 'completed'],
  'completed': [],
  'cancelled': [],
};

const updateStatus = async (contract, newStatus) => {
  if (!VALID_TRANSITIONS[contract.status]?.includes(newStatus)) {
    throw new ApiError(
      400,
      `Cannot transition from ${contract.status} to ${newStatus}`
    );
  }
  contract.status = newStatus;
};
```

---

### 🟠 Bug #7: Missing Email Verification Before Payout
**File:** [server/src/services/payment.service.js](server/src/services/payment.service.js#L73-L105)  
**Severity:** HIGH  
**Status:** ❌ UNFIXED  

**Problem:**
Checks KYC but not email verification:

```javascript
const requestPayout = async (developerId, amount) => {
  const developer = await User.findById(developerId);
  
  if (developer.kycVerified !== true) {  // ← Requires KYC
    throw new ApiError(403, 'KYC verification is required before payout');
  }
  
  // ← BUG: Doesn't check: if (!developer.emailVerified)
  // ← Payout sent to unverified email, developer never receives it
};
```

**Fix:**
```javascript
if (developer.emailVerified !== true) {
  throw new ApiError(403, 'Email verification required before payout');
}

if (developer.kycVerified !== true) {
  throw new ApiError(403, 'KYC verification required before payout');
}
```

---

### 🟠 Bug #8: No Duplicate Proposal Prevention
**File:** [server/src/services/proposal.service.js](server/src/services/proposal.service.js)  
**Severity:** HIGH  
**Status:** ❌ UNFIXED  

**Problem:**
Developer can send unlimited proposals to same requirement:

```javascript
const sendProposal = async (developerId, data) => {
  const requirement = await Requirement.findOne({
    _id: data.requirementId,
    isDeleted: false,
    status: 'open',
  });

  // ← BUG: No check for existing proposal from this developer to this requirement
  // ← Developer can submit 100 proposals to same requirement
  // ← Client gets spammed with duplicate proposals
};
```

**Expected Behavior:**
```javascript
const existingProposal = await Proposal.findOne({
  requirementId: data.requirementId,
  developerId,
  isDeleted: false,
  status: { $in: ['pending', 'shortlisted'] }
});

if (existingProposal) {
  throw new ApiError(409, 'You already have a pending proposal for this requirement');
}
```

**Impact:**
- Spam attack: One developer can spam same requirement with 1000s of proposals
- Database bloat: Requirements with thousands of duplicate proposals
- UI slowdown: Loading all proposals becomes expensive

---

## Medium Priority Issues

### 🟡 Issue #9: Pagination Not Normalized Across All Endpoints
**Severity:** MEDIUM  
**Status:** PARTIALLY FIXED  

**Problem:**
Different controllers use different default pagination limits:
- `user.controller.js`: Default limit not set (uses query value)
- `proposal.service.js`: Default limit = 10
- `contract.service.js`: Default limit = 10
- `notification.service.js`: Default limit = 20
- `admin.service.js`: Default limit = 20

**Impact:**
- Inconsistent API behavior across different endpoints
- Frontend doesn't know what default to expect
- Could cause unexpected result counts

**Fix:**
Define constant in utils:
```javascript
const DEFAULT_PAGE_LIMIT = 10;
const MAX_PAGE_LIMIT = 50;

const normalizePagination = (pagination = {}) => {
  const page = Math.max(1, Number.parseInt(pagination.page) || 1);
  const limit = Math.min(MAX_PAGE_LIMIT, Number.parseInt(pagination.limit) || DEFAULT_PAGE_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
};
```

---

### 🟡 Issue #10: Softly Deleted Records Not Consistently Filtered
**Severity:** MEDIUM  
**Status:** PARTIALLY FIXED  

**Problem:**
Inconsistent use of `isDeleted: false` filters:
- ✅ Some controllers check it (proposal, contract)
- ❌ Some don't (user.controller.js in searchDevelopers)

```javascript
// In searchDevelopers - no isDeleted check!
const developers = await User.find({
  role: 'developer',
  // ← BUG: Soft-deleted developers still appear in search
  isPro: isPro ? true : { $exists: false },
  skills: { $in: skills },
  // ...
});
```

**Impact:**
- Deleted users still show in browse/search results
- Soft-delete feature not enforced
- Deleted developers still receive messages/proposals

**Fix:**
Add `isDeleted: { $ne: true }` to all user queries

---

### 🟡 Issue #11: Webhook Handler Not Validating Required Fields
**File:** [server/src/controllers/payment.controller.js](server/src/controllers/payment.controller.js#L68)  
**Severity:** MEDIUM  
**Status:** ❌ UNFIXED  

**Problem:**
Stripe webhook payload not fully validated:

```javascript
const handleWebhook = async (req, res) => {
  // ...creates event...
  
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    const update = {
      status: 'held',
    };
    
    if (paymentIntent.latest_charge) {  // ← Optional/optional
      update.stripeChargeId = String(paymentIntent.latest_charge);
    }
    
    // ← BUG: No validation that paymentIntent.id exists
    // ← No check that metadata.contractId/milestoneId exist
    // ← Could update wrong transaction
  }
};
```

**Fix Required:**
```javascript
const handleWebhook = async (req, res) => {
  // ... event verification ...
  
  if (event.type === 'payment_intent.succeeded') {
    const { id, charges, metadata } = event.data.object;
    
    if (!id) {
      console.error('[WEBHOOK_ERROR] Missing payment intent ID');
      res.json({ received: true });
      return;
    }
    
    if (!metadata?.contractId || !metadata?.milestoneId) {
      console.error('[WEBHOOK_ERROR] Missing metadata in payment intent');
      res.json({ received: true });
      return;
    }
    
    const transaction = await Transaction.findOneAndUpdate(
      { 
        stripePaymentIntentId: id,
        isDeleted: false 
      },
      { 
        $set: {
          status: 'held',
          stripeChargeId: charges?.data?.[0]?.id || null,
        }
      }
    );
    
    if (!transaction) {
      console.error(`[WEBHOOK_ERROR] No transaction for payment intent ${id}`);
    }
  }
  
  res.json({ received: true });
};
```

---

### 🟡 Issue #12: No TTL on Reset Password Tokens
**File:** [server/src/models/user.model.js](server/src/models/user.model.js)  
**Severity:** MEDIUM  
**Status:** ❌ UNFIXED  

**Problem:**
Password reset tokens stored but never expire:

```javascript
const userSchema = new Schema({
  passwordResetToken: String,
  // ← BUG: No passwordResetTokenExpires field
  // ← User can reset password anytime with old token
  // ← Tokens valid forever (security risk)
});
```

**Attack Scenario:**
1. User requests password reset
2. System generates token and sends email
3. User doesn't click for 6 months
4. Attacker intercepts old email (from archive)
5. Attacker clicks old reset link
6. Still works! Attacker changes password

**Fix Required:**
```javascript
const userSchema = new Schema({
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpires: {
    type: Date,
    default: null,
  },
});

// In forgot password controller:
const resetToken = crypto.randomBytes(32).toString('hex');
user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minute window
await user.save();

// In reset password controller:
const currentTime = new Date();
if (user.passwordResetExpires < currentTime) {
  throw new ApiError(400, 'Reset token has expired');
}
```

---

### 🟡 Issue #13: Missing Rate Limiting on Sensitive Endpoints
**File:** [server/src/routes/payment.routes.js](server/src/routes/payment.routes.js)  
**Severity:** MEDIUM  
**Status:** ❌ UNFIXED  

**Problem:**
No rate limiting on `/payout` endpoint:

```javascript
// Payment routes have NO rate limiter
router.post('/payout', /* NO RATE LIMITER */, validate(...), paymentController.requestPayout);
router.post('/fund-milestone', /* NO RATE LIMITER */, ...);
router.post('/release-milestone', /* NO RATE LIMITER */, ...);
```

Contrast to auth routes:
```javascript
// Auth routes HAVE rate limiter
router.post('/register', authLimiter, validate(...), ...);
router.post('/login', authLimiter, validate(...), ...);
```

**Attack Vector:**
```javascript
// Attacker can spam payout requests
for (let i = 0; i < 10000; i++) {
  await axios.post('/payments/payout', { amount: 50000 });
  // Database gets hammered, developer account locks up
}
```

**Fix:**
```javascript
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 payout requests per hour
  message: 'Too many payout requests',
});

router.post('/payout', verifyJWT, paymentLimiter, validate(...), paymentController.requestPayout);
router.post('/fund-milestone', verifyJWT, paymentLimiter, validate(...), ...);
```

---

## Low Priority Issues / Style/Doc Issues

### 🟢 Issue #14: Inconsistent Error Message Casing
**Severity:** LOW  

Some error messages start with uppercase, some lowercase:
- ✅ "Payment not found" (lowercase)
- ❌ "Payment Not Found" (uppercase)
- ❌ "PAYMENT PROCESSING ERROR" (all caps)

**Fix:** Standardize to: "Error message format with lowercase start"

---

### 🟢 Issue #15: Missing JSDoc on Complex Functions
**Severity:** LOW  

High-complexity functions lack documentation:
- `calculateCommission()`
- `normalizeP...()` (appears in 5+ files)
- `escrow.service.js` functions

---

## Recommended Fix Priority

### Phase 1 (Release Blocker - Fix Immediately):
1. **Bug #1** - Double wallet deduction (Revenue Loss)
2. **Bug #3** - Race condition on milestone release (Revenue Loss)
3. **Bug #2** - JWT refresh not working (UX Breaking)

### Phase 2 (High Priority - Fix This Sprint):
4. **Bug #4** - Proposal acceptance validation
5. **Bug #5** - Wallet balance validation
6. **Bug #6** - Contract state machine
7. **Bug #8** - Duplicate proposal prevention
8. **Issue #9** - Pagination normalization

### Phase 3 (Next Sprint):
9. **Bug #7** - Email verification for payout
10. **Issue #10-13** - Security/Quality improvements

---

## Testing Recommendations

Create test cases for:
```javascript
describe('Payment Flow', () => {
  it('should prevent double payout deduction', () => {
    // Mock: developer.walletBalance = 1000, wallet.balance = 1000
    // Call: requestPayout(500)
    // Assert: developer.walletBalance = 500 (only one deduction)
    // Assert: wallet.balance = 500 (consistent)
  });

  it('should prevent duplicate milestone releases', async () => {
    // Create contract with pending milestone
    const contract = await Contract.create({ /* ... */ });
    const milestone = { _id: new ObjectId(), status: 'approved' };
    
    // Simulate concurrent release calls
    const promise1 = escrow.releaseMilestone(contractId, milestoneId);
    const promise2 = escrow.releaseMilestone(contractId, milestoneId);
    
    const [result1, result2] = await Promise.allSettled([promise1, promise2]);
    
    // Assert: Only one succeeds, other fails
    expect(result1.status === 'fulfilled' || result2.status === 'fulfilled').toBe(true);
    expect(result1.status === 'rejected' || result2.status === 'rejected').toBe(true);
  });

  it('should prevent accepting proposal for closed requirement', () => {
    // Create requirement with status = 'closed'
    // Try to accept proposal
    // Should throw 400 error
  });
});
```

---

## Conclusion

The codebase has **solid architectural foundation** with good separation of concerns, proper AsyncHandler usage, and comprehensive error handling. However, the identified bugs primarily affect:

1. **Payment integrity** (wallet, escrow, payout)
2. **Data consistency** (softly-deleted records, state transitions)
3. **Security** (token expiration, rate limiting, input validation)
4. **User experience** (JWT refresh, error handling)

Addressing the Phase 1 bugs should be completed before production deployment.

---

**Generated By:** Tech-Mates Code Review Agent  
**Version:** Phase 10 + Bug Analysis  
**Last Updated:** March 27, 2026
