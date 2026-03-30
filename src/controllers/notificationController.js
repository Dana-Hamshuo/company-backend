// src/controllers/notificationController.js
const Notification = require("../models/Notification");
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

   return success(res,notifications)
});

exports.markAsRead = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    {
      _id: id,
      userId: req.user._id
    },
    {
      isRead: true
    },
    {
      new: true
    }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found"
    });
  }

  return success(res, notification, "Marked as read");});

  exports.markAllAsRead = asyncHandler(async (req, res) => {

    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
  
    return success(res, null, "All notifications marked as read");
  });