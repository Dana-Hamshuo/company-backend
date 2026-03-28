//src/services/notificationService.js
const User = require("../models/User")
const Notification = require("../models/Notification")

exports.notifyUsers = async (userIds, message, type, taskId, meta = {}) => {

  if (!userIds || userIds.length === 0) return

  const uniqueUsers = [...new Set(userIds.map(id => id.toString()))]

  const notifications = uniqueUsers.map(userId => ({
    userId,
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

  const userIds = task.assignedUsers.map(u => u.userId.toString())

  await exports.notifyUsers(
    userIds,
    `You can now start task: ${task.title}`,
    "dependency",
    task._id
  )
}