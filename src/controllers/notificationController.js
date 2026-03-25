// src/controllers/notificationController.js
const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  const notifications = await Notification.find({
    userId: req.user._id
  }).sort({ createdAt: -1 });

  res.json(notifications);
};

exports.markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true
  });

  res.json({ message: "Notification marked as read" });
};


