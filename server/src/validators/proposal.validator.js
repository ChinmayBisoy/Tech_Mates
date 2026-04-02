const { z } = require('zod');

const milestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().int().positive(),
  dueDate: z.coerce.date(),
});

const sendProposalSchema = z.object({
  requirementId: z.string().min(1),
  coverLetter: z.string().min(50).max(2000),
  proposedPrice: z.number().int().positive(),
  deliveryDays: z.number().int().min(1),
  milestones: z.array(milestoneSchema).min(1),
  portfolioLinks: z.array(z.string().url()).optional(),
});

const updateProposalSchema = z.object({
  coverLetter: z.string().min(50).max(2000),
  proposedPrice: z.number().int().positive(),
  deliveryDays: z.number().int().min(1),
  milestones: z.array(milestoneSchema).min(1),
  portfolioLinks: z.array(z.string().url()).optional(),
});

module.exports = {
  sendProposalSchema,
  updateProposalSchema,
};