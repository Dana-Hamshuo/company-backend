//src/validators/LoginValidation.js
const { body } = require("express-validator")

exports.loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars")
]