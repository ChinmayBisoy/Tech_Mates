const express = require('express');
const contractController = require('../controllers/contract.controller');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', verifyJWT, contractController.getContracts);

router.get('/:id', verifyJWT, contractController.getContractById);

router.put(
  '/:id/milestone/:milestoneId/submit',
  verifyJWT,
  requireRole('developer'),
  contractController.submitMilestone
);

router.put(
  '/:id/milestone/:milestoneId/approve',
  verifyJWT,
  requireRole('client', 'user'),
  contractController.approveMilestone
);

router.put(
  '/:id/milestone/:milestoneId/request-revision',
  verifyJWT,
  requireRole('client', 'user'),
  contractController.requestRevision
);

router.put(
  '/:id/milestone/:milestoneId/dispute',
  verifyJWT,
  requireRole('client', 'user'),
  contractController.disputeMilestone
);

module.exports = router;
