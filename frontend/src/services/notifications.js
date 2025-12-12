/**
 * Notifications API Service
 * Handles notification operations
 */

import apiClient from './config';

export const notificationsAPI = {
  /**
   * Get user's notifications
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with notifications
   */
  getNotifications: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.unread_only) queryParams.append('unread_only', 'true');
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    return apiClient.get(`/notifications?${queryParams.toString()}`);
  },

  /**
   * Get unread notification count
   * @returns {Promise} API response with count
   */
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),

  /**
   * Mark a notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} API response
   */
  markAsRead: (notificationId) => apiClient.post(`/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   * @returns {Promise} API response
   */
  markAllAsRead: () => apiClient.post('/notifications/read-all'),

  /**
   * Delete a notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise} API response
   */
  deleteNotification: (notificationId) => apiClient.delete(`/notifications/${notificationId}`),

  /**
   * Clear notifications
   * @param {boolean} readOnly - Only clear read notifications
   * @returns {Promise} API response
   */
  clearNotifications: (readOnly = true) => apiClient.delete(`/notifications?read_only=${readOnly}`),
};

export default notificationsAPI;
