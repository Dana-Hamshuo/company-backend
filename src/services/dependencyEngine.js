// 
// src/services/dependencyEngine.js
const mongoose = require("mongoose");  
const Task = require("../models/Task");
const { shiftSchedule } = require("../utils/schedule");
const notificationService = require("./notificationService");
const AppError = require("../utils/AppError");

exports.getInitialStatus = async (dependencies) => {
  if (!dependencies || dependencies.length === 0) {
    return "pending";
  }

  const taskIds = dependencies
    .map(dep => {
      if (typeof dep === "string") return dep;
      if (dep && typeof dep === "object" && dep.taskId) return dep.taskId;
      return null;
    })
    .filter(id => id && mongoose.Types.ObjectId.isValid(id));  

  if (taskIds.length === 0) return "pending";

  const tasks = await Task.find({ _id: { $in: taskIds } });
  const allDone = tasks.every(t => t.status === "done");

  return allDone ? "pending" : "blocked";
};

exports.updateDependentTasks = async (taskId) => {
  const tasks = await Task.find({ "dependencies.taskId": taskId });

  for (const task of tasks) {
    const validDepIds = (task.dependencies || [])
      .map(dep => dep?.taskId)
      .filter(id => id && mongoose.Types.ObjectId.isValid(id));

    if (validDepIds.length === 0) {
      task.status = "pending";
      await task.save();
      await notificationService.notifyDependencyReady(task);
      continue;
    }

    const depTasks = await Task.find({ _id: { $in: validDepIds } });
    const allDone = depTasks.every(t => t.status === "done");

    if (allDone) {
      task.status = "pending";
      await task.save();
    }
    
    await notificationService.notifyDependencyReady(task);
  }
};

exports.propagateDelay = async (taskId, custom = {}) => {
  const dependents = await Task.find({ "dependencies.taskId": taskId });

  for (const task of dependents) {
    if (!task.schedule || task.schedule.length === 0) continue;

    task.schedule = shiftSchedule(task.schedule);
    task.status = "delayed";

    await task.save();

    await exports.propagateDelay(task._id, custom);
  }
};