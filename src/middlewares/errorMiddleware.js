// middlewares/errorMiddleware.js
const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {

  console.error("ERROR 💥:", err);

  let customError = err;

  // 🔥 Mongoose Validation Error (enum, required...)
  if (err.name === "ValidationError") {
    const firstError = Object.values(err.errors)[0];

    customError = new AppError(
      firstError.message,
      400,
      "VALIDATION_ERROR",
      firstError.path
    );
  }

  if (err.name === "CastError") {
    customError = new AppError(
      "Invalid ID format",
      400,
      "VALIDATION_ERROR",
      err.path
    );
  }

  if (err.name === "JsonWebTokenError") {
    customError = new AppError(
      "Invalid token",
      401,
      "AUTH_ERROR",
      "token"
    );
  }

  if (err.name === "TokenExpiredError") {
    customError = new AppError(
      "Token expired",
      401,
      "AUTH_ERROR",
      "token"
    );
  }

  if (err.message?.includes("Illegal arguments")) {
    customError = new AppError(
      "Invalid password format",
      400,
      "VALIDATION_ERROR",
      "password"
    );
  }

  const statusCode = customError.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: customError.message || "Something went wrong",
    error: {
      type: customError.type || "SERVER_ERROR",
      field: customError.field || null,
      details: customError.message
    }
  });
};