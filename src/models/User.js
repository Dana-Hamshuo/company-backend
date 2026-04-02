// models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
  },

  password: { 
    type: String, 
    required: [true, 'Password is required'], 
    select: false,
    minlength: [6, 'Password must be at least 6 characters']
  },

  role: {
    type: String,
    enum: {
      values: ['scheduler', 'team'],
      message: '{VALUE} is not a valid role'
    },
    required: [true, 'Role is required'],
    default: 'team'
  },

  jobTitle: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true,
    minlength: [2, 'Job title must be at least 2 characters'],
    maxlength: [50, 'Job title cannot exceed 50 characters'],
    index: true  
  },
  
  allowOverlap: {
    type: Boolean,
    default: false,  
    index: true
  },


  maxParallelTasks: {
    type: Number,
    default: 1,
    min: [1, 'maxParallelTasks cannot be less than 1'],
    max: [10, 'maxParallelTasks cannot exceed 10'],
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer value'
    }
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    select: false
  },
  
  isActive: { 
    type: Boolean, 
    default: true,
    index: true 
  }

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ jobTitle: 1, isActive: 1 });
userSchema.index({ allowOverlap: 1, maxParallelTasks: 1 });

module.exports = mongoose.model("User", userSchema);