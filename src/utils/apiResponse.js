//src/utils/apiResponse.js

exports.success = (res, data = null, message = "success", code = 200, meta = null) => {
  return res.status(code).json({
    status: "success",
    code,
    message,
    data,
    ...(meta && { meta })
  });
};

exports.error = (res, message = "error", code = 500, errors = null) => {
  return res.status(code).json({
    status: "error",
    code,
    message,
    ...(errors && { errors })
  });
};