//src/middlewares/validationMiddleware.js

const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    const first = errors.array()[0];

    return next(
      new AppError(
        first.msg,
        400,
        "VALIDATION_ERROR",
        first.param
      )
    );
  }

  next();
};