import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { messagesAPI } from '../services';
import { Avatar, SkeletonConversation, SkeletonMessage, LoadingSpinner } from '../components';

export default function Messages() {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { if (user) loadConversations(); }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user');
    const username = params.get('username');
    if (userId && username) initiateConversation(parseInt(userId), username);
  }, [location.search, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user_id);
      if (window.innerWidth < 768) setShowSidebar(false);
    }
  }, [selectedConversation]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try {
      const r = await messagesAPI.getConversations();
      setConversations(r.data.conversations);
    } catch (err) {
      showError('Impossible de charger les conversations');
    } finally { setLoading(false); }
  };

  const initiateConversation = (userId, username) => {
    const existing = conversations.find(c => c.user_id === userId);
    if (existing) setSelectedConversation(existing);
    else {
      setSelectedConversation({ user_id: userId, username, avatar_url: null, last_message: null, last_message_time: null, unread_count: 0 });
      setMessages([]);
    }
  };

  const loadMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      const r = await messagesAPI.getMessages(userId);
      setMessages(r.data.messages);
    } catch (err) {
      if (err.response?.status === 403) showError('Tu peux seulement écrire aux joueurs avec qui tu as un match accepté');
      else setMessages([]);
    } finally { setLoadingMessages(false); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;
    setSending(true);

    const tempId = Date.now();
    const optimisticMessage = { id: tempId, content: newMessage.trim(), sender_id: user.id, created_at: new Date().toISOString(), pending: true };
    setMessages(prev => [...prev, optimisticMessage]);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const r = await messagesAPI.sendMessage(selectedConversation.user_id, messageText);
      setMessages(prev => prev.map(m => m.id === tempId ? r.data.message : m));
      setConversations(prev => {
        const idx = prev.findIndex(c => c.user_id === selectedConversation.user_id);
        const updated = { ...selectedConversation, last_message: messageText, last_message_time: new Date().toISOString() };
        if (idx >= 0) { const arr = [...prev]; arr[idx] = updated; return arr; }
        return [updated, ...prev];
      });
      setSelectedConversation(prev => ({ ...prev, last_message: messageText, last_message_time: new Date().toISOString() }));
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showError('Impossible d\'envoyer: ' + (err.response?.data?.detail || err.message));
    } finally { setSending(false); }
  };

  const formatTime = (ts) => {
    const d = new Date(ts), diff = (new Date() - d) / 3600000;
    if (diff < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 168) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messagesAPI.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      loadConversations();
    } catch (err) { showError('Impossible de supprimer le message'); }
  };

  const handleBackToList = () => { setShowSidebar(true); setSelectedConversation(null); };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan animate-float">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Connecte-toi pour accéder aux messages</h2>
          <a href="/login" className="inline-block px-6 py-3 bg-gradient-neon rounded-xl font-semibold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark">
        <div className="flex h-[calc(100vh-6rem)]">
          <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-white/5 border-r border-slate-200 dark:border-white/8">
            <div className="p-4 border-b border-slate-200 dark:border-white/8">
              <div className="h-5 w-24 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
            </div>
            {[1, 2, 3, 4, 5].map(i => <SkeletonConversation key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark text-slate-900 dark:text-white">
      <div className="flex h-[calc(100vh-6rem)] overflow-hidden">

        {/* Sidebar */}
        <div className={`
          ${showSidebar ? 'flex' : 'hidden md:flex'}
          flex-col w-full md:w-1/3 lg:w-72
          bg-white dark:bg-white/[0.03] backdrop-blur-sm
          border-r border-slate-200 dark:border-white/8
          transition-all duration-300
        `}>
          <div className="p-4 border-b border-slate-200 dark:border-white/8 flex items-center justify-between">
            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">Messages</h1>
            <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/8">
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? conversations.map((conv, index) => (
              <div
                key={conv.user_id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-slate-100 dark:border-white/5 cursor-pointer transition-all duration-200 animate-fade-in ${
                  selectedConversation?.user_id === conv.user_id
                    ? 'bg-sky-50 dark:bg-neon-cyan/10 border-l-2 border-l-sky-500 dark:border-l-neon-cyan'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar src={conv.avatar_url} username={conv.username} size={44} className="ring-2 ring-slate-200 dark:ring-white/10" />
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-neon text-white text-xs flex items-center justify-center rounded-full shadow-glow-cyan animate-bounce-in font-bold">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{conv.username}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{conv.last_message || 'Commencer une conversation'}</p>
                    {conv.last_message_time && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatTime(conv.last_message_time)}</p>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center animate-fade-in">
                <div className="w-14 h-14 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan animate-float">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Pas encore de conversations</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Accepte des matchs pour commencer</p>
                <a href="/matching" className="inline-block px-4 py-2 bg-gradient-neon rounded-xl text-xs font-semibold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all">
                  Trouver des coéquipiers
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`${!showSidebar || selectedConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col transition-all duration-300`}>
          {selectedConversation ? (
            <>
              {/* Conversation header */}
              <div className="p-4 bg-white dark:bg-white/[0.03] backdrop-blur-sm border-b border-slate-200 dark:border-white/8">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                    aria-label="Retour à la liste"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <Avatar src={selectedConversation.avatar_url} username={selectedConversation.username} size={38} className="ring-2 ring-sky-300/40 dark:ring-neon-cyan/30" />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{selectedConversation.username}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {loadingMessages ? 'Chargement...' : messages.length === 0 ? 'Nouvelle conversation' : 'En ligne'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="space-y-3">
                    <SkeletonMessage isOwn={false} />
                    <SkeletonMessage isOwn={true} />
                    <SkeletonMessage isOwn={false} />
                    <SkeletonMessage isOwn={true} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <Avatar src={selectedConversation.avatar_url} username={selectedConversation.username} size={72} className="mx-auto mb-4 ring-2 ring-sky-300/40 dark:ring-neon-cyan/30" />
                    <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">Conversation avec {selectedConversation.username}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Envoie ton premier message !</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const mine = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fade-in group`}
                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        {mine && !msg.pending && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="self-center mr-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                            title="Supprimer le message"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md ${mine ? 'order-2' : 'order-1'}`}>
                          {!mine && (
                            <Avatar src={msg.sender_avatar} username={msg.sender_username} size={28} className="mb-1" />
                          )}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm transition-all ${
                            mine
                              ? 'bg-gradient-neon text-white shadow-glow-cyan rounded-br-sm'
                              : 'bg-white dark:bg-white/8 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/10 rounded-bl-sm shadow-sm'
                          } ${msg.pending ? 'opacity-60' : ''}`}>
                            <p className="break-words leading-relaxed">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{formatTime(msg.created_at)}</p>
                            {msg.pending && (
                              <div className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input form */}
              <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-white/[0.03] backdrop-blur-sm border-t border-slate-200 dark:border-white/8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Écrire à ${selectedConversation.username}...`}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white text-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent transition-all"
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-3 bg-gradient-neon rounded-xl font-medium transition-all disabled:opacity-40 shadow-glow-cyan hover:shadow-glow-cyan-lg hover:scale-105 disabled:hover:scale-100"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className={`text-xs mt-1.5 transition-colors ${newMessage.length > 900 ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                  {newMessage.length}/1000
                </p>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan animate-float">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Sélectionne une conversation</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Choisis une conversation pour commencer</p>
                <a href="/matching" className="inline-block px-6 py-3 bg-gradient-neon rounded-xl font-semibold text-sm text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105">
                  Trouver des coéquipiers
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
