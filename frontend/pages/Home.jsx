// frontend/pages/Home.jsx - Sans Forum
import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { matchingAPI, gamesAPI } from '../src/services/api';
import WelcomeMessage from '../src/components/WelcomeMessage';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGames: 0,
    totalMatches: 0,
    activeConversations: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [gamesRes, matchesRes] = await Promise.all([
        gamesAPI.getUserGames(),
        matchingAPI.getMatches()
      ]);

      setStats({
        totalGames: gamesRes.data.length,
        totalMatches: matchesRes.data.matches.filter(m => m.status === 'accepted').length,
        activeConversations: 0 // Would need messages API call
      });

      setRecentMatches(matchesRes.data.matches.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              GameConnect
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Trouve tes coéquipiers parfaits. Connecte-toi avec des joueurs qui partagent ta passion, 
              ton niveau et tes créneaux de jeu.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Commencer
              </a>
              <a 
                href="/login" 
                className="border border-gray-600 hover:border-gray-500 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Connexion
              </a>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                🎮
              </div>
              <h3 className="text-xl font-semibold mb-2">Matching Intelligent</h3>
              <p className="text-gray-400">
                Notre algorithme te met en relation avec des joueurs selon tes jeux, niveau et disponibilités.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                💬
              </div>
              <h3 className="text-xl font-semibold mb-2">Messagerie Directe</h3>
              <p className="text-gray-400">
                Discute avec tes coéquipiers et organise tes sessions de jeu.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                👥
              </div>
              <h3 className="text-xl font-semibold mb-2">Communauté Gaming</h3>
              <p className="text-gray-400">
                Rejoins une communauté de joueurs passionnés et trouve tes futurs coéquipiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Chargement de ton dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Message de bienvenue intelligent */}
        <WelcomeMessage />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Jeux dans mon profil</p>
                <p className="text-2xl font-bold text-blue-400">{stats.totalGames}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                🎮
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Matchs Actifs</p>
                <p className="text-2xl font-bold text-green-400">{stats.totalMatches}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                🤝
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversations</p>
                <p className="text-2xl font-bold text-purple-400">{stats.activeConversations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                💬
              </div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Matchs Récents</h2>
          {recentMatches.length > 0 ? (
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div key={match.match_id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img 
                      src={match.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(match.username) + '&background=3B82F6&color=fff&size=40'} 
                      alt={match.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{match.username}</p>
                      <p className="text-sm text-gray-400">{match.games}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      match.status === 'accepted' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}>
                      {match.status === 'accepted' ? 'Accepté' : 'En attente'}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {match.match_score}% de compatibilité
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Pas encore de matchs. <a href="/matching" className="text-blue-400 hover:underline">Trouve tes coéquipiers !</a></p>
            </div>
          )}
        </div>

        {/* Quick Actions - Sans Forum */}
        <div className="grid md:grid-cols-3 gap-4">
          <a 
            href="/matching" 
            className="bg-blue-600 hover:bg-blue-700 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">🔍</div>
            <p className="font-medium">Trouver des Matchs</p>
          </a>
          <a 
            href="/messages" 
            className="bg-purple-600 hover:bg-purple-700 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">💬</div>
            <p className="font-medium">Messages</p>
          </a>
          <a 
            href="/games" 
            className="bg-green-600 hover:bg-green-700 p-4 rounded-lg text-center transition-colors"
          >
            <div className="text-2xl mb-2">🎮</div>
            <p className="font-medium">Mes Jeux</p>
          </a>
        </div>
      </div>
    </div>
  );
}