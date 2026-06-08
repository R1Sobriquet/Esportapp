/**
 * Messages API Service
 * Handles messaging between users
 */

import apiClient from './config';

export const messagesAPI = {
  /**
   * Get all conversations for current user
   * @returns {Promise} API response with conversations list
   */
  getConversations: () => apiClient.get('/messages'),

  /**
   * GC-EVOL-T6 — Récupère la liste des catégories de messages
   * Utilisé pour le sélecteur d'envoi et la barre de filtres.
   * @returns {Promise} API response avec { categories: [...] }
   */
  getCategories: () => apiClient.get('/messages/categories'),

  /**
   * Get messages with a specific user
   * GC-EVOL-T6 — `category` (slug) optionnel : filtre le fil côté API.
   * @param {number} userId - ID of the other user
   * @param {string} [category] - Slug de catégorie pour filtrer (optionnel)
   * @returns {Promise} API response with messages
   */
  getMessages: (userId, category) =>
    apiClient.get(`/messages/${userId}`, category ? { params: { category } } : undefined),

  /**
   * Send a message to another user
   * GC-EVOL-T6 — `categoryId` optionnel envoyé dans le body (peut être null).
   * @param {number} receiverId - ID of the message recipient
   * @param {string} content - Message content
   * @param {number} [categoryId] - ID de la catégorie choisie (optionnel)
   * @returns {Promise} API response
   */
  sendMessage: (receiverId, content, categoryId = null) =>
    apiClient.post('/messages', { receiver_id: receiverId, content, category_id: categoryId }),

  /**
   * Supprime logiquement un message (soft-delete)
   * Le message est conservé en base mais n'est plus affiché
   * @param {number} messageId - ID du message à supprimer
   * @returns {Promise} API response
   */
  deleteMessage: (messageId) => apiClient.delete(`/messages/${messageId}`),
};

export default messagesAPI;
