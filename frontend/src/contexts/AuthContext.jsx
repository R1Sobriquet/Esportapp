/**
 * Authentication Context
 * Provides authentication state and methods throughout the application
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiClient } from '../services';

const AuthContext = createContext();

/**
 * Hook to access authentication context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Wraps the application and provides auth state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }

    setLoading(false);
  }, []);

  /**
   * Login a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Result with success status
   */
  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Result with success status
   */
  const register = async (userData) => {
    try {
      const response = await apiClient.post('/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  /**
   * Update user data in state and localStorage
   * @param {Object} updatedUser - Updated user data
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
