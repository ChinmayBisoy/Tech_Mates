# Frontend-Backend Integration Fix List

**Last Updated:** March 27, 2026  
**Status:** 7 Critical Mismatches + 12 Route/Endpoint Mismatches

---

## Part A: Response Wrapper Mismatch (CRITICAL)

**Root Cause:** Backend wraps all responses in `ApiResponse` class with structure `{ statusCode, data, message, success, pagination? }`. Frontend expects direct data access.

### Fix A1: Update axios interceptor to unwrap responses
**File:** `frontend/src/api/axios.js`

**Change:** After successful response, extract `.data` property

```javascript
instance.interceptors.response.use(
  (response) => {
    // Unwrap ApiResponse wrapper
    if (response.data && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
      }
    }
    return response
  },
  (error) => {
    // ... existing error handling
  }
)
```

---

## Part B: Endpoint & Path Mismatches

### Fix B1: User Search Endpoint
**File:** `frontend/src/pages/BrowseDevelopers.jsx (line 30)`

**Frontend Call:**
```javascript
const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/users/browse/developers?${params}`
);
```

**Backend Endpoint:** `GET /api/users/search`

**Change:** Update frontend call to use correct endpoint
```javascript
const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/users/search?${params}`
);
```

---

### Fix B2: User Me Endpoint (Missing)
**File:** `frontend/src/api/user.api.js (line 9)`

**Frontend Call:**
```javascript
getMe: async () => {
  const response = await instance.get('/users/me')
  return response.data
}
```

**Backend Status:** Route does NOT exist in user.routes.js

**Backend Fix Required:** Add this route to `server/src/routes/user.routes.js`
```javascript
router.get('/me', verifyJWT, userController.getPublicProfile);
// OR create a separate endpoint for authenticated user's own profile
```

**Suggested Implementation:** Add after line 11 in user.routes.js
```javascript
router.get('/me', verifyJWT, userController.getProfile); // New endpoint to fetch authenticated user's profile
router.get('/search', validate(searchDeveloperSchema, 'query'), userController.searchDevelopers);
router.get('/:id', userController.getPublicProfile);
```

---

### Fix B3: Purchase Endpoint Mismatch
**File:** `frontend/src/pages/dashboard/MyPurchases.jsx (line 6)` → calls `myPurchasesAPI.getMyPurchases()`
**File:** `frontend/src/api/purchase.api.js (line 4)`

**Frontend Call:**
```javascript
export const fetchMyPurchases = async (page = 1, limit = 10, status = null) => {
  const response = await axios.get(`/purchases`, {
    params: { page, limit, ...(status && { status }) },
  });
  return response.data;
};
```

**Backend Endpoint:** `GET /api/purchases/my`

**Change:** Update frontend API call
```javascript
export const fetchMyPurchases = async (page = 1, limit = 10, status = null) => {
  const response = await axios.get(`/purchases/my`, {
    params: { page, limit, ...(status && { status }) },
  });
  return response.data;
};
```

---

### Fix B4: Missing Purchase Sub-Endpoints
**File:** `frontend/src/api/purchase.api.js`

**These frontend endpoints do NOT exist on backend:**
- Line 12: `GET /purchases/session/:sessionId` → Backend has no session endpoint
- Line 17: `GET /purchases/:id/github-access` → Not implemented
- Line 22: `POST /purchases/:id/refund` → Backend dispute system is different (raise_dispute instead)
- Line 27: `POST /purchases/:id/review` → Reviews use `/api/reviews` not purchase sub-route
- Line 32: `POST /purchases/:id/support` → Not implemented (support tickets not in backend)
- Line 37: `POST /purchases/:id/cancel` → Not implemented
- Line 41: `GET /purchases/listing/:id/stats` → Backend has no analytics route

**Action:** Either implement these in backend OR remove from frontend and use alternative workflows. For MVP, recommend:
- Remove support endpoints (out of scope)
- Move reviews to `/api/reviews` (POST /reviews with purchaseId)
- Move refunds to `/api/purchases/dispute` (use dispute system)

**Suggested Frontend Fix** — Remove from `purchase.api.js`:
```javascript
// Remove these methods that have no backend:
// downloadPurchasedFiles - use backend delivery service
// getGitHubAccess - custom per seller, remove from generic API
// requestRefund - use dispute system instead
// requestPurchaseSupport - out of scope
// cancelPurchase - not implemented
// getPurchaseStats - use analytics API when ready
```

---

### Fix B5: Contract Milestone Payment Endpoints
**File:** `frontend/src/api/contract.api.js (lines 23-24)`

**Frontend Calls:**
```javascript
const fundMilestone = async (contractId, milestoneId) => {
  const response = await instance.put(
    `/contracts/${contractId}/milestone/${milestoneId}/fund`
  )
}

const releaseMilestonePayment = async (contractId, milestoneId) => {
  const response = await instance.put(
    `/contracts/${contractId}/milestone/${milestoneId}/release`
  )
}
```

**Backend Routes:** These are under `/api/payments/`, NOT `/api/contracts/`

**Backend Correct Endpoints:**
- `POST /api/payments/fund-milestone` (body: { contractId, milestoneId })
- `POST /api/payments/release-milestone` (body: { contractId, milestoneId })

**Change:** Update frontend API calls
```javascript
const fundMilestone = async (contractId, milestoneId) => {
  const response = await instance.post(
    `/payments/fund-milestone`,
    { contractId, milestoneId }
  )
  return response.data
}

const releaseMilestonePayment = async (contractId, milestoneId) => {
  const response = await instance.post(
    `/payments/release-milestone`,
    { contractId, milestoneId }
  )
  return response.data
}
```

---

### Fix B6: Dashboard Analytics Endpoints (Missing)
**File:** `frontend/src/api/dashboard.api.js (lines 188-209)`

**Frontend Calls:**
```javascript
export const analyticsAPI = {
  getDashboardStats: async (timeRange = '30d') => {
    const response = await axios.get('/analytics/dashboard', {...})
  },
  getRevenueData: async (timeRange = '30d') => {
    const response = await axios.get('/analytics/revenue', {...})
  },
  // ... more analytics endpoints
}
```

**Backend Status:** No `/api/analytics` route exists. Only admin has `/api/admin/analytics`.

**Action:** Either:
1. Implement user analytics routes (out of scope for Phase 10)
2. Remove analytics UI from dashboard until Phase 11+

**Recommendation:** Remove analytics calls from dashboard for now OR move to admin-only view.

---

### Fix B7: Listing Stats Endpoints (Missing)
**File:** `frontend/src/api/dashboard.api.js (lines 72-83)`

**Frontend Calls:**
```javascript
getListingStats: async (listingId) => {
  const response = await axios.get(`/listings/${listingId}/stats`)
},
getAllListingsStats: async () => {
  const response = await axios.get('/listings/stats')
}
```

**Backend Status:** Not implemented. Backend listing controller has no stats endpoints.

**Action:** Remove from frontend OR implement in backend (out of scope for Phase 10).

---

### Fix B8: Wishlist Endpoints
**File:** `frontend/src/api/dashboard.api.js (lines 126-147)`

**Frontend Calls:**
```javascript
isInWishlist: async (listingId) => {
  const response = await axios.get(`/wishlist/check/${listingId}`)
},
clearWishlist: async () => {
  const response = await axios.delete('/wishlist')
}
```

**Backend Routes:** 
- `GET /api/wishlist/check/:id` → Not implemented
- `DELETE /api/wishlist` (bulk clear) → Not implemented

**Backend Actual Routes:**
- `GET /api/wishlist` - fetch all
- `POST /api/wishlist/:listingId` - add
- `DELETE /api/wishlist/:listingId` - remove one

**Change:** Update frontend API calls
```javascript
isInWishlist: async (listingId) => {
  // Check if listing is in user's wishlist - requires fetching full wishlist
  const response = await axios.get(`/wishlist`)
  return response.data.wishlist?.some(item => item.listingId === listingId) || false
},
clearWishlist: async () => {
  // Backend doesn't support bulk clear; remove this or implement manual loop
  throw new Error('Bulk clear not implemented. Remove items individually.')
}
```

---

### Fix B9: Support Tickets Endpoints (Not Connected)
**File:** `frontend/src/pages/dashboard/SupportTickets.jsx (lines 10-22)`

**Frontend Calls:**
```javascript
const supportAPI = {
  getTickets: async (page = 1, limit = 10, filters = {}) => {
    const response = await fetch(`/api/support/tickets?page=${page}...`)
  },
  // ... more support endpoints
}
```

**Backend Status:** No support routes mounted in app.js

**Action:** Remove support tickets feature from Phase 10 (out of scope) OR create simple support ticket system in backend.

**Recommendation:** Comment out SupportTickets component usage for now.

---

### Fix B10: Review Data Structure Mismatch
**File:** `frontend/src/pages/profile/PublicProfile.jsx (line 31)`

**Frontend Code:**
```javascript
const reviews = reviewsResponse?.data || []
// Expects: Array of review objects

// Used as:
<ReviewList reviews={reviews} />
```

**Backend Response** (`GET /api/reviews/user/:userId`):
```javascript
{
  reviews: [...],
  pagination: { page, limit, total, totalPages }
}
```

**Change:** Update frontend to access nested property
```javascript
const reviews = reviewsResponse?.reviews || reviewsResponse?.data || []
```

---

### Fix B11: Review Get By Listing ID
**File:** `frontend/src/api/review.api.js (line 14)`

**Frontend Call:**
```javascript
getListingReviews: async (listingId, page = 1, limit = 10) => {
  const response = await instance.get(`/reviews/listing/${listingId}`, {...})
  return response.data
}
```

**Backend Route Exists:** `GET /api/reviews/listing/:listingId` ✓

**Note:** This one is correct!

---

### Fix B12: Missing User Me Profile Endpoint (Duplicate of B2)
**File:** `frontend/src/api/user.api.js (line 9)` — Already noted as critical.

---

## Part C: Response Accessor Fixes (After Fix A1)

Once axios interceptor unwraps responses, update these frontend files to access nested pagination/data correctly:

### Fix C1: MyPurchases pagination access
**File:** `frontend/src/pages/dashboard/MyPurchases.jsx`

**Current (Line 24):**
```javascript
const purchases = purchasesQuery.data?.purchases || [];
const totalPages = purchasesQuery.data?.totalPages || 1;
```

**After Fix A1 (axios unwraps):** These become correct automatically ✓

**But verify response structure matches:** Backend returns `{ purchases, pagination: {...} }`
So access should be:
```javascript
const purchases = purchasesQuery.data?.purchases || [];
const totalPages = purchasesQuery.data?.pagination?.totalPages || 1;
```

---

### Fix C2: MyListings pagination access
**File:** `frontend/src/pages/dashboard/MyListings.jsx (line 31)`

**Current:**
```javascript
const listings = listingsQuery.data?.listings || [];
const totalPages = listingsQuery.data?.totalPages || 1;
```

**Correct:**
```javascript
const listings = listingsQuery.data?.listings || [];
const totalPages = listingsQuery.data?.pagination?.totalPages || 1;
```

---

### Fix C3: Contract detail access
**File:** `frontend/src/pages/contracts/ContractDetail.jsx (line 93)`

**Current:**
```javascript
const contract = contractQuery.data;
```

**Backend returns:** `{ statusCode, data: contractObject, message, success }`  
**After Fix A1:** This should work correctly ✓

---

### Fix C4: PublicProfile reviews structure
**File:** `frontend/src/pages/profile/PublicProfile.jsx (line 31)`

**Current:**
```javascript
const reviews = reviewsResponse?.data || []
```

**Correct:**
```javascript
const reviews = reviewsResponse?.reviews || []
```

---

## Part D: Summary of Required Changes

### Frontend Changes (Files to Edit)

1. **frontend/src/api/axios.js** — Add response unwrapper (Fix A1)
2. **frontend/src/pages/BrowseDevelopers.jsx** — Change `/users/browse/developers` to `/users/search` (Fix B1)
3. **frontend/src/api/user.api.js** — Add `/users/me` route support (Fix B2)
4. **frontend/src/api/purchase.api.js** — Change `/purchases` to `/purchases/my`, remove unsupported endpoints (Fix B4)
5. **frontend/src/api/contract.api.js** — Move fundMilestone/releaseMilestonePayment to `/payments/` (Fix B5)
6. **frontend/src/api/dashboard.api.js** — Remove analytics, listing stats, bulk wishlist (Fixes B6, B7, B8)
7. **frontend/src/pages/dashboard/MyPurchases.jsx** — Fix pagination accessor (Fix C1)
8. **frontend/src/pages/dashboard/MyListings.jsx** — Fix pagination accessor (Fix C2)
9. **frontend/src/pages/profile/PublicProfile.jsx** — Fix reviews accessor (Fix C4)
10. **frontend/src/pages/dashboard/SupportTickets.jsx** — Remove or comment out (Fix B9)

### Backend Changes (Files to Edit)

1. **server/src/routes/user.routes.js** — Add `GET /me` endpoint (Fix B2)
2. **server/src/controllers/user.controller.js** — Add getProfile method (Fix B2)

---

## Part E: Post-Fix Validation Checklist

- [ ] Run axios interceptor test with sample response
- [ ] Test BrowseDevelopers page loads developers
- [ ] Test MyPurchases pagination works
- [ ] Test MyListings pagination works
- [ ] Test PublicProfile displays reviews
- [ ] Test ContractDetail loads milestone data
- [ ] Test PurchaseSuccess page verifies session
- [ ] Run backend diagnostics: `node -e "require('./src/app')"`
- [ ] Run frontend build: `npm run build` (no errors)
- [ ] Manual E2E: Login → Browse → View Profile → View Purchase → Complete flow

---

## Quick Apply Priority Order

**High Priority (Breaking):**
1. Fix A1 (axios unwrapper) — blocks all frontend API calls
2. Fix B1 (BrowseDevelopers) — user browsing broken
3. Fix B5 (Contract payments) — contract workflow broken

**Medium Priority (Partially Working):**
4. Fix B2 (User Me) — dashboard profile broken
5. Fix B4 (Purchase endpoints) — purchase workflow incomplete
6. Fix C1, C2, C4 (Accessors) — pagination/data display broken

**Low Priority (Polish/Removal):**
7. Fix B6, B7, B8 (Analytics/Stats) — remove unused features
8. Fix B9 (Support) — out of scope

