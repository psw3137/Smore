import axios from 'axios';

// 로컬 개발 환경 - 실제 로컬 IP를 사용하세요
// 예: http://192.168.1.100:3000/api/v1
const API_BASE_URL = 'http://YOUR_PC_IP:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// 에러 처리
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.message);
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
    apiClient.get('/recommendations', { params }).then(res => res.data.data)
};
