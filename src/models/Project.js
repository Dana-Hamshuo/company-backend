// models/Project.js

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    title: String,
    description: String,
    marketingPlan: {
      type: String,
      default: ""
    },
    contentCreation: {
      type: String,
      default: ""
    },
    hasProfileManagement: {
      type: Boolean,
      default: false
    },
    hasAutomatedReply: {
      type: Boolean,
      default: false
    },
    hasMonthlyReports: {
      type: Boolean,
      default: false
    },
    status: { type: String, enum: ["active", "completed", "paused"], default: "active" },
    clientRating: Number,
    clientFeedback: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  }, { timestamps: true });
  
  module.exports = mongoose.model("Project", projectSchema);