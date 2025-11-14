const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create a write stream for access logs (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Custom token to log user ID if authenticated
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Custom token to log response time in a more readable format
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;
  return ms.toFixed(3) + 'ms';
});

// Custom format with colors for development
const devFormat = ':method :url :status :response-time-ms - :user-id';

// Detailed format for production logs
const productionFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time-ms';

// Middleware function to setup morgan based on environment
const setupLogger = (app) => {
  if (process.env.NODE_ENV === 'production') {
    // Production: log all requests to file
    app.use(morgan(productionFormat, { stream: accessLogStream }));
    
    // Also log errors to console
    app.use(
      morgan('combined', {
        skip: (req, res) => res.statusCode < 400,
      })
    );
  } else {
    // Development: colored output to console with custom format
    app.use(morgan(devFormat));
    
    // Also log to file for debugging
    app.use(morgan(productionFormat, { stream: accessLogStream }));
  }
};

module.exports = setupLogger;
