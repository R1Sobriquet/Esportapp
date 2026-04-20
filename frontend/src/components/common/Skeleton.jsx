import React from 'react';

export const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const variantClasses = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-white/8 ${variantClasses[variant]} ${className}`} />
  );
};

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden">
    <Skeleton className="h-32 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
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

export const SkeletonConversation = () => (
  <div className="p-4 border-b border-slate-100 dark:border-white/5">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-12 h-12 shrink-0" />
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

export const SkeletonMessage = ({ isOwn = false }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && <Skeleton variant="circular" className="w-8 h-8" />}
      <Skeleton className={`h-12 ${isOwn ? 'w-48' : 'w-56'} rounded-xl`} />
      <Skeleton className="h-3 w-12" />
    </div>
  </div>
);

export const SkeletonGame = () => (
  <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/8 p-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="space-y-6">
    <Skeleton className="h-48 w-full rounded-2xl" />
    <div className="px-6 -mt-16 relative">
      <div className="flex items-end gap-4">
        <Skeleton variant="circular" className="w-32 h-32 shrink-0" />
        <div className="flex-1 space-y-2 pb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
    <div className="px-6 grid grid-cols-3 gap-4">
      {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
    </div>
    <div className="px-6 space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonStat = () => (
  <div className="bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/8 p-5">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton variant="circular" className="w-12 h-12" />
    </div>
  </div>
);

export const LoadingSpinner = ({ text = 'Chargement...' }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-12">
    <div className="w-12 h-12 border-2 border-sky-200 dark:border-neon-cyan/20 border-t-sky-500 dark:border-t-neon-cyan rounded-full animate-spin" />
    <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">{text}</p>
  </div>
);

export default Skeleton;
