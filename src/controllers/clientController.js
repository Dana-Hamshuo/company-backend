const Client = require("../models/Client")

// ➕ create client
exports.createClient = async(req,res,next)=>{

 try{

   const {name,businessType,notes} = req.body

   if(!name){
     return res.status(400).json({
       message:"name is required"
     })
   }

   const client = await Client.create({
     name,
     businessType,
     notes
   })

   res.status(201).json(client)

 }catch(err){
   next(err)
 }

}


// 📄 get clients
exports.getClients = async(req,res,next)=>{

 try{

   const clients = await Client.find()

   res.json(clients)

 }catch(err){
   next(err)
 }

}


// 🗑 delete client
exports.deleteClient = async(req,res,next)=>{

 try{

   const clientId = req.params.id

   await Client.findByIdAndDelete(clientId)

   res.json({
     message:"client deleted"
   })

 }catch(err){
   next(err)
 }

}