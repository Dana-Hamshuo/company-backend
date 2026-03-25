const User = require("../models/User")

// ➕ create user

const authService = require("../services/authService")
const { success } = require("../utils/apiResponse")

// ➕ create user (WITHOUT register route - but with hashing)
exports.createUser = async (req,res,next)=>{

 try{

   const user = await authService.register(req.body)

   return success(res, user, "user created", 201)

 }catch(err){
   next(err)
 }

}

// 📄 get users
exports.getUsers = async(req,res,next)=>{

 try{

   const users = await User.find({isActive:true}).select("-password")

   return success(res, users)

 }catch(err){
   next(err)
 }

}


// 🗑 delete user
exports.deleteUser = async(req,res,next)=>{

 try{

   const userId = req.params.id

   await User.findByIdAndDelete(userId)

   success(res, "User deleted")

 }catch(err){
   next(err)
 }

}

exports.updateUser = async (req,res,next)=>{

  try{
 
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
 
   res.json({
    success:true,
    user
   })
 
  }catch(err){
   next(err)
  }
 
 }