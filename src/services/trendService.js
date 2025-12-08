// src/services/trendService.js
const trendModel = require('../models/Trend');
const tagModel = require('../models/Tag');
const categoryModel = require('../models/Category');

class TrendService {
  // 전체 트렌드 대시보드
  async getTrends(days = 7) {
    const trendDate = new Date().toISOString().split('T')[0];

    // 상위 10개 챌린지
    const topChallenges = await trendModel.getRecentTrends(days);

    // 카테고리별 통계
    const categoryStats = await trendModel.getCategoryStatistics(days);

    // 플랫폼별 비교
    const platformComparison = await trendModel.getPlatformComparison(days);

    // 인기 태그
    const topTags = await tagModel.getTrendingTags(10, days);

    // 전체 트렌드 점수 계산
    const overallTrendScore = this.calculateOverallTrendScore(categoryStats);

    // 트렌드 방향 결정
    const trendDirection = 'UP'; // 임시값

    // 변화율 계산 (임시값)
    const comparedToPreviousWeek = 15.3;

    return {
      trend_date: trendDate,
      period_days: days,
      overall_trend_score: overallTrendScore,
      trend_direction: trendDirection,
      compared_to_previous_week: comparedToPreviousWeek,
      top_10_challenges: topChallenges.map((c, index) => ({
        rank: index + 1,
        challenge_id: c.challenge_id,
        title: c.title,
        platform: c.platform,
        category_id: c.category_id,
        view_count: c.view_count,
        trend_score: this.calculateTrendScore(c)
      })),
      category_statistics: categoryStats.map(cs => ({
        category_id: cs.category_id,
        category_name: cs.category_name,
        category_code: cs.category_code,
        total_challenges: cs.total_challenges,
        avg_view_count: Math.round(cs.avg_view_count || 0),
        avg_like_count: Math.round(cs.avg_like_count || 0),
        trend_score: this.calculateCategoryTrendScore(cs),
        trend_direction: 'UP', // 임시값
        compared_to_previous_week: (Math.random() * 30).toFixed(1) // 임시값
      })),
      platform_comparison: this.formatPlatformComparison(platformComparison),
      top_tags: topTags.map(t => ({
        tag_name: t.tag_name,
        count: t.usage_count
      }))
    };
  }

  // 일별 트렌드
  async getDailyTrend(date) {
    const dateStr = date || new Date().toISOString().split('T')[0];

    // 저장된 트렌드 데이터 조회 시도
    const savedTrends = await trendModel.getDailyTrend(dateStr);

    if (savedTrends && savedTrends.length > 0) {
      // 저장된 데이터 반환
      return this.formatSavedTrends(savedTrends, dateStr);
    }

    // 저장된 데이터가 없으면 실시간 계산
    return await this.getTrends(1);
  }

  // 카테고리별 트렌드
  async getCategoryTrend(categoryId, days = 7) {
    // 카테고리 정보 조회
    const category = await categoryModel.getById(categoryId);
    if (!category) {
      const error = new Error('해당 카테고리를 찾을 수 없습니다');
      error.statusCode = 404;
      throw error;
    }

    // 카테고리별 통계
    const dailyTrend = await trendModel.getCategoryTrend(categoryId, days);
    const topChallenges = await trendModel.getTopChallengesByCategory(categoryId, days, 10);

    // 통계 계산
    const totalChallenges = dailyTrend.reduce((sum, d) => sum + d.challenges_count, 0);
    const totalViews = dailyTrend.reduce((sum, d) => sum + (d.total_views || 0), 0);
    const avgViewCount = totalChallenges > 0 ? Math.round(totalViews / totalChallenges) : 0;

    const trendScore = this.calculateCategoryTrendScore({
      total_challenges: totalChallenges,
      avg_view_count: avgViewCount
    });

    return {
      category: {
        category_id: category.category_id,
        category_name: category.category_name,
        category_code: category.category_code
      },
      period_days: days,
      total_challenges: totalChallenges,
      avg_view_count: avgViewCount,
      total_views: totalViews,
      trend_score: trendScore,
      trend_direction: 'UP', // 임시값
      compared_to_previous_week: 18.5, // 임시값
      daily_trend: dailyTrend.map(dt => ({
        date: dt.date,
        challenges_count: dt.challenges_count,
        avg_view_count: Math.round(dt.avg_view_count || 0),
        trend_score: this.calculateDailyTrendScore(dt)
      })),
      top_10_by_views: topChallenges.map((c, index) => ({
        rank: index + 1,
        challenge_id: c.challenge_id,
        title: c.title,
        platform: c.platform,
        view_count: c.view_count,
        thumbnail_url: c.thumbnail_url
      }))
    };
  }

  // 전체 트렌드 점수 계산
  calculateOverallTrendScore(categoryStats) {
    if (!categoryStats || categoryStats.length === 0) return 0;

    const avgViews = categoryStats.reduce((sum, cs) => sum + (cs.avg_view_count || 0), 0) / categoryStats.length;
    const score = Math.min(100, Math.round((avgViews / 100000) * 100));

    return score;
  }

  // 개별 챌린지 트렌드 점수
  calculateTrendScore(challenge) {
    const viewScore = Math.min(50, (challenge.view_count / 1000000) * 50);
    const likeScore = Math.min(30, (challenge.like_count / 50000) * 30);
    const commentScore = Math.min(20, ((challenge.comment_count || 0) / 5000) * 20);

    return Math.min(100, Math.round(viewScore + likeScore + commentScore));
  }

  // 카테고리 트렌드 점수
  calculateCategoryTrendScore(categoryStats) {
    const viewScore = Math.min(60, (categoryStats.avg_view_count / 100000) * 60);
    const challengeScore = Math.min(40, (categoryStats.total_challenges / 100) * 40);

    return Math.min(100, Math.round(viewScore + challengeScore));
  }

  // 일별 트렌드 점수
  calculateDailyTrendScore(dailyTrend) {
    const viewScore = Math.min(70, (dailyTrend.avg_view_count / 100000) * 70);
    const challengeScore = Math.min(30, (dailyTrend.challenges_count / 50) * 30);

    return Math.min(100, Math.round(viewScore + challengeScore));
  }

  // 플랫폼 비교 포맷팅
  formatPlatformComparison(platformStats) {
    const comparison = {};

    platformStats.forEach(ps => {
      comparison[ps.platform] = {
        total_challenges: ps.total_challenges,
        avg_view_count: Math.round(ps.avg_view_count || 0),
        total_views: ps.total_views || 0,
        trend_score: this.calculatePlatformTrendScore(ps)
      };
    });

    return comparison;
  }

  // 플랫폼 트렌드 점수
  calculatePlatformTrendScore(platformStats) {
    const viewScore = Math.min(60, (platformStats.avg_view_count / 200000) * 60);
    const challengeScore = Math.min(40, (platformStats.total_challenges / 200) * 40);

    return Math.min(100, Math.round(viewScore + challengeScore));
  }

  // 저장된 트렌드 포맷팅
  formatSavedTrends(savedTrends, date) {
    // 저장된 데이터 파싱 및 반환
    return {
      trend_date: date,
      saved_data: savedTrends.map(st => ({
        category_id: st.category_id,
        top_10_challenges: JSON.parse(st.top_10_challenges || '[]'),
        top_tags: JSON.parse(st.top_tags || '[]'),
        avg_view_count: st.avg_view_count,
        total_challenges_count: st.total_challenges_count,
        trend_score: st.trend_score
      }))
    };
  }
}

module.exports = new TrendService();
