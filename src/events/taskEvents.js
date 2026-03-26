//src/events/taskEvents.js
const eventBus = require("./eventBus")
const notificationService = require("../services/notificationService") 
eventBus.on("task.created", async(task)=>{
 await notificationService.notifyTaskCreated(task)
}) 
eventBus.on("task.completed", async(task)=>{
 await notificationService.notifyTaskCompleted(task)
}) 
eventBus.on("task.delayed", async(task)=>{
 await notificationService.notifyTaskDelayed(task)
})