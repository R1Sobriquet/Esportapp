import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { matchingAPI, gamesAPI, statsAPI } from '../services';
import { WelcomeMessage, Avatar, SkeletonCard, SkeletonStat } from '../components';

const CARD_BASE = 'bg-white dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm dark:shadow-glass transition-all';

const PlayerCard = ({ player, index, variant = 'default' }) => {
  const hoverBorder = {
    default: 'hover:border-sky-400/40 dark:hover:border-neon-cyan/30',
    popular: 'hover:border-yellow-400/50',
    active: 'hover:border-emerald-400/50',
    matches: 'hover:border-neon-violet/50',
  };

  const badgeGradient = {
    popular: 'from-yellow-400 to-amber-500',
    active: 'from-emerald-400 to-green-500',
    matches: 'from-neon-violetLight to-neon-violet',
  };

  return (
    <div
      className={`${CARD_BASE} ${hoverBorder[variant]} p-4 animate-fade-in group`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Avatar
            src={player.avatar_url}
            username={player.username}
            size={44}
            className="ring-2 ring-slate-200 dark:ring-white/10 group-hover:ring-sky-400/40 dark:group-hover:ring-neon-cyan/30 transition-all"
          />
          {variant !== 'default' && index < 3 && (
            <div className={`absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br ${badgeGradient[variant]} rounded-full flex items-center justify-center text-xs font-bold text-white shadow`}>
              {index + 1}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 truncate text-sm">{player.username}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{player.games || 'Aucun jeu favori'}</p>
          {player.skill_level && (
            <span className="text-xs text-sky-600 dark:text-neon-cyan font-medium">{player.skill_level}</span>
          )}
        </div>
      </div>
      {(player.match_count !== undefined || player.accepted_count !== undefined) && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {player.accepted_count !== undefined ? `${player.accepted_count} matchs` : `${player.match_count} matchs`}
          </span>
          <a
            href={`/messages?user=${player.id}&username=${encodeURIComponent(player.username)}`}
            className="text-sky-600 dark:text-neon-cyan hover:text-neon-violet dark:hover:text-neon-violetLight transition-colors font-medium"
          >
            Contacter →
          </a>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color = 'primary', index }) => {
  const iconBg = {
    primary: 'bg-gradient-neon shadow-glow-cyan',
    green: 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-400/30',
    purple: 'bg-gradient-to-br from-neon-violetLight to-neon-violet shadow-glow-violet',
    blue: 'bg-gradient-to-br from-sky-400 to-blue-500 shadow-lg shadow-sky-400/30',
    yellow: 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-400/30',
  };

  const valueGradient = {
    primary: 'from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet',
    green: 'from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500',
    purple: 'from-neon-violet to-neon-violetLight',
    blue: 'from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500',
    yellow: 'from-yellow-500 to-amber-600 dark:from-yellow-400 dark:to-amber-500',
  };

  return (
    <div
      className={`${CARD_BASE} p-6 hover:shadow-md dark:hover:shadow-glow-cyan/10 animate-fade-in`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className={`text-3xl font-extrabold mt-1 bg-gradient-to-r ${valueGradient[color]} bg-clip-text text-transparent`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className={`w-12 h-12 ${iconBg[color]} rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {action && (
      <a href={action.href} className="text-xs font-semibold text-sky-600 dark:text-neon-cyan hover:text-neon-violet dark:hover:text-neon-violetLight transition-colors">
        {action.label} →
      </a>
    )}
  </div>
);

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalGames: 0, totalMatches: 0, activeConversations: 0 });
  const [platformStats, setPlatformStats] = useState(null);
  const [popularPlayers, setPopularPlayers] = useState([]);
  const [recentlyActive, setRecentlyActive] = useState([]);
  const [topMatchers, setTopMatchers] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPublic, setLoadingPublic] = useState(true);

  useEffect(() => { loadPublicData(); }, []);
  useEffect(() => { if (user) loadDashboardData(); }, [user]);

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

  /* ─── Guest landing ─── */
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark text-slate-900 dark:text-white">

        {/* Hero */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center animate-fade-in max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-neon-cyan/10 border border-sky-200 dark:border-neon-cyan/20 text-sky-600 dark:text-neon-cyan text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-neon-cyan animate-pulse" />
              Plateforme Gaming Social
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent leading-none tracking-tight">
              GameConnect
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Trouve tes coéquipiers parfaits. Connecte-toi avec des joueurs qui partagent ta passion,
              ton niveau et tes créneaux de jeu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-gradient-neon px-8 py-4 rounded-2xl font-bold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105"
              >
                Commencer gratuitement
              </a>
              <a
                href="/login"
                className="px-8 py-4 rounded-2xl font-semibold border border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:border-sky-400/50 dark:hover:border-neon-cyan/40 hover:text-sky-600 dark:hover:text-neon-cyan transition-all hover:bg-sky-50 dark:hover:bg-neon-cyan/5"
              >
                Connexion
              </a>
            </div>
          </div>

          {/* Feature Bento — 3 cards */}
          <div className="mt-24 grid md:grid-cols-3 gap-5">
            {[
              { icon: '🎮', title: 'Matching Intelligent', desc: 'Notre algorithme te met en relation avec des joueurs selon tes jeux, niveau et disponibilités.', accent: 'from-neon-cyan/10 to-neon-cyan/5 dark:from-neon-cyan/15 dark:to-transparent' },
              { icon: '💬', title: 'Messagerie Directe', desc: 'Discute avec tes coéquipiers et organise tes sessions de jeu.', accent: 'from-neon-violet/10 to-neon-violet/5 dark:from-neon-violet/20 dark:to-transparent' },
              { icon: '👥', title: 'Communauté Gaming', desc: 'Rejoins une communauté de joueurs passionnés et trouve tes futurs coéquipiers.', accent: 'from-sky-100 to-sky-50 dark:from-sky-500/15 dark:to-transparent' },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`relative p-7 ${CARD_BASE} hover:border-sky-300 dark:hover:border-neon-cyan/30 hover:shadow-md dark:hover:shadow-glow-cyan/10 overflow-hidden group animate-fade-in`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-neon rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-glow-cyan group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Stats bar */}
        {platformStats && (
          <div className="bg-slate-100 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/5 py-14">
            <div className="container mx-auto px-4">
              <h2 className="text-center text-xl font-bold mb-8 text-slate-700 dark:text-slate-200">
                Une communauté active
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Joueurs" value={platformStats.total_users} icon="👥" color="primary" index={0} />
                <StatCard label="Jeux" value={platformStats.total_games} icon="🎮" color="green" index={1} />
                <StatCard label="Matchs réussis" value={platformStats.total_matches} icon="🤝" color="purple" index={2} />
                <StatCard label="Messages" value={platformStats.total_messages} icon="💬" color="blue" index={3} />
              </div>
            </div>
          </div>
        )}

        {/* Popular Players */}
        {popularPlayers.length > 0 && (
          <div className="container mx-auto px-4 py-14">
            <SectionHeader title="Joueurs Populaires" subtitle="Les joueurs les plus actifs de la communauté" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loadingPublic
                ? [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
                : popularPlayers.map((player, index) => (
                    <PlayerCard key={player.id} player={player} index={index} variant="popular" />
                  ))}
            </div>
          </div>
        )}

        {/* Recently Active */}
        {recentlyActive.length > 0 && (
          <div className="container mx-auto px-4 pb-10">
            <SectionHeader title="Récemment Actifs" subtitle="Joueurs connectés ces derniers jours" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyActive.map((player, index) => (
                <PlayerCard key={player.id} player={player} index={index} variant="active" />
              ))}
            </div>
          </div>
        )}

        {/* Top Matchers */}
        {topMatchers.length > 0 && (
          <div className="container mx-auto px-4 pb-10">
            <SectionHeader title="Plus de Matchs" subtitle="Les joueurs avec le plus de connexions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMatchers.map((player, index) => (
                <PlayerCard key={player.id} player={player} index={index} variant="matches" />
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-neon opacity-[0.08] rounded-3xl" />
            <div className="absolute inset-0 bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-sky-200 dark:border-neon-cyan/20" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-800 dark:text-white">
                Prêt à rejoindre la communauté ?
              </h2>
              <p className="text-base text-slate-500 dark:text-slate-300 mb-8 max-w-lg mx-auto leading-relaxed">
                Inscris-toi gratuitement et commence à trouver tes futurs coéquipiers dès aujourd'hui.
              </p>
              <a
                href="/register"
                className="inline-block bg-gradient-neon px-10 py-4 rounded-2xl font-bold text-white shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all hover:scale-105"
              >
                Créer mon compte
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="h-8 w-64 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse mb-8" />
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => <SkeletonStat key={i} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Authenticated dashboard ─── */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gaming-dark text-slate-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">

        <WelcomeMessage />

        {/* Stats row */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Jeux dans mon profil" value={stats.totalGames} icon="🎮" color="primary" index={0} />
          <StatCard label="Matchs Actifs" value={stats.totalMatches} icon="🤝" color="green" index={1} />
          <StatCard label="Conversations" value={stats.activeConversations} icon="💬" color="purple" index={2} />
        </div>

        {/* Bento row — Recent Matches + Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-5 mb-6">

          {/* Recent Matches — 2/3 */}
          <div className={`lg:col-span-2 ${CARD_BASE} p-6`}>
            <SectionHeader title="Matchs Récents" action={{ href: '/matching', label: 'Voir tout' }} />
            {recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.map((match, index) => (
                  <div
                    key={match.match_id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 hover:border-sky-300 dark:hover:border-neon-cyan/20 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={match.avatar_url} username={match.username} size={40} className="ring-2 ring-sky-400/30 dark:ring-neon-cyan/20" />
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{match.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{match.games}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        match.status === 'accepted'
                          ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      }`}>
                        {match.status === 'accepted' ? 'Accepté' : 'En attente'}
                      </span>
                      <p className="text-xs mt-1 font-semibold bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
                        {match.match_score}% compat.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gradient-neon rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-cyan animate-float">
                  <span className="text-xl">🔍</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Pas encore de matchs</p>
                <a href="/matching" className="text-sm font-semibold text-sky-600 dark:text-neon-cyan hover:text-neon-violet dark:hover:text-neon-violetLight transition-colors">
                  Trouve tes coéquipiers !
                </a>
              </div>
            )}
          </div>

          {/* Quick Actions — 1/3 */}
          <div className="flex flex-col gap-4">
            <a
              href="/matching"
              className="flex-1 bg-gradient-neon p-6 rounded-2xl text-center transition-all shadow-glow-cyan hover:shadow-glow-cyan-lg hover:scale-[1.02] group"
            >
              <div className="text-3xl mb-2">🔍</div>
              <p className="font-bold text-white text-sm">Trouver des Matchs</p>
            </a>
            <a
              href="/messages"
              className={`flex-1 ${CARD_BASE} p-6 text-center hover:border-neon-violet/40 dark:hover:border-neon-violet/50 hover:shadow-md group`}
            >
              <div className="text-3xl mb-2">💬</div>
              <p className="font-semibold text-neon-violet text-sm">Messages</p>
            </a>
            <a
              href="/games"
              className={`flex-1 ${CARD_BASE} p-6 text-center hover:border-emerald-400/40 dark:hover:border-emerald-400/40 hover:shadow-md group`}
            >
              <div className="text-3xl mb-2">🎮</div>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">Mes Jeux</p>
            </a>
          </div>
        </div>

        {/* Community row */}
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {popularPlayers.length > 0 && (
            <div className={`${CARD_BASE} p-6`}>
              <SectionHeader title="Joueurs Populaires" subtitle="Les plus actifs" />
              <div className="space-y-3">
                {popularPlayers.slice(0, 4).map((player, index) => (
                  <PlayerCard key={player.id} player={player} index={index} variant="popular" />
                ))}
              </div>
            </div>
          )}
          {recentlyActive.length > 0 && (
            <div className={`${CARD_BASE} p-6`}>
              <SectionHeader title="Récemment Actifs" subtitle="Connectés récemment" />
              <div className="space-y-3">
                {recentlyActive.slice(0, 4).map((player, index) => (
                  <PlayerCard key={player.id} player={player} index={index} variant="active" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Matchers */}
        {topMatchers.length > 0 && (
          <div className={`${CARD_BASE} p-6`}>
            <SectionHeader title="Plus de Matchs" subtitle="Joueurs avec le plus de connexions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMatchers.slice(0, 6).map((player, index) => (
                <PlayerCard key={player.id} player={player} index={index} variant="matches" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
