const express = require('express');
const { verifyJWT } = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller');

const router = express.Router();

router.get('/', verifyJWT, notificationController.getNotifications);
router.put('/read-all', verifyJWT, notificationController.markAllAsRead);
router.delete('/delete-all', verifyJWT, notificationController.deleteAllNotifications);
router.put('/:id/read', verifyJWT, notificationController.markAsRead);

module.exports = router;
