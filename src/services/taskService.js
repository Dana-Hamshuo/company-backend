//src/services/taskService.js
const {validateSchedule,validateCreateTask} = require("../validators/taskValidator")
const {checkUserConflict} = require("../utils/conflict")
const dependencyEngine = require("./dependencyEngine")
const Task = require("../models/Task")
const User = require("../models/User")
const {shiftSchedule} = require("../utils/schedule")
const notificationService = require("./notificationService")
const eventBus = require("../events/eventBus")
const { addWorkingDay } = require("../utils/date")

exports.createTask = async(data,user)=>{

  const {
    title,
    projectId,
    assignedUsers,
    schedule,
    dependencies
  } = data
  // ✅ validation مفصول
  validateCreateTask(data)
  validateSchedule(schedule)

  // ✅ conflict
  for(const member of assignedUsers){

    const dbUser = await User.findById(member.userId)
    if(!dbUser) throw new Error("user not found")

    for(const day of schedule){

      const conflict = await checkUserConflict(
        dbUser,
        day.date,
        day.startTime,
        day.endTime
      )

      if(conflict){
        throw new Error(`conflict for ${dbUser.name}`)
      }
    }
  }

  const status = await dependencyEngine.getInitialStatus(dependencies)

  const task = await Task.create({
    title,
    projectId,
    assignedUsers,
    schedule,
    dependencies,
    status,
    createdBy:user._id
  })
  
  eventBus.emit("task.created", task)
  
  return task
}


exports.completeTask = async(taskId)=>{

    const task = await Task.findById(taskId)
   
    if(!task){
      throw new Error("task not found")
    }
   
    task.status="done"
   
    await task.save()
   
    eventBus.emit("task.completed", task)

    await dependencyEngine.updateDependentTasks(taskId)
   
    return task
   
   }



   exports.deleteTask = async(taskId)=>{

    const dependents = await Task.find({dependencies:taskId})
  
    if(dependents.length){
      throw new Error("cannot delete task with dependencies")
    }
  
    await Task.findByIdAndDelete(taskId)
  }

  exports.markTaskDelayed = async(taskId, reason, customTime=null)=>{

    const task = await Task.findById(taskId)
    if(!task) throw new Error("task not found")
  
    // 🔥 نقل +24 ساعة
    const newSchedule = task.schedule.map(day => ({
      date: addWorkingDay(day.date),
      startTime: customTime?.startTime || day.startTime,
      endTime: customTime?.endTime || day.endTime
    }))
  
    // 🔴 تحقق conflict بعد التعديل
    for(const member of task.assignedUsers){
  
      const dbUser = await User.findById(member.userId)
  
      for(const day of newSchedule){
  
        const conflict = await checkUserConflict(
          dbUser,
          day.date,
          day.startTime,
          day.endTime,
          task._id
        )
  
        if(conflict){

          // 🔥 notification حتى لو فشل
          await notificationService.notifyUsers(
            [dbUser._id],
            `Conflict while delaying task ${task.title}`,
            "delay",
            task._id,
            { type:"conflict" }
          )
  
          throw new Error(`conflict after delay for ${dbUser.name}`)
        }
      }
    }
  
    task.schedule = newSchedule
    task.status = "delayed"
    task.delayReason = reason
  
    await task.save()
  
    eventBus.emit("task.delayed", task)
  
    await dependencyEngine.propagateDelay(taskId)
  
    return task
  }

   exports.updateTaskSafe = async(taskId, data)=>{

    const task = await Task.findById(taskId)
    if(!task) throw new Error("task not found")
  
    const {
      title,
      assignedUsers,
      schedule
    } = data
  
    // ✅ schedule update
    if(schedule){
  
      validateSchedule(schedule)
  
      for(const member of assignedUsers || task.assignedUsers){
  
        const dbUser = await User.findById(member.userId)
        if(!dbUser) throw new Error("user not found")
  
        for(const day of schedule){
  
          const conflict = await checkUserConflict(
            dbUser,
            day.date,
            day.startTime,
            day.endTime,
            task._id // ✅ مهم
          )
  
          if(conflict){
            throw new Error(`conflict for ${dbUser.name}`)
          }
        }
      }
  
      task.schedule = schedule
    }
  
    if(assignedUsers){
      task.assignedUsers = assignedUsers
    }
  
    if(title){
      task.title = title
    }
  
    await task.save()
  
    return task
  }