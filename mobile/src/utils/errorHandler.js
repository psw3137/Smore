/**
 * API 에러 통합 처리
 * @param {Error} error - 에러 객체
 * @param {string} context - 에러 발생 컨텍스트
 * @param {Object} options - 옵션
 * @returns {Array|null} 빈 배열 또는 null
 */
export const handleAPIError = (error, context, options = {}) => {
  const { silent = false, returnValue = [] } = options;

  console.error(`[${context}] Error:`, error.message);

  if (error.response) {
    // 서버 응답 에러 (4xx, 5xx)
    console.error(`[${context}] Status:`, error.response.status);
    console.error(`[${context}] Data:`, error.response.data);
  } else if (error.request) {
    // 요청은 보냈지만 응답 없음
    console.error(`[${context}] No response received`);
  } else {
    // 요청 설정 중 에러
    console.error(`[${context}] Request setup error:`, error.message);
  }

  // 향후 에러 로깅 서비스 통합 가능 (예: Sentry)
  // logErrorToService(error, context);

  return silent ? null : returnValue;
};

/**
 * 에러 메시지를 사용자 친화적으로 변환
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적 메시지
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (!error) return '알 수 없는 오류가 발생했습니다.';

  if (error.message?.includes('Network Error') || error.message?.includes('timeout')) {
    return '네트워크 연결을 확인해주세요.';
  }

  if (error.response?.status === 404) {
    return '요청한 데이터를 찾을 수 없습니다.';
  }

  if (error.response?.status === 500) {
    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  return error.message || '오류가 발생했습니다. 다시 시도해주세요.';
};
