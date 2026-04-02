const express = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const chatController = require('../controllers/chat.controller');
const { createRoomSchema } = require('../validators/chat.validator');

const router = express.Router();

router.get('/rooms', verifyJWT, chatController.getRooms);
router.post('/rooms', verifyJWT, validate(createRoomSchema), chatController.createRoom);
router.get('/rooms/:roomId/messages', verifyJWT, chatController.getMessages);
router.delete('/rooms/:roomId/messages', verifyJWT, chatController.clearRoomMessages);
router.delete('/messages/:messageId', verifyJWT, chatController.deleteMessage);

module.exports = router;
