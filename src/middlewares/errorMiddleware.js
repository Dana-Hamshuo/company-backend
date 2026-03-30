// middlewares/errorMiddleware.js
module.exports = (err, req, res, next) => {

  console.error(err)

  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: {
      type: err.type || "SERVER_ERROR",
      field: err.field || null,
      details: err.message
    }
  })
}