/**
 * Profile Page Component
 * Displays and allows editing of user profile
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, gamesAPI } from '../services';
import { Avatar } from '../components';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const lookingForOptions = ['teammates', 'mentor', 'casual_friends', 'competitive_team'];
  const visibilityOptions = ['public', 'friends', 'private'];

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
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Impossible de sauvegarder: ' + (error.response?.data?.detail || error.message));
    } finally {
      setSaving(false);
    }
  };

  const addGameToProfile = async (gameId) => {
    try {
      await gamesAPI.addUserGame({
        game_id: gameId,
        skill_level: 'beginner',
        is_favorite: false
      });
      await loadProfile();
    } catch (error) {
      console.error('Failed to add game:', error);
      alert('Impossible d\'ajouter le jeu: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar
                src={profile.avatar_url}
                username={profile.username}
                size={96}
                className="ring-2 ring-primary-light/50"
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
                  {profile.username}
                </h1>
                <p className="text-gray-400">@{profile.username}</p>
                {profile.region && (
                  <p className="text-gray-400 mt-1">📍 {profile.region}</p>
                )}
                <div className="flex gap-4 mt-2">
                  <span className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm border border-primary-light/20">
                    {profile.skill_level}
                  </span>
                  <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-sm border border-green-500/20">
                    Recherche {profile.looking_for?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-gradient-primary hover:shadow-glow-red-lg rounded-lg transition-all shadow-glow-red"
            >
              {isEditing ? 'Annuler' : 'Modifier le profil'}
            </button>
          </div>

          {profile.bio && (
            <div className="mt-4">
              <p className="text-gray-300">{profile.bio}</p>
            </div>
          )}
        </div>

        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSaveProfile} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">Modifier le profil</h2>

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
                  className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL Avatar</label>
                <input
                  type="url"
                  name="avatar_url"
                  value={editForm.avatar_url || ''}
                  onChange={handleEditChange}
                  placeholder="URL de ton image de profil"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Discord</label>
                <input
                  type="text"
                  name="discord_username"
                  value={editForm.discord_username || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Steam ID</label>
                <input
                  type="text"
                  name="steam_id"
                  value={editForm.steam_id || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Twitch</label>
                <input
                  type="text"
                  name="twitch_username"
                  value={editForm.twitch_username || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Niveau</label>
                <select
                  name="skill_level"
                  value={editForm.skill_level || 'beginner'}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                >
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
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
                    <option key={option} value={option}>{option.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Visibilité</label>
                <select
                  name="profile_visibility"
                  value={editForm.profile_visibility || 'public'}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                >
                  {visibilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
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
                className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                placeholder="Parle-nous de toi..."
              />
            </div>

            <div className="mt-6 flex gap-4">
              <label className="flex items-center">
                <input type="checkbox" name="show_stats" checked={editForm.show_stats !== false} onChange={handleEditChange} className="mr-2 accent-primary" />
                <span className="text-sm text-gray-300">Afficher les stats</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="allow_friend_requests" checked={editForm.allow_friend_requests !== false} onChange={handleEditChange} className="mr-2 accent-primary" />
                <span className="text-sm text-gray-300">Accepter les demandes</span>
              </label>
            </div>

            <div className="mt-6 flex gap-4">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50 rounded-lg transition-all disabled:opacity-50">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg transition-all">
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Profile Details */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">Détails du profil</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {profile.region && <div><h3 className="text-sm font-medium text-gray-400 uppercase">Région</h3><p className="mt-1 text-white">{profile.region}</p></div>}
                {profile.timezone && <div><h3 className="text-sm font-medium text-gray-400 uppercase">Fuseau</h3><p className="mt-1 text-white">{profile.timezone}</p></div>}
                {profile.discord_username && <div><h3 className="text-sm font-medium text-gray-400 uppercase">Discord</h3><p className="mt-1 text-white">{profile.discord_username}</p></div>}
                {profile.steam_id && <div><h3 className="text-sm font-medium text-gray-400 uppercase">Steam</h3><p className="mt-1 text-white">{profile.steam_id}</p></div>}
                {profile.twitch_username && <div><h3 className="text-sm font-medium text-gray-400 uppercase">Twitch</h3><p className="mt-1 text-white">{profile.twitch_username}</p></div>}
              </div>
            </div>

            {/* Games */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">Mes Jeux</h2>
                <select
                  onChange={(e) => { if (e.target.value) { addGameToProfile(parseInt(e.target.value)); e.target.value = ''; }}}
                  className="px-3 py-1 bg-gray-900/80 border border-primary/20 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                >
                  <option value="">Ajouter un jeu</option>
                  {allGames.filter(game => !games.find(g => g.id === game.id)).map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>

              {games.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {games.map(game => (
                    <div key={game.id} className="p-4 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg border border-primary/10 hover:border-primary-light/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{game.name}</h3>
                        {game.is_favorite && <span className="text-yellow-400">⭐</span>}
                      </div>
                      <p className="text-sm text-gray-400">{game.category}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm"><span className="text-gray-400">Niveau:</span> <span className="text-primary-light">{game.skill_level}</span></p>
                        {game.rank && <p className="text-sm"><span className="text-gray-400">Rang:</span> <span className="text-white">{game.rank}</span></p>}
                        {game.hours_played > 0 && <p className="text-sm"><span className="text-gray-400">Heures:</span> <span className="text-white">{game.hours_played}</span></p>}
                      </div>
                    </div>
                  ))}
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
