import axios from 'axios';

// Base configuration is already set in AuthContext
// This file provides additional API methods

export const profileAPI = {
  getProfile: (userId) => axios.get(`/profile${userId ? `?user_id=${userId}` : ''}`),
  updateProfile: (data) => axios.put('/profile', data),
};

export const gamesAPI = {
  getAllGames: () => axios.get('/games'),
  getUserGames: () => axios.get('/user/games'),
  addUserGame: (gameData) => axios.post('/user/games', gameData),
  removeUserGame: (gameId) => axios.delete(`/user/games/${gameId}`),
};

export const matchingAPI = {
  findMatches: () => axios.post('/matches'),
  getMatches: () => axios.get('/matches'),
  acceptMatch: (matchId) => axios.post(`/matches/${matchId}/accept`),
  rejectMatch: (matchId) => axios.post(`/matches/${matchId}/reject`),
};

export const messagesAPI = {
  getConversations: () => axios.get('/messages'),
  getMessages: (userId) => axios.get(`/messages/${userId}`),
  sendMessage: (receiverId, content) => axios.post('/messages', { receiver_id: receiverId, content }),
  getUnreadCount: () => axios.get('/messages/unread'),
};

export const forumAPI = {
  getCategories: () => axios.get('/forum/categories'),
  getPosts: (categoryId, page = 1) => axios.get(`/forum/categories/${categoryId}/posts?page=${page}`),
  createPost: (categoryId, data) => axios.post(`/forum/categories/${categoryId}/posts`, data),
  getReplies: (postId, page = 1) => axios.get(`/forum/posts/${postId}/replies?page=${page}`),
  createReply: (postId, content) => axios.post(`/forum/posts/${postId}/replies`, { content }),
};