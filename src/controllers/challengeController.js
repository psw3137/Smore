// src/controllers/challengeController.js
const challengeService = require('../services/challengeService');
const { SORT_OPTIONS, ERROR_CODES } = require('../config/constants');

class ChallengeController {
  // 챌린지 목록 조회
  async getChallenges(req, res, next) {
    try {
      const {
        category,
        platform,
        difficulty,
        sort = 'latest',
        page = 1,
        limit = 20
      } = req.query;

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
      const results = await challengeService.getChallenges(
        { category, platform, difficulty },
        sort,
        page,
        limitNum
      );

      return res.successResponse(results, '챌린지 목록을 조회했습니다');
    } catch (error) {
      next(error);
    }
  }

  // 챌린지 상세 조회
  async getChallengeById(req, res, next) {
    try {
      const { challengeId } = req.params;

      // ID 검증
      const id = parseInt(challengeId);
      if (isNaN(id) || id < 1) {
        return res.errorResponse(
          400,
          'INVALID_ID',
          '유효하지 않은 챌린지 ID입니다',
          [{
            field: 'challengeId',
            message: 'ID는 양의 정수여야 합니다',
            received: challengeId
          }]
        );
      }

      // 서비스 호출
      const result = await challengeService.getChallengeById(id);

      return res.successResponse(result, '챌린지 상세 정보를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }

  // 카테고리별 챌린지 조회
  async getChallengesByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const { sort = 'latest', page = 1, limit = 20 } = req.query;

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
      const results = await challengeService.getChallengesByCategory(
        id,
        sort,
        page,
        limitNum
      );

      return res.successResponse(results, '카테고리별 챌린지를 조회했습니다');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChallengeController();
