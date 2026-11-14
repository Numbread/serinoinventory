// authMiddleware.js: Protects routes by validating JSON Web Tokens (JWT)
const jwt = require('jsonwebtoken');

/**
 * Middleware function to verify JWT authentication token in request headers.
 * If valid, attaches the decoded user payload (id, username, role) to req.user.
 * If missing or invalid, returns an HTTP 401 Unauthorized response.
 */
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ message: 'Access denied. No authorization header provided.' });
    }

    // Header format is typically "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Access denied. Token format must be Bearer <token>.' });
    }

    const token = parts[1];

    // Verify token with our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store decoded user data for downstream controllers
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
  }
}

module.exports = verifyToken;
