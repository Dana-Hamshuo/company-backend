// src/middlewares/roleMiddleware.js

exports.requireScheduler = (req, res, next) => {
  if (req.user.role !== "scheduler") {
    return res.status(403).json({
      success: false,
      message: "Scheduler role required"
    });
  }
  next();
};

exports.allowRoles = (...roles)=>{
  return res.status(403).json({
    success: false,
    message: "Forbidden",
    error: {
      type: "AUTH_ERROR",
      field: "role"
    }
  })
 }
