const authService = require("../services/authService")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.register = async (req, res, next) => {

  try {

    const user = await authService.register(req.body)

    res.status(201).json(user)

  } catch (err) {

    next(err)

  }

}


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