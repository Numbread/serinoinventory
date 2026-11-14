// dashboardRoutes.js: Route definitions for dashboard metrics and overview
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /dashboard - Fetch summary counts, low stock items, and recent movements
router.get('/', dashboardController.getDashboardSummary);

module.exports = router;
