// backend/logger.js
const morgan = require('morgan');

function setupLogger(app) {
  app.use(morgan('dev'));
}

module.exports = setupLogger;
