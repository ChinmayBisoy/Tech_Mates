const Requirement = require('../models/requirement.model');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 50);

  return { page, limit, skip: (page - 1) * limit };
};

const createRequirement = async (clientId, data) => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const requirement = await Requirement.create({
    ...data,
    postedBy: clientId,
    expiresAt,
  });

  try {
    await notificationService.notifyNewRequirement(requirement, clientId);
  } catch (error) {
    console.error('Failed to create new requirement notifications:', error);
  }

  return requirement;
};

const getRequirements = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    isDeleted: false,
    status: 'open',
  };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.skills && Array.isArray(filters.skills) && filters.skills.length > 0) {
    query.skillsRequired = { $in: filters.skills };
  }

  if (typeof filters.budgetMin !== 'undefined' || typeof filters.budgetMax !== 'undefined') {
    query.budgetMin = {};

    if (typeof filters.budgetMin !== 'undefined') {
      query.budgetMin.$gte = Number(filters.budgetMin);
    }

    if (typeof filters.budgetMax !== 'undefined') {
      query.budgetMin.$lte = Number(filters.budgetMax);
    }
  }

  const sort = {};
  if (filters.sortBy === 'deadline_asc') {
    sort.deadline = 1;
  } else if (filters.sortBy === 'deadline_desc') {
    sort.deadline = -1;
  } else {
    sort.createdAt = -1;
  }

  const [items, total] = await Promise.all([
    Requirement.find(query).sort(sort).skip(skip).limit(limit),
    Requirement.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getRequirementById = async (id) => {
  const requirement = await Requirement.findOne({
    _id: id,
    isDeleted: false,
  }).populate('postedBy', 'name avatar avgRating');

  if (!requirement) {
    throw new ApiError(404, 'Requirement not found');
  }

  return requirement;
};

const updateRequirement = async (id, clientId, data) => {
  const requirement = await Requirement.findOne({ _id: id, isDeleted: false });

  if (!requirement) {
    throw new ApiError(404, 'Requirement not found');
  }

  if (String(requirement.postedBy) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to update this requirement');
  }

  if (requirement.status !== 'open') {
    throw new ApiError(400, 'Only open requirements can be updated');
  }

  Object.assign(requirement, data);
  await requirement.save();

  return requirement;
};

const deleteRequirement = async (id, clientId) => {
  const requirement = await Requirement.findOne({ _id: id, isDeleted: false });

  if (!requirement) {
    throw new ApiError(404, 'Requirement not found');
  }

  if (String(requirement.postedBy) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to delete this requirement');
  }

  requirement.isDeleted = true;
  requirement.deletedAt = new Date();
  await requirement.save();

  return requirement;
};

const closeRequirement = async (id, clientId) => {
  const requirement = await Requirement.findOne({ _id: id, isDeleted: false });

  if (!requirement) {
    throw new ApiError(404, 'Requirement not found');
  }

  if (String(requirement.postedBy) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to close this requirement');
  }

  requirement.status = 'cancelled';
  await requirement.save();

  return requirement;
};

const getMyRequirements = async (clientId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    postedBy: clientId,
    isDeleted: false,
  };

  const [items, total] = await Promise.all([
    Requirement.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Requirement.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

module.exports = {
  createRequirement,
  getRequirements,
  getRequirementById,
  updateRequirement,
  deleteRequirement,
  closeRequirement,
  getMyRequirements,
};
