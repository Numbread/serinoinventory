// stockRoutes.js: Route definitions for stock in / stock out movements
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// GET /stock - List all stock movement records
router.get('/', stockController.getStockMovements);

// POST /stock - Record a new stock movement (IN or OUT) and adjust product inventory
router.post('/', stockController.createStockMovement);

module.exports = router;
