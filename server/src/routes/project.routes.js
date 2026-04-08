const express = require('express');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const projectController = require('../controllers/project.controller');
const { attachmentUpload } = require('../middleware/upload.middleware');

const router = express.Router();

// Create a new project (client only)
router.post(
  '/create',
  verifyJWT,
  requireRole('client', 'user'),
  attachmentUpload.array('attachments', 3),
  projectController.createProject
);

// Get all projects (public marketplace)
router.get('/', projectController.getProjects);

// Get my projects (client only)
router.get('/my', verifyJWT, requireRole('client', 'user'), projectController.getMyProjects);

// Get single project detail
router.get('/:id', projectController.getProjectById);

// Update project (client only)
router.put(
  '/:id',
  verifyJWT,
  requireRole('client', 'user'),
  attachmentUpload.array('attachments', 3),
  projectController.updateProject
);

// Delete project (client only)
router.delete('/:id', verifyJWT, requireRole('client', 'user'), projectController.deleteProject);

// Get project proposals/bids
router.get('/:id/proposals', verifyJWT, projectController.getProjectProposals);

// Message developer for a project
router.post('/:projectId/message/:developerId', verifyJWT, projectController.sendProjectMessage);

// Get conversation for a project
router.get('/:projectId/conversation/:developerId', verifyJWT, projectController.getProjectConversation);

module.exports = router;
