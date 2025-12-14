// src/routes/recommendationRoutes.js
const express = require('express');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

// GET /api/v1/recommendations/daily-picks - 일일 추천 챌린지
router.get('/daily-picks', recommendationController.getDailyPicks);

// GET /api/v1/recommendations - 트렌드 기반 추천
router.get('/', recommendationController.getRecommendations);

module.exports = router;
