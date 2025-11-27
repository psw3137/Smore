// src/controllers/searchController.js
const searchService = require('../services/searchService');
const { SORT_OPTIONS, CATEGORY_CODES, ERROR_CODES } = require('../config/constants');

class SearchController {
  // 기본 검색
  async search(req, res, next) {
    try {
      const { q, sort = 'relevance', page = 1, limit = 20 } = req.query;

      // 입력 검증
      if (!q || q.trim().length < 2) {
        return res.errorResponse(
          400,
          ERROR_CODES.INVALID_QUERY,
          '검색어는 2자 이상이어야 합니다',
          [{
            field: 'q',
            message: '검색어 길이가 너무 짧습니다 (최소 2자)',
            received: q || ''
          }]
        );
      }

      // 정렬 옵션 검증
      const validSortOptions = Object.values(SORT_OPTIONS);
      if (!validSortOptions.includes(sort)) {
        return res.errorResponse(
          400,
          ERROR_CODES.INVALID_SORT,
          '정렬 옵션이 유효하지 않습니다',
          [{
            field: 'sort',
            message: `허용된 값: ${validSortOptions.join(', ')}`,
            received: sort
          }]
        );
      }

      // 페이지 검증
      const pageNum = parseInt(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.errorResponse(
          400,
          ERROR_CODES.INVALID_PAGE,
          '페이지 번호는 1 이상이어야 합니다',
          [{
            field: 'page',
            message: '유효하지 않은 페이지 번호',
            received: page
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
      const results = await searchService.search(q, sort, pageNum, limitNum);

      // 결과가 없는 경우
      if (results.total_results === 0) {
        return res.successResponse(results, '검색 결과가 없습니다', 'NO_RESULTS');
      }

      return res.successResponse(results, '검색이 완료되었습니다');
    } catch (error) {
      next(error);
    }
  }

  // 고급 검색
  async searchAdvanced(req, res, next) {
    try {
      const {
        q,
        category,
        platform,
        difficulty,
        date_from,
        date_to,
        min_views = 0,
        sort = 'relevance',
        page = 1,
        limit = 20
      } = req.query;

      // 검색어 검증
      if (!q || q.trim().length < 2) {
        return res.errorResponse(
          400,
          ERROR_CODES.INVALID_QUERY,
          '검색어는 2자 이상이어야 합니다',
          [{
            field: 'q',
            message: '검색어 길이가 너무 짧습니다',
            received: q || ''
          }]
        );
      }

      // 카테고리 검증
      if (category && !CATEGORY_CODES.includes(category)) {
        return res.errorResponse(
          400,
          ERROR_CODES.INVALID_CATEGORY,
          '유효하지 않은 카테고리입니다',
          [{
            field: 'category',
            message: `허용된 카테고리: ${CATEGORY_CODES.join(', ')}`,
            received: category
          }]
        );
      }

      // 날짜 범위 검증
      if (date_from && date_to) {
        const fromDate = new Date(date_from);
        const toDate = new Date(date_to);

        if (fromDate > toDate) {
          return res.errorResponse(
            400,
            ERROR_CODES.INVALID_DATE_RANGE,
            '날짜 범위가 유효하지 않습니다',
            [{
              field: 'date_range',
              message: '시작 날짜가 종료 날짜보다 뒤일 수 없습니다',
              received: { date_from, date_to }
            }]
          );
        }
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
      const results = await searchService.searchAdvanced({
        q,
        category,
        platform,
        difficulty,
        date_from,
        date_to,
        min_views,
        sort,
        page,
        limit
      });

      // 결과가 없는 경우
      if (results.total_results === 0) {
        return res.successResponse(results, '검색 결과가 없습니다', 'NO_RESULTS');
      }

      return res.successResponse(results, '검색이 완료되었습니다');
    } catch (error) {
      next(error);
    }
  }

  // 트렌딩 검색어
  async getTrendingKeywords(req, res, next) {
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
      const results = await searchService.getTrendingKeywords(limitNum, daysNum);

      return res.successResponse(results, '트렌딩 검색어를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SearchController();
