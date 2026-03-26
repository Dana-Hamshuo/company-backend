const calendarService = require("../services/calendarService")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");

exports.getMonth = asyncHandler(async(req,res,next)=>{

   const {year,month,userId} = req.query

   const data = await calendarService.getMonthCalendar(
     year,
     month,
     userId
   )

   success(res, data,"Calendar fetched" )

});

exports.getMyCalendar = asyncHandler(async (req, res) => {

  const { year, month } = req.query

  const data = await calendarService.getMonthCalendar(
    year,
    month,
    req.user._id
  )

  return success(res, data, "My calendar fetched")

})