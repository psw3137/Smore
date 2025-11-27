// src/services/challengeService.js
const challengeModel = require('../models/Challenge');
const categoryModel = require('../models/Category');

class ChallengeService {
  // 챌린지 목록 조회
  async getChallenges(filters, sort = 'latest', page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    // 데이터 조회
    const results = await challengeModel.getChallenges(filters, sort, limit, offset);
    const totalCount = await challengeModel.countChallenges(filters);

    // 태그 추가
    const challengesWithTags = await this.attachTagsToChallenges(results);

    return {
      filter: {
        category: filters.category || null,
        platform: filters.platform || null,
        difficulty: filters.difficulty || null
      },
      total_results: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(totalCount / limit),
      has_next: page < Math.ceil(totalCount / limit),
      challenges: challengesWithTags.map(c => this.formatChallenge(c))
    };
  }

  // 챌린지 상세 조회
  async getChallengeById(challengeId) {
    const challenge = await challengeModel.getById(challengeId);

    if (!challenge) {
      const error = new Error('해당 챌린지를 찾을 수 없습니다');
      error.statusCode = 404;
      throw error;
    }

    // 태그 조회
    const tags = await challengeModel.getTagsByChallengeId(challengeId);
    challenge.tags = tags;

    // 관련 챌린지 조회
    const relatedChallenges = await challengeModel.getRelatedChallenges(
      challengeId,
      challenge.category_id,
      5
    );

    // 참여도 계산
    const engagementRate = this.calculateEngagementRate(challenge);

    return {
      challenge: this.formatChallengeDetail(challenge, engagementRate),
      related_challenges: relatedChallenges.map(rc => ({
        challenge_id: rc.challenge_id,
        title: rc.title,
        thumbnail_url: rc.thumbnail_url,
        view_count: rc.view_count,
        platform: rc.platform,
        similarity_score: 0.87 // 임시값
      }))
    };
  }

  // 카테고리별 챌린지 조회
  async getChallengesByCategory(categoryId, sort = 'latest', page = 1, limit = 20) {
    // 카테고리 존재 확인
    const category = await categoryModel.getById(categoryId);
    if (!category) {
      const error = new Error('해당 카테고리를 찾을 수 없습니다');
      error.statusCode = 404;
      throw error;
    }

    const offset = (page - 1) * limit;

    // 데이터 조회
    const results = await challengeModel.getByCategoryId(categoryId, sort, limit, offset);
    const totalCount = await challengeModel.countByCategory(categoryId);

    // 태그 추가
    const challengesWithTags = await this.attachTagsToChallenges(results);

    return {
      category: {
        category_id: category.category_id,
        category_name: category.category_name,
        category_code: category.category_code
      },
      total_results: totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(totalCount / limit),
      has_next: page < Math.ceil(totalCount / limit),
      challenges: challengesWithTags.map(c => this.formatChallenge(c))
    };
  }

  // 태그 추가
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

  // 참여도 계산
  calculateEngagementRate(challenge) {
    const totalInteraction =
      (challenge.like_count || 0) +
      (challenge.comment_count || 0) +
      (challenge.share_count || 0);

    if (challenge.view_count === 0) return 0;

    return parseFloat(((totalInteraction / challenge.view_count) * 100).toFixed(2));
  }

  // 챌린지 포맷팅 (목록용)
  formatChallenge(challenge) {
    return {
      challenge_id: challenge.challenge_id,
      platform: challenge.platform,
      video_id: challenge.video_id,
      title: challenge.title,
      thumbnail_url: challenge.thumbnail_url,
      channel_name: challenge.channel_name,
      view_count: challenge.view_count,
      like_count: challenge.like_count,
      difficulty: challenge.difficulty,
      category: {
        category_id: challenge.category_id,
        category_name: challenge.category_name,
        category_code: challenge.category_code
      },
      upload_date: challenge.upload_date,
      is_verified: Boolean(challenge.is_verified)
    };
  }

  // 챌린지 상세 포맷팅
  formatChallengeDetail(challenge, engagementRate) {
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
        confidence: parseFloat(tag.confidence) || 0
      })),
      engagement_rate: engagementRate,
      collected_at: challenge.collected_at,
      is_verified: Boolean(challenge.is_verified)
    };
  }
}

module.exports = new ChallengeService();
