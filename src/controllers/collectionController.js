// src/controllers/collectionController.js
const collectionService = require('../services/collectionService');
const { ERROR_CODES } = require('../config/constants');

class CollectionController {
  // 수집 로그 조회
  async getCollectionLogs(req, res, next) {
    try {
      const {
        platform,
        status,
        days = 7,
        page = 1,
        limit = 20
      } = req.query;

      // 플랫폼 검증
      if (platform && !['youtube', 'tiktok'].includes(platform)) {
        return res.errorResponse(
          400,
          'INVALID_PLATFORM',
          '유효하지 않은 플랫폼입니다',
          [{
            field: 'platform',
            message: '허용된 값: youtube, tiktok',
            received: platform
          }]
        );
      }

      // 상태 검증
      if (status && !['success', 'partial', 'failed'].includes(status)) {
        return res.errorResponse(
          400,
          'INVALID_STATUS',
          '유효하지 않은 상태입니다',
          [{
            field: 'status',
            message: '허용된 값: success, partial, failed',
            received: status
          }]
        );
      }

      // days 검증
      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return res.errorResponse(
          400,
          'INVALID_DAYS',
          'days는 1~365 사이여야 합니다',
          [{
            field: 'days',
            message: 'days 범위 초과',
            received: days
          }]
        );
      }

      // limit 검증
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.errorResponse(
          400,
          ERROR_CODES.INVALID_LIMIT,
          'limit은 1~100 사이여야 합니다',
          [{
            field: 'limit',
            message: 'limit 범위 초과',
            received: limit
          }]
        );
      }

      // 서비스 호출
      const results = await collectionService.getCollectionLogs(
        { platform, status, days: daysNum },
        page,
        limitNum
      );

      return res.successResponse(results, '수집 로그를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CollectionController();
