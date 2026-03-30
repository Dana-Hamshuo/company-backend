//src/middlewares/errorMiddleware.js

module.exports = (err, req, res, next) => {

  console.error(err)

  const statusCode = err.statusCode || 500

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "dev" ? err.stack : undefined
  })

}