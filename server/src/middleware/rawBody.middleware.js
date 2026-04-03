/**
 * Raw Body Middleware
 * Captures raw body request for webhook signature verification
 */
const rawBodyMiddleware = (req, res, next) => {
  let rawBody = '';

  req.on('data', (chunk) => {
    rawBody += chunk.toString();
  });

  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
};

module.exports = rawBodyMiddleware;
