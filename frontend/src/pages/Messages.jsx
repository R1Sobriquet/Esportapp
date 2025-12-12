/**
 * Messages Page Component
 * Handles conversations and messaging between users
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messagesAPI } from '../services';
import { Avatar } from '../components';

export default function Messages() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { if (user) loadConversations(); }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user');
    const username = params.get('username');
    if (userId && username) initiateConversation(parseInt(userId), username);
  }, [location.search, conversations]);

  useEffect(() => { if (selectedConversation) loadMessages(selectedConversation.user_id); }, [selectedConversation]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadConversations = async () => {
    try {
      const response = await messagesAPI.getConversations();
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
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
    try {
      const response = await messagesAPI.getMessages(userId);
      setMessages(response.data.messages);
    } catch (error) {
      if (error.response?.status === 403) alert('Tu peux seulement envoyer des messages aux joueurs avec qui tu as un match accepté');
      else setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;
    setSending(true);
    try {
      const response = await messagesAPI.sendMessage(selectedConversation.user_id, newMessage.trim());
      setMessages(prev => [...prev, response.data.message]);
      const msg = newMessage.trim();
      setNewMessage('');
      setConversations(prev => {
        const idx = prev.findIndex(c => c.user_id === selectedConversation.user_id);
        const updated = { ...selectedConversation, last_message: msg, last_message_time: new Date().toISOString() };
        if (idx >= 0) { const arr = [...prev]; arr[idx] = updated; return arr; }
        return [updated, ...prev];
      });
      setSelectedConversation(prev => ({ ...prev, last_message: msg, last_message_time: new Date().toISOString() }));
    } catch (error) {
      alert('Impossible d\'envoyer: ' + (error.response?.data?.detail || error.message));
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Connecte-toi pour accéder aux messages</h2>
          <a href="/login" className="px-6 py-2 bg-gradient-primary rounded-lg shadow-glow-red hover:shadow-glow-red-lg transition-all">Se connecter</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="flex h-screen">
        {/* Conversations List */}
        <div className="w-1/3 bg-gradient-to-b from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-r border-primary/20">
          <div className="p-4 border-b border-primary/20">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">Messages</h1>
          </div>
          <div className="overflow-y-auto">
            {conversations.length > 0 ? conversations.map((conv) => (
              <div key={conv.user_id} onClick={() => setSelectedConversation(conv)} className={`p-4 border-b border-primary/10 cursor-pointer hover:bg-gray-800/50 transition-all ${selectedConversation?.user_id === conv.user_id ? 'bg-primary/20 border-l-2 border-l-primary-light' : ''}`}>
                <div className="flex items-center gap-3">
                  <Avatar src={conv.avatar_url} username={conv.username} size={48} className="ring-2 ring-primary-light/30" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate text-white">{conv.username}</h3>
                      {conv.unread_count > 0 && <span className="bg-gradient-primary text-xs px-2 py-1 rounded-full shadow-glow-red">{conv.unread_count}</span>}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conv.last_message || 'Commencer une conversation'}</p>
                    {conv.last_message_time && <p className="text-xs text-gray-500 mt-1">{formatTime(conv.last_message_time)}</p>}
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-gray-400">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red"><span className="text-2xl">💬</span></div>
                <p className="mb-2">Pas encore de conversations</p>
                <p className="text-sm">Accepte des matchs pour commencer à échanger</p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-b border-primary/20">
                <div className="flex items-center gap-3">
                  <Avatar src={selectedConversation.avatar_url} username={selectedConversation.username} size={40} className="ring-2 ring-primary-light/50" />
                  <div>
                    <h2 className="font-semibold text-white">{selectedConversation.username}</h2>
                    <p className="text-sm text-gray-400">{messages.length === 0 ? 'Nouvelle conversation' : 'En ligne'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Avatar src={selectedConversation.avatar_url} username={selectedConversation.username} size={80} className="mx-auto mb-4 ring-2 ring-primary-light/50" />
                    <h3 className="text-xl font-semibold mb-2 text-white">Conversation avec {selectedConversation.username}</h3>
                    <p className="text-gray-400">Envoie ton premier message !</p>
                  </div>
                ) : messages.map((msg) => {
                  const mine = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${mine ? 'order-2' : 'order-1'}`}>
                        {!mine && <Avatar src={msg.sender_avatar} username={msg.sender_username} size={32} className="mb-1" />}
                        <div className={`px-4 py-2 rounded-lg ${mine ? 'bg-gradient-primary text-white shadow-glow-red' : 'bg-gradient-to-br from-gray-800/80 to-gray-700/80 text-gray-100 border border-primary/20'}`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${mine ? 'text-right' : 'text-left'}`}>{formatTime(msg.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border-t border-primary/20">
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={`Écrire à ${selectedConversation.username}...`} className="flex-1 px-4 py-2 bg-gray-900/80 border border-primary/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light transition-all" maxLength={1000} />
                  <button type="submit" disabled={!newMessage.trim() || sending} className="px-6 py-2 bg-gradient-primary hover:shadow-glow-red-lg rounded-lg font-medium transition-all disabled:opacity-50 shadow-glow-red">
                    {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Envoyer'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{newMessage.length}/1000</p>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red"><span className="text-4xl">💬</span></div>
                <h3 className="text-xl font-semibold mb-2 text-white">Sélectionne une conversation</h3>
                <p className="text-gray-400 mb-4">Choisis une conversation pour commencer</p>
                <a href="/matching" className="px-6 py-2 bg-gradient-primary rounded-lg font-medium transition-all shadow-glow-red hover:shadow-glow-red-lg">Trouver des coéquipiers</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
