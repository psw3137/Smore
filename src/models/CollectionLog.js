// src/models/CollectionLog.js
const pool = require('../config/database');

class CollectionLog {
  // 수집 로그 조회
  async getLogs(filters, limit, offset) {
    const whereConditions = [];
    const params = [];

    // 플랫폼 필터
    if (filters.platform) {
      whereConditions.push('platform = ?');
      params.push(filters.platform);
    }

    // 상태 필터
    if (filters.status) {
      whereConditions.push('status = ?');
      params.push(filters.status);
    }

    // 기간 필터
    if (filters.days) {
      whereConditions.push('DATE(collection_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)');
      params.push(filters.days);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const sql = `
      SELECT
        log_id,
        platform,
        collection_type,
        collection_date,
        total_collected,
        total_new,
        total_updated,
        total_duplicate,
        status,
        error_message,
        execution_time_seconds,
        created_at
      FROM collection_logs
      ${whereClause}
      ORDER BY collection_date DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // 수집 로그 개수
  async countLogs(filters) {
    const whereConditions = [];
    const params = [];

    if (filters.platform) {
      whereConditions.push('platform = ?');
      params.push(filters.platform);
    }

    if (filters.status) {
      whereConditions.push('status = ?');
      params.push(filters.status);
    }

    if (filters.days) {
      whereConditions.push('DATE(collection_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)');
      params.push(filters.days);
    }

    const whereClause = whereConditions.length > 0
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    const sql = `
      SELECT COUNT(*) as count
      FROM collection_logs
      ${whereClause}
    `;

    const [[{ count }]] = await pool.query(sql, params);
    return count;
  }

  // 수집 통계 요약
  async getSummary(days = 7) {
    const sql = `
      SELECT
        COUNT(DISTINCT platform) as total_platforms,
        SUM(total_collected) as total_collected_7days,
        SUM(total_new) as total_new_7days,
        AVG(CASE WHEN status = 'success' THEN 100 ELSE 0 END) as success_rate_7days
      FROM collection_logs
      WHERE DATE(collection_date) >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    `;

    const [[summary]] = await pool.query(sql, [days]);
    return summary;
  }
}

module.exports = new CollectionLog();
