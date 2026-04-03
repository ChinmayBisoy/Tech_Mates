const { z } = require('zod');

const sendRequestSchema = z.object({
  targetUserId: z.string().min(1, 'targetUserId is required'),
});

const respondRequestSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

const recentWorkSchema = z.object({
  title: z.string().min(1, 'title is required').max(120, 'title must be at most 120 characters'),
  description: z.string().max(500, 'description must be at most 500 characters').optional().default(''),
  link: z.string().trim().url('link must be a valid URL').or(z.literal('')).optional().default(''),
});

const updateSocialProfileSchema = z.object({
  socialHeadline: z.string().max(120, 'socialHeadline must be at most 120 characters').optional(),
  bio: z.string().max(500, 'bio must be at most 500 characters').optional(),
  achievements: z.array(z.string().min(1).max(120)).max(20).optional(),
  recentWorks: z.array(recentWorkSchema).max(20).optional(),
});

module.exports = {
  sendRequestSchema,
  respondRequestSchema,
  updateSocialProfileSchema,
};
