import React, { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../../services';
import Avatar from './Avatar';

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const diffMs = new Date() - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const typeIcons = {
  match_new: '🎯',
  match_accepted: '✅',
  match_rejected: '❌',
  message_new: '💬',
  system: 'ℹ️',
  profile_view: '👀',
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications({ limit: 10 });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) loadNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-neon text-white text-xs font-bold flex items-center justify-center rounded-full shadow-glow-cyan animate-bounce-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gaming-surface border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-glass overflow-hidden z-50 animate-fade-in">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-white/8 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-sky-600 dark:text-neon-cyan hover:text-sky-700 dark:hover:text-white transition-colors font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-sky-200 dark:border-neon-cyan/20 border-t-sky-500 dark:border-t-neon-cyan rounded-full animate-spin mx-auto" />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  className={`px-4 py-3 border-b border-slate-100 dark:border-white/5 transition-colors cursor-pointer ${
                    notification.is_read
                      ? 'bg-transparent'
                      : 'bg-sky-50 dark:bg-neon-cyan/5 hover:bg-sky-100 dark:hover:bg-neon-cyan/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {notification.from_avatar ? (
                      <Avatar src={notification.from_avatar} username={notification.from_username} size={40} />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-neon rounded-xl flex items-center justify-center text-base shrink-0">
                        {typeIcons[notification.type] || 'ℹ️'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${notification.is_read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{notification.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-sky-500 dark:bg-neon-cyan rounded-full shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-slate-100 dark:bg-white/8 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Aucune notification</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 dark:border-white/8 text-center">
              <a href="/notifications" className="text-sm text-sky-600 dark:text-neon-cyan hover:text-sky-700 dark:hover:text-white transition-colors font-medium">
                Voir toutes les notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
