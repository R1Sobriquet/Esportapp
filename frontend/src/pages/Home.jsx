/**
 * Home Page Component
 * Dashboard for authenticated users, landing page with stats for guests
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchingAPI, gamesAPI, statsAPI } from '../services';
import { WelcomeMessage, Avatar, SkeletonCard, SkeletonStat } from '../components';

/**
 * Player Card Component
 * Displays a player's info in a card format
 */
const PlayerCard = ({ player, index, variant = 'default' }) => {
  const variantStyles = {
    default: 'border-primary/20 hover:border-primary-light/40',
    popular: 'border-yellow-500/30 hover:border-yellow-500/60',
    active: 'border-green-500/30 hover:border-green-500/60',
    matches: 'border-purple-500/30 hover:border-purple-500/60',
  };

  const badgeStyles = {
    popular: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    active: 'bg-gradient-to-r from-green-500 to-emerald-500',
    matches: 'bg-gradient-to-r from-purple-500 to-violet-500',
  };

  return (
    <div
      className={`bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border ${variantStyles[variant]} p-4 transition-all hover:shadow-lg animate-fade-in group`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar
            src={player.avatar_url}
            username={player.username}
            size={48}
            className="ring-2 ring-primary-light/30 group-hover:ring-primary-light/60 transition-all"
          />
          {variant !== 'default' && index < 3 && (
            <div className={`absolute -top-1 -right-1 w-5 h-5 ${badgeStyles[variant]} rounded-full flex items-center justify-center text-xs font-bold shadow-lg`}>
              {index + 1}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{player.username}</h4>
          <p className="text-xs text-gray-400 truncate">
            {player.games || 'Aucun jeu favori'}
          </p>
          {player.skill_level && (
            <span className="text-xs text-primary-light">{player.skill_level}</span>
          )}
        </div>
      </div>
      {(player.match_count !== undefined || player.accepted_count !== undefined) && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {player.accepted_count !== undefined ? `${player.accepted_count} matchs` : `${player.match_count} matchs`}
          </span>
          <a
            href={`/messages?user=${player.id}&username=${encodeURIComponent(player.username)}`}
            className="text-primary-light hover:text-white transition-colors"
          >
            Contacter
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Stat Card Component
 * Displays a platform statistic
 */
const StatCard = ({ label, value, icon, color = 'primary', index }) => {
  const colorStyles = {
    primary: 'from-primary-light to-primary',
    green: 'from-green-400 to-green-600',
    purple: 'from-purple-400 to-purple-600',
    blue: 'from-blue-400 to-blue-600',
    yellow: 'from-yellow-400 to-yellow-600',
  };

  const iconBgStyles = {
    primary: 'bg-gradient-primary shadow-glow-red',
    green: 'bg-gradient-to-br from-green-600 to-green-500 shadow-lg shadow-green-500/50',
    purple: 'bg-gradient-to-br from-purple-600 to-purple-500 shadow-lg shadow-purple-500/50',
    blue: 'bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-500/50',
    yellow: 'bg-gradient-to-br from-yellow-600 to-yellow-500 shadow-lg shadow-yellow-500/50',
  };

  return (
    <div
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${colorStyles[color]} bg-clip-text text-transparent`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`w-14 h-14 ${iconBgStyles[color]} rounded-full flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Section Header Component
 */
const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {action && (
      <a href={action.href} className="text-sm text-primary-light hover:text-white transition-colors">
        {action.label} →
      </a>
    )}
  </div>
);

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalGames: 0,
    totalMatches: 0,
    activeConversations: 0
  });
  const [platformStats, setPlatformStats] = useState(null);
  const [popularPlayers, setPopularPlayers] = useState([]);
  const [recentlyActive, setRecentlyActive] = useState([]);
  const [topMatchers, setTopMatchers] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPublic, setLoadingPublic] = useState(true);

  // Load public data (for everyone)
  useEffect(() => {
    loadPublicData();
  }, []);

  // Load user-specific data
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadPublicData = async () => {
    try {
      const [platformRes, popularRes, activeRes, topRes] = await Promise.all([
        statsAPI.getPlatformStats(),
        statsAPI.getPopularPlayers(6),
        statsAPI.getRecentlyActive(6),
        statsAPI.getTopMatchers(6),
      ]);

      setPlatformStats(platformRes.data);
      setPopularPlayers(popularRes.data.players || []);
      setRecentlyActive(activeRes.data.players || []);
      setTopMatchers(topRes.data.players || []);
    } catch (error) {
      console.error('Failed to load public data:', error);
    } finally {
      setLoadingPublic(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [gamesRes, matchesRes] = await Promise.all([
        gamesAPI.getUserGames(),
        matchingAPI.getMatches()
      ]);

      setStats({
        totalGames: gamesRes.data.length,
        totalMatches: matchesRes.data.matches.filter(m => m.status === 'accepted').length,
        activeConversations: 0
      });

      setRecentMatches(matchesRes.data.matches.slice(0, 3));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Landing page for guests
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
              GameConnect
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Trouve tes coéquipiers parfaits. Connecte-toi avec des joueurs qui partagent ta passion,
              ton niveau et tes créneaux de jeu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-gradient-glow hover:shadow-glow-red-lg px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-glow-red"
              >
                Commencer gratuitement
              </a>
              <a
                href="/login"
                className="border-2 border-primary hover:border-primary-light px-8 py-3 rounded-lg font-semibold transition-all hover:bg-primary/10"
              >
                Connexion
              </a>
            </div>
          </div>

          {/* Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              { icon: '🎮', title: 'Matching Intelligent', desc: 'Notre algorithme te met en relation avec des joueurs selon tes jeux, niveau et disponibilités.' },
              { icon: '💬', title: 'Messagerie Directe', desc: 'Discute avec tes coéquipiers et organise tes sessions de jeu.' },
              { icon: '👥', title: 'Communauté Gaming', desc: 'Rejoins une communauté de joueurs passionnés et trouve tes futurs coéquipiers.' },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm rounded-xl border border-primary/20 hover:border-primary-light/40 transition-all shadow-lg hover:shadow-glow-red animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-glow-red animate-float">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary-light">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Stats */}
        {platformStats && (
          <div className="bg-gradient-to-r from-gray-900/50 via-primary-darkest/50 to-gray-900/50 py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-center text-2xl font-bold mb-8 bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
                Une communauté active
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatCard label="Joueurs" value={platformStats.total_users} icon="👥" color="primary" index={0} />
                <StatCard label="Jeux" value={platformStats.total_games} icon="🎮" color="green" index={1} />
                <StatCard label="Matchs réussis" value={platformStats.total_matches} icon="🤝" color="purple" index={2} />
                <StatCard label="Messages" value={platformStats.total_messages} icon="💬" color="blue" index={3} />
              </div>
            </div>
          </div>
        )}

        {/* Popular Players Section */}
        {popularPlayers.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <SectionHeader
              title="Joueurs Populaires"
              subtitle="Les joueurs les plus actifs de la communauté"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingPublic ? (
                [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
              ) : (
                popularPlayers.map((player, index) => (
                  <PlayerCard key={player.id} player={player} index={index} variant="popular" />
                ))
              )}
            </div>
          </div>
        )}

        {/* Recently Active Section */}
        {recentlyActive.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <SectionHeader
              title="Récemment Actifs"
              subtitle="Joueurs connectés ces derniers jours"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyActive.map((player, index) => (
                <PlayerCard key={player.id} player={player} index={index} variant="active" />
              ))}
            </div>
          </div>
        )}

        {/* Top Matchers Section */}
        {topMatchers.length > 0 && (
          <div className="container mx-auto px-4 py-12">
            <SectionHeader
              title="Plus de Matchs"
              subtitle="Les joueurs avec le plus de connexions"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMatchers.map((player, index) => (
                <PlayerCard key={player.id} player={player} index={index} variant="matches" />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark rounded-2xl p-8 md:p-12 text-center shadow-glow-red-lg">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à rejoindre la communauté ?</h2>
            <p className="text-lg text-gray-200 mb-8 max-w-xl mx-auto">
              Inscris-toi gratuitement et commence à trouver tes futurs coéquipiers dès aujourd'hui.
            </p>
            <a
              href="/register"
              className="inline-block bg-white text-primary-dark px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-xl"
            >
              Créer mon compte
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard for authenticated users
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-64 bg-gray-700 rounded animate-pulse mb-8" />
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => <SkeletonStat key={i} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-primary-darkest to-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <WelcomeMessage />

        {/* User Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Jeux dans mon profil" value={stats.totalGames} icon="🎮" color="primary" index={0} />
          <StatCard label="Matchs Actifs" value={stats.totalMatches} icon="🤝" color="green" index={1} />
          <StatCard label="Conversations" value={stats.activeConversations} icon="💬" color="purple" index={2} />
        </div>

        {/* Recent Matches */}
        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20 shadow-lg">
          <SectionHeader
            title="Matchs Récents"
            action={{ href: '/matching', label: 'Voir tout' }}
          />
          {recentMatches.length > 0 ? (
            <div className="space-y-4">
              {recentMatches.map((match, index) => (
                <div
                  key={match.match_id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-primary/10 hover:border-primary-light/30 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={match.avatar_url}
                      username={match.username}
                      size={40}
                      className="ring-2 ring-primary-light/50"
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
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow-red animate-float">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="mb-2">Pas encore de matchs</p>
              <a href="/matching" className="text-primary-light hover:underline">
                Trouve tes coéquipiers !
              </a>
            </div>
          )}
        </div>

        {/* Community Sections */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Popular Players */}
          {popularPlayers.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <SectionHeader
                title="Joueurs Populaires"
                subtitle="Les plus actifs"
              />
              <div className="space-y-3">
                {popularPlayers.slice(0, 4).map((player, index) => (
                  <PlayerCard key={player.id} player={player} index={index} variant="popular" />
                ))}
              </div>
            </div>
          )}

          {/* Recently Active */}
          {recentlyActive.length > 0 && (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-primary/20 shadow-lg">
              <SectionHeader
                title="Récemment Actifs"
                subtitle="Connectés récemment"
              />
              <div className="space-y-3">
                {recentlyActive.slice(0, 4).map((player, index) => (
                  <PlayerCard key={player.id} player={player} index={index} variant="active" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Matchers Section */}
        {topMatchers.length > 0 && (
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-primary/20 shadow-lg">
            <SectionHeader
              title="Plus de Matchs"
              subtitle="Joueurs avec le plus de connexions"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMatchers.slice(0, 6).map((player, index) => (
                <PlayerCard key={player.id} player={player} index={index} variant="matches" />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
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
