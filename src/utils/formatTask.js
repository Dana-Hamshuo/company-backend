// utils/formatTask.js
// function formatTask(task) {
//     return {
//       id: task._id,
//       title: task.title,
//       projectId: task.projectId,
//       status: task.status,
//       progress: task.progress,
//       assignedUsers: task.assignedUsers.map(user => ({
//         id: user.userId._id || user.userId,  
//         name: user.userId.name || "Unknown"
//       })),
//       dependencies: task.dependencies || [],
//       schedule: task.schedule.map(s => ({
//         date: s.date.toISOString().split("T")[0],
//         startTime: s.startTime,
//         endTime: s.endTime
//       })),
//       createdBy: {
//         id: task.createdBy._id || task.createdBy,
//         name: task.createdBy.name || "Unknown"
//       }
//     };
//   }
  
//   module.exports = formatTask;
function formatTask(task) {
  return {
    id: task._id,
    title: task.title,
    projectId: task.projectId,
    status: task.status,
    progress: task.progress,assignedUsers: task.assignedUsers.map(user => ({
      id: user.userId._id || user.userId,
      name: user.userId?.name || "Unknown"
    })),
    dependencies: task.dependencies.map(dep => dep.taskId),
    schedule: task.schedule.map(s => ({
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime,
      endTime: s.endTime
    })),
    createdBy: {
      id: task.createdBy._id || task.createdBy,
      name: task.createdBy?.name || "Unknown"
    }
  };
}
module.exports = formatTask;