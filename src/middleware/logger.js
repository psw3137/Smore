// src/middleware/logger.js

function logger(req, res, next) {
  const start = Date.now();

  // 응답이 끝난 후 로그 출력
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
}

module.exports = { logger };
