/**
 * Profile API Service
 * Handles user profile operations
 */

import apiClient from './config';

export const profileAPI = {
  /**
   * Get current user's profile
   * @returns {Promise} API response with profile data
   */
  getProfile: () => apiClient.get('/profile'),

  /**
   * Update current user's profile
   * @param {Object} data - Profile data to update
   * @returns {Promise} API response
   */
  updateProfile: (data) => apiClient.put('/profile', data),

  /**
   * Get user activity statistics
   * @returns {Promise} API response with activity stats
   */
  getActivityStats: () => apiClient.get('/user/activity-stats'),
};

export default profileAPI;
