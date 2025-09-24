// frontend/src/components/Avatar.jsx
import React from 'react';

export default function Avatar({ 
  src, 
  username, 
  size = 40, 
  className = "" 
}) {
  // Générer une URL d'avatar par défaut si pas d'image fournie
  const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=3B82F6&color=fff&size=${size}&rounded=true`;
  
  // Utiliser l'image fournie ou l'avatar par défaut
  const avatarSrc = src || defaultAvatarUrl;

  return (
    <img
      src={avatarSrc}
      alt={username || 'User'}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        // Si l'image échoue à charger, utiliser l'avatar par défaut
        e.target.src = defaultAvatarUrl;
      }}
    />
  );
}