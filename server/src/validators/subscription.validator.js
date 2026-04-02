const { z } = require('zod');

const createSubscriptionSchema = z.object({
  plan: z.enum(['monthly', 'yearly']),
});

module.exports = {
  createSubscriptionSchema,
};
