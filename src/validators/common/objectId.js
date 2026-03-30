const { param, body } = require("express-validator");
const mongoose = require("mongoose");

exports.isObjectId = (field, location = "body") => {
  const validator = location === "param" ? param : body;

  return validator(field).custom(value => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`${field} is invalid`);
    }
    return true;
  });
};