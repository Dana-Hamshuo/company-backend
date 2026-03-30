const calendarService = require("../services/calendarService")
const { success } = require("../utils/apiResponse")
const asyncHandler = require("../utils/asyncHandler");

exports.getMonth = asyncHandler(async (req, res) => {

const { year, month, userId, status, projectId } = req.query;
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

  const data = await calendarService.getMonthCalendar(
    year,
    month,
    req.user._id,
    { status, projectId }
  );

  return success(res, data, "My calendar fetched");
});