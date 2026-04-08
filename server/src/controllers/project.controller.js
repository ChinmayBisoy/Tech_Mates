const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Project = require('../models/project.model');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const Chatroom = require('../models/chatroom.model');
const Message = require('../models/message.model');
const Notification = require('../models/notification.model');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
};

// Create a new project
const createProject = asyncHandler(async (req, res) => {
  const { title, description, category, budget, timeline, skills, deliverables } = req.body;

  if (!title || !description || !category || !budget || !timeline || !skills || !deliverables) {
    throw new ApiError(400, 'All fields are required');
  }

  // Check subscription and project limit
  const userSubscription = await Subscription.findOne({
    userId: req.user._id,
    status: 'active',
  });

  // If user doesn't have an active subscription, check project limit (max 2 projects)
  if (!userSubscription || (userSubscription && userSubscription.plan === 'free')) {
    const userProjectCount = await Project.countDocuments({ clientId: req.user._id });

    if (userProjectCount >= 2) {
      throw new ApiError(
        403,
        'You have reached the maximum limit of 2 projects. Upgrade to Pro subscription to post more projects.'
      );
    }
  }

  // Parse JSON fields
  let parsedBudget = budget;
  let parsedSkills = skills;

  if (typeof budget === 'string') {
    parsedBudget = JSON.parse(budget);
  }
  if (typeof skills === 'string') {
    parsedSkills = JSON.parse(skills);
  }

  if (!parsedBudget.min || !parsedBudget.max || parsedBudget.max < parsedBudget.min) {
    throw new ApiError(400, 'Invalid budget range');
  }

  if (!Array.isArray(parsedSkills) || parsedSkills.length === 0) {
    throw new ApiError(400, 'At least one skill is required');
  }

  // Upload attachments to Cloudinary
  const attachmentUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      try {
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'techmates/projects',
              resource_type: 'raw',
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(file.buffer);
        });

        attachmentUrls.push({
          name: file.originalname,
          url: uploadResult.secure_url,
          fileType: file.mimetype,
        });
      } catch (error) {
        console.error('Error uploading file to Cloudinary:', error);
      }
    }
  }

  const slug = generateSlug(title);

  // Check if slug already exists
  const existingProject = await Project.findOne({ slug });
  if (existingProject) {
    throw new ApiError(400, 'Project with similar title already exists');
  }

  const project = await Project.create({
    clientId: req.user._id,
    title,
    slug,
    description,
    category,
    budget: {
      min: Math.round(parsedBudget.min * 100),
      max: Math.round(parsedBudget.max * 100),
    },
    timeline,
    skills: parsedSkills,
    deliverables,
    attachments: attachmentUrls,
    status: 'open',
  });

  res.json(
    new ApiResponse(
      201,
      project,
      'Project created successfully'
    )
  );
});

// Get all projects (marketplace)
const getProjects = asyncHandler(async (req, res) => {
  const { category, skills, budget, search, page = 1, limit = 12 } = req.query;

  const filter = { status: 'open' };

  if (category) filter.category = category;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (skills) {
    const skillArray = Array.isArray(skills) ? skills : [skills];
    filter.skills = { $in: skillArray };
  }
  if (budget) {
    const [minBudget, maxBudget] = budget.split('-').map((b) => Math.round(parseFloat(b) * 100));
    filter['budget.max'] = { $gte: minBudget };
    if (maxBudget) {
      filter['budget.min'] = { $lte: maxBudget };
    }
  }

  const skip = (page - 1) * limit;
  const projects = await Project.find(filter)
    .populate('clientId', 'name email avatar rating reviewCount')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Project.countDocuments(filter);

  res.json(
    new ApiResponse(
      200,
      {
        projects,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit,
        },
      },
      'Projects fetched successfully'
    )
  );
});

// Get user's projects
const getMyProjects = asyncHandler(async (req, res) => {
  const { status = 'open', page = 1, limit = 12 } = req.query;

  const filter = { clientId: req.user._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const projects = await Project.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Project.countDocuments(filter);

  res.json(
    new ApiResponse(
      200,
      {
        projects,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit,
        },
      },
      'My projects fetched successfully'
    )
  );
});

// Get project detail
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(
    'clientId',
    'name email avatar rating reviewCount bio'
  );

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  res.json(new ApiResponse(200, project, 'Project fetched successfully'));
});

// Update project
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (project.clientId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this project');
  }

  const updates = req.body;
  Object.assign(project, updates);

  await project.save();

  res.json(new ApiResponse(200, project, 'Project updated successfully'));
});

// Delete project
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (project.clientId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this project');
  }

  await Project.findByIdAndDelete(req.params.id);

  res.json(new ApiResponse(200, {}, 'Project deleted successfully'));
});

// Get project proposals/bids
const getProjectProposals = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (project.clientId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to view these proposals');
  }

  res.json(
    new ApiResponse(
      200,
      project.proposals || [],
      'Proposals fetched successfully'
    )
  );
});

// Send message to developer about project
const sendProjectMessage = asyncHandler(async (req, res) => {
  const { projectId, developerId } = req.params;
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, 'Message cannot be empty');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const developer = await User.findById(developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  // Create or get chatroom
  let chatroom = await Chatroom.findOne({
    participants: { $all: [req.user._id, developerId] },
    projectId,
  });

  if (!chatroom) {
    chatroom = await Chatroom.create({
      participants: [req.user._id, developerId],
      projectId,
      chatType: 'project',
      lastMessage: message,
      lastMessageAt: new Date(),
    });
  }

  // Create message
  const msg = await Message.create({
    chatroomId: chatroom._id,
    senderId: req.user._id,
    content: message,
  });

  // Update chatroom
  chatroom.lastMessage = message;
  chatroom.lastMessageAt = new Date();
  await chatroom.save();

  // Send notification to developer
  await Notification.create({
    recipientId: developerId,
    senderId: req.user._id,
    type: 'project_message',
    title: 'New Project Message',
    message: `${req.user.name} sent you a message about "${project.title}"`,
    relatedId: projectId,
  });

  if (global.io) {
    global.io.to(developerId.toString()).emit('notification', {
      type: 'project_message',
      title: 'New Project Message',
      message: `${req.user.name} sent you a message about "${project.title}"`,
      projectId,
    });
  }

  res.json(new ApiResponse(201, msg, 'Message sent successfully'));
});

// Get project conversation
const getProjectConversation = asyncHandler(async (req, res) => {
  const { projectId, developerId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const chatroom = await Chatroom.findOne({
    participants: { $all: [req.user._id, developerId] },
    projectId,
  });

  if (!chatroom) {
    return res.json(new ApiResponse(200, { messages: [] }, 'No conversation yet'));
  }

  const skip = (page - 1) * limit;
  const messages = await Message.find({ chatroomId: chatroom._id })
    .populate('senderId', 'name avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .exec();

  const totalMessages = await Message.countDocuments({ chatroomId: chatroom._id });

  res.json(
    new ApiResponse(
      200,
      {
        messages: messages.reverse(),
        pagination: {
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit),
          currentPage: page,
          limit,
        },
      },
      'Conversation fetched successfully'
    )
  );
});

module.exports = {
  createProject,
  getProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectProposals,
  sendProjectMessage,
  getProjectConversation,
};
