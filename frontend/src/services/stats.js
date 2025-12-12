/**
 * Stats API Service
 * Handles platform statistics and player rankings
 */

import apiClient from './config';

export const statsAPI = {
  /**
   * Get platform-wide statistics
   * @returns {Promise} API response with platform stats
   */
  getPlatformStats: () => apiClient.get('/stats/platform'),

  /**
   * Get popular players by match count
   * @param {number} limit - Maximum number of players to return
   * @returns {Promise} API response with popular players
   */
  getPopularPlayers: (limit = 6) => apiClient.get(`/stats/popular-players?limit=${limit}`),

  /**
   * Get recently active players
   * @param {number} limit - Maximum number of players to return
   * @returns {Promise} API response with recently active players
   */
  getRecentlyActive: (limit = 6) => apiClient.get(`/stats/recently-active?limit=${limit}`),

  /**
   * Get top matchers (players with most matches)
   * @param {number} limit - Maximum number of players to return
   * @returns {Promise} API response with top matchers
   */
  getTopMatchers: (limit = 6) => apiClient.get(`/stats/top-matchers?limit=${limit}`),

  /**
   * Get games ranking by player count
   * @param {number} limit - Maximum number of games to return
   * @returns {Promise} API response with games ranking
   */
  getGamesRanking: (limit = 10) => apiClient.get(`/stats/games-ranking?limit=${limit}`),

  /**
   * Get public stats for a specific user
   * @param {number} userId - User ID
   * @returns {Promise} API response with user stats
   */
  getUserStats: (userId) => apiClient.get(`/stats/user/${userId}`),
};

export default statsAPI;
