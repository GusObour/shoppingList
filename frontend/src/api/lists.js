import axios from './axios';

// Get all lists
export const getLists = async (archived = false) => {
  const response = await axios.get(`/lists?archived=${archived}`);
  return response.data;
};

// Create new list
export const createList = async (listData) => {
  const response = await axios.post('/lists', listData);
  return response.data;
};

// Get single list
export const getList = async (listId) => {
  const response = await axios.get(`/lists/${listId}`);
  return response.data;
};

// Update list
export const updateList = async (listId, updates) => {
  const response = await axios.put(`/lists/${listId}`, updates);
  return response.data;
};

// Delete list
export const deleteList = async (listId) => {
  const response = await axios.delete(`/lists/${listId}`);
  return response.data;
};
