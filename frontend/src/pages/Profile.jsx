/**
 * Profile Page Component
 * Displays and allows editing of user profile with avatar and banner support
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, gamesAPI } from '../services';
import { Avatar, ImageSelector } from '../components';

// Skill level labels with colors
const SKILL_LEVELS = {
  beginner: { label: 'Débutant', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/20' },
  intermediate: { label: 'Intermédiaire', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' },
  advanced: { label: 'Avancé', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/20' },
  expert: { label: 'Expert', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/20' }
};

const LOOKING_FOR_LABELS = {
  teammates: 'Coéquipiers',
  mentor: 'Un mentor',
  casual_friends: 'Amis casual',
  competitive_team: 'Équipe compétitive'
};

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Image selector state
  const [imageSelector, setImageSelector] = useState({
    isOpen: false,
    type: 'avatar' // 'avatar' or 'banner'
  });

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const lookingForOptions = ['teammates', 'mentor', 'casual_friends', 'competitive_team'];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (user) {
      loadProfile();
      loadAllGames();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data.profile);
      setGames(response.data.games);
      setEditForm({
        ...response.data.profile,
        preferences: response.data.preferences
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAllGames = async () => {
    try {
      const response = await gamesAPI.getAllGames();
      setAllGames(response.data);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox'
            ? (checked
                ? [...(prev.preferences[prefKey] || []), value]
                : (prev.preferences[prefKey] || []).filter(v => v !== value))
            : value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await profileAPI.updateProfile(editForm);
      await loadProfile();
      setIsEditing(false);
      showToast('Profil sauvegardé avec succès !', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast(error.response?.data?.detail || 'Impossible de sauvegarder', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (imageUrl) => {
    const field = imageSelector.type === 'avatar' ? 'avatar_url' : 'banner_url';
    setEditForm(prev => ({
      ...prev,
      [field]: imageUrl
    }));
  };

  const openImageSelector = (type) => {
    setImageSelector({ isOpen: true, type });
  };

  const addGameToProfile = async (gameId) => {
    try {
      await gamesAPI.addUserGame({
        game_id: gameId,
        skill_level: 'beginner',
        is_favorite: false
      });
      await loadProfile();
      showToast('Jeu ajouté !', 'success');
    } catch (error) {
      console.error('Failed to add game:', error);
      showToast(error.response?.data?.detail || 'Impossible d\'ajouter le jeu', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Profil introuvable</h2>
          <p className="text-gray-400">Une erreur est survenue lors du chargement de ton profil.</p>
        </div>
      </div>
    );
  }

  const skillInfo = SKILL_LEVELS[profile.skill_level] || SKILL_LEVELS.beginner;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Image Selector Modal */}
      <ImageSelector
        isOpen={imageSelector.isOpen}
        onClose={() => setImageSelector({ ...imageSelector, isOpen: false })}
        onSelect={handleImageSelect}
        type={imageSelector.type}
        currentImage={imageSelector.type === 'avatar' ? editForm.avatar_url : editForm.banner_url}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header with Banner */}
        <div className="relative mb-8">
          {/* Banner */}
          <div className="relative h-48 md:h-64 rounded-t-xl overflow-hidden">
            {profile.banner_url ? (
              <img
                src={profile.banner_url}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-darkest via-primary-dark to-primary-darkest" />
            )}
            {/* Banner overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          </div>

          {/* Profile Card overlapping banner */}
          <div className="relative -mt-20 mx-4">
            <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative -mt-16 md:-mt-20">
                  <Avatar
                    src={profile.avatar_url}
                    username={profile.username}
                    size={120}
                    className="ring-4 ring-gray-900 shadow-xl"
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 rounded-full border-4 border-gray-900" />
                </div>

                {/* User info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
                        {profile.username}
                      </h1>
                      {profile.region && (
                        <p className="text-gray-400 mt-1 flex items-center gap-1">
                          <span>📍</span> {profile.region}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 bg-gradient-primary hover:shadow-glow-red-lg rounded-lg transition-all shadow-glow-red flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      {isEditing ? 'Annuler' : 'Modifier'}
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`px-3 py-1 ${skillInfo.bg} ${skillInfo.color} rounded-full text-sm border ${skillInfo.border}`}>
                      {skillInfo.label}
                    </span>
                    <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm border border-green-500/20">
                      🎯 {LOOKING_FOR_LABELS[profile.looking_for] || 'Coéquipiers'}
                    </span>
                    <span className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-sm border border-gray-600/20">
                      🎮 {games.length} jeux
                    </span>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="text-gray-300 mt-4 max-w-2xl">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Image Selection Section */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                Images de profil
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Avatar</label>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={editForm.avatar_url}
                      username={profile.username}
                      size={80}
                      className="ring-2 ring-primary/50"
                    />
                    <button
                      type="button"
                      onClick={() => openImageSelector('avatar')}
                      className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Changer l'avatar
                    </button>
                  </div>
                </div>

                {/* Banner Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Bannière</label>
                  <div className="space-y-3">
                    <div className="relative h-24 rounded-lg overflow-hidden border border-primary/20">
                      {editForm.banner_url ? (
                        <img
                          src={editForm.banner_url}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary-darkest via-primary-dark to-primary-darkest" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openImageSelector('banner')}
                      className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Changer la bannière
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info Section */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                Informations
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Région</label>
                  <input
                    type="text"
                    name="region"
                    value={editForm.region || ''}
                    onChange={handleEditChange}
                    placeholder="ex: Europe, NA, Asie"
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date de naissance</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editForm.date_of_birth || ''}
                    onChange={handleEditChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fuseau horaire</label>
                  <input
                    type="text"
                    name="timezone"
                    value={editForm.timezone || ''}
                    onChange={handleEditChange}
                    placeholder="ex: Europe/Paris"
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Niveau global</label>
                  <select
                    name="skill_level"
                    value={editForm.skill_level || 'beginner'}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  >
                    {skillLevels.map(level => (
                      <option key={level} value={level}>{SKILL_LEVELS[level].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Je recherche</label>
                  <select
                    name="looking_for"
                    value={editForm.looking_for || 'teammates'}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  >
                    {lookingForOptions.map(option => (
                      <option key={option} value={option}>{LOOKING_FOR_LABELS[option]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Visibilité du profil</label>
                  <select
                    name="profile_visibility"
                    value={editForm.profile_visibility || 'public'}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Amis uniquement</option>
                    <option value="private">Privé</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={editForm.bio || ''}
                  onChange={handleEditChange}
                  maxLength={1000}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all resize-none"
                  placeholder="Parle-nous de toi..."
                />
                <p className="text-xs text-gray-500 mt-1">{(editForm.bio || '').length}/1000 caractères</p>
              </div>
            </div>

            {/* Gaming Accounts Section */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                Comptes Gaming
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">💬 Discord</span>
                  </label>
                  <input
                    type="text"
                    name="discord_username"
                    value={editForm.discord_username || ''}
                    onChange={handleEditChange}
                    placeholder="username"
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">🎮 Steam ID</span>
                  </label>
                  <input
                    type="text"
                    name="steam_id"
                    value={editForm.steam_id || ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">📺 Twitch</span>
                  </label>
                  <input
                    type="text"
                    name="twitch_username"
                    value={editForm.twitch_username || ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-2">🎯 Riot ID</span>
                  </label>
                  <input
                    type="text"
                    name="riot_id"
                    value={editForm.riot_id || ''}
                    onChange={handleEditChange}
                    placeholder="Name#TAG"
                    className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                Confidentialité
              </h2>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                  <div>
                    <p className="text-white font-medium">Afficher les statistiques</p>
                    <p className="text-sm text-gray-400">Les autres joueurs peuvent voir tes stats</p>
                  </div>
                  <input
                    type="checkbox"
                    name="show_stats"
                    checked={editForm.show_stats !== false}
                    onChange={handleEditChange}
                    className="w-5 h-5 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                  <div>
                    <p className="text-white font-medium">Accepter les demandes</p>
                    <p className="text-sm text-gray-400">Recevoir des demandes de match</p>
                  </div>
                  <input
                    type="checkbox"
                    name="allow_friend_requests"
                    checked={editForm.allow_friend_requests !== false}
                    onChange={handleEditChange}
                    className="w-5 h-5 accent-primary"
                  />
                </label>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50 rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Profile Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Info Card */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
                <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                  Informations
                </h2>
                <div className="space-y-3">
                  {profile.region && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">📍</span>
                      <span className="text-white">{profile.region}</span>
                    </div>
                  )}
                  {profile.timezone && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">🕐</span>
                      <span className="text-white">{profile.timezone}</span>
                    </div>
                  )}
                  {!profile.region && !profile.timezone && (
                    <p className="text-gray-500 text-sm">Aucune information ajoutée</p>
                  )}
                </div>
              </div>

              {/* Gaming Accounts Card */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
                <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                  Comptes Gaming
                </h2>
                <div className="space-y-3">
                  {profile.discord_username && (
                    <div className="flex items-center gap-3">
                      <span className="text-[#5865F2]">Discord</span>
                      <span className="text-white">{profile.discord_username}</span>
                    </div>
                  )}
                  {profile.steam_id && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">Steam</span>
                      <span className="text-white">{profile.steam_id}</span>
                    </div>
                  )}
                  {profile.twitch_username && (
                    <div className="flex items-center gap-3">
                      <span className="text-[#9146FF]">Twitch</span>
                      <span className="text-white">{profile.twitch_username}</span>
                    </div>
                  )}
                  {profile.riot_id && (
                    <div className="flex items-center gap-3">
                      <span className="text-[#D32936]">Riot ID</span>
                      <span className="text-white">{profile.riot_id}</span>
                    </div>
                  )}
                  {!profile.discord_username && !profile.steam_id && !profile.twitch_username && !profile.riot_id && (
                    <p className="text-gray-500 text-sm">Aucun compte lié</p>
                  )}
                </div>
              </div>
            </div>

            {/* Games */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                  Mes Jeux ({games.length})
                </h2>
                <select
                  onChange={(e) => { if (e.target.value) { addGameToProfile(parseInt(e.target.value)); e.target.value = ''; }}}
                  className="px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                >
                  <option value="">+ Ajouter un jeu</option>
                  {allGames.filter(game => !games.find(g => g.id === game.id)).map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>

              {games.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map(game => {
                    const gameSkill = SKILL_LEVELS[game.skill_level] || SKILL_LEVELS.beginner;
                    return (
                      <div key={game.id} className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg border border-primary/10 hover:border-primary-light/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{game.name}</h3>
                          {game.is_favorite && <span className="text-yellow-400">⭐</span>}
                        </div>
                        <p className="text-sm text-gray-400">{game.category}</p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="text-gray-400">Niveau: </span>
                            <span className={gameSkill.color}>{gameSkill.label}</span>
                          </p>
                          {game.rank && <p className="text-sm"><span className="text-gray-400">Rang:</span> <span className="text-white">{game.rank}</span></p>}
                          {game.hours_played > 0 && <p className="text-sm"><span className="text-gray-400">Heures:</span> <span className="text-white">{game.hours_played.toLocaleString()}h</span></p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>Aucun jeu ajouté. Ajoute des jeux pour que les autres te trouvent !</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
