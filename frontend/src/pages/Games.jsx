import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gamesAPI } from "../services";

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
};

const getGameIcon = (game) => {
  if (game.icon_url) return game.icon_url;
  if (GAME_IMAGES[game.name]) return GAME_IMAGES[game.name];
  const initials = game.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=640D14&color=fff&size=128&bold=true&format=png`;
};

const SKILL_LEVELS = {
  beginner: { label: 'Débutant', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' },
  intermediate: { label: 'Intermédiaire', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20' },
  advanced: { label: 'Avancé', color: 'text-neon-violet', bg: 'bg-violet-50 dark:bg-neon-violet/10 border border-violet-200 dark:border-neon-violet/20' },
  expert: { label: 'Expert', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20' },
};

const INPUT = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent transition-all text-sm';
const CARD = 'bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm dark:shadow-glass transition-all';

export default function Games() {
  const { user } = useAuth();
  const [allGames, setAllGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removingGameId, setRemovingGameId] = useState(null);
  const [activeTab, setActiveTab] = useState('my-games');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [gameForm, setGameForm] = useState({ show: false, game_id: '', skill_level: 'beginner', rank: '', hours_played: 0, is_favorite: false });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  const userGameIds = useMemo(() => new Set(userGames.map(g => g.id)), [userGames]);
  const availableGames = useMemo(() => allGames.filter(g => !userGameIds.has(g.id)), [allGames, userGameIds]);
  const gameCategories = useMemo(() => [...new Set(allGames.map(g => g.category).filter(Boolean))], [allGames]);

  useEffect(() => { if (user) loadGames(); }, [user]);

  const loadGames = async () => {
    try {
      const [allRes, userRes] = await Promise.all([gamesAPI.getAllGames(), gamesAPI.getUserGames()]);
      setAllGames(allRes.data);
      setUserGames(userRes.data);
    } catch { showToast('Erreur lors du chargement des jeux', 'error'); }
    finally { setLoading(false); }
  };

  const addGameToProfile = async (e) => {
    e.preventDefault();
    if (!gameForm.game_id) { showToast('Veuillez sélectionner un jeu', 'error'); return; }
    const gameId = parseInt(gameForm.game_id);
    const gameToAdd = allGames.find(g => g.id === gameId);
    if (!gameToAdd) { showToast('Jeu non trouvé', 'error'); return; }
    if (userGameIds.has(gameId)) { showToast('Ce jeu est déjà dans ton profil', 'error'); return; }

    setSubmitting(true);
    const optimisticGame = { id: gameId, name: gameToAdd.name, category: gameToAdd.category, icon_url: gameToAdd.icon_url, skill_level: gameForm.skill_level, game_rank: gameForm.rank || null, hours_played: parseInt(gameForm.hours_played) || 0, is_favorite: gameForm.is_favorite };
    setUserGames(prev => [...prev, optimisticGame]);
    setGameForm({ show: false, game_id: '', skill_level: 'beginner', rank: '', hours_played: 0, is_favorite: false });

    try {
      await gamesAPI.addUserGame({ game_id: gameId, skill_level: gameForm.skill_level, rank: gameForm.rank || null, hours_played: parseInt(gameForm.hours_played) || 0, is_favorite: gameForm.is_favorite });
      showToast(`${gameToAdd.name} ajouté !`, 'success');
    } catch (err) {
      setUserGames(prev => prev.filter(g => g.id !== gameId));
      showToast(err.response?.data?.detail || 'Impossible d\'ajouter le jeu', 'error');
    } finally { setSubmitting(false); }
  };

  const removeGame = async (gameId) => {
    const gameToRemove = userGames.find(g => g.id === gameId);
    if (!gameToRemove || !confirm(`Retirer ${gameToRemove.name} de ton profil ?`)) return;
    setRemovingGameId(gameId);
    setUserGames(prev => prev.filter(g => g.id !== gameId));
    try {
      await gamesAPI.removeUserGame(gameId);
      showToast(`${gameToRemove.name} retiré`, 'success');
    } catch {
      setUserGames(prev => [...prev, gameToRemove]);
      showToast('Impossible de retirer le jeu', 'error');
    } finally { setRemovingGameId(null); }
  };

  const openAddForm = (gameId = '') => {
    setGameForm({ show: true, game_id: gameId.toString(), skill_level: 'beginner', rank: '', hours_played: 0, is_favorite: false });
    setActiveTab('my-games');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Connecte-toi pour gérer tes jeux</h2>
          <a href="/login" className="px-6 py-3 bg-gradient-neon rounded-xl font-semibold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all">Connexion</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-sky-400 dark:border-neon-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Chargement de tes jeux...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark text-slate-900 dark:text-white">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-slide-in-right ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success'
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.message}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
            Mes Jeux
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gère ta bibliothèque pour trouver les coéquipiers parfaits</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'my-games', label: `Mes Jeux (${userGames.length})` },
            { id: 'all-games', label: `Parcourir (${availableGames.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-neon text-white shadow-glow-cyan'
                  : `${CARD} text-slate-600 dark:text-slate-400 hover:border-sky-300 dark:hover:border-neon-cyan/30`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'my-games' ? (
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">Ton profil gaming</h2>
              <button
                onClick={() => openAddForm()}
                disabled={availableGames.length === 0}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  availableGames.length === 0
                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 hover:scale-105'
                }`}
              >
                {availableGames.length === 0 ? 'Tous les jeux ajoutés' : '+ Ajouter un jeu'}
              </button>
            </div>

            {/* Add Form */}
            {gameForm.show && (
              <form onSubmit={addGameToProfile} className={`${CARD} p-6 mb-5 animate-fade-in`}>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Ajouter un jeu</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Jeu *</label>
                    <select value={gameForm.game_id} onChange={(e) => setGameForm({ ...gameForm, game_id: e.target.value })} required className={INPUT}>
                      <option value="">Sélectionner un jeu</option>
                      {availableGames.map(game => <option key={game.id} value={game.id}>{game.name} ({game.category})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Niveau</label>
                    <select value={gameForm.skill_level} onChange={(e) => setGameForm({ ...gameForm, skill_level: e.target.value })} className={INPUT}>
                      {Object.entries(SKILL_LEVELS).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Rang (optionnel)</label>
                    <input type="text" value={gameForm.rank} onChange={(e) => setGameForm({ ...gameForm, rank: e.target.value })} placeholder="Gold III, Diamond..." className={INPUT} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Heures jouées</label>
                    <input type="number" value={gameForm.hours_played} onChange={(e) => setGameForm({ ...gameForm, hours_played: Math.max(0, e.target.value) })} min="0" className={INPUT} />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-4 cursor-pointer group">
                  <input type="checkbox" checked={gameForm.is_favorite} onChange={(e) => setGameForm({ ...gameForm, is_favorite: e.target.checked })} className="w-4 h-4 accent-sky-500" />
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-neon-cyan transition-colors">⭐ Marquer comme favori</span>
                </label>
                <div className="flex gap-3 mt-5">
                  <button type="submit" disabled={submitting || !gameForm.game_id} className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${submitting || !gameForm.game_id ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50'}`}>
                    {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {submitting ? 'Ajout...' : 'Ajouter'}
                  </button>
                  <button type="button" onClick={() => setGameForm({ ...gameForm, show: false })} className={`px-5 py-2.5 ${CARD} text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20`}>
                    Annuler
                  </button>
                </div>
              </form>
            )}

            {/* User Games Grid */}
            {userGames.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userGames.map(game => {
                  const skillInfo = SKILL_LEVELS[game.skill_level] || SKILL_LEVELS.beginner;
                  return (
                    <div key={game.id} className={`${CARD} p-5 hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-md dark:hover:shadow-glow-cyan/10 group`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getGameIcon(game)}
                            alt={game.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-100 dark:bg-white/10"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(game.name.substring(0,2))}&background=640D14&color=fff&size=128`; }}
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-neon-cyan transition-colors">{game.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{game.category}</p>
                          </div>
                        </div>
                        {game.is_favorite && <span className="text-yellow-400">⭐</span>}
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Niveau</span>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${skillInfo.bg} ${skillInfo.color}`}>{skillInfo.label}</span>
                        </div>
                        {game.game_rank && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Rang</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{game.game_rank}</span>
                          </div>
                        )}
                        {game.hours_played > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Heures</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{game.hours_played.toLocaleString()}h</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => removeGame(game.id)}
                        disabled={removingGameId === game.id}
                        className="w-full px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/8 hover:border-red-200 dark:hover:border-red-500/20 disabled:opacity-50"
                      >
                        {removingGameId === game.id && <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />}
                        {removingGameId === game.id ? 'Suppression...' : 'Retirer du profil'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`${CARD} p-16 text-center`}>
                <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
                  <span className="text-3xl">🎮</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Pas encore de jeux</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Ajoute des jeux pour que les autres te trouvent</p>
                <button onClick={() => openAddForm()} className="px-6 py-3 bg-gradient-neon rounded-xl font-semibold text-sm text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105">
                  Ajouter ton premier jeu
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-5">Parcourir tous les jeux</h2>
            {gameCategories.map(category => {
              const categoryGames = allGames.filter(g => g.category === category);
              return (
                <div key={category} className="mb-8">
                  <h3 className="text-sm font-bold text-sky-600 dark:text-neon-cyan mb-3 flex items-center gap-2 uppercase tracking-wide">
                    {category}
                    <span className="text-slate-400 dark:text-slate-500 font-normal normal-case">({categoryGames.length})</span>
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {categoryGames.map(game => {
                      const isInProfile = userGameIds.has(game.id);
                      return (
                        <div key={game.id} className={`${CARD} p-4 ${isInProfile ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5' : 'hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-md'}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={getGameIcon(game)}
                              alt={game.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-white/10"
                              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(game.name.substring(0,2))}&background=640D14&color=fff&size=128`; }}
                            />
                            <div>
                              <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{game.name}</h4>
                              <p className="text-xs text-slate-400 dark:text-slate-500">{game.category}</p>
                            </div>
                          </div>
                          {isInProfile ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 rounded-lg px-3 py-1.5 border border-emerald-200 dark:border-emerald-500/20">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Dans ton profil
                            </div>
                          ) : (
                            <button onClick={() => openAddForm(game.id)} className="w-full px-3 py-2 bg-sky-50 dark:bg-neon-cyan/10 text-sky-600 dark:text-neon-cyan hover:bg-sky-100 dark:hover:bg-neon-cyan/20 border border-sky-200 dark:border-neon-cyan/20 rounded-xl text-xs font-semibold transition-all">
                              + Ajouter
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
