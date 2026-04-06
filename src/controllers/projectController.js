const Project = require("../models/Project")
const Task = require("../models/Task") 
const mongoose = require("mongoose")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError")
const formatProject = require("../utils/formatProject")
const notificationService = require("../services/notificationService") 
exports.createProject = asyncHandler(async(req,res,next)=>{

   const {
     clientId,
     title,
     description
   } = req.body

   if(!mongoose.Types.ObjectId.isValid(clientId)){
    throw new AppError(
      "Invalid clientId",
      400,
      "VALIDATION_ERROR",
      "clientId"
    )
  }
  const project = await Project.create({

     clientId,
     title,
     description,
     createdBy: req.user._id 
    })

   return success(res,formatProject(project),"created project", 201)

});
exports.getProjects = asyncHandler(async (req, res, next) => {

  const { page = 1, limit = 20 } = req.query

  const projects = await Project.find()
    .populate("clientId", "name")
    .populate("createdBy", "name")
    .skip((page - 1) * limit)
    .limit(Number(limit))

  return success(res, projects.map(formatProject), "fetched projects")

})
exports.deleteProject = asyncHandler(async(req,res,next)=>{

   const id = req.params.id

   await Project.findByIdAndDelete(id)

   return success(res,"project deleted")

});
exports.updateProject = asyncHandler(async (req, res, next) => {

  const projectId = req.params.id

  const updates = {}

  const allowedFields = [
    "title",
    "description",
    "status",
    "clientRating",
    "clientFeedback"
  ]

  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key]
    }
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    updates,
    { new: true }
  )

  if (!project) {
    throw new AppError("Project not found", 404, "NOT_FOUND", "id");
  }

  return success(res, formatProject(project), "project updated")

})
exports.getProjectById = asyncHandler(async (req, res) => {

  const project = await Project.findById(req.params.id)
    .populate("clientId", "name businessType")
    .populate("createdBy", "name role")

  if (!project) {
    throw new AppError("Project not found", 404, "NOT_FOUND", "id");
  }

  return success(res, formatProject(project), "Project fetched successfully")

})
exports.completeProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    throw new AppError("Project not found", 404, "NOT_FOUND", "id");
  }
  project.status = "completed";
  await project.save();
  await Task.updateMany(
    { 
      projectId: project._id, 
      status: { $in: ["pending", "in_progress"] } 
    },
    { 
      $set: { 
        status: "done",
        progress: 100,
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date()
      } 
    }
  )
  const assignedUsers = await Task.distinct(
    "assignedUsers.userId", 
    { projectId: project._id }
  )
  if (assignedUsers && assignedUsers.length > 0) {
    await notificationService.notifyUsers(
      assignedUsers,
      `Project "${project.title}" has been completed`,
      "task_update",
      null,
      { projectId: project._id, action: "project_completed" }
    )
  }

  return success(res, formatProject(project), "Project completed")
})

exports.pauseProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    throw new AppError("Project not found", 404, "NOT_FOUND", "id");
  }

  project.status = "paused";
  await project.save();

  await Task.updateMany(
    { 
      projectId: project._id, 
      status: { $in: ["pending", "in_progress"] } 
    },
    { 
      $set: { 
        status: "blocked",
        delayReason: "Project paused",
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date()
      } 
    }
  )

  const assignedUsers = await Task.distinct(
    "assignedUsers.userId", 
    { projectId: project._id }
  )
  if (assignedUsers && assignedUsers.length > 0) {
    await notificationService.notifyUsers(
      assignedUsers,
      `Project "${project.title}" has been paused`,
      "delay",
      null,
      { projectId: project._id, action: "project_paused" }
    )
  }

  return success(res, formatProject(project), "Project paused")
})

exports.reactivateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  
  if (!project) {
    throw new AppError("Project not found", 404, "NOT_FOUND", "id");
  }

  project.status = "active";
  await project.save();

  await Task.updateMany(
    { 
      projectId: project._id, 
      status: { $in: ["blocked", "delayed"] },
      delayReason: "Project paused"
    },
    { 
      $set: { 
        status: "pending",
        delayReason: null,
        lastModifiedBy: req.user._id,
        lastModifiedAt: new Date()
      } 
    }
  )
  const assignedUsers = await Task.distinct(
    "assignedUsers.userId", 
    { projectId: project._id }
  )
  
  if (assignedUsers && assignedUsers.length > 0) {
    await notificationService.notifyUsers(
      assignedUsers,
      `Project "${project.title}" has been reactivated - you can resume work`,
      "task_update",
      null,
      { 
        projectId: project._id, 
        action: "project_reactivated",
        reactivatedBy: req.user._id,
        reactivatedAt: new Date()
      }
    )
  }
  
  return success(res, formatProject(project), "Project reactivated");
});