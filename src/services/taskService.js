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

  validateCreateTask(data)
  validateSchedule(schedule) 
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
        throw new Error(`conflict for ${dbUser.jobTitle}`)
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

    await dependencyEngine.propagateDelay(taskId, custom)
   
    return task
   
   }



   exports.deleteTask = async(taskId)=>{

    const dependents = await Task.find({dependencies:taskId})
  
    if(dependents.length){
      throw new Error("cannot delete task with dependencies")
    }
  
    await Task.findByIdAndDelete(taskId)
  }

  exports.markTaskDelayed = async(taskId, reason, custom = {})=>{

    const task = await Task.findById(taskId)
    if(!task) throw new Error("task not found")
  

      const newSchedule = task.schedule.map(day => {
        let newDate = day.date
        if (custom.customDate) {
          newDate = new Date(custom.customDate)
        } else {
          newDate = addWorkingDay(day.date)
        }
        return {
          date: newDate,
          startTime: custom.customTime?.startTime || day.startTime,
          endTime: custom.customTime?.endTime || day.endTime
        }
      })
    
  

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
  
        if(conflict){throw new Error(`conflict after delay for ${dbUser.name}`)
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
            task._id 
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