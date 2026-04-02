# Tech-Mates Backend - Complete API Documentation

## 1. Authentication Endpoints ✅
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT tokens)
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token

## 2. User/Profile Endpoints ✅
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update own profile
- `GET /api/users/:id/reviews` - Get user reviews
- `GET /api/users/:id/stats` - Get user statistics
- `POST /api/users/:userId/follow` - Follow user
- `POST /api/users/:userId/unfollow` - Unfollow user

## 3. Reviews System ✅
- `POST /api/reviews` - Create review
- `GET /api/reviews?userId=X` - Get reviews for user
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## 4. Wallet/Payments ✅
- `GET /api/wallet` - Get wallet balance
- `GET /api/wallet/transactions` - Get transaction history
- `POST /api/wallet/transaction` - Create transaction
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Request withdrawal

## 5. Requirements/SE Market ✅
- `GET /api/requirements` - Browse requirements
- `POST /api/requirements` - Create requirement
- `GET /api/requirements/:id` - Get requirement detail
- `PUT /api/requirements/:id` - Update requirement
- `DELETE /api/requirements/:id` - Delete requirement
- `PUT /api/requirements/:id/close` - Close requirement
- `GET /api/requirements/my` - Get user's requirements

## 6. Proposals ✅
- `POST /api/proposals` - Submit proposal
- `GET /api/proposals/my` - Get user's proposals
- `GET /api/proposals/requirement/:id` - Get proposals for requirement
- `PUT /api/proposals/:id/accept` - Accept proposal
- `PUT /api/proposals/:id/reject` - Reject proposal
- `PUT /api/proposals/:id/withdraw` - Withdraw proposal
- `PUT /api/proposals/:id/shortlist` - Shortlist proposal
- `POST /api/proposals/:id/boost` - Boost proposal visibility

## 7. Contracts ✅
- `GET /api/contracts` - Get all contracts
- `GET /api/contracts/:id` - Get contract detail
- `POST /api/contracts/:id/complete` - Complete contract
- `PUT /api/contracts/:id/milestone/:milestoneId/submit` - Submit work
- `PUT /api/contracts/:id/milestone/:milestoneId/approve` - Approve work
- `PUT /api/contracts/:id/milestone/:milestoneId/fund` - Fund milestone
- `PUT /api/contracts/:id/milestone/:milestoneId/release` - Release payment
- `PUT /api/contracts/:id/milestone/:milestoneId/dispute` - Dispute milestone
- `POST /api/contracts/:id/cancel` - Cancel contract

## 8. Listings/Project Market ✅
- `GET /api/listings` - Browse listings
- `POST /api/listings` - Create listing
- `GET /api/listings/:id` - Get listing detail
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing
- `POST /api/listings/:id/purchase` - Purchase listing

## 9. Admin Panel ✅
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:userId/status` - Update user status
- `PUT /api/admin/users/:userId/verify` - Verify user
- `GET /api/admin/reports` - Get reports
- `GET /api/admin/stats` - Get admin statistics

## 10. Verification System ✅
- `POST /api/verification/start` - Start verification process
- `POST /api/verification/complete` - Complete verification
- `GET /api/verification/status/:type` - Get verification status

## Models Created ✅
- User (with followers, verification, stats)
- Review (ratings, comments)
- Wallet (balance, earnings tracking)
- Transaction (all financial transactions)
- Requirement (project requirements)
- Proposal (developer proposals)
- Contract (project contracts)
- Listing (marketplace listings)
- Purchase (purchase records)
- Verification (user verification)
- Report (user/content reports)

## Frontend Dependency Status
✅ All 15 API modules now have backend support
✅ All endpoints implemented
✅ Ready for frontend integration

## Database Relationships
- User → Wallet (1:1)
- User → Proposals (1:N)
- User → Reviews (1:N)
- Requirement → Proposals (1:N)
- Requirement → Contract (1:1)
- Proposal → Contract (1:1)
- Listing → Purchase (1:N)

## Authentication Flow
1. User registers with role (developer/client/admin)
2. JWT tokens generated (access: 15m, refresh: 7d)
3. Token refresh on 401 errors
4. Protected routes verified via `verifyJWT` middleware
