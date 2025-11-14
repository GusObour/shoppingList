import { useState, useEffect, useCallback } from 'react';
import * as itemsAPI from '../api/items';
import toast from 'react-hot-toast';

export const useItems = (listId) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!listId) return;

    try {
      setLoading(true);
      const data = await itemsAPI.getItems(listId);
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch items');
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (itemData) => {
    try {
      const data = await itemsAPI.createItem(listId, itemData);
      setItems((prev) => [...prev, data.item]);
      toast.success('Item added!');
      return { success: true, item: data.item };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add item';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateItem = async (itemId, updates) => {
    try {
      const data = await itemsAPI.updateItem(itemId, updates);
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? data.item : item))
      );
      toast.success('Item updated!');
      return { success: true, item: data.item };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update item';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const toggleItem = async (itemId) => {
    try {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, isDone: !item.isDone } : item
        )
      );

      const data = await itemsAPI.toggleItem(itemId);

      // Update with server response
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId
            ? { ...item, isDone: data.item.isDone, completedAt: data.item.completedAt }
            : item
        )
      );

      return { success: true };
    } catch (err) {
      // Revert optimistic update on error
      fetchItems();
      toast.error('Failed to toggle item');
      return { success: false };
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await itemsAPI.deleteItem(itemId);
      setItems((prev) => prev.filter((item) => item._id !== itemId));
      toast.success('Item deleted!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete item';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const reorderItems = async (reorderedActiveItems, allItems) => {
    try {
      // Optimistic update with all items (active + done)
      setItems(allItems);

      // Prepare data for backend - only send the reordered active items with their new priorities
      const itemsData = reorderedActiveItems.map((item, index) => ({
        id: item._id,
        priority: index,
      }));

      await itemsAPI.reorderItems(itemsData);
      return { success: true };
    } catch (err) {
      // Revert on error
      fetchItems();
      toast.error('Failed to reorder items');
      return { success: false };
    }
  };

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    reorderItems,
  };
};
