import axios from 'axios';
import Constants from 'expo-constants';

// 환경 변수에서 API URL 가져오기
// app.config.js에서 설정한 값을 사용
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:3000/api/v1';

console.log('🔧 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초로 증가
  headers: {
    'Content-Type': 'application/json',
  }
});

// 재시도 로직
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 요청 인터셉터 - 로깅
apiClient.interceptors.request.use(
  config => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 재시도
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async error => {
    const config = error.config;

    // 재시도 카운터 초기화
    if (!config.__retryCount) {
      config.__retryCount = 0;
    }

    // 타임아웃 또는 네트워크 에러 시 재시도
    const shouldRetry =
      (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') &&
      config.__retryCount < MAX_RETRIES;

    if (shouldRetry) {
      config.__retryCount++;
      console.log(`🔄 Retrying... (${config.__retryCount}/${MAX_RETRIES})`);

      await delay(RETRY_DELAY * config.__retryCount);
      return apiClient(config);
    }

    // 에러 로깅
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ API Timeout:', error.config?.url);
    } else if (error.code === 'ERR_NETWORK') {
      console.error('🌐 Network Error:', error.config?.url);
      console.error('💡 Tip: Check if backend server is running and accessible');
    } else if (error.response) {
      console.error(`❌ API Error ${error.response.status}:`, error.config?.url);
    } else {
      console.error('❌ API Error:', error.message);
    }

    throw error;
  }
);

export const challengeAPI = {
  // 챌린지 목록
  getChallenges: (params = {}) =>
    apiClient.get('/challenges', { params }).then(res => res.data.data),

  // 챌린지 상세
  getChallengeDetail: (id) =>
    apiClient.get(`/challenges/${id}`).then(res => res.data.data.challenge),

  // 카테고리 목록
  getCategories: () =>
    apiClient.get('/categories').then(res => res.data.data),

  // 카테고리별 챌린지
  getChallengesByCategory: (categoryId, params = {}) =>
    apiClient.get(`/challenges/category/${categoryId}`, { params }).then(res => res.data.data),

  // 검색
  searchChallenges: (query, params = {}) =>
    apiClient.get('/search', { params: { q: query, ...params } }).then(res => res.data.data),

  // 고급 검색
  searchAdvanced: (params = {}) =>
    apiClient.get('/search/advanced', { params }).then(res => res.data.data),

  // 트렌딩 검색어
  getTrendingKeywords: (params = {}) =>
    apiClient.get('/search/trending', { params }).then(res => res.data.data),

  // 트렌드
  getTrends: (params = {}) =>
    apiClient.get('/trends', { params }).then(res => res.data.data),

  // 카테고리별 트렌드
  getCategoryTrends: (categoryId, params = {}) =>
    apiClient.get(`/trends/category/${categoryId}`, { params }).then(res => res.data.data),

  // 수집 로그
  getCollectionLogs: (params = {}) =>
    apiClient.get('/collection-logs', { params }).then(res => res.data.data),

  // 추천
  getRecommendations: (params = {}) =>
    apiClient.get('/recommendations', { params }).then(res => res.data.data),

  // 일일 추천 챌린지
  getDailyPicks: () =>
    apiClient.get('/recommendations/daily-picks').then(res => res.data.data)
};
