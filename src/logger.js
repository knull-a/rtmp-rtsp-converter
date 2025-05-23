const winston = require('winston');
const config = require('./config');

// Create a custom format for logging
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    logFormat
  ),
  transports: [
    // Console transport for all logs
    new winston.transports.Console(),
    // File transport for error logs
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    // File transport for all logs
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

module.exports = logger;
