const Notification = require("../models/Notification");
const DeviceToken = require("../models/DeviceToken");
const AppError = require("../utils/AppError");

const firebaseConfig = require("../config/firebase");
const firebaseInitialized = firebaseConfig.initialized;
const messaging = firebaseConfig.messaging;

exports.notifyUsers = async (userIds, message, type, taskId, meta = {}) => {
  if (!userIds || userIds.length === 0) return;

  const uniqueUsers = [...new Set(userIds.map(id => id.toString()))];

  const notifications = uniqueUsers.map(userId => ({
    userId,
    message,
    type,
    taskId,
    meta
  }));

  await Notification.insertMany(notifications);

  if (firebaseInitialized) {
    await this.sendPushNotifications(uniqueUsers, message, meta);
  }
};

exports.sendPushNotifications = async (userIds, title, meta = {}) => {
  try {
    const devices = await DeviceToken.find({ 
      userId: { $in: userIds },
      token: { $exists: true, $ne: '', $ne: null }
    }).select('token');

    if (!devices || devices.length === 0) {
      console.log(' No valid device tokens found');
      return;
    }

    const messages = devices
      .filter(d => d?.token?.trim())  // فلتر التوكن الفاضي
      .map(device => ({
        token: device.token.trim(),
        
        notification: {
          title: title || 'Notification',
          body: meta?.body || title || 'You have a new update',
        },
        
        data: {  
          ...meta,
          type: meta?.type || 'general',
          timestamp: new Date().toISOString()
        },
        
        android: {
          priority: 'high',
          notification: {
            channelId: 'default',
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              category: 'TASK_NOTIFICATION'
            }
          }
        }
      }));

    if (messages.length === 0) return;

    const response = await messaging.sendEachForMulticast(messages);
    
    console.log(` Push: ${response.successCount} ok, ${response.failureCount} failed`);
    
    await this.cleanupInvalidTokens(response, devices);

  } catch (error) {
    console.error(' Push error:', error.message);
  }
};

exports.cleanupInvalidTokens = async (response, devices) => {
  const invalidTokens = [];
  
  response.responses.forEach((resp, index) => {
    if (!resp.success) {
      const error = resp.error?.toString() || '';
      if (error.includes('NOT_REGISTERED') || error.includes('INVALID_ARGUMENT')) {
        invalidTokens.push(devices[index].token);
      }
    }
  });

  if (invalidTokens.length > 0) {
    await DeviceToken.deleteMany({ token: { $in: invalidTokens } });
    console.log(`Cleaned ${invalidTokens.length} invalid tokens`);
  }
};

exports.chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

exports.notifyTaskCreated = async (task) => {
  const userIds = task.assignedUsers.map(u => u.userId);
  
  await exports.notifyUsers(
    userIds,
    "Task assigned",
    "new_task",
    task._id,
    { 
      body: "You have been assigned to a new task by the scheduler",
      taskId: task._id.toString(),
      type: "new_task"
    }
  );
};

exports.notifyTaskCompleted = async (task) => {
  const userIds = task.assignedUsers.map(u => u.userId);
  
  await exports.notifyUsers(
    userIds,
    "Status changed",
    "task_update",
    task._id,
    { 
      body: "The task assigned to you has been completed",
      taskId: task._id.toString(),
      type: "task_update"
    }
  );
};

exports.notifyTaskDelayed = async (task) => {
  const userIds = task.assignedUsers.map(u => u.userId);
  
  await exports.notifyUsers(
    userIds,
    "Task delayed",
    "delay",
    task._id,
    { 
      body: task.delayReason || "The task has been delayed",
      reason: task.delayReason,
      taskId: task._id.toString(),
      type: "delay"
    }
  );
};

exports.notifyDependencyReady = async (task) => {
  const userIds = task.assignedUsers.map(u => u.userId.toString());
  
  await exports.notifyUsers(
    userIds,
    "Dependency resolved",
    "dependency",
    task._id,
    { 
      body: "Previous tasks are completed, you can start now",
      taskId: task._id.toString(),
      type: "dependency"
    }
  );
};

module.exports = exports;