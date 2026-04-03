const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { randomUUID } = require('crypto');
const authRouter = require('./routes/auth.routes');
const requirementRouter = require('./routes/requirement.routes');
const proposalRouter = require('./routes/proposal.routes');
const contractRouter = require('./routes/contract.routes');
const userRouter = require('./routes/user.routes');
const reviewRouter = require('./routes/review.routes');
const walletRouter = require('./routes/wallet.routes');
const listingRouter = require('./routes/listing.routes');
const wishlistRouter = require('./routes/wishlist.routes');
const adminRouter = require('./routes/admin.routes');
const verificationRouter = require('./routes/verification.routes');
const paymentRouter = require('./routes/payment.routes');
const purchaseRouter = require('./routes/purchase.routes');
const chatRouter = require('./routes/chat.routes');
const notificationRouter = require('./routes/notification.routes');
const subscriptionRouter = require('./routes/subscription.routes');
const kycRouter = require('./routes/kyc.routes');
const socialRouter = require('./routes/social.routes');
const paymentController = require('./controllers/payment.controller');
const subscriptionController = require('./controllers/subscription.controller');
const { authLimiter, apiLimiter, paymentLimiter } = require('./middleware/rateLimiter');
const ApiError = require('./utils/ApiError');
const errorHandler = require('./middleware/error.middleware');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = [allowedOrigin, 'http://localhost:5173', 'http://localhost:5174'];

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", ...allowedOrigins],
    },
  },
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Logging middleware
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Request correlation id
app.use((req, res, next) => {
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Global API limiter for all /api routes
app.use('/api', apiLimiter);

// Webhooks must use raw body and run before JSON body parser.
// Stripe webhook
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Subscription webhook
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

// Body parsing middlewares
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/requirements', requirementRouter);
app.use('/api/proposals', proposalRouter);
app.use('/api/contracts', contractRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/listings', listingRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/admin', adminRouter);
app.use('/api/verification', verificationRouter);
app.use('/api/payments', paymentLimiter, paymentRouter);
app.use('/api/purchases', purchaseRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/kyc', kycRouter);
app.use('/api/social', socialRouter);

// Final catch-all 404
app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;