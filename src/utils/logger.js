// src/utils/logger.js

const LOG_LEVEL = process.env.LOG_LEVEL || 'info'; 

const formatLog = (level, module, action, user, details) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,      
    module,      
    action,      
    userId: user?._id || 'SYSTEM',
    userEmail: user?.email || 'SYSTEM',
    details,     
    ip: details?.ip || 'N/A'
  });
};

const logger = {
  info: (module, action, user, details = {}) => {
    if (['info', 'debug'].includes(LOG_LEVEL)) {
      console.log(formatLog('INFO', module, action, user, details));
    }
  },
  
  error: (module, action, user, error, details = {}) => {
    console.error(formatLog('ERROR', module, action, user, {
      ...details,
      errorMessage: error.message,
      errorCode: error.code
    }));
  },
  
  debug: (module, action, user, details = {}) => {
    if (LOG_LEVEL === 'debug') {
      console.log(formatLog('DEBUG', module, action, user, details));
    }
  }
};

module.exports = logger;