/**
 * Authentication API Service
 * Handles user registration and login
 */

import apiClient from './config';

export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} API response
   */
  register: (userData) => apiClient.post('/register', userData),

  /**
   * Login a user
   * @param {Object} credentials - Login credentials (email, password)
   * @returns {Promise} API response
   */
  login: (credentials) => apiClient.post('/login', credentials),
};

export default authAPI;
