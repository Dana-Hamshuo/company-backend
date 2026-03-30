//services/authService.js
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.register = async (data) => {

  const { 
    name, 
    email, 
    password, 
    role,
    jobTitle,
    allowOverlap,
    maxParallelTasks
  } = data

  const existing = await User.findOne({ email })

  if (existing) {
    throw new Error("User already exists")
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    jobTitle,
    allowOverlap,
    maxParallelTasks
  })

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    jobTitle: user.jobTitle,
    allowOverlap: user.allowOverlap,
    maxParallelTasks: user.maxParallelTasks
  }
}


exports.login = async (email, password) => {

const normalizedEmail = email.trim().toLowerCase();

const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    })
  }
  
  const isMatch = await bcrypt.compare(password, user.password)
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    })
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  const safeUser = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    jobTitle: user.jobTitle,
    allowOverlap: user.allowOverlap,
    maxParallelTasks: user.maxParallelTasks
  }

  return { user: safeUser, token }
}
const normalizedEmail = req.body.email.trim().toLowerCase();

const user = await User.create({
  ...req.body,
  email: normalizedEmail
});