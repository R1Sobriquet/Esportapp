import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchingAPI, gamesAPI } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import Avatar from '../src/components/Avatar';
import { ToastContainer } from '../src/components/Toast';
import { useToast } from '../src/hooks/useToast';

export default function Matching() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  
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
    } catch (err) {
      console.error('Failed to load user games:', err);
    }
  };

  const loadCurrentMatches = async () => {
    try {
      const response = await matchingAPI.getMatches();
      setCurrentMatches(response.data.matches);
    } catch (err) {
      console.error('Failed to load current matches:', err);
    }
  };

  const findMatches = async () => {
    setLoading(true);
    setDebugInfo('🔍 Recherche de matchs en cours...');
    
    try {
      const response = await matchingAPI.findMatches();
      setMatches(response.data.matches || []);
      
      if (response.data.matches && response.data.matches.length > 0) {
        setDebugInfo(`✅ ${response.data.matches.length} match(s) trouvé(s) !`);
        success(`${response.data.matches.length} joueur(s) compatible(s) trouvé(s) !`);
      } else if (response.data.message) {
        setDebugInfo(`ℹ️ ${response.data.message}`);
        error(response.data.message);
      } else {
        setDebugInfo('❌ Aucun match trouvé. Vérifiez que vous avez des jeux dans votre profil.');
        error('Aucun match trouvé. Ajoutez des jeux à votre profil !');
      }
    } catch (err) {
      console.error('Failed to find matches:', err);
      setDebugInfo(`❌ Erreur: ${err.response?.data?.detail || err.message}`);
      error('Erreur lors de la recherche de matchs');
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async (matchId, username) => {
    try {
      await matchingAPI.acceptMatch(matchId);
      await loadCurrentMatches();
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
      
      // Beautiful toast notification instead of ugly alert!
      success(`Match accepté avec ${username} ! Tu peux maintenant lui envoyer un message.`, 5000);
    } catch (err) {
      console.error('Failed to accept match:', err);
      error('Impossible d\'accepter le match');
    }
  };

  const rejectMatch = async (matchId) => {
    try {
      await matchingAPI.rejectMatch(matchId);
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
      success('Match rejeté');
    } catch (err) {
      console.error('Failed to reject match:', err);
      error('Impossible de rejeter le match');
    }
  };

  const startConversation = (matchUserId, matchUsername) => {
    navigate(`/messages?user=${matchUserId}&username=${matchUsername}`);
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-primary-light';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'rejected': return 'bg-primary';
      default: return 'bg-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Connecte-toi pour utiliser le matching</h2>
          <a href="/login" className="px-6 py-2 bg-gradient-primary rounded-lg shadow-glow-red hover:shadow-glow-red-lg transition-all">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
            Trouver des Coéquipiers
          </h1>
          <p className="text-gray-400">
            Découvre des joueurs qui partagent tes jeux, ton niveau et tes créneaux de jeu
          </p>
        </div>

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gradient-to-r from-primary-darker/50 to-primary-dark/50 backdrop-blur-sm border border-primary/30 rounded-lg p-4 mb-6">
            <p className="text-sm">{debugInfo}</p>
          </div>
        )}

        {/* User Games Status with gradient */}
        <div className="bg-gradient-to-r from-primary-dark/20 to-primary/20 backdrop-blur-sm border border-primary-light/30 rounded-lg p-4 mb-6 shadow-glow-red">
          <h3 className="font-semibold mb-2">🎮 Tes jeux ({userGames.length})</h3>
          {userGames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userGames.slice(0, 5).map(game => (
                <span key={game.id} className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm border border-primary-light/20">
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
              <p className="text-primary-light mb-2">Aucun jeu dans ton profil !</p>
              <a href="/games" className="text-primary-light hover:text-white underline">
                Ajouter des jeux →
              </a>
            </div>
          )}
        </div>

        {/* Tabs with gradient */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'discover'
                ? 'bg-gradient-primary text-white shadow-glow-red'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            Découvrir
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'matches'
                ? 'bg-gradient-primary text-white shadow-glow-red'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
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
                className="px-8 py-4 bg-gradient-glow rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-red hover:shadow-glow-red-lg transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Recherche en cours...
                  </div>
                ) : (
                  'Trouver de Nouveaux Matchs'
                )}
              </button>
            </div>

            {matches.length > 0 ? (
              <div className="grid gap-6">
                {matches.map((match) => (
                  <div key={match.match_id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          src={match.avatar_url}
                          username={match.username}
                          size={64}
                          className="ring-2 ring-primary-light/50"
                        />
                        <div>
                          <h3 className="text-xl font-semibold text-white">{match.username}</h3>
                          <p className="text-gray-400">
                            <span className="capitalize">{match.skill_level || 'Niveau non spécifié'}</span> • 
                            Recherche <span className="capitalize text-primary-light">{match.looking_for?.replace('_', ' ') || 'coéquipiers'}</span>
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
                          onClick={() => acceptMatch(match.match_id, match.username)}
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => rejectMatch(match.match_id)}
                          className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary rounded-lg text-sm font-medium transition-all"
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
                              className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm border border-primary-light/20"
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
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red">
                  <span className="text-4xl">🎮</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Prêt à trouver des coéquipiers ?</h3>
                <p className="text-gray-400 mb-4">
                  Clique sur "Trouver de Nouveaux Matchs" pour découvrir des joueurs compatibles
                </p>
              </div>
            )}
          </div>
        ) : (
          /* My Matches Tab */
          <div>
            {currentMatches.length > 0 ? (
              <div className="grid gap-6">
                {currentMatches.map((match) => (
                  <div key={match.match_id} className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar 
                          src={match.avatar_url}
                          username={match.username}
                          size={64}
                          className="ring-2 ring-primary-light/50"
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
                          className="px-6 py-2 bg-gradient-primary rounded-lg text-sm font-medium transition-all shadow-glow-red hover:shadow-glow-red-lg transform hover:scale-105"
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
                              className="px-3 py-1 bg-primary/20 text-primary-light rounded-full text-sm border border-primary-light/20"
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
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red">
                  <span className="text-4xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Pas encore de matchs</h3>
                <p className="text-gray-400 mb-4">
                  Commence à découvrir de nouveaux coéquipiers pour construire ton réseau gaming
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-2 bg-gradient-primary rounded-lg font-medium transition-all shadow-glow-red hover:shadow-glow-red-lg"
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