// src/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: ["task_update", "delay", "dependency", "new_task"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },

  isRead: {
    type: Boolean,
    default: false
  },
  
  meta:{
    type:Object,
    default:{}
   }

}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);