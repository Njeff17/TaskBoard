/**
 * Global Express error handler.
 * Converts all thrown errors into a consistent JSON response.
 * Prevents the server from ever crashing on bad input.
 */
const errorHandler = (err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';

  // Log server errors but not expected client errors
  if (status >= 500 && process.env.NODE_ENV !== 'test') {
    console.error('[SERVER ERROR]', err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
