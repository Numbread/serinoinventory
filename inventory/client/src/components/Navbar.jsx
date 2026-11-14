// Navbar.jsx: Top navigation bar with active links and logout function
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

/**
 * Navbar component displayed across protected pages.
 * Highlights current active route and provides user info + logout.
 */
function Navbar() {
  const navigate = useNavigate();

  // Retrieve logged-in user profile from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  /**
   * Handles user logout:
   * Clears saved JWT token and user info, then redirects to login page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        <div className="brand-icon-box">📦</div>
        <div>
          <span>Inventory</span>MS
        </div>
      </NavLink>

      <div className="navbar-links">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
        >
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
        >
          <span>📦</span>
          <span>Products</span>
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
        >
          <span>🏷️</span>
          <span>Categories</span>
        </NavLink>
        <NavLink
          to="/stock"
          className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
        >
          <span>⚡</span>
          <span>Stock Movement</span>
        </NavLink>
      </div>

      <div className="navbar-user">
        {user && (
          <div className="user-profile-badge">
            <div className="avatar-circle">{getInitials(user.username)}</div>
            <div className="user-info-text">
              <span className="user-username">{user.username}</span>
              <span className="role-tag">{user.role}</span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out of application">
          <span>Logout</span> ➔
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
