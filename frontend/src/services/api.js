import axios from 'axios';

// Base configuration - pointing to FastAPI
axios.defaults.baseURL = 'http://localhost:8000';

// Add token to requests if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => axios.post('/register', userData),
  login: (credentials) => axios.post('/login', credentials),
};

export const profileAPI = {
  getProfile: () => axios.get('/profile'),
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
};

// Note: Forum endpoints not implemented in FastAPI yet
export const forumAPI = {
  getCategories: () => Promise.resolve({ data: { categories: [] } }),
  getPosts: () => Promise.resolve({ data: { posts: [] } }),
  createPost: () => Promise.resolve({ data: { success: false } }),
  getReplies: () => Promise.resolve({ data: { replies: [] } }),
  createReply: () => Promise.resolve({ data: { success: false } }),
};