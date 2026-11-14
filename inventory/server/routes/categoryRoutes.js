// categoryRoutes.js: Route definitions for category management
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /categories - List all categories
router.get('/', categoryController.getAllCategories);

// POST /categories - Add new category
router.post('/', categoryController.createCategory);

// PUT /categories/:id - Update existing category
router.put('/:id', categoryController.updateCategory);

// DELETE /categories/:id - Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
