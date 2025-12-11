/**
 * Navigation component
 * Main navigation bar for the application
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-blue-400">
            GameConnect
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Accueil
                </Link>
                <Link to="/matching" className="text-gray-300 hover:text-white transition-colors">
                  Matching
                </Link>
                <Link to="/games" className="text-gray-300 hover:text-white transition-colors">
                  Jeux
                </Link>
                <Link to="/messages" className="text-gray-300 hover:text-white transition-colors">
                  Messages
                </Link>
                <Link to="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Profil
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
