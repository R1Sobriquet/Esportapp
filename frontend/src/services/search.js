/**
 * Search API Service
 * Handles search operations for players and games
 */

import apiClient from './config';

export const searchAPI = {
  /**
   * Search for players
   * @param {Object} params - Search parameters
   * @returns {Promise} API response with players
   */
  searchPlayers: (params) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.game) queryParams.append('game', params.game);
    if (params.skill_level) queryParams.append('skill_level', params.skill_level);
    if (params.region) queryParams.append('region', params.region);
    if (params.looking_for) queryParams.append('looking_for', params.looking_for);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    return apiClient.get(`/search/players?${queryParams.toString()}`);
  },

  /**
   * Search for games
   * @param {Object} params - Search parameters
   * @returns {Promise} API response with games
   */
  searchGames: (params) => {
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.category) queryParams.append('category', params.category);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.offset) queryParams.append('offset', params.offset);

    return apiClient.get(`/search/games?${queryParams.toString()}`);
  },

  /**
   * Get search suggestions for autocomplete
   * @param {string} query - Search query
   * @returns {Promise} API response with suggestions
   */
  getSuggestions: (query) => apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}`),
};

export default searchAPI;
