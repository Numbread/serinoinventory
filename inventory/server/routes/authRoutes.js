// authRoutes.js: Route definitions for authentication
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /auth/login (or /api/auth/login)
router.post('/login', authController.login);

module.exports = router;
