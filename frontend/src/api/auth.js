import axios from './axios';

// Sign up new user
export const signup = async (userData) => {
  const response = await axios.post('/auth/signup', userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await axios.post('/auth/login', credentials);
  return response.data;
};

// Refresh token
export const refreshToken = async () => {
  const response = await axios.post('/auth/refresh');
  return response.data;
};

// Logout user
export const logout = async () => {
  const response = await axios.post('/auth/logout');
  localStorage.removeItem('token');
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await axios.get('/auth/me');
  return response.data;
};

// Update user profile
export const updateProfile = async (userData) => {
  const response = await axios.put('/auth/profile', userData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await axios.put('/auth/password', passwordData);
  return response.data;
};

// Delete account
export const deleteAccount = async () => {
  const response = await axios.delete('/auth/account');
  localStorage.removeItem('token');
  return response.data;
};
