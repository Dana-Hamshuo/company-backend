//src/validators/project/project.validation.js
const { body } = require("express-validator");
const mongoose = require("mongoose");

exports.createProjectValidation = [

  body("clientId")
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid clientId"),

  body("title")
    .notEmpty().withMessage("Title is required"),

  body("marketingPlan")
    .optional()
    .isString()
    .withMessage("marketingPlan must be a string"),

  body("contentCreation")
    .optional()
    .isString()
    .withMessage("contentCreation must be a string"),

  body("hasProfileManagement")
    .optional()
    .isBoolean()
    .withMessage("hasProfileManagement must be boolean"),
  
  body("hasAutomatedReply")
    .optional()
    .isBoolean()
    .withMessage("hasAutomatedReply must be boolean"),

  body("hasMonthlyReports")
    .optional()
    .isBoolean()
    .withMessage("hasMonthlyReports must be boolean")
];