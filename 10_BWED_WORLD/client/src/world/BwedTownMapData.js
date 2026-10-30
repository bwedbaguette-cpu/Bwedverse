/* ==========================================================================
   BWEDTOWN MAP DATA — BLUEPRINT DE VILLE POKÉMON DS (32x32 CASES)
   Architecture de la grille, types de sols, matrice de collision,
   registre d'instanciation des modèles .glb et triggers d'interaction Habbo.
   ========================================================================== */

export const BWEDTOWN_CONFIG = {
  width: 32,
  height: 32,
  tileSize: 1.5, // 1 case = 1.5 mètres dans l'espace 3D Three.js
  totalWidth: 32 * 1.5, // 48.0 mètres
  totalHeight: 32 * 1.5,
  defaultSpawn: { x: 15, z: 19, facing: 'north' },
  camera: {
    pitchDeg: 50.0, // Angle Pokémon DS canonique
    yawDeg: 0.0,    // Alignement parfait sur la grille
    distance: 22.0, // Distance idéale pour embrasser le quartier tout en restant proche
    fov: 40         // Perspective serrée (semi-orthographique)
  }
};

// Types de sol visuels
export const TILE_TYPES = {
  GRASS_MATCHA: 0,      // Pelouse Matcha tendre
  COBBLE_BEURRE: 1,     // Pavés sablés de beurre doré (routes principales)
  PLAZA_GOLD: 2,        // Dalles royales de la Grand-Place
  WOOD_DECK: 3,         // Planchers de bois (terrasses, quais)
  CHOCO_WATER: 4,       // Canal de chocolat liquide
  HEDGE_BORDER: 5,      // Haie de buissons denses (délimitation de la ville)
  DIRT_PATH: 6          // Terre battue / sentier de promenade
};

// Flags de collision
export const COLLISION = {
  BLOCKED: 0,       // Mur, bordure, bâtiment, infranchissable
  WALKABLE: 1,      // Libre de déplacement
  INTERACTABLE: 2,  // PNJ, fontaine, objet inspectable avec la touche Action
  TRIGGER_DOOR: 3   // Porte d'entrée de bâtiment / téléporteur d'instance
};

// Registre des bâtiments et props 3D (.glb réels)
export const BWEDTOWN_BUILDINGS = [
  // --- CENTRE : LA GRAND-PLACE ---
  {
    id: 'fountain_bloom',
    model: 'golden-bloom.glb',
    name: 'Golden Butter Fountain',
    gridX: 14,
    gridZ: 14,
    footprint: { w: 4, h: 4 },
    rotationY: 0,
    scale: 1.25,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Sacred Fountain',
      text: 'Golden sparks shimmer in the warm water. It is the beating heart of BwedTown!'
    }
  },

  // --- NORD-OUEST : RÉSIDENCE PRIVÉE TYPE HABBO ---
  {
    id: 'milk_apartments',
    model: 'milk-carton-apartments.glb',
    name: 'Milk Carton Apartments',
    gridX: 3,
    gridZ: 2,
    footprint: { w: 4, h: 4 },
    rotationY: 0,
    scale: 1.05,
    yOffset: 0.0,
    door: {
      triggerX: 5,
      triggerZ: 6,
      action: 'habbo_apartments',
      dialogue: 'Welcome to Bwed Suites! Step inside to decorate your private room or visit a neighbor.'
    }
  },
  {
    id: 'bakery_house',
    model: 'bakery-house.glb',
    name: 'The Golden Bakery',
    gridX: 3,
    gridZ: 8,
    footprint: { w: 3, h: 3 },
    rotationY: 0,
    scale: 1.15,
    yOffset: 0.0,
    door: {
      triggerX: 4,
      triggerZ: 11,
      action: 'bakery_shop',
      dialogue: 'A warm scent of fresh brioche wafts from the bakery oven.'
    }
  },

  // --- NORD-EST : SOCIAL HUB & MODE ---
  {
    id: 'honey_tavern',
    model: 'honey-cafe.glb',
    name: 'Honey Pot Tavern',
    gridX: 23,
    gridZ: 2,
    footprint: { w: 4, h: 3 },
    rotationY: Math.PI,
    scale: 1.1,
    yOffset: 0.0,
    door: {
      triggerX: 25,
      triggerZ: 5,
      action: 'honey_tavern',
      dialogue: 'Push through the tavern doors for hot cocoa and friendly chiptunes at the bar?'
    }
  },
  {
    id: 'galeries_boutique',
    model: 'galeries-boutique.glb',
    name: 'Bwed Fashion Galeries',
    gridX: 23,
    gridZ: 8,
    footprint: { w: 3, h: 3 },
    rotationY: 0,
    scale: 1.0,
    yOffset: 0.0,
    door: {
      triggerX: 24,
      triggerZ: 11,
      action: 'open_wardrobe',
      dialogue: 'Step into the wardrobe to change your 3D Bwed avatar instantly!'
    }
  },

  // --- SUD-EST : ARCADE MINI-JEUX & FÊTE FORAINE ---
  {
    id: 'arcade_duel',
    model: 'arcade-duel.glb',
    name: 'BwedTris Arcade Arena',
    gridX: 23,
    gridZ: 21,
    footprint: { w: 4, h: 3 },
    rotationY: 0,
    scale: 1.0,
    yOffset: 0.0,
    door: {
      triggerX: 25,
      triggerZ: 24,
      action: 'arcade_duel',
      dialogue: 'Challenge a fellow citizen to a 1v1 BwedTris duel?'
    }
  },
  {
    id: 'bumper_cars',
    model: 'ride-bumper-cars-donut.glb',
    name: 'Donut Bumper Cars',
    gridX: 23,
    gridZ: 26,
    footprint: { w: 4, h: 4 },
    rotationY: 0,
    scale: 0.95,
    yOffset: 0.0,
    door: {
      triggerX: 25,
      triggerZ: 30,
      action: 'bumper_cars',
      dialogue: 'Hop inside a motorized glazed donut on the frosted track?'
    }
  },
  {
    id: 'podium_cake',
    model: 'arcade-podium-tiered-cake.glb',
    name: 'Champions Podium',
    gridX: 28,
    gridZ: 21,
    footprint: { w: 2, h: 2 },
    rotationY: -Math.PI / 4,
    scale: 0.85,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Bwed Podium',
      text: 'Weekly high scores of the most legendary BwedTown players!'
    }
  },

  // --- SUD-OUEST : PARC BOTANIQUE & OBSERVATOIRE ---
  {
    id: 'teacup_gazebo',
    model: 'teacup-gazebo.glb',
    name: 'Matcha Teacup Gazebo',
    gridX: 3,
    gridZ: 21,
    footprint: { w: 3, h: 3 },
    rotationY: 0,
    scale: 1.05,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Cozy Gazebo',
      text: 'A shaded bench to rest, listen to retro music, and relax.'
    }
  },
  {
    id: 'portal_observatory',
    model: 'portal-observatory.glb',
    name: 'Celestial Observatory & Portal',
    gridX: 3,
    gridZ: 26,
    footprint: { w: 4, h: 4 },
    rotationY: Math.PI / 2,
    scale: 0.95,
    yOffset: 0.0,
    door: {
      triggerX: 5,
      triggerZ: 30,
      action: 'portal_teleport',
      dialogue: 'The cosmic gateway to outer Bwedverse islands is swirling with starlight...'
    }
  },

  // --- PROPS D'AMBIANCE & ARBRES DU PARC ---
  {
    id: 'tree_crimson_1',
    model: 'crimson-tree.glb',
    name: 'Arbre Érable Rouge',
    gridX: 8,
    gridZ: 21,
    footprint: { w: 2, h: 2 },
    rotationY: 0.4,
    scale: 1.1,
    yOffset: 0.0
  },
  {
    id: 'tree_pistachio_1',
    model: 'pistachio-tree.glb',
    name: 'Arbre Pistache',
    gridX: 8,
    gridZ: 27,
    footprint: { w: 2, h: 2 },
    rotationY: -0.6,
    scale: 1.05,
    yOffset: 0.0
  },
  {
    id: 'tree_crimson_2',
    model: 'crimson-tree.glb',
    name: 'Arbre Érable Rouge',
    gridX: 8,
    gridZ: 4,
    footprint: { w: 2, h: 2 },
    rotationY: 1.2,
    scale: 1.1,
    yOffset: 0.0
  },
  {
    id: 'snack_cart_1',
    model: 'snack-cart.glb',
    name: 'Chariot de Douceurs',
    gridX: 19,
    gridZ: 13,
    footprint: { w: 2, h: 1 },
    rotationY: -Math.PI / 2,
    scale: 1.0,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Marchand Ambulant',
      text: 'Des croissants chauds et des beignets frais ! Servez-vous les amis !'
    }
  },
  {
    id: 'bench_pretzel_1',
    model: 'pretzel-bench.glb',
    name: 'Banc Bretzel',
    gridX: 12,
    gridZ: 13,
    footprint: { w: 2, h: 1 },
    rotationY: 0,
    scale: 0.95,
    yOffset: 0.0
  },
  {
    id: 'bench_pretzel_2',
    model: 'pretzel-bench.glb',
    name: 'Banc Bretzel',
    gridX: 12,
    gridZ: 18,
    footprint: { w: 2, h: 1 },
    rotationY: Math.PI,
    scale: 0.95,
    yOffset: 0.0
  },
  {
    id: 'bench_pretzel_3',
    model: 'pretzel-bench.glb',
    name: 'Banc Bretzel Sud-Est',
    gridX: 18,
    gridZ: 18,
    footprint: { w: 2, h: 1 },
    rotationY: Math.PI,
    scale: 0.95,
    yOffset: 0.0
  },
  {
    id: 'bread_cubes_1',
    model: 'bread-cubes.glb',
    name: 'Caisse de Pains Dorés',
    gridX: 6,
    gridZ: 11,
    footprint: { w: 1, h: 1 },
    rotationY: 0.3,
    scale: 1.0,
    yOffset: 0.0
  },
  {
    id: 'hazelnut_cup_1',
    model: 'hazelnut-cup.glb',
    name: 'Coupe Noisette Géante',
    gridX: 27,
    gridZ: 5,
    footprint: { w: 1, h: 1 },
    rotationY: -0.4,
    scale: 0.9,
    yOffset: 0.0
  },
  {
    id: 'pistachio_glow_1',
    model: 'pistachio-glow.glb',
    name: 'Buisson Pistache Luminescent',
    gridX: 7,
    gridZ: 20,
    footprint: { w: 1, h: 1 },
    rotationY: 0.2,
    scale: 1.2,
    yOffset: 0.0
  },
  {
    id: 'treasure_chest_1',
    model: 'treasure-chest.glb',
    name: 'Coffre Secret Bwed',
    gridX: 2,
    gridZ: 29,
    footprint: { w: 1, h: 1 },
    rotationY: 0.6,
    scale: 1.1,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Coffre Mystérieux',
      text: 'Le coffre des pionniers de BwedTown ! Il contient d anciens moules à brioches et des recettes secrètes.'
    }
  },

  // --- NOUVEAUX ÉLÉMENTS DE WORLDBUILDING & FOLIAGE URBAIN DS ---
  // Arbres et bosquets d'érables et pistaches
  {
    id: 'tree_crimson_nw1',
    model: 'crimson-tree.glb',
    name: 'Érable Rouge Nord-Ouest',
    gridX: 2,
    gridZ: 2,
    footprint: { w: 2, h: 2 },
    rotationY: 0.8,
    scale: 1.15,
    yOffset: 0.0
  },
  {
    id: 'tree_pistachio_ne1',
    model: 'pistachio-tree.glb',
    name: 'Pistachier Nord-Est',
    gridX: 29,
    gridZ: 2,
    footprint: { w: 2, h: 2 },
    rotationY: -1.1,
    scale: 1.1,
    yOffset: 0.0
  },
  {
    id: 'tree_pistachio_w1',
    model: 'pistachio-tree.glb',
    name: 'Pistachier Ouest',
    gridX: 2,
    gridZ: 8,
    footprint: { w: 2, h: 2 },
    rotationY: 0.5,
    scale: 1.05,
    yOffset: 0.0
  },
  {
    id: 'tree_crimson_e1',
    model: 'crimson-tree.glb',
    name: 'Érable Rouge Est',
    gridX: 29,
    gridZ: 8,
    footprint: { w: 2, h: 2 },
    rotationY: -0.4,
    scale: 1.15,
    yOffset: 0.0
  },
  {
    id: 'tree_pistachio_sw1',
    model: 'pistachio-tree.glb',
    name: 'Grand Pistachier du Parc',
    gridX: 2,
    gridZ: 23,
    footprint: { w: 2, h: 2 },
    rotationY: 1.4,
    scale: 1.2,
    yOffset: 0.0
  },
  {
    id: 'tree_crimson_se1',
    model: 'crimson-tree.glb',
    name: 'Érable Rouge de la Fête',
    gridX: 29,
    gridZ: 23,
    footprint: { w: 2, h: 2 },
    rotationY: -0.9,
    scale: 1.1,
    yOffset: 0.0
  },

  // Bancs Bretzel supplémentaires pour les espaces de repos Habbo
  {
    id: 'bench_pretzel_4',
    model: 'pretzel-bench.glb',
    name: 'Banc Bretzel Nord-Est',
    gridX: 18,
    gridZ: 13,
    footprint: { w: 2, h: 1 },
    rotationY: 0,
    scale: 0.95,
    yOffset: 0.0
  },
  {
    id: 'bench_pretzel_5',
    model: 'pretzel-bench.glb',
    name: 'Banc Bretzel de la Taverne',
    gridX: 23,
    gridZ: 7,
    footprint: { w: 2, h: 1 },
    rotationY: Math.PI / 2,
    scale: 0.95,
    yOffset: 0.0
  },
  {
    id: 'bench_pretzel_6',
    model: 'pretzel-bench.glb',
    name: 'Banc Bretzel Arcade',
    gridX: 23,
    gridZ: 22,
    footprint: { w: 2, h: 1 },
    rotationY: -Math.PI / 2,
    scale: 0.95,
    yOffset: 0.0
  },

  // Buissons Pistache Luminescents aux angles clés
  {
    id: 'pistachio_glow_2',
    model: 'pistachio-glow.glb',
    name: 'Buisson Pistache Luminescent',
    gridX: 12,
    gridZ: 14,
    footprint: { w: 1, h: 1 },
    rotationY: 0.4,
    scale: 1.15,
    yOffset: 0.0
  },
  {
    id: 'pistachio_glow_3',
    model: 'pistachio-glow.glb',
    name: 'Buisson Pistache Luminescent',
    gridX: 19,
    gridZ: 14,
    footprint: { w: 1, h: 1 },
    rotationY: -0.6,
    scale: 1.15,
    yOffset: 0.0
  },
  {
    id: 'pistachio_glow_4',
    model: 'pistachio-glow.glb',
    name: 'Buisson Pistache Luminescent',
    gridX: 12,
    gridZ: 17,
    footprint: { w: 1, h: 1 },
    rotationY: 1.1,
    scale: 1.15,
    yOffset: 0.0
  },
  {
    id: 'pistachio_glow_5',
    model: 'pistachio-glow.glb',
    name: 'Buisson Pistache Luminescent',
    gridX: 19,
    gridZ: 17,
    footprint: { w: 1, h: 1 },
    rotationY: -1.2,
    scale: 1.15,
    yOffset: 0.0
  },
  {
    id: 'pistachio_glow_6',
    model: 'pistachio-glow.glb',
    name: 'Haie Pistache Résidence',
    gridX: 4,
    gridZ: 8,
    footprint: { w: 1, h: 1 },
    rotationY: 0.2,
    scale: 1.1,
    yOffset: 0.0
  },
  {
    id: 'pistachio_glow_7',
    model: 'pistachio-glow.glb',
    name: 'Haie Pistache Taverne',
    gridX: 22,
    gridZ: 8,
    footprint: { w: 1, h: 1 },
    rotationY: 0.8,
    scale: 1.1,
    yOffset: 0.0
  },

  // Feu de camp Guimauve dans la clairière du parc
  {
    id: 'campfire_marshmallow_1',
    model: 'marshmallow-campfire.glb',
    name: 'Feu de Camp aux Guimauves',
    gridX: 5,
    gridZ: 23,
    footprint: { w: 2, h: 2 },
    rotationY: 0.3,
    scale: 0.95,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Feu de Camp Cosy',
      text: 'Les braises crépitent doucement en chauffant de délicieuses guimauves dorées... L endroit parfait pour faire une pause et discuter.'
    }
  },

  // Attractions & Décorations procédurales additionnelles
  {
    id: 'waffle_submarine_1',
    model: 'waffle-submarine.glb',
    name: 'Sous-Marin Gaufre Rétro',
    gridX: 28,
    gridZ: 28,
    footprint: { w: 3, h: 3 },
    rotationY: -Math.PI / 4,
    scale: 1.0,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Sous-Marin Gaufre',
      text: 'Un submersible d attraction foraine sculpté dans une gaufre dorée. Prêt à plonger dans le fleuve de chocolat chaud !'
    }
  },
  {
    id: 'snack_cart_2',
    model: 'snack-cart.glb',
    name: 'Stand de Churros Forains',
    gridX: 23,
    gridZ: 20,
    footprint: { w: 2, h: 1 },
    rotationY: Math.PI / 2,
    scale: 0.95,
    yOffset: 0.0,
    interaction: {
      type: 'dialogue',
      speaker: 'Vendeur de Churros',
      text: 'Des churros tout chauds avec du coulis caramel et sucre glace pour la fête foraine !'
    }
  },
  {
    id: 'hazelnut_cup_2',
    model: 'hazelnut-cup.glb',
    name: 'Coupe Matcha Moussant',
    gridX: 4,
    gridZ: 20,
    footprint: { w: 1, h: 1 },
    rotationY: 0.5,
    scale: 0.9,
    yOffset: 0.0
  },
  {
    id: 'pastry_dessert_1',
    model: 'pastry-dessert.glb',
    name: 'Gâteau d Apparat Bwed',
    gridX: 13,
    gridZ: 11,
    footprint: { w: 1, h: 1 },
    rotationY: 0.2,
    scale: 0.85,
    yOffset: 0.0
  },

  // --- GRANDES AFFICHES DU VILLAGE (ROADMAP, GAZETTE, TOURNOIS) ---
  {
    id: 'billboard_grand_place',
    type: 'billboard',
    category: 'roadmap',
    name: "Town Hall Notice Board & Roadmap",
    gridX: 18,
    gridZ: 11,
    footprint: { w: 2, h: 1 },
    rotationY: 0,
    interaction: {
      type: 'billboard',
      category: 'roadmap',
      title: "Town Hall Grand Notice Board",
      text: "Inspect the Official Gazette and development roadmap for BwedTown!"
    }
  },
  {
    id: 'billboard_residential',
    type: 'billboard',
    category: 'community',
    name: "Residents Bulletin Board",
    gridX: 7,
    gridZ: 6,
    footprint: { w: 2, h: 1 },
    rotationY: 0,
    interaction: {
      type: 'billboard',
      category: 'community',
      title: "Residents Notice Board",
      text: "Check neighborhood announcements and room decorating contests!"
    }
  },
  {
    id: 'billboard_arcade',
    type: 'billboard',
    category: 'events',
    name: "Tournaments & Fairgrounds Billboard",
    gridX: 21,
    gridZ: 20,
    footprint: { w: 1, h: 2 },
    rotationY: Math.PI / 2,
    interaction: {
      type: 'billboard',
      category: 'events',
      title: "Tournaments Billboard",
      text: "Inspect world records and upcoming arcade tournaments!"
    }
  }
];

// PNJ d'ambiance présents dans la ville
export const BWEDTOWN_NPCS = [
  {
    id: 'npc_cozy_shiba',
    avatarId: 'cozy-shiba',
    name: 'Cozy Shiba',
    gridX: 6,
    gridZ: 22,
    facing: 'south',
    dialogue: 'Woof! Woof! *wags tail excitedly* Welcome to BwedTown! You can equip me by clicking [Avatar] at the top right!'
  },
  {
    id: 'npc_toast_tycoon',
    avatarId: 'toast-tycoon',
    name: 'Baron Toaston',
    gridX: 13,
    gridZ: 15,
    facing: 'east',
    dialogue: 'Welcome to BwedTown! Move tile-by-tile using Arrows or WASD. Hold Shift to sprint!'
  },
  {
    id: 'npc_honey_knight',
    avatarId: 'honey-knight',
    name: 'Honey Knight',
    gridX: 22,
    gridZ: 5,
    facing: 'west',
    dialogue: 'The tavern to the North-East is the premier spot to chat. Your speech bubbles will appear right over your head!'
  },
  {
    id: 'npc_cloud_ninja',
    avatarId: 'cloud-ninja',
    name: 'Nimbo Ninja',
    gridX: 5,
    gridZ: 7,
    facing: 'south',
    dialogue: 'That tall Milk Carton building houses instanced private lofts in Habbo style. You can invite friends to visit your pad!'
  }
];

// Quartiers pour l'affichage de l'interface (HUD)
export const BWEDTOWN_DISTRICTS = [
  {
    id: 'plaza',
    name: 'Golden Butter Grand Plaza',
    kicker: 'Social Heart',
    bounds: { minX: 12, maxX: 19, minZ: 12, maxZ: 19 }
  },
  {
    id: 'residences',
    name: 'Residential District & Bakery',
    kicker: 'Private Apartments',
    bounds: { minX: 0, maxX: 11, minZ: 0, maxZ: 11 }
  },
  {
    id: 'taverne',
    name: 'Merchant Quarter & Tavern',
    kicker: 'Social & Fashion',
    bounds: { minX: 20, maxX: 31, minZ: 0, maxZ: 11 }
  },
  {
    id: 'arcade',
    name: 'Fairgrounds & Arcade Duel',
    kicker: '1v1 Mini-Games',
    bounds: { minX: 20, maxX: 31, minZ: 20, maxZ: 31 }
  },
  {
    id: 'park',
    name: 'Botanical Park & Observatory',
    kicker: 'Nature & Portal',
    bounds: { minX: 0, maxX: 11, minZ: 20, maxZ: 31 }
  }
];

/**
 * Génère la grille complète 32x32 :
 * - Couche visuelle (tiles)
 * - Couche de collision (collision)
 * - Couche d'interaction et de triggers
 */
export function generateBwedTownMap(overrideBuildings = null) {
  const { width, height } = BWEDTOWN_CONFIG;
  const tiles = [];
  const collision = [];
  const interactionMap = new Map(); // key "x,z" -> metadata

  // Résolution des bâtiments actifs : override direct > sauvegarde custom localStorage > canonique
  let activeBuildings = overrideBuildings;
  if (!activeBuildings && typeof localStorage !== 'undefined') {
    try {
      const custom = localStorage.getItem('bwedtown_custom_buildings');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          activeBuildings = parsed;
        }
      }
    } catch (e) {}
  }
  if (!activeBuildings) {
    activeBuildings = BWEDTOWN_BUILDINGS;
  }

  // 1. Initialisation par défaut : Pelouse Matcha partout marchable
  for (let z = 0; z < height; z++) {
    tiles[z] = [];
    collision[z] = [];
    for (let x = 0; x < width; x++) {
      tiles[z][x] = TILE_TYPES.GRASS_MATCHA;
      collision[z][x] = COLLISION.WALKABLE;
    }
  }

  // 2. Délimitation extérieure : bordures infranchissables de haies d'arbres
  for (let x = 0; x < width; x++) {
    tiles[0][x] = TILE_TYPES.HEDGE_BORDER;
    collision[0][x] = COLLISION.BLOCKED;
    tiles[height - 1][x] = TILE_TYPES.HEDGE_BORDER;
    collision[height - 1][x] = COLLISION.BLOCKED;
  }
  for (let z = 0; z < height; z++) {
    tiles[z][0] = TILE_TYPES.HEDGE_BORDER;
    collision[z][0] = COLLISION.BLOCKED;
    tiles[z][width - 1] = TILE_TYPES.HEDGE_BORDER;
    collision[z][width - 1] = COLLISION.BLOCKED;
  }

  // 3. Boulevards et Allées Pavées (Routes Pokémon DS en croix et anneaux)
  // Boulevard Nord-Sud principal (x = 15 et 16)
  for (let z = 1; z < height - 1; z++) {
    tiles[z][15] = TILE_TYPES.COBBLE_BEURRE;
    tiles[z][16] = TILE_TYPES.COBBLE_BEURRE;
  }

  // Boulevard Est-Ouest principal (z = 15 et 16)
  for (let x = 1; x < width - 1; x++) {
    tiles[15][x] = TILE_TYPES.COBBLE_BEURRE;
    tiles[16][x] = TILE_TYPES.COBBLE_BEURRE;
  }

  // Avenues circulaires secondaires (accès aux quartiers)
  // Allée Nord (z = 12) et Allée Sud (z = 19)
  for (let x = 1; x < width - 1; x++) {
    tiles[12][x] = TILE_TYPES.COBBLE_BEURRE;
    tiles[19][x] = TILE_TYPES.COBBLE_BEURRE;
  }
  // Allée Ouest (x = 11) et Allée Est (x = 20)
  for (let z = 1; z < height - 1; z++) {
    tiles[z][11] = TILE_TYPES.COBBLE_BEURRE;
    tiles[z][20] = TILE_TYPES.COBBLE_BEURRE;
  }

  // 4. La Grand-Place Centrale Pavée (x: 12-19, z: 12-19)
  for (let z = 13; z <= 18; z++) {
    for (let x = 13; x <= 18; x++) {
      tiles[z][x] = TILE_TYPES.PLAZA_GOLD;
      collision[z][x] = COLLISION.WALKABLE;
    }
  }

  // 5. Inscription des bâtiments et de leurs collisions
  for (const bldg of activeBuildings) {
    const { gridX, gridZ, footprint } = bldg;
    for (let dz = 0; dz < footprint.h; dz++) {
      for (let dx = 0; dx < footprint.w; dx++) {
        const x = gridX + dx;
        const z = gridZ + dz;
        if (x >= 0 && x < width && z >= 0 && z < height) {
          collision[z][x] = COLLISION.BLOCKED;
        }
      }
    }

    // Portes et triggers d'entrée
    if (bldg.door) {
      const { triggerX, triggerZ } = bldg.door;
      if (triggerX >= 0 && triggerX < width && triggerZ >= 0 && triggerZ < height) {
        collision[triggerZ][triggerX] = COLLISION.TRIGGER_DOOR;
        tiles[triggerZ][triggerX] = TILE_TYPES.WOOD_DECK; // Paillasson / perron en bois
        interactionMap.set(`${triggerX},${triggerZ}`, {
          type: 'door',
          buildingId: bldg.id,
          buildingName: bldg.name,
          doorData: bldg.door
        });
      }
    }

    // Points d'interaction
    if (bldg.interaction) {
      const interactionPayload = {
        type: bldg.type === 'billboard' ? 'billboard' : 'inspect',
        boardId: bldg.id,
        boardTitle: bldg.name,
        category: bldg.category || 'roadmap',
        target: bldg.name,
        interaction: bldg.interaction
      };

      // 1. Inscription sur toutes les cases occupées par le bâtiment/panneau (face au joueur)
      for (let dz = 0; dz < footprint.h; dz++) {
        for (let dx = 0; dx < footprint.w; dx++) {
          const ox = gridX + dx;
          const oz = gridZ + dz;
          if (ox >= 0 && ox < width && oz >= 0 && oz < height) {
            interactionMap.set(`${ox},${oz}`, interactionPayload);
          }
        }
      }

      // 2. Les cases adjacentes marchables deviennent également interactables
      const checkCoords = [
        { x: gridX + Math.floor(footprint.w / 2), z: gridZ + footprint.h },
        { x: gridX + Math.floor(footprint.w / 2), z: gridZ - 1 },
        { x: gridX - 1, z: gridZ + Math.floor(footprint.h / 2) },
        { x: gridX + footprint.w, z: gridZ + Math.floor(footprint.h / 2) }
      ];
      for (const c of checkCoords) {
        if (c.x >= 0 && c.x < width && c.z >= 0 && c.z < height && collision[c.z][c.x] === COLLISION.WALKABLE) {
          interactionMap.set(`${c.x},${c.z}`, interactionPayload);
        }
      }
    }
  }

  // 6. Inscription des PNJ
  for (const npc of BWEDTOWN_NPCS) {
    const { gridX, gridZ } = npc;
    collision[gridZ][gridX] = COLLISION.INTERACTABLE;
    interactionMap.set(`${gridX},${gridZ}`, {
      type: 'npc',
      npc
    });
  }

  return {
    config: BWEDTOWN_CONFIG,
    tiles,
    collision,
    interactionMap,
    buildings: activeBuildings,
    npcs: BWEDTOWN_NPCS,
    districts: BWEDTOWN_DISTRICTS
  };
}

/**
 * Convertit des coordonnées de grille [gridX, gridZ] en coordonnées 3D Three.js [x, y, z]
 */
export function gridToWorldPos(gridX, gridZ, y = 0) {
  const { tileSize, totalWidth, totalHeight } = BWEDTOWN_CONFIG;
  const worldX = (gridX + 0.5) * tileSize - totalWidth / 2;
  const worldZ = (gridZ + 0.5) * tileSize - totalHeight / 2;
  return { x: worldX, y, z: worldZ };
}

/**
 * Convertit des coordonnées 3D Three.js [worldX, worldZ] en coordonnées de grille [gridX, gridZ]
 */
export function worldToGridPos(worldX, worldZ) {
  const { tileSize, totalWidth, totalHeight, width, height } = BWEDTOWN_CONFIG;
  const gridX = Math.floor((worldX + totalWidth / 2) / tileSize);
  const gridZ = Math.floor((worldZ + totalHeight / 2) / tileSize);
  const clampedX = Math.max(0, Math.min(width - 1, gridX));
  const clampedZ = Math.max(0, Math.min(height - 1, gridZ));
  return { gridX: clampedX, gridZ: clampedZ };
}
