// src/models/Trend.js
const pool = require('../config/database');

class Trend {
  // 최근 트렌드 데이터 조회
  async getRecentTrends(days = 7) {
    const sql = `
      SELECT
        c.challenge_id,
        c.title,
        c.platform,
        c.view_count,
        c.like_count,
        c.comment_count,
        c.upload_date,
        cat.category_id,
        cat.category_name,
        cat.category_code
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE c.is_active = TRUE
        AND DATE(c.upload_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY c.view_count DESC, c.like_count DESC
      LIMIT 10
    `;

    const [rows] = await pool.query(sql, [days]);
    return rows;
  }

  // 카테고리별 통계
  async getCategoryStatistics(days = 7) {
    const sql = `
      SELECT
        cat.category_id,
        cat.category_name,
        cat.category_code,
        COUNT(c.challenge_id) as total_challenges,
        AVG(c.view_count) as avg_view_count,
        AVG(c.like_count) as avg_like_count,
        SUM(c.view_count) as total_views
      FROM categories cat
      LEFT JOIN challenges c ON cat.category_id = c.primary_category_id
        AND c.is_active = TRUE
        AND DATE(c.upload_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      WHERE cat.is_active = TRUE
      GROUP BY cat.category_id, cat.category_name, cat.category_code
      HAVING total_challenges > 0
      ORDER BY total_views DESC
    `;

    const [rows] = await pool.query(sql, [days]);
    return rows;
  }

  // 플랫폼별 통계
  async getPlatformComparison(days = 7) {
    const sql = `
      SELECT
        c.platform,
        COUNT(c.challenge_id) as total_challenges,
        AVG(c.view_count) as avg_view_count,
        SUM(c.view_count) as total_views
      FROM challenges c
      WHERE c.is_active = TRUE
        AND DATE(c.upload_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY c.platform
    `;

    const [rows] = await pool.query(sql, [days]);
    return rows;
  }

  // 카테고리별 트렌드
  async getCategoryTrend(categoryId, days = 7) {
    const sql = `
      SELECT
        DATE(c.upload_date) as date,
        COUNT(c.challenge_id) as challenges_count,
        AVG(c.view_count) as avg_view_count,
        SUM(c.view_count) as total_views
      FROM challenges c
      WHERE c.is_active = TRUE
        AND c.primary_category_id = ?
        AND DATE(c.upload_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(c.upload_date)
      ORDER BY date DESC
    `;

    const [rows] = await pool.query(sql, [categoryId, days]);
    return rows;
  }

  // 카테고리별 상위 챌린지
  async getTopChallengesByCategory(categoryId, days = 7, limit = 10) {
    const sql = `
      SELECT
        c.challenge_id,
        c.title,
        c.platform,
        c.view_count,
        c.like_count,
        c.thumbnail_url,
        c.upload_date
      FROM challenges c
      WHERE c.is_active = TRUE
        AND c.primary_category_id = ?
        AND DATE(c.upload_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      ORDER BY c.view_count DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(sql, [categoryId, days, limit]);
    return rows;
  }

  // 일별 트렌드 저장
  async saveDailyTrend(trendData) {
    const sql = `
      INSERT INTO trends_daily (
        trend_date,
        category_id,
        top_10_challenges,
        top_tags,
        avg_view_count,
        total_challenges_count,
        total_views,
        trend_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        top_10_challenges = VALUES(top_10_challenges),
        top_tags = VALUES(top_tags),
        avg_view_count = VALUES(avg_view_count),
        total_challenges_count = VALUES(total_challenges_count),
        total_views = VALUES(total_views),
        trend_score = VALUES(trend_score)
    `;

    const params = [
      trendData.trend_date,
      trendData.category_id,
      JSON.stringify(trendData.top_10_challenges),
      JSON.stringify(trendData.top_tags),
      trendData.avg_view_count,
      trendData.total_challenges_count,
      trendData.total_views,
      trendData.trend_score
    ];

    const [result] = await pool.query(sql, params);
    return result;
  }

  // 일별 트렌드 조회
  async getDailyTrend(date) {
    const sql = `
      SELECT
        trend_id,
        trend_date,
        category_id,
        top_10_challenges,
        top_tags,
        avg_view_count,
        total_challenges_count,
        total_views,
        trend_score,
        compared_to_previous_day,
        compared_to_previous_week
      FROM trends_daily
      WHERE trend_date = ?
    `;

    const [rows] = await pool.query(sql, [date]);
    return rows;
  }
}

module.exports = new Trend();
