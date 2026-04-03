//src/services/taskService.js
const mongoose = require("mongoose");
const {validateSchedule,validateCreateTask} = require("../validators/taskValidator")
const {checkUserConflict} = require("../utils/conflict")
const dependencyEngine = require("./dependencyEngine")
const Task = require("../models/Task")
const User = require("../models/User")
const {shiftSchedule} = require("../utils/schedule")
const notificationService = require("./notificationService")
const eventBus = require("../events/eventBus")
const { addWorkingDay } = require("../utils/date")
const AppError = require("../utils/AppError");



const assertTaskIsModifiable = (task) => {
  if (task.status === "done") {
    throw new AppError(
      "Cannot modify a completed task",
      400,
      "VALIDATION_ERROR",
      "status"
    );
  }
  if (task.status === "cancelled") {
    throw new AppError(
      "Cannot modify a cancelled task",
      400,
      "VALIDATION_ERROR",
      "status"
    );
  }
};
const normalizeDependencies = (deps) => {
  if (!deps || !Array.isArray(deps)) return [];
  return deps.map(dep => {
    if (typeof dep === "string") {
      return { taskId: dep, isRequired: true };
    }
    if (dep && typeof dep === "object" && dep.taskId) {
      return {
        taskId: dep.taskId,
        isRequired: dep.isRequired !== undefined ? dep.isRequired : true
      };
    }
    return null;
  }).filter(Boolean);
};

exports.createTask = async(data,user)=>{

  const {
    title,
    projectId,
    assignedUsers,
    schedule,
    dependencies
  } = data


  validateCreateTask(data)
  validateSchedule(schedule) 

  const session = await mongoose.startSession();
  session.startTransaction();

try{
  for(const member of assignedUsers){

    const dbUser = await User.findById(member.userId).session(session);
    if(!dbUser) {
      throw new AppError("user not found", 404, "NOT_FOUND", "userId");
    }

    for(const day of schedule){

      const conflict = await checkUserConflict(
        dbUser,
        day.date,
        day.startTime,
        day.endTime,
        null,
        session
      )

      if(conflict){
        throw new AppError(
          `conflict for ${dbUser.jobTitle}`,
          409,
          "CONFLICT_ERROR",
          "schedule"
        );
      }
    }
  }

  const status = await dependencyEngine.getInitialStatus(dependencies)
  const normalizedDeps = normalizeDependencies(dependencies);

  const task = await Task.create([{
    title,
    projectId,
    assignedUsers,
    schedule,
    dependencies: normalizedDeps,
    status,
    createdBy: user._id,
    lastModifiedBy: user._id
  }], { session });

  await session.commitTransaction();
  
  eventBus.emit("task.created", task[0])
  
  return task[0];
}catch (error){
  await session.abortTransaction();
  throw error;
  } finally {
    session.endSession();
  }
}; 

exports.completeTask = async(taskId)=>{

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new AppError("Invalid task ID", 400, "VALIDATION_ERROR", "id");
  }
    const task = await Task.findById(taskId)
   
    if(!task){
      throw new AppError("task not found", 404, "NOT_FOUND", "id");
    }
    const validDeps = (task.dependencies || []).filter(dep => 
      dep?.taskId && mongoose.Types.ObjectId.isValid(dep.taskId)
    );
    task.status="done"
   
    await task.save()
   
    eventBus.emit("task.completed", task)

    await dependencyEngine.updateDependentTasks(taskId, validDeps);
       
    return task
   
   }



   exports.deleteTask = async(taskId)=>{
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError("Invalid task ID", 400, "VALIDATION_ERROR", "id");
    }
    assertTaskIsModifiable(task);
    const dependents = await Task.find({ "dependencies.taskId": taskId });
    const validDependents = dependents.filter(task => 
      task.dependencies?.some(dep => 
        dep?.taskId && mongoose.Types.ObjectId.isValid(dep.taskId)
      )
    );
    if (validDependents.length > 0) {
      throw new AppError("cannot delete task with dependencies", 409, "CONFLICT_ERROR", "taskId");
    }
  
    await Task.findByIdAndDelete(taskId)
  }

  exports.markTaskDelayed = async(taskId, reason, custom = {})=>{


    const session = await mongoose.startSession();
    session.startTransaction();

   try{
    const task = await Task.findById(taskId)
    if(!task) throw new AppError("task not found", 404);
      
    assertTaskIsModifiable(task);

    const newSchedule = task.schedule.map(day => {
      let newDate = day.date;
      if (custom.customDate) {
        newDate = new Date(custom.customDate);
      } else {
        newDate = addWorkingDay(day.date);
      }
      return {
        date: newDate,
        startTime: custom.customTime?.startTime || day.startTime,
        endTime: custom.customTime?.endTime || day.endTime
      };
    });
  
    const conflicts = await checkConflictsForTask(
      task,
      newSchedule,
      session
    );
    if (conflicts.length > 0) {
      for (const conflict of conflicts) {
        await cascadeDelayTask(
          conflict.taskId,
          `Cascade delay: ${reason}`,
          {},
          session
        );
      }

      const newConflicts = await checkConflictsForTask(task, newSchedule, session);
      if (newConflicts.length > 0) {
        throw new AppError(
          "Cascade delay exceeded maximum iterations",
          409,
          "CONFLICT_ERROR",
          "schedule"
        );
      }
    }
    task.schedule = newSchedule;
    task.status = "delayed";
    task.delayReason = reason;
    task.lastModifiedBy = user._id;

    await task.save({ session });
    await session.commitTransaction();

    eventBus.emit("task.delayed", task);
    await dependencyEngine.propagateDelay(taskId, custom);

    return task;

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
async function checkConflictsForTask(task, newSchedule, session) {
  const conflicts = [];

  for (const member of task.assignedUsers) {
    const dbUser = await User.findById(member.userId).session(session);
    if (!dbUser) continue;

    for (const day of newSchedule) {
      const query = {
        "assignedUsers.userId": dbUser._id,
        _id: { $ne: task._id }, 
        status: { $ne: "done" },
        "schedule.date": {
          $gte: new Date(new Date(day.date).setHours(0, 0, 0)),
          $lte: new Date(new Date(day.date).setHours(23, 59, 59))
        }
      };

      const overlappingTasks = await Task.find(query).session(session);

      for (const overlappingTask of overlappingTasks) {
        for (const sched of overlappingTask.schedule) {
          const isTimeOverlap = require("../utils/time").isOverlap(
            day.startTime,
            day.endTime,
            sched.startTime,
            sched.endTime
          );

          if (isTimeOverlap) {
            conflicts.push({
              taskId: overlappingTask._id,
              userId: dbUser._id,
              userName: dbUser.name,
              taskTitle: overlappingTask.title,
              date: day.date,
              startTime: day.startTime,
              endTime: day.endTime
            });
          }
        }
      }
    }
  }

  return conflicts;
}

async function cascadeDelayTask(taskId, reason, custom, session) {
  const task = await Task.findById(taskId).session(session);
  if (!task) return;

  assertTaskIsModifiable(task);

  const newSchedule = task.schedule.map(day => ({
    date: addWorkingDay(day.date),
    startTime: day.startTime,
    endTime: day.endTime
  }));

  task.schedule = newSchedule;
  task.status = "delayed";
  task.delayReason = reason;

  await task.save({ session });
  eventBus.emit("task.delayed", task);
}
   exports.updateTaskSafe = async(taskId, data)=>{
 

    const session = await mongoose.startSession();
    session.startTransaction();
   try{

    const task = await Task.findById(taskId)
    if(!task) throw new AppError("task not found", 404);
    assertTaskIsModifiable(task);
    const {
      title,
      assignedUsers,
      schedule
    } = data

    if(schedule){
  
      validateSchedule(schedule)
  
      for(const member of assignedUsers || task.assignedUsers){
  
        const dbUser = await User.findById(member.userId).session(session);
        if(!dbUser) throw new AppError("user not found", 404)
  
        for(const day of schedule){
  
          const conflict = await checkUserConflict(
            dbUser,
            day.date,
            day.startTime,
            day.endTime,
            task._id ,
            session
          )
  
          if(conflict){
            throw new AppError(
              `conflict for ${dbUser.name}`,
              409,
              "CONFLICT_ERROR"
            );
          }
        }
      }
  
      task.schedule = schedule
    }
  
    if(assignedUsers){
      task.assignedUsers = assignedUsers
    }
  
    if(title){
      task.title = title
    }
  
    task.lastModifiedBy = task.lastModifiedBy || task.createdBy;

    await task.save({ session })
        await session.commitTransaction();
    return task;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};