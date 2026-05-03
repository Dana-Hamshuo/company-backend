const Task = require("../models/Task")
const mongoose = require("mongoose")
const taskService = require("../services/taskService")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError")
const formatTask = require("../utils/formatTask");

exports.createTask = asyncHandler(async (req, res, next) => {
  const { title, projectId, assignedUsers, schedule } = req.body

  if (!title) {
    throw new AppError("Title is required", 400, "VALIDATION_ERROR", "title");
  }
  
  if (!projectId) {
    throw new AppError("ProjectId is required", 400, "VALIDATION_ERROR", "projectId");
  }

  if (!schedule || !schedule.length) {
    throw new AppError("Schedule is required", 400, "VALIDATION_ERROR", "schedule");
  }

  const task = await taskService.createTask(req.body, req.user)

  const populatedTask = await Task.findById(task._id)
  .populate("assignedUsers.userId", "name")
  .populate("projectId", "title clientId") 
  .populate("projectId.clientId", "name businessType")    
  return success(res,formatTask(populatedTask),"task created" ,201)

});
exports.completeTask = asyncHandler(async (req, res, next) => {

  const task = await taskService.completeTask(req.params.id)
  const populatedTask = await Task.findById(task._id)
  .populate("assignedUsers.userId", "name");
  return success(res,formatTask(populatedTask),"completed")
});
exports.delayTask = asyncHandler(async (req, res, next) => {
 const task = await taskService.markTaskDelayed(
  req.params.id,
  req.body.reason,
  req.body,
  req.user 
)
const populatedTask = await Task.findById(task._id)
.populate("assignedUsers.userId", "name");
return success(res, formatTask(populatedTask), "task blocked")

});

exports.deleteTask = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid task ID", 400, "VALIDATION_ERROR", "id");
  }

  await taskService.deleteTask(id);

  return success(res, { message: "Task deleted successfully" }, "Task deleted");
});

exports.getAllTasks = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = {};
  
  if (status) {
    query.status = status;
  }

  const tasks = await Task.find(query)
    .select("title status schedule projectId assignedUsers dependencies progress delayReason createdAt updatedAt")
    .populate("projectId", "title clientId") 
    .populate("projectId.clientId", "name businessType notes")          
    .populate("assignedUsers.userId", "name")  
    .lean();
  const formattedTasks = tasks.map(task => formatTask(task));

  return success(res, formattedTasks, "Tasks fetched");
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

  if (!start) {
    throw new AppError("Start date is required", 400, "VALIDATION_ERROR", "start");
  }
  
  if (!end) {
    throw new AppError("End date is required", 400, "VALIDATION_ERROR", "end");
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
  if (req.body.status && !["pending", "done", "blocked"].includes(req.body.status)) {
    throw new AppError(
      "Invalid status. Must be: pending, done, or blocked",
      400,
      "VALIDATION_ERROR",
      "status"
    );
  }
  const task = await taskService.updateTaskSafe(
   req.params.id,
   req.body
  )

  return success(res,"updated successfully")

});
exports.getTaskSchedule = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)

  if (!task) {
    throw new AppError("Task not found", 404, "NOT_FOUND", "id");
  }
  const populatedTask = await Task.findById(task._id)
  .populate("projectId", "title clientId")
  .populate("projectId.clientId", "name businessType")
  .populate("assignedUsers.userId", "name email jobTitle")
  .populate("dependencies.taskId", "title status");
  return success(res, formatTask(populatedTask),"success");
});



exports.getTasksByMonth = asyncHandler(async (req, res, next) => {
  const { year, month, status } = req.query;

  if (!year || !month) {
    throw new AppError(
      "Year and month are required",
      400,
      "VALIDATION_ERROR",
      "year, month"
    );
  }

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
  const query = {
    "schedule.date": {
      $gte: startDate,
      $lte: endDate
    }
  };

  if (status) {
    query.status = status;
  }

  const tasks = await Task.find(query)
    .select("title status schedule projectId assignedUsers dependencies progress delayReason")
    .populate("projectId", "title clientId")
    .populate("projectId.clientId", "name businessType")
    .populate("assignedUsers.userId", "name")
    .lean();

  const formattedTasks = tasks.map(task => formatTask(task));

  return success(res, formattedTasks, `Tasks for ${year}-${month} fetched`);
});
exports.getPendingTasksCount = asyncHandler(async (req, res, next) => {
  const { userId } = req.body; 
  const currentUserId = req.user._id.toString();
  const userRole = req.user.role; 


  const isSelfQuery = !userId || userId === currentUserId;
  const targetUserId = isSelfQuery ? currentUserId : userId;

  if (!isSelfQuery) {
    const allowedRoles = ['scheduler', 'team'];
    if (!allowedRoles.includes(userRole)) {
      throw new AppError(
        "Access denied: You can only view your own tasks",
        403,
        "FORBIDDEN",
        "permission"
      );
    }
  }


  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new AppError(
      "Invalid userId format",
      400,
      "VALIDATION_ERROR",
      "userId"
    );
  }

  const count = await Task.countDocuments({
    "assignedUsers.userId": new mongoose.Types.ObjectId(targetUserId),
    status: "pending"
  });

  return success(res, count, "Pending tasks count fetched")
});