const ApiError = require('../utils/ApiError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const payload = source === 'query' ? req.query : req.body;
      const result = schema.safeParse(payload);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        throw new ApiError(400, 'Validation failed', errors);
      }

      if (source === 'query') {
        req.validatedQuery = result.data;
      } else {
        req.validatedBody = result.data;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;
