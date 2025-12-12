/**
 * Login Page Component
 * Handles user authentication
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials');
    }

    setLoading(false);
  };

  // Quick fill for demo accounts
  const fillDemoAccount = (accountNumber) => {
    const demoAccounts = [
      { email: 'alice@example.com', password: 'password123' },
      { email: 'bob@example.com', password: 'password123' },
      { email: 'charlie@example.com', password: 'password123' }
    ];

    if (demoAccounts[accountNumber]) {
      setFormData(demoAccounts[accountNumber]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow-red">
              <span className="text-3xl">🎮</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            Bon retour parmi nous
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Connecte-toi à ton compte gaming
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                placeholder="Entre ton email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                placeholder="Entre ton mot de passe"
              />
            </div>
          </div>

          {error && (
            <div className="bg-primary/20 border border-primary/50 rounded-md p-3">
              <p className="text-primary-light text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-primary hover:shadow-glow-red-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-glow-red"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="text-primary-light hover:text-white transition-colors">
                Mot de passe oublié ?
              </a>
            </div>
            <div className="text-sm">
              <a href="/register" className="text-primary-light hover:text-white transition-colors">
                Créer un compte
              </a>
            </div>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-primary/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-gray-400">Accès Demo Rapide</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs text-gray-500 text-center mb-2">
              Clique pour utiliser un compte démo (password: password123)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount(0)}
                className="px-3 py-2 text-xs bg-gray-900/80 hover:bg-gray-800/80 border border-primary/20 hover:border-primary-light/40 rounded-md text-gray-300 transition-all"
              >
                Alice (FPS)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount(1)}
                className="px-3 py-2 text-xs bg-gray-900/80 hover:bg-gray-800/80 border border-primary/20 hover:border-primary-light/40 rounded-md text-gray-300 transition-all"
              >
                Bob (MMO)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount(2)}
                className="px-3 py-2 text-xs bg-gray-900/80 hover:bg-gray-800/80 border border-primary/20 hover:border-primary-light/40 rounded-md text-gray-300 transition-all"
              >
                Charlie (MOBA)
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Pas encore de compte ?{' '}
            <a href="/register" className="text-primary-light hover:text-white font-medium transition-colors">
              Inscris-toi ici
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
