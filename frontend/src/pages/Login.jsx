import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const INPUT = 'w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent transition-all text-sm';
const LABEL = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
    if (result.success) navigate('/');
    else setError(result.error || 'Invalid credentials');
    setLoading(false);
  };

  const fillDemoAccount = (n) => {
    const accounts = [
      { email: 'alice@example.com', password: 'password123' },
      { email: 'bob@example.com', password: 'password123' },
      { email: 'charlie@example.com', password: 'password123' },
    ];
    if (accounts[n]) setFormData(accounts[n]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/8 rounded-3xl shadow-glass-light dark:shadow-glass p-8 animate-fade-in">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
              <span className="text-3xl">🎮</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Bon retour !</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Connecte-toi à ton compte gaming</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={LABEL}>Adresse email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={INPUT}
                placeholder="ton@email.com"
              />
            </div>

            <div>
              <label className={LABEL}>Mot de passe</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={INPUT}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-neon py-3 rounded-xl font-bold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>

            <div className="flex items-center justify-between text-sm pt-1">
              <a href="#" className="text-sky-600 dark:text-neon-cyan hover:text-neon-violet transition-colors">
                Mot de passe oublié ?
              </a>
              <a href="/register" className="text-sky-600 dark:text-neon-cyan hover:text-neon-violet font-semibold transition-colors">
                Créer un compte
              </a>
            </div>
          </form>

          {/* Demo */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-white/8" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white dark:bg-gaming-surface text-xs text-slate-400 dark:text-slate-500">
                  Accès démo rapide
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3">
              password: <code className="font-mono">password123</code>
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['Alice (FPS)', 'Bob (MMO)', 'Charlie (MOBA)'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => fillDemoAccount(i)}
                  className="py-2 text-xs bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/8 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 hover:border-sky-300 dark:hover:border-neon-cyan/30 transition-all font-medium"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-sky-600 dark:text-neon-cyan hover:text-neon-violet font-semibold transition-colors">
            Inscris-toi ici
          </a>
        </p>
      </div>
    </div>
  );
}
