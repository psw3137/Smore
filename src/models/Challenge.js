// src/models/Challenge.js
const pool = require('../config/database');

class Challenge {
  // 기본 검색
  async search(query, sortType, limit, offset) {
    const sortClause = this.getSortClause(sortType);

    const sql = `
      SELECT DISTINCT
        c.challenge_id,
        c.platform,
        c.video_id,
        c.title,
        c.description,
        c.thumbnail_url,
        c.channel_name,
        c.channel_url,
        c.video_url,
        c.view_count,
        c.like_count,
        c.comment_count,
        c.share_count,
        c.upload_date,
        c.duration_seconds,
        c.difficulty,
        c.collected_at,
        c.is_verified,
        cat.category_id,
        cat.category_name,
        cat.category_code,
        (
          CASE
            WHEN c.title LIKE CONCAT('%', ?, '%') THEN 50
            ELSE 0
          END +
          CASE
            WHEN c.description LIKE CONCAT('%', ?, '%') THEN 25
            ELSE 0
          END +
          CASE
            WHEN c.channel_name LIKE CONCAT('%', ?, '%') THEN 15
            ELSE 0
          END
        ) AS relevance_score
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      LEFT JOIN challenge_tags ct ON c.challenge_id = ct.challenge_id
      LEFT JOIN tags t ON ct.tag_id = t.tag_id
      WHERE c.is_active = TRUE
        AND (
          c.title LIKE CONCAT('%', ?, '%')
          OR c.description LIKE CONCAT('%', ?, '%')
          OR c.channel_name LIKE CONCAT('%', ?, '%')
          OR t.tag_name LIKE CONCAT('%', ?, '%')
        )
      ORDER BY ${sortClause}
      LIMIT ? OFFSET ?
    `;

    const params = [
      query, query, query,  // relevance_score 계산용
      query, query, query, query,  // WHERE 조건용
      limit, offset
    ];

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // 검색 결과 개수
  async countByQuery(query) {
    const sql = `
      SELECT COUNT(DISTINCT c.challenge_id) as count
      FROM challenges c
      LEFT JOIN challenge_tags ct ON c.challenge_id = ct.challenge_id
      LEFT JOIN tags t ON ct.tag_id = t.tag_id
      WHERE c.is_active = TRUE
        AND (
          c.title LIKE CONCAT('%', ?, '%')
          OR c.description LIKE CONCAT('%', ?, '%')
          OR c.channel_name LIKE CONCAT('%', ?, '%')
          OR t.tag_name LIKE CONCAT('%', ?, '%')
        )
    `;

    const [[{ count }]] = await pool.query(sql, [query, query, query, query]);
    return count;
  }

  // 고급 검색
  async searchAdvanced(filters, sortType, limit, offset) {
    const sortClause = this.getSortClause(sortType);
    const whereConditions = [];
    const params = [];

    whereConditions.push('c.is_active = TRUE');

    // 검색어 조건
    if (filters.q) {
      whereConditions.push(`(
        c.title LIKE CONCAT('%', ?, '%')
        OR c.description LIKE CONCAT('%', ?, '%')
        OR c.channel_name LIKE CONCAT('%', ?, '%')
      )`);
      params.push(filters.q, filters.q, filters.q);
    }

    // 카테고리 필터
    if (filters.category) {
      whereConditions.push('cat.category_code = ?');
      params.push(filters.category);
    }

    // 플랫폼 필터
    if (filters.platform && filters.platform !== 'all') {
      whereConditions.push('c.platform = ?');
      params.push(filters.platform);
    }

    // 난이도 필터
    if (filters.difficulty) {
      whereConditions.push('c.difficulty = ?');
      params.push(filters.difficulty);
    }

    // 날짜 필터
    if (filters.date_from) {
      whereConditions.push('DATE(c.upload_date) >= ?');
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereConditions.push('DATE(c.upload_date) <= ?');
      params.push(filters.date_to);
    }

    // 조회수 필터
    if (filters.min_views !== undefined && filters.min_views > 0) {
      whereConditions.push('c.view_count >= ?');
      params.push(filters.min_views);
    }

    const sql = `
      SELECT DISTINCT
        c.challenge_id,
        c.platform,
        c.video_id,
        c.title,
        c.description,
        c.thumbnail_url,
        c.channel_name,
        c.channel_url,
        c.video_url,
        c.view_count,
        c.like_count,
        c.comment_count,
        c.share_count,
        c.upload_date,
        c.duration_seconds,
        c.difficulty,
        c.collected_at,
        c.is_verified,
        cat.category_id,
        cat.category_name,
        cat.category_code
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortClause}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // 고급 검색 결과 개수
  async countByAdvancedQuery(filters) {
    const whereConditions = [];
    const params = [];

    whereConditions.push('c.is_active = TRUE');

    if (filters.q) {
      whereConditions.push(`(
        c.title LIKE CONCAT('%', ?, '%')
        OR c.description LIKE CONCAT('%', ?, '%')
        OR c.channel_name LIKE CONCAT('%', ?, '%')
      )`);
      params.push(filters.q, filters.q, filters.q);
    }

    if (filters.category) {
      whereConditions.push('cat.category_code = ?');
      params.push(filters.category);
    }

    if (filters.platform && filters.platform !== 'all') {
      whereConditions.push('c.platform = ?');
      params.push(filters.platform);
    }

    if (filters.difficulty) {
      whereConditions.push('c.difficulty = ?');
      params.push(filters.difficulty);
    }

    if (filters.date_from) {
      whereConditions.push('DATE(c.upload_date) >= ?');
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereConditions.push('DATE(c.upload_date) <= ?');
      params.push(filters.date_to);
    }

    if (filters.min_views !== undefined && filters.min_views > 0) {
      whereConditions.push('c.view_count >= ?');
      params.push(filters.min_views);
    }

    const sql = `
      SELECT COUNT(DISTINCT c.challenge_id) as count
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [[{ count }]] = await pool.query(sql, params);
    return count;
  }

  // 챌린지의 태그 조회
  async getTagsByChallengeId(challengeId) {
    const sql = `
      SELECT
        t.tag_id,
        t.tag_name,
        t.tag_normalized,
        ct.confidence
      FROM challenge_tags ct
      JOIN tags t ON ct.tag_id = t.tag_id
      WHERE ct.challenge_id = ?
      ORDER BY ct.confidence DESC
    `;

    const [rows] = await pool.query(sql, [challengeId]);
    return rows;
  }

  // 챌린지 목록 조회 (필터 포함)
  async getChallenges(filters, sortType, limit, offset) {
    const whereConditions = ['c.is_active = TRUE'];
    const params = [];

    // 카테고리 필터
    if (filters.category) {
      whereConditions.push('cat.category_code = ?');
      params.push(filters.category);
    }

    // 플랫폼 필터
    if (filters.platform && filters.platform !== 'all') {
      whereConditions.push('c.platform = ?');
      params.push(filters.platform);
    }

    // 난이도 필터
    if (filters.difficulty) {
      whereConditions.push('c.difficulty = ?');
      params.push(filters.difficulty);
    }

    const sortClause = this.getSortClause(sortType);

    const sql = `
      SELECT
        c.challenge_id,
        c.platform,
        c.video_id,
        c.title,
        c.description,
        c.thumbnail_url,
        c.channel_name,
        c.channel_url,
        c.video_url,
        c.view_count,
        c.like_count,
        c.comment_count,
        c.share_count,
        c.upload_date,
        c.duration_seconds,
        c.difficulty,
        c.collected_at,
        c.is_verified,
        cat.category_id,
        cat.category_name,
        cat.category_code
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortClause}
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  // 챌린지 개수 (필터 포함)
  async countChallenges(filters) {
    const whereConditions = ['c.is_active = TRUE'];
    const params = [];

    if (filters.category) {
      whereConditions.push('cat.category_code = ?');
      params.push(filters.category);
    }

    if (filters.platform && filters.platform !== 'all') {
      whereConditions.push('c.platform = ?');
      params.push(filters.platform);
    }

    if (filters.difficulty) {
      whereConditions.push('c.difficulty = ?');
      params.push(filters.difficulty);
    }

    const sql = `
      SELECT COUNT(*) as count
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE ${whereConditions.join(' AND ')}
    `;

    const [[{ count }]] = await pool.query(sql, params);
    return count;
  }

  // ID로 챌린지 상세 조회
  async getById(challengeId) {
    const sql = `
      SELECT
        c.challenge_id,
        c.platform,
        c.video_id,
        c.title,
        c.description,
        c.thumbnail_url,
        c.channel_name,
        c.channel_url,
        c.video_url,
        c.view_count,
        c.like_count,
        c.comment_count,
        c.share_count,
        c.upload_date,
        c.duration_seconds,
        c.difficulty,
        c.collected_at,
        c.is_verified,
        cat.category_id,
        cat.category_name,
        cat.category_code
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE c.challenge_id = ? AND c.is_active = TRUE
    `;

    const [rows] = await pool.query(sql, [challengeId]);
    return rows[0];
  }

  // 카테고리별 챌린지 조회
  async getByCategoryId(categoryId, sortType, limit, offset) {
    const sortClause = this.getSortClause(sortType);

    const sql = `
      SELECT
        c.challenge_id,
        c.platform,
        c.video_id,
        c.title,
        c.description,
        c.thumbnail_url,
        c.channel_name,
        c.channel_url,
        c.video_url,
        c.view_count,
        c.like_count,
        c.comment_count,
        c.share_count,
        c.upload_date,
        c.duration_seconds,
        c.difficulty,
        c.collected_at,
        c.is_verified,
        cat.category_id,
        cat.category_name,
        cat.category_code
      FROM challenges c
      LEFT JOIN categories cat ON c.primary_category_id = cat.category_id
      WHERE c.is_active = TRUE AND c.primary_category_id = ?
      ORDER BY ${sortClause}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [categoryId, limit, offset]);
    return rows;
  }

  // 카테고리별 챌린지 개수
  async countByCategory(categoryId) {
    const sql = `
      SELECT COUNT(*) as count
      FROM challenges c
      WHERE c.is_active = TRUE AND c.primary_category_id = ?
    `;

    const [[{ count }]] = await pool.query(sql, [categoryId]);
    return count;
  }

  // 관련 챌린지 조회 (같은 카테고리, 유사 태그)
  async getRelatedChallenges(challengeId, categoryId, limit = 5) {
    const sql = `
      SELECT DISTINCT
        c.challenge_id,
        c.title,
        c.thumbnail_url,
        c.view_count,
        c.like_count,
        c.platform
      FROM challenges c
      LEFT JOIN challenge_tags ct ON c.challenge_id = ct.challenge_id
      WHERE c.is_active = TRUE
        AND c.challenge_id != ?
        AND c.primary_category_id = ?
      GROUP BY c.challenge_id
      ORDER BY c.view_count DESC
      LIMIT ?
    `;

    const [rows] = await pool.query(sql, [challengeId, categoryId, limit]);
    return rows;
  }

  // 정렬 절 생성
  getSortClause(sortType) {
    const sortMappings = {
      'relevance': 'relevance_score DESC, c.upload_date DESC',
      'latest': 'c.upload_date DESC',
      'popular': 'c.view_count DESC, c.like_count DESC',
      'views': 'c.view_count DESC'
    };

    return sortMappings[sortType] || sortMappings['relevance'];
  }
}

module.exports = new Challenge();
