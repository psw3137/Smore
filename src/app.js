// src/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { responseFormatter } = require('./middleware/responseFormatter');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./middleware/logger');
const routes = require('./routes');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 로깅 미들웨어
app.use(logger);

// 응답 포맷팅 미들웨어
app.use(responseFormatter);

// API 라우터
app.use('/api/v1', routes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'API endpoint not found',
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  });
});

// 에러 처리 미들웨어 (마지막에 추가)
app.use(errorHandler);

module.exports = app;
