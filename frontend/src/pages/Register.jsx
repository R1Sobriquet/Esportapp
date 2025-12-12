/**
 * Register Page Component
 * Handles new user registration with multi-step form
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Account info
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    // Profile info
    region: '',
    date_of_birth: '',
    bio: '',
    discord_username: '',
    skill_level: 'beginner',
    looking_for: 'teammates'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.email || !formData.username || !formData.password) {
      setError('Tous les champs sont requis');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const registrationData = {
      email: formData.email,
      username: formData.username,
      password: formData.password,
      profile: {
        region: formData.region,
        date_of_birth: formData.date_of_birth,
        bio: formData.bio,
        discord_username: formData.discord_username,
        skill_level: formData.skill_level,
        looking_for: formData.looking_for,
        profile_visibility: 'public',
        show_stats: true,
        allow_friend_requests: true
      }
    };

    const result = await register(registrationData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Échec de l\'inscription');
    }

    setLoading(false);
  };

  const skillLevels = [
    { value: 'beginner', label: 'Débutant', description: 'Je commence à jouer' },
    { value: 'intermediate', label: 'Intermédiaire', description: 'Je connais les bases' },
    { value: 'advanced', label: 'Avancé', description: 'Joueur compétitif' },
    { value: 'expert', label: 'Expert', description: 'Niveau pro' }
  ];

  const lookingForOptions = [
    { value: 'teammates', label: 'Coéquipiers', icon: '🎮' },
    { value: 'mentor', label: 'Mentor', icon: '🎓' },
    { value: 'casual_friends', label: 'Amis Casual', icon: '😊' },
    { value: 'competitive_team', label: 'Équipe Compétitive', icon: '🏆' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            Créer ton compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Rejoins la communauté gaming
          </p>

          {/* Progress indicator */}
          <div className="mt-6 flex justify-center space-x-2">
            <div className={`h-2 w-16 rounded ${currentStep >= 1 ? 'bg-gradient-primary shadow-glow-red' : 'bg-gray-700'}`} />
            <div className={`h-2 w-16 rounded ${currentStep >= 2 ? 'bg-gradient-primary shadow-glow-red' : 'bg-gray-700'}`} />
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {currentStep === 1 ? (
            /* Step 1: Account Information */
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Informations du compte</h3>

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
                  placeholder="ton@email.com"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="Choisis un pseudo unique"
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="Au moins 6 caractères"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="Confirme ton mot de passe"
                />
              </div>

              {error && (
                <div className="bg-primary/20 border border-primary/50 rounded-md p-3">
                  <p className="text-primary-light text-sm">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-primary hover:shadow-glow-red-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-all transform hover:scale-[1.02] shadow-glow-red"
              >
                Étape suivante
              </button>
            </div>
          ) : (
            /* Step 2: Profile Information */
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Informations du profil</h3>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-300">
                  Région
                </label>
                <input
                  id="region"
                  name="region"
                  type="text"
                  value={formData.region}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="ex: Europe, NA, Asie"
                />
              </div>

              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-300">
                  Date de naissance
                </label>
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="discord_username" className="block text-sm font-medium text-gray-300">
                  Pseudo Discord (Optionnel)
                </label>
                <input
                  id="discord_username"
                  name="discord_username"
                  type="text"
                  value={formData.discord_username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="TonNom#1234"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-300">
                  Bio (Optionnel)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all"
                  placeholder="Parle-nous de toi et de ton style de jeu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Niveau de compétence
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {skillLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, skill_level: level.value }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.skill_level === level.value
                          ? 'bg-gradient-primary border-primary-light shadow-glow-red'
                          : 'bg-gray-900/80 border-primary/20 hover:border-primary-light/40'
                      }`}
                    >
                      <div className="font-medium text-white">{level.label}</div>
                      <div className="text-xs text-gray-400">{level.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Je recherche
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {lookingForOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, looking_for: option.value }))}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.looking_for === option.value
                          ? 'bg-gradient-to-br from-green-600 to-green-500 border-green-500 shadow-lg shadow-green-500/50'
                          : 'bg-gray-900/80 border-primary/20 hover:border-primary-light/40'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm text-white">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-primary/20 border border-primary/50 rounded-md p-3">
                  <p className="text-primary-light text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 px-4 border border-primary/30 text-sm font-medium rounded-md text-gray-300 bg-gray-900/80 hover:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </div>
                  ) : (
                    'Créer le compte'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-400">
              Tu as déjà un compte ?{' '}
              <a href="/login" className="text-primary-light hover:text-white font-medium transition-colors">
                Connecte-toi ici
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
