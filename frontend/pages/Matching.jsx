import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchingAPI, gamesAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import Avatar from '../src/components/Avatar';

export default function Matching() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [currentMatches, setCurrentMatches] = useState([]);
  const [userGames, setUserGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discover');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (user) {
      loadCurrentMatches();
      loadUserGames();
    }
  }, [user]);

  const loadUserGames = async () => {
    try {
      const response = await gamesAPI.getUserGames();
      setUserGames(response.data);
      console.log('User games loaded:', response.data);
    } catch (error) {
      console.error('Failed to load user games:', error);
    }
  };

  const loadCurrentMatches = async () => {
    try {
      const response = await matchingAPI.getMatches();
      setCurrentMatches(response.data.matches);
      console.log('Current matches loaded:', response.data.matches);
    } catch (error) {
      console.error('Failed to load current matches:', error);
    }
  };

  const findMatches = async () => {
    setLoading(true);
    setDebugInfo('🔍 Recherche de matchs en cours...');
    
    try {
      console.log('Starting match search...');
      const response = await matchingAPI.findMatches();
      console.log('Match search response:', response.data);
      
      setMatches(response.data.matches || []);
      
      if (response.data.matches && response.data.matches.length > 0) {
        setDebugInfo(`✅ ${response.data.matches.length} match(s) trouvé(s) !`);
      } else if (response.data.message) {
        setDebugInfo(`ℹ️ ${response.data.message}`);
      } else {
        setDebugInfo('❌ Aucun match trouvé. Vérifiez que vous avez des jeux dans votre profil.');
      }
    } catch (error) {
      console.error('Failed to find matches:', error);
      setDebugInfo(`❌ Erreur: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async (matchId) => {
    try {
      await matchingAPI.acceptMatch(matchId);
      await loadCurrentMatches();
      // Remove from potential matches
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
      alert('Match accepté ! Tu peux maintenant envoyer un message à ce joueur.');
    } catch (error) {
      console.error('Failed to accept match:', error);
      alert('Impossible d\'accepter le match: ' + (error.response?.data?.detail || error.message));
    }
  };

  const rejectMatch = async (matchId) => {
    try {
      await matchingAPI.rejectMatch(matchId);
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
    } catch (error) {
      console.error('Failed to reject match:', error);
    }
  };

  // Fonction pour initier une conversation
  const startConversation = (matchUserId, matchUsername) => {
    console.log('Starting conversation with:', matchUserId, matchUsername);
    // Naviguer vers la page messages avec l'ID utilisateur
    navigate(`/messages?user=${matchUserId}&username=${matchUsername}`);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'rejected': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Connecte-toi pour utiliser le matching</h2>
          <a href="/login" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Trouver des Coéquipiers</h1>
          <p className="text-gray-400">
            Découvre des joueurs qui partagent tes jeux, ton niveau et tes créneaux de jeu
          </p>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 mb-6">
            <p className="text-sm">{debugInfo}</p>
          </div>
        )}

        {/* User Games Status */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">🎮 Tes jeux ({userGames.length})</h3>
          {userGames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userGames.slice(0, 5).map(game => (
                <span key={game.id} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
                  {game.name} ({game.skill_level})
                </span>
              ))}
              {userGames.length > 5 && (
                <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-sm">
                  +{userGames.length - 5} autres
                </span>
              )}
            </div>
          ) : (
            <div>
              <p className="text-red-400 mb-2">Aucun jeu dans ton profil !</p>
              <a href="/games" className="text-blue-400 hover:underline">
                Ajouter des jeux →
              </a>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'discover'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Découvrir
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'matches'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Mes Matchs ({currentMatches.length})
          </button>
        </div>

        {activeTab === 'discover' ? (
          <div>
            <div className="mb-6">
              <button
                onClick={findMatches}
                disabled={loading || userGames.length === 0}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Recherche en cours...
                  </div>
                ) : (
                  'Trouver de Nouveaux Matchs'
                )}
              </button>
              {userGames.length === 0 && (
                <p className="text-red-400 text-sm mt-2">
                  Vous devez d'abord ajouter des jeux à votre profil pour trouver des matchs.
                </p>
              )}
            </div>

            {matches.length > 0 ? (
              <div className="grid gap-6">
                {matches.map((match) => (
                  <div key={match.match_id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          src={match.avatar_url}
                          username={match.username}
                          size={64}
                        />
                        <div>
                          <h3 className="text-xl font-semibold">{match.username}</h3>
                          <p className="text-gray-400">
                            <span className="capitalize">{match.skill_level || 'Niveau non spécifié'}</span> • 
                            Recherche <span className="capitalize">{match.looking_for?.replace('_', ' ') || 'coéquipiers'}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`font-semibold ${getMatchScoreColor(match.match_score)}`}>
                              {Math.round(match.match_score)}% de compatibilité
                            </span>
                            {match.region && (
                              <span className="text-gray-500">• {match.region}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptMatch(match.match_id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => rejectMatch(match.match_id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Passer
                        </button>
                      </div>
                    </div>
                    
                    {match.bio && (
                      <div className="mt-4">
                        <p className="text-gray-300 text-sm">{match.bio}</p>
                      </div>
                    )}
                    
                    {match.games && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Jeux en commun:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.games.split(',').map((game, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                            >
                              {game.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  🎮
                </div>
                <h3 className="text-xl font-semibold mb-2">Prêt à trouver des coéquipiers ?</h3>
                <p className="text-gray-400 mb-4">
                  Clique sur "Trouver de Nouveaux Matchs" pour découvrir des joueurs compatibles
                </p>
                {!loading && userGames.length > 0 && (
                  <button
                    onClick={findMatches}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Commencer
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          /* My Matches Tab */
          <div>
            {currentMatches.length > 0 ? (
              <div className="grid gap-6">
                {currentMatches.map((match) => (
                  <div key={match.match_id} className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          src={match.avatar_url}
                          username={match.username}
                          size={64}
                        />
                        <div>
                          <h3 className="text-xl font-semibold">{match.username}</h3>
                          <p className="text-gray-400">
                            <span className="capitalize">{match.skill_level}</span> • 
                            Recherche <span className="capitalize">{match.looking_for?.replace('_', ' ')}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`font-semibold ${getMatchScoreColor(match.match_score)}`}>
                              {Math.round(match.match_score)}% de compatibilité
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(match.status)}`}>
                              {match.status === 'accepted' ? 'Accepté' : 'En attente'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {match.status === 'accepted' && (
                        <button
                          onClick={() => startConversation(match.user_id, match.username)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          💬 Envoyer un Message
                        </button>
                      )}
                    </div>
                    
                    {match.bio && (
                      <div className="mt-4">
                        <p className="text-gray-300 text-sm">{match.bio}</p>
                      </div>
                    )}
                    
                    {match.games && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Jeux en commun:</p>
                        <div className="flex flex-wrap gap-2">
                          {match.games.split(',').map((game, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                            >
                              {game.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-sm text-gray-500">
                      Matché le {new Date(match.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  🤝
                </div>
                <h3 className="text-xl font-semibold mb-2">Pas encore de matchs</h3>
                <p className="text-gray-400 mb-4">
                  Commence à découvrir de nouveaux coéquipiers pour construire ton réseau gaming
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Trouver des Matchs
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}