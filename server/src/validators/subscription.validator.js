const { z } = require('zod');

const createSubscriptionSchema = z.object({
  planId: z.enum(['free', 'pro', 'max']),
});

module.exports = {
  createSubscriptionSchema,
};
