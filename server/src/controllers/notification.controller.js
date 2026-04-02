
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user._id, req.query);
  res.json(new ApiResponse(200, result, 'Notifications fetched successfully'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  res.json(new ApiResponse(200, notification, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  res.json(new ApiResponse(200, result, 'All notifications marked as read'));
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteAllNotifications(req.user._id);
  res.json(new ApiResponse(200, result, 'All notifications deleted successfully'));
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteAllNotifications,
};
