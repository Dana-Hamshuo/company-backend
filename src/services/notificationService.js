const Notification = require("../models/Notification");
const DeviceToken = require("../models/DeviceToken");
const AppError = require("../utils/AppError");

// const firebaseConfig = require("../config/firebase");
// const firebaseInitialized = firebaseConfig.initialized;
// const messaging = firebaseConfig.messaging;

const { initialized: firebaseInitialized } = require("../config/firebase");
const admin = require('firebase-admin');

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

// exports.sendPushNotifications = async (userIds, title, meta = {}) => {
//   try {
//     const devices = await DeviceToken.find({ 
//       userId: { $in: userIds },
//       token: { $exists: true, $ne: '', $ne: null }
//     }).select('token');

//     if (!devices || devices.length === 0) {
//       console.log('No valid device tokens found');
//       return;
//     }

//     const messages = devices
//       .filter(d => d?.token?.trim())
//       .map(device => {
//         const message = {
//           token: device.token.trim(),
//           notification: {
//             title: title || 'Notification',
//             body: meta?.body || title || 'You have a new update',
//           },
//           data: {
//             ...meta,
//             type: meta?.type || 'general',
//             timestamp: new Date().toISOString()
//           }
//         };

//         if (device.deviceType === 'android') {
//           message.android = {
//             priority: 'high',
//             notification: {
//               channelId: 'default',
//               sound: 'default',
//               clickAction: 'FLUTTER_NOTIFICATION_CLICK'
//             }
//           };
//         }

//         if (device.deviceType === 'ios') {
//           message.apns = {
//             payload: {
//               aps: {
//                 sound: 'default',
//                 badge: 1,
//                 category: 'TASK_NOTIFICATION'
//               }
//             }
//           };
//         }

//         return message;
//       });

//     if (messages.length === 0) {
//       console.log('No valid messages to send');
//       return;
//     }

//     console.log('Sending push with messages:', JSON.stringify(messages.slice(0, 1), null, 2));

//     if (!messaging || typeof messaging.sendEachForMulticast !== 'function') {
//       console.error('Firebase messaging not initialized');
//       return;
//     }

//     const response = await messaging.sendEachForMulticast(messages);
    
//     console.log(`Push: ${response.successCount} ok, ${response.failureCount} failed`);
    
//     await this.cleanupInvalidTokens(response, devices);

//   } catch (error) {
//     console.error('Push error:', error.message, error.stack);
//   }

// };

exports.sendPushNotifications = async (userIds, title, meta = {}) => {
  try {
    const admin = require('firebase-admin');
    const { initialized: firebaseInitialized } = require('../config/firebase');
    
    console.log('[PUSH DEBUG] Starting sendPushNotifications', {
      firebaseInitialized,
      adminExists: !!admin,
      userIdsCount: userIds?.length
    });

    if (!firebaseInitialized || !admin) {
      console.error('Firebase not initialized - skipping push');
      return;
    }

    const messaging = admin.messaging();
    
    console.log('[PUSH DEBUG] Got messaging instance', {
      messagingType: typeof messaging,
      sendEachForMulticastType: typeof messaging?.sendEachForMulticast
    });

    if (typeof messaging?.sendEachForMulticast !== 'function') {
      console.error('sendEachForMulticast not available on messaging instance');
      return;
    }

    const devices = await DeviceToken.find({ 
      userId: { $in: userIds },
      token: { $exists: true, $ne: '', $ne: null }
    }).select('token');

    if (!devices || devices.length === 0) {
      console.log('No valid device tokens found');
      return;
    }

    const tokens = devices
      .map(d => d.token?.trim())
      .filter(t => t && t.length > 0);

    if (tokens.length === 0) {
      console.log('No valid tokens after filtering');
      return;
    }

    const messages = tokens.map(token => ({
      token: token,
      notification: {
        title: title || 'Notification',
        body: meta?.body || title || 'You have a new update',
      },
      data: {
        type: String(meta?.type || 'general'),
        taskId: String(meta?.taskId || ''),
        reason: String(meta?.reason || ''),
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

    console.log('Sending with sendEach:', {
      messageCount: messages.length,
      firstToken: tokens[0]?.substring(0, 20) + '...',
      hasNotification: !!messages[0]?.notification?.title,
      hasData: !!messages[0]?.data
    });

    const response = await messaging.sendEach(messages);
    
    console.log('Push:', response.successCount, 'succeeded,', response.failureCount, 'failed');
    
    if (response.failureCount > 0 && response.responses) {
      const failedTokens = response.responses
        .map((resp, idx) => ({ resp, token: tokens[idx] }))
        .filter(item => !item.resp.success)
        .map(item => item.token);
      
      if (failedTokens.length > 0) {
        await DeviceToken.deleteMany({ token: { $in: failedTokens } });
        console.log('Cleaned', failedTokens.length, 'invalid tokens');
      }
    }

  } catch (error) {
    console.error('Push error:', error.message);
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
  const schedule = task.schedule[0];
  const body = `تم إنشاء مهمة جديدة لك: "${task.title}"\nتبدأ: ${schedule.date} الساعة ${schedule.startTime}`;
  
  await exports.notifyUsers(
    userIds,
    "مهمة جديدة",
    "new_task",
    task._id,
    { 
      body: body,
      taskId: task._id.toString(),
      type: "new_task",
      taskTitle: task.title,
      startTime: schedule.startTime,
      startDate: schedule.date
    }
  );
};

exports.notifyTaskUpdated = async (task, updatedFields) => {
  const userIds = task.assignedUsers.map(u => u.userId);
  const schedule = task.schedule[0];
  let changes = '';
  if (updatedFields.title) changes += `العنوان: ${updatedFields.title}\n`;
  if (updatedFields.status) changes += `الحالة: ${updatedFields.status}\n`;
  if (updatedFields.schedule) changes += `الوقت: ${schedule.date} ${schedule.startTime}\n`;
  const body = `تم تعديل المهمة: "${task.title}"\n${changes || 'تم تحديث بعض التفاصيل'}`;
  
  await exports.notifyUsers(
    userIds,
    "تم تعديل المهمة",
    "task_updated",
    task._id,
    { 
      body: body,
      taskId: task._id.toString(),
      type: "task_updated",
      taskTitle: task.title,
      startTime: schedule.startTime,
      startDate: schedule.date
    }
  );
};

exports.notifyTaskDelayed = async (task) => {
  const userIds = task.assignedUsers.map(u => u.userId);
  const schedule = task.schedule[0];
  const reason = task.delayReason || 'لم يتم تحديد سبب';
  const body = `تم تأجيل المهمة: "${task.title}"\nالسبب: ${reason}\nالوقت الجديد: ${schedule.date} الساعة ${schedule.startTime}`;
  
  await exports.notifyUsers(
    userIds,
    "تم تأجيل المهمة",
    "task_delayed",
    task._id,
    { 
      body: body,
      reason: reason,
      taskId: task._id.toString(),
      type: "task_delayed",
      taskTitle: task.title,
      startTime: schedule.startTime,
      startDate: schedule.date
    }
  );
};

exports.notifyDependencyReady = async (task) => {
  const userIds = task.assignedUsers.map(u => u.userId.toString());
  const schedule = task.schedule?.[0];
  const timeText = schedule ? `تبدأ: ${schedule.date} الساعة ${schedule.startTime}` : 'يمكنك البدء الآن';
  const body = `تم إنجاز المهام المعتمد عليها!\nمهمتك "${task.title}" جاهزة للبدء.\n${timeText}`;
  
  await exports.notifyUsers(
    userIds,
    "جاهزة للبدء",
    "dependency_ready",
    task._id,
    { 
      body: body,
      taskId: task._id.toString(),
      type: "dependency_ready",
      taskTitle: task.title,
      startTime: schedule?.startTime,
      startDate: schedule?.date
    }
  );
};

exports.notifyTaskReminder = async (task, userIds) => {
  const schedule = task.schedule[0];
  const body = `تذكير بالمهمة!\n"${task.title}" تبدأ بعد 30 دقيقة (الساعة ${schedule.startTime}).\nتأكد من جاهزيتك للبدء.`;
  
  await exports.notifyUsers(
    userIds,
    "تذكير قبل 30 دقيقة",
    "task_reminder",
    task._id,
    { 
      body: body,
      taskId: task._id.toString(),
      type: "task_reminder",
      taskTitle: task.title,
      startTime: schedule.startTime
    }
  );
};

module.exports = exports;