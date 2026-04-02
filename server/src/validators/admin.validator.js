const { z } = require('zod');

const banUserSchema = z.object({
  reason: z.string().min(5, 'reason must be at least 5 characters').max(200, 'reason must be at most 200 characters'),
});

const rejectListingSchema = z.object({
  reason: z.string().min(5, 'reason must be at least 5 characters').max(500, 'reason must be at most 500 characters'),
});

const analyticsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).default('month'),
});

module.exports = {
  banUserSchema,
  rejectListingSchema,
  analyticsQuerySchema,
};
