// services/dependencyService.js

const Task = require("../models/Task")

exports.areDependenciesDone = async(dependencies)=>{

  if(!dependencies || dependencies.length === 0){
    return true
  }

  const tasks = await Task.find({
    _id:{$in:dependencies}
  })

  return tasks.every(t => t.status === "done")
}

