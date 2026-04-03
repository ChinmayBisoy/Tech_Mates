const express = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const socialController = require('../controllers/social.controller');
const {
  sendRequestSchema,
  respondRequestSchema,
  updateSocialProfileSchema,
} = require('../validators/social.validator');

const router = express.Router();

router.get('/discover', verifyJWT, socialController.listDiscoverUsers);
router.get('/requests', verifyJWT, socialController.getRequests);
router.get('/connections', verifyJWT, socialController.getConnections);
router.get('/profile/me', verifyJWT, socialController.getMySocialProfile);

router.post('/requests', verifyJWT, validate(sendRequestSchema), socialController.sendConnectionRequest);
router.patch('/requests/:requestId/respond', verifyJWT, validate(respondRequestSchema), socialController.respondToRequest);
router.put('/profile/me', verifyJWT, validate(updateSocialProfileSchema), socialController.updateMySocialProfile);

module.exports = router;
