// ============================================================================
// BWED VILLAGE 3D — MAP DATA & URBANISME GRID
// 36x36 Isometric Tile Grid with Culinary Themes
// ============================================================================

export const MAP_CONFIG = {
  width: 36,
  height: 36,
  tileSize: 2.0, // 2 meters per tile for comfortable building scale
  elevationStep: 0.8,
};

// Tile Types enum
export const TILE_TYPES = {
  EMPTY: 0,
  COBBLE_SABLE: 1,    // Pavés sablés de beurre (rues principales)
  MATCHA_GRASS: 2,    // Pelouse génoise matcha & pistache
  WAFFLE_PLAZA: 3,    // Dalles de gaufre caramélisée (places & terrasses)
  CHOCO_CANAL: 4,     // Canal de chocolat chaud liquide
  WOOD_PIER: 5,       // Ponton & ponts en bois de hêtre
  MILLEFEUILLE_ROCK: 6// Falaise & roche en pâte feuilletée croustillante
};

// Districts Definition for HUD and atmosphere
export const DISTRICTS = [
  { id: 'plaza', name: 'La Grand-Place du Beurre Doré', bounds: { minX: 13, maxX: 23, minZ: 13, maxZ: 23 } },
  { id: 'gourmet', name: 'Le Faubourg Gourmand & Marché', bounds: { minX: 24, maxX: 35, minZ: 11, maxZ: 25 } },
  { id: 'residential', name: 'Le Quartier Résidentiel des Pains', bounds: { minX: 1, maxX: 12, minZ: 11, maxZ: 25 } },
  { id: 'port', name: 'Le Port & Canal du Chocolat', bounds: { minX: 0, maxX: 35, minZ: 0, maxZ: 10 } },
  { id: 'arcade', name: 'La Fête Foraine BwedWare', bounds: { minX: 22, maxX: 35, minZ: 24, maxZ: 35 } },
  { id: 'sanctuary', name: 'La Colline de l\'Observatoire', bounds: { minX: 1, maxX: 14, minZ: 24, maxZ: 35 } },
];

// Generate Base Tile Grid
export function generateVillageGrid() {
  const { width, height } = MAP_CONFIG;
  const grid = [];

  for (let z = 0; z < height; z++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let type = TILE_TYPES.MATCHA_GRASS;
      let heightLevel = 0;
      let walkable = true;

      // 1. Canal de chocolat chaud (z = 4 à 6)
      if (z >= 4 && z <= 6) {
        type = TILE_TYPES.CHOCO_CANAL;
        walkable = false;
        // Ponts en bois traversant le canal (x = 17, 18, 19)
        if (x >= 17 && x <= 19) {
          type = TILE_TYPES.WOOD_PIER;
          walkable = true;
          heightLevel = 0.2;
        }
      }
      // Quai en bois le long du canal (z = 7)
      else if (z === 7 && x >= 8 && x <= 28) {
        type = TILE_TYPES.WOOD_PIER;
        walkable = true;
      }
      // 2. La Grand-Place centrale (14 <= x <= 22 et 14 <= z <= 22)
      else if (x >= 14 && x <= 22 && z >= 14 && z <= 22) {
        type = TILE_TYPES.WAFFLE_PLAZA;
        walkable = true;
      }
      // 3. Allées pavées sablées (Rues principales)
      // Axe Nord-Sud principal
      else if ((x >= 17 && x <= 19) && z > 6 && z < 32) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Axe Est-Ouest principal
      else if ((z >= 17 && z <= 19) && x > 2 && x < 33) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Allée vers l'Arcade (Nord-Est)
      else if (x >= 23 && z >= 23 && (x === 24 || x === 25 || z === 24 || z === 25)) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Allée vers l'Observatoire (Nord-Ouest)
      else if (x <= 13 && z >= 23 && (x === 12 || x === 13 || z === 24 || z === 25)) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // 4. Colline de l'Observatoire (Plateau surélevé)
      else if (x >= 2 && x <= 11 && z >= 26 && z <= 34) {
        type = TILE_TYPES.MILLEFEUILLE_ROCK;
        heightLevel = 1.0;
        walkable = true;
      }

      row.push({
        x,
        z,
        type,
        elevation: heightLevel,
        walkable,
        occupant: null
      });
    }
    grid.push(row);
  }

  return grid;
}

// Landmark Buildings & Interactive Props Placements
export const VILLAGE_BUILDINGS = [
  // --- CENTRE DU VILLAGE ---
  {
    id: 'fountain-moka',
    name: 'Fontaine Cafetière Moka',
    category: 'monument',
    gridX: 18,
    gridZ: 18,
    sizeX: 3,
    sizeZ: 3,
    model: '../07_3D_MODEL/buildings/monument-golden-bloom.glb',
    scale: 0.85,
    rotationY: 0,
    interaction: {
      title: 'Fontaine du Chocolat Chaud',
      desc: 'L\'eau jaillissante sent la noisette et le cacao crémeux. Jetez une miette pour faire un vœu !',
      actionLabel: 'Faire un vœu'
    }
  },
  {
    id: 'patisserie-coin',
    name: 'Pâtisserie du Croissant d\'Or',
    category: 'shop',
    gridX: 25,
    gridZ: 18,
    sizeX: 4,
    sizeZ: 3,
    model: '../07_3D_MODEL/buildings/patisserie-coin.glb',
    scale: 0.8,
    rotationY: -Math.PI / 2,
    interaction: {
      title: 'La Pâtisserie d\'Or',
      desc: 'Boutique artisanale tenue par les maîtres boulangers. Croissants au beurre et fèves dorées fraîches du matin.',
      actionLabel: 'Entrer dans la Pâtisserie'
    }
  },
  {
    id: 'honey-tavern',
    name: 'Taverne du Pot de Miel',
    category: 'social',
    gridX: 26,
    gridZ: 13,
    sizeX: 4,
    sizeZ: 4,
    model: '../07_3D_MODEL/buildings/honey-pot-tavern.glb',
    scale: 0.75,
    rotationY: Math.PI,
    interaction: {
      title: 'Taverne du Pot de Miel',
      desc: 'Salon cosy de dégustation. Installez-vous avec vos amis pour écouter les disques vinyle de l\'OST.',
      actionLabel: 'Prendre une table'
    }
  },
  {
    id: 'jam-apothecary',
    name: 'Apothicaire Pot de Confiture',
    category: 'shop',
    gridX: 25,
    gridZ: 23,
    sizeX: 3,
    sizeZ: 3,
    model: '../07_3D_MODEL/buildings/jam-jar-apothecary.glb',
    scale: 0.8,
    rotationY: 0,
    interaction: {
      title: 'Apothicaire de Confiture',
      desc: 'Potions de confiture de framboise, sirops revigorants et élixirs à la vanille.',
      actionLabel: 'Découvrir les remèdes'
    }
  },

  // --- QUARTIER RÉSIDENTIEL ---
  {
    id: 'milk-apartments',
    name: 'Résidence Brique de Lait',
    category: 'residential',
    gridX: 10,
    gridZ: 18,
    sizeX: 4,
    sizeZ: 4,
    model: '../07_3D_MODEL/buildings/milk-carton-apartments.glb',
    scale: 0.85,
    rotationY: Math.PI / 2,
    interaction: {
      title: 'Résidence Brique de Lait',
      desc: 'Appartements douillets des Bwed citoyens avec vue imprenable sur les jardins de brioche.',
      actionLabel: 'Sonner aux portes'
    }
  },
  {
    id: 'barber-shop',
    name: 'Barbier & Salon Chantilly',
    category: 'shop',
    gridX: 10,
    gridZ: 13,
    sizeX: 3,
    sizeZ: 3,
    model: '../07_3D_MODEL/buildings/shop-barber-chantilly.glb',
    scale: 0.8,
    rotationY: Math.PI / 2,
    interaction: {
      title: 'Barbier Chantilly',
      desc: 'Coiffures et glaçages de fête pour donner un nouveau look à votre croûte de pain.',
      actionLabel: 'Changer de look'
    }
  },
  {
    id: 'tea-gazebo',
    name: 'Kiosque Tasse de Thé du Parc',
    category: 'park',
    gridX: 10,
    gridZ: 23,
    sizeX: 3,
    sizeZ: 3,
    model: '../07_3D_MODEL/buildings/teacup-gazebo-park.glb',
    scale: 0.8,
    rotationY: 0,
    interaction: {
      title: 'Kiosque à Thé & Macarons',
      desc: 'Un havre de paix au milieu de la pelouse matcha pour discuter tranquillement au soleil.',
      actionLabel: 'S\'asseoir au kiosque'
    }
  },

  // --- QUARTIER ARCADE & FÊTE FORAINE ---
  {
    id: 'arcade-hall',
    name: 'Borne BwedWare Arcade',
    category: 'arcade',
    gridX: 28,
    gridZ: 28,
    sizeX: 4,
    sizeZ: 4,
    model: '../07_3D_MODEL/buildings/arcade-duel.glb',
    scale: 0.85,
    rotationY: -Math.PI / 4,
    interaction: {
      title: 'La Salle BwedWare Arcade',
      desc: 'Défiez d\'autres Bwed dans des micro-jeux frénétiques de 5 secondes ou un Tetris géant !',
      actionLabel: 'Lancer un jeu'
    }
  },
  {
    id: 'bumper-cars',
    name: 'Autos-Tamponneuses Donut',
    category: 'ride',
    gridX: 23,
    gridZ: 28,
    sizeX: 4,
    sizeZ: 4,
    model: '../07_3D_MODEL/buildings/ride-bumper-cars-donut.glb',
    scale: 0.75,
    rotationY: 0,
    interaction: {
      title: 'Piste des Donuts Glacés',
      desc: 'Glissez et tamponnez vos amis sur une patinoire de glaçage au sucre !',
      actionLabel: 'Monter dans un Donut'
    }
  },

  // --- COLLINE MYSTIQUE ---
  {
    id: 'portal-observatory',
    name: 'Observatoire du Mage Boulanger',
    category: 'sanctuary',
    gridX: 7,
    gridZ: 29,
    sizeX: 4,
    sizeZ: 4,
    model: '../07_3D_MODEL/buildings/portal-observatory.glb',
    scale: 0.85,
    rotationY: Math.PI / 4,
    interaction: {
      title: 'L\'Observatoire Céleste',
      desc: 'Scrutez les étoiles de sucre et voyagez vers d\'autres dimensions du Bwedverse.',
      actionLabel: 'Observer le cosmos'
    }
  },

  // --- PORT & QUAI ---
  {
    id: 'board-cannon',
    name: 'Grand Canon à Sucre du Port',
    category: 'port',
    gridX: 13,
    gridZ: 7,
    sizeX: 2,
    sizeZ: 2,
    model: '../07_3D_MODEL/buildings/board-cannon-sugar-blast.glb',
    scale: 0.7,
    rotationY: 0,
    interaction: {
      title: 'Canon à Sucre d\'Artifice',
      desc: 'Propulsez une volée d\'étincelles sucrées au-dessus du canal.',
      actionLabel: 'Tirer un feu d\'artifice'
    }
  }
];

// Street Lanterns Placements (Light up with warm amber glow)
export const VILLAGE_LANTERNS = [
  { x: 15, z: 15 },
  { x: 21, z: 15 },
  { x: 15, z: 21 },
  { x: 21, z: 21 },
  { x: 18, z: 11 },
  { x: 18, z: 25 },
  { x: 24, z: 18 },
  { x: 12, z: 18 },
  { x: 18, z: 8 }, // Entrée du pont
  { x: 26, z: 26 } // Entrée de l'arcade
];
