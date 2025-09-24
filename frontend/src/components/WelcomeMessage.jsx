// frontend/src/components/WelcomeMessage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeMessage() {
  const { user } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    // Déterminer le moment de la journée
    const hour = new Date().getHours();
    if (hour < 12) {
      setTimeOfDay('morning');
    } else if (hour < 17) {
      setTimeOfDay('afternoon');
    } else {
      setTimeOfDay('evening');
    }

    // Vérifier si c'est un nouvel utilisateur (compte créé il y a moins d'une heure)
    if (user && user.created_at) {
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);
      setIsNewUser(hoursSinceCreation < 1);
    }
  }, [user]);

  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning':
        return '🌅 Bon matin';
      case 'afternoon':
        return '☀️ Bon après-midi';
      case 'evening':
        return '🌙 Bonsoir';
      default:
        return '👋 Salut';
    }
  };

  const getWelcomeMessage = () => {
    if (isNewUser) {
      return (
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h2 className="text-xl font-bold text-green-400">
                Bienvenue sur GameConnect, {user.username} !
              </h2>
              <p className="text-gray-300 mt-1">
                Félicitations ! Votre compte a été créé avec succès. 
                Commence par ajouter tes jeux favoris pour trouver des coéquipiers !
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {user.username} ! 👋
          </h1>
          <p className="text-gray-400">
            Content de te voir ! Voici un aperçu de tes connexions gaming
          </p>
        </div>
      );
    }
  };

  // Composant de conseils pour nouveaux utilisateurs
  const NewUserTips = () => (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-blue-400 mb-4">
        🚀 Premiers pas sur GameConnect
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎮</span>
          <div>
            <h4 className="font-medium mb-1">Ajoute tes jeux</h4>
            <p className="text-sm text-gray-400">
              Va dans "Jeux" pour ajouter tes titres favoris et ton niveau.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h4 className="font-medium mb-1">Trouve des coéquipiers</h4>
            <p className="text-sm text-gray-400">
              Utilise le "Matching" pour découvrir des joueurs compatibles.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-2xl">💬</span>
          <div>
            <h4 className="font-medium mb-1">Commence à discuter</h4>
            <p className="text-sm text-gray-400">
              Une fois connecté, utilise la messagerie pour organiser tes parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return null; // Ne rien afficher si l'utilisateur n'est pas connecté
  }

  return (
    <div>
      {getWelcomeMessage()}
      {isNewUser && <NewUserTips />}
    </div>
  );
}