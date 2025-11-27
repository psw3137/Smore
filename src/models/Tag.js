// src/models/Tag.js
const pool = require('../config/database');

class Tag {
  // 트렌딩 태그 조회
  async getTrendingTags(limit, days) {
    const sql = `
      SELECT
        t.tag_name,
        COUNT(ct.challenge_tag_id) AS usage_count
      FROM tags t
      LEFT JOIN challenge_tags ct ON t.tag_id = ct.tag_id
      LEFT JOIN challenges c ON ct.challenge_id = c.challenge_id
      WHERE c.is_active = TRUE
        AND DATE(c.collected_at) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY t.tag_id, t.tag_name
      ORDER BY usage_count DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(sql, [days, limit]);
    return rows;
  }

  // 카테고리별 인기 태그
  async getTopTagsByCategory(categoryId, limit = 10) {
    const sql = `
      SELECT
        t.tag_name,
        COUNT(ct.challenge_tag_id) AS count
      FROM tags t
      JOIN challenge_tags ct ON t.tag_id = ct.tag_id
      JOIN challenges c ON ct.challenge_id = c.challenge_id
      WHERE c.primary_category_id = ?
        AND c.is_active = TRUE
      GROUP BY t.tag_id, t.tag_name
      ORDER BY count DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(sql, [categoryId, limit]);
    return rows;
  }
}

module.exports = new Tag();
