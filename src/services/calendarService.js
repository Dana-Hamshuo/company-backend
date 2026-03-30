//src/services/calendarService.js

const Task = require("../models/Task")
const {toDateKey} = require("../utils/dateFormat")

exports.getMonthCalendar = async (year, month, userId, filters = {}) => {

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const query = {
    "schedule.date": {
      $gte: start,
      $lte: end
    }
  };

  if (userId) {
    query["assignedUsers.userId"] = userId;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.projectId) {
    query.projectId = filters.projectId;
  }

  const tasks = await Task.find(query)
    .populate({
      path: "projectId",
      populate: {
        path: "clientId",
        select: "name"
      }
    })
    .populate("assignedUsers.userId", "name jobTitle");

  const calendar = {};

  for (const task of tasks) {

    if (!task.schedule || task.schedule.length === 0) continue;

    for (const day of task.schedule) {

      if (day.date < start || day.date > end) continue;

      const key = toDateKey(day.date);

      if (!calendar[key]) calendar[key] = [];

      calendar[key].push({
        taskId: task._id,
        task: task.title,
        project: task.projectId?.title || null,
        client: task.projectId?.clientId?.name || null,
        status: task.status,
        startTime: day.startTime,
        endTime: day.endTime,
        assignedUsers: task.assignedUsers.map(u => ({
          name: u.userId?.name,
          role: u.userId?.jobTitle
        }))
      });
    }
  }

  for (const key in calendar) {
    calendar[key].sort((a, b) => {
      return (a.startTime || "").localeCompare(b.startTime || "");
    });
  }

  return calendar;
};

exports.getUserDayTasks = async(userId,date)=>{

    const start = new Date(date)
    start.setHours(0,0,0)
  
    const end = new Date(date)
    end.setHours(23,59,59)
  
    return Task.find({
      "assignedUsers.userId":userId,
      "schedule.date": {
        $gte: start,
        $lte: end
      }
    })
  }