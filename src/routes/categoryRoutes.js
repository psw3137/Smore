// src/routes/categoryRoutes.js
const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// GET /api/v1/categories
router.get('/', categoryController.getCategories);

// GET /api/v1/categories/:categoryId
router.get('/:categoryId', categoryController.getCategoryById);

module.exports = router;
