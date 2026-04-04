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
    },"Login successful")

});


exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});