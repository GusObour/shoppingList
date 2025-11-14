import axios from './axios';

// Get all items for a list
export const getItems = async (listId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await axios.get(`/items/lists/${listId}/items?${queryString}`);
  return response.data;
};

// Create new item
export const createItem = async (listId, itemData) => {
  const response = await axios.post(`/items/lists/${listId}/items`, itemData);
  return response.data;
};

// Update item
export const updateItem = async (itemId, updates) => {
  const response = await axios.put(`/items/${itemId}`, updates);
  return response.data;
};

// Toggle item done status
export const toggleItem = async (itemId) => {
  const response = await axios.patch(`/items/${itemId}/toggle`);
  return response.data;
};

// Reorder items
export const reorderItems = async (items) => {
  const response = await axios.post('/items/reorder', { items });
  return response.data;
};

// Delete item
export const deleteItem = async (itemId) => {
  const response = await axios.delete(`/items/${itemId}`);
  return response.data;
};
