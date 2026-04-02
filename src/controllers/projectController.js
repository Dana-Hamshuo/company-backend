const Project = require("../models/Project")
const mongoose = require("mongoose")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError")
const formatProject = require("../utils/formatProject")
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
     description,})

   return success(res,formatProject(project),"created project", 201)

});
exports.getProjects = asyncHandler(async (req, res, next) => {

  const { page = 1, limit = 20 } = req.query

  const projects = await Project.find()
    .populate("clientId", "name")
    .populate("createdBy", "name")
    .skip((page - 1) * limit)
    .limit(Number(limit))

  return success(res, formatProject(projects), "fetched projects")

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