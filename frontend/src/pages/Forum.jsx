/**
 * Forum Page Component
 * Community forums for discussions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../services';

export default function Forum() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('categories');
  const [newPostForm, setNewPostForm] = useState({ title: '', content: '', show: false });
  const [newReply, setNewReply] = useState('');

  useEffect(() => { loadCategories(); }, []);

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

  const loadPosts = async (categoryId) => {
    setLoading(true);
    try {
      const response = await forumAPI.getPosts(categoryId);
      setSelectedCategory(response.data.category);
      setPosts(response.data.posts);
      setView('posts');
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPost = async (postId) => {
    setLoading(true);
    try {
      const response = await forumAPI.getReplies(postId);
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
      const response = await forumAPI.createPost(selectedCategory.id, { title: newPostForm.title.trim(), content: newPostForm.content.trim() });
      setPosts(prev => [response.data.post, ...prev]);
      setNewPostForm({ title: '', content: '', show: false });
    } catch (error) {
      alert('Impossible de créer le post: ' + (error.response?.data?.error || error.message));
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
      alert('Impossible de répondre: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString), diff = (new Date() - d) / 3600000;
    if (diff < 1) return 'À l\'instant';
    if (diff < 24) return `Il y a ${Math.floor(diff)}h`;
    if (diff < 168) return `Il y a ${Math.floor(diff / 24)}j`;
    return d.toLocaleDateString('fr-FR');
  };

  const getAvatarUrl = (username) => `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=AD2831&color=fff&size=32`;

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button onClick={() => setView('categories')} className="text-primary-light hover:text-white transition-colors">Forum</button>
          {view !== 'categories' && <><span className="text-gray-500">/</span><button onClick={() => setView('posts')} className="text-primary-light hover:text-white transition-colors">{selectedCategory?.name}</button></>}
          {view === 'post' && <><span className="text-gray-500">/</span><span className="text-gray-400 truncate max-w-xs">{selectedPost?.title}</span></>}
        </div>

        {view === 'categories' && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">Forums Gaming</h1>
              <p className="text-gray-400">Connecte-toi avec la communauté, partage tes stratégies</p>
            </div>
            <div className="grid gap-4">
              {categories.map((cat) => (
                <div key={cat.id} onClick={() => loadPosts(cat.id)} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 hover:border-primary-light/40 border border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-glow-red">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 text-white">{cat.name}</h3>
                      <p className="text-gray-400 mb-3">{cat.description}</p>
                      {cat.game_name && <span className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm border border-primary-light/20">{cat.game_name}</span>}
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>{cat.post_count || 0} posts</p>
                      {cat.last_post_date && <p>Dernier: {formatDate(cat.last_post_date)}</p>}
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
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">{selectedCategory.name}</h1>
                <p className="text-gray-400">{selectedCategory.description}</p>
              </div>
              {user && <button onClick={() => setNewPostForm({ ...newPostForm, show: true })} className="px-4 py-2 bg-gradient-primary hover:shadow-glow-red-lg rounded-lg font-medium transition-all shadow-glow-red">Nouveau post</button>}
            </div>

            {newPostForm.show && (
              <form onSubmit={createPost} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/20 shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-white">Créer un post</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Titre" value={newPostForm.title} onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })} className="w-full px-4 py-2 bg-gray-900/80 border border-primary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all" maxLength={255} />
                  <textarea rows={6} placeholder="Contenu..." value={newPostForm.content} onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })} className="w-full px-4 py-2 bg-gray-900/80 border border-primary/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all" />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50 rounded-lg font-medium transition-all">Publier</button>
                    <button type="button" onClick={() => setNewPostForm({ title: '', content: '', show: false })} className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg font-medium transition-all">Annuler</button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} onClick={() => loadPost(post.id)} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 hover:border-primary-light/40 border border-primary/20 cursor-pointer transition-all shadow-lg hover:shadow-glow-red">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_pinned && <span className="px-2 py-1 bg-yellow-600 rounded text-xs font-bold">ÉPINGLÉ</span>}
                        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                      </div>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{post.content.substring(0, 200)}...</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <img src={post.author_avatar || getAvatarUrl(post.author_username)} alt={post.author_username} className="w-6 h-6 rounded-full ring-1 ring-primary-light/30" />
                          <span className="text-primary-light">{post.author_username}</span>
                        </div>
                        <span>•</span><span>{formatDate(post.created_at)}</span><span>•</span><span>{post.views} vues</span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <p>{post.reply_count || 0} réponses</p>
                      {post.last_reply_date && <p>Dernier: {formatDate(post.last_reply_date)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'post' && selectedPost && (
          <div>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/20 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                {selectedPost.is_pinned && <span className="px-2 py-1 bg-yellow-600 rounded text-xs font-bold">ÉPINGLÉ</span>}
                <h1 className="text-2xl font-bold text-white">{selectedPost.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <img src={selectedPost.author_avatar || getAvatarUrl(selectedPost.author_username)} alt={selectedPost.author_username} className="w-8 h-8 rounded-full ring-2 ring-primary-light/30" />
                  <span className="text-primary-light">{selectedPost.author_username}</span>
                </div>
                <span>•</span><span>{formatDate(selectedPost.created_at)}</span><span>•</span><span>{selectedPost.views} vues</span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{selectedPost.content}</p>
            </div>

            <div className="space-y-4 mb-6">
              {replies.map((reply) => (
                <div key={reply.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-2">
                      <img src={reply.author_avatar || getAvatarUrl(reply.author_username)} alt={reply.author_username} className="w-6 h-6 rounded-full ring-1 ring-primary-light/30" />
                      <span className="text-primary-light">{reply.author_username}</span>
                    </div>
                    <span>•</span><span>{formatDate(reply.created_at)}</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>

            {user && (
              <form onSubmit={createReply} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-white">Répondre</h3>
                <textarea rows={4} placeholder="Ta réponse..." value={newReply} onChange={(e) => setNewReply(e.target.value)} className="w-full px-4 py-2 bg-gray-900/80 border border-primary/20 rounded-lg text-white mb-4 focus:outline-none focus:ring-2 focus:ring-primary-light transition-all" />
                <button type="submit" disabled={!newReply.trim()} className="px-4 py-2 bg-gradient-primary hover:shadow-glow-red-lg rounded-lg font-medium transition-all disabled:opacity-50 shadow-glow-red">Répondre</button>
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">Connecte-toi pour créer des posts et répondre</p>
            <a href="/login" className="px-4 py-2 bg-gradient-primary hover:shadow-glow-red-lg rounded-lg font-medium transition-all shadow-glow-red">Connexion</a>
          </div>
        )}
      </div>
    </div>
  );
}
