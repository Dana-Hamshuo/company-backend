//utils//conflict

const Task = require("../models/Task")
const {toDateKey} = require("./dateFormat")
const {isOverlap} = require("./time")

exports.checkUserConflict = async(
  user,
  date,
  startTime,
  endTime,
  excludeTaskId = null,
  session = null
)=>{

  

  const query = {
    "assignedUsers.userId": user._id,
    status: { $ne: "done" },
    "schedule.date": {
      $gte: new Date(new Date(date).setHours(0, 0, 0)),
      $lte: new Date(new Date(date).setHours(23, 59, 59))
    }
  };

  let tasksQuery = Task.find(query);
  if (session) {
    tasksQuery = tasksQuery.session(session);
  }
  const tasks = await tasksQuery;

  let overlaps = 0;
  const targetDate = toDateKey(date);

 for(const task of tasks){

  
  if(excludeTaskId && task._id.equals(excludeTaskId)) continue


  if(!task.schedule || task.schedule.length === 0) continue

  for(const day of task.schedule){

    const taskDate = toDateKey(day.date)

   if(taskDate !== targetDate) continue

   const timeOverlap = isOverlap(
    startTime,
    endTime,
    day.startTime,
    day.endTime
   )

   if(timeOverlap){
    overlaps++
   }

  }

 }

 if(!user.allowOverlap && overlaps > 0){
  return true
 }

 if(overlaps >= user.maxParallelTasks){
  return true
 }

 return false
}