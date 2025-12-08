// src/routes/challengeRoutes.js
const express = require('express');
const challengeController = require('../controllers/challengeController');

const router = express.Router();

// GET /api/v1/challenges
router.get('/', challengeController.getChallenges);

// GET /api/v1/challenges/category/:categoryId (더 구체적인 라우트를 먼저 정의)
router.get('/category/:categoryId', challengeController.getChallengesByCategory);

// GET /api/v1/challenges/:challengeId (일반적인 라우트는 나중에 정의)
router.get('/:challengeId', challengeController.getChallengeById);

module.exports = router;
