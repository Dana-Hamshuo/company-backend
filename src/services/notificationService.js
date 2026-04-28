//src/services/notificationService.js
const User = require("../models/User")
const Notification = require("../models/Notification")
const AppError = require("../utils/AppError");

exports.notifyUsers = async (userIds, message, type, taskId, meta = {}) => {

  if (!userIds || userIds.length === 0) return

  const uniqueUsers = [...new Set(userIds.map(id => id.toString()))]

  const notifications = uniqueUsers.map(userId => ({
    userId,
    message,
    type,
    taskId,
    meta
  }))

  await Notification.insertMany(notifications)
  if (firebaseInitialized) {
    await this.sendPushNotifications(uniqueUsers, message, meta);
  }
}

exports.sendPushNotifications = async (userIds, title, meta = {}) => {
  try {
    const devices = await DeviceToken.find({ 
      userId: { $in: userIds } 
    });

    if (devices.length === 0) {
      console.log('📭 No device tokens found for push notifications');
      return;
    }

    const messages = devices.map(device => ({
      token: device.token,
      notification: {
        title: title,
        body: meta.body || title,  // إذا في body مخصص استخدمه
      },
      data: {
        ...meta,
        type: meta.type || 'general',
        timestamp: new Date().toISOString()
      },
      // إعدادات خاصة بـ Android
      android: {
        priority: 'high',
        notification: {
          channelId: 'default',
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      // إعدادات خاصة بـ iOS
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

    const chunks = this.chunkArray(messages, 500);
    
    for (const chunk of chunks) {
      const response = await messaging.sendEachForMulticast(chunk);
      console.log(`Push sent: ${response.successCount} succeeded, ${response.failureCount} failed`);
      
      await this.cleanupInvalidTokens(response, devices);
    }

  } catch (error) {
    console.error('Error sending push notifications:', error.message);
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

// exports.notifyTaskCreated = async(task)=>{
//   const userIds = task.assignedUsers.map(u=>u.userId)

//   await exports.notifyUsers(
//     userIds,
//     `New task assigned: ${task.title}`,
//     "new_task",
//     task._id
//   )
// }


// exports.notifyTaskCompleted = async(task)=>{
//   const userIds = task.assignedUsers.map(u=>u.userId)

//   await exports.notifyUsers(
//     userIds,
//     `Task completed: ${task.title}`,
//     "task_update",
//     task._id
//   )
// }


// exports.notifyTaskDelayed = async(task)=>{
//   console.log("EVENT FIRED:", task.title)
//   const userIds = task.assignedUsers.map(u=>u.userId)

//   await exports.notifyUsers(
//     userIds,
//     `Task delayed: ${task.title}`,
//     "delay",
//     task._id,
//     {reason:task.delayReason}
//   )
// }

exports.notifyTaskCreated = async (task) => {

  const userIds = task.assignedUsers.map(u => u.userId)

  await exports.notifyUsers(
    userIds,
    `New task assigned: ${task.title}`,
    "new_task",
    task._id
  )
}
exports.notifyTaskCompleted = async (task) => {

  const userIds = task.assignedUsers.map(u => u.userId)

  await exports.notifyUsers(
    userIds,
    `Task completed: ${task.title}`,
    "task_update",
    task._id
  )
}

exports.notifyTaskDelayed = async (task) => {

  const userIds = task.assignedUsers.map(u => u.userId)

  await exports.notifyUsers(
    userIds,
    `Task delayed: ${task.title}`,
    "delay",
    task._id,
    { reason: task.delayReason }
  )
}
exports.notifyDependencyReady = async (task) => {

  const userIds = task.assignedUsers.map(u => u.userId.toString())

  await exports.notifyUsers(
    userIds,
    `You can now start task: ${task.title}`,
    "dependency",
    task._id
  )
}