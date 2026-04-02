const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ValidationError') {
    // Mongoose ValidationError
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  } else if (err.name === 'CastError') {
    // Mongoose CastError (invalid ObjectId)
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0] || 'field';
    message = `${field} already exists`;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  const response = new ApiResponse(statusCode, null, message);
  if (errors.length > 0) {
    response.errors = errors;
  }

  // Don't expose stack trace in production
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
