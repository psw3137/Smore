// src/routes/index.js
const express = require('express');
const searchRoutes = require('./searchRoutes');
const challengeRoutes = require('./challengeRoutes');
const trendRoutes = require('./trendRoutes');
const collectionRoutes = require('./collectionRoutes');
const recommendationRoutes = require('./recommendationRoutes');

const router = express.Router();

// API 라우터 마운트
router.use('/search', searchRoutes);
router.use('/challenges', challengeRoutes);
router.use('/trends', trendRoutes);
router.use('/collection-logs', collectionRoutes);
router.use('/recommendations', recommendationRoutes);

module.exports = router;
