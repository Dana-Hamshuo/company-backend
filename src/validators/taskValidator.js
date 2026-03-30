//src/validators/taskValidator.js
const mongoose = require("mongoose")
const {validateWorkDay, validateWorkTime} = require("../utils/workRules")
const {toDateKey} = require("../utils/dateFormat")

exports.validateSchedule = (schedule) => {
  if (!schedule?.length) {
    throw new AppError("schedule required", 400, "VALIDATION_ERROR", null);
  }

  const datesSet = new Set();

  for (const day of schedule) {
    const dateObj = new Date(day.date);

    validateWorkDay(dateObj);

    validateWorkTime(day.startTime, day.endTime);

    const key = toDateKey(dateObj);
    if (datesSet.has(key)) {
      throw new AppError("duplicate date in schedule", 400, "VALIDATION_ERROR", null);
    }

    datesSet.add(key);
  }
};
exports.validateCreateTask = (data)=>{

    const {
     title,
     projectId,
     assignedUsers,
     schedule
    } = data
   
    if(!title) throw new Error("title required")
   
    if(!mongoose.Types.ObjectId.isValid(projectId)){
     throw new Error("invalid projectId")
    }
   
    if(!Array.isArray(assignedUsers) || !assignedUsers.length){
     throw new Error("assignedUsers required")
    }
   
    for(const u of assignedUsers){
     if(!mongoose.Types.ObjectId.isValid(u.userId)){
      throw new Error("invalid userId")
     }
    }
   
    if(!Array.isArray(schedule) || !schedule.length){
     throw new Error("schedule required")
    }
   
   }