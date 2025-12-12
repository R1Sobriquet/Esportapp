/**
 * ImageSelector Component
 * Modal for selecting avatars or banners from predefined galleries
 * Also supports custom URL input
 */

import React, { useState, useEffect } from 'react';
import {
  PREDEFINED_AVATARS,
  PREDEFINED_BANNERS,
  AVATAR_CATEGORIES,
  BANNER_CATEGORIES,
  getAvatarsByCategory,
  getBannersByCategory
} from '../../constants/imageGallery';

export default function ImageSelector({
  isOpen,
  onClose,
  onSelect,
  type = 'avatar', // 'avatar' or 'banner'
  currentImage = null
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const isAvatar = type === 'avatar';
  const categories = isAvatar ? AVATAR_CATEGORIES : BANNER_CATEGORIES;
  const images = isAvatar
    ? getAvatarsByCategory(activeCategory)
    : getBannersByCategory(activeCategory);

  useEffect(() => {
    if (isOpen) {
      setActiveCategory('all');
      setCustomUrl('');
      setShowCustomInput(false);
      setPreviewUrl(null);
      setImageError(false);
    }
  }, [isOpen]);

  const handleSelectImage = (imageUrl) => {
    onSelect(imageUrl);
    onClose();
  };

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
        setImageError(true);
        return;
      }
      onSelect(customUrl.trim());
      onClose();
    }
  };

  const handlePreviewCustomUrl = () => {
    if (customUrl.trim()) {
      setPreviewUrl(customUrl.trim());
      setImageError(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-primary/30 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
              {isAvatar ? 'Choisir un avatar' : 'Choisir une bannière'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-gradient-primary text-white shadow-glow-red'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              Tous
            </button>
            {Object.entries(categories).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === key
                    ? 'bg-gradient-primary text-white shadow-glow-red'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showCustomInput
                  ? 'bg-gradient-primary text-white shadow-glow-red'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              URL personnalisée
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showCustomInput ? (
            /* Custom URL Input */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Entre l'URL de ton image
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setImageError(false);
                    }}
                    placeholder="https://example.com/image.png"
                    className="flex-1 px-4 py-3 bg-gray-800/80 border border-primary/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light transition-all"
                  />
                  <button
                    onClick={handlePreviewCustomUrl}
                    className="px-4 py-3 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg text-white transition-all"
                  >
                    Prévisualiser
                  </button>
                </div>
                {imageError && (
                  <p className="text-red-400 text-sm mt-2">
                    L'URL doit commencer par http:// ou https://
                  </p>
                )}
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">Aperçu :</p>
                  <div className={`relative ${isAvatar ? 'w-32 h-32' : 'w-full h-48'} bg-gray-800 rounded-xl overflow-hidden border border-primary/20`}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </div>
                  {!imageError && (
                    <button
                      onClick={handleCustomUrlSubmit}
                      className="px-6 py-3 bg-gradient-to-br from-green-600 to-green-500 hover:shadow-lg hover:shadow-green-500/50 rounded-lg font-medium transition-all"
                    >
                      Utiliser cette image
                    </button>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-primary/20">
                <p className="text-sm text-gray-400">
                  💡 Conseils :
                </p>
                <ul className="text-sm text-gray-500 mt-2 space-y-1 list-disc list-inside">
                  <li>Utilise une image carrée pour les avatars</li>
                  <li>Pour les bannières, une image de 1200x400 pixels est idéale</li>
                  <li>Formats supportés : JPG, PNG, GIF, WebP</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Image Gallery Grid */
            <div className={`grid gap-4 ${
              isAvatar
                ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => handleSelectImage(image.url)}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all hover:scale-105 ${
                    currentImage === image.url
                      ? 'border-primary-light shadow-glow-red ring-2 ring-primary-light'
                      : 'border-primary/20 hover:border-primary-light/50'
                  }`}
                >
                  <div className={`${isAvatar ? 'aspect-square' : 'aspect-[3/1]'} bg-gray-800`}>
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Hover overlay with name */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-xs text-white font-medium px-2 py-1 bg-black/50 rounded">
                      {image.name}
                    </span>
                  </div>
                  {/* Selected indicator */}
                  {currentImage === image.url && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-light rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary/20 flex justify-between items-center">
          <p className="text-sm text-gray-400">
            {showCustomInput
              ? 'Entre une URL ou retourne à la galerie'
              : `${images.length} image${images.length > 1 ? 's' : ''} disponible${images.length > 1 ? 's' : ''}`}
          </p>
          <div className="flex gap-2">
            {currentImage && (
              <button
                onClick={() => handleSelectImage('')}
                className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-sm transition-all"
              >
                Supprimer l'image
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 border border-primary/20 rounded-lg text-white transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
