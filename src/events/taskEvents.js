const eventBus = require("./eventBus")
const notificationService = require("../services/notificationService")

// 🔥 عند إنشاء مهمة
eventBus.on("task.created", async(task)=>{
 await notificationService.notifyTaskCreated(task)
})

// 🔥 عند إنهاء
eventBus.on("task.completed", async(task)=>{
 await notificationService.notifyTaskCompleted(task)
})

// 🔥 عند التأخير
eventBus.on("task.delayed", async(task)=>{
 await notificationService.notifyTaskDelayed(task)
})