import React, { useState, useEffect } from 'react';
import { forumAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';

export default function Forum() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('categories'); // categories, posts, post
  const [newPostForm, setNewPostForm] = useState({ title: '', content: '', show: false });
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await forumAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async (categoryId, page = 1) => {
    setLoading(true);
    try {
      const response = await forumAPI.getPosts(categoryId, page);
      setSelectedCategory(response.data.category);
      setPosts(response.data.posts);
      setView('posts');
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPost = async (postId, page = 1) => {
    setLoading(true);
    try {
      const response = await forumAPI.getReplies(postId, page);
      setSelectedPost(response.data.post);
      setReplies(response.data.replies);
      setView('post');
    } catch (error) {
      console.error('Failed to load post:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPostForm.title.trim() || !newPostForm.content.trim()) return;

    try {
      const response = await forumAPI.createPost(selectedCategory.id, {
        title: newPostForm.title.trim(),
        content: newPostForm.content.trim()
      });
      
      setPosts(prev => [response.data.post, ...prev]);
      setNewPostForm({ title: '', content: '', show: false });
      alert('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post: ' + (error.response?.data?.error || error.message));
    }
  };

  const createReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      const response = await forumAPI.createReply(selectedPost.id, newReply.trim());
      setReplies(prev => [...prev, response.data.reply]);
      setNewReply('');
    } catch (error) {
      console.error('Failed to create reply:', error);
      alert('Failed to create reply: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button
            onClick={() => setView('categories')}
            className="text-blue-400 hover:text-blue-300"
          >
            Forum
          </button>
          {view !== 'categories' && (
            <>
              <span className="text-gray-500">/</span>
              <button
                onClick={() => setView('posts')}
                className="text-blue-400 hover:text-blue-300"
              >
                {selectedCategory?.name}
              </button>
            </>
          )}
          {view === 'post' && (
            <>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400 truncate max-w-xs">
                {selectedPost?.title}
              </span>
            </>
          )}
        </div>

        {view === 'categories' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Gaming Forums</h1>
              <p className="text-gray-400">
                Connect with the community, share strategies, and find teammates
              </p>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => loadPosts(category.id)}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                      <p className="text-gray-400 mb-3">{category.description}</p>
                      {category.game_name && (
                        <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                          {category.game_name}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>{category.post_count || 0} posts</p>
                      {category.last_post_date && (
                        <p>Last: {formatDate(category.last_post_date)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'posts' && selectedCategory && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{selectedCategory.name}</h1>
                <p className="text-gray-400">{selectedCategory.description}</p>
              </div>
              {user && (
                <button
                  onClick={() => setNewPostForm({ ...newPostForm, show: true })}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  New Post
                </button>
              )}
            </div>

            {/* New Post Form */}
            {newPostForm.show && (
              <form onSubmit={createPost} className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Create New Post</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Post title"
                    value={newPostForm.title}
                    onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    maxLength={255}
                  />
                  <textarea
                    rows={6}
                    placeholder="What would you like to discuss?"
                    value={newPostForm.content}
                    onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                    >
                      Post
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPostForm({ title: '', content: '', show: false })}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => loadPost(post.id)}
                  className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && (
                          <span className="px-2 py-1 bg-yellow-600 rounded text-xs">PINNED</span>
                        )}
                        <h3 className="text-lg font-semibold">{post.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {post.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <img
                            src={post.author_avatar || '/default-avatar.png'}
                            alt={post.author_username}
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{post.author_username}</span>
                        </div>
                        <span>•</span>
                        <span>{formatDate(post.created_at)}</span>
                        <span>•</span>
                        <span>{post.views} views</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>{post.reply_count || 0} replies</p>
                      {post.last_reply_date && (
                        <p>Last: {formatDate(post.last_reply_date)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'post' && selectedPost && (
          <div>
            {/* Post Header */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                {selectedPost.is_pinned && (
                  <span className="px-2 py-1 bg-yellow-600 rounded text-xs">PINNED</span>
                )}
                <h1 className="text-2xl font-bold">{selectedPost.title}</h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedPost.author_avatar || '/default-avatar.png'}
                    alt={selectedPost.author_username}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{selectedPost.author_username}</span>
                </div>
                <span>•</span>
                <span>{formatDate(selectedPost.created_at)}</span>
                <span>•</span>
                <span>{selectedPost.views} views</span>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
            </div>

            {/* Replies */}
            <div className="space-y-4 mb-6">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={reply.author_avatar || '/default-avatar.png'}
                        alt={reply.author_username}
                        className="w-6 h-6 rounded-full"
                      />
                      <span>{reply.author_username}</span>
                    </div>
                    <span>•</span>
                    <span>{formatDate(reply.created_at)}</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            {user && (
              <form onSubmit={createReply} className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Reply to this post</h3>
                <textarea
                  rows={4}
                  placeholder="Write your reply..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4"
                />
                <button
                  type="submit"
                  disabled={!newReply.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Reply
                </button>
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              Please log in to create posts and replies
            </p>
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}