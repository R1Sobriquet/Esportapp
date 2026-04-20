import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { forumAPI } from '../services';

const CARD = 'bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm dark:shadow-glass';
const INPUT = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent transition-all text-sm';

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
      const response = await forumAPI.createPost(selectedCategory.id, {
        title: newPostForm.title.trim(),
        content: newPostForm.content.trim()
      });
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

  const getAvatarUrl = (username) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0EA5E9&color=fff&size=32`;

  if (loading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-sky-200 dark:border-neon-cyan/20 border-t-sky-500 dark:border-t-neon-cyan rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button onClick={() => setView('categories')} className="text-sky-600 dark:text-neon-cyan hover:text-sky-700 dark:hover:text-white transition-colors font-medium">
            Forum
          </button>
          {view !== 'categories' && (
            <>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <button onClick={() => setView('posts')} className="text-sky-600 dark:text-neon-cyan hover:text-sky-700 dark:hover:text-white transition-colors font-medium">
                {selectedCategory?.name}
              </button>
            </>
          )}
          {view === 'post' && (
            <>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs">{selectedPost?.title}</span>
            </>
          )}
        </div>

        {view === 'categories' && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
                Forums Gaming
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Connecte-toi avec la communauté, partage tes stratégies</p>
            </div>
            <div className="grid gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => loadPosts(cat.id)}
                  className={`${CARD} p-5 cursor-pointer hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-md dark:hover:shadow-glow-cyan/10 transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-1">{cat.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{cat.description}</p>
                      {cat.game_name && (
                        <span className="px-3 py-1 bg-sky-50 dark:bg-neon-cyan/10 text-sky-600 dark:text-neon-cyan rounded-full text-xs font-semibold border border-sky-200 dark:border-neon-cyan/20">
                          {cat.game_name}
                        </span>
                      )}
                    </div>
                    <div className="text-right text-xs text-slate-400 dark:text-slate-500 shrink-0 ml-4">
                      <p className="font-medium">{cat.post_count || 0} posts</p>
                      {cat.last_post_date && <p className="mt-0.5">Dernier: {formatDate(cat.last_post_date)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'posts' && selectedCategory && (
          <div>
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-extrabold mb-1 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
                  {selectedCategory.name}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCategory.description}</p>
              </div>
              {user && (
                <button
                  onClick={() => setNewPostForm({ ...newPostForm, show: true })}
                  className="shrink-0 px-4 py-2 bg-gradient-neon text-white rounded-xl text-sm font-semibold shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all"
                >
                  Nouveau post
                </button>
              )}
            </div>

            {newPostForm.show && (
              <form onSubmit={createPost} className={`${CARD} p-5 mb-5`}>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Créer un post</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Titre"
                    value={newPostForm.title}
                    onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                    className={INPUT}
                    maxLength={255}
                  />
                  <textarea
                    rows={5}
                    placeholder="Contenu..."
                    value={newPostForm.content}
                    onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                    className={INPUT + ' resize-none'}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-gradient-to-br from-emerald-500 to-green-400 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-400/30 transition-all">
                      Publier
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPostForm({ title: '', content: '', show: false })}
                      className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-600 dark:text-slate-300 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => loadPost(post.id)}
                  className={`${CARD} p-5 cursor-pointer hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-md dark:hover:shadow-glow-cyan/10 transition-all`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {post.is_pinned && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded text-xs font-bold border border-amber-200 dark:border-amber-500/20">
                            ÉPINGLÉ
                          </span>
                        )}
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{post.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                        {post.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={post.author_avatar || getAvatarUrl(post.author_username)}
                            alt={post.author_username}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sky-600 dark:text-neon-cyan font-medium">{post.author_username}</span>
                        </div>
                        <span>·</span><span>{formatDate(post.created_at)}</span>
                        <span>·</span><span>{post.views} vues</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400 dark:text-slate-500 shrink-0">
                      <p className="font-medium">{post.reply_count || 0} réponses</p>
                      {post.last_reply_date && <p className="mt-0.5">{formatDate(post.last_reply_date)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'post' && selectedPost && (
          <div className="space-y-4">
            <div className={`${CARD} p-5`}>
              <div className="flex items-center gap-2 mb-3">
                {selectedPost.is_pinned && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded text-xs font-bold border border-amber-200 dark:border-amber-500/20">
                    ÉPINGLÉ
                  </span>
                )}
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">{selectedPost.title}</h1>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <img
                    src={selectedPost.author_avatar || getAvatarUrl(selectedPost.author_username)}
                    alt={selectedPost.author_username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sky-600 dark:text-neon-cyan font-semibold">{selectedPost.author_username}</span>
                </div>
                <span>·</span><span>{formatDate(selectedPost.created_at)}</span>
                <span>·</span><span>{selectedPost.views} vues</span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedPost.content}
              </p>
            </div>

            {replies.map((reply) => (
              <div key={reply.id} className={`${CARD} p-5`}>
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mb-3">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={reply.author_avatar || getAvatarUrl(reply.author_username)}
                      alt={reply.author_username}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-sky-600 dark:text-neon-cyan font-semibold">{reply.author_username}</span>
                  </div>
                  <span>·</span><span>{formatDate(reply.created_at)}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {reply.content}
                </p>
              </div>
            ))}

            {user && (
              <form onSubmit={createReply} className={`${CARD} p-5`}>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Répondre</h3>
                <textarea
                  rows={4}
                  placeholder="Ta réponse..."
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  className={INPUT + ' resize-none mb-3'}
                />
                <button
                  type="submit"
                  disabled={!newReply.trim()}
                  className="px-4 py-2 bg-gradient-neon text-white rounded-xl text-sm font-semibold shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Répondre
                </button>
              </form>
            )}
          </div>
        )}

        {!user && (
          <div className={`${CARD} p-8 text-center mt-6`}>
            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Connecte-toi pour créer des posts et répondre</p>
            <a
              href="/login"
              className="inline-block px-5 py-2.5 bg-gradient-neon text-white rounded-xl text-sm font-semibold shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all"
            >
              Connexion
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
