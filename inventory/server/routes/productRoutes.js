// productRoutes.js: Route definitions for product management
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /products - List all products (supports ?search= query)
router.get('/', productController.getAllProducts);

// POST /products - Create a new product
router.post('/', productController.createProduct);

// PUT /products/:id - Update product by ID
router.put('/:id', productController.updateProduct);

// DELETE /products/:id - Delete product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;
