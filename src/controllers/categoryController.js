// src/controllers/categoryController.js
const db = require('../config/database');

/**
 * 모든 카테고리 조회
 * GET /api/v1/categories
 */
exports.getCategories = async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT
        c.category_id,
        c.category_name,
        c.category_code,
        c.description,
        c.icon_url,
        COUNT(ch.challenge_id) as challenge_count
      FROM categories c
      LEFT JOIN challenges ch ON c.category_id = ch.primary_category_id
      WHERE c.is_active = 1
      GROUP BY c.category_id, c.category_name, c.category_code, c.description, c.icon_url
      ORDER BY c.display_order, c.category_id
    `);

    return res.json({
      success: true,
      code: 'SUCCESS',
      message: '카테고리 목록을 조회했습니다',
      data: {
        categories
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('Error in getCategories:', error);
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: '카테고리 조회 중 오류가 발생했습니다',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });
  }
};

/**
 * 특정 카테고리 상세 조회
 * GET /api/v1/categories/:categoryId
 */
exports.getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [categories] = await db.execute(`
      SELECT
        c.category_id,
        c.category_name,
        c.category_code,
        c.description,
        c.icon_url,
        COUNT(ch.challenge_id) as challenge_count
      FROM categories c
      LEFT JOIN challenges ch ON c.category_id = ch.primary_category_id
      WHERE c.category_id = ?
      GROUP BY c.category_id, c.category_name, c.category_code, c.description, c.icon_url
    `, [categoryId]);

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: '카테고리를 찾을 수 없습니다',
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
      });
    }

    return res.json({
      success: true,
      code: 'SUCCESS',
      message: '카테고리를 조회했습니다',
      data: categories[0],
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });

  } catch (error) {
    console.error('Error in getCategoryById:', error);
    return res.status(500).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message: '카테고리 조회 중 오류가 발생했습니다',
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0'
      }
    });
  }
};
