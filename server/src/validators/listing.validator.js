const { z } = require('zod');

const typeEnum = z.enum([
  'complete_project',
  'template',
  'saas_starter',
  'module',
  'ui_kit',
  'idea_concept',
]);

const licenseEnum = z.enum(['single_use', 'multi_use', 'open_source']);
const supportDaysEnum = z.union([z.literal(0), z.literal(7), z.literal(14), z.literal(30)]);
const deliveryMethodEnum = z.enum(['download', 'github_access']);

const createListingSchema = z.object({
  title: z.string().min(5, 'title must be at least 5 characters').max(150, 'title must not exceed 150 characters'),
  description: z.string().min(50, 'description must be at least 50 characters'),
  category: z.string().min(1, 'category is required'),
  subcategory: z.string().optional(),
  type: typeEnum,
  techStack: z.array(z.string().min(1)).min(1, 'techStack must have at least one item'),
  tags: z.array(z.string().min(1)).optional(),
  price: z.number().min(0, 'price must be >= 0'),
  previewImages: z.array(z.string().url('previewImages must be valid URLs')).max(5).optional(),
  demoUrl: z.string().url('demoUrl must be valid URL').optional(),
  repositoryUrl: z.string().url('repositoryUrl must be valid URL').optional(),
  licenseType: licenseEnum,
  supportDays: supportDaysEnum,
  isExclusive: z.boolean().optional(),
  documentationIncluded: z.boolean().optional(),
  whatsIncluded: z.array(z.string().min(1)).optional(),
  deliveryMethod: deliveryMethodEnum,
});

const updateListingSchema = createListingSchema.partial();

const listingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
  category: z.string().optional(),
  type: typeEnum.optional(),
  techStack: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  licenseType: licenseEnum.optional(),
  supportDays: z.coerce.number().refine((val) => [0, 7, 14, 30].includes(val), 'supportDays must be one of 0, 7, 14, 30').optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular']).optional(),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
  listingQuerySchema,
};
