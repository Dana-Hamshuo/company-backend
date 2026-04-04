//src/controllers/userController.js
const authService = require("../services/authService")
const { success } = require("../utils/apiResponse")
const User = require("../models/User")
const asyncHandler = require("../utils/asyncHandler")
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/AppError");

exports.createUser = asyncHandler(async (req,res,next)=>{
   const user = await authService.register(req.body)

   return success(res, user, "user created", 201)
});

exports.getUsers = asyncHandler(async(req,res)=>{
const users = await User.find(); 
return success(res, users, "Users fetched")})

exports.deleteUser = asyncHandler(async(req,res,next)=>{

   const userId = req.params.id

   await User.findByIdAndDelete(userId)

   success(res, null,"User deleted")
});
exports.updateUser = asyncHandler(async (req,res,next)=>{
   const allowedFields = [
    "jobTitle",
    "allowOverlap",
    "maxParallelTasks",
    "isActive"
   ]
 
   const updates = {}
 
   for(const key of allowedFields){
    if(req.body[key] !== undefined){
     updates[key] = req.body[key]
    }
   }
 
   const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    {new:true}
   )
 
   if(!user){
    return res.status(404).json({
     success:false,
     message:"user not found"
    })
   }
    return success(res,"updated successfully")
 });
 exports.getUserById = asyncHandler(async (req, res) => {
   const user = await User.findById(req.params.id).select("-password")
 
   if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND", "id");
   }
 
   return success(res, user)
 })