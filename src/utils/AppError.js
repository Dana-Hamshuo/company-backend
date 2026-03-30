// utils/AppError.js
class AppError extends Error {
    constructor(message, statusCode = 500, type = "SERVER_ERROR", field = null, details = null) {
      super(message);
      this.statusCode = statusCode;
      this.type = type;
      this.field = field;
      this.details = details;
    }
  }
  
  module.exports = AppError