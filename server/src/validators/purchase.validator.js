const { z } = require('zod');

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const disputeReasonEnum = z.enum([
  'not_as_described',
  'broken_code',
  'files_not_delivered',
  'other',
]);

const initiatePurchaseSchema = z.object({
  listingId: objectIdSchema,
});

const raiseDisputeSchema = z.object({
  purchaseId: objectIdSchema,
  reason: disputeReasonEnum,
  description: z.string().min(20, 'description must be at least 20 characters'),
});

const respondDisputeSchema = z.object({
  response: z.string().min(10, 'response must be at least 10 characters'),
});

const resolveDisputeSchema = z.object({
  resolution: z.string().min(10, 'resolution must be at least 10 characters'),
  refundBuyer: z.boolean(),
});

module.exports = {
  initiatePurchaseSchema,
  raiseDisputeSchema,
  respondDisputeSchema,
  resolveDisputeSchema,
};
