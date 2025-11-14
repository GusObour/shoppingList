import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useLists } from '../hooks/useLists';
import { SkeletonListCard } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import './Lists.css';

const Lists = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lists, loading, addList, deleteList } = useLists();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [newList, setNewList] = useState({
    name: '',
    store: '',
    color: '#007aff',
    budget: '',
  });

  const handleCreateList = async (e) => {
    e.preventDefault();
    const result = await addList(newList);
    if (result.success) {
      setNewList({ name: '', store: '', color: '#007aff', budget: '' });
      setShowCreateModal(false);
    }
  };

  const handleDeleteClick = (list) => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const handleDeleteList = async () => {
    if (!listToDelete) return;

    setDeleteLoading(true);
    await deleteList(listToDelete._id);
    setDeleteLoading(false);
    setShowDeleteConfirm(false);
    setListToDelete(null);
  };

  return (
    <div className="lists-container">
      {/* Header */}
      <header className="lists-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🛒 My Lists</h1>
            <p>Welcome back, {user?.name || user?.email}!</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/settings" className="icon-btn" title="Settings">
              ⚙️
            </Link>
            <button className="icon-btn" onClick={logout} title="Logout">
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lists-main">
        {loading ? (
          <div className="lists-grid">
            {[...Array(6)].map((_, i) => (
              <SkeletonListCard key={i} />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No lists yet</h2>
            <p>Create your first shopping list to get started!</p>
            <button
              className="btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Create List
            </button>
          </div>
        ) : (
          <div className="lists-grid">
            {lists.map((list) => (
              <div
                key={list._id}
                className="list-card"
                style={{ borderLeftColor: list.color }}
              >
                <Link to={`/lists/${list._id}`} className="list-card-link">
                  <div className="list-card-header">
                    <h3>{list.name}</h3>
                    {list.store && <span className="list-store">📍 {list.store}</span>}
                  </div>
                  <div className="list-card-stats">
                    <span className="stat">
                      {list.itemCount || 0} items
                    </span>
                    {list.doneCount > 0 && (
                      <span className="stat-done">
                        {list.doneCount} completed
                      </span>
                    )}
                  </div>
                  <div className="list-card-date">
                    Updated {new Date(list.updatedAt).toLocaleDateString()}
                  </div>
                </Link>
                <button
                  className="list-delete-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteClick(list);
                  }}
                  title="Delete list"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setShowCreateModal(true)}
        title="Create new list"
      >
        ➕
      </button>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New List</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateList} className="modal-form">
              <div className="form-group">
                <label htmlFor="listName">List Name *</label>
                <input
                  type="text"
                  id="listName"
                  value={newList.name}
                  onChange={(e) =>
                    setNewList({ ...newList, name: e.target.value })
                  }
                  placeholder="e.g., Weekly Groceries"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="listStore">Store (optional)</label>
                <input
                  type="text"
                  id="listStore"
                  value={newList.store}
                  onChange={(e) =>
                    setNewList({ ...newList, store: e.target.value })
                  }
                  placeholder="e.g., Walmart"
                />
              </div>
              <div className="form-group">
                <label htmlFor="listColor">Color</label>
                <div className="color-picker">
                  <input
                    type="color"
                    id="listColor"
                    value={newList.color}
                    onChange={(e) =>
                      setNewList({ ...newList, color: e.target.value })
                    }
                  />
                  <span className="color-value">{newList.color}</span>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="listBudget">Budget (optional)</label>
                <div className="price-input-wrapper">
                  <span className="currency-symbol">$</span>
                  <input
                    type="number"
                    id="listBudget"
                    value={newList.budget || ''}
                    onChange={(e) =>
                      setNewList({ ...newList, budget: e.target.value })
                    }
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    style={{ paddingLeft: '28px' }}
                  />
                </div>
                <small className="form-hint">Set a spending limit for this list</small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setListToDelete(null);
        }}
        onConfirm={handleDeleteList}
        title="Delete List?"
        message={`Are you sure you want to delete "${listToDelete?.name}"? All items in this list will also be deleted. This action cannot be undone.`}
        confirmText="Delete List"
        cancelText="Cancel"
        confirmColor="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Lists;
