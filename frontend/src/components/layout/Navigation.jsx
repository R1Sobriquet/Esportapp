/**
 * Navigation component
 * Main navigation bar with search and notifications
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SearchBar, NotificationBell, Avatar } from '../common';

export default function Navigation() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-gray-950 via-primary-darkest to-gray-950 border-b border-primary/20 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent flex-shrink-0"
          >
            GameConnect
          </Link>

          {/* Search Bar - Desktop */}
          {user && (
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <SearchBar />
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2"
                >
                  Accueil
                </Link>
                <Link
                  to="/matching"
                  className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2"
                >
                  Matching
                </Link>
                <Link
                  to="/games"
                  className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2"
                >
                  Jeux
                </Link>
                <Link
                  to="/messages"
                  className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2"
                >
                  Messages
                </Link>

                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <div className="relative group">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 text-gray-300 hover:text-primary-light transition-colors px-3 py-2"
                  >
                    <Avatar
                      src={user.avatar_url}
                      username={user.username}
                      size={32}
                      className="ring-2 ring-primary/30"
                    />
                    <span className="hidden lg:inline">{user.username}</span>
                  </Link>
                </div>

                <button
                  onClick={logout}
                  className="text-gray-400 hover:text-primary-light transition-colors px-3 py-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-primary-light transition-colors px-4 py-2"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-primary px-4 py-2 rounded-lg font-medium transition-all shadow-glow-red hover:shadow-glow-red-lg"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            {/* Search Bar - Mobile */}
            {user && (
              <div className="mb-4">
                <SearchBar />
              </div>
            )}

            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
                  >
                    Accueil
                  </Link>
                  <Link
                    to="/matching"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
                  >
                    Matching
                  </Link>
                  <Link
                    to="/games"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
                  >
                    Jeux
                  </Link>
                  <Link
                    to="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50 flex items-center gap-2"
                  >
                    <Avatar src={user.avatar_url} username={user.username} size={24} />
                    {user.username}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-gray-400 hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-gray-300 hover:text-primary-light transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-gradient-primary px-4 py-2 rounded-lg font-medium text-center shadow-glow-red"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
