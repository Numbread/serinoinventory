// server.js: Main entry point for the Express backend server
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

// Import authentication middleware
const verifyToken = require('./middleware/authMiddleware');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const stockRoutes = require('./routes/stockRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Authentication routes (public)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);

// Protected routes (requires valid JWT token)
app.use('/products', verifyToken, productRoutes);
app.use('/api/products', verifyToken, productRoutes);

app.use('/categories', verifyToken, categoryRoutes);
app.use('/api/categories', verifyToken, categoryRoutes);

app.use('/stock', verifyToken, stockRoutes);
app.use('/api/stock', verifyToken, stockRoutes);

app.use('/dashboard', verifyToken, dashboardRoutes);
app.use('/api/dashboard', verifyToken, dashboardRoutes);

// Check if frontend production build exists (in client/dist)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  // Serve compiled React frontend assets
  app.use(express.static(clientDistPath));

  // Client-side SPA routing: all non-API paths serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Fallback API health check when running in decoupled dev mode
  app.get('/', (req, res) => {
    res.json({ message: 'Inventory Management System API is running.' });
  });

  // Catch-all 404 handler for unknown endpoints
  app.use((req, res) => {
    res.status(404).json({ message: 'Requested API endpoint not found.' });
  });
}

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error.' });
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
});
