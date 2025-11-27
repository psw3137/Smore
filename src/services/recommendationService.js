// src/services/recommendationService.js
const trendModel = require('../models/Trend');
const challengeModel = require('../models/Challenge');

class RecommendationService {
  // 트렌드 기반 추천
  async getRecommendations(limit = 10, days = 7) {
    // 1단계: 카테고리별 통계 조회
    const categoryStats = await trendModel.getCategoryStatistics(days);

    if (categoryStats.length === 0) {
      return {
        recommendation_basis: {
          period_days: days,
          trend_scores_used: true,
          category_diversity: true
        },
        recommendations: []
      };
    }

    // 2단계: 각 카테고리별 상위 챌린지 추출
    const categoryTopChallenges = await Promise.all(
      categoryStats.map(async (category) => {
        const challenges = await trendModel.getTopChallengesByCategory(
          category.category_id,
          days,
          3  // 카테고리당 상위 3개
        );

        return challenges.map(c => ({
          ...c,
          category_id: category.category_id,
          category_name: category.category_name,
          category_code: category.category_code,
          category_trend_score: this.calculateCategoryTrendScore(category)
        }));
      })
    );

    // 3단계: 모든 챌린지를 하나의 배열로 병합
    const allChallenges = categoryTopChallenges.flat();

    // 4단계: 트렌드 점수 기준으로 정렬
    const sorted = allChallenges.sort((a, b) => {
      // 카테고리 트렌드 점수와 개별 챌린지 조회수를 함께 고려
      const scoreA = a.category_trend_score * 0.4 + (a.view_count / 1000000) * 0.6;
      const scoreB = b.category_trend_score * 0.4 + (b.view_count / 1000000) * 0.6;
      return scoreB - scoreA;
    });

    // 5단계: 다양성 보장 (각 카테고리에서 골고루 선택)
    const diverseRecommendations = this.ensureDiversity(sorted, limit, categoryStats.length);

    // 6단계: 추천 이유 생성
    const recommendations = diverseRecommendations.map((challenge, index) => ({
      rank: index + 1,
      challenge_id: challenge.challenge_id,
      title: challenge.title,
      thumbnail_url: challenge.thumbnail_url,
      platform: challenge.platform,
      view_count: challenge.view_count,
      like_count: challenge.like_count,
      category: {
        category_id: challenge.category_id,
        category_name: challenge.category_name,
        category_code: challenge.category_code
      },
      trend_score: this.calculateChallengeTrendScore(challenge),
      recommendation_reason: this.generateRecommendationReason(challenge, days),
      upload_date: challenge.upload_date
    }));

    return {
      recommendation_basis: {
        period_days: days,
        trend_scores_used: true,
        category_diversity: true
      },
      recommendations: recommendations
    };
  }

  // 다양성 보장
  ensureDiversity(challenges, limit, categoryCount) {
    const result = [];
    const categoryUsage = {};
    const maxPerCategory = Math.ceil(limit / categoryCount);

    for (const challenge of challenges) {
      if (result.length >= limit) break;

      const categoryId = challenge.category_id;
      if (!categoryUsage[categoryId]) {
        categoryUsage[categoryId] = 0;
      }

      // 각 카테고리에서 최대 개수만큼만 선택
      if (categoryUsage[categoryId] < maxPerCategory) {
        result.push(challenge);
        categoryUsage[categoryId]++;
      }
    }

    // limit를 채우지 못한 경우, 나머지를 채움
    if (result.length < limit) {
      for (const challenge of challenges) {
        if (result.length >= limit) break;
        if (!result.find(r => r.challenge_id === challenge.challenge_id)) {
          result.push(challenge);
        }
      }
    }

    return result;
  }

  // 카테고리 트렌드 점수 계산
  calculateCategoryTrendScore(category) {
    const viewScore = Math.min(60, (category.avg_view_count / 100000) * 60);
    const challengeScore = Math.min(40, (category.total_challenges / 100) * 40);

    return Math.min(100, Math.round(viewScore + challengeScore));
  }

  // 챌린지 트렌드 점수 계산
  calculateChallengeTrendScore(challenge) {
    const viewScore = Math.min(60, (challenge.view_count / 1000000) * 60);
    const likeScore = Math.min(30, (challenge.like_count / 50000) * 30);
    const recentScore = 10; // 최근 업로드 보너스

    return Math.min(100, Math.round(viewScore + likeScore + recentScore));
  }

  // 추천 이유 생성
  generateRecommendationReason(challenge, days) {
    const reasons = [
      `지난 ${days}일 대인기 챌린지`,
      `${challenge.category_name} 카테고리 상승 트렌드`,
      `새로운 인기 카테고리`,
      `조회수 급상승 중`,
      `많은 사용자가 참여 중`
    ];

    // 조회수 기반으로 이유 선택
    if (challenge.view_count > 1000000) {
      return reasons[0];
    } else if (challenge.view_count > 500000) {
      return reasons[1];
    } else if (challenge.view_count > 100000) {
      return reasons[3];
    } else {
      return reasons[2];
    }
  }
}

module.exports = new RecommendationService();
