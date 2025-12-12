/**
 * Skeleton Loader Components
 * Provides loading placeholders for better UX
 */

import React from 'react';

/**
 * Base Skeleton component with shimmer animation
 */
export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%]';

  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

/**
 * Skeleton for user cards (matching, players list)
 */
export const SkeletonCard = () => (
  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border border-primary/20 overflow-hidden">
    <Skeleton className="h-32 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

/**
 * Skeleton for conversation items
 */
export const SkeletonConversation = () => (
  <div className="p-4 border-b border-primary/10">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-8" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

/**
 * Skeleton for message bubbles
 */
export const SkeletonMessage = ({ isOwn = false }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && <Skeleton variant="circular" className="w-8 h-8" />}
      <Skeleton className={`h-12 ${isOwn ? 'w-48' : 'w-56'} rounded-lg`} />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

/**
 * Skeleton for game cards
 */
export const SkeletonGame = () => (
  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border border-primary/20 p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
  </div>
);

/**
 * Skeleton for profile header
 */
export const SkeletonProfile = () => (
  <div className="space-y-6">
    {/* Banner */}
    <Skeleton className="h-48 w-full rounded-none" />

    {/* Profile info */}
    <div className="px-6 -mt-16 relative">
      <div className="flex items-end gap-4">
        <Skeleton variant="circular" className="w-32 h-32 border-4 border-gray-900" />
        <div className="flex-1 space-y-2 pb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="px-6 grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>

    {/* Bio */}
    <div className="px-6 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

/**
 * Skeleton for stats cards
 */
export const SkeletonStat = () => (
  <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border border-primary/20 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton variant="circular" className="w-12 h-12" />
    </div>
  </div>
);

/**
 * Loading spinner with text
 */
export const LoadingSpinner = ({ text = 'Chargement...' }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-12">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-primary/20 rounded-full animate-spin border-t-primary-light" />
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent rounded-full animate-ping border-t-primary-light/30" />
    </div>
    <p className="text-gray-400 animate-pulse">{text}</p>
  </div>
);

export default Skeleton;
