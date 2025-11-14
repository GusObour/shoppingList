import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useItems } from '../hooks/useItems';
import * as listsAPI from '../api/lists';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SkeletonItemRow } from '../components/Skeleton';
import ConfirmModal from '../components/ConfirmModal';
import './ListDetail.css';

// Sortable Item Component
const SortableItem = ({ item, onToggle, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`item-row ${item.isDone ? 'item-done' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        ⋮⋮
      </div>
      <input
        type="checkbox"
        checked={item.isDone}
        onChange={() => onToggle(item._id)}
        className="item-checkbox"
      />
      <div className="item-content">
        <div className="item-name">{item.name}</div>
        <div className="item-meta">
          {item.quantity && <span className="item-quantity">{item.quantity}</span>}
          {item.section && <span className="item-section">• {item.section}</span>}
        </div>
      </div>
      <button
        className="item-edit-btn"
        onClick={() => onEdit(item)}
        title="Edit item"
      >
        ✏️
      </button>
      <button
        className="item-delete-btn"
        onClick={() => onDelete(item)}
        title="Delete item"
      >
        🗑️
      </button>
    </div>
  );
};

const ListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading, addItem, updateItem, toggleItem, deleteItem, reorderItems } = useItems(id);

  const [list, setList] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [viewMode, setViewMode] = useState('priority'); // 'priority' or 'grouped'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [bulkText, setBulkText] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '1',
    store: '',
    section: '',
    notes: '',
  });

  // Configure drag-and-drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold before drag starts on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch list details
  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await listsAPI.getList(id);
        setList(data.list);
      } catch (error) {
        toast.error('Failed to load list');
        navigate('/');
      } finally {
        setLoadingList(false);
      }
    };

    fetchList();
  }, [id, navigate]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const result = await addItem({
      ...newItem,
      store: newItem.store || list?.store || '',
    });

    if (result.success) {
      setNewItem({ name: '', quantity: '1', store: '', section: '', notes: '' });
      setShowAddModal(false);
    }
  };

  const handleToggle = async (itemId) => {
    await toggleItem(itemId);
  };

  const handleDelete = async (itemId) => {
    setDeleteLoading(true);
    await deleteItem(itemId);
    setDeleteLoading(false);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    const result = await updateItem(editingItem._id, editingItem);

    if (result.success) {
      setShowEditModal(false);
      setEditingItem(null);
    }
  };

  const handleBulkAdd = async (e) => {
    e.preventDefault();
    
    // Split by newlines and filter empty lines
    const lines = bulkText.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      toast.error('Please enter at least one item');
      return;
    }

    let successCount = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        const result = await addItem({
          name: trimmed,
          quantity: '1',
          store: list?.store || '',
          section: '',
          notes: '',
        });
        if (result.success) successCount++;
      }
    }

    toast.success(`Added ${successCount} item${successCount !== 1 ? 's' : ''}!`);
    setBulkText('');
    setShowBulkModal(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = activeItems.findIndex((item) => item._id === active.id);
    const newIndex = activeItems.findIndex((item) => item._id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reorder the active items
    const reorderedActiveItems = arrayMove(activeItems, oldIndex, newIndex);
    
    // Combine with done items for the full optimistic update
    const reorderedAllItems = [...reorderedActiveItems, ...doneItems];

    // Send to backend with reordered active items and full items array
    await reorderItems(reorderedActiveItems, reorderedAllItems);
  };

  if (loadingList || loading) {
    return (
      <div className="list-detail-container">
        <header className="list-detail-header">
          <div className="back-btn">← Back</div>
          <div className="list-detail-title">
            <div style={{ width: '150px', height: '28px', background: 'var(--bg-hover)', borderRadius: 'var(--radius)', animation: 'shimmer 1.5s infinite' }}></div>
          </div>
        </header>
        <main className="list-detail-main">
          <div className="items-container">
            <div className="items-section">
              <h3 className="section-title">Loading...</h3>
              <div className="items-list">
                {[...Array(5)].map((_, i) => (
                  <SkeletonItemRow key={i} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!list) {
    return null;
  }

  // Separate done and not done items
  const activeItems = items.filter((item) => !item.isDone);
  const doneItems = items.filter((item) => item.isDone);

  // Group items by store and section for grouped view
  const groupedItems = items.reduce((acc, item) => {
    const store = item.store || list?.store || 'No Store';
    const section = item.section || 'Uncategorized';
    
    if (!acc[store]) acc[store] = {};
    if (!acc[store][section]) acc[store][section] = [];
    
    acc[store][section].push(item);
    return acc;
  }, {});

  return (
    <div className="list-detail-container">
      {/* Header */}
      <header className="list-detail-header">
        <Link to="/" className="back-btn">
          ← Back
        </Link>
        <div className="list-detail-title">
          <h1>{list.name}</h1>
          {list.store && <p className="list-store">📍 {list.store}</p>}
        </div>
        <div className="list-actions">
          <div className="view-toggle">
            <button
              className={viewMode === 'priority' ? 'active' : ''}
              onClick={() => setViewMode('priority')}
              title="Priority view"
            >
              📋
            </button>
            <button
              className={viewMode === 'grouped' ? 'active' : ''}
              onClick={() => setViewMode('grouped')}
              title="Store view"
            >
              🏪
            </button>
          </div>
          <button
            className="icon-btn"
            onClick={() => setShowBulkModal(true)}
            title="Bulk add items"
          >
            📝
          </button>
        </div>
        <div className="list-stats">
          <span>{items.length} items</span>
          {doneItems.length > 0 && (
            <span className="stat-done">
              {doneItems.length} done
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="list-detail-main">
        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2>No items yet</h2>
            <p>Add your first item to this list!</p>
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Item
            </button>
          </div>
        ) : viewMode === 'priority' ? (
          /* Priority View with Drag-and-Drop */
          <div className="items-container">
            {/* Active Items - Draggable */}
            {activeItems.length > 0 && (
              <div className="items-section">
                <h3 className="section-title">To Buy</h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={activeItems.map((item) => item._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="items-list">
                      {activeItems.map((item) => (
                        <SortableItem
                          key={item._id}
                          item={item}
                          onToggle={handleToggle}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Done Items */}
            {doneItems.length > 0 && (
              <div className="items-section">
                <h3 className="section-title">Completed ({doneItems.length})</h3>
                <div className="items-list">
                  {doneItems.map((item) => (
                    <div key={item._id} className="item-row item-done">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggle(item._id)}
                        className="item-checkbox"
                      />
                      <div className="item-content">
                        <div className="item-name">{item.name}</div>
                        <div className="item-meta">
                          {item.quantity && <span className="item-quantity">{item.quantity}</span>}
                          {item.section && <span className="item-section">• {item.section}</span>}
                        </div>
                      </div>
                      <button
                        className="item-edit-btn"
                        onClick={() => handleEdit(item)}
                        title="Edit item"
                      >
                        ✏️
                      </button>
                      <button
                        className="item-delete-btn"
                        onClick={() => handleDeleteClick(item)}
                        title="Delete item"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Grouped View - Store/Section Organization */
          <div className="items-container grouped">
            {Object.entries(groupedItems).map(([store, sections]) => (
              <div key={store} className="store-group">
                <h2 className="store-header">🏪 {store}</h2>
                {Object.entries(sections).map(([section, sectionItems]) => (
                  <div key={section} className="section-group">
                    <h3 className="section-title">{section}</h3>
                    <div className="items-list">
                      {sectionItems.map((item) => (
                        <div key={item._id} className={`item-row ${item.isDone ? 'item-done' : ''}`}>
                          <input
                            type="checkbox"
                            checked={item.isDone}
                            onChange={() => handleToggle(item._id)}
                            className="item-checkbox"
                          />
                          <div className="item-content">
                            <div className="item-name">{item.name}</div>
                            <div className="item-meta">
                              {item.quantity && <span className="item-quantity">{item.quantity}</span>}
                            </div>
                          </div>
                          <button
                            className="item-edit-btn"
                            onClick={() => handleEdit(item)}
                            title="Edit item"
                          >
                            ✏️
                          </button>
                          <button
                            className="item-delete-btn"
                            onClick={() => handleDeleteClick(item)}
                            title="Delete item"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        className="fab"
        onClick={() => setShowAddModal(true)}
        title="Add item"
      >
        ➕
      </button>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Item</h2>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddItem} className="modal-form">
              <div className="form-group">
                <label htmlFor="itemName">Item Name *</label>
                <input
                  type="text"
                  id="itemName"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  placeholder="e.g., Milk"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemQuantity">Quantity</label>
                <input
                  type="text"
                  id="itemQuantity"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({ ...newItem, quantity: e.target.value })
                  }
                  placeholder="e.g., 2 or 2 lbs"
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemSection">Section</label>
                <input
                  type="text"
                  id="itemSection"
                  value={newItem.section}
                  onChange={(e) =>
                    setNewItem({ ...newItem, section: e.target.value })
                  }
                  placeholder="e.g., Dairy"
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemStore">Store (optional)</label>
                <input
                  type="text"
                  id="itemStore"
                  value={newItem.store}
                  onChange={(e) =>
                    setNewItem({ ...newItem, store: e.target.value })
                  }
                  placeholder={list.store || 'e.g., Walmart'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="itemNotes">Notes (optional)</label>
                <textarea
                  id="itemNotes"
                  value={newItem.notes}
                  onChange={(e) =>
                    setNewItem({ ...newItem, notes: e.target.value })
                  }
                  placeholder="Any special instructions..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Item</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateItem} className="modal-form">
              <div className="form-group">
                <label htmlFor="editItemName">Item Name *</label>
                <input
                  type="text"
                  id="editItemName"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  placeholder="e.g., Milk"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="editItemQuantity">Quantity</label>
                <input
                  type="text"
                  id="editItemQuantity"
                  value={editingItem.quantity}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, quantity: e.target.value })
                  }
                  placeholder="e.g., 2 or 2 lbs"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editItemSection">Section</label>
                <input
                  type="text"
                  id="editItemSection"
                  value={editingItem.section}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, section: e.target.value })
                  }
                  placeholder="e.g., Dairy"
                />
              </div>
              <div className="form-group">
                <label htmlFor="editItemStore">Store (optional)</label>
                <input
                  type="text"
                  id="editItemStore"
                  value={editingItem.store}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, store: e.target.value })
                  }
                  placeholder={list.store || 'e.g., Walmart'}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editItemNotes">Notes (optional)</label>
                <textarea
                  id="editItemNotes"
                  value={editingItem.notes || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, notes: e.target.value })
                  }
                  placeholder="Any special instructions..."
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkModal && (
        <div className="modal-overlay" onClick={() => setShowBulkModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bulk Add Items</h2>
              <button
                className="modal-close"
                onClick={() => setShowBulkModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleBulkAdd} className="modal-form">
              <div className="form-group">
                <label htmlFor="bulkText">
                  Enter items (one per line) *
                </label>
                <textarea
                  id="bulkText"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={'Milk\nBread\nEggs\nButter\nCheese'}
                  rows="10"
                  required
                  autoFocus
                />
                <small className="form-hint">
                  Each line will create a new item
                </small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Items
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={() => handleDelete(itemToDelete?._id)}
        title="Delete Item?"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Item"
        cancelText="Cancel"
        confirmColor="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default ListDetail;
