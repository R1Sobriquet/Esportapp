/**
 * Matching API Service
 * Handles player matching operations
 */

import apiClient from './config';

export const matchingAPI = {
  /**
   * Find potential matches for current user
   * @returns {Promise} API response with potential matches
   */
  findMatches: () => apiClient.post('/matches'),

  /**
   * Get current user's matches
   * @returns {Promise} API response with matches list
   */
  getMatches: () => apiClient.get('/matches'),

  /**
   * Accept a match
   * @param {number} matchId - ID of the match to accept
   * @returns {Promise} API response
   */
  acceptMatch: (matchId) => apiClient.post(`/matches/${matchId}/accept`),

  /**
   * Reject a match
   * @param {number} matchId - ID of the match to reject
   * @returns {Promise} API response
   */
  rejectMatch: (matchId) => apiClient.post(`/matches/${matchId}/reject`),
};

export default matchingAPI;
