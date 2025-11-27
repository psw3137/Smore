// src/routes/recommendationRoutes.js
const express = require('express');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();

// GET /api/v1/recommendations
router.get('/', recommendationController.getRecommendations);

module.exports = router;
