const User = require("../models/User")
const Client = require("../models/Client")
const Project = require("../models/Project")
const Task = require("../models/Task")

exports.resetDatabase = async(req,res)=>{

 await User.deleteMany({})
 await Client.deleteMany({})
 await Project.deleteMany({})
 await Task.deleteMany({})

 res.json({
   message:"database reset complete"
 })

}