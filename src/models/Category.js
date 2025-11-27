// src/models/Category.js
const pool = require('../config/database');

class Category {
  // 모든 카테고리 조회
  async getAll() {
    const sql = `
      SELECT
        category_id,
        category_name,
        category_code,
        description,
        icon_url,
        display_order
      FROM categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC
    `;

    const [rows] = await pool.query(sql);
    return rows;
  }

  // ID로 카테고리 조회
  async getById(categoryId) {
    const sql = `
      SELECT
        category_id,
        category_name,
        category_code,
        description,
        icon_url,
        display_order
      FROM categories
      WHERE category_id = ? AND is_active = TRUE
    `;

    const [rows] = await pool.query(sql, [categoryId]);
    return rows[0];
  }

  // 코드로 카테고리 조회
  async getByCode(categoryCode) {
    const sql = `
      SELECT
        category_id,
        category_name,
        category_code,
        description,
        icon_url,
        display_order
      FROM categories
      WHERE category_code = ? AND is_active = TRUE
    `;

    const [rows] = await pool.query(sql, [categoryCode]);
    return rows[0];
  }
}

module.exports = new Category();
