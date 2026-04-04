//src/middlewares/authMiddleware.js

const jwt = require("jsonwebtoken")
const User = require("../models/User")

const AppError = require("../utils/AppError")

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Invalid token format", 401, "AUTH_ERROR");
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError("Invalid token", 401, "AUTH_ERROR");
    }

    req.user = user;
    next();
  } catch (err) {
    next(new AppError("Unauthorized", 401, "AUTH_ERROR"));
  }
};

authMiddleware.authorizeScheduler = (req, res, next) => {
    if (req.user.role !== "scheduler") {
      return res.status(403).json({
        success: false,
        message: "Access denied: scheduler only",
        error: {
          type: "FORBIDDEN",
          field: "role",
          details: "Only scheduler can perform this action"
        }
      });
    }
    next();
  };



  
  exports.protect = async (req, res, next) => {
    let token;
  
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
  
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      req.user = await User.findById(decoded.id).select("-password");
  
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };


module.exports = authMiddleware;