// ============================================================================
// BWED VILLAGE 3D — EXPANDED MAP DATA (50x50 GRID)
// Full-Scale Diorama Urbanism with 18 Grand GLB Buildings & Props
// ============================================================================

export const MAP_CONFIG = {
  width: 50,
  height: 50,
  tileSize: 2.0, // 2.0 meters per tile: 50x50 grid maps to 100m x 100m diorama island with millimeter accuracy
  elevationStep: 1.2,
};

// Tile Types
export const TILE_TYPES = {
  EMPTY: 0,
  COBBLE_SABLE: 1,     // Pavés sablés de beurre (grands boulevards & allées)
  MATCHA_GRASS: 2,     // Pelouse génoise matcha & pistache
  WAFFLE_PLAZA: 3,     // Dalles de gaufre caramélisée (la grande-place & terrasses)
  CHOCO_CANAL: 4,      // Grand canal de chocolat chaud liquide
  WOOD_PIER: 5,        // Quais & ponts en bois de hêtre
  MILLEFEUILLE_ROCK: 6,// Falaise de pâte feuilletée surélevée
  VICHY_PICNIC: 7,     // Nappe de pique-nique vichy fraise
  CHECKER_BOARD: 8,    // Damier vanille-chocolat pour arcade & boutiques
  FOREST_DIRT: 9,      // Sentier terreau de cannelle et cacao
  CANE_SAND: 10        // Berges de cassonade dorée le long du canal
};

// Districts Definition
export const DISTRICTS = [
  { id: 'plaza', name: 'La Grand-Place du Beurre Doré', bounds: { minX: 18, maxX: 32, minZ: 20, maxZ: 33 } },
  { id: 'gourmet', name: 'Le Faubourg Gourmand & Grand Marché', bounds: { minX: 33, maxX: 49, minZ: 20, maxZ: 35 } },
  { id: 'residential', name: 'Le Village Fleuri des Pains', bounds: { minX: 0, maxX: 17, minZ: 21, maxZ: 35 } },
  { id: 'woods', name: 'Le Bois de Cannelle & Clairière Calme', bounds: { minX: 0, maxX: 20, minZ: 0, maxZ: 14 } },
  { id: 'port', name: 'Le Port & Berges du Chocolat', bounds: { minX: 0, maxX: 49, minZ: 14, maxZ: 21 } },
  { id: 'arcade', name: 'La Fête Foraine & BwedWare Arcade', bounds: { minX: 31, maxX: 49, minZ: 36, maxZ: 49 } },
  { id: 'sanctuary', name: 'La Colline de l\'Observatoire Céleste', bounds: { minX: 0, maxX: 19, minZ: 36, maxZ: 49 } },
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

      // 1. Grand Canal de Chocolat Chaud (z = 16 à 20, center z=18 / 36.0m)
      if (z >= 16 && z <= 20) {
        type = TILE_TYPES.CHOCO_CANAL;
        walkable = false;

        // Grand Pont Principal (x = 23 à 27, center x=25 / 50.0m)
        if (x >= 23 && x <= 27) {
          type = TILE_TYPES.WOOD_PIER;
          walkable = true;
          heightLevel = 0.25;
        }
        // Pont Ouest (x = 9 à 11, center x=10 / 20.0m)
        else if (x >= 9 && x <= 11) {
          type = TILE_TYPES.WOOD_PIER;
          walkable = true;
          heightLevel = 0.25;
        }
        // Pont Est (x = 39 à 41, center x=40 / 80.0m)
        else if (x >= 39 && x <= 41) {
          type = TILE_TYPES.WOOD_PIER;
          walkable = true;
          heightLevel = 0.25;
        }
      }
      // Berges de cassonade dorée au Nord et au Sud du canal (z = 14 et z = 22)
      else if ((z === 14 || z === 22) && x >= 3 && x <= 47) {
        type = TILE_TYPES.CANE_SAND;
        walkable = true;
      }
      // Grands Quais en Bois le long du Canal (z = 15 et z = 21)
      else if ((z === 15 || z === 21) && x >= 4 && x <= 46) {
        type = TILE_TYPES.WOOD_PIER;
        walkable = true;
      }
      // 2. Le Grand Bois de Cannelle & Promenade Calme (x: 2 à 16, z: 2 à 13)
      else if (x >= 2 && x <= 16 && z >= 2 && z <= 13) {
        // Sentier sinueux en terre de cannelle
        if ((z === 7 || z === 8) && x >= 3 && x <= 15) {
          type = TILE_TYPES.FOREST_DIRT;
        } else if ((x === 6 || x === 7) && z >= 3 && z <= 12) {
          type = TILE_TYPES.FOREST_DIRT;
        } else {
          type = TILE_TYPES.MATCHA_GRASS;
        }
        walkable = true;
      }
      // 3. La Grand-Place du Beurre Doré (x: 18-32, z: 20-32)
      else if (x >= 18 && x <= 32 && z >= 20 && z <= 32) {
        type = TILE_TYPES.WAFFLE_PLAZA;
        walkable = true;
      }
      // 4. Parvis Damier de la Fête Foraine & Arcade (x: 35 à 45, z: 38 à 46)
      else if (x >= 35 && x <= 45 && z >= 38 && z <= 46) {
        type = TILE_TYPES.CHECKER_BOARD;
        walkable = true;
      }
      // 5. Terrasses Vichy Pique-Nique du Parc des Macarons (x: 6 à 10, z: 27 à 31)
      else if (x >= 6 && x <= 10 && z >= 27 && z <= 31) {
        type = TILE_TYPES.VICHY_PICNIC;
        walkable = true;
      }
      // 6. Seuil en Damier devant la Pâtisserie (x: 33-35, z: 24-27)
      else if (x >= 33 && x <= 35 && z >= 24 && z <= 27) {
        type = TILE_TYPES.CHECKER_BOARD;
        walkable = true;
      }
      // 7. Boulevards & Rues Principales (Pavés Sablés)
      // Boulevard Central Nord-Sud (x = 24 à 26, z: 5 à 46)
      else if ((x >= 24 && x <= 26) && z >= 5 && z <= 46) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Boulevard Transversal Est-Ouest (z = 25 à 27, x: 2 à 47)
      else if ((z >= 25 && z <= 27) && x >= 2 && x <= 47) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Avenue Résidentielle Ouest (x = 10 à 12, z: 12 à 34)
      else if ((x >= 10 && x <= 12) && z >= 12 && z <= 34) {
        type = TILE_TYPES.COBBLE_SABLE;
        walkable = true;
      }
      // Avenue Gourmande Est (x = 38 à 40, z: 12 à 34)
      else if ((x >= 38 && x <= 40) && z >= 12 && z <= 34) {
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
      // 8. Colline de l'Observatoire Céleste (Terrasse surélevée, x: 2-16, z: 36-47)
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
    gridZ: 21,
    sizeX: 3,
    sizeZ: 3,
    model: './assets/buildings/monument-golden-bloom.glb',
    scale: 4.8, // Grand monument floral à l'entrée Nord de la place
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
    gridZ: 31,
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
  },
  {
    id: 'prop-pastry-buffet',
    name: 'Buffet Festif de la Pâtisserie',
    category: 'prop',
    gridX: 36,
    gridZ: 22,
    sizeX: 2,
    sizeZ: 2,
    model: './assets/buildings/prop-pastry-dessert.glb',
    scale: 2.8,
    rotationY: -0.3,
    interaction: {
      title: 'Buffet de Pâtisseries Royales',
      desc: 'Table d\'apparat croustillante garnie d\'entremets vanillés, de ganaches brillantes et de fruits confits.',
      actionLabel: 'Goûter une mignardise'
    }
  },
  {
    id: 'prop-dock-chest',
    name: 'Coffre au Sucre Doré du Port',
    category: 'prop',
    gridX: 28,
    gridZ: 11,
    sizeX: 2,
    sizeZ: 2,
    model: './assets/buildings/prop-treasure-chest.glb',
    scale: 2.4,
    rotationY: 0.5,
    interaction: {
      title: 'Coffre aux Fèves d\'Or',
      desc: 'Coffre de chêne cerclé de fer doux rapporté des îles de cassonade par les marchands navigateurs.',
      actionLabel: 'Ouvrir le coffre'
    }
  }
];

// 24 Street Lanterns Placed along Main Boulevards
export const VILLAGE_LANTERNS = [
  // Grand-Place
  { x: 21, z: 22 }, { x: 29, z: 22 },
  { x: 21, z: 30 }, { x: 29, z: 30 },
  // Boulevard Central Nord-Sud
  { x: 25, z: 11 }, { x: 25, z: 22 },
  { x: 25, z: 32 }, { x: 25, z: 36 }, { x: 25, z: 42 },
  // Boulevard Est-Ouest
  { x: 16, z: 26 }, { x: 8, z: 26 },
  { x: 34, z: 26 }, { x: 42, z: 26 },
  // Entrées des Ponts du Canal (Quais Nord & Sud)
  { x: 23, z: 15 }, { x: 27, z: 15 },
  { x: 23, z: 21 }, { x: 27, z: 21 },
  { x: 10, z: 15 }, { x: 40, z: 15 },
  // Faubourg Gourmand & Marché
  { x: 38, z: 22 }, { x: 38, z: 32 }, { x: 44, z: 26 },
  // Fête Foraine
  { x: 36, z: 39 }, { x: 44, z: 39 },
  // Colline
  { x: 14, z: 36 }, { x: 8, z: 39 }
];

// Modular Procedural Citizen Houses (Populate residential & side alleys)
export const CITIZEN_HOUSES = [
  // Village Fleuri des Pains (Quartier Résidentiel)
  {
    id: 'house-strawberry-cottage',
    name: 'Cottage Fraisier',
    gridX: 6,
    gridZ: 16,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 1.05,
    roofColor: 0xe65271, // Fraise glacée
    wallColor: 0xfbf1e3,
    roofType: 'pitched',
    rotationY: 0,
    interaction: { title: 'Cottage Fraisier', desc: 'Maisonnette au toit nappé de coulis de fraise. Des rideaux de dentelle en sucre filtrent la lumière.', actionLabel: 'Frapper à la porte' }
  },
  {
    id: 'house-matcha-villa',
    name: 'Villa Matcha & Pistache',
    gridX: 14,
    gridZ: 16,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 1.1,
    roofColor: 0x6e9544, // Vert matcha
    wallColor: 0xf5e6cc,
    roofType: 'dome',
    rotationY: -Math.PI / 2,
    interaction: { title: 'Villa Matcha', desc: 'Demeure raffinée au dôme parfumé au thé vert matcha. Le parfum de brioche chaude s\'échappe de la cheminée.', actionLabel: 'Frapper à la porte' }
  },
  {
    id: 'house-blueberry-cottage',
    name: 'Maisonnette Myrtille Sauvage',
    gridX: 5,
    gridZ: 22,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 0.95,
    roofColor: 0x5a7ca8, // Myrtille
    wallColor: 0xfef7ea,
    roofType: 'pitched',
    rotationY: Math.PI / 2,
    interaction: { title: 'Maisonnette Myrtille', desc: 'Coquette chaumière avec volets en sablés pur beurre. Une boîte aux lettres brioche trône devant.', actionLabel: 'Sonner' }
  },
  {
    id: 'house-vanilla-manor',
    name: 'Pavillon Crème Vanillée',
    gridX: 8,
    gridZ: 25,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 1.0,
    roofColor: 0xfbd278, // Vanille dorée
    wallColor: 0xf8eedb,
    roofType: 'dome',
    rotationY: Math.PI,
    interaction: { title: 'Pavillon Crème Vanille', desc: 'Maison familiale tout en rondeur. Des pots de crème chantilly décorent les rebords de fenêtres.', actionLabel: 'Frapper à la porte' }
  },
  {
    id: 'house-caramel-lodge',
    name: 'Manoir Toffee & Caramel',
    gridX: 6,
    gridZ: 32,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 1.15,
    roofColor: 0xb5632a, // Caramel au beurre salé
    wallColor: 0xf3dfc5,
    roofType: 'pitched',
    rotationY: 0,
    interaction: { title: 'Manoir Caramel', desc: 'Belle bâtisse à deux fenêtres à l\'étage. La girouette sur le toit tourne au gré des odeurs de boulangerie.', actionLabel: 'Frapper à la porte' }
  },
  {
    id: 'house-apricot-bakery',
    name: 'Chaumière Abricot Rôti',
    gridX: 14,
    gridZ: 32,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 0.9,
    roofColor: 0xf37f34, // Abricot
    wallColor: 0xfbf1e3,
    roofType: 'dome',
    rotationY: Math.PI / 2,
    interaction: { title: 'Chaumière Abricot', desc: 'Petit refuge douillet bordé d\'une haie de biscuits cuillère.', actionLabel: 'Saluer les résidents' }
  },
  // Faubourg Gourmand & Échoppes de Ruelle
  {
    id: 'house-baker-guild',
    name: 'L\'Atelier du Pâtissier Compagnon',
    gridX: 45,
    gridZ: 17,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 1.05,
    roofColor: 0x3d1d0e, // Chocolat noir
    wallColor: 0xf3e2cc,
    roofType: 'pitched',
    rotationY: -Math.PI / 2,
    interaction: { title: 'Atelier du Compagnon', desc: 'Ici travaillent les apprentis boulangers, apprenant le secret du pétrissage magique.', actionLabel: 'Jeter un œil par la fenêtre' }
  },
  {
    id: 'house-sugar-fairy',
    name: 'Échoppe du Sucre Glace',
    gridX: 45,
    gridZ: 32,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 0.95,
    roofColor: 0xff8ca3, // Rose bonbon
    wallColor: 0xfffaef,
    roofType: 'dome',
    rotationY: -Math.PI / 2,
    interaction: { title: 'Échoppe du Sucre Glace', desc: 'Petite boutique où l\'on tamise le sucre impérial pour décorer les gâteaux de fête.', actionLabel: 'Entrer' }
  },
  // Bord du Fleuve & Bois de Cannelle
  {
    id: 'house-canal-cabin',
    name: 'Cabane du Passeur de Chocolat',
    gridX: 9,
    gridZ: 13,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 0.9,
    roofColor: 0x76543d,
    wallColor: 0xeed9bf,
    roofType: 'pitched',
    rotationY: Math.PI,
    interaction: { title: 'Cabane du Passeur', desc: 'C\'est ici que vit le vieux timonier qui amarre les barques et les gondoles de croissant.', actionLabel: 'Toquer au carreau' }
  },
  {
    id: 'house-woodland-retreat',
    name: 'L\'Ermitage du Bois de Cannelle',
    gridX: 4,
    gridZ: 18,
    sizeX: 2.4,
    sizeZ: 2.4,
    scale: 0.85,
    roofColor: 0x5a7536,
    wallColor: 0xf2e0c9,
    roofType: 'dome',
    rotationY: Math.PI / 4,
    interaction: { title: 'L\'Ermitage des Bois', desc: 'Un havre de paix blotti au milieu des arbres brioches. L\'air y sent la cannelle fraîche.', actionLabel: 'Méditer devant la porte' }
  }
];

// Instanced Wafer Benches (Street Furniture)
export const VILLAGE_BENCHES = [
  // Grand-Place
  { x: 21, z: 23, rot: 0 }, { x: 29, z: 23, rot: 0 },
  { x: 21, z: 29, rot: Math.PI }, { x: 29, z: 29, rot: Math.PI },
  // Promenade des Quais (Bois le long du canal)
  { x: 17, z: 15, rot: 0 }, { x: 33, z: 15, rot: 0 },
  { x: 17, z: 21, rot: Math.PI }, { x: 33, z: 21, rot: Math.PI },
  // Parc & Terrasses
  { x: 7, z: 29, rot: -Math.PI / 2 }, { x: 12, z: 29, rot: Math.PI / 2 },
  // Bois de Cannelle
  { x: 6, z: 8, rot: 0.4 }, { x: 13, z: 8, rot: -0.4 },
  // Colline
  { x: 11, z: 42, rot: Math.PI / 4 }
];

// Instanced Barrels, Crates & Flour Sacks
export const VILLAGE_BARRELS_CRATES = [
  // Taverne du Pot de Miel
  { x: 37, z: 22, type: 'barrel' }, { x: 37, z: 23, type: 'crate' },
  // Pâtisserie
  { x: 34, z: 28, type: 'sack' }, { x: 35, z: 28, type: 'sack' },
  // Quais du Port (Bordure canal)
  { x: 21, z: 15, type: 'barrel' }, { x: 29, z: 15, type: 'crate' },
  { x: 38, z: 15, type: 'barrel' }, { x: 12, z: 15, type: 'sack' }
];

// Living Village NPCs (Placed around landmarks with interactive cozy dialogues)
export const VILLAGE_NPCS = [
  {
    id: 'npc-baker',
    pawnId: 'tiny-baker',
    name: 'Maître Émile le Boulanger',
    role: 'Chef Pâtissier',
    gridX: 36,
    gridZ: 26,
    rotationY: -Math.PI / 2,
    dialogues: [
      "Bonjour voyageur ! Notre croissant d'or sort tout juste du four, l'odeur du beurre est divine aujourd'hui !",
      "Le secret d'un bon feuilletage ? Du beurre AOP, de la patience et un tour de main léger !",
      "Si tu passes au Faubourg, n'oublie pas de saluer la patronne de la Taverne du Miel !"
    ]
  },
  {
    id: 'npc-super-bwed',
    pawnId: 'super-hero-bwed',
    name: 'Super Bwed',
    role: 'Protecteur de Bwedville',
    gridX: 27,
    gridZ: 23,
    rotationY: -Math.PI / 4,
    dialogues: [
      "Rien ne saurait troubler la paix croustillante de notre village tant que ma cape de sucre flottera au vent !",
      "Veille sur les miettes, citoyen ! Chaque miette dorée est un trésor pour notre communauté."
    ]
  },
  {
    id: 'npc-firefighter',
    pawnId: 'brave-firefighter',
    name: 'Caporal Brioche',
    role: 'Sapeur Pompier Gourmand',
    gridX: 23,
    gridZ: 15,
    rotationY: 0,
    dialogues: [
      "Prudence le long du canal ! La température du chocolat fondu est idéale, mais les berges sont glissantes.",
      "Toujours vérifier son fourneau avant de partir en promenade !"
    ]
  },
  {
    id: 'npc-mage',
    pawnId: 'crimson-mage',
    name: 'Archimage Astragale',
    role: 'Mage Céleste',
    gridX: 12,
    gridZ: 39,
    rotationY: Math.PI / 3,
    dialogues: [
      "Les étoiles de sucre filé s'alignent au zénith... Une douce rosée de caramel est proche !",
      "La colline de l'observatoire offre le plus beau panorama sur toute la vallée beurrée."
    ]
  },
  {
    id: 'npc-samurai',
    pawnId: 'crimson-samurai',
    name: 'Kenshin de la Griotte',
    role: 'Garde d\'Élite',
    gridX: 45,
    gridZ: 26,
    rotationY: -Math.PI / 2,
    dialogues: [
      "Honneur et tradition ! Nul ne dérobera la farine ancestrale tant que mon sabre veillera.",
      "La discipline d'un guerrier commence dès le pétrissage de l'aube."
    ]
  },
  {
    id: 'npc-tycoon',
    pawnId: 'toast-tycoon',
    name: 'Baron de la Miche',
    role: 'Négociant en Chef',
    gridX: 43,
    gridZ: 28,
    rotationY: Math.PI / 4,
    dialogues: [
      "Le cours du beurre demi-sel est au plus haut ! C'est le moment idéal pour faire fleurir les affaires !",
      "Tu cherches une échoppe ? Le Faubourg Gourmand est l'endroit le plus dynamique de tout le Bwedverse !"
    ]
  },
  {
    id: 'npc-cloud-ninja',
    pawnId: 'cloud-ninja',
    name: 'Zéphir la Brume',
    role: 'Éclaireur des Toits',
    gridX: 14,
    gridZ: 36,
    rotationY: -Math.PI / 2,
    dialogues: [
      "Léger comme la farine tamisée, rapide comme l'éclair... Admire la vue d'ici !",
      "D'en haut, les toits du village ressemblent à un plateau de petits fours dorés."
    ]
  },
  {
    id: 'npc-choco-drip',
    pawnId: 'choco-drip',
    name: 'Gaston Chocolat',
    role: 'Flâneur Épicurien',
    gridX: 10,
    gridZ: 15,
    rotationY: 0,
    dialogues: [
      "Installe-toi sur un banc, respire la cannelle fraîche... C'est l'endroit le plus relaxant du monde.",
      "Le secret du bonheur ? Une tasse de chocolat chaud et une tartine beurrée au soleil."
    ]
  },
  {
    id: 'npc-robot',
    pawnId: 'rusty-buttonbot',
    name: 'Bouton-Vapeur B-42',
    role: 'Mécanicien Forain',
    gridX: 38,
    gridZ: 41,
    rotationY: -Math.PI / 2,
    dialogues: [
      "Bip bop ! Insérez un jeton sablé pour piloter l'auto-tamponneuse beignet !",
      "Système de propulsion au sirop d'érable opérationnel à 100% !"
    ]
  },
  {
    id: 'npc-frankenbwed',
    pawnId: 'frankenbwed',
    name: 'Barnabé le Doux',
    role: 'Jardinier Fleuri',
    gridX: 7,
    gridZ: 27,
    rotationY: Math.PI / 2,
    dialogues: [
      "Petites fleurs de sucre... si douces... Barnabé arrose avec du lait vanillé...",
      "Barnabé aime beaucoup les papillons de sucre filé !"
    ]
  },
  {
    id: 'npc-nerdy',
    pawnId: 'nerdy-buddy',
    name: 'Lucien l\'Érudit',
    role: 'Historien du Village',
    gridX: 11,
    gridZ: 34,
    rotationY: 0,
    dialogues: [
      "Savais-tu que la Grand-Place a été pavée en l'an 124 avec de véritables gaufres liégeoises ?",
      "Je rédige le grand grimoire de la fermentation... C'est un sujet passionnant !"
    ]
  },
  {
    id: 'npc-bandit',
    pawnId: 'toast-bandit',
    name: 'Rico la Miette',
    role: 'Filou Croustillant',
    gridX: 39,
    gridZ: 17,
    rotationY: Math.PI,
    dialogues: [
      "Chut ! Tu n'as rien vu... Je vérifie juste si les pots de confiture d'abricot sont bien scellés !",
      "Ne parle pas trop fort, la patronne de la taverne a l'ouïe fine !"
    ]
  }
];
