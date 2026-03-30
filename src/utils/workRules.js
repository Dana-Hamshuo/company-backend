const AppError = require("../utils/AppError");
const { toMinutes } = require("./time");
const isWorkingDay = require("./isWorkingDay");

exports.validateWorkTime = (startTime, endTime) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  const workStart = toMinutes("10:00");
  const workEnd = toMinutes("15:00");

  if (start < workStart || end > workEnd) {
    throw new AppError(
      "outside working hours",
      500,               
      "SERVER_ERROR",
      null
    );
  }

  if (start >= end) {
    throw new AppError(
      "invalid time range",
      400,
      "VALIDATION_ERROR",
      null
    );
  }
};

exports.validateWorkDay = (date) => {
  if (!isWorkingDay(date)) {
    throw new AppError(
      "day off",
      500,               
      "SERVER_ERROR",
      null
    );
  }
};