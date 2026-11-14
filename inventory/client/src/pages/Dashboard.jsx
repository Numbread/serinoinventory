// Dashboard.jsx: Overview page showing key inventory metrics, low-stock alerts, and recent movements
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

/**
 * Dashboard page component.
 * Fetches and displays summary metrics: total products, total categories,
 * low-stock items requiring reordering, and the 5 most recent stock movements.
 */
function Dashboard() {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalLowStock: 0,
    lowStockProducts: [],
    recentMovements: []
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Retrieve current user name for the greeting
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  /**
   * Fetches dashboard data from the backend API (/dashboard).
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await api.get('/dashboard');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      setErrorMessage('Failed to load dashboard data. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard metrics on initial component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Formats ISO timestamp to human-readable date and time.
   */
  const formatDateTime = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-header-title">Dashboard Overview</h1>
            <p className="page-subtitle">Loading inventory metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Hero Banner */}
      <div className="welcome-hero">
        <div className="welcome-hero-content">
          <h2>Welcome back, {user ? user.username : 'Admin'}! 👋</h2>
          <p>Here is your current stock performance, replenishment alerts, and recent warehouse activities.</p>
        </div>
        <div className="welcome-hero-pill">
          <span className="pulse-dot"></span>
          <span>Supabase Cloud Connected</span>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Modern Metric Cards Grid */}
      <div className="dashboard-grid">
        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Total Products</span>
            <div className="metric-icon-box">📦</div>
          </div>
          <div className="metric-number">{summary.totalProducts}</div>
          <div className="metric-footer">
            <span style={{ color: 'var(--success-green)', fontWeight: 600 }}>Active items</span> in catalog
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Categories</span>
            <div className="metric-icon-box" style={{ background: '#F3E8FF', color: '#7E22CE' }}>🏷️</div>
          </div>
          <div className="metric-number">{summary.totalCategories}</div>
          <div className="metric-footer">
            <span>Product groupings</span>
          </div>
        </div>

        <div className={`metric-card ${summary.totalLowStock > 0 ? 'alert-card' : ''}`}>
          <div className="metric-top">
            <span className="metric-label">Low Stock Alerts</span>
            <div className="metric-icon-box">⚠️</div>
          </div>
          <div className="metric-number">{summary.totalLowStock}</div>
          <div className="metric-footer">
            {summary.totalLowStock > 0 ? (
              <span style={{ color: 'var(--danger-red)', fontWeight: 600 }}>Action needed: Items at or below threshold</span>
            ) : (
              <span style={{ color: 'var(--success-green)', fontWeight: 600 }}>All products healthy</span>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Items Section */}
      <div className="card">
        <div className="card-title">
          <span>⚠️ Low Stock Items (Reorder Required)</span>
          <Link to="/products" className="btn btn-secondary btn-sm">
            View All Products ➔
          </Link>
        </div>

        {summary.lowStockProducts.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
            <strong style={{ color: 'var(--success-green)' }}>All inventory levels are healthy!</strong>
            <p style={{ marginTop: '4px' }}>No items currently require replenishment.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Reorder Threshold</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.lowStockProducts.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                    </td>
                    <td>{item.category_name}</td>
                    <td>
                      <span style={{ color: 'var(--danger-red)', fontWeight: 700, fontSize: '1rem' }}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td>{item.reorder_level} units</td>
                    <td>
                      <span className="badge badge-low">
                        <span className="badge-dot"></span>
                        Reorder Alert
                      </span>
                    </td>
                    <td>
                      <Link to="/stock" className="btn btn-primary btn-sm">
                        + Restock
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Stock Movements Section */}
      <div className="card">
        <div className="card-title">
          <span>🕒 5 Most Recent Stock Movements</span>
          <Link to="/stock" className="btn btn-secondary btn-sm">
            + Record Movement
          </Link>
        </div>

        {summary.recentMovements.length === 0 ? (
          <div className="empty-state">No stock movements recorded yet.</div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product Name</th>
                  <th>Movement Type</th>
                  <th>Quantity Moved</th>
                  <th>Handled By</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDateTime(movement.created_at)}</td>
                    <td><strong>{movement.product_name}</strong></td>
                    <td>
                      <span className={`badge ${movement.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                        {movement.type === 'IN' ? '📥 Stock IN' : '📤 Stock OUT'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: movement.type === 'IN' ? 'var(--primary-blue)' : 'var(--warning-amber)' }}>
                        {movement.type === 'IN' ? `+${movement.quantity}` : `-${movement.quantity}`} units
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--navy-deep)', fontWeight: 500 }}>👤 {movement.user_name}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
