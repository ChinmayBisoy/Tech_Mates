const { z } = require('zod');

const fundMilestoneSchema = z.object({
  contractId: z.string().min(1, 'contractId is required'),
  milestoneId: z.string().min(1, 'milestoneId is required'),
});

const requestPayoutSchema = z.object({
  amount: z
    .number({
      invalid_type_error: 'amount must be a number',
    })
    .int('amount must be an integer in paise')
    .min(50000, 'Minimum payout amount is 50000 paise'),
});

module.exports = {
  fundMilestoneSchema,
  requestPayoutSchema,
};
