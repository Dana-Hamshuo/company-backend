//utils/workRules.js

const {toMinutes} = require("./time")
const isWorkingDay = require("./isWorkingDay")

exports.validateWorkTime = (startTime,endTime)=>{

 const start = toMinutes(startTime)
 const end = toMinutes(endTime)

 const workStart = toMinutes("10:00")
 const workEnd = toMinutes("15:00")

 if(start < workStart || end > workEnd){
  throw new AppError(
    "Outside working hours",
    400,
    "BUSINESS_ERROR",
    "schedule"
  )
 }

 if(start >= end){
  throw new Error("invalid time range")
 }

}


   
exports.validateWorkDay = (date)=>{
      if(!isWorkingDay(date)){
        throw new Error("day off")
      }
    }
   