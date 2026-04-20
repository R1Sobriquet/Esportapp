import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI, gamesAPI } from '../services';
import { Avatar, ImageSelector } from '../components';

const SKILL_LEVELS = {
  beginner:     { label: 'Débutant',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/20' },
  intermediate: { label: 'Intermédiaire', color: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-50 dark:bg-sky-500/10',         border: 'border-sky-200 dark:border-sky-500/20' },
  advanced:     { label: 'Avancé',        color: 'text-violet-600 dark:text-violet-400',   bg: 'bg-violet-50 dark:bg-violet-500/10',   border: 'border-violet-200 dark:border-violet-500/20' },
  expert:       { label: 'Expert',        color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-500/10',     border: 'border-amber-200 dark:border-amber-500/20' }
};

const LOOKING_FOR_LABELS = {
  teammates:        'Coéquipiers',
  mentor:           'Un mentor',
  casual_friends:   'Amis casual',
  competitive_team: 'Équipe compétitive'
};

const CARD = 'bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm dark:shadow-glass';
const INPUT = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent transition-all text-sm';
const LABEL = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide';

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

  const [imageSelector, setImageSelector] = useState({ isOpen: false, type: 'avatar' });
  const [editingGame, setEditingGame] = useState(null);
  const [gameEditForm, setGameEditForm] = useState({});
  const [savingGame, setSavingGame] = useState(false);

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
  const lookingForOptions = ['teammates', 'mentor', 'casual_friends', 'competitive_team'];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (user) { loadProfile(); loadAllGames(); }
  }, [user]);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getProfile();
      setProfile(response.data.profile);
      setGames(response.data.games);
      setEditForm({ ...response.data.profile, preferences: response.data.preferences });
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
      setEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
    setEditForm(prev => ({ ...prev, [field]: imageUrl }));
  };

  const openImageSelector = (type) => setImageSelector({ isOpen: true, type });

  const openGameEditor = (game) => {
    setEditingGame(game);
    setGameEditForm({
      game_id: game.id,
      skill_level: game.skill_level || 'beginner',
      game_rank: game.game_rank || game.rank || '',
      hours_played: game.hours_played || 0,
      is_favorite: game.is_favorite || false,
    });
  };

  const handleGameEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGameEditForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveGame = async () => {
    setSavingGame(true);
    try {
      await gamesAPI.updateUserGame(editingGame.id, gameEditForm);
      await loadProfile();
      setEditingGame(null);
      showToast('Jeu mis à jour !', 'success');
    } catch (error) {
      console.error('Failed to update game:', error);
      showToast(error.response?.data?.detail || 'Impossible de modifier le jeu', 'error');
    } finally {
      setSavingGame(false);
    }
  };

  const addGameToProfile = async (gameId) => {
    try {
      await gamesAPI.addUserGame({ game_id: gameId, skill_level: 'beginner', is_favorite: false });
      await loadProfile();
      showToast('Jeu ajouté !', 'success');
    } catch (error) {
      console.error('Failed to add game:', error);
      showToast(error.response?.data?.detail || 'Impossible d\'ajouter le jeu', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-sky-500 dark:border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Profil introuvable</h2>
          <p className="text-slate-500 dark:text-slate-400">Une erreur est survenue lors du chargement de ton profil.</p>
        </div>
      </div>
    );
  }

  const skillInfo = SKILL_LEVELS[profile.skill_level] || SKILL_LEVELS.beginner;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-28 right-4 z-50 px-5 py-3 rounded-xl shadow-lg border animate-fade-in flex items-center gap-2 text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.message}
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

      {/* Game Edit Modal */}
      {editingGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`${CARD} p-6 w-full max-w-md animate-fade-in`}>
            <h3 className="text-lg font-bold mb-5 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
              Modifier — {editingGame.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className={LABEL}>Niveau</label>
                <select name="skill_level" value={gameEditForm.skill_level} onChange={handleGameEditChange} className={INPUT}>
                  {skillLevels.map(level => (
                    <option key={level} value={level}>{SKILL_LEVELS[level].label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL}>Rang <span className="normal-case font-normal">(optionnel)</span></label>
                <input
                  type="text"
                  name="game_rank"
                  value={gameEditForm.game_rank}
                  onChange={handleGameEditChange}
                  placeholder="Gold III, Diamond, Global Elite…"
                  maxLength={100}
                  className={INPUT}
                />
              </div>

              <div>
                <label className={LABEL}>Heures jouées</label>
                <input
                  type="number"
                  name="hours_played"
                  value={gameEditForm.hours_played}
                  onChange={handleGameEditChange}
                  min="0"
                  max="100000"
                  className={INPUT}
                />
              </div>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer hover:border-sky-300 dark:hover:border-neon-cyan/30 transition-all">
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">Jeu favori</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mis en avant sur ton profil</p>
                </div>
                <input
                  type="checkbox"
                  name="is_favorite"
                  checked={gameEditForm.is_favorite}
                  onChange={handleGameEditChange}
                  className="w-5 h-5 accent-sky-500"
                />
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveGame}
                disabled={savingGame}
                className="flex-1 px-4 py-2.5 bg-gradient-to-br from-emerald-500 to-green-400 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-400/30 transition-all disabled:opacity-50"
              >
                {savingGame ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => setEditingGame(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Banner */}
          <div className="relative h-44 md:h-56 rounded-2xl overflow-hidden">
            {profile.banner_url ? (
              <img src={profile.banner_url} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-sky-400 via-violet-500 to-neon-cyan dark:from-gaming-surface dark:via-neon-violet/40 dark:to-gaming-surfaceLight" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 dark:from-gaming-dark/80 to-transparent" />
          </div>

          {/* Profile Card overlapping banner */}
          <div className="relative -mt-16 mx-2">
            <div className={`${CARD} p-5 md:p-6`}>
              <div className="flex flex-col md:flex-row items-start md:items-end gap-5">
                {/* Avatar */}
                <div className="relative -mt-14 shrink-0">
                  <Avatar
                    src={profile.avatar_url}
                    username={profile.username}
                    size={112}
                    className="ring-4 ring-white dark:ring-gaming-dark shadow-xl"
                  />
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-gaming-dark" />
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
                        {profile.username}
                      </h1>
                      {profile.region && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>📍</span> {profile.region}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                        isEditing
                          ? 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                          : 'bg-gradient-neon text-white shadow-glow-cyan hover:shadow-glow-cyan-lg hover:scale-[1.02]'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      {isEditing ? 'Annuler' : 'Modifier'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${skillInfo.bg} ${skillInfo.color} ${skillInfo.border}`}>
                      {skillInfo.label}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                      🎯 {LOOKING_FOR_LABELS[profile.looking_for] || 'Coéquipiers'}
                    </span>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-white/8 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                      🎮 {games.length} jeux
                    </span>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 max-w-2xl leading-relaxed">{profile.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Images Section */}
            <div className={`${CARD} p-6`}>
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-5">Images de profil</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL}>Avatar</label>
                  <div className="flex items-center gap-4">
                    <Avatar src={editForm.avatar_url} username={profile.username} size={72} className="ring-2 ring-sky-300 dark:ring-neon-cyan/40 shrink-0" />
                    <button
                      type="button"
                      onClick={() => openImageSelector('avatar')}
                      className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-neon-cyan/30 rounded-xl text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Changer
                    </button>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Bannière</label>
                  <div className="space-y-2">
                    <div className="relative h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                      {editForm.banner_url
                        ? <img src={editForm.banner_url} alt="Banner preview" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-r from-sky-400 via-violet-500 to-neon-cyan dark:from-gaming-surface dark:via-neon-violet/40 dark:to-gaming-surfaceLight" />
                      }
                    </div>
                    <button
                      type="button"
                      onClick={() => openImageSelector('banner')}
                      className="px-3 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-neon-cyan/30 rounded-xl text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 transition-all"
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
            <div className={`${CARD} p-6`}>
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-5">Informations</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={LABEL}>Région</label>
                  <input type="text" name="region" value={editForm.region || ''} onChange={handleEditChange} placeholder="Europe, NA, Asie…" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Date de naissance</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={editForm.date_of_birth || ''}
                    onChange={handleEditChange}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
                    className={INPUT}
                  />
                </div>
                <div>
                  <label className={LABEL}>Fuseau horaire</label>
                  <input type="text" name="timezone" value={editForm.timezone || ''} onChange={handleEditChange} placeholder="Europe/Paris" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Niveau global</label>
                  <select name="skill_level" value={editForm.skill_level || 'beginner'} onChange={handleEditChange} className={INPUT}>
                    {skillLevels.map(level => (
                      <option key={level} value={level}>{SKILL_LEVELS[level].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Je recherche</label>
                  <select name="looking_for" value={editForm.looking_for || 'teammates'} onChange={handleEditChange} className={INPUT}>
                    {lookingForOptions.map(option => (
                      <option key={option} value={option}>{LOOKING_FOR_LABELS[option]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Visibilité du profil</label>
                  <select name="profile_visibility" value={editForm.profile_visibility || 'public'} onChange={handleEditChange} className={INPUT}>
                    <option value="public">Public</option>
                    <option value="friends">Amis uniquement</option>
                    <option value="private">Privé</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className={LABEL}>Bio</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={editForm.bio || ''}
                  onChange={handleEditChange}
                  maxLength={1000}
                  className={INPUT + ' resize-none'}
                  placeholder="Parle-nous de toi..."
                />
                <p className="text-xs text-slate-400 mt-1">{(editForm.bio || '').length}/1000 caractères</p>
              </div>
            </div>

            {/* Gaming Accounts */}
            <div className={`${CARD} p-6`}>
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-5">Comptes Gaming</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'discord_username', label: 'Discord', placeholder: 'username', icon: '💬' },
                  { name: 'steam_id', label: 'Steam ID', placeholder: '', icon: '🎮' },
                  { name: 'twitch_username', label: 'Twitch', placeholder: '', icon: '📺' },
                  { name: 'riot_id', label: 'Riot ID', placeholder: 'Name#TAG', icon: '🎯' },
                ].map(field => (
                  <div key={field.name}>
                    <label className={LABEL}>{field.icon} {field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      value={editForm[field.name] || ''}
                      onChange={handleEditChange}
                      placeholder={field.placeholder}
                      className={INPUT}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className={`${CARD} p-6`}>
              <h2 className="text-base font-bold text-slate-800 dark:text-white mb-5">Confidentialité</h2>
              <div className="space-y-3">
                {[
                  { name: 'show_stats', label: 'Afficher les statistiques', sub: 'Les autres joueurs peuvent voir tes stats', defaultVal: true },
                  { name: 'allow_friend_requests', label: 'Accepter les demandes', sub: 'Recevoir des demandes de match', defaultVal: true },
                ].map(item => (
                  <label key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-neon-cyan/30 cursor-pointer transition-all">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</p>
                    </div>
                    <input
                      type="checkbox"
                      name={item.name}
                      checked={editForm[item.name] !== false}
                      onChange={handleEditChange}
                      className="w-5 h-5 accent-sky-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-br from-emerald-500 to-green-400 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-400/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-slate-300 rounded-xl font-semibold text-sm transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              {/* Info Card */}
              <div className={`${CARD} p-5`}>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Informations</h2>
                <div className="space-y-3">
                  {profile.region && (
                    <div className="flex items-center gap-3">
                      <span className="text-base">📍</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{profile.region}</span>
                    </div>
                  )}
                  {profile.timezone && (
                    <div className="flex items-center gap-3">
                      <span className="text-base">🕐</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{profile.timezone}</span>
                    </div>
                  )}
                  {!profile.region && !profile.timezone && (
                    <p className="text-sm text-slate-400 dark:text-slate-500">Aucune information ajoutée</p>
                  )}
                </div>
              </div>

              {/* Gaming Accounts Card */}
              <div className={`${CARD} p-5`}>
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Comptes Gaming</h2>
                <div className="space-y-2.5">
                  {profile.discord_username && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#5865F2] w-14">Discord</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{profile.discord_username}</span>
                    </div>
                  )}
                  {profile.steam_id && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 w-14">Steam</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{profile.steam_id}</span>
                    </div>
                  )}
                  {profile.twitch_username && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#9146FF] w-14">Twitch</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{profile.twitch_username}</span>
                    </div>
                  )}
                  {profile.riot_id && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#D32936] w-14">Riot ID</span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{profile.riot_id}</span>
                    </div>
                  )}
                  {!profile.discord_username && !profile.steam_id && !profile.twitch_username && !profile.riot_id && (
                    <p className="text-sm text-slate-400 dark:text-slate-500">Aucun compte lié</p>
                  )}
                </div>
              </div>
            </div>

            {/* Games */}
            <div className={`${CARD} p-5`}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Mes Jeux <span className="text-sky-500 dark:text-neon-cyan">({games.length})</span>
                </h2>
                <select
                  onChange={(e) => { if (e.target.value) { addGameToProfile(parseInt(e.target.value)); e.target.value = ''; }}}
                  className="px-3 py-1.5 bg-gradient-neon text-white text-xs font-semibold rounded-lg shadow-glow-cyan cursor-pointer border-0 focus:outline-none"
                >
                  <option value="">+ Ajouter</option>
                  {allGames.filter(game => !games.find(g => g.id === game.id)).map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>

              {games.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {games.map(game => {
                    const gameSkill = SKILL_LEVELS[game.skill_level] || SKILL_LEVELS.beginner;
                    return (
                      <div key={game.id} className="p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/8 hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-sm dark:hover:shadow-glow-cyan/10 transition-all group">
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">{game.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{game.category}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {game.is_favorite && <span className="text-amber-400 text-sm">⭐</span>}
                            <button
                              onClick={() => openGameEditor(game)}
                              className="text-slate-400 hover:text-sky-500 dark:hover:text-neon-cyan transition-colors opacity-0 group-hover:opacity-100"
                              title="Modifier ce jeu"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full border ${gameSkill.bg} ${gameSkill.color} ${gameSkill.border}`}>
                            {gameSkill.label}
                          </span>
                          {game.rank && <p className="text-xs text-slate-500 dark:text-slate-400">Rang: <span className="text-slate-700 dark:text-slate-200">{game.rank}</span></p>}
                          {game.hours_played > 0 && <p className="text-xs text-slate-500 dark:text-slate-400">Heures: <span className="text-slate-700 dark:text-slate-200">{game.hours_played.toLocaleString()}h</span></p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-3xl mb-3">🎮</div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aucun jeu ajouté. Ajoute des jeux pour que les autres te trouvent !</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
