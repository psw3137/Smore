// src/controllers/recommendationController.js
const recommendationService = require('../services/recommendationService');
const { ERROR_CODES } = require('../config/constants');

class RecommendationController {
  // 트렌드 기반 추천
  async getRecommendations(req, res, next) {
    try {
      const { limit = 10, days = 7 } = req.query;

      // limit 검증
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.errorResponse(
          400,
          ERROR_CODES.INVALID_LIMIT,
          'limit은 1~50 사이여야 합니다',
          [{
            field: 'limit',
            message: 'limit 범위 초과',
            received: limit
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
      const results = await recommendationService.getRecommendations(limitNum, daysNum);

      return res.successResponse(results, '추천 챌린지를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationController();
