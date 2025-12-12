/**
 * Messages Page Component
 * Handles conversations and messaging between users
 * Responsive design with mobile-first approach
 */

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
      // On mobile, hide sidebar when conversation is selected
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    }
  }, [selectedConversation]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (err) {
      showError('Impossible de charger les conversations');
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const initiateConversation = (userId, username) => {
    const existing = conversations.find(c => c.user_id === userId);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      setSelectedConversation({ user_id: userId, username, avatar_url: null, last_message: null, last_message_time: null, unread_count: 0 });
      setMessages([]);
    }
  };

  const loadMessages = async (userId) => {
    setLoadingMessages(true);
    try {
      const response = await messagesAPI.getMessages(userId);
      setMessages(response.data.messages);
    } catch (err) {
      if (err.response?.status === 403) {
        showError('Tu peux seulement envoyer des messages aux joueurs avec qui tu as un match accepté');
      } else {
        setMessages([]);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;
    setSending(true);

    // Optimistic update
    const tempId = Date.now();
    const optimisticMessage = {
      id: tempId,
      content: newMessage.trim(),
      sender_id: user.id,
      created_at: new Date().toISOString(),
      pending: true,
    };
    setMessages(prev => [...prev, optimisticMessage]);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const response = await messagesAPI.sendMessage(selectedConversation.user_id, messageText);
      // Replace optimistic message with real one
      setMessages(prev => prev.map(m => m.id === tempId ? response.data.message : m));

      setConversations(prev => {
        const idx = prev.findIndex(c => c.user_id === selectedConversation.user_id);
        const updated = { ...selectedConversation, last_message: messageText, last_message_time: new Date().toISOString() };
        if (idx >= 0) { const arr = [...prev]; arr[idx] = updated; return arr; }
        return [updated, ...prev];
      });
      setSelectedConversation(prev => ({ ...prev, last_message: messageText, last_message_time: new Date().toISOString() }));
    } catch (err) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showError('Impossible d\'envoyer: ' + (err.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts), diff = (new Date() - d) / 3600000;
    if (diff < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 168) return d.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleBackToList = () => {
    setShowSidebar(true);
    setSelectedConversation(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red animate-float">
            <span className="text-4xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Connecte-toi pour accéder aux messages</h2>
          <a href="/login" className="inline-block px-6 py-3 bg-gradient-primary rounded-lg shadow-glow-red hover:shadow-glow-red-lg transition-all transform hover:scale-105">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
        <div className="flex h-screen">
          {/* Skeleton Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4 bg-gradient-to-b from-gray-900/80 to-gray-800/80 border-r border-primary/20">
            <div className="p-4 border-b border-primary/20">
              <div className="h-6 w-24 bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map(i => (
                <SkeletonConversation key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="flex h-screen overflow-hidden">
        {/* Conversations List - Sidebar */}
        <div className={`
          ${showSidebar ? 'flex' : 'hidden md:flex'}
          flex-col w-full md:w-1/3 lg:w-1/4
          bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-sm
          border-r border-primary/20
          transition-all duration-300
        `}>
          <div className="p-4 border-b border-primary/20 flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
              Messages
            </h1>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">
              {conversations.length} conv.
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? conversations.map((conv, index) => (
              <div
                key={conv.user_id}
                onClick={() => setSelectedConversation(conv)}
                className={`
                  p-4 border-b border-primary/10 cursor-pointer
                  hover:bg-gray-800/50 transition-all duration-200
                  animate-fade-in
                  ${selectedConversation?.user_id === conv.user_id ? 'bg-primary/20 border-l-2 border-l-primary-light' : ''}
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar src={conv.avatar_url} username={conv.username} size={48} className="ring-2 ring-primary-light/30" />
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-primary text-xs flex items-center justify-center rounded-full shadow-glow-red animate-bounce-in">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate text-white">{conv.username}</h3>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conv.last_message || 'Commencer une conversation'}</p>
                    {conv.last_message_time && (
                      <p className="text-xs text-gray-500 mt-1">{formatTime(conv.last_message_time)}</p>
                    )}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400 animate-fade-in">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red animate-float">
                  <span className="text-2xl">💬</span>
                </div>
                <p className="mb-2 font-medium">Pas encore de conversations</p>
                <p className="text-sm text-gray-500">Accepte des matchs pour commencer à échanger</p>
                <a href="/matching" className="inline-block mt-4 px-4 py-2 bg-gradient-primary rounded-lg text-sm shadow-glow-red hover:shadow-glow-red-lg transition-all">
                  Trouver des coéquipiers
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className={`
          ${!showSidebar || selectedConversation ? 'flex' : 'hidden md:flex'}
          flex-1 flex-col
          transition-all duration-300
        `}>
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-b border-primary/20">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={handleBackToList}
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Retour à la liste"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <Avatar src={selectedConversation.avatar_url} username={selectedConversation.username} size={40} className="ring-2 ring-primary-light/50" />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-white truncate">{selectedConversation.username}</h2>
                    <p className="text-sm text-gray-400">
                      {loadingMessages ? 'Chargement...' : messages.length === 0 ? 'Nouvelle conversation' : 'En ligne'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="space-y-4">
                    <SkeletonMessage isOwn={false} />
                    <SkeletonMessage isOwn={true} />
                    <SkeletonMessage isOwn={false} />
                    <SkeletonMessage isOwn={true} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 animate-fade-in">
                    <Avatar src={selectedConversation.avatar_url} username={selectedConversation.username} size={80} className="mx-auto mb-4 ring-2 ring-primary-light/50" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Conversation avec {selectedConversation.username}</h3>
                    <p className="text-gray-400">Envoie ton premier message !</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const mine = msg.sender_id === user.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${mine ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <div className={`max-w-[75%] sm:max-w-xs lg:max-w-md ${mine ? 'order-2' : 'order-1'}`}>
                          {!mine && (
                            <Avatar src={msg.sender_avatar} username={msg.sender_username} size={32} className="mb-1" />
                          )}
                          <div className={`
                            px-4 py-2 rounded-2xl transition-all
                            ${mine
                              ? 'bg-gradient-primary text-white shadow-glow-red rounded-br-sm'
                              : 'bg-gradient-to-br from-gray-800/80 to-gray-700/80 text-gray-100 border border-primary/20 rounded-bl-sm'
                            }
                            ${msg.pending ? 'opacity-70' : ''}
                          `}>
                            <p className="text-sm break-words">{msg.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                            <p className="text-xs text-gray-500">{formatTime(msg.created_at)}</p>
                            {msg.pending && (
                              <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-t border-primary/20">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Écrire à ${selectedConversation.username}...`}
                    className="flex-1 px-4 py-3 bg-gray-900/80 border border-primary/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 sm:px-6 py-3 bg-gradient-primary hover:shadow-glow-red-lg rounded-xl font-medium transition-all disabled:opacity-50 shadow-glow-red transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className={`text-xs mt-2 transition-colors ${newMessage.length > 900 ? 'text-yellow-500' : 'text-gray-500'}`}>
                  {newMessage.length}/1000
                </p>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red animate-float">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Sélectionne une conversation</h3>
                <p className="text-gray-400 mb-6">Choisis une conversation pour commencer</p>
                <a href="/matching" className="inline-block px-6 py-3 bg-gradient-primary rounded-lg font-medium transition-all shadow-glow-red hover:shadow-glow-red-lg transform hover:scale-105">
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
