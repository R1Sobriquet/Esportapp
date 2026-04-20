import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function WelcomeMessage() {
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 17) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    if (user?.created_at) {
      const hoursSinceCreation = (new Date() - new Date(user.created_at)) / (1000 * 60 * 60);
      setIsNewUser(hoursSinceCreation < 1);
    }
  }, [user]);

  const getGreeting = () => ({
    morning: '🌅 Bon matin',
    afternoon: '☀️ Bon après-midi',
    evening: '🌙 Bonsoir',
  }[timeOfDay] || '👋 Salut');

  if (!user) return null;

  if (isNewUser) {
    return (
      <div className="space-y-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎉</span>
            <div>
              <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                Bienvenue sur GameConnect, {user.username} !
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Félicitations ! Votre compte a été créé avec succès.
                Commence par ajouter tes jeux favoris pour trouver des coéquipiers !
              </p>
            </div>
          </div>
        </div>

        <div className="bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-sky-700 dark:text-neon-cyan mb-4 uppercase tracking-wide">
            🚀 Premiers pas sur GameConnect
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '🎮', title: 'Ajoute tes jeux', text: 'Va dans "Jeux" pour ajouter tes titres favoris et ton niveau.' },
              { icon: '🔍', title: 'Trouve des coéquipiers', text: 'Utilise le "Matching" pour découvrir des joueurs compatibles.' },
              { icon: '💬', title: 'Commence à discuter', text: 'Une fois connecté, utilise la messagerie pour organiser tes parties.' },
            ].map(({ icon, title, text }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{icon}</span>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white mb-0.5">{title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">
        {getGreeting()}, <span className="bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">{user.username}</span> ! 👋
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Content de te voir ! Voici un aperçu de tes connexions gaming
      </p>
    </div>
  );
}
