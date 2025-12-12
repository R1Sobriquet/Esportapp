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
    <nav className="bg-gradient-to-r from-gray-950 via-primary-darkest to-gray-950 border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            GameConnect
          </Link>

          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/" className="text-gray-300 hover:text-primary-light transition-colors">
                  Accueil
                </Link>
                <Link to="/matching" className="text-gray-300 hover:text-primary-light transition-colors">
                  Matching
                </Link>
                <Link to="/games" className="text-gray-300 hover:text-primary-light transition-colors">
                  Jeux
                </Link>
                <Link to="/messages" className="text-gray-300 hover:text-primary-light transition-colors">
                  Messages
                </Link>
                <Link to="/profile" className="text-gray-300 hover:text-primary-light transition-colors">
                  Profil
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-300 hover:text-primary-light transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-primary-light transition-colors">
                  Connexion
                </Link>
                <Link to="/register" className="text-primary-light hover:text-white transition-colors font-medium">
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
