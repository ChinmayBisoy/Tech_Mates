# TechMates Backend

## Project Overview
TechMates backend powers a two-sided platform where clients hire developers for service engagements and buy pre-built project listings. It supports role-based workflows for `admin`, `developer`, and `client`, with escrow payments, subscriptions, chat, notifications, reviews, and dispute handling.

## Tech Stack
- Node.js
- Express.js (CommonJS)
- MongoDB + Mongoose
- Stripe (payments and subscriptions)
- Socket.io (real-time chat and notifications)
- Zod (request validation)
- Multer + Cloudinary (file upload pipeline)
- Helmet, CORS, and rate-limiting middleware (security hardening)

## Setup Instructions
1. Clone repository.
2. Navigate to backend folder:
   - `cd server`
3. Install dependencies:
   - `npm install`
4. Create `.env` from `.env.example` and fill all required values.
5. Start development server:
   - `npm run dev`

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`

### Users
- `GET /api/users/search`
- `GET /api/users/:id`
- `PUT /api/users/me`
- `POST /api/users/me/avatar`
- `GET /api/users/me/dashboard`

### Requirements / Proposals / Contracts
- `GET /api/requirements`
- `POST /api/requirements`
- `GET /api/requirements/:id`
- `PUT /api/requirements/:id`
- `DELETE /api/requirements/:id`
- `GET /api/proposals/my`
- `POST /api/proposals`
- `PUT /api/proposals/:id/accept`
- `PUT /api/proposals/:id/reject`
- `GET /api/contracts`
- `GET /api/contracts/:id`
- `PUT /api/contracts/:id/milestone/:milestoneId/submit`
- `PUT /api/contracts/:id/milestone/:milestoneId/approve`

### Listings / Wishlist / Purchases
- `GET /api/listings`
- `POST /api/listings`
- `PUT /api/listings/:id`
- `PUT /api/listings/:id/submit-review`
- `GET /api/wishlist`
- `POST /api/wishlist/:listingId`
- `DELETE /api/wishlist/:listingId`
- `POST /api/purchases`
- `GET /api/purchases/my`
- `GET /api/purchases/:id`
- `GET /api/purchases/:id/download`

### Payments / Subscriptions
- `POST /api/payments/fund-milestone`
- `POST /api/payments/release-milestone`
- `POST /api/payments/refund-milestone`
- `GET /api/payments/earnings`
- `POST /api/payments/payout`
- `POST /api/payments/webhook`
- `POST /api/subscriptions/upgrade`
- `DELETE /api/subscriptions/cancel`
- `GET /api/subscriptions`
- `POST /api/subscriptions/webhook`

### Reviews / Disputes
- `POST /api/reviews`
- `GET /api/reviews/user/:userId`
- `GET /api/reviews/listing/:listingId`
- `POST /api/purchases/dispute`
- `PUT /api/purchases/dispute/:id/respond`
- `PUT /api/purchases/dispute/:id/resolve`

### Chat / Notifications
- `GET /api/chat/rooms`
- `POST /api/chat/rooms`
- `GET /api/chat/rooms/:roomId/messages`
- `DELETE /api/chat/messages/:messageId`
- `GET /api/notifications`
- `PUT /api/notifications/read-all`
- `PUT /api/notifications/:id/read`

### Admin
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/ban`
- `PUT /api/admin/users/:id/unban`
- `PUT /api/admin/users/:id/verify`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/listings/pending`
- `PUT /api/admin/listings/:id/approve`
- `PUT /api/admin/listings/:id/reject`
- `GET /api/admin/disputes`
- `GET /api/admin/disputes/:id`
- `PUT /api/admin/disputes/:id/resolve`
- `GET /api/admin/analytics`
- `GET /api/admin/analytics/revenue`

## Postman Collection Instructions
1. Create a Postman collection named `TechMates Backend`.
2. Add environment variables:
   - `baseUrl` (for example: `http://localhost:3000`)
   - `accessToken`
3. Group requests by module (`Auth`, `Users`, `Listings`, `Purchases`, etc.).
4. For protected endpoints, set header:
   - `Authorization: Bearer {{accessToken}}`
5. Save sample success and error responses for each route.

## Deployment Guide

### Backend on Render
1. Push repository to GitHub.
2. Create a new Web Service in Render and connect repo.
3. Set root directory to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env.example`.

### MongoDB Atlas
1. Create a MongoDB Atlas cluster.
2. Create database user and allow network access for Render IPs (or temporary `0.0.0.0/0` during setup).
3. Copy Atlas connection string to `MONGODB_URI` env var.
4. Verify app health endpoint after deploy:
   - `GET /health`
