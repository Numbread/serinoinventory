// Products.jsx: Complete Product management (List, Add, Edit, Delete, Search)
import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Products page component.
 * Allows managing products in the inventory with live search by product name,
 * dynamic category selection, price and stock tracking, and reorder alerts.
 */
function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    quantity: '',
    reorder_level: 5
  });

  /**
   * Fetches the list of products from the API, supporting an optional search filter.
   */
  const fetchProducts = async (search = '') => {
    try {
      setLoading(true);
      const url = search ? `/products?search=${encodeURIComponent(search)}` : '/products';
      const response = await api.get(url);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setErrorMessage('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches all categories for the product form category dropdown.
   */
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
      if (response.data.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /**
   * Handles live search input changes and fetches filtered results.
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchProducts(value);
  };

  /**
   * Opens modal for adding a new product with clean initial form values.
   */
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      price: '',
      quantity: '',
      reorder_level: 5
    });
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  /**
   * Opens modal for editing an existing product, populating form with product details.
   */
  const handleOpenEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      price: product.price,
      quantity: product.quantity,
      reorder_level: product.reorder_level
    });
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  /**
   * Closes the Add/Edit modal.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  /**
   * Submits product form (either creates a new product or updates an existing one).
   */
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.category_id) {
      setErrorMessage('Please provide a product name and select a category.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
        setSuccessMessage('Product updated successfully!');
      } else {
        await api.post('/products', formData);
        setSuccessMessage('Product added successfully!');
      }

      handleCloseModal();
      fetchProducts(searchQuery);
    } catch (error) {
      console.error('Error saving product:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to save product.');
      }
    }
  };

  /**
   * Deletes a product after asking the user for confirmation.
   */
  const handleDeleteProduct = async (id, name) => {
    const confirmed = window.confirm(`Are you sure you want to delete product "${name}"?`);
    if (!confirmed) return;

    try {
      setErrorMessage('');
      setSuccessMessage('');
      await api.delete(`/products/${id}`);
      setSuccessMessage(`Product "${name}" was deleted successfully.`);
      fetchProducts(searchQuery);
    } catch (error) {
      console.error('Error deleting product:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to delete product.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            <span>📦</span>
            <span>Products Inventory</span>
          </h1>
          <p className="page-subtitle">Manage items, stock thresholds, and categories</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <span>+ Add New Product</span>
        </button>
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

      <div className="card">
        {/* Search Bar Container */}
        <div className="search-container">
          <div className="search-bar">
            <span className="search-bar-icon">🔍</span>
            <input
              type="text"
              className="form-input"
              placeholder="Search products by name..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchProducts('');
                }}
                className="btn btn-secondary btn-sm"
              >
                Clear
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total <strong>{products.length}</strong> items in catalog
          </div>
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Qty</th>
                <th>Reorder Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    {loading ? 'Loading catalog items...' : 'No products found.'}
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLowStock = product.quantity <= product.reorder_level;
                  return (
                    <tr key={product.id}>
                      <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>#{product.id}</td>
                      <td>
                        <strong style={{ color: 'var(--navy-deep)' }}>{product.name}</strong>
                      </td>
                      <td>
                        <span style={{ background: '#F1F5F9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--text-body)', fontWeight: 500 }}>
                          {product.category_name}
                        </span>
                      </td>
                      <td>
                        <strong>${parseFloat(product.price).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: isLowStock ? 'var(--danger-red)' : 'var(--text-main)' }}>
                          {product.quantity}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginLeft: '4px' }}>units</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{product.reorder_level} units</td>
                      <td>
                        {isLowStock ? (
                          <span className="badge badge-low">
                            <span className="badge-dot"></span>
                            Low Stock
                          </span>
                        ) : (
                          <span className="badge badge-ok">
                            <span className="badge-dot"></span>
                            In Stock
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Product"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="btn btn-danger btn-sm"
                            title="Delete Product"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
              <button onClick={handleCloseModal} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name">Product Name *</label>
                <input
                  id="prod-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Ergonomic Keyboard"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-category">Category *</label>
                <select
                  id="prod-category"
                  className="form-select"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  required
                >
                  <option value="" disabled>-- Select a Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Unit Price ($) *</label>
                  <input
                    id="prod-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-qty">Current Quantity *</label>
                  <input
                    id="prod-qty"
                    type="number"
                    min="0"
                    className="form-input"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-reorder">Reorder Alert Level *</label>
                <input
                  id="prod-reorder"
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="5"
                  value={formData.reorder_level}
                  onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                  required
                />
                <small style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.8rem' }}>
                  A Low Stock warning automatically triggers on the Dashboard when available quantity reaches or falls below this threshold.
                </small>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
