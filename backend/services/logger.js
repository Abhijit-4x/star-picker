const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist (fail silently on read-only filesystems)
const logsDir = path.join(__dirname, "../logs");
let logsAvailable = true;

try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
} catch (err) {
  console.warn(
    "Warning: Could not create logs directory. Logging to console only."
  );
  logsAvailable = false;
}

const transports = [];

// Only add file transports if logs directory is available
if (logsAvailable) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "star-picker-api" },
  transports: transports,
});

// Add console transport in development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message} ${
              Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : ""
            }`
        )
      ),
    })
  );
}

module.exports = logger;
