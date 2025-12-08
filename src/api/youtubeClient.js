const { google } = require('googleapis');
require('dotenv').config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

/**
 * YouTube Shorts 검색
 * @param {string} query - 검색 키워드
 * @param {number} maxResults - 최대 결과 수 (기본값: 50)
 * @returns {Promise<Array>} - 검색 결과 배열
 */
async function searchShorts(query, maxResults = 50) {
  try {
    // Shorts 검색어에 #shorts 해시태그 추가
    const shortsQuery = `${query} #shorts`;

    const response = await youtube.search.list({
      part: 'snippet',
      q: shortsQuery,
      type: 'video',
      videoDuration: 'short', // 4분 이하 (추가 필터링은 태그로 진행)
      maxResults,
      order: 'viewCount', // 조회수 순으로 정렬 (인기 쇼츠 우선)
      relevanceLanguage: 'ko',
      regionCode: 'KR',
      safeSearch: 'moderate', // 안전 검색 필터
      publishedAfter: getDateOneMonthAgo() // 최근 1개월 영상만
    });

    return response.data.items || [];
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    throw error;
  }
}

/**
 * 1개월 전 날짜를 RFC 3339 형식으로 반환
 */
function getDateOneMonthAgo() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  return date.toISOString();
}

/**
 * 비디오 상세 정보 가져오기
 * @param {Array<string>} videoIds - 비디오 ID 배열
 * @returns {Promise<Array>} - 비디오 상세 정보 배열
 */
async function getVideoDetails(videoIds) {
  try {
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails,statistics,status',
      id: videoIds.join(',')
    });

    return response.data.items || [];
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    throw error;
  }
}

/**
 * 챌린지 키워드로 Shorts 수집
 * @param {string} challengeKeyword - 챌린지 키워드 (예: "춤챌린지", "댄스챌린지")
 * @param {number} maxResults - 최대 결과 수
 * @returns {Promise<Array>} - 수집된 챌린지 배열
 */
async function collectChallengeShorts(challengeKeyword, maxResults = 50) {
  try {
    // 1. 검색 수행
    const searchResults = await searchShorts(challengeKeyword, maxResults);

    if (searchResults.length === 0) {
      return [];
    }

    // 2. 비디오 ID 추출
    const videoIds = searchResults.map(item => item.id.videoId);

    // 3. 상세 정보 가져오기
    const videoDetails = await getVideoDetails(videoIds);

    // 4. 쇼츠 및 외부 임베드 가능한 영상만 필터링
    const filteredVideos = videoDetails.filter(video => {
      const isEmbeddable = video.status?.embeddable !== false;
      const isPublic = video.status?.privacyStatus === 'public';
      const duration = parseDuration(video.contentDetails.duration);
      const tags = video.snippet.tags || [];

      // 쇼츠 여부 확인 (#shorts, #쇼츠 태그 또는 60초 이하)
      const hasShortsTag = tags.some(tag =>
        tag.toLowerCase() === 'shorts' ||
        tag.toLowerCase() === '쇼츠' ||
        tag.toLowerCase() === '#shorts' ||
        tag.toLowerCase() === '#쇼츠'
      );
      const isShortDuration = duration <= 60; // 60초 이하
      const isShorts = hasShortsTag || isShortDuration;

      // 필터링 로그
      if (!isEmbeddable) {
        console.log(`⏭ Skipping non-embeddable: ${video.snippet.title}`);
      }
      if (!isPublic) {
        console.log(`⏭ Skipping non-public: ${video.snippet.title}`);
      }
      if (!isShorts) {
        console.log(`⏭ Skipping non-shorts (${duration}s): ${video.snippet.title}`);
      }

      return isEmbeddable && isPublic && isShorts;
    });

    console.log(`✓ Filtered: ${filteredVideos.length}/${videoDetails.length} valid shorts (embeddable + shorts tag/duration)`);

    // 5. 데이터 매핑
    const challenges = filteredVideos.map(video => ({
      video_id: video.id,
      platform: 'youtube',
      title: video.snippet.title,
      description: video.snippet.description,
      channel_name: video.snippet.channelTitle,
      channel_url: `https://www.youtube.com/channel/${video.snippet.channelId}`,
      thumbnail_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
      video_url: `https://www.youtube.com/shorts/${video.id}`, // Shorts URL 형식
      duration: parseDuration(video.contentDetails.duration),
      view_count: parseInt(video.statistics.viewCount || 0),
      like_count: parseInt(video.statistics.likeCount || 0),
      comment_count: parseInt(video.statistics.commentCount || 0),
      published_at: video.snippet.publishedAt,
      tags: video.snippet.tags || [],
      is_embeddable: true // 임베드 가능 플래그
    }));

    return challenges;
  } catch (error) {
    console.error('Failed to collect challenge shorts:', error.message);
    throw error;
  }
}

/**
 * ISO 8601 duration을 초로 변환
 * @param {string} duration - ISO 8601 형식의 duration (예: "PT1M30S")
 * @returns {number} - 초 단위 duration
 */
function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');

  return (
    parseInt(hours || 0) * 3600 +
    parseInt(minutes || 0) * 60 +
    parseInt(seconds || 0)
  );
}

/**
 * 여러 키워드로 챌린지 수집
 * @param {Array<string>} keywords - 키워드 배열
 * @param {number} resultsPerKeyword - 키워드당 결과 수
 * @returns {Promise<Array>} - 수집된 모든 챌린지
 */
async function collectMultipleChallenges(keywords, resultsPerKeyword = 20) {
  const allChallenges = [];

  for (const keyword of keywords) {
    try {
      console.log(`Collecting challenges for keyword: ${keyword}`);
      const challenges = await collectChallengeShorts(keyword, resultsPerKeyword);
      allChallenges.push(...challenges);

      // API 할당량 관리를 위한 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to collect for keyword "${keyword}":`, error.message);
      continue;
    }
  }

  // 중복 제거 (video_id 기준)
  const uniqueChallenges = Array.from(
    new Map(allChallenges.map(item => [item.video_id, item])).values()
  );

  return uniqueChallenges;
}

module.exports = {
  searchShorts,
  getVideoDetails,
  collectChallengeShorts,
  collectMultipleChallenges,
  parseDuration,
  getDateOneMonthAgo
};
