const Task = require("../models/Task")
const taskService = require("../services/taskService")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError")
const formatTask = require("../utils/formatTask");

exports.createTask = asyncHandler(async (req, res, next) => {
  const { title, projectId, assignedUsers, schedule } = req.body

  if (!title || !projectId) {
   return res.status(400).json({
    message: "title and projectId required"
   })
  }

  if (!schedule || !schedule.length) {
   return res.status(400).json({
    message: "schedule required"
   })
  }

  const task = await taskService.createTask(req.body, req.user)

  return success(res,formatTask(task),"task created" ,201)

});
exports.completeTask = asyncHandler(async (req, res, next) => {

  const task = await taskService.completeTask(req.params.id)

  return success(res,formatTask(task),"completed")
});
exports.delayTask = asyncHandler(async (req, res, next) => {
 const task = await taskService.markTaskDelayed(
  req.params.id,
  req.body.reason,
  req.body 
)
return success(res, formatTask(task), "task delayed")

});
exports.deleteTask = asyncHandler(async (req, res, next) => {
  await taskService.deleteTask(req.params.id)

  return success(res,"task deleted") 

});
exports.getAllTasks = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const tasks = await Task.find()
    .select("title status schedule projectId assignedUsers dependencies")
    .populate("projectId", "title")           
    .populate("assignedUsers.userId", "name")  
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const formattedTasks = tasks.map(task => ({
    taskId: task._id,
    title: task.title,
    status: task.status,
    project: task.projectId
      ? {
          projectId: task.projectId._id,
          title: task.projectId.title
        }
      : null,
    assignedUsers: task.assignedUsers.map(u => ({
      userId: u.userId._id,
      name: u.userId.name
    })),
    schedule: task.schedule.map(s => ({
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime,
      endTime: s.endTime
    })),
    dependencies: task.dependencies || []
  }));

  return res.status(200).json({
    success: true,
    message: "success",
    data: formattedTasks
  });
});
exports.getTasksByUser = asyncHandler(async (req, res, next) => {
  const userId = req.params.userId

  const tasks = await Task.find({
   "assignedUsers.userId": userId
  })
  .populate({
    path: "projectId",
    populate: {
      path: "clientId",
      select: "name"
    }
  })
return success(res,tasks)
});

exports.getTasksByDateRange = asyncHandler(async (req, res, next) => {
  const { start, end } = req.query

  if (!start || !end) {
   return res.status(400).json({
    message: "start and end required"
   })
  }

  const tasks = await Task.find({
   "schedule.date": {
    $gte: new Date(start),
    $lte: new Date(end)
   }
  })
  return success(res,tasks)
});

exports.updateTask = asyncHandler(async (req, res, next) => {
  const task = await taskService.updateTaskSafe(
   req.params.id,
   req.body
  )

  return success(res,"updated successfully")

});
exports.getTaskSchedule = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
   return res.status(404).json({
    message: "task not found"
   })
  }

  return success(res, formatTask(task),"success");
});