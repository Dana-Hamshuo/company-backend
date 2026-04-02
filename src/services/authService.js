//services/authService.js
const User = require("../models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const AppError = require("../utils/AppError");

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

  if (!name || !name.trim()) {
    throw new AppError("Name is required", 400, "VALIDATION_ERROR", "name");
  }

  if (!email || !email.trim()) {
    throw new AppError("Email is required", 400, "VALIDATION_ERROR", "email");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400, "VALIDATION_ERROR", "email");
  }

  if (!password) {
    throw new AppError("Password is required", 400, "VALIDATION_ERROR", "password");
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400, "VALIDATION_ERROR", "password");
  }

const normalizedEmail = email.trim().toLowerCase();
 const existing = await User.findOne({ email: normalizedEmail })
  if (existing) {
    throw new AppError("User already exists", 409, "ALREADY_EXISTS", "email");
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
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

  if (!email) {
    throw new AppError(
      "Email is required",
      400,
      "VALIDATION_ERROR",
      "email"
    );
  }

  if (!password) {
    throw new AppError(
      "Password is required",
      400,
      "VALIDATION_ERROR",
      "password"
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new AppError(
      "User not found",
      404,
      "NOT_FOUND",
      "email"
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError(
      "Invalid email or password",
      401,
      "AUTH_ERROR"
    );
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};