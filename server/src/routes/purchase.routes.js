const express = require('express');
const proposalController = require('../controllers/proposal.controller');
const { verifyJWT, requireRole } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { sendProposalSchema, updateProposalSchema } = require('../validators/proposal.validator');

const router = express.Router();

router.post(
  '/',
  verifyJWT,
  requireRole('developer'),
  validate(sendProposalSchema),
  proposalController.sendProposal
);

router.get('/my', verifyJWT, requireRole('developer'), proposalController.getMyProposals);

router.get(
  '/requirement/:requirementId',
  verifyJWT,
  requireRole('client', 'user'),
  proposalController.getProposalsForRequirement
);

router.put('/:id/withdraw', verifyJWT, requireRole('developer'), proposalController.withdrawProposal);

router.put('/:id', verifyJWT, requireRole('developer'), validate(updateProposalSchema), proposalController.updateProposal);

router.put('/:id/shortlist', verifyJWT, requireRole('client', 'user'), proposalController.shortlistProposal);

router.put('/:id/reject', verifyJWT, requireRole('client', 'user'), proposalController.rejectProposal);

router.put('/:id/accept', verifyJWT, requireRole('client', 'user'), proposalController.acceptProposal);

module.exports = router;
