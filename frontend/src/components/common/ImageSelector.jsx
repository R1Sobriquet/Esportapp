import React, { useState, useEffect } from 'react';
import {
  PREDEFINED_AVATARS,
  PREDEFINED_BANNERS,
  AVATAR_CATEGORIES,
  BANNER_CATEGORIES,
  getAvatarsByCategory,
  getBannersByCategory
} from '../../constants/imageGallery';

const INPUT = 'w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-neon-cyan/60 focus:border-transparent transition-all text-sm';

export default function ImageSelector({
  isOpen,
  onClose,
  onSelect,
  type = 'avatar',
  currentImage = null
}) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageError, setImageError] = useState(false);

  const isAvatar = type === 'avatar';
  const categories = isAvatar ? AVATAR_CATEGORIES : BANNER_CATEGORIES;
  const images = isAvatar ? getAvatarsByCategory(activeCategory) : getBannersByCategory(activeCategory);

  useEffect(() => {
    if (isOpen) {
      setActiveCategory('all');
      setCustomUrl('');
      setShowCustomInput(false);
      setPreviewUrl(null);
      setImageError(false);
    }
  }, [isOpen]);

  const handleSelectImage = (imageUrl) => { onSelect(imageUrl); onClose(); };

  const handleCustomUrlSubmit = () => {
    if (customUrl.trim()) {
      if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
        setImageError(true); return;
      }
      onSelect(customUrl.trim()); onClose();
    }
  };

  const handlePreviewCustomUrl = () => {
    if (customUrl.trim()) { setPreviewUrl(customUrl.trim()); setImageError(false); }
  };

  if (!isOpen) return null;

  const tabClass = (active) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-gradient-neon text-white shadow-glow-cyan'
        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gaming-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-sky-500 to-neon-violet dark:from-neon-cyan dark:to-neon-violet bg-clip-text text-transparent">
              {isAvatar ? 'Choisir un avatar' : 'Choisir une bannière'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/8 rounded-xl transition-colors text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveCategory('all')} className={tabClass(activeCategory === 'all' && !showCustomInput)}>
              Tous
            </button>
            {Object.entries(categories).map(([key, label]) => (
              <button key={key} onClick={() => { setActiveCategory(key); setShowCustomInput(false); }} className={tabClass(activeCategory === key && !showCustomInput)}>
                {label}
              </button>
            ))}
            <button onClick={() => setShowCustomInput(!showCustomInput)} className={tabClass(showCustomInput)}>
              URL personnalisée
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {showCustomInput ? (
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  URL de l'image
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => { setCustomUrl(e.target.value); setImageError(false); }}
                    placeholder="https://example.com/image.png"
                    className={INPUT}
                  />
                  <button
                    onClick={handlePreviewCustomUrl}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-neon-cyan/30 rounded-xl text-sm text-slate-600 dark:text-slate-300 transition-all whitespace-nowrap"
                  >
                    Prévisualiser
                  </button>
                </div>
                {imageError && <p className="text-red-500 dark:text-red-400 text-sm mt-2">L'URL doit commencer par http:// ou https://</p>}
              </div>

              {previewUrl && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-semibold">Aperçu</p>
                  <div className={`relative ${isAvatar ? 'w-32 h-32' : 'w-full h-40'} bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10`}>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                  </div>
                  {!imageError && (
                    <button
                      onClick={handleCustomUrlSubmit}
                      className="px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-green-400 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-emerald-400/30 transition-all"
                    >
                      Utiliser cette image
                    </button>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 dark:border-white/8">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">💡 Conseils</p>
                <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
                  <li>Utilise une image carrée pour les avatars</li>
                  <li>Pour les bannières, 1200×400 pixels est idéal</li>
                  <li>Formats supportés : JPG, PNG, GIF, WebP</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className={`grid gap-3 ${
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
                      ? 'border-sky-500 dark:border-neon-cyan shadow-glow-cyan ring-2 ring-sky-400/30 dark:ring-neon-cyan/30'
                      : 'border-slate-200 dark:border-white/10 hover:border-sky-400 dark:hover:border-neon-cyan/50'
                  }`}
                >
                  <div className={`${isAvatar ? 'aspect-square' : 'aspect-[3/1]'} bg-slate-100 dark:bg-white/5`}>
                    <img src={image.url} alt={image.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                    <span className="text-xs text-white font-medium px-2 py-0.5 bg-black/50 rounded-lg">{image.name}</span>
                  </div>
                  {currentImage === image.url && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-sky-500 dark:bg-neon-cyan rounded-full flex items-center justify-center shadow-glow-cyan">
                      <svg className="w-3.5 h-3.5 text-white dark:text-gaming-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-white/8 flex justify-between items-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {showCustomInput
              ? 'Entre une URL ou retourne à la galerie'
              : `${images.length} image${images.length > 1 ? 's' : ''} disponible${images.length > 1 ? 's' : ''}`}
          </p>
          <div className="flex gap-2">
            {currentImage && (
              <button
                onClick={() => handleSelectImage('')}
                className="px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-xl text-sm transition-all"
              >
                Supprimer
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-600 dark:text-slate-300 text-sm transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
