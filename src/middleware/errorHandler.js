// src/middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error('Error occurred:', err);

  // MySQL 에러
  if (err.code && err.code.startsWith('ER_')) {
    return res.errorResponse(
      500,
      'DB_ERROR',
      'Database error occurred',
      [{ message: err.sqlMessage || err.message }]
    );
  }

  // 연결 에러
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.errorResponse(
      503,
      'DB_CONNECTION_ERROR',
      'Database connection lost',
      [{ message: err.message }]
    );
  }

  // 유효성 검증 에러
  if (err.statusCode === 400) {
    return res.errorResponse(
      400,
      err.code || 'VALIDATION_ERROR',
      err.message,
      err.errors || []
    );
  }

  // 404 에러
  if (err.statusCode === 404) {
    return res.errorResponse(
      404,
      'NOT_FOUND',
      err.message || 'Resource not found',
      []
    );
  }

  // 기타 에러 (500)
  return res.errorResponse(
    500,
    'INTERNAL_ERROR',
    'Internal server error',
    [{ message: err.message }]
  );
}

module.exports = { errorHandler };
