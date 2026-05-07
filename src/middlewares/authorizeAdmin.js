const AppError = require('../utils/AppError');

const authorizeAdmin = (req, res, next) => {
  const userEmail = req.user?.email?.toLowerCase() || '';
  
  if (!userEmail.includes('admin')) {
    return next(
      new AppError(
        'Access denied: Admin privileges required', 
        403, 
        'FORBIDDEN', 
        'email'
      )
    );
  }
  
  next();
};

module.exports = authorizeAdmin;