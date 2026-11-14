// authController.js: Handles user authentication using Supabase
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

/**
 * Handles user login.
 * Validates credentials against the Supabase users table and returns a signed JWT.
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Query user by username from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.trim())
      .limit(1);

    if (error) {
      console.error('Supabase query error during login:', error);
      return res.status(500).json({ message: 'Database query error during login.' });
    }

    // Check if user exists
    if (!users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const user = users[0];

    // Compare supplied password with stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // Generate JWT token valid for 24 hours
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Return token and safe user details
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
}

module.exports = {
  login
};
