/**
 * Gaming-themed UI Components
 * Specialized components with gaming aesthetics
 */

import React from 'react';

/**
 * Rank Badge Component
 * Displays player rank with gaming-style visuals
 */
export const RankBadge = ({ rank, size = 'md', showLabel = true }) => {
  const ranks = {
    bronze: { color: 'from-amber-700 to-amber-900', icon: '🥉', label: 'Bronze' },
    silver: { color: 'from-gray-300 to-gray-500', icon: '🥈', label: 'Argent' },
    gold: { color: 'from-yellow-400 to-yellow-600', icon: '🥇', label: 'Or' },
    platinum: { color: 'from-cyan-300 to-cyan-500', icon: '💎', label: 'Platine' },
    diamond: { color: 'from-blue-400 to-purple-500', icon: '💠', label: 'Diamant' },
    master: { color: 'from-purple-500 to-pink-500', icon: '👑', label: 'Maître' },
    grandmaster: { color: 'from-red-500 to-orange-500', icon: '🔥', label: 'Grand Maître' },
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const rankData = ranks[rank?.toLowerCase()] || ranks.bronze;

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} bg-gradient-to-br ${rankData.color} rounded-full flex items-center justify-center shadow-lg animate-pulse-glow`}
        role="img"
        aria-label={`Rang ${rankData.label}`}
      >
        {rankData.icon}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold text-gray-400">{rankData.label}</span>
      )}
    </div>
  );
};

/**
 * Level Progress Bar Component
 * Shows player level with XP progress
 */
export const LevelProgress = ({ level = 1, currentXP = 0, requiredXP = 100, showDetails = true }) => {
  const progress = Math.min(100, (currentXP / requiredXP) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center font-bold text-lg shadow-glow-red">
            {level}
          </div>
          {showDetails && (
            <span className="text-sm text-gray-400">Niveau {level}</span>
          )}
        </div>
        {showDetails && (
          <span className="text-xs text-gray-500">
            {currentXP.toLocaleString()} / {requiredXP.toLocaleString()} XP
          </span>
        )}
      </div>

      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-light transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentXP}
          aria-valuemin={0}
          aria-valuemax={requiredXP}
        />
      </div>
    </div>
  );
};

/**
 * Achievement Badge Component
 * Displays unlocked achievements
 */
export const AchievementBadge = ({ icon, title, description, unlocked = false, rarity = 'common' }) => {
  const rarityStyles = {
    common: 'border-gray-500 bg-gray-800',
    rare: 'border-blue-500 bg-blue-900/30',
    epic: 'border-purple-500 bg-purple-900/30',
    legendary: 'border-yellow-500 bg-yellow-900/30 animate-pulse-glow',
  };

  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all ${
        unlocked
          ? `${rarityStyles[rarity]} opacity-100`
          : 'border-gray-700 bg-gray-900/50 opacity-50 grayscale'
      }`}
      role="listitem"
      aria-label={`${title} - ${unlocked ? 'Débloqué' : 'Verrouillé'}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div>
          <h4 className="font-semibold text-white">{title}</h4>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
          <span className="text-2xl">🔒</span>
        </div>
      )}
    </div>
  );
};

/**
 * Stats Card Component
 * Gaming-style stat display
 */
export const GameStatCard = ({ icon, label, value, trend, trendUp = true }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl p-4 border border-primary/20 hover:border-primary-light/40 transition-all group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
        {value}
      </p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
};

/**
 * Online Status Indicator
 * Shows player online/offline status
 */
export const OnlineStatus = ({ isOnline, lastSeen, showText = true }) => {
  const formatLastSeen = (date) => {
    if (!date) return 'Jamais';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return `Il y a ${Math.floor(diffMins / 1440)}j`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
          }`}
        />
        {isOnline && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75" />
        )}
      </div>
      {showText && (
        <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-500'}`}>
          {isOnline ? 'En ligne' : formatLastSeen(lastSeen)}
        </span>
      )}
    </div>
  );
};

/**
 * Match Score Display
 * Visual match compatibility score
 */
export const MatchScoreDisplay = ({ score, size = 'md' }) => {
  const getScoreColor = (s) => {
    if (s >= 80) return 'from-green-400 to-emerald-500';
    if (s >= 60) return 'from-yellow-400 to-amber-500';
    if (s >= 40) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`${sizes[size]} relative rounded-full bg-gray-800 flex items-center justify-center`}
      role="meter"
      aria-valuenow={score}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Score de compatibilité: ${score}%`}
    >
      {/* Background circle */}
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="currentColor"
          strokeWidth="8%"
          className="text-gray-700"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8%"
          strokeLinecap="round"
          strokeDasharray={`${score * 2.83} 283`}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={`text-${getScoreColor(score).split(' ')[0].replace('from-', '')}`} stopColor="currentColor" />
            <stop offset="100%" className={`text-${getScoreColor(score).split(' ')[1].replace('to-', '')}`} stopColor="currentColor" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
        {score}%
      </span>
    </div>
  );
};

export default {
  RankBadge,
  LevelProgress,
  AchievementBadge,
  GameStatCard,
  OnlineStatus,
  MatchScoreDisplay,
};
