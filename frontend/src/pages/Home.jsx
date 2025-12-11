/**
 * Home Page Component
 * Dashboard for authenticated users, landing page for guests
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchingAPI, gamesAPI } from '../services';
import { WelcomeMessage } from '../components';

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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent drop-shadow-glow-red">
              GameConnect
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Trouve tes coéquipiers parfaits. Connecte-toi avec des joueurs qui partagent ta passion, 
              ton niveau et tes créneaux de jeu.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/register" 
                className="bg-gradient-glow hover:shadow-glow-red-lg px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-glow-red"
              >
                Commencer
              </a>
              <a 
                href="/login" 
                className="border-2 border-primary hover:border-primary-light px-8 py-3 rounded-lg font-semibold transition-all hover:bg-primary/10"
              >
                Connexion
              </a>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-glow-red">
                🎮
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-light">Matching Intelligent</h3>
              <p className="text-gray-400">
                Notre algorithme te met en relation avec des joueurs selon tes jeux, niveau et disponibilités.
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-glow-red">
                💬
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-light">Messagerie Directe</h3>
              <p className="text-gray-400">
                Discute avec tes coéquipiers et organise tes sessions de jeu.
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-glow-red">
                👥
              </div>
              <h3 className="text-xl font-semibold mb-2 text-primary-light">Communauté Gaming</h3>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light mx-auto mb-4"></div>
          <p>Chargement de ton dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Message de bienvenue intelligent */}
        <WelcomeMessage />

        {/* Stats Cards with gradients */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Jeux dans mon profil</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                  {stats.totalGames}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center text-2xl shadow-glow-red">
                🎮
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Matchs Actifs</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                  {stats.totalMatches}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-green-500/50">
                🤝
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Conversations</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                  {stats.activeConversations}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-purple-500/50">
                💬
              </div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
            Matchs Récents
          </h2>
          {recentMatches.length > 0 ? (
            <div className="space-y-4">
              {recentMatches.map((match) => (
                <div key={match.match_id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-primary/10 hover:border-primary-light/30 transition-all">
                  <div className="flex items-center gap-3">
                    <img 
                      src={match.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(match.username) + '&background=AD2831&color=fff&size=40'} 
                      alt={match.username}
                      className="w-10 h-10 rounded-full ring-2 ring-primary-light/50"
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
              <p>Pas encore de matchs. <a href="/matching" className="text-primary-light hover:underline">Trouve tes coéquipiers !</a></p>
            </div>
          )}
        </div>

        {/* Quick Actions with gradients */}
        <div className="grid md:grid-cols-3 gap-4">
          <a 
            href="/matching" 
            className="bg-gradient-glow p-6 rounded-xl text-center transition-all shadow-glow-red hover:shadow-glow-red-lg transform hover:scale-105"
          >
            <div className="text-3xl mb-2">🔍</div>
            <p className="font-medium">Trouver des Matchs</p>
          </a>
          <a 
            href="/messages" 
            className="bg-gradient-to-br from-purple-600 to-purple-500 p-6 rounded-xl text-center transition-all shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transform hover:scale-105"
          >
            <div className="text-3xl mb-2">💬</div>
            <p className="font-medium">Messages</p>
          </a>
          <a 
            href="/games" 
            className="bg-gradient-to-br from-green-600 to-green-500 p-6 rounded-xl text-center transition-all shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/70 transform hover:scale-105"
          >
            <div className="text-3xl mb-2">🎮</div>
            <p className="font-medium">Mes Jeux</p>
          </a>
        </div>
      </div>
    </div>
  );
}