const authService = require("../services/authService")
const { success } = require("../utils/apiResponse")
exports.register = async (req, res, next) => {

  try {

    const user = await authService.register(req.body)

    res.status(201).json(user)

  } catch (err) {

    next(err)

  }

}


exports.login = async (req, res, next) => {

  try {

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

  } catch (err) {

    next(err)

  }

}