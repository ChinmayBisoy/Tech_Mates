const express = require('express');
const requirementController = require('../controllers/requirement.controller');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createRequirementSchema,
  updateRequirementSchema,
} = require('../validators/requirement.validator');

const router = express.Router();

router.post(
  '/',
  verifyJWT,
  requireRole('client', 'user'),
  validate(createRequirementSchema),
  requirementController.createRequirement
);

router.get('/', requirementController.getRequirements);

router.get('/my', verifyJWT, requireRole('client', 'user'), requirementController.getMyRequirements);

router.get('/:id', requirementController.getRequirementById);

router.put(
  '/:id',
  verifyJWT,
  requireRole('client', 'user'),
  validate(updateRequirementSchema),
  requirementController.updateRequirement
);

router.delete('/:id', verifyJWT, requireRole('client', 'user'), requirementController.deleteRequirement);

router.put('/:id/close', verifyJWT, requireRole('client', 'user'), requirementController.closeRequirement);

module.exports = router;
