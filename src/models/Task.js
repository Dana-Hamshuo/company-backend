const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  description: String,

  assignedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    isPrimary: { type: Boolean, default: false } 
  }],

  schedule:[
    {
      date:{ type:Date, required:true },
      startTime:{ type:String, required:true },
      endTime:{ type:String, required:true }
    }
  ],

  status:{
    type:String,
    enum:["pending","in_progress","done","blocked","delayed"],
    default:"pending"
  },

  dependencies: [{
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    isRequired: { type: Boolean, default: true } 
  }],

  delayReason:String,


  progress: {
    type: Number,
    default: 0
  },

  createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
lastModifiedAt: Date
},{timestamps:true});

taskSchema.index({ "assignedUsers.userId":1 })
taskSchema.index({ "schedule.date":1 })

module.exports = mongoose.model("Task",taskSchema);