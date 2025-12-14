/**
 * YouTube URL에서 비디오 ID 추출
 * @param {string} url - YouTube URL
 * @returns {string|null} 비디오 ID 또는 null
 */
export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * YouTube 비디오 ID로 썸네일 URL 생성
 * @param {string} videoId - YouTube 비디오 ID
 * @param {string} quality - 썸네일 품질 (default, hq, mq, sd, maxres)
 * @returns {string} 썸네일 URL
 */
export const getYoutubeThumbnail = (videoId, quality = 'hq') => {
  if (!videoId) return null;
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault'
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality] || 'hqdefault'}.jpg`;
};

/**
 * YouTube URL이 Shorts인지 확인
 * @param {string} url - YouTube URL
 * @returns {boolean} Shorts 여부
 */
export const isYoutubeShorts = (url) => {
  if (!url) return false;
  return url.includes('/shorts/');
};
