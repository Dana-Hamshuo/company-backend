//src/services/notificationService.js
const User = require("../models/User")
const Notification = require("../models/Notification")

exports.notifyUsers = async(userIds, message, type, taskId, meta={})=>{

  if(!userIds?.length) return

  const notifications = userIds.map(id => ({
    userId:id,
    message,
    type,
    taskId,
    meta
  }))

  await Notification.insertMany(notifications)
}


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

  const userIds = task.assignedUsers.map(u => u.userId)

  await exports.notifyUsers(
    userIds,
    `Task "${task.title}" is now ready to start`,
    "dependency",
    task._id
  )
}