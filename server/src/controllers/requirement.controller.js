const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const requirementService = require('../services/requirement.service');
const { requirementQuerySchema } = require('../validators/requirement.validator');

const isClientRole = (role) => role === 'client' || role === 'user';

const createRequirement = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can create requirements');
  }

  const requirement = await requirementService.createRequirement(req.user._id, req.validatedBody);

  res.json(new ApiResponse(201, requirement, 'Requirement created successfully'));
});

const getRequirements = asyncHandler(async (req, res) => {
  const queryResult = requirementQuerySchema.safeParse(req.query);

  if (!queryResult.success) {
    throw new ApiError(400, 'Invalid query parameters', queryResult.error.issues);
  }

  const query = queryResult.data;
  const skills = typeof query.skills === 'string'
    ? query.skills.split(',').map((value) => value.trim()).filter(Boolean)
    : query.skills;

  const result = await requirementService.getRequirements(
    {
      category: query.category,
      skills,
      budgetMin: query.budgetMin,
      budgetMax: query.budgetMax,
      sortBy: query.sortBy,
    },
    {
      page: query.page,
      limit: query.limit,
    }
  );

  res.json(new ApiResponse(200, result.items, 'Requirements fetched successfully', result.pagination));
});

const getRequirementById = asyncHandler(async (req, res) => {
  const requirement = await requirementService.getRequirementById(req.params.id);

  res.json(new ApiResponse(200, requirement, 'Requirement fetched successfully'));
});

const updateRequirement = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can update requirements');
  }

  const requirement = await requirementService.updateRequirement(
    req.params.id,
    req.user._id,
    req.validatedBody
  );

  res.json(new ApiResponse(200, requirement, 'Requirement updated successfully'));
});

const deleteRequirement = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can delete requirements');
  }

  const requirement = await requirementService.deleteRequirement(req.params.id, req.user._id);

  res.json(new ApiResponse(200, requirement, 'Requirement deleted successfully'));
});

const closeRequirement = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can close requirements');
  }

  const requirement = await requirementService.closeRequirement(req.params.id, req.user._id);

  res.json(new ApiResponse(200, requirement, 'Requirement closed successfully'));
});

const getMyRequirements = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can access their requirements');
  }

  const result = await requirementService.getMyRequirements(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
  });

  res.json(new ApiResponse(200, result.items, 'My requirements fetched successfully', result.pagination));
});

module.exports = {
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  closeRequirement,
  getMyRequirements,
};
