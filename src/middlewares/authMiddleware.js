//src/middlewares/authMiddleware.js

const jwt = require("jsonwebtoken")
const User = require("../models/User")

const AppError = require("../utils/AppError")

module.exports = async (req, res, next) => {

  try {

    const header = req.headers.authorization

    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError(
        "Invalid token format",
        401,
        "AUTH_ERROR"
      )
    }

    const token = header.split(" ")[1]

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)

    if (!user) {
      throw new AppError(
        "Invalid token",
        401,
        "AUTH_ERROR"
      )
    }

    req.user = user

    next()

  } catch (err) {

    next(new AppError("Unauthorized", 401, "AUTH_ERROR"))
  }}