/**
 * 페이지네이션 관련 상수
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  INITIAL_PAGE: 1,
  MAX_CHALLENGES_LOAD: 100,
  END_REACHED_THRESHOLD: 0.5
};

/**
 * 애니메이션 관련 상수
 */
export const ANIMATION = {
  UI_AUTO_HIDE_DELAY: 3000,
  FADE_DURATION: 300,
  SPLASH_DURATION: 2000
};

/**
 * 레이아웃 관련 상수
 */
export const LAYOUT = {
  GRID_COLUMNS: 2,
  CARD_MARGIN: 3
};

/**
 * 정렬 타입
 */
export const SORT_TYPE = {
  LATEST: 'latest',
  POPULAR: 'popular',
  RELEVANCE: 'relevance'
};

/**
 * 난이도
 */
export const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

/**
 * 플랫폼
 */
export const PLATFORM = {
  YOUTUBE: 'youtube',
  TIKTOK: 'tiktok',
  INSTAGRAM: 'instagram'
};

/**
 * 캐시 설정
 */
export const CACHE = {
  BOOKMARKS_KEY: '@smore_bookmarks',
  RECENT_SEARCHES_KEY: '@smore_recent_searches',
  MAX_RECENT_SEARCHES: 10
};

/**
 * API 설정
 */
export const API = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};
