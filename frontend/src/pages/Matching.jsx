import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { matchingAPI, gamesAPI } from '../services';
import { Avatar, Toast } from '../components';
import { useToast } from '../hooks/useToast';

const { ToastContainer } = Toast;

const CARD = 'bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm dark:shadow-glass transition-all';

const getScoreColor = (score) => {
  if (score >= 80) return 'from-emerald-400 to-green-500';
  if (score >= 60) return 'from-yellow-400 to-amber-500';
  return 'from-sky-400 to-neon-cyan';
};

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
    if (user) { loadCurrentMatches(); loadUserGames(); }
  }, [user]);

  const loadUserGames = async () => {
    try { const r = await gamesAPI.getUserGames(); setUserGames(r.data); }
    catch (err) { console.error('Failed to load user games:', err); }
  };

  const loadCurrentMatches = async () => {
    try { const r = await matchingAPI.getMatches(); setCurrentMatches(r.data.matches); }
    catch (err) { console.error('Failed to load current matches:', err); }
  };

  const findMatches = async () => {
    setLoading(true);
    setDebugInfo('🔍 Recherche de matchs en cours...');
    try {
      const response = await matchingAPI.findMatches();
      setMatches(response.data.matches || []);
      if (response.data.matches?.length > 0) {
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
    } finally { setLoading(false); }
  };

  const acceptMatch = async (matchId, username) => {
    try {
      await matchingAPI.acceptMatch(matchId);
      await loadCurrentMatches();
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
      success(`Match accepté avec ${username} ! Tu peux maintenant lui envoyer un message.`, 5000);
    } catch (err) { error('Impossible d\'accepter le match'); }
  };

  const rejectMatch = async (matchId) => {
    try {
      await matchingAPI.rejectMatch(matchId);
      setMatches(prev => prev.filter(m => m.match_id !== matchId));
      success('Match rejeté');
    } catch (err) { error('Impossible de rejeter le match'); }
  };

  const startConversation = (userId, username) => navigate(`/messages?user=${userId}&username=${username}`);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Connecte-toi pour utiliser le matching</h2>
          <a href="/login" className="px-6 py-3 bg-gradient-neon rounded-xl font-semibold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105">
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark text-slate-900 dark:text-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
            Trouver des Coéquipiers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Découvre des joueurs qui partagent tes jeux, ton niveau et tes créneaux
          </p>
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className={`${CARD} p-4 mb-5 text-sm text-slate-700 dark:text-slate-300`}>
            {debugInfo}
          </div>
        )}

        {/* User games status */}
        <div className={`${CARD} p-4 mb-5 border-sky-200 dark:border-neon-cyan/20`}>
          <h3 className="font-semibold text-sm mb-2 text-slate-700 dark:text-slate-200">
            🎮 Tes jeux ({userGames.length})
          </h3>
          {userGames.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {userGames.slice(0, 5).map(game => (
                <span key={game.id} className="px-3 py-1 bg-sky-50 dark:bg-neon-cyan/10 text-sky-600 dark:text-neon-cyan rounded-full text-xs font-medium border border-sky-200 dark:border-neon-cyan/20">
                  {game.name} · {game.skill_level}
                </span>
              ))}
              {userGames.length > 5 && (
                <span className="px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-full text-xs border border-slate-200 dark:border-white/8">
                  +{userGames.length - 5} autres
                </span>
              )}
            </div>
          ) : (
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Aucun jeu dans ton profil !</p>
              <a href="/games" className="text-sky-600 dark:text-neon-cyan hover:text-neon-violet text-sm font-medium transition-colors">
                Ajouter des jeux →
              </a>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'discover', label: 'Découvrir' },
            { id: 'matches', label: `Mes Matchs (${currentMatches.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-neon text-white shadow-glow-cyan'
                  : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/8 hover:border-sky-300 dark:hover:border-neon-cyan/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'discover' ? (
          <div>
            <div className="mb-6">
              <button
                onClick={findMatches}
                disabled={loading || userGames.length === 0}
                className="px-8 py-4 bg-gradient-neon rounded-2xl font-bold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Recherche en cours...
                  </span>
                ) : '🔍 Trouver de Nouveaux Matchs'}
              </button>
            </div>

            {matches.length > 0 ? (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match.match_id} className={`${CARD} p-6 hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-md dark:hover:shadow-glow-cyan/10 animate-fade-in`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={match.avatar_url}
                          username={match.username}
                          size={60}
                          className="ring-2 ring-sky-300/40 dark:ring-neon-cyan/30 flex-shrink-0"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{match.username}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            <span className="capitalize">{match.skill_level || 'N/A'}</span>
                            {' · '}
                            <span className="text-sky-600 dark:text-neon-cyan capitalize">
                              {match.looking_for?.replace('_', ' ') || 'coéquipiers'}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm font-bold bg-gradient-to-r ${getScoreColor(match.match_score)} bg-clip-text text-transparent`}>
                              {Math.round(match.match_score)}% compatibilité
                            </span>
                            {match.region && <span className="text-xs text-slate-400 dark:text-slate-500">· {match.region}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => acceptMatch(match.match_id, match.username)}
                          className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl text-sm font-bold text-white shadow-lg shadow-emerald-400/30 hover:shadow-emerald-400/50 hover:scale-105 transition-all"
                        >
                          ✓ Accepter
                        </button>
                        <button
                          onClick={() => rejectMatch(match.match_id)}
                          className="px-5 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 transition-all"
                        >
                          Passer
                        </button>
                      </div>
                    </div>

                    {match.bio && (
                      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                        {match.bio}
                      </p>
                    )}

                    {match.games && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Jeux en commun</p>
                        <div className="flex flex-wrap gap-2">
                          {match.games.split(',').map((game, i) => (
                            <span key={i} className="px-3 py-1 bg-sky-50 dark:bg-neon-cyan/10 text-sky-600 dark:text-neon-cyan rounded-full text-xs font-medium border border-sky-200 dark:border-neon-cyan/20">
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
              <div className={`${CARD} p-16 text-center`}>
                <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan animate-float">
                  <span className="text-3xl">🎮</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Prêt à trouver des coéquipiers ?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Clique sur le bouton pour découvrir des joueurs compatibles
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {currentMatches.length > 0 ? (
              <div className="space-y-4">
                {currentMatches.map((match) => (
                  <div key={match.match_id} className={`${CARD} p-6 hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-md dark:hover:shadow-glow-cyan/10`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          src={match.avatar_url}
                          username={match.username}
                          size={60}
                          className="ring-2 ring-sky-300/40 dark:ring-neon-cyan/30 flex-shrink-0"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{match.username}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                            {match.skill_level} · {match.looking_for?.replace('_', ' ')}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`text-sm font-bold bg-gradient-to-r ${getScoreColor(match.match_score)} bg-clip-text text-transparent`}>
                              {Math.round(match.match_score)}% compatibilité
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              match.status === 'accepted'
                                ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            }`}>
                              {match.status === 'accepted' ? 'Accepté' : 'En attente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {match.status === 'accepted' && (
                        <button
                          onClick={() => startConversation(match.user_id, match.username)}
                          className="px-5 py-2 bg-gradient-neon rounded-xl text-sm font-bold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105 flex-shrink-0"
                        >
                          💬 Message
                        </button>
                      )}
                    </div>

                    {match.bio && (
                      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                        {match.bio}
                      </p>
                    )}

                    {match.games && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">Jeux en commun</p>
                        <div className="flex flex-wrap gap-2">
                          {match.games.split(',').map((game, i) => (
                            <span key={i} className="px-3 py-1 bg-sky-50 dark:bg-neon-cyan/10 text-sky-600 dark:text-neon-cyan rounded-full text-xs font-medium border border-sky-200 dark:border-neon-cyan/20">
                              {game.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                      Matché le {new Date(match.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${CARD} p-16 text-center`}>
                <div className="w-16 h-16 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan animate-float">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Pas encore de matchs</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                  Commence à découvrir de nouveaux coéquipiers
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-2.5 bg-gradient-neon rounded-xl font-semibold text-sm text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105"
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
