//src/validators/auth/register.validation.js
const { body } = require("express-validator");

exports.registerValidation = [
  body("name")
    .notEmpty().withMessage("Name is required"),

  body("email")
    .isEmail().withMessage("Invalid email"),

  body("password")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),

  body("role")
    .isIn(["scheduler", "team"])
    .withMessage("Invalid role")
];