/**
 * Predefined image galleries for avatars and banners
 * These are curated images that users can choose from
 */

// Avatar categories with gaming themes
export const AVATAR_CATEGORIES = {
  gaming: 'Gaming',
  characters: 'Personnages',
  abstract: 'Abstrait',
  animals: 'Animaux',
  colors: 'Couleurs'
};

// Predefined avatars - using DiceBear API for consistent, unique avatars
export const PREDEFINED_AVATARS = [
  // Gaming themed avatars (using pixel art style)
  { id: 'avatar-1', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer1&backgroundColor=640D14', category: 'gaming', name: 'Gamer Rouge' },
  { id: 'avatar-2', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Gamer2&backgroundColor=250902', category: 'gaming', name: 'Gamer Dark' },
  { id: 'avatar-3', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pro&backgroundColor=800E13', category: 'gaming', name: 'Pro Player' },
  { id: 'avatar-4', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Elite&backgroundColor=AD2831', category: 'gaming', name: 'Elite' },
  { id: 'avatar-5', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Champion&backgroundColor=38040E', category: 'gaming', name: 'Champion' },

  // Character avatars (using adventurer style)
  { id: 'avatar-6', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=640D14', category: 'characters', name: 'Aventurier' },
  { id: 'avatar-7', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=800E13', category: 'characters', name: 'Luna' },
  { id: 'avatar-8', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Max&backgroundColor=AD2831', category: 'characters', name: 'Max' },
  { id: 'avatar-9', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=250902', category: 'characters', name: 'Aria' },
  { id: 'avatar-10', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Storm&backgroundColor=38040E', category: 'characters', name: 'Storm' },

  // Abstract/bottts avatars (robot style)
  { id: 'avatar-11', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bot1&backgroundColor=640D14', category: 'abstract', name: 'Robot Alpha' },
  { id: 'avatar-12', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bot2&backgroundColor=800E13', category: 'abstract', name: 'Robot Beta' },
  { id: 'avatar-13', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bot3&backgroundColor=AD2831', category: 'abstract', name: 'Robot Gamma' },
  { id: 'avatar-14', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber&backgroundColor=250902', category: 'abstract', name: 'Cyber' },
  { id: 'avatar-15', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Neon&backgroundColor=38040E', category: 'abstract', name: 'Neon' },

  // Fun/identicon avatars
  { id: 'avatar-16', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Player1&backgroundColor=640D14', category: 'abstract', name: 'Identicon 1' },
  { id: 'avatar-17', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Player2&backgroundColor=800E13', category: 'abstract', name: 'Identicon 2' },
  { id: 'avatar-18', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=Player3&backgroundColor=AD2831', category: 'abstract', name: 'Identicon 3' },

  // Lorelei avatars (anime style)
  { id: 'avatar-19', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Anime1&backgroundColor=640D14', category: 'characters', name: 'Anime 1' },
  { id: 'avatar-20', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Anime2&backgroundColor=800E13', category: 'characters', name: 'Anime 2' },
  { id: 'avatar-21', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Anime3&backgroundColor=AD2831', category: 'characters', name: 'Anime 3' },

  // Thumbs/fun avatars
  { id: 'avatar-22', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Happy&backgroundColor=640D14', category: 'animals', name: 'Happy' },
  { id: 'avatar-23', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Cool&backgroundColor=800E13', category: 'animals', name: 'Cool' },
  { id: 'avatar-24', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Chill&backgroundColor=AD2831', category: 'animals', name: 'Chill' },

  // Color-based simple avatars (using initials style)
  { id: 'avatar-25', url: 'https://api.dicebear.com/7.x/initials/svg?seed=GG&backgroundColor=640D14&textColor=ffffff', category: 'colors', name: 'GG Rouge' },
  { id: 'avatar-26', url: 'https://api.dicebear.com/7.x/initials/svg?seed=PRO&backgroundColor=1f2937&textColor=AD2831', category: 'colors', name: 'PRO Dark' },
  { id: 'avatar-27', url: 'https://api.dicebear.com/7.x/initials/svg?seed=MVP&backgroundColor=800E13&textColor=ffffff', category: 'colors', name: 'MVP' },
  { id: 'avatar-28', url: 'https://api.dicebear.com/7.x/initials/svg?seed=ACE&backgroundColor=AD2831&textColor=ffffff', category: 'colors', name: 'ACE' },
];

// Banner categories
export const BANNER_CATEGORIES = {
  gaming: 'Gaming',
  abstract: 'Abstrait',
  gradient: 'Dégradés',
  dark: 'Sombre'
};

// Predefined banners - using gradient and pattern based URLs
export const PREDEFINED_BANNERS = [
  // Gaming themed gradient banners (using placeholder services with gradients)
  {
    id: 'banner-1',
    url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=400&fit=crop',
    category: 'gaming',
    name: 'Gaming Setup'
  },
  {
    id: 'banner-2',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=400&fit=crop',
    category: 'gaming',
    name: 'Esport Arena'
  },
  {
    id: 'banner-3',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=400&fit=crop',
    category: 'gaming',
    name: 'Controller'
  },
  {
    id: 'banner-4',
    url: 'https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1200&h=400&fit=crop',
    category: 'gaming',
    name: 'Keyboard RGB'
  },

  // Abstract tech banners
  {
    id: 'banner-5',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&h=400&fit=crop',
    category: 'abstract',
    name: 'Retro Tech'
  },
  {
    id: 'banner-6',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=400&fit=crop',
    category: 'abstract',
    name: 'Circuit Board'
  },
  {
    id: 'banner-7',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop',
    category: 'abstract',
    name: 'Matrix Code'
  },

  // Gradient banners (using CSS gradients encoded as data URLs or placeholder)
  {
    id: 'banner-8',
    // Red/bordeaux gradient matching theme
    url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#250902"/><stop offset="50%" style="stop-color:#640D14"/><stop offset="100%" style="stop-color:#AD2831"/></linearGradient></defs><rect fill="url(#g)" width="1200" height="400"/></svg>`),
    category: 'gradient',
    name: 'Rouge Bordeaux'
  },
  {
    id: 'banner-9',
    // Dark red gradient
    url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#0f0f0f"/><stop offset="50%" style="stop-color:#38040E"/><stop offset="100%" style="stop-color:#0f0f0f"/></linearGradient></defs><rect fill="url(#g)" width="1200" height="400"/></svg>`),
    category: 'gradient',
    name: 'Dark Center'
  },
  {
    id: 'banner-10',
    // Purple to red gradient
    url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="50%" style="stop-color:#640D14"/><stop offset="100%" style="stop-color:#800E13"/></linearGradient></defs><rect fill="url(#g)" width="1200" height="400"/></svg>`),
    category: 'gradient',
    name: 'Purple Red'
  },
  {
    id: 'banner-11',
    // Fire gradient
    url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" style="stop-color:#250902"/><stop offset="30%" style="stop-color:#800E13"/><stop offset="60%" style="stop-color:#AD2831"/><stop offset="100%" style="stop-color:#ff6b35"/></linearGradient></defs><rect fill="url(#g)" width="1200" height="400"/></svg>`),
    category: 'gradient',
    name: 'Fire'
  },

  // Dark themed banners
  {
    id: 'banner-12',
    url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&h=400&fit=crop',
    category: 'dark',
    name: 'Dark Clouds'
  },
  {
    id: 'banner-13',
    url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&h=400&fit=crop',
    category: 'dark',
    name: 'Dark Gradient'
  },
  {
    id: 'banner-14',
    // Pure dark with subtle pattern
    url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#0a0a0a"/><stop offset="100%" style="stop-color:#1a1a1a"/></linearGradient><pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="#640D14" opacity="0.3"/></pattern></defs><rect fill="url(#g)" width="1200" height="400"/><rect fill="url(#p)" width="1200" height="400"/></svg>`),
    category: 'dark',
    name: 'Dark Dots'
  },
  {
    id: 'banner-15',
    // Geometric dark pattern
    url: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#111111"/><stop offset="100%" style="stop-color:#1f1f1f"/></linearGradient><pattern id="p" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M30 0 L60 30 L30 60 L0 30 Z" fill="none" stroke="#640D14" stroke-width="0.5" opacity="0.2"/></pattern></defs><rect fill="url(#g)" width="1200" height="400"/><rect fill="url(#p)" width="1200" height="400"/></svg>`),
    category: 'dark',
    name: 'Geometric'
  },
];

// Helper function to get avatars by category
export const getAvatarsByCategory = (category) => {
  if (!category || category === 'all') return PREDEFINED_AVATARS;
  return PREDEFINED_AVATARS.filter(avatar => avatar.category === category);
};

// Helper function to get banners by category
export const getBannersByCategory = (category) => {
  if (!category || category === 'all') return PREDEFINED_BANNERS;
  return PREDEFINED_BANNERS.filter(banner => banner.category === category);
};

// Generate a random avatar from predefined list
export const getRandomAvatar = () => {
  const index = Math.floor(Math.random() * PREDEFINED_AVATARS.length);
  return PREDEFINED_AVATARS[index];
};

// Generate a random banner from predefined list
export const getRandomBanner = () => {
  const index = Math.floor(Math.random() * PREDEFINED_BANNERS.length);
  return PREDEFINED_BANNERS[index];
};
