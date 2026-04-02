const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const submitReviewSchema = z.object({
  rating: z.number().min(1, 'rating must be at least 1').max(5, 'rating must be at most 5'),
  comment: z.string().min(10, 'comment must be at least 10 characters').max(1000, 'comment must be at most 1000 characters'),
  contractId: objectIdSchema.optional(),
  purchaseId: objectIdSchema.optional(),
});

module.exports = {
  submitReviewSchema,
};
