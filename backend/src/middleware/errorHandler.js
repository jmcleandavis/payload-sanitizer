// Catches parsing issues and prevents application crashes from malformed inputs
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: err.details || null
  });
}
