/**
 * Forum API Service
 * Placeholder for forum functionality (not yet implemented in backend)
 */

export const forumAPI = {
  /**
   * Get forum categories
   * @returns {Promise} Empty categories (not implemented)
   */
  getCategories: () => Promise.resolve({ data: { categories: [] } }),

  /**
   * Get forum posts
   * @returns {Promise} Empty posts (not implemented)
   */
  getPosts: () => Promise.resolve({ data: { posts: [] } }),

  /**
   * Create a forum post
   * @returns {Promise} Failure response (not implemented)
   */
  createPost: () => Promise.resolve({ data: { success: false } }),

  /**
   * Get replies for a post
   * @returns {Promise} Empty replies (not implemented)
   */
  getReplies: () => Promise.resolve({ data: { replies: [] } }),

  /**
   * Create a reply to a post
   * @returns {Promise} Failure response (not implemented)
   */
  createReply: () => Promise.resolve({ data: { success: false } }),
};

export default forumAPI;
