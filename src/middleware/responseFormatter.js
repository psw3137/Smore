// src/middleware/responseFormatter.js

function responseFormatter(req, res, next) {
  // 성공 응답 메서드
  res.successResponse = function(data, message = 'Success', code = 'SUCCESS') {
    return this.json({
      success: true,
      code: code,
      message: message,
      data: data,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });
  };

  // 에러 응답 메서드
  res.errorResponse = function(statusCode, code, message, errors = []) {
    return this.status(statusCode).json({
      success: false,
      code: code,
      message: message,
      errors: errors,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });
  };

  next();
}

module.exports = { responseFormatter };
