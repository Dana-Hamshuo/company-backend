const Client = require("../models/Client")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
exports.createClient =asyncHandler(async(req,res,next)=>{
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