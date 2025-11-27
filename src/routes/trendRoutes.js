// src/routes/trendRoutes.js
const express = require('express');
const trendController = require('../controllers/trendController');

const router = express.Router();

// GET /api/v1/trends
router.get('/', trendController.getTrends);

// GET /api/v1/trends/daily
router.get('/daily', trendController.getDailyTrend);

// GET /api/v1/trends/category/:categoryId
router.get('/category/:categoryId', trendController.getCategoryTrend);

module.exports = router;
