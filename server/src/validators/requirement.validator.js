const { z } = require('zod');

const requirementBaseSchema = z.object({
  title: z.string().min(5).max(150),
  description: z.string().min(20),
  budgetMin: z.number().int().nonnegative(),
  budgetMax: z.number().int().nonnegative(),
  budgetType: z.enum(['fixed', 'hourly']).default('fixed'),
  deadline: z.coerce.date().refine((date) => date.getTime() > Date.now(), {
    message: 'deadline must be a future date',
  }),
  skills: z.array(z.string().min(1)).min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  attachments: z.array(z.string().url()).optional(),
  visibility: z.enum(['public', 'invite_only', 'private']).default('public'),
  requiresNDA: z.boolean().optional(),
  maxProposals: z.number().int().min(1).max(200).optional(),
});

const createRequirementSchema = requirementBaseSchema
  .refine((data) => data.budgetMax >= data.budgetMin, {
    path: ['budgetMax'],
    message: 'budgetMax must be greater than or equal to budgetMin',
  })
  .transform((data) => ({
    ...data,
    skillsRequired: data.skills,
    skills: undefined,
  }));

const updateRequirementSchema = requirementBaseSchema.partial()
  .refine(
    (data) => {
      if (typeof data.budgetMin === 'undefined' || typeof data.budgetMax === 'undefined') {
        return true;
      }

      return data.budgetMax >= data.budgetMin;
    },
    {
      path: ['budgetMax'],
      message: 'budgetMax must be greater than or equal to budgetMin',
    }
  )
  .transform((data) => ({
    ...data,
    skillsRequired: data.skills,
    skills: undefined,
  }));

const requirementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  budgetMin: z.coerce.number().int().nonnegative().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  sortBy: z.enum(['deadline_asc', 'deadline_desc', 'newest']).default('newest'),
});

module.exports = {
  createRequirementSchema,
  updateRequirementSchema,
  requirementQuerySchema,
};
