// Login.jsx: User authentication page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

/**
 * Login page component.
 * Allows users to authenticate with username and password, receives JWT token,
 * saves it into localStorage, and redirects to dashboard upon success.
 */
function Login() {
  const navigate = useNavigate();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  /**
   * Helper button for school defense: Auto-fills standard admin credentials instantly.
   */
  const handleAutoFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setErrorMessage('');
  };

  /**
   * Submits login credentials to Express backend API (/auth/login).
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password
      });

      // Store JWT token and user info in browser localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Cannot connect to server. Please check backend status.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand-header">
          <div className="login-logo-circle">📦</div>
          <h1 className="login-title">InventoryMS</h1>
          <p className="login-subtitle">Cloud Inventory & Stock Management System</p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" htmlFor="password" style={{ margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard ➔'}
          </button>
        </form>

        <div className="login-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            🎓 School Defense Demo Credentials
          </div>
          <div className="login-demo-box">
            <div className="demo-credentials-text">
              <strong>User:</strong> admin &nbsp;|&nbsp; <strong>Pass:</strong> admin123
            </div>
            <button
              type="button"
              onClick={handleAutoFillDemo}
              className="btn btn-secondary btn-sm"
              title="Click to automatically fill credentials"
            >
              ⚡ Auto-Fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
