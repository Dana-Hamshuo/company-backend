const Project = require("../models/Project")
const mongoose = require("mongoose")
// ➕ create project
exports.createProject = async(req,res,next)=>{

 try{

   const {
     clientId,
     title,
     description
   } = req.body

   if(!mongoose.Types.ObjectId.isValid(clientId)){
    return res.status(400).json({
      message:"invalid clientId"
    })
  }

   const project = await Project.create({

     clientId,
     title,
     description,
     createdBy:req.user._id

   })

   res.status(201).json(project)

 }catch(err){
   next(err)
 }

}


// 📄 get projects
exports.getProjects = async(req,res,next)=>{

 try{

   const projects = await Project.find()
   .populate("clientId","name")
   .populate("createdBy","name")

   res.json(projects)

 }catch(err){
   next(err)
 }

}


// 🗑 delete project
exports.deleteProject = async(req,res,next)=>{

 try{

   const id = req.params.id

   await Project.findByIdAndDelete(id)

   res.json({
     message:"project deleted"
   })

 }catch(err){
   next(err)
 }

}