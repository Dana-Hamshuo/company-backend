const calendarService = require("../services/calendarService")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");



exports.getMonth = asyncHandler(async (req, res) => {

const { year, month, userId, status, projectId } = req.query;
if (!year) {
  throw new AppError("Year is required", 400, "VALIDATION_ERROR", "year");
}

if (!month) {
  throw new AppError("Month is required", 400, "VALIDATION_ERROR", "month");
}
const data = await calendarService.getMonthCalendar(
    year,
    month,
    userId,
    { status, projectId }
  );

  return success(res, data, "Calendar fetched");
});

exports.getMyCalendar = asyncHandler(async (req, res) => {

  const { year, month, status, projectId } = req.query;
  if (!year) {
    throw new AppError("Year is required", 400, "VALIDATION_ERROR", "year");
  }
  
  if (!month) {
    throw new AppError("Month is required", 400, "VALIDATION_ERROR", "month");
  }
  const data = await calendarService.getMonthCalendar(
    year,
    month,
    req.user._id,
    { status, projectId }
  );

  return success(res, data, "My calendar fetched");
});