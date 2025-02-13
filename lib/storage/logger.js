const winston = require('winston');

/**
 * Creates a logger instance for storage operations
 * @param {string} level - Log level (debug, info, warn, error)
 * @returns {winston.Logger} Configured logger instance
 */
const createLogger = (level = 'info') => {
  return winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} [Storage] ${level}: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
};

module.exports = createLogger;