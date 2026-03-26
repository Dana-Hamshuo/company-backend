// src/controllers/notificationController.js
const Notification = require("../models/Notification");
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");

exports.getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });
   return success(res,notifications)
});

exports.markAsRead =asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

   return success(res,"Notification marked as read") 
});


