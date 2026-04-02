//src/validators/project/project.validation.js
const { body } = require("express-validator");
const mongoose = require("mongoose");

exports.createProjectValidation = [

  body("clientId")
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid clientId"),

  body("title")
    .notEmpty().withMessage("Title is required")
];