// src/routes/searchRoutes.js
const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// GET /api/v1/search?q=...
router.get('/', searchController.search);

// GET /api/v1/search/advanced?q=...&category=...
router.get('/advanced', searchController.searchAdvanced);

// GET /api/v1/search/trending
router.get('/trending', searchController.getTrendingKeywords);

module.exports = router;
