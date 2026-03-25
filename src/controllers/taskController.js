const Task = require("../models/Task")
const taskService = require("../services/taskService")
const { success } = require("../utils/apiResponse")
/*
---------------------------------
CREATE TASK
---------------------------------
*/
exports.createTask = async (req, res, next) => {
 try {

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

  return success(res, task, "task created", 201)

 } catch (err) {
  next(err)
 }
}

/*
---------------------------------
COMPLETE TASK
---------------------------------
*/
exports.completeTask = async (req, res, next) => {
 try {

  const task = await taskService.completeTask(req.params.id)

  res.json(task)

 } catch (err) {
  next(err)
 }
}

/*
---------------------------------
DELAY TASK
---------------------------------
*/
exports.delayTask = async (req, res, next) => {
 try {

const task = await taskService.markTaskDelayed(
  req.params.id,
  req.body.reason,
  req.body.customTime // ✅ جديد
)

  return success(res, task, "task delayed")

 } catch (err) {
  next(err)
 }
}

/*
---------------------------------
DELETE TASK
---------------------------------
*/
exports.deleteTask = async (req, res, next) => {
 try {

  await taskService.deleteTask(req.params.id)

  res.json({ message: "task deleted" })

 } catch (err) {
  next(err)
 }
}

/*
---------------------------------
GET ALL TASKS
---------------------------------
*/
exports.getAllTasks = async (req,res,next)=>{
    try{
   
     const {page=1,limit=20} = req.query
   
     const tasks = await Task.find()
     .select("title status schedule projectId assignedUsers")
     .populate("projectId","title")
     .populate("assignedUsers.userId","name")
     .skip((page-1)*limit)
     .limit(Number(limit))
     .lean()
   
     return success(res, tasks)
   
    }catch(err){
     next(err)
    }
   }

/*
---------------------------------
GET TASKS BY USER
---------------------------------
*/
exports.getTasksByUser = async (req, res, next) => {
 try {

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

  res.json({
   success: true,
   tasks
  })

 } catch (err) {
  next(err)
 }
}

/*
---------------------------------
GET TASKS BY DATE RANGE (FIXED)
---------------------------------
*/
exports.getTasksByDateRange = async (req, res, next) => {
 try {

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

  res.json({
   success: true,
   tasks
  })

 } catch (err) {
  next(err)
 }
}

/*
---------------------------------
UPDATE TASK (SAFE)
---------------------------------
*/
exports.updateTask = async (req, res, next) => {
 try {

  const task = await taskService.updateTaskSafe(
   req.params.id,
   req.body
  )

  res.json({
   success: true,
   task
  })

 } catch (err) {
  next(err)
 }
}

/*
---------------------------------
GET TASK SCHEDULE (FIXED)
---------------------------------
*/
exports.getTaskSchedule = async (req, res, next) => {
 try {

  const task = await Task.findById(req.params.id)

  if (!task) {
   return res.status(404).json({
    message: "task not found"
   })
  }

  res.json({
   task: task.title,
   schedule: task.schedule
  })

 } catch (err) {
  next(err)
 }
}