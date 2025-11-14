import React, { createContext, useState, useEffect } from 'react';
import * as authAPI from '../api/auth';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');

      if (storedToken) {
        try {
          // Try to get current user
          const data = await authAPI.getCurrentUser();
          setUser(data.user);
          setToken(storedToken);
        } catch (error) {
          // Token invalid, try to refresh
          try {
            const refreshData = await authAPI.refreshToken();
            localStorage.setItem('token', refreshData.token);
            setToken(refreshData.token);

            // Get user again with new token
            const userData = await authAPI.getCurrentUser();
            setUser(userData.user);
          } catch (refreshError) {
            // Refresh failed, clear everything
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Welcome back!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      const data = await authAPI.signup(userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      // Still clear local state even if API call fails
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  // Update user function
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
