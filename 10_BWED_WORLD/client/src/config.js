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
      name: 'Chef Emile',
      role: 'The Master Pastry Chef',
      emoji: '👨‍🍳',
      file: './assets/avatars/tiny-baker.glb',
      thumb: './assets/avatars/thumbs/tiny-baker.png',
      scale: 1.15
    },
    'super-hero-bwed': {
      id: 'super-hero-bwed',
      name: 'Super Bwed',
      role: 'The Golden Protector',
      emoji: '🦸',
      file: './assets/avatars/super-hero-bwed.glb',
      thumb: './assets/avatars/thumbs/super-hero-bwed.png',
      scale: 1.15
    },
    'saiyan-toast': {
      id: 'saiyan-toast',
      name: 'Saiyan Toast',
      role: 'Flour-Powered Warrior',
      emoji: '⚡',
      file: './assets/avatars/saiyan-toast.glb',
      thumb: './assets/avatars/thumbs/saiyan-toast.png',
      scale: 1.15
    },
    'choco-drip': {
      id: 'choco-drip',
      name: 'Choco Drip',
      role: 'The Molten Gourmet',
      emoji: '🍫',
      file: './assets/avatars/choco-drip.glb',
      thumb: './assets/avatars/thumbs/choco-drip.png',
      scale: 1.15
    },
    'cloud-ninja': {
      id: 'cloud-ninja',
      name: 'Cloud Ninja',
      role: 'Celestial Shadow',
      emoji: '☁️',
      file: './assets/avatars/cloud-ninja.glb',
      thumb: './assets/avatars/thumbs/cloud-ninja.png',
      scale: 1.15
    },
    'crimson-samurai': {
      id: 'crimson-samurai',
      name: 'Crimson Samurai',
      role: 'Guardian of the Oven',
      emoji: '⚔️',
      file: './assets/avatars/crimson-samurai.glb',
      thumb: './assets/avatars/thumbs/crimson-samurai.png',
      scale: 1.15
    },
    'crimson-mage': {
      id: 'crimson-mage',
      name: 'Crimson Mage',
      role: 'Sourdough Alchemist',
      emoji: '🔮',
      file: './assets/avatars/crimson-mage.glb',
      thumb: './assets/avatars/thumbs/crimson-mage.png',
      scale: 1.15
    },
    'brave-firefighter': {
      id: 'brave-firefighter',
      name: 'Brave Firefighter',
      role: 'Baking Savior',
      emoji: '🚒',
      file: './assets/avatars/brave-firefighter.glb',
      thumb: './assets/avatars/thumbs/brave-firefighter.png',
      scale: 1.15
    },
    'glow-toast': {
      id: 'glow-toast',
      name: 'Glow Toast',
      role: 'The Radiant Slice',
      emoji: '✨',
      file: './assets/avatars/glow-toast.glb',
      thumb: './assets/avatars/thumbs/glow-toast.png',
      scale: 1.15
    },
    'toast-tycoon': {
      id: 'toast-tycoon',
      name: 'Toast Tycoon',
      role: 'Wheat Magnate',
      emoji: '🎩',
      file: './assets/avatars/toast-tycoon.glb',
      thumb: './assets/avatars/thumbs/toast-tycoon.png',
      scale: 1.15
    },
    'whale-buddy': {
      id: 'whale-buddy',
      name: 'Whale Buddy',
      role: 'Oceanic Brioche Pal',
      emoji: '🐋',
      file: './assets/avatars/whale-buddy.glb',
      thumb: './assets/avatars/thumbs/whale-buddy.png',
      scale: 1.15
    },
    'nerdy-buddy': {
      id: 'nerdy-buddy',
      name: 'Nerdy Buddy',
      role: 'Scholar of Recipes',
      emoji: '👓',
      file: './assets/avatars/nerdy-buddy.glb',
      thumb: './assets/avatars/thumbs/nerdy-buddy.png',
      scale: 1.15
    },
    'rusty-buttonbot': {
      id: 'rusty-buttonbot',
      name: 'Rusty Buttonbot',
      role: 'Automaton of the Bakehouse',
      emoji: '🤖',
      file: './assets/avatars/rusty-buttonbot.glb',
      thumb: './assets/avatars/thumbs/rusty-buttonbot.png',
      scale: 1.15
    },
    'frankenbwed': {
      id: 'frankenbwed',
      name: 'Frankenbwed',
      role: 'Crispy Creature',
      emoji: '🧟',
      file: './assets/avatars/frankenbwed.glb',
      thumb: './assets/avatars/thumbs/frankenbwed.png',
      scale: 1.15
    },
    'judge-gaveltoes': {
      id: 'judge-gaveltoes',
      name: 'Judge Gaveltoes',
      role: 'Judge of Taste',
      emoji: '⚖️',
      file: './assets/avatars/judge-gaveltoes.glb',
      thumb: './assets/avatars/thumbs/judge-gaveltoes.png',
      scale: 1.15
    },
    'toast-bandit': {
      id: 'toast-bandit',
      name: 'Toast Bandit',
      role: 'Crust Thief',
      emoji: '🦹',
      file: './assets/avatars/toast-bandit.glb',
      thumb: './assets/avatars/thumbs/toast-bandit.png',
      scale: 1.15
    },
    'crumb-burglar': {
      id: 'crumb-burglar',
      name: 'Crumb Burglar',
      role: 'Crumb Snatcher',
      emoji: '🦊',
      file: './assets/avatars/crumb-burglar.glb',
      thumb: './assets/avatars/thumbs/crumb-burglar.png',
      scale: 1.15
    },
    'shadow-ninja': {
      id: 'shadow-ninja',
      name: 'Shadow Ninja',
      role: 'Sourdough Spy',
      emoji: '🥷',
      file: './assets/avatars/shadow-ninja.glb',
      thumb: './assets/avatars/thumbs/shadow-ninja.png',
      scale: 1.15
    },
    'hero-of-toast': {
      id: 'hero-of-toast',
      name: 'Hero of Toast',
      role: 'Hero of Time & Flour',
      emoji: '🗡️',
      file: './assets/avatars/hero-of-toast.glb',
      thumb: './assets/avatars/thumbs/hero-of-toast.png',
      scale: 1.15
    },
    'toast-wizard': {
      id: 'toast-wizard',
      name: 'The Toast Wizard',
      role: 'Master of Yeast Magic',
      emoji: '🧙‍♂️',
      file: './assets/avatars/toast-wizard.glb',
      thumb: './assets/avatars/thumbs/toast-wizard.png',
      scale: 1.15
    },
    'honey-knight': {
      id: 'honey-knight',
      name: 'Honey Knight',
      role: 'Paladin of Golden Crust',
      emoji: '🛡️',
      file: './assets/avatars/honey-knight.glb',
      thumb: './assets/avatars/thumbs/honey-knight.png',
      scale: 1.15
    },
    'reggae-toast': {
      id: 'reggae-toast',
      name: 'Reggae Toast',
      role: 'Vibes of the Golden Sun',
      emoji: '🌴',
      category: 'classic',
      file: './assets/avatars/reggae-toast.glb',
      thumb: './assets/avatars/thumbs/tiny-baker.png',
      scale: 1.15
    },
    'cozy-shiba': {
      id: 'cozy-shiba',
      name: 'Cozy Shiba Buddy',
      role: 'Loyal Cozy Friend & Mascot',
      emoji: '🐕',
      category: 'rigged',
      isAnimatedRig: true,
      desc: 'The adorable canine companion of BwedTown! Official Meshy AI 3D model featuring full skeletal rigging, PBR textured fur, and 13 built-in animations (idle, walk, run, festive dance).',
      file: './assets/avatars/cozy-shiba-animated.glb',
      thumb: './assets/avatars/thumbs/tiny-baker.png',
      scale: 0.70
    }
  },

  biomes: {
    'village-center': {
      id: 'village-center',
      name: 'The Golden Butter Square',
      kicker: 'CENTRAL VILLAGE &middot; HUB',
      skyColor: 0xfff4e6,
      fogColor: 0xf5dfc6,
      fogNear: 60,
      fogFar: 220,
      ambientColor: 0xffecd1,
      ambientIntensity: 1.45,
      sunColor: 0xffeed6,
      sunIntensity: 2.3,
      sunPosition: [40, 65, 35]
    },
    'cacao-forest': {
      id: 'cacao-forest',
      name: 'Cocoa Woods & Matcha Clearing',
      kicker: 'COCOA DISTRICT &middot; NATURE',
      skyColor: 0x1d2e24,
      fogColor: 0x18241c,
      fogNear: 50,
      fogFar: 190,
      ambientColor: 0x88c278,
      ambientIntensity: 1.3,
      sunColor: 0x9be882,
      sunIntensity: 1.9,
      sunPosition: [-35, 55, -45]
    }
  }
};

CONFIG.biome = CONFIG.biomes['village-center'];

