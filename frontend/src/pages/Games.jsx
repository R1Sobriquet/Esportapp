/**
 * Games Page Component
 * Manages user's game library with optimized filtering and optimistic updates
 */

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gamesAPI } from "../services";

// Game images mapping - predefined icons for popular games
const GAME_IMAGES = {
  'Valorant': 'https://static.wikia.nocookie.net/valorant/images/f/f3/Valorant_icon.png',
  'League of Legends': 'https://static.wikia.nocookie.net/leagueoflegends/images/0/07/League_of_Legends_icon.png',
  'Counter-Strike 2': 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_231x87.jpg',
  'CS:GO': 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_231x87.jpg',
  'Overwatch 2': 'https://blz-contentstack-images.akamaized.net/v3/assets/blt9c12f249ac15c7ec/bltbcf2689c29fa39eb/622906a991f4232f0085d3cc/Masthead_Overwatch2_Logo.png',
  'Apex Legends': 'https://media.contentapi.ea.com/content/dam/apex-legends/common/logos/apex-white-icon.png',
  'Fortnite': 'https://cdn2.unrealengine.com/fortnite-logo-300x167-1920x1080-432974386.png',
  'Rocket League': 'https://rocketleague.media.zestyio.com/rl_logo.f1cb27a519bdb5b6ed34049a5b86e317.png',
  'Dota 2': 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/capsule_231x87.jpg',
  'Rainbow Six Siege': 'https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/5kqPQJHVeJUGP0IsvS7E9l/f5cbb1665c6a69e5db6e0faff5f78c4e/r6s-logo-white.png',
  'PUBG': 'https://cdn.cloudflare.steamstatic.com/steam/apps/578080/capsule_231x87.jpg',
  'Minecraft': 'https://www.minecraft.net/content/dam/games/minecraft/key-art/MC-Legends-keyart-logo-desktop.jpg',
  'World of Warcraft': 'https://blz-contentstack-images.akamaized.net/v3/assets/blt3452e3b114fab0cd/blt87c5082e4c7a0a2b/wow-logo.png',
  'FIFA 24': 'https://media.contentapi.ea.com/content/dam/ea/fc/fc-24/common/fc24-logo-primary-light.png',
  'Call of Duty: Warzone': 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/warzone/common/wz-logo.png',
  'Genshin Impact': 'https://upload-static.hoyoverse.com/contentweb/20210610/2021061014395347509.png',
  'Teamfight Tactics': 'https://static.wikia.nocookie.net/leagueoflegends/images/a/a4/Teamfight_Tactics_icon.png',
  'Hearthstone': 'https://blz-contentstack-images.akamaized.net/v3/assets/bltf408a0557f4e4998/blt7e8b5d1be24fd32a/hearthstone-logo.png',
  'Street Fighter 6': 'https://www.streetfighter.com/6/assets/images/common/logo-sf6.png',
  'Tekken 8': 'https://tekken.com/assets/images/common/logo.png',
  'Smash Bros Ultimate': 'https://www.smashbros.com/assets_v2/img/top/hero_logo.png',
  'Starcraft 2': 'https://blz-contentstack-images.akamaized.net/v3/assets/blt9c12f249ac15c7ec/blt2ad2bea5d9bb3e83/sc2-logo.png',
  'Dead by Daylight': 'https://cdn.cloudflare.steamstatic.com/steam/apps/381210/capsule_231x87.jpg',
  'Fall Guys': 'https://cdn2.unrealengine.com/fall-guys-logo-1920x1080-1920x1080-b7e15ac5ba02.png',
};

// Generate fallback icon with game initials
const getGameIcon = (game) => {
  if (game.icon_url) return game.icon_url;
  if (GAME_IMAGES[game.name]) return GAME_IMAGES[game.name];

  // Generate placeholder with initials
  const initials = game.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=640D14&color=fff&size=128&bold=true&format=png`;
};

// Skill level labels and colors
const SKILL_LEVELS = {
  beginner: { label: 'Débutant', color: 'text-green-400', bg: 'bg-green-500/20' },
  intermediate: { label: 'Intermédiaire', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  advanced: { label: 'Avancé', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  expert: { label: 'Expert', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
};

export default function Games() {
  const { user } = useAuth();
  const [allGames, setAllGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingGameId, setRemovingGameId] = useState(null);
  const [activeTab, setActiveTab] = useState('my-games');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [gameForm, setGameForm] = useState({
    show: false,
    game_id: '',
    skill_level: 'beginner',
    rank: '',
    hours_played: 0,
    is_favorite: false
  });

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  // Memoized Set of user game IDs for O(1) lookup
  const userGameIds = useMemo(() => {
    return new Set(userGames.map(game => game.id));
  }, [userGames]);

  // Memoized available games (not in user profile)
  const availableGames = useMemo(() => {
    return allGames.filter(game => !userGameIds.has(game.id));
  }, [allGames, userGameIds]);

  // Memoized game categories
  const gameCategories = useMemo(() => {
    return [...new Set(allGames.map(game => game.category).filter(Boolean))];
  }, [allGames]);

  useEffect(() => {
    if (user) {
      loadGames();
    }
  }, [user]);

  const loadGames = async () => {
    try {
      const [allGamesRes, userGamesRes] = await Promise.all([
        gamesAPI.getAllGames(),
        gamesAPI.getUserGames()
      ]);
      setAllGames(allGamesRes.data);
      setUserGames(userGamesRes.data);
    } catch (error) {
      console.error('Failed to load games:', error);
      showToast('Erreur lors du chargement des jeux', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addGameToProfile = async (e) => {
    e.preventDefault();

    if (!gameForm.game_id) {
      showToast('Veuillez sélectionner un jeu', 'error');
      return;
    }

    const gameId = parseInt(gameForm.game_id);
    const gameToAdd = allGames.find(g => g.id === gameId);

    if (!gameToAdd) {
      showToast('Jeu non trouvé', 'error');
      return;
    }

    // Check if already in profile (double safety)
    if (userGameIds.has(gameId)) {
      showToast('Ce jeu est déjà dans ton profil', 'error');
      return;
    }

    setSubmitting(true);

    // Optimistic update - add to UI immediately
    const optimisticGame = {
      id: gameId,
      name: gameToAdd.name,
      category: gameToAdd.category,
      icon_url: gameToAdd.icon_url,
      skill_level: gameForm.skill_level,
      game_rank: gameForm.rank || null,
      hours_played: parseInt(gameForm.hours_played) || 0,
      is_favorite: gameForm.is_favorite
    };

    setUserGames(prev => [...prev, optimisticGame]);

    // Reset form immediately for better UX
    setGameForm({
      show: false,
      game_id: '',
      skill_level: 'beginner',
      rank: '',
      hours_played: 0,
      is_favorite: false
    });

    try {
      await gamesAPI.addUserGame({
        game_id: gameId,
        skill_level: gameForm.skill_level,
        rank: gameForm.rank || null,
        hours_played: parseInt(gameForm.hours_played) || 0,
        is_favorite: gameForm.is_favorite
      });

      showToast(`${gameToAdd.name} ajouté à ton profil !`, 'success');
    } catch (error) {
      // Revert optimistic update on error
      setUserGames(prev => prev.filter(g => g.id !== gameId));
      console.error('Failed to add game:', error);
      showToast(error.response?.data?.detail || 'Impossible d\'ajouter le jeu', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const removeGame = async (gameId) => {
    const gameToRemove = userGames.find(g => g.id === gameId);
    if (!gameToRemove) return;

    if (!confirm(`Es-tu sûr de vouloir retirer ${gameToRemove.name} de ton profil ?`)) {
      return;
    }

    setRemovingGameId(gameId);

    // Optimistic update - remove from UI immediately
    setUserGames(prev => prev.filter(g => g.id !== gameId));

    try {
      await gamesAPI.removeUserGame(gameId);
      showToast(`${gameToRemove.name} retiré de ton profil`, 'success');
    } catch (error) {
      // Revert optimistic update on error
      setUserGames(prev => [...prev, gameToRemove]);
      console.error('Failed to remove game:', error);
      showToast('Impossible de retirer le jeu', 'error');
    } finally {
      setRemovingGameId(null);
    }
  };

  const openAddForm = (gameId = '') => {
    setGameForm({
      show: true,
      game_id: gameId.toString(),
      skill_level: 'beginner',
      rank: '',
      hours_played: 0,
      is_favorite: false
    });
    setActiveTab('my-games');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Connecte-toi pour gérer tes jeux</h2>
          <a href="/login" className="px-6 py-2 bg-gradient-primary rounded-lg shadow-glow-red hover:shadow-glow-red-lg transition-all">Connexion</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de tes jeux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">Mes Jeux</h1>
          <p className="text-gray-400">Gère ta bibliothèque de jeux pour trouver les coéquipiers parfaits</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('my-games')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'my-games'
                ? 'bg-gradient-primary text-white shadow-glow-red'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            Mes Jeux ({userGames.length})
          </button>
          <button
            onClick={() => setActiveTab('all-games')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'all-games'
                ? 'bg-gradient-primary text-white shadow-glow-red'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            Parcourir ({availableGames.length} disponibles)
          </button>
        </div>

        {activeTab === 'my-games' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Ton profil gaming</h2>
              <button
                onClick={() => openAddForm()}
                disabled={availableGames.length === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                  availableGames.length === 0
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50'
                }`}
              >
                {availableGames.length === 0 ? 'Tous les jeux ajoutés' : 'Ajouter un jeu'}
              </button>
            </div>

            {/* Add Game Form */}
            {gameForm.show && (
              <form onSubmit={addGameToProfile} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/20 shadow-lg animate-fadeIn">
                <h3 className="text-lg font-semibold mb-4 text-white">Ajouter un jeu</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jeu *</label>
                    <select
                      value={gameForm.game_id}
                      onChange={(e) => setGameForm({ ...gameForm, game_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                    >
                      <option value="">Sélectionner un jeu</option>
                      {availableGames.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.name} ({game.category})
                        </option>
                      ))}
                    </select>
                    {availableGames.length === 0 && (
                      <p className="text-sm text-yellow-400 mt-1">Tous les jeux sont déjà dans ton profil !</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Niveau</label>
                    <select
                      value={gameForm.skill_level}
                      onChange={(e) => setGameForm({ ...gameForm, skill_level: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                    >
                      {Object.entries(SKILL_LEVELS).map(([value, { label }]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rang (Optionnel)</label>
                    <input
                      type="text"
                      value={gameForm.rank}
                      onChange={(e) => setGameForm({ ...gameForm, rank: e.target.value })}
                      placeholder="ex: Gold III, Diamond, etc."
                      className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Heures jouées</label>
                    <input
                      type="number"
                      value={gameForm.hours_played}
                      onChange={(e) => setGameForm({ ...gameForm, hours_played: Math.max(0, e.target.value) })}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={gameForm.is_favorite}
                      onChange={(e) => setGameForm({ ...gameForm, is_favorite: e.target.checked })}
                      className="mr-2 accent-primary w-4 h-4"
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      ⭐ Marquer comme favori
                    </span>
                  </label>
                </div>
                <div className="mt-6 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting || !gameForm.game_id}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      submitting || !gameForm.game_id
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50'
                    }`}
                  >
                    {submitting && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {submitting ? 'Ajout...' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameForm({ ...gameForm, show: false })}
                    className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg font-medium transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* User Games Grid */}
            {userGames.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGames.map(game => {
                  const skillInfo = SKILL_LEVELS[game.skill_level] || SKILL_LEVELS.beginner;
                  return (
                    <div
                      key={game.id}
                      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={getGameIcon(game)}
                            alt={game.name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-800"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(game.name.substring(0,2))}&background=640D14&color=fff&size=128`;
                            }}
                          />
                          <div>
                            <h3 className="font-semibold text-lg text-white group-hover:text-primary-light transition-colors">{game.name}</h3>
                            <p className="text-sm text-gray-400">{game.category}</p>
                          </div>
                        </div>
                        {game.is_favorite && <span className="text-yellow-400 text-xl animate-pulse">⭐</span>}
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Niveau:</span>
                          <span className={`px-2 py-0.5 rounded text-sm ${skillInfo.bg} ${skillInfo.color}`}>
                            {skillInfo.label}
                          </span>
                        </div>
                        {game.game_rank && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rang:</span>
                            <span className="text-white font-medium">{game.game_rank}</span>
                          </div>
                        )}
                        {game.hours_played > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Heures:</span>
                            <span className="text-white">{game.hours_played.toLocaleString()}h</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeGame(game.id)}
                        disabled={removingGameId === game.id}
                        className={`w-full px-4 py-2 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${
                          removingGameId === game.id
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/30'
                        }`}
                      >
                        {removingGameId === game.id && (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {removingGameId === game.id ? 'Suppression...' : 'Retirer'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red">
                  <span className="text-4xl">🎮</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Pas encore de jeux</h3>
                <p className="text-gray-400 mb-4">Ajoute des jeux pour que les autres te trouvent</p>
                <button
                  onClick={() => openAddForm()}
                  className="px-6 py-2 bg-gradient-primary rounded-lg font-medium transition-all shadow-glow-red hover:shadow-glow-red-lg transform hover:scale-105"
                >
                  Ajouter ton premier jeu
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-white">Parcourir tous les jeux</h2>
            {gameCategories.length > 0 ? (
              gameCategories.map(category => {
                const categoryGames = allGames.filter(game => game.category === category);
                return (
                  <div key={category} className="mb-8">
                    <h3 className="text-lg font-medium mb-4 text-primary-light flex items-center gap-2">
                      {category}
                      <span className="text-sm text-gray-400 font-normal">({categoryGames.length} jeux)</span>
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryGames.map(game => {
                        const isInProfile = userGameIds.has(game.id);
                        return (
                          <div
                            key={game.id}
                            className={`bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-lg p-4 border transition-all ${
                              isInProfile
                                ? 'border-green-500/40 bg-green-900/10'
                                : 'border-primary/20 hover:border-primary-light/40'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={getGameIcon(game)}
                                alt={game.name}
                                className="w-10 h-10 rounded-lg object-cover bg-gray-800"
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(game.name.substring(0,2))}&background=640D14&color=fff&size=128`;
                                }}
                              />
                              <div>
                                <h4 className="font-medium text-white">{game.name}</h4>
                                <p className="text-xs text-gray-400">{game.category}</p>
                              </div>
                            </div>
                            {isInProfile ? (
                              <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 rounded px-2 py-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Dans ton profil</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => openAddForm(game.id)}
                                className="w-full px-3 py-2 bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/30 rounded text-sm transition-all hover:shadow-glow-red"
                              >
                                + Ajouter
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucun jeu disponible</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
