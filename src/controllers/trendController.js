// src/controllers/trendController.js
const trendService = require('../services/trendService');

class TrendController {
  // 전체 트렌드 대시보드
  async getTrends(req, res, next) {
    try {
      const { days = 7 } = req.query;

      // days 검증
      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
        return res.errorResponse(
          400,
          'INVALID_DAYS',
          'days는 1~30 사이여야 합니다',
          [{
            field: 'days',
            message: 'days 범위 초과',
            received: days
          }]
        );
      }

      // 서비스 호출
      const results = await trendService.getTrends(daysNum);

      return res.successResponse(results, '트렌드 데이터를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }

  // 일별 트렌드
  async getDailyTrend(req, res, next) {
    try {
      const { date } = req.query;

      // 날짜 형식 검증 (YYYY-MM-DD)
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.errorResponse(
          400,
          'INVALID_DATE',
          '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)',
          [{
            field: 'date',
            message: '올바른 형식: YYYY-MM-DD',
            received: date
          }]
        );
      }

      // 서비스 호출
      const results = await trendService.getDailyTrend(date);

      return res.successResponse(results, '일별 트렌드를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }

  // 카테고리별 트렌드
  async getCategoryTrend(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { days = 7 } = req.query;

      // ID 검증
      const id = parseInt(categoryId);
      if (isNaN(id) || id < 1) {
        return res.errorResponse(
          400,
          'INVALID_ID',
          '유효하지 않은 카테고리 ID입니다',
          [{
            field: 'categoryId',
            message: 'ID는 양의 정수여야 합니다',
            received: categoryId
          }]
        );
      }

      // days 검증
      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 30) {
        return res.errorResponse(
          400,
          'INVALID_DAYS',
          'days는 1~30 사이여야 합니다',
          [{
            field: 'days',
            message: 'days 범위 초과',
            received: days
          }]
        );
      }

      // 서비스 호출
      const results = await trendService.getCategoryTrend(id, daysNum);

      return res.successResponse(results, '카테고리 트렌드를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TrendController();
