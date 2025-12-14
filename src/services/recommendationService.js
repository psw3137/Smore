// src/services/recommendationService.js
const trendModel = require('../models/Trend');
const challengeModel = require('../models/Challenge');
const categoryModel = require('../models/Category');

class RecommendationService {
  // 일일 추천 챌린지 (Daily Picks)
  async getDailyPicks() {
    try {
      // 오늘 날짜 기반 시드 생성 (매일 다른 챌린지 선택)
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

      // 모든 활성 카테고리 조회
      const categories = await categoryModel.getAll();

      if (!categories || categories.length === 0) {
        console.warn('No active categories found for daily picks');
        return {
          date: today.toISOString().split('T')[0],
          total_picks: 0,
          picks: []
        };
      }

    // 각 카테고리별로 1개씩 추천 챌린지 선택
    const dailyPicks = await Promise.all(
      categories.map(async (category) => {
        // 카테고리의 인기 챌린지들 가져오기
        const challenges = await challengeModel.getChallenges(
          { category: category.category_code },
          'popular',
          20,  // 상위 20개 중에서 선택
          0
        );

        if (challenges.length === 0) return null;

        // 오늘의 날짜를 기반으로 매일 다른 챌린지 선택 (pseudo-random)
        const index = (dayOfYear + category.category_id) % challenges.length;
        const selectedChallenge = challenges[index];

        return {
          category_id: category.category_id,
          category_name: category.category_name,
          category_code: category.category_code,
          category_icon: category.icon_url,
          challenge: {
            challenge_id: selectedChallenge.challenge_id,
            title: selectedChallenge.title,
            thumbnail_url: selectedChallenge.thumbnail_url,
            platform: selectedChallenge.platform,
            view_count: selectedChallenge.view_count,
            like_count: selectedChallenge.like_count,
            difficulty: selectedChallenge.difficulty,
            video_url: selectedChallenge.video_url
          },
          pick_reason: this.generateDailyPickReason(category.category_name)
        };
      })
    );

      // null 제거 (챌린지가 없는 카테고리)
      const validPicks = dailyPicks.filter(pick => pick !== null);

      return {
        date: today.toISOString().split('T')[0],
        total_picks: validPicks.length,
        picks: validPicks
      };
    } catch (error) {
      console.error('Error in getDailyPicks:', error);
      // 에러 발생 시 빈 배열 반환
      return {
        date: new Date().toISOString().split('T')[0],
        total_picks: 0,
        picks: []
      };
    }
  }

  // 일일 추천 이유 생성
  generateDailyPickReason(categoryName) {
    const reasons = [
      `오늘의 ${categoryName} 추천`,
      `${categoryName} 카테고리 베스트`,
      `꼭 도전해보세요!`,
      `오늘의 챌린지`,
      `인기 급상승 중`
    ];

    const today = new Date();
    const index = today.getDate() % reasons.length;
    return reasons[index];
  }

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
