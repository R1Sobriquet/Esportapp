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
      setGameForm({
        show: false,
        game_id: '',
        skill_level: 'beginner',
        rank: '',
        hours_played: 0,
        is_favorite: false
      });
      
    } catch (error) {
      console.error('Failed to add game:', error);
      alert('Failed to add game: ' + (error.response?.data?.error || error.message));
    }
  };

  const removeGame = async (gameId) => {
    if (confirm('Are you sure you want to remove this game from your profile?')) {
      try {
        await gamesAPI.removeUserGame(gameId);
        await loadGames();
      } catch (error) {
        console.error('Failed to remove game:', error);
        alert('Failed to remove game: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const getAvailableGames = () => {
    return allGames.filter(game => !userGames.find(ug => ug.id === game.id));
  };

  const gameCategories = [...new Set(allGames.map(game => game.category))];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Please log in to manage your games</h2>
          <a href="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Games</h1>
          <p className="text-gray-400">
            Manage your game library to help others find the perfect teammate
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('my-games')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'my-games'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            My Games ({userGames.length})
          </button>
          <button
            onClick={() => setActiveTab('all-games')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all-games'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Browse Games
          </button>
        </div>

        {activeTab === 'my-games' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Gaming Profile</h2>
              <button
                onClick={() => setGameForm({ ...gameForm, show: true })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                Add Game
              </button>
            </div>

            {/* Add Game Form */}
            {gameForm.show && (
              <form onSubmit={addGameToProfile} className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Add Game to Profile</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Game
                    </label>
                    <select
                      value={gameForm.game_id}
                      onChange={(e) => setGameForm({ ...gameForm, game_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="">Select a game</option>
                      {getAvailableGames().map(game => (
                        <option key={game.id} value={game.id}>
                          {game.name} ({game.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Skill Level
                    </label>
                    <select
                      value={gameForm.skill_level}
                      onChange={(e) => setGameForm({ ...gameForm, skill_level: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      {skillLevels.map(level => (
                        <option key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Rank (Optional)
                    </label>
                    <input
                      type="text"
                      value={gameForm.rank}
                      onChange={(e) => setGameForm({ ...gameForm, rank: e.target.value })}
                      placeholder="e.g., Gold III, Diamond, etc."
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hours Played
                    </label>
                    <input
                      type="number"
                      value={gameForm.hours_played}
                      onChange={(e) => setGameForm({ ...gameForm, hours_played: e.target.value })}
                      min="0"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={gameForm.is_favorite}
                      onChange={(e) => setGameForm({ ...gameForm, is_favorite: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Mark as favorite</span>
                  </label>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                  >
                    Add Game
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameForm({ ...gameForm, show: false })}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* User Games Grid */}
            {userGames.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userGames.map(game => (
                  <div key={game.id} className="bg-gray-800 rounded-lg p-6 relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {game.icon_url && (
                          <img
                            src={game.icon_url}
                            alt={game.name}
                            className="w-12 h-12 rounded-lg"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-lg">{game.name}</h3>
                          <p className="text-sm text-gray-400">{game.category}</p>
                        </div>
                      </div>
                      {game.is_favorite && (
                        <span className="text-yellow-400 text-xl">⭐</span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skill Level:</span>
                        <span className="capitalize">{game.skill_level}</span>
                      </div>
                      
                      {game.rank && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Rank:</span>
                          <span>{game.rank}</span>
                        </div>
                      )}
                      
                      {game.hours_played > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hours:</span>
                          <span>{game.hours_played}</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => removeGame(game.id)}
                      className="w-full px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg text-sm transition-colors"
                    >
                      Remove from Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  🎮
                </div>
                <h3 className="text-xl font-semibold mb-2">No games in your profile yet</h3>
                <p className="text-gray-400 mb-4">
                  Add games to your profile to help other players find you for matches
                </p>
                <button
                  onClick={() => setGameForm({ ...gameForm, show: true })}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Add Your First Game
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Browse All Games Tab */
          <div>
            <h2 className="text-xl font-semibold mb-6">Browse All Games</h2>
            
            {gameCategories.map(category => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-blue-400">{category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allGames
                    .filter(game => game.category === category)
                    .map(game => {
                      const isInProfile = userGames.find(ug => ug.id === game.id);
                      
                      return (
                        <div key={game.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {game.icon_url && (
                              <img
                                src={game.icon_url}
                                alt={game.name}
                                className="w-10 h-10 rounded-lg"
                              />
                            )}
                            <div>
                              <h4 className="font-medium">{game.name}</h4>
                              <p className="text-xs text-gray-400">{game.category}</p>
                            </div>
                          </div>
                          
                          {isInProfile ? (
                            <div className="flex items-center gap-2 text-green-400 text-sm">
                              <span>✓</span>
                              <span>In your profile</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setGameForm({ 
                                ...gameForm, 
                                show: true, 
                                game_id: game.id.toString() 
                              })}
                              className="w-full px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded text-sm transition-colors"
                            >
                              Add to Profile
                            </button>
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