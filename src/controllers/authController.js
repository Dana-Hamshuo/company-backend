const authService = require("../services/authService")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return success(res, user, "user created", 201);
});


exports.login = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    const result = await authService.login(email, password)

    success(res,  {
      token: result.token,
      user: {
        id: result.user._id,
        name: result.user.name,
        role: result.user.role
      }
    },"Login successful")});

    exports.getMe = asyncHandler(async (req, res) => {
      return success(res, {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        jobTitle: req.user.jobTitle,
        allowOverlap: req.user.allowOverlap,
        maxParallelTasks: req.user.maxParallelTasks,
        isActive: req.user.isActive
      }, "User fetched");
    });