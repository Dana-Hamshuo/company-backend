const cron = require('node-cron');
const Task = require('../models/Task');
const notificationService = require('../services/notificationService');

const checkUpcomingTasks = async () => {
  try {
    const now = new Date();
    const targetTime = new Date(now.getTime() + 30 * 60 * 1000);

    const dateStr = targetTime.toISOString().split('T')[0];
    const hours = String(targetTime.getHours()).padStart(2, '0');
    const minutes = String(targetTime.getMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;

    const tasks = await Task.find({
      status: { $in: ['pending', 'in_progress'] },
      'schedule.date': dateStr,
      'schedule.startTime': timeStr
    }).populate('assignedUsers.userId', 'name email');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (const task of tasks) {
      const userIds = task.assignedUsers.map(u => u.userId._id || u.userId);
      
      const alreadyReminded = task.reminders?.some(r => 
        r.type === '30min_before' && new Date(r.sentAt) >= todayStart
      );

      if (!alreadyReminded && userIds.length > 0) {
        await notificationService.notifyTaskReminder(task, userIds);

        await Task.findByIdAndUpdate(task._id, {
          $push: {
            reminders: {
              userId: userIds[0],
              type: '30min_before',
              sentAt: new Date()
            }
          }
        });
        
        console.log(`Sent reminder for task: ${task.title}`);
      }
    }
  } catch (error) {
    console.error('Reminder Job Error:', error.message);
  }
};

module.exports = {
  start: () => {
    cron.schedule('* * * * *', checkUpcomingTasks, {
      timezone: process.env.TIMEZONE || 'Asia/Damascus'
    });
    console.log('Reminder Job started');
  }
};