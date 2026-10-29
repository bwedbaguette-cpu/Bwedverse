// ============================================================================
// BWED VILLAGE 3D — EXPANDED MAP DATA (50x50 GRID)
// Full-Scale Diorama Urbanism with 18 Grand GLB Buildings & Props
// ============================================================================

export const MAP_CONFIG = {
  width: 50,
  height: 50,
  tileSize: 2.5, // 2.5 meters per tile for grand village scale (125m x 125m)
  elevationStep: 1.2,
};

// Tile Types
export const TILE_TYPES = {
  EMPTY: 0,
  COBBLE_SABLE: 1,    // Pavés sablés de beurre (grands boulevards & allées)
  MATCHA_GRASS: 2,    // Pelouse génoise matcha & pistache
  WAFFLE_PLAZA: 3,    // Dalles de gaufre caramélisée (la grande-place & terrasses)
  CHOCO_CANAL: 4,     // Grand canal de chocolat chaud liquide
  WOOD_PIER: 5,       // Quais & ponts en bois de hêtre
  MILLEFEUILLE_ROCK: 6// Falaise de pâte feuilletée surélevée
};

// Districts Definition
export const DISTRICTS = [
  { id: 'plaza', name: 'La Grand-Place du Beurre Doré', bounds: { minX: 18, maxX: 32, minZ: 18, maxZ: 32 } },
  { id: 'gourmet', name: 'Le Faubourg Gourmand & Marché', bounds: { minX: 33, maxX: 49, minZ: 15, maxZ: 35 } },
  { id: 'residential', name: 'Le Quartier Résidentiel des Pains', bounds: { minX: 0, maxX: 17, minZ: 15, maxZ: 35 } },
  { id: 'port', name: 'Le Port & Canal du Chocolat', bounds: { minX: 0, maxX: 49, minZ: 0, maxZ: 14 } },
  { id: 'arcade', name: 'La Fête Foraine & BwedWare Arcade', bounds: { minX: 31, maxX: 49, minZ: 34, maxZ: 49 } },
  { id: 'sanctuary', name: 'La Colline de l\'Observatoire Céleste', bounds: { minX: 0, maxX: 19, minZ: 34, maxZ: 49 } },
];

// Generate Expanded 50x50 Tile Grid
export function generateVillageGrid() {
  const { width, height } = MAP_CONFIG;
  const grid = [];

  for (let z = 0; z < height; z++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let type = TILE_TYPES.MATCHA_GRASS;
      let heightLevel = 0;
      let walkable = true;

      // 1. Grand Canal de Chocolat Chaud (z = 5 à 9)
      if (z >= 5 && z <= 9) {
        type = TILE_TYPES.CHOCO_CANAL;
        walkable = false;

        // Grand Pont Principal (x = 23 à 27)
        if (x >= 23 && x <= 27) {
          type = TILE_TYPES.WOOD_PIER;
          walkable = true;
          heightLevel = 0.25;
        }
        // Pont Ouest (x = 9 à 11)
        else if (x >= 9 && x <= 11) {
          type = TILE_TYPES.WOOD_PIER;
          walkable = true;
          heightLevel = 0.25;
        }
        // Pont Est (x = 39 à 41)
        else if (x >= 39 && x <= 41) {
          type = TILE_TYPES.WOOD_PIER;
          walkable = true;
          heightLevel = 0.25;
        }
      }
      // Grands Quais en Bois le long du Canal (z = 10 à 11)
      else if ((z === 10 || z === 11) && x >= 4 && x <= 45) {
        type = TILE_TYPES.WOOD_PIER;
        walkable = true;
      }
      // 2. La Grand-Place du Beurre Doré (x: 19-31, z: 19-31)
      else if (x >= 19 && x <= 31 && z >= 19 && z <= 31) {
        type = TILE_TYPES.WAFFLE_PLAZA;
        walkable = true;
      }
      // 3. Boulevards & Rues Principales (Pavés Sablés)
      // Boulevard Central Nord-Sud (x = 24 à 26, z: 12 à 46)
      else if ((x >= 24 && x <= 26) && z >= 11 && z <= 46) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Boulevard Transversal Est-Ouest (z = 24 à 26, x: 2 à 47)
      else if ((z >= 24 && z <= 26) && x >= 2 && x <= 47) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Avenue Résidentielle Ouest (x = 10 à 12, z: 12 à 34)
      else if ((x >= 10 && x <= 12) && z >= 11 && z <= 34) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Avenue Gourmande Est (x = 38 à 40, z: 12 à 34)
      else if ((x >= 38 && x <= 40) && z >= 11 && z <= 34) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Allée de la Fête Foraine (z = 37 à 39, x: 26 à 47)
      else if ((z >= 37 && z <= 39) && x >= 26 && x <= 47) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Allée de l'Observatoire (z = 37 à 39, x: 2 à 24)
      else if ((z >= 37 && z <= 39) && x >= 2 && x <= 24) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // 4. Colline de l'Observatoire Céleste (Terrasse surélevée, x: 2-16, z: 36-47)
      else if (x >= 2 && x <= 16 && z >= 36 && z <= 47) {
        type = TILE_TYPES.MILLEFEUILLE_ROCK;
        heightLevel = 1.2;
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

// 18 Grand GLB Buildings & Props at Monumental Scales (3.5x to 8.5x)
export const VILLAGE_BUILDINGS = [
  // ==========================================
  // 1. LA GRAND-PLACE DU BEURRE DORÉ
  // ==========================================
  {
    id: 'monument-bloom',
    name: 'Monument Fleur d\'Or de la Grand-Place',
    category: 'monument',
    gridX: 25,
    gridZ: 25,
    sizeX: 3,
    sizeZ: 3,
    model: './assets/buildings/monument-golden-bloom.glb',
    scale: 4.8, // Grand monument central
    rotationY: 0,
    interaction: {
      title: 'Le Monument de la Fleur d\'Or',
      desc: 'Sculpture impériale en or massif érigée au cœur du village pour célébrer la Première Récolte de Brioche.',
      actionLabel: 'Admirer la fleur'
    }
  },
  {
    id: 'golden-croissant-prop',
    name: 'Le Croissant d\'Or Impérial',
    category: 'monument',
    gridX: 25,
    gridZ: 30,
    sizeX: 3,
    sizeZ: 2,
    model: './assets/buildings/prop-golden-croissant.glb',
    scale: 4.2,
    rotationY: 0,
    interaction: {
      title: 'Le Croissant d\'Or Légendaire',
      desc: 'La relique sacrée du village. Frottez sa dorure pour porter chance à vos prochains lancers de dés !',
      actionLabel: 'Frotter la relique'
    }
  },

  // ==========================================
  // 2. LE FAUBOURG GOURMAND & MARCHÉ
  // ==========================================
  {
    id: 'patisserie-coin',
    name: 'Pâtisserie du Croissant d\'Or',
    category: 'shop',
    gridX: 34,
    gridZ: 25,
    sizeX: 5,
    sizeZ: 4,
    model: './assets/buildings/patisserie-coin.glb',
    scale: 6.2, // Grand bâtiment imposant à 2 étages
    rotationY: -Math.PI / 2,
    interaction: {
      title: 'Pâtisserie du Croissant d\'Or',
      desc: 'Maison fondée en l\'an 2 du Bwedverse. Vitrine garnie de brioches tièdes, chaussons dorés et chouquettes géantes.',
      actionLabel: 'Entrer dans la Pâtisserie'
    }
  },
  {
    id: 'honey-tavern',
    name: 'Taverne du Pot de Miel',
    category: 'social',
    gridX: 39,
    gridZ: 18,
    sizeX: 5,
    sizeZ: 5,
    model: './assets/buildings/honey-pot-tavern.glb',
    scale: 9.5, // Échelle ajustée pour correspondre au gabarit
    rotationY: Math.PI,
    interaction: {
      title: 'Auberge & Taverne du Pot de Miel',
      desc: 'Le point de rendez-vous des aventuriers. Venez écouter la musique au coin du poêle à caramel.',
      actionLabel: 'Pousser la porte du bar'
    }
  },
  {
    id: 'galeries-boutique',
    name: 'Les Galeries de Mode & Boutique',
    category: 'shop',
    gridX: 39,
    gridZ: 30,
    sizeX: 5,
    sizeZ: 5,
    model: './assets/buildings/galeries-boutique.glb',
    scale: 6.0,
    rotationY: -Math.PI / 2,
    interaction: {
      title: 'Les Galeries Royales',
      desc: 'Boutique de luxe proposant les tenues, toques, sneakers de collection et accessoires pour votre Bwed.',
      actionLabel: 'Visiter la boutique'
    }
  },
  {
    id: 'jam-apothecary',
    name: 'Apothicaire Pot de Confiture',
    category: 'shop',
    gridX: 45,
    gridZ: 25,
    sizeX: 4,
    sizeZ: 4,
    model: './assets/buildings/jam-jar-apothecary.glb',
    scale: 5.6,
    rotationY: 0,
    interaction: {
      title: 'Apothicaire Pot de Confiture',
      desc: 'Préparations d\'élixirs artisanaux à la gelée de fraise, sirops revigorants et baumes à la fleur d\'oranger.',
      actionLabel: 'Acheter un élixir'
    }
  },
  {
    id: 'npc-toaster-bot',
    name: 'Marchand Toaster-Bot du Marché',
    category: 'npc',
    gridX: 37,
    gridZ: 23,
    sizeX: 2,
    sizeZ: 2,
    model: './assets/buildings/npc-shopkeeper-toaster-bot.glb',
    scale: 2.8,
    rotationY: Math.PI / 4,
    interaction: {
      title: 'Toaster-Bot le Camelot',
      desc: '"Bzzzt ! Farine fraîche, levure magique et miettes de haute qualité ! Que désirez-vous, jeune pain ?"',
      actionLabel: 'Parler au marchand'
    }
  },

  // ==========================================
  // 3. LE QUARTIER RÉSIDENTIEL DES PAINS
  // ==========================================
  {
    id: 'milk-apartments',
    name: 'Résidence Brique de Lait & Wafer-Boxes',
    category: 'residential',
    gridX: 15,
    gridZ: 25,
    sizeX: 5,
    sizeZ: 5,
    model: './assets/buildings/milk-carton-apartments.glb',
    scale: 6.2,
    rotationY: Math.PI / 2,
    interaction: {
      title: 'Résidence Brique de Lait',
      desc: 'Bâtisse moderne abritant les Bwed citoyens. Les balcons en gaufrette offrent une vue panoramique sur les toits.',
      actionLabel: 'Sonner à l\'interphone'
    }
  },
  {
    id: 'barber-shop',
    name: 'Salon de Coiffure Chantilly & Beauté',
    category: 'shop',
    gridX: 11,
    gridZ: 18,
    sizeX: 4,
    sizeZ: 4,
    model: './assets/buildings/shop-barber-chantilly.glb',
    scale: 5.8,
    rotationY: Math.PI / 2,
    interaction: {
      title: 'Barbier Chantilly',
      desc: 'Coiffures sur mesure, brushing de mie et glaçages de fête pour donner de l\'éclat à votre croûte.',
      actionLabel: 'Prendre rendez-vous'
    }
  },
  {
    id: 'tea-gazebo',
    name: 'Pavillon Tasse de Thé & Macarons du Parc',
    category: 'park',
    gridX: 11,
    gridZ: 30,
    sizeX: 5,
    sizeZ: 5,
    model: './assets/buildings/teacup-gazebo-park.glb',
    scale: 6.0,
    rotationY: 0,
    interaction: {
      title: 'Le Kiosque Tasse de Thé',
      desc: 'Pavillon ombragé au milieu de la pelouse matcha. Prenez un goûter tranquille sous la coupole de porcelaine.',
      actionLabel: 'S\'installer pour le thé'
    }
  },

  // ==========================================
  // 4. LA FÊTE FORAINE & ARCADE BWEDWARE
  // ==========================================
  {
    id: 'arcade-hall',
    name: 'Le Palais BwedWare Arcade',
    category: 'arcade',
    gridX: 40,
    gridZ: 41,
    sizeX: 6,
    sizeZ: 6,
    model: './assets/buildings/arcade-duel.glb',
    scale: 6.8, // Borne géante majestueuse
    rotationY: -Math.PI / 4,
    interaction: {
      title: 'L\'Arcade BwedWare',
      desc: 'Le temple des mini-jeux du Bwedverse ! Défiez d\'autres villageois dans des épreuves d\'adresse et de réflexes.',
      actionLabel: 'Insérer une pièce'
    }
  },
  {
    id: 'bumper-cars',
    name: 'Autos-Tamponneuses Donut Glacé',
    category: 'ride',
    gridX: 33,
    gridZ: 41,
    sizeX: 5,
    sizeZ: 5,
    model: './assets/buildings/ride-bumper-cars-donut.glb',
    scale: 5.6,
    rotationY: 0,
    interaction: {
      title: 'Piste des Donuts Glacés',
      desc: 'Grimpez à bord d\'un donut framboise ou chocolat et faites la course sur la patinoire de sucre !',
      actionLabel: 'Prendre le volant'
    }
  },
  {
    id: 'tiered-cake-podium',
    name: 'Le Podium Gâteau des Champions',
    category: 'arcade',
    gridX: 40,
    gridZ: 35,
    sizeX: 4,
    sizeZ: 4,
    model: './assets/buildings/arcade-podium-tiered-cake.glb',
    scale: 5.0,
    rotationY: 0,
    interaction: {
      title: 'Le Podium des Vainqueurs',
      desc: 'Gâteau monté à trois étages où sont remis les trophées de la fève dorée lors des tournois forains.',
      actionLabel: 'Monter sur la première marche'
    }
  },

  // ==========================================
  // 5. LA COLLINE DE L'OBSERVATOIRE CÉLESTE
  // ==========================================
  {
    id: 'portal-observatory',
    name: 'L\'Observatoire du Mage Céleste',
    category: 'sanctuary',
    gridX: 8,
    gridZ: 42,
    sizeX: 6,
    sizeZ: 6,
    model: './assets/buildings/portal-observatory.glb',
    scale: 7.8, // Tour majestueuse dominant la colline
    rotationY: Math.PI / 4,
    interaction: {
      title: 'L\'Observatoire Céleste',
      desc: 'Tour de guet astronomique. Les lentilles en sucre filé permettent de repérer les pluies de météorites de mie.',
      actionLabel: 'Regarder dans le télescope'
    }
  },
  {
    id: 'wafer-stairs',
    name: 'Grand Escalier de Gaufrettes de la Colline',
    category: 'sanctuary',
    gridX: 14,
    gridZ: 38,
    sizeX: 4,
    sizeZ: 3,
    model: './assets/buildings/terrain-stairs-wafer-ramp.glb',
    scale: 4.8,
    rotationY: Math.PI / 2,
    interaction: {
      title: 'L\'Escalier de Gaufrette',
      desc: 'Marches croustillantes reliant la grand-place aux hauteurs mystiques de l\'observatoire.',
      actionLabel: 'Grimper l\'escalier'
    }
  },
  {
    id: 'cosmic-dice',
    name: 'Le Dé Cosmique du Destin',
    category: 'sanctuary',
    gridX: 4,
    gridZ: 45,
    sizeX: 2,
    sizeZ: 2,
    model: './assets/buildings/bwed-dice.glb',
    scale: 3.2,
    rotationY: Math.PI / 6,
    interaction: {
      title: 'Le Dé Sacré du Bwedverse',
      desc: 'Un cube taillé dans la roche de mie ancestrale. Chaque face recèle un pouvoir secret.',
      actionLabel: 'Examiner les symboles'
    }
  },

  // ==========================================
  // 6. LE PORT & CANAL DU CHOCOLAT
  // ==========================================
  {
    id: 'board-cannon',
    name: 'Le Grand Canon à Sucre du Port',
    category: 'port',
    gridX: 18,
    gridZ: 10,
    sizeX: 3,
    sizeZ: 3,
    model: './assets/buildings/board-cannon-sugar-blast.glb',
    scale: 4.6,
    rotationY: 0,
    interaction: {
      title: 'Canon à Sucre d\'Artifice',
      desc: 'Pièce d\'artillerie festive en cuivre martelé qui illumine la baie de chocolat lors des grandes fêtes.',
      actionLabel: 'Tirer une salve de confettis'
    }
  },
  {
    id: 'captain-bean',
    name: 'Capitaine Haricot du Quai',
    category: 'npc',
    gridX: 25,
    gridZ: 10,
    sizeX: 2,
    sizeZ: 2,
    model: './assets/buildings/mascot-captain-bean.glb',
    scale: 2.8,
    rotationY: Math.PI,
    interaction: {
      title: 'Capitaine Haricot',
      desc: '"Ahoy ! La marée de chocolat est haute aujourd\'hui ! Les gondoles sont prêtes pour naviguer vers la Grande Boulangerie !"',
      actionLabel: 'Parler au Capitaine'
    }
  }
];

// 24 Street Lanterns Placed along Main Boulevards
export const VILLAGE_LANTERNS = [
  // Grand-Place
  { x: 21, z: 21 }, { x: 29, z: 21 },
  { x: 21, z: 29 }, { x: 29, z: 29 },
  // Boulevard Central Nord-Sud
  { x: 25, z: 14 }, { x: 25, z: 18 },
  { x: 25, z: 32 }, { x: 25, z: 36 }, { x: 25, z: 42 },
  // Boulevard Est-Ouest
  { x: 16, z: 25 }, { x: 8, z: 25 },
  { x: 34, z: 25 }, { x: 42, z: 25 },
  // Entrées des Ponts du Canal
  { x: 23, z: 10 }, { x: 27, z: 10 },
  { x: 10, z: 10 }, { x: 40, z: 10 },
  // Faubourg Gourmand & Marché
  { x: 38, z: 16 }, { x: 38, z: 32 }, { x: 44, z: 23 },
  // Fête Foraine
  { x: 36, z: 39 }, { x: 44, z: 39 },
  // Colline
  { x: 14, z: 36 }, { x: 8, z: 39 }
];
