const calendarService = require("../services/calendarService")
const { success } = require("../utils/apiResponse")
exports.getMonth = async(req,res,next)=>{

 try{

   const {year,month,userId} = req.query

   const data = await calendarService.getMonthCalendar(
     year,
     month,
     userId
   )

   success(res, data,"Calendar fetched" )

 }catch(err){
   next(err)
 }

}