# Tech-Mates Project Analysis

## 📋 Project Overview
Tech-Mates is a full-stack Fiverr-like freelance marketplace platform built with React 18 + Vite (frontend) and Express.js + MongoDB (backend). It includes real-time communication, payments, wallets, and advanced marketplace features.

---

## 🏗️ Project Structure

```
Tech-Mates/
├── frontend/                 # React + Vite frontend
├── server/                   # Express.js backend
├── .env files               # Environment configuration
├── package.json             # Root dependencies
└── Documentation files      # Setup & fixes
```

---

## 🖥️ FRONTEND STACK

### Core Framework
- **React 18.2.0** - UI framework with hooks
- **Vite 5.0.8** - Build tool & dev server
- **React Router 6.20.0** - Client-side routing with lazy loading
- **TypeScript Ready** - JSX/ESM module support

### State Management & Data Fetching
- **Zustand 4.4.2** - Lightweight state management
- **TanStack React Query 5.28.0** - Server state management & caching
- **Axios 1.6.2** - HTTP client for API calls
- **Socket.io-client 4.7.2** - Real-time communication

### Form Management & Validation
- **React Hook Form 7.50.0** - Flexible form handling
- **Zod 3.22.4** - TypeScript-first schema validation
- **@hookform/resolvers 3.3.4** - Validation adapter

### UI & Styling
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Lucide React 0.365.0** - Icon library (365+ icons)
- **Recharts 2.10.3** - React charting library
- **clsx 2.0.0** - Conditional className utility
- **tailwind-merge 2.2.1** - Tailwind class merging
- **React Hot Toast 2.4.1** - Toast notifications

### Payments
- **@stripe/stripe-js 3.5.0** - Stripe payment integration

### Utilities
- **date-fns 3.0.0** - Modern date manipulation

### Development Tools
- **ESLint 8.56.0** - Code linting
- **PostCSS 8.4.32** - CSS processing
- **Autoprefixer 10.4.16** - CSS vendor prefixes
- **@vitejs/plugin-react 4.2.1** - React support for Vite

### Frontend Pages & Features
```
src/pages/
├── auth/                    # Login, Register, Password Reset
├── dashboard/              # Client & Developer Dashboards
│   ├── ClientDashboard.jsx
│   ├── DeveloperDashboard.jsx
│   ├── MyPurchases.jsx
│   ├── MyListings.jsx
│   ├── Wishlist.jsx
│   ├── AnalyticsDashboard.jsx
│   ├── EditListing.jsx
│   └── SupportTickets.jsx
├── se-market/              # Service marketplace
│   ├── PostRequirement.jsx
│   ├── MyRequirements.jsx
│   ├── MyProposals.jsx
│   ├── ProposalsReceived.jsx
│   └── BrowseRequirements.jsx
├── projects/               # Project listings
│   ├── BrowseListings.jsx
│   ├── ListingDetail.jsx
│   └── PostListing.jsx
├── marketplace/            # Advanced marketplace
│   ├── ActiveAuctions.jsx
│   ├── MyAuctions.jsx
│   ├── Escrow.jsx
│   └── Disputes.jsx
├── phase9/                 # Real-time & advanced features
│   ├── Wallet.jsx
│   ├── SellerDashboard.jsx
│   ├── Messages.jsx
│   └── NotificationCenter.jsx
├── purchase/               # Purchase flows
├── profile/                # User profiles & setup
├── contracts/              # Contract management
└── [Other Pages]           # Home, Admin, Settings, Help, etc.
```

### Frontend Components
```
src/components/
├── auth/                   # Authentication UI
├── admin/                  # Owner admin features
├── contracts/              # Contract components
├── payment/                # Payment UI
├── profile/                # Profile components
├── projects/               # Project related UI
├── realtime/               # Real-time features
├── review/                 # Reviews components
├── se-market/              # Service marketplace UI
├── verification/           # Verification UI
├── notification/           # Notification components
├── escrow/                 # Escrow UI
├── dispute/                # Dispute resolution UI
└── [Other Components]      # Shared, UI, etc.
```

---

## 🔧 BACKEND STACK

### Core Framework
- **Express.js 5.2.1** - Web framework
- **Node.js 22.16.0** - JavaScript runtime
- **MongoDB/Mongoose 9.3.0** - Database & ODM

### Authentication & Security
- **bcryptjs 3.0.3** - Password hashing
- **jsonwebtoken 9.0.3** - JWT for stateless auth
- **helmet 8.1.0** - HTTP headers security
- **express-rate-limit 8.3.1** - API rate limiting
- **cookie-parser 1.4.7** - Cookie handling

### API & Middleware
- **cors 2.8.6** - Cross-origin resource sharing
- **morgan 1.10.1** - HTTP request logging
- **express-rate-limit 8.3.1** - Rate limiting

### File & Cloud Management
- **multer 2.1.1** - File upload middleware
- **cloudinary 2.9.0** - Cloud image storage (CDN)

### Data Validation
- **zod 4.3.6** - Schema validation

### Payment Processing
- **stripe 20.4.1** - Payment gateway integration
- **@stripe/stripe-js** - Stripe client library

### Real-time Communication
- **socket.io 4.8.3** - WebSocket for real-time features

### Utilities
- **nanoid 5.1.7** - Unique ID generator
- **slugify 1.6.8** - URL-friendly string conversion
- **nodemailer 8.0.3** - Email sending

### Environment Configuration
- **dotenv 17.3.1** - Environment variables

### Backend Structure
```
server/src/
├── app.js                  # Express app setup & routes
├── server.js              # Server entry point
├── config/
│   ├── db.js              # MongoDB connection
│   └── stripe.js          # Stripe configuration
├── models/                # Mongoose schemas (17 models)
│   ├── user.model.js
│   ├── listing.model.js
│   ├── contract.model.js
│   ├── proposal.model.js
│   ├── requirement.model.js
│   ├── review.model.js
│   ├── transaction.model.js
│   ├── wallet.model.js
│   ├── subscription.model.js
│   ├── verification.model.js
│   ├── message.model.js
│   ├── chatroom.model.js
│   ├── notification.model.js
│   ├── dispute.model.js
│   ├── purchase.model.js
│   ├── report.model.js
│   └── projectlisting.model.js
├── controllers/           # Route handlers (15 controllers)
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── listing.controller.js
│   ├── requirement.controller.js
│   ├── proposal.controller.js
│   ├── contract.controller.js
│   ├── review.controller.js
│   ├── wallet.controller.js
│   ├── payment.controller.js
│   ├── subscription.controller.js
│   ├── verification.controller.js
│   ├── admin.controller.js
│   ├── chat.controller.js
│   ├── notification.controller.js
│   └── purchase.controller.js
├── routes/                # API endpoints (16 routes)
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── listing.routes.js
│   ├── requirement.routes.js
│   ├── proposal.routes.js
│   ├── contract.routes.js
│   ├── review.routes.js
│   ├── wallet.routes.js
│   ├── payment.routes.js
│   ├── subscription.routes.js
│   ├── verification.routes.js
│   ├── admin.routes.js
│   ├── chat.routes.js
│   ├── notification.routes.js
│   ├── purchase.routes.js
│   └── wishlist.routes.js
├── services/              # Business logic (18 services)
│   ├── auth.service.js
│   ├── listing.service.js
│   ├── requirement.service.js
│   ├── proposal.service.js
│   ├── contract.service.js
│   ├── review.service.js
│   ├── payment.service.js
│   ├── stripe.service.js
│   ├── subscription.service.js
│   ├── verification.service.js
│   ├── chat.service.js
│   ├── notification.service.js
│   ├── purchase.service.js
│   ├── wishlist.service.js
│   ├── dispute.service.js
│   ├── escrow.service.js
│   ├── delivery.service.js
│   ├── commission.service.js
│   ├── admin.service.js
│   └── email.service.js
├── middleware/            # HTTP middleware
│   ├── auth.middleware.js      # JWT verification
│   ├── error.middleware.js     # Global error handler
│   ├── upload.middleware.js    # File upload
│   ├── validate.middleware.js  # Request validation
│   ├── isPro.middleware.js     # Pro tier checker
│   └── rateLimiter.js          # Rate limiting
├── validators/            # Zod schemas (11 validators)
│   ├── auth.validator.js
│   ├── user.validator.js
│   ├── listing.validator.js
│   ├── requirement.validator.js
│   ├── proposal.validator.js
│   ├── contract.validator.js
│   ├── review.validator.js
│   ├── payment.validator.js
│   ├── subscription.validator.js
│   ├── chat.validator.js
│   └── admin.validator.js
├── socket/                # Real-time WebSocket
│   ├── index.js           # Socket setup & namespace handling
│   ├── chat.socket.js     # Chat events
│   └── notification.socket.js # Notification events
└── utils/                 # Helper utilities
    ├── ApiError.js        # Custom error class
    ├── ApiResponse.js     # Response format
    ├── asyncHandler.js    # Async error wrapper
    └── generateTokens.js  # JWT generation
```

---

## 📊 DATABASE MODELS (MongoDB with Mongoose)

### User Management
- **User** - Profile, roles, preferences, verification status

### Marketplace
- **Listing** - Service/product listings with pricing
- **Requirement** - Project requirements from clients
- **Proposal** - Developer proposals for requirements

### Transactions & Contracts
- **Contract** - Agreement between user and developer
- **Transaction** - Payment transactions
- **Wallet** - User wallet balance & history

### Reviews & Ratings
- **Review** - Reviews & ratings for services/users

### Communication
- **Message** - Direct messages between users
- **Chatroom** - Chat conversations
- **Notification** - User notifications

### Advanced Features
- **ProjectListing** - Secondary project listings
- **Subscription** - Subscription plans
- **Purchase** - Purchase orders
- **Verification** - User verification status
- **Dispute** - Dispute resolution

---

## 🔌 API ENDPOINTS

### Authentication (`/api/auth`)
- POST `/login` - User login
- POST `/register` - User registration
- POST `/refresh-token` - Refresh JWT
- POST `/logout` - Logout
- POST `/forgot-password` - Password reset request
- POST `/reset-password/:token` - Reset password with token

### Users (`/api/users`)
- GET `/browse/developers` - Browse available developers
- GET `/profile/:id` - Get user profile
- PUT `/profile` - Update profile
- GET `/my-profile` - Get current user profile
- POST `/avatar` - Upload avatar

### Listings (`/api/listings`)
- GET `/` - Browse all listings
- POST `/` - Create listing
- GET `/:id` - Get listing details
- PUT `/:id` - Update listing
- DELETE `/:id` - Delete listing
- GET `/:id/stats` - Get listing analytics

### Requirements (`/api/requirements`)
- GET `/` - Browse requirements
- POST `/` - Create requirement
- GET `/:id` - Get requirement details
- PUT `/:id` - Update requirement

### Proposals (`/api/proposals`)
- GET `/` - Get proposals
- POST `/` - Submit proposal
- GET `/:id` - Get proposal details
- PUT `/:id/status` - Update proposal status

### Contracts (`/api/contracts`)
- GET `/` - Get contracts
- POST `/` - Create contract
- GET `/:id` - Get contract details
- PUT `/:id/status` - Update contract status
- POST `/:id/milestones` - Create milestone

### Reviews (`/api/reviews`)
- GET `/` - Get reviews
- POST `/` - Create review
- GET `/:id` - Get review details

### Wallet (`/api/wallet`)
- GET `/` - Get wallet balance
- POST `/withdraw` - Request withdrawal
- GET `/transactions` - Get transaction history

### Payments (`/api/payments`)
- POST `/create-payment-intent` - Create Stripe payment intent
- POST `/webhook` - Handle Stripe webhook
- GET `/transactions` - Get payment history

### Subscriptions (`/api/subscriptions`)
- GET `/plans` - Get subscription plans
- POST `/subscribe` - Subscribe to plan
- POST `/webhook` - Handle subscription webhook

### Verification (`/api/verification`)
- POST `/request` - Request verification
- GET `/status` - Get verification status
- POST `/document` - Upload verification document

### Chat (`/api/chat`)
- GET `/conversations` - Get all conversations
- POST `/messages` - Send message
- GET `/messages/:conversationId` - Get messages
- WebSocket events via Socket.io

### Notifications (`/api/notifications`)
- GET `/` - Get notifications
- PUT `/:id/read` - Mark as read
- WebSocket events via Socket.io

### Admin (`/api/admin`)
- GET `/dashboard` - Admin dashboard stats
- GET `/users` - Manage users
- GET `/reports` - View reports

### Purchases (`/api/purchases`)
- GET `/` - Get purchases
- POST `/` - Create purchase
- GET `/:id` - Get purchase details

### Wishlist (`/api/wishlist`)
- GET `/` - Get wishlist
- POST `/:listingId` - Add to wishlist
- DELETE `/:listingId` - Remove from wishlist

---

## 🔐 Security Features

### Authentication
- JWT-based stateless authentication
- Bcrypt password hashing
- Token refresh mechanism

### Security Middleware
- **Helmet** - HTTP headers security
- **CORS** - Cross-origin control
- **Rate Limiting** - API throttling
  - Auth routes: 5 requests/15 minutes
  - Payment routes: 10 requests/60 minutes
  - General API: 100 requests/15 minutes

### Input Validation
- Zod schema validation on all routes
- Request body size limits (10KB)

### File Upload
- Multer for secure file uploads
- Cloudinary cloud storage
- File type & size validation

---

## 🔌 Real-time Features (Socket.io)

### Chat Namespace
- Send message
- Typing indicator
- Message history
- Read receipts

### Notifications Namespace
- Real-time notifications
- Notification types (contract, payment, review, etc.)
- Mark as read

---

## 💳 Payment Integration

### Stripe
- Create payment intents
- Webhook handling
- Subscription management
- Commission calculations

### Wallet System
- User balances
- Transaction history
- Withdrawal requests
- Escrow management

---

## 📧 Email Service

### Nodemailer Integration
- Account verification
- Password reset emails
- Project notifications
- Payment confirmations
- Dispute notifications

---

## 🖼️ Cloud Storage

### Cloudinary
- Image optimization
- CDN delivery
- Responsive images
- Secure URLs

---

## 📊 Frontend Routing

### Public Routes
- `/` - Home
- `/login` - Login
- `/register` - Register
- `/forgot-password` - Password recovery
- `/reset-password/:token` - Password reset
- `/projects` - Browse projects
- `/projects/:slug` - Project details

### Protected Routes (Authenticated Users)
- `/user/dashboard` - Client dashboard
- `/developer/dashboard` - Developer dashboard
- `/se-market/...` - Service marketplace
- `/profile/*` - Profile management
- `/contracts/*` - Contract management
- `/dashboard/*` - Various dashboards

### Admin Routes
- `/admin` - Admin dashboard
- Owner/Admin specific pages

---

## 🚀 Development Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Lint code
```

### Backend
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start            # Start production server
```

---

## 📦 Dependencies Summary

### Frontend Dependencies: 21
- React ecosystem: 3
- State management: 2
- Data fetching: 2
- Form handling: 3
- Styling: 5
- Utilities: 2
- Payment: 1
- Real-time: 1
- Notifications: 1

### Backend Dependencies: 19
- Express & middleware: 5
- Database: 1
- Authentication: 2
- Security: 2
- File management: 2
- Validation: 1
- Payments: 1
- Real-time: 1
- Utilities: 2
- Email: 1

---

## 🔄 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)              │
│  ┌─────────────┬──────────────┬────────────┬──────────┐ │
│  │   Pages     │  Components  │   Hooks    │  Stores  │ │
│  └─────────────┴──────────────┴────────────┴──────────┘ │
│  - Authentication  - Marketplace   - Dashboards        │
│  - Contracts       - Payments       - Real-time Chat   │
│  - Reviews         - Subscriptions  - Notifications    │
└──────────────────┬──────────────────────────────────────┘
                   │ Axios + Socket.io
┌──────────────────▼──────────────────────────────────────┐
│          Backend (Express.js + MongoDB)                 │
│  ┌──────────┬──────────┬─────────┬──────────┐           │
│  │ Routes   │Controllers│Services │Middleware│           │
│  └──────────┴──────────┴─────────┴──────────┘           │
│  - Authentication  - Payment Processing                │
│  - Marketplace CRUD - Real-time Chat                    │
│  - Contracts       - Notifications                      │
│  - Wallet/Escrow   - Verification                       │
│  - Reviews         - Admin Management                   │
└──────────────────┬──────────────────────────────────────┘
                   │ Mongoose ODM
┌──────────────────▼──────────────────────────────────────┐
│         MongoDB (NoSQL Database)                        │
│  - 17 Collections  - Indexes  - Relationships           │
└────────────────────────────────────────────────────────┘
                   │
└──────────────────┬──────────────────────────────────────┐
  │ Stripe  │ Cloudinary  │ Socket.io  │ Nodemailer     │
  │ Payments│ Cloud CDN  │ Real-time  │ Email Service  │
  └─────────┴────────────┴────────────┴─────────────────┘
```

---

## 🎯 Key Features Implemented

### ✅ Completed
1. **User Authentication** - Register, login, password reset
2. **User Profiles** - Setup, editing, avatars
3. **Marketplace** - Browse listings, create listings, wishlist
4. **Service Marketplace** - Requirements, proposals, bidding
5. **Contracts** - Create, manage, update status
6. **Payments** - Stripe integration, wallet system
7. **Reviews & Ratings** - Peer reviews, rating system
8. **Real-time Chat** - WebSocket messaging
9. **Notifications** - Real-time notifications
10. **Subscriptions** - Stripe subscription plans
11. **Admin Dashboard** - Owner admin features
12. **Verification** - User verification system
13. **Dashboards** - Client and developer dashboards
14. **Search & Filter** - Advanced search capabilities
15. **Escrow & Dispute** - Payment protection, dispute resolution

### 🚀 Advanced Features
- Rate limiting on API routes
- JWT authentication with refresh tokens
- Helmet security headers
- CORS configuration
- Error handling middleware
- Request validation with Zod
- File upload with Multer
- Cloud storage with Cloudinary
- Socket.io real-time communication
- Email notifications
- Commission calculations
- Wallet management
- Activity feed
- Analytics dashboard

---

## 📝 Environment Configuration

### Backend (.env)
```
MONGO_URI=<MongoDB connection string>
JWT_SECRET=<Secret key for JWT>
CLIENT_ID=<Google OAuth Client ID>
CLIENT_SECRET=<Google OAuth Secret>
EMAIL_USER=<Gmail for notifications>
CLOUDINARY_CLOUD_NAME=<Cloudinary name>
CLOUDINARY_API_KEY=<Cloudinary API key>
CLOUDINARY_API_SECRET=<Cloudinary API secret>
STRIPE_SECRET_KEY=<Stripe secret key>
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=<Stripe public key>
```

---

## 🔄 Data Flow Example: Creating a Contract

```
Frontend (React)
    ↓
[Create Contract Form]
    ↓
[Axios POST] /api/contracts
    ↓
Backend (Express)
    ↓
[Route Handler] contracts.routes.js
    ↓
[Controller] contract.controller.js
    ↓
[Validation] contract.validator.js (Zod)
    ↓
[Service Layer] contract.service.js
    ↓
[Model] contract.model.js
    ↓
[MongoDB] Save contract document
    ↓
[Socket.io] Emit 'contract:created' event
    ↓
Frontend (Real-time Update)
    ↓
[Update UI] Show new contract
```

---

## 📚 Project Maturity

**Phases Completed:**
- Phases 1-7: Core marketplace functionality
- Phase 8: Advanced marketplace (auctions, escrow, disputes)
- Phase 9: Real-time communication, payments, analytics
- Phase 10: Owner admin, verification, advanced ratings

**Total Lines of Code:** ~15,000+ (estimated)
**Total Database Collections:** 17
**Total API Endpoints:** 50+
**Real-time Events:** 20+

---

## 🛠️ Recent Fixes Applied
- Dashboard rendering issues fixed
- Import errors resolved
- Loading state issues addressed
- Component simplification for better performance

---

**Last Updated:** March 30, 2026
**Tech Stack Maturity:** Production-ready with advanced features
**Status:** Fully functional marketplace platform
