import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SearchBar, NotificationBell, Avatar, ThemeToggle } from '../common';

const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/matching', label: 'Matching' },
  { to: '/games', label: 'Jeux' },
  { to: '/messages', label: 'Messages' },
];

export default function Navigation() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl">
      <div className="relative glass-light dark:glass-dark rounded-2xl shadow-glass-light dark:shadow-glass px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link
            to="/"
            className="text-xl font-extrabold bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent flex-shrink-0 tracking-tight"
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
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors duration-200 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium"
                  >
                    {label}
                  </Link>
                ))}

                <ThemeToggle />
                <NotificationBell />

                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors px-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  <Avatar
                    src={user.avatar_url}
                    username={user.username}
                    size={32}
                    className="ring-2 ring-sky-400/30 dark:ring-neon-cyan/30"
                  />
                  <span className="hidden lg:inline text-sm font-medium">{user.username}</span>
                </Link>

                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                  aria-label="Déconnexion"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  to="/login"
                  className="text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors px-4 py-2 text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-neon px-4 py-2 rounded-xl font-semibold text-sm text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden pb-4 border-t border-slate-200 dark:border-white/5 mt-1 pt-4 animate-slide-down">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-medium">Thème</span>
              <ThemeToggle />
            </div>

            {user && (
              <div className="mb-4">
                <SearchBar />
              </div>
            )}

            <div className="flex flex-col gap-1">
              {user ? (
                <>
                  {NAV_LINKS.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium"
                    >
                      {label}
                    </Link>
                  ))}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 text-sm font-medium"
                  >
                    <Avatar src={user.avatar_url} username={user.username} size={20} />
                    {user.username}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-left text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-sm"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-neon-cyan transition-colors px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-gradient-neon px-4 py-2.5 rounded-xl font-semibold text-sm text-white text-center shadow-glow-cyan mt-1"
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
