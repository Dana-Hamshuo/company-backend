const { body } = require("express-validator");

exports.createClientValidation = [
  body("name")
    .notEmpty().withMessage("Name is required")
];