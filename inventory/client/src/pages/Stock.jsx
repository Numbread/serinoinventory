// Stock.jsx: Manage Stock IN / Stock OUT operations and view movement logs
import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Stock page component.
 * Allows users to record inventory movements (Stock IN / Stock OUT),
 * automatically prevents Stock OUT if available stock is insufficient,
 * and displays an audit history table of past transactions.
 */
function Stock() {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for new stock movement
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('IN');
  const [quantity, setQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   * Fetches product list to populate the product dropdown and show current stock.
   */
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
      if (response.data.length > 0 && !selectedProductId) {
        setSelectedProductId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  /**
   * Fetches the full history of stock movements from /stock.
   */
  const fetchMovements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stock');
      setMovements(response.data);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      setErrorMessage('Failed to load stock movements history.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  /**
   * Finds the currently selected product object from the products state.
   */
  const getSelectedProduct = () => {
    return products.find((p) => p.id === Number(selectedProductId));
  };

  /**
   * Submits a new stock movement to POST /stock.
   * Validates that quantity is positive and that Stock OUT does not exceed current stock.
   */
  const handleRecordMovement = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedProductId) {
      setErrorMessage('Please select a product.');
      return;
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      setErrorMessage('Please enter a valid positive quantity greater than 0.');
      return;
    }

    const currentProd = getSelectedProduct();

    // Client-side pre-check for Stock OUT
    if (movementType === 'OUT' && currentProd && currentProd.quantity < numQuantity) {
      setErrorMessage(
        `Cannot stock out ${numQuantity} units! Current available inventory is only ${currentProd.quantity}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        product_id: Number(selectedProductId),
        type: movementType,
        quantity: numQuantity
      };

      const response = await api.post('/stock', payload);
      setSuccessMessage(response.data.message || 'Stock movement recorded successfully!');

      // Reset form quantity
      setQuantity('');

      // Refresh both product list (with updated stock) and movement log
      await fetchProducts();
      await fetchMovements();
    } catch (error) {
      console.error('Error recording movement:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to record stock movement.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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

  const selectedProduct = getSelectedProduct();
  const numQuantity = parseInt(quantity, 10) || 0;
  
  // Calculate projected new balance for live preview
  let projectedStock = null;
  let isInsufficient = false;
  if (selectedProduct) {
    if (movementType === 'IN') {
      projectedStock = selectedProduct.quantity + numQuantity;
    } else {
      projectedStock = selectedProduct.quantity - numQuantity;
      if (projectedStock < 0) {
        isInsufficient = true;
      }
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            <span>⚡</span>
            <span>Stock In / Stock Out</span>
          </h1>
          <p className="page-subtitle">Perform warehouse adjustments and review transaction audit logs</p>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Movement Recording Form Card */}
      <div className="card">
        <h3 className="card-title">
          <span>📝 Record Inventory Movement</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            Adjusts on-hand quantities immediately
          </span>
        </h3>

        <form onSubmit={handleRecordMovement}>
          {/* Visual Movement Type Selector */}
          <label className="form-label">Select Operation Type *</label>
          <div className="stock-type-selector">
            <button
              type="button"
              onClick={() => setMovementType('IN')}
              className={`type-toggle-btn ${movementType === 'IN' ? 'active-in' : ''}`}
            >
              <span style={{ fontSize: '1.4rem' }}>📥</span>
              <span>Stock IN (Receive Items)</span>
              <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Increases available inventory</small>
            </button>

            <button
              type="button"
              onClick={() => setMovementType('OUT')}
              className={`type-toggle-btn ${movementType === 'OUT' ? 'active-out' : ''}`}
            >
              <span style={{ fontSize: '1.4rem' }}>📤</span>
              <span>Stock OUT (Dispatch Items)</span>
              <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Reduces available inventory</small>
            </button>
          </div>

          <div className="form-row">
            {/* Select Product */}
            <div className="form-group">
              <label className="form-label" htmlFor="stock-product">
                Target Product *
              </label>
              <select
                id="stock-product"
                className="form-select"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select a Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Available: {p.quantity} units)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label" htmlFor="stock-qty">
                Quantity to Move *
              </label>
              <input
                id="stock-qty"
                type="number"
                min="1"
                className="form-input"
                placeholder="Enter amount (e.g. 5)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Live Stock Calculation Preview Box (Big hit for defense panel!) */}
          {selectedProduct && numQuantity > 0 && (
            <div className="stock-preview-box" style={{ borderColor: isInsufficient ? 'var(--danger-red)' : 'var(--border-color)' }}>
              <div>
                <strong>{selectedProduct.name}</strong>: Current stock is <strong>{selectedProduct.quantity} units</strong>.
              </div>
              <div>
                {movementType === 'IN' ? (
                  <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>
                    + {numQuantity} IN ➔ New Balance: {projectedStock} units
                  </span>
                ) : isInsufficient ? (
                  <span style={{ color: 'var(--danger-red)', fontWeight: 700 }}>
                    ⚠️ Insufficient stock! Requested -{numQuantity}, but only {selectedProduct.quantity} available.
                  </span>
                ) : (
                  <span style={{ color: 'var(--warning-amber)', fontWeight: 700 }}>
                    - {numQuantity} OUT ➔ New Balance: {projectedStock} units
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || products.length === 0 || isInsufficient}
            >
              {submitting ? 'Processing...' : `Confirm Stock ${movementType} ➔`}
            </button>
          </div>
        </form>
      </div>

      {/* Movement History Table Card */}
      <div className="card">
        <h3 className="card-title">
          <span>📜 Transaction Movement History</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {movements.length} total operations logged
          </span>
        </h3>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Log ID</th>
                <th>Timestamp</th>
                <th>Product Name</th>
                <th>Movement Type</th>
                <th>Units Moved</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    {loading ? 'Loading movements...' : 'No stock movements recorded yet.'}
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>#{m.id}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{formatDateTime(m.created_at)}</td>
                    <td><strong>{m.product_name}</strong></td>
                    <td>
                      <span className={`badge ${m.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                        {m.type === 'IN' ? '📥 Stock IN' : '📤 Stock OUT'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: m.type === 'IN' ? 'var(--primary-blue)' : 'var(--warning-amber)' }}>
                        {m.type === 'IN' ? `+${m.quantity}` : `-${m.quantity}`}
                      </strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--navy-deep)', fontWeight: 500 }}>👤 {m.user_name}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Stock;
