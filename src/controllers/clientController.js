const Client = require("../models/Client")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError")
const mongoose = require("mongoose")
exports.createClient =asyncHandler(async(req,res,next)=>{
   const {name,businessType,notes} = req.body

   if(!name){
    throw new AppError(
      "Name is required",
      400,
      "VALIDATION_ERROR",
      "name"
    )
  }

   const client = await Client.create({
     name,
     businessType,
     notes
   })

   return success(res, client, "client created", 201)
});
exports.getClients = asyncHandler(async (req, res, next) => {

  const { page = 1, limit = 20 } = req.query

  const clients = await Client.find()
    .skip((page - 1) * limit)
    .limit(Number(limit))

  return success(res, clients, "fetched clients")

})
exports.deleteClient = asyncHandler(async(req,res,next)=>{

   const clientId = req.params.id

   if(!mongoose.Types.ObjectId.isValid(clientId)){
    return res.status(400).json({ message: "invalid id" })
  }
   await Client.findByIdAndDelete(clientId)
   
   return success(res,"deleted client")

});
exports.updateClient = asyncHandler(async (req, res, next) => {

  const clientId = req.params.id

  if (!clientId) {
    return res.status(400).json({ message: "clientId required" })
  }

  const { name, businessType, notes } = req.body || {}

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError(
      "Request body is required",
      400,
      "VALIDATION_ERROR"
    )
  }

  const client = await Client.findByIdAndUpdate(
    clientId,
    { name, businessType, notes },
    { new: true }
  )

  if (!client) {
    return res.status(404).json({ message: "client not found" })
  }

  return success(res, client, "client updated")

})