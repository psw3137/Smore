// src/config/constants.js

// 정렬 옵션
const SORT_OPTIONS = {
  RELEVANCE: 'relevance',
  LATEST: 'latest',
  POPULAR: 'popular',
  VIEWS: 'views'
};

// 난이도
const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// 플랫폼
const PLATFORMS = {
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok'
};

// 카테고리 코드
const CATEGORY_CODES = [
  'dance',
  'lipsync',
  'exercise',
  'cooking',
  'comedy',
  'beauty',
  'gaming',
  'other'
];

// 에러 코드
const ERROR_CODES = {
  INVALID_QUERY: 'INVALID_QUERY',
  INVALID_SORT: 'INVALID_SORT',
  INVALID_PAGE: 'INVALID_PAGE',
  INVALID_LIMIT: 'INVALID_LIMIT',
  INVALID_CATEGORY: 'INVALID_CATEGORY',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  NOT_FOUND: 'NOT_FOUND',
  DB_ERROR: 'DB_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// 성공 코드
const SUCCESS_CODES = {
  SUCCESS: 'SUCCESS',
  NO_RESULTS: 'NO_RESULTS'
};

module.exports = {
  SORT_OPTIONS,
  DIFFICULTY,
  PLATFORMS,
  CATEGORY_CODES,
  ERROR_CODES,
  SUCCESS_CODES
};
