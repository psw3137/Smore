// src/routes/challengeRoutes.js
const express = require('express');
const challengeController = require('../controllers/challengeController');

const router = express.Router();

// GET /api/v1/challenges
router.get('/', challengeController.getChallenges);

// GET /api/v1/challenges/:challengeId
router.get('/:challengeId', challengeController.getChallengeById);

// GET /api/v1/challenges/category/:categoryId
router.get('/category/:categoryId', challengeController.getChallengesByCategory);

module.exports = router;
