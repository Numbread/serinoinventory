// Categories.jsx: Category management (List, Add, Edit, Delete)
import React, { useState, useEffect } from 'react';
import api from '../api';

/**
 * Categories page component.
 * Provides complete CRUD operations for product classification groups.
 */
function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  /**
   * Fetches the full list of categories from the backend (/categories).
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  // Load categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Opens the modal for adding a new category.
   */
  const handleOpenAddModal = () => {
    setEditingId(null);
    setCategoryName('');
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  /**
   * Opens the modal for editing an existing category.
   */
  const handleOpenEditModal = (category) => {
    setEditingId(category.id);
    setCategoryName(category.name);
    setErrorMessage('');
    setSuccessMessage('');
    setIsModalOpen(true);
  };

  /**
   * Closes the category modal and resets form values.
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setCategoryName('');
  };

  /**
   * Submits the category form to either create or update a category.
   */
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!categoryName.trim()) {
      setErrorMessage('Category name cannot be blank.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name: categoryName.trim() });
        setSuccessMessage('Category updated successfully!');
      } else {
        await api.post('/categories', { name: categoryName.trim() });
        setSuccessMessage('Category created successfully!');
      }

      handleCloseModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to save category.');
      }
    }
  };

  /**
   * Deletes a category after user confirmation.
   * If products are attached, backend will reject and an alert will be displayed.
   */
  const handleDeleteCategory = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete category "${name}"?\nNote: Categories with linked products cannot be deleted.`
    );
    if (!confirmed) return;

    try {
      setErrorMessage('');
      setSuccessMessage('');
      await api.delete(`/categories/${id}`);
      setSuccessMessage(`Category "${name}" was deleted successfully.`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to delete category.');
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-header-title">
            <span>🏷️</span>
            <span>Product Categories</span>
          </h1>
          <p className="page-subtitle">Organize and group your inventory items</p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <span>+ Add New Category</span>
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
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Category Name</th>
                <th style={{ width: '200px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-state">
                    {loading ? 'Loading categories...' : 'No categories found.'}
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ color: 'var(--text-light)', fontWeight: 600 }}>#{cat.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem' }}>📁</span>
                        <strong style={{ color: 'var(--navy-deep)' }}>{cat.name}</strong>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="btn btn-secondary btn-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="btn btn-danger btn-sm"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? '✏️ Edit Category' : '➕ Add New Category'}</h3>
              <button onClick={handleCloseModal} className="modal-close-btn">
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">
                  Category Name *
                </label>
                <input
                  id="cat-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Peripherals, Stationery, Raw Materials"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
