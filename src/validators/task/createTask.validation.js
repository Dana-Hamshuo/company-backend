const { body } = require("express-validator");
const mongoose = require("mongoose");

exports.createTaskValidation = [

  body("title")
    .notEmpty().withMessage("Title is required"),

  body("projectId")
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid projectId"),

  body("assignedUsers")
    .isArray({ min: 1 })
    .withMessage("assignedUsers required"),

  body("assignedUsers.*.userId")
    .custom(val => mongoose.Types.ObjectId.isValid(val))
    .withMessage("Invalid userId"),

  body("schedule")
    .isArray({ min: 1 })
    .withMessage("schedule required"),

  body("schedule.*.date")
    .isISO8601().withMessage("Invalid date"),

  body("schedule.*.startTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid startTime"),

  body("schedule.*.endTime")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid endTime")
];