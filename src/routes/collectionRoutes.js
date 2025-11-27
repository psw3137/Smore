// src/routes/collectionRoutes.js
const express = require('express');
const collectionController = require('../controllers/collectionController');

const router = express.Router();

// GET /api/v1/collection-logs
router.get('/', collectionController.getCollectionLogs);

module.exports = router;
