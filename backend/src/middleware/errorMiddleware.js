// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  // Log the full error stack
  console.error('Error occurred:', {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: err.stack
  });

  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message,
      code: 'FILE_UPLOAD_ERROR',
      details: {
        field: err.field,
        code: err.code
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: err.message,
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Please log in again',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Handle Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    return res.status(400).json({
      error: 'Database error',
      message: err.message,
      code: err.code,
      details: process.env.NODE_ENV === 'development' ? err.details : undefined
    });
  }

  // Handle Stripe errors
  if (err.type && err.type.startsWith('Stripe')) {
    return res.status(400).json({
      error: 'Payment error',
      message: err.message,
      code: err.code,
      type: err.type
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      code: 'VALIDATION_ERROR',
      details: err.details
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    code: 'INTERNAL_SERVER_ERROR',
    requestId: req.id // Useful for tracking errors in logs
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  console.log('Resource not found:', {
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    code: 'RESOURCE_NOT_FOUND',
    path: req.path
  });
}; 