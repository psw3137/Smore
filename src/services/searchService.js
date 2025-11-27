// src/services/searchService.js
const challengeModel = require('../models/Challenge');
const tagModel = require('../models/Tag');
const pool = require('../config/database');

class SearchService {
  // 기본 검색
  async search(query, sortType = 'relevance', page = 1, limit = 20) {
    // 쿼리 정규화
    const normalizedQuery = this.normalizeQuery(query);

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 데이터 조회
    const results = await challengeModel.search(normalizedQuery, sortType, limit, offset);
    const totalCount = await challengeModel.countByQuery(normalizedQuery);

    // 각 챌린지의 태그 조회
    const challengesWithTags = await this.attachTagsToChallenges(results);

    // 응답 포맷
    return {
      query: query,
      total_results: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(totalCount / limit),
      has_next: page < Math.ceil(totalCount / limit),
      has_previous: page > 1,
      results: challengesWithTags.map(r => this.formatChallenge(r))
    };
  }

  // 고급 검색
  async searchAdvanced(filters) {
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
    } = filters;

    // 쿼리 정규화
    const normalizedQuery = q ? this.normalizeQuery(q) : null;

    // 필터 객체 생성
    const searchFilters = {
      q: normalizedQuery,
      category,
      platform,
      difficulty,
      date_from,
      date_to,
      min_views: parseInt(min_views)
    };

    // 페이지네이션 계산
    const offset = (page - 1) * limit;

    // 데이터 조회
    const results = await challengeModel.searchAdvanced(searchFilters, sort, limit, offset);
    const totalCount = await challengeModel.countByAdvancedQuery(searchFilters);

    // 태그 추가
    const challengesWithTags = await this.attachTagsToChallenges(results);

    // 응답 포맷
    return {
      query: q || '',
      query_filters: {
        category: category || null,
        platform: platform || null,
        difficulty: difficulty || null,
        date_from: date_from || null,
        date_to: date_to || null,
        min_views: parseInt(min_views)
      },
      total_results: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(totalCount / limit),
      has_next: page < Math.ceil(totalCount / limit),
      has_previous: page > 1,
      results: challengesWithTags.map(r => this.formatChallenge(r))
    };
  }

  // 트렌딩 검색어
  async getTrendingKeywords(limit = 10, days = 7) {
    // 태그 기반 트렌딩 검색어
    const trendingTags = await tagModel.getTrendingTags(limit, days);

    // 각 검색어의 통계 계산
    const keywords = await Promise.all(
      trendingTags.map(async (tag) => {
        const keyword = tag.tag_name.replace('#', '');

        // 해당 키워드로 검색한 결과 개수
        const count = await challengeModel.countByQuery(keyword);

        // 트렌드 방향 및 변화율 (임시로 랜덤 생성)
        const trendPercentage = (Math.random() * 60 - 20).toFixed(1);
        let trendDirection = 'STABLE';
        if (trendPercentage > 10) trendDirection = 'UP';
        else if (trendPercentage < -10) trendDirection = 'DOWN';

        // 카테고리별 분포
        const categorySuggestions = await this.getCategorySuggestionsForKeyword(keyword);

        return {
          keyword: keyword,
          search_count: tag.usage_count,
          trend: trendDirection,
          trend_percentage: parseFloat(trendPercentage),
          result_count: count,
          category_suggestions: categorySuggestions
        };
      })
    );

    // 순위 추가
    const rankedKeywords = keywords.map((kw, index) => ({
      rank: index + 1,
      ...kw
    }));

    return {
      period: `${days} days`,
      trending_keywords: rankedKeywords
    };
  }

  // 키워드에 대한 카테고리 제안
  async getCategorySuggestionsForKeyword(keyword) {
    const sql = `
      SELECT
        cat.category_id,
        cat.category_name,
        cat.category_code,
        COUNT(c.challenge_id) as count
      FROM challenges c
      JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE c.is_active = TRUE
        AND (
          c.title LIKE CONCAT('%', ?, '%')
          OR c.description LIKE CONCAT('%', ?, '%')
        )
      GROUP BY cat.category_id, cat.category_name, cat.category_code
      ORDER BY count DESC
      LIMIT 3
    `;

    const [rows] = await pool.query(sql, [keyword, keyword]);
    return rows;
  }

  // 챌린지에 태그 추가
  async attachTagsToChallenges(challenges) {
    const challengesWithTags = await Promise.all(
      challenges.map(async (challenge) => {
        const tags = await challengeModel.getTagsByChallengeId(challenge.challenge_id);
        return {
          ...challenge,
          tags: tags || []
        };
      })
    );

    return challengesWithTags;
  }

  // 검색어 정규화
  normalizeQuery(query) {
    return query
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[#@]/g, '')
      .substring(0, 100);
  }

  // 챌린지 포맷팅
  formatChallenge(challenge) {
    return {
      challenge_id: challenge.challenge_id,
      platform: challenge.platform,
      video_id: challenge.video_id,
      title: challenge.title,
      description: challenge.description,
      thumbnail_url: challenge.thumbnail_url,
      channel_name: challenge.channel_name,
      channel_url: challenge.channel_url,
      video_url: challenge.video_url,
      view_count: challenge.view_count,
      like_count: challenge.like_count,
      comment_count: challenge.comment_count,
      share_count: challenge.share_count,
      upload_date: challenge.upload_date,
      duration_seconds: challenge.duration_seconds,
      difficulty: challenge.difficulty,
      category: {
        category_id: challenge.category_id,
        category_name: challenge.category_name,
        category_code: challenge.category_code
      },
      tags: (challenge.tags || []).map(tag => ({
        tag_id: tag.tag_id,
        tag_name: tag.tag_name,
        tag_normalized: tag.tag_normalized,
        confidence: parseFloat(tag.confidence) || 0
      })),
      relevance_score: challenge.relevance_score ? parseFloat(challenge.relevance_score) / 100 : undefined,
      collected_at: challenge.collected_at,
      is_verified: Boolean(challenge.is_verified)
    };
  }
}

module.exports = new SearchService();
