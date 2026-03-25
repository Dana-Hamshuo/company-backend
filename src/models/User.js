// models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["scheduler", "team"],
    required: true
  },

  jobTitle: String,


  allowOverlap: {
    type: Boolean,
    default: false
  },

  maxParallelTasks: {
    type: Number,
    default: 1,
    min: 1
  },

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);