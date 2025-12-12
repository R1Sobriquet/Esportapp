/**
 * Games Page Component
 * Manages user's game library
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { gamesAPI } from "../services";

export default function Games() {
  const { user } = useAuth();
  const [allGames, setAllGames] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-games');
  const [gameForm, setGameForm] = useState({
    show: false,
    game_id: '',
    skill_level: 'beginner',
    rank: '',
    hours_played: 0,
    is_favorite: false
  });

  const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'];

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
    } finally {
      setLoading(false);
    }
  };

  const addGameToProfile = async (e) => {
    e.preventDefault();
    try {
      await gamesAPI.addUserGame({
        game_id: parseInt(gameForm.game_id),
        skill_level: gameForm.skill_level,
        rank: gameForm.rank || null,
        hours_played: parseInt(gameForm.hours_played) || 0,
        is_favorite: gameForm.is_favorite
      });
      await loadGames();
      setGameForm({ show: false, game_id: '', skill_level: 'beginner', rank: '', hours_played: 0, is_favorite: false });
    } catch (error) {
      console.error('Failed to add game:', error);
      alert('Impossible d\'ajouter le jeu: ' + (error.response?.data?.error || error.message));
    }
  };

  const removeGame = async (gameId) => {
    if (confirm('Es-tu sûr de vouloir retirer ce jeu de ton profil ?')) {
      try {
        await gamesAPI.removeUserGame(gameId);
        await loadGames();
      } catch (error) {
        console.error('Failed to remove game:', error);
      }
    }
  };

  const getAvailableGames = () => allGames.filter(game => !userGames.find(ug => ug.id === game.id));
  const gameCategories = [...new Set(allGames.map(game => game.category))];

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">Mes Jeux</h1>
          <p className="text-gray-400">Gère ta bibliothèque de jeux pour trouver les coéquipiers parfaits</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button onClick={() => setActiveTab('my-games')} className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'my-games' ? 'bg-gradient-primary text-white shadow-glow-red' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}>
            Mes Jeux ({userGames.length})
          </button>
          <button onClick={() => setActiveTab('all-games')} className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'all-games' ? 'bg-gradient-primary text-white shadow-glow-red' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}>
            Parcourir
          </button>
        </div>

        {activeTab === 'my-games' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Ton profil gaming</h2>
              <button onClick={() => setGameForm({ ...gameForm, show: true })} className="px-4 py-2 bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50 rounded-lg font-medium transition-all transform hover:scale-105">
                Ajouter un jeu
              </button>
            </div>

            {gameForm.show && (
              <form onSubmit={addGameToProfile} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-6 border border-primary/20 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-white">Ajouter un jeu</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Jeu</label>
                    <select value={gameForm.game_id} onChange={(e) => setGameForm({ ...gameForm, game_id: e.target.value })} required className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all">
                      <option value="">Sélectionner</option>
                      {getAvailableGames().map(game => <option key={game.id} value={game.id}>{game.name} ({game.category})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Niveau</label>
                    <select value={gameForm.skill_level} onChange={(e) => setGameForm({ ...gameForm, skill_level: e.target.value })} className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all">
                      {skillLevels.map(level => <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rang (Optionnel)</label>
                    <input type="text" value={gameForm.rank} onChange={(e) => setGameForm({ ...gameForm, rank: e.target.value })} placeholder="ex: Gold III" className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Heures jouées</label>
                    <input type="number" value={gameForm.hours_played} onChange={(e) => setGameForm({ ...gameForm, hours_played: e.target.value })} min="0" className="w-full px-3 py-2 bg-gray-900/80 border border-primary/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-light transition-all" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center"><input type="checkbox" checked={gameForm.is_favorite} onChange={(e) => setGameForm({ ...gameForm, is_favorite: e.target.checked })} className="mr-2 accent-primary" /><span className="text-sm text-gray-300">Favori</span></label>
                </div>
                <div className="mt-6 flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50 rounded-lg font-medium transition-all">Ajouter</button>
                  <button type="button" onClick={() => setGameForm({ ...gameForm, show: false })} className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg font-medium transition-all">Annuler</button>
                </div>
              </form>
            )}

            {userGames.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGames.map(game => (
                  <div key={game.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {game.icon_url && <img src={game.icon_url} alt={game.name} className="w-12 h-12 rounded-lg" />}
                        <div>
                          <h3 className="font-semibold text-lg text-white">{game.name}</h3>
                          <p className="text-sm text-gray-400">{game.category}</p>
                        </div>
                      </div>
                      {game.is_favorite && <span className="text-yellow-400 text-xl">⭐</span>}
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between"><span className="text-gray-400">Niveau:</span><span className="capitalize text-primary-light">{game.skill_level}</span></div>
                      {game.rank && <div className="flex justify-between"><span className="text-gray-400">Rang:</span><span className="text-white">{game.rank}</span></div>}
                      {game.hours_played > 0 && <div className="flex justify-between"><span className="text-gray-400">Heures:</span><span className="text-white">{game.hours_played}</span></div>}
                    </div>
                    <button onClick={() => removeGame(game.id)} className="w-full px-4 py-2 bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/30 rounded-lg text-sm transition-all">Retirer</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red"><span className="text-4xl">🎮</span></div>
                <h3 className="text-xl font-semibold mb-2 text-white">Pas encore de jeux</h3>
                <p className="text-gray-400 mb-4">Ajoute des jeux pour que les autres te trouvent</p>
                <button onClick={() => setGameForm({ ...gameForm, show: true })} className="px-6 py-2 bg-gradient-primary rounded-lg font-medium transition-all shadow-glow-red hover:shadow-glow-red-lg transform hover:scale-105">Ajouter ton premier jeu</button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-6 text-white">Parcourir tous les jeux</h2>
            {gameCategories.map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-primary-light">{category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allGames.filter(game => game.category === category).map(game => {
                    const isInProfile = userGames.find(ug => ug.id === game.id);
                    return (
                      <div key={game.id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-primary/20 hover:border-primary-light/40 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          {game.icon_url && <img src={game.icon_url} alt={game.name} className="w-10 h-10 rounded-lg" />}
                          <div><h4 className="font-medium text-white">{game.name}</h4><p className="text-xs text-gray-400">{game.category}</p></div>
                        </div>
                        {isInProfile ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm"><span>✓</span><span>Dans ton profil</span></div>
                        ) : (
                          <button onClick={() => setGameForm({ ...gameForm, show: true, game_id: game.id.toString() })} className="w-full px-3 py-2 bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/30 rounded text-sm transition-all">Ajouter</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
