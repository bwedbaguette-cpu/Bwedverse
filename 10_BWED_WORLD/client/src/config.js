/* ==========================================================================
   CONFIGURATION CLIENT — BWED WORLD
   Catalogue des 18 avatars pions et biomes du monde
   ========================================================================== */

export const CONFIG = {
  version: '2.0.0',
  spawnPoint: { x: 0, y: 0.1, z: 0, rot: 0 },
  defaultAvatar: 'tiny-baker',

  avatars: {
    'tiny-baker': {
      id: 'tiny-baker',
      name: 'Chef Émile',
      role: 'Le Maître Pâtissier',
      file: './assets/avatars/tiny-baker.glb',
      thumb: './assets/avatars/thumbs/tiny-baker.png',
      scale: 1.15
    },
    'super-hero-bwed': {
      id: 'super-hero-bwed',
      name: 'Super Bwed',
      role: 'Le Protecteur Doré',
      file: './assets/avatars/super-hero-bwed.glb',
      thumb: './assets/avatars/thumbs/super-hero-bwed.png',
      scale: 1.15
    },
    'saiyan-toast': {
      id: 'saiyan-toast',
      name: 'Saiyan Toast',
      role: 'Guerrier Fariné',
      file: './assets/avatars/saiyan-toast.glb',
      thumb: './assets/avatars/thumbs/saiyan-toast.png',
      scale: 1.15
    },
    'choco-drip': {
      id: 'choco-drip',
      name: 'Choco Drip',
      role: 'Le Gourmet Fondant',
      file: './assets/avatars/choco-drip.glb',
      thumb: './assets/avatars/thumbs/choco-drip.png',
      scale: 1.15
    },
    'cloud-ninja': {
      id: 'cloud-ninja',
      name: 'Cloud Ninja',
      role: 'L Ombre Céleste',
      file: './assets/avatars/cloud-ninja.glb',
      thumb: './assets/avatars/thumbs/cloud-ninja.png',
      scale: 1.15
    },
    'crimson-samurai': {
      id: 'crimson-samurai',
      name: 'Crimson Samurai',
      role: 'Le Gardien du Four',
      file: './assets/avatars/crimson-samurai.glb',
      thumb: './assets/avatars/thumbs/crimson-samurai.png',
      scale: 1.15
    },
    'crimson-mage': {
      id: 'crimson-mage',
      name: 'Crimson Mage',
      role: 'L Alchimiste du Levain',
      file: './assets/avatars/crimson-mage.glb',
      thumb: './assets/avatars/thumbs/crimson-mage.png',
      scale: 1.15
    },
    'brave-firefighter': {
      id: 'brave-firefighter',
      name: 'Brave Firefighter',
      role: 'Sauveur de Fournée',
      file: './assets/avatars/brave-firefighter.glb',
      thumb: './assets/avatars/thumbs/brave-firefighter.png',
      scale: 1.15
    },
    'glow-toast': {
      id: 'glow-toast',
      name: 'Glow Toast',
      role: 'La Tranche Lumineuse',
      file: './assets/avatars/glow-toast.glb',
      thumb: './assets/avatars/thumbs/glow-toast.png',
      scale: 1.15
    },
    'toast-tycoon': {
      id: 'toast-tycoon',
      name: 'Toast Tycoon',
      role: 'Le Magnat du Blé',
      file: './assets/avatars/toast-tycoon.glb',
      thumb: './assets/avatars/thumbs/toast-tycoon.png',
      scale: 1.15
    },
    'whale-buddy': {
      id: 'whale-buddy',
      name: 'Whale Buddy',
      role: 'L Ami Marin des Brioches',
      file: './assets/avatars/whale-buddy.glb',
      thumb: './assets/avatars/thumbs/whale-buddy.png',
      scale: 1.15
    },
    'nerdy-buddy': {
      id: 'nerdy-buddy',
      name: 'Nerdy Buddy',
      role: 'L Érudit des Recettes',
      file: './assets/avatars/nerdy-buddy.glb',
      thumb: './assets/avatars/thumbs/nerdy-buddy.png',
      scale: 1.15
    },
    'rusty-buttonbot': {
      id: 'rusty-buttonbot',
      name: 'Rusty Buttonbot',
      role: 'L Automate du Fournil',
      file: './assets/avatars/rusty-buttonbot.glb',
      thumb: './assets/avatars/thumbs/rusty-buttonbot.png',
      scale: 1.15
    },
    'frankenbwed': {
      id: 'frankenbwed',
      name: 'Frankenbwed',
      role: 'Créature Croustillante',
      file: './assets/avatars/frankenbwed.glb',
      thumb: './assets/avatars/thumbs/frankenbwed.png',
      scale: 1.15
    },
    'judge-gaveltoes': {
      id: 'judge-gaveltoes',
      name: 'Judge Gaveltoes',
      role: 'Le Juge du Goût',
      file: './assets/avatars/judge-gaveltoes.glb',
      thumb: './assets/avatars/thumbs/judge-gaveltoes.png',
      scale: 1.15
    },
    'toast-bandit': {
      id: 'toast-bandit',
      name: 'Toast Bandit',
      role: 'Le Voleur de Croûtes',
      file: './assets/avatars/toast-bandit.glb',
      thumb: './assets/avatars/thumbs/toast-bandit.png',
      scale: 1.15
    },
    'crumb-burglar': {
      id: 'crumb-burglar',
      name: 'Crumb Burglar',
      role: 'Chapardeur de Miettes',
      file: './assets/avatars/crumb-burglar.glb',
      thumb: './assets/avatars/thumbs/crumb-burglar.png',
      scale: 1.15
    },
    'shadow-ninja': {
      id: 'shadow-ninja',
      name: 'Shadow Ninja',
      role: 'L Espion du Levain',
      file: './assets/avatars/shadow-ninja.glb',
      thumb: './assets/avatars/thumbs/shadow-ninja.png',
      scale: 1.15
    }
  },

  biomes: {
    'village-center': {
      id: 'village-center',
      name: 'La Grand-Place du Beurre Doré',
      kicker: 'QUARTIER CENTRAL',
      skyColor: 0xfff4e6,
      fogColor: 0xf5dfc6,
      fogNear: 35,
      fogFar: 110,
      ambientColor: 0xffecd1,
      ambientIntensity: 1.45,
      sunColor: 0xffeed6,
      sunIntensity: 2.3,
      sunPosition: [28, 42, 24]
    },
    'cacao-forest': {
      id: 'cacao-forest',
      name: 'Le Bois Cacao & Clairière Matcha',
      kicker: 'QUARTIER GOURMAND & NATURE',
      skyColor: 0x1d2e24,
      fogColor: 0x18241c,
      fogNear: 25,
      fogFar: 90,
      ambientColor: 0x88c278,
      ambientIntensity: 1.3,
      sunColor: 0x9be882,
      sunIntensity: 1.9,
      sunPosition: [-24, 38, -32]
    }
  }
};

CONFIG.biome = CONFIG.biomes['village-center'];

