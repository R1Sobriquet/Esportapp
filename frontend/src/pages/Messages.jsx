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

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    // Gérer les paramètres URL pour initier une conversation
    const params = new URLSearchParams(location.search);
    const userId = params.get('user');
    const username = params.get('username');
    
    if (userId && username) {
      console.log('Initiating conversation with:', userId, username);
      initiateConversation(parseInt(userId), username);
    }
  }, [location.search, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.user_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    // Chercher si une conversation existe déjà
    const existingConversation = conversations.find(c => c.user_id === userId);
    
    if (existingConversation) {
      console.log('Found existing conversation:', existingConversation);
      setSelectedConversation(existingConversation);
    } else {
      console.log('Creating new conversation for:', username);
      // Créer une conversation temporaire
      const newConversation = {
        user_id: userId,
        username: username,
        avatar_url: null, // Sera géré par le composant Avatar
        last_message: null,
        last_message_time: null,
        unread_count: 0
      };
      
      setSelectedConversation(newConversation);
      setMessages([]); // Conversation vide
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await messagesAPI.getMessages(userId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      if (error.response?.status === 403) {
        alert('Tu peux seulement envoyer des messages aux joueurs avec qui tu as un match accepté');
      } else {
        // Si c'est une nouvelle conversation, on commence avec un tableau vide
        setMessages([]);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await messagesAPI.sendMessage(
        selectedConversation.user_id,
        newMessage.trim()
      );
      
      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
      
      // Mettre à jour la liste des conversations
      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.user_id === selectedConversation.user_id);
        const updatedConv = {
          ...selectedConversation,
          last_message: newMessage.trim(),
          last_message_time: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
          // Mettre à jour la conversation existante
          const updated = [...prev];
          updated[existingIndex] = updatedConv;
          return updated;
        } else {
          // Ajouter la nouvelle conversation
          return [updatedConv, ...prev];
        }
      });
      
      // Mettre à jour selectedConversation avec les nouvelles infos
      setSelectedConversation(prev => ({
        ...prev,
        last_message: newMessage.trim(),
        last_message_time: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Impossible d\'envoyer le message: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Connecte-toi pour accéder aux messages</h2>
          <a href="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex h-screen">
        {/* Conversations List */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          
          <div className="overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.user_id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 transition-colors ${
                    selectedConversation?.user_id === conversation.user_id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={conversation.avatar_url}
                      username={conversation.username}
                      size={48}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{conversation.username}</h3>
                        {conversation.unread_count > 0 && (
                          <span className="bg-blue-600 text-xs px-2 py-1 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {conversation.last_message || 'Commencez une conversation'}
                      </p>
                      {conversation.last_message_time && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatMessageTime(conversation.last_message_time)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  💬
                </div>
                <p className="mb-2">Pas encore de conversations</p>
                <p className="text-sm">
                  Accepte des matchs pour commencer à échanger avec d'autres joueurs
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedConversation.avatar_url}
                    username={selectedConversation.username}
                    size={40}
                  />
                  <div>
                    <h2 className="font-semibold">{selectedConversation.username}</h2>
                    <p className="text-sm text-gray-400">
                      {messages.length === 0 ? 'Nouvelle conversation' : 'En ligne maintenant'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Avatar
                      src={selectedConversation.avatar_url}
                      username={selectedConversation.username}
                      size={80}
                      className="mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">
                      Conversation avec {selectedConversation.username}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      C'est le début de votre conversation ! Envoyez votre premier message.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMyMessage = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                          {!isMyMessage && (
                            <Avatar
                              src={message.sender_avatar}
                              username={message.sender_username}
                              size={32}
                              className="mb-1"
                            />
                          )}
                          <div
                            className={`px-4 py-2 rounded-lg ${
                              isMyMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-100'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isMyMessage ? 'text-right' : 'text-left'}`}>
                            {formatMessageTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Écrire un message à ${selectedConversation.username}...`}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={1000}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Envoyer'
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {newMessage.length}/1000 caractères
                </p>
              </form>
            </>
          ) : (
            /* No Conversation Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-850">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  💬
                </div>
                <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
                <p className="text-gray-400 mb-4">
                  Choisissez une conversation dans la barre latérale pour commencer à échanger
                </p>
                <a 
                  href="/matching"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
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