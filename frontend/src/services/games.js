/**
 * Games API Service
 * Handles game catalog and user games
 */

import apiClient from './config';

export const gamesAPI = {
  /**
   * Get all available games
   * @returns {Promise} API response with games list
   */
  getAllGames: () => apiClient.get('/games'),

  /**
   * Get current user's games
   * @returns {Promise} API response with user's games
   */
  getUserGames: () => apiClient.get('/user/games'),

  /**
   * Add or update a game in user's profile
   * @param {Object} gameData - Game data to add/update
   * @returns {Promise} API response
   */
  addUserGame: (gameData) => apiClient.post('/user/games', gameData),

  /**
   * Remove a game from user's profile
   * @param {number} gameId - ID of the game to remove
   * @returns {Promise} API response
   */
  removeUserGame: (gameId) => apiClient.delete(`/user/games/${gameId}`),
};

export default gamesAPI;
