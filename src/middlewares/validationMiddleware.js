//src/middlewares/validationMiddleware.js

const { validationResult } = require("express-validator");

module.exports = (req,res,next)=>{

  const errors = validationResult(req)

  if(!errors.isEmpty()){
    return res.status(400).json({
      success:false,
      message:"Validation failed",
      error:{
        type:"VALIDATION_ERROR",
        details:errors.array()
      }
    })
  }

  next()
}