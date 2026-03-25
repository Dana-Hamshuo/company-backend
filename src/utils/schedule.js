// utils/schedule.js

const {addWorkingDay} = require("./date")

exports.shiftSchedule = (schedule)=>{
  return schedule.map(day => ({
    date: addWorkingDay(day.date),
    startTime: day.startTime,
    endTime: day.endTime
  }))
}