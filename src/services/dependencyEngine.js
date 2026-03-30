//src/services/dependencyEngine.js

const Task = require("../models/Task")
const {shiftSchedule} = require("../utils/schedule")
const notificationService = require("./notificationService")
const AppError = require("../utils/AppError");

exports.getInitialStatus = async(dependencies)=>{

  if(!dependencies || dependencies.length === 0){
    return "pending"
  }

  const tasks = await Task.find({_id:{$in:dependencies}})

  const allDone = tasks.every(t=>t.status === "done")

  return allDone ? "pending" : "blocked"
}

exports.updateDependentTasks = async(taskId)=>{

  const tasks = await Task.find({dependencies:taskId})

  for(const task of tasks){

    const deps = await Task.find({_id:{$in:task.dependencies}})

    const allDone = deps.every(t=>t.status === "done")

    if(allDone){
      task.status = "pending"
      await task.save()
    }
    await notificationService.notifyDependencyReady(task)
  }
}

exports.propagateDelay = async (taskId, custom = {})=>{

  const dependents = await Task.find({dependencies:taskId})

  for(const task of dependents){

    if(!task.schedule || task.schedule.length === 0) continue

    task.schedule = shiftSchedule(task.schedule)
    task.status = "delayed"

    await task.save()

    await exports.propagateDelay(task._id)
  }
}