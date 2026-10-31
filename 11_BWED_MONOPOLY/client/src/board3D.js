// ============================================================================
// MONOPOLY 3D — BOARD ENGINE & DOUBLE SHOWROOM VITRINE
// Pillowy bread-slice tile geometry, realistic orthogonal dice physics,
// 23 collectible character pawns + 21 architectural bakery monuments showcase
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BOARD_TILES } from '../../shared/boardData.js';
import { COLOR_GROUPS } from '../../shared/constants.js';

// COMPLETE 24 BWED CHARACTER PAWNS ROSTER
export const ALL_BWED_PAWNS = [
  // Shelf 1 (Bottom, y=0.85) : Adventurers & Street Legends (8 pawns)
  { id: 'toast-bandit', name: 'Toast Bandit', role: 'Wild Outlaw', color: 0xf06a3c, file: './assets/pawns/toast-bandit.glb', thumb: './assets/pawns/thumbs/toast-bandit.png' },
  { id: 'brave-firefighter', name: 'Blaze Bwed', role: 'Oven Rescuer', color: 0xe63946, file: './assets/pawns/brave-firefighter.glb', thumb: './assets/pawns/thumbs/brave-firefighter.png' },
  { id: 'reggae-toast', name: 'Reggae Toast', role: 'Jammin Slice', color: 0x52b788, file: './assets/pawns/reggae-toast.glb', thumb: './assets/pawns/thumbs/reggae-toast.png' },
  { id: 'crumb-burglar', name: 'Crumb Burglar', role: 'Vault Thief', color: 0x2ec4b6, file: './assets/pawns/crumb-burglar.glb', thumb: './assets/pawns/thumbs/crumb-burglar.png' },
  { id: 'choco-drip', name: 'Choco Drip', role: 'Sweet Artisan', color: 0x6f4e37, file: './assets/pawns/choco-drip.glb', thumb: './assets/pawns/thumbs/choco-drip.png' },
  { id: 'rusty-buttonbot', name: 'Rusty Buttonbot', role: 'Toaster Mech', color: 0x5bc0be, file: './assets/pawns/rusty-buttonbot.glb', thumb: './assets/pawns/thumbs/rusty-buttonbot.png' },
  { id: 'whale-buddy', name: 'Whale Buddy', role: 'Big Spender', color: 0x3a86ff, file: './assets/pawns/whale-buddy.glb', thumb: './assets/pawns/thumbs/whale-buddy.png' },
  { id: 'nerdy-buddy', name: 'Nerdy Gadget', role: '8-Bit Genius', color: 0x8338ec, file: './assets/pawns/nerdy-buddy.glb', thumb: './assets/pawns/thumbs/nerdy-buddy.png' },

  // Shelf 2 (Middle, y=3.4 - EYE LEVEL & CAMERA FACING!) : The Star Leaders & Pirates (8 pawns)
  { id: 'captain-bean', name: 'Capitaine Pirate Bwed', role: 'Scurvy Rover', color: 0x9b5de5, file: './assets/buildings/mascot-captain-bean.glb', thumb: './assets/pawns/thumbs/captain-bean.png', customScale: 1.15, isPirate: true },
  { id: 'toast-tycoon', name: 'Toast Tycoon', role: 'The Bank Boss', color: 0x06d6a0, file: './assets/pawns/toast-tycoon.glb', thumb: './assets/pawns/thumbs/toast-tycoon.png' },
  { id: 'cozy-shiba', name: 'Cozy Shiba Buddy', role: 'The Loyal Pup', color: 0xffb703, file: './assets/pawns/cozy-shiba.glb', thumb: './assets/pawns/thumbs/cozy-shiba.png', customScale: 0.72 },
  { id: 'super-hero-bwed', name: 'Super Bwed', role: 'Crust Crusader', color: 0x3a86ff, file: './assets/pawns/super-hero-bwed.glb', thumb: './assets/pawns/thumbs/super-hero-bwed.png' },
  { id: 'tiny-baker', name: 'Toastie Baker', role: 'Master Chef', color: 0xff9f1c, file: './assets/pawns/tiny-baker.glb', thumb: './assets/pawns/thumbs/tiny-baker.png' },
  { id: 'glow-toast', name: 'Glow Toast', role: 'The Golden Slice', color: 0xf2c94c, file: './assets/pawns/glow-toast.glb', thumb: './assets/pawns/thumbs/glow-toast.png' },
  { id: 'honey-knight', name: 'Honey Knight', role: 'Sweet Guardian', color: 0xfb8500, file: './assets/pawns/honey-knight.glb', thumb: './assets/pawns/thumbs/honey-knight.png' },
  { id: 'hero-of-toast', name: 'Hero of Toast', role: 'Legendary Baker', color: 0x48cae4, file: './assets/pawns/hero-of-toast.glb', thumb: './assets/pawns/thumbs/hero-of-toast.png' },

  // Shelf 3 (Top, y=5.95) : Mages, Mystics & Legendary Champions (8 pawns)
  { id: 'toast-wizard', name: 'Toast Wizard', role: 'Oven Mage', color: 0x7209b7, file: './assets/pawns/toast-wizard.glb', thumb: './assets/pawns/thumbs/toast-wizard.png' },
  { id: 'crimson-mage', name: 'Crimson Mage', role: 'Spell Slice', color: 0x9a79d6, file: './assets/pawns/crimson-mage.glb', thumb: './assets/pawns/thumbs/crimson-mage.png' },
  { id: 'crimson-samurai', name: 'Crimson Samurai', role: 'Rising Blade', color: 0xc65347, file: './assets/pawns/crimson-samurai.glb', thumb: './assets/pawns/thumbs/crimson-samurai.png' },
  { id: 'saiyan-toast', name: 'Saiyan Toast', role: '9,000 Calories', color: 0xffbe0b, file: './assets/pawns/saiyan-toast.glb', thumb: './assets/pawns/thumbs/saiyan-toast.png' },
  { id: 'cloud-ninja', name: 'Cloud Shinobi', role: 'Steamy Rogue', color: 0xd90429, file: './assets/pawns/cloud-ninja.glb', thumb: './assets/pawns/thumbs/cloud-ninja.png' },
  { id: 'shadow-ninja', name: 'Shadow Ninja', role: 'Night Slice', color: 0x495057, file: './assets/pawns/shadow-ninja.glb', thumb: './assets/pawns/thumbs/shadow-ninja.png' },
  { id: 'judge-gaveltoes', name: 'Judge Gaveltoes', role: 'High Magistrate', color: 0x6c757d, file: './assets/pawns/judge-gaveltoes.glb', thumb: './assets/pawns/thumbs/judge-gaveltoes.png' },
  { id: 'frankenbwed', name: 'FrankenBwed', role: 'Electric Toast', color: 0x78b86b, file: './assets/pawns/frankenbwed.glb', thumb: './assets/pawns/thumbs/frankenbwed.png' }
];

// EXTENSIVE 27 ICONIC BAKERY BUILDINGS & MONUMENTS ROSTER (9 PER SHELF - 100% UNIQUE ASSETS)
// Bounded strictly so zero props overflow their pedestals or shelves
export const BAKERY_BUILDINGS_PROPS = [
  // Shelf 1 : Iconic Architecture & Rides (9 unique assets)
  { id: 'bakery-house', name: 'Bakery House', role: 'Residence', file: './assets/buildings/bakery-house.glb', scale: 1.15 },
  { id: 'chocolate-train', name: 'Chocolate Train', role: 'Locomotive', file: './assets/buildings/chocolate-train.glb', scale: 1.05 },
  { id: 'waffle-tower', name: 'Waffle Tower', role: 'Skyscraper', file: './assets/buildings/waffle-tower.glb', scale: 1.15 },
  { id: 'golden-bloom', name: 'Golden Bloom', role: 'Holy Shrine', file: './assets/buildings/golden-bloom.glb', scale: 1.15 },
  { id: 'churro-coaster', name: 'Churro Coaster', role: 'Theme Ride', file: './assets/buildings/churro-coaster.glb', scale: 1.05 },
  { id: 'cosmic-blocks', name: 'Cosmic Wafer Blocks', role: 'Abstract Wonder', file: './assets/buildings/cosmic-blocks.glb', scale: 1.10 },
  { id: 'crimson-tree', name: 'Crimson Berry Tree', role: 'Foliage', file: './assets/buildings/crimson-tree.glb', scale: 1.15 },
  { id: 'bread-cubes', name: 'Bread Cubes Vault', role: 'Treasury', file: './assets/buildings/bread-cubes.glb', scale: 1.10 },
  { id: 'golden-croissant', name: 'Golden Croissant', role: 'Holy Relic', file: './assets/buildings/golden-croissant.glb', scale: 1.15 },

  // Shelf 2 : Shops, Boutiques & High-Stakes Condos (9 unique assets)
  { id: 'honey-pot-tavern', name: 'Honey Pot Tavern', role: 'Tavern', file: './assets/buildings/honey-pot-tavern.glb', scale: 1.15 },
  { id: 'jam-apothecary', name: 'Jam Apothecary', role: 'Apothecary', file: './assets/buildings/jam-jar-apothecary.glb', scale: 1.15 },
  { id: 'milk-apartments', name: 'Milk Apartments', role: 'Condos', file: './assets/buildings/milk-carton-apartments.glb', scale: 1.15 },
  { id: 'shop-barber', name: 'Chantilly Salon', role: 'Boutique', file: './assets/buildings/shop-barber-chantilly.glb', scale: 1.10 },
  { id: 'snack-cart', name: 'Snack Cart', role: 'Street Food', file: './assets/buildings/snack-cart.glb', scale: 1.10 },
  { id: 'pastry-dessert', name: 'Pastry Dessert Tower', role: 'Patisserie', file: './assets/buildings/pastry-dessert.glb', scale: 1.10 },
  { id: 'hazelnut-cup', name: 'Hazelnut Cup', role: 'Café', file: './assets/buildings/hazelnut-cup.glb', scale: 1.10 },
  { id: 'honey-lantern', name: 'Honey Lantern', role: 'Lighting', file: './assets/buildings/honey-lantern.glb', scale: 1.10 },
  { id: 'marshmallow-fire', name: 'Marshmallow Fire', role: 'Cozy Hearth', file: './assets/buildings/marshmallow-campfire.glb', scale: 1.10 },

  // Shelf 3 : Parks, Vehicles & Animated Guardians (9 unique assets)
  { id: 'teacup-gazebo', name: 'Teacup Gazebo', role: 'Park Pavillion', file: './assets/buildings/teacup-gazebo-park.glb', scale: 1.15 },
  { id: 'portal-observatory', name: 'Observatory', role: 'Science', file: './assets/buildings/portal-observatory.glb', scale: 1.10 },
  { id: 'waffle-submarine', name: 'Waffle Submarine', role: 'Vehicle', file: './assets/buildings/vehicle-waffle-submarine.glb', scale: 1.05 },
  { id: 'croissant-ram', name: 'Croissant Ram', role: 'Creature', file: './assets/buildings/creature-croissant-ram.glb', scale: 1.10 },
  { id: 'pretzel-bench', name: 'Pretzel Park Bench', role: 'Park Prop', file: './assets/buildings/pretzel-bench.glb', scale: 1.00 },
  { id: 'toaster-bot', name: 'Toaster Sentinel', role: 'Guardian', file: './assets/buildings/npc-shopkeeper-toaster-bot.glb', scale: 1.10 },
  { id: 'pistachio-shrine', name: 'Pistachio Tree', role: 'Wonder Tree', file: './assets/buildings/pistachio-tree.glb', scale: 1.15 },
  { id: 'wafer-stairs', name: 'Wafer Ramp', role: 'Terrain', file: './assets/buildings/terrain-stairs-wafer-ramp.glb', scale: 1.00 },
  { id: 'treasure-chest', name: 'Bwed Treasure Vault', role: 'Vault', file: './assets/buildings/treasure-chest.glb', scale: 1.10 }
];

export class Board3D {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'MonopolyBoard';

    this.tileMeshes = [];
    this.tileCoordinates = [];
    this.houseMeshes = {};
    this.showcasePawns = [];
    this.showcaseBuildings = [];

    // Geometry Dimensions
    this.cornerSize = 2.45;
    this.stdWidth = 1.38;
    this.stdLength = 2.45;
    this.tileHeight = 0.44;
    this.halfSize = (this.cornerSize * 2 + 9 * this.stdWidth) / 2; // 8.66

    this.loader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();

    this.init();
  }

  init() {
    this.calculateTileTransforms();
    this.createTableAndFrame();
    this.createSunkenCenterArena();
    this.createBoardTiles();
    this.createDoubleShowroomVitrine();
    this.createTabletopDecor();
    this.init3DDiceArena();
    this.createAmbientFlourParticles();

    this.scene.add(this.group);
  }

  calculateTileTransforms() {
    const H = this.halfSize;
    const cornerOffset = H - this.cornerSize / 2;
    const stdStart = H - this.cornerSize;

    for (let i = 0; i < 40; i++) {
      let x = 0, z = 0, rotY = 0, isCorner = false;

      if (i === 0) {
        x = cornerOffset; z = cornerOffset; rotY = 0; isCorner = true;
      } else if (i > 0 && i < 10) {
        x = stdStart - (i - 0.5) * this.stdWidth; z = cornerOffset; rotY = 0;
      } else if (i === 10) {
        x = -cornerOffset; z = cornerOffset; rotY = 0; isCorner = true;
      } else if (i > 10 && i < 20) {
        x = -cornerOffset; z = stdStart - ((i - 10) - 0.5) * this.stdWidth; rotY = -Math.PI / 2;
      } else if (i === 20) {
        x = -cornerOffset; z = -cornerOffset; rotY = Math.PI; isCorner = true;
      } else if (i > 20 && i < 30) {
        x = -stdStart + ((i - 20) - 0.5) * this.stdWidth; z = -cornerOffset; rotY = Math.PI;
      } else if (i === 30) {
        x = cornerOffset; z = -cornerOffset; rotY = Math.PI / 2; isCorner = true;
      } else if (i > 30 && i < 40) {
        x = cornerOffset; z = -stdStart + ((i - 30) - 0.5) * this.stdWidth; rotY = Math.PI / 2;
      }

      this.tileCoordinates[i] = {
        index: i,
        x,
        y: this.tileHeight / 2 + (isCorner ? 0.04 : 0),
        z,
        rotY,
        isCorner,
        data: BOARD_TILES[i]
      };
    }
  }

  // ==========================================================================
  // TABLE, ROUNDED FRAME & SUNKEN DICE ARENA
  // ==========================================================================

  createTableAndFrame() {
    const tableSize = 58;

    const woodTex = this.textureLoader.load('./assets/textures/60-tex-wood-cutting-board.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(7, 7);
      tex.colorSpace = THREE.SRGBColorSpace;
    });

    const table = new THREE.Mesh(
      new THREE.BoxGeometry(tableSize, 1.2, tableSize),
      new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.68, metalness: 0.06 })
    );
    table.position.y = -0.66;
    table.receiveShadow = true;
    this.group.add(table);

    // Nappe / Chemin de table en tissu Vichy pique-nique sous le plateau (texture 97-tex-gingham)
    const ginghamTex = this.textureLoader.load('./assets/textures/97-tex-gingham-picnic-cloth.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(4, 10);
      tex.colorSpace = THREE.SRGBColorSpace;
    });
    const runnerW = this.halfSize * 2 + 3.6; // ~20.9 unités
    const runnerL = 48;
    const runner = new THREE.Mesh(
      new RoundedBoxGeometry(runnerW, 0.05, runnerL, 4, 0.25),
      new THREE.MeshStandardMaterial({ map: ginghamTex, roughness: 0.88, metalness: 0.02 })
    );
    runner.position.set(0, -0.04, 0);
    runner.receiveShadow = true;
    this.group.add(runner);

    // Cadre extérieur arrondi sous le plateau (RoundedBox socle noyer)
    const frameW = this.halfSize * 2 + 1.6;
    const frameGeo = new RoundedBoxGeometry(frameW, 0.24, frameW, 6, 0.45);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1a0f0a,
      roughness: 0.65,
      metalness: 0.12
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = -0.13;
    frame.receiveShadow = true;
    frame.castShadow = true;
    this.group.add(frame);

    // Liseré en laiton doré brossé
    const brassTrim = new THREE.Mesh(
      new RoundedBoxGeometry(frameW + 0.18, 0.08, frameW + 0.18, 6, 0.48),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.88, roughness: 0.24 })
    );
    brassTrim.position.y = -0.01;
    brassTrim.receiveShadow = true;
    this.group.add(brassTrim);
  }

  createSunkenCenterArena() {
    const innerSize = (this.halfSize - this.cornerSize) * 2; // ~12.42
    this.arenaFloorY = 0.20; // Arène en léger retrait sous les tranches de brioche (0.44) : 100% visible, dégagée et lumineuse

    // 1. Cadre biseauté périphérique en noyer sombre (4 poutres sur le pourtour, affleurant les cases)
    const frameGroup = new THREE.Group();
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x22130b, roughness: 0.68, metalness: 0.08 });
    const beamThick = 0.32;
    const beamH = 0.24;
    const beamLen = innerSize + 0.45;
    const halfInner = innerSize / 2;
    const beamY = this.arenaFloorY + beamH / 2; // ~0.32, sommet à 0.44 épousant le haut des cases de jeu

    // Poutres Nord et Sud
    const beamGeoNS = new RoundedBoxGeometry(beamLen, beamH, beamThick, 4, 0.06);
    const beamN = new THREE.Mesh(beamGeoNS, borderMat);
    beamN.position.set(0, beamY, -(halfInner + beamThick / 2));
    beamN.receiveShadow = true;
    frameGroup.add(beamN);

    const beamS = new THREE.Mesh(beamGeoNS, borderMat);
    beamS.position.set(0, beamY, halfInner + beamThick / 2);
    beamS.receiveShadow = true;
    frameGroup.add(beamS);

    // Poutres Ouest et Est
    const beamGeoWE = new RoundedBoxGeometry(beamThick, beamH, innerSize, 4, 0.06);
    const beamW = new THREE.Mesh(beamGeoWE, borderMat);
    beamW.position.set(-(halfInner + beamThick / 2), beamY, 0);
    beamW.receiveShadow = true;
    frameGroup.add(beamW);

    const beamE = new THREE.Mesh(beamGeoWE, borderMat);
    beamE.position.set(halfInner + beamThick / 2, beamY, 0);
    beamE.receiveShadow = true;
    frameGroup.add(beamE);

    this.group.add(frameGroup);

    // 2. Mosaïque animée Bwedverse d'artworks & stickers officiels
    const mosaicCanvas = document.createElement('canvas');
    mosaicCanvas.width = 1024;
    mosaicCanvas.height = 1024;
    const mctx = mosaicCanvas.getContext('2d');

    mctx.fillStyle = '#f4e8d3';
    mctx.fillRect(0, 0, 1024, 1024);

    const stickerSources = [
      './assets/stickers/bwed-tg-03-sunglasses-fingerguns.webp',
      './assets/stickers/bwed-tg-10-smoking-suit.webp',
      './assets/stickers/bwed-tg-19-dollar-bills-cash.webp',
      './assets/stickers/bwed-tg-08-baguette-bat-shades.webp',
      './assets/stickers/bwed-tg-06-chill-coffee-laptop.webp',
      './assets/stickers/bwed-tg-05-hold-the-bwed.webp',
      './assets/stickers/bwed-tg-07-prayer-cult.webp',
      './assets/stickers/bwed-tg-09-bwed-pump-sign.webp',
      './assets/stickers/bwed-tg-12-squad-group.webp',
      './assets/stickers/bwed-tg-18-pepe-mountain-hiker.webp',
      './assets/stickers/bwed-tg-22-chest-thump-proud.webp',
      './assets/stickers/bwed-tg-20-soldier-dual-pistols.webp',
      './assets/stickers/bwed-tg-01-drake-no.webp',
      './assets/stickers/bwed-tg-04-drake-yes.webp',
      './assets/stickers/bwed-tg-14-office-handshake.webp',
      './assets/stickers/bwed-tg-23-just-pump-it-gift.webp'
    ];

    const gridSize = 4;
    const cellW = 1024 / gridSize;
    const cellH = 1024 / gridSize;

    // Rendu des cellules de mosaïque de brioche avec cadres dorés
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const idx = (r * gridSize + c) % stickerSources.length;
        const cx = c * cellW;
        const cy = r * cellH;

        // Fond coussinet mie tiède
        const cellGrad = mctx.createRadialGradient(cx + cellW / 2, cy + cellH / 2, 20, cx + cellW / 2, cy + cellH / 2, cellW * 0.7);
        cellGrad.addColorStop(0, '#fffbf2');
        cellGrad.addColorStop(1, '#eddcc2');
        mctx.fillStyle = cellGrad;
        if (mctx.roundRect) {
          mctx.beginPath();
          mctx.roundRect(cx + 8, cy + 8, cellW - 16, cellH - 16, 16);
          mctx.fill();
        } else {
          mctx.fillRect(cx + 8, cy + 8, cellW - 16, cellH - 16);
        }

        mctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        mctx.lineWidth = 3;
        if (mctx.roundRect) {
          mctx.stroke();
        }

        // Chargement du sticker officiel Bwed
        const img = new Image();
        img.src = stickerSources[idx];
        img.onload = () => {
          mctx.drawImage(img, cx + 24, cy + 24, cellW - 48, cellH - 48);
          this.mosaicTexture.needsUpdate = true;
        };
      }
    }

    this.mosaicTexture = new THREE.CanvasTexture(mosaicCanvas);
    this.mosaicTexture.colorSpace = THREE.SRGBColorSpace;
    this.mosaicTexture.wrapS = THREE.RepeatWrapping;
    this.mosaicTexture.wrapT = THREE.RepeatWrapping;
    this.mosaicTexture.repeat.set(2.5, 2.5);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(innerSize, innerSize),
      new THREE.MeshStandardMaterial({
        map: this.mosaicTexture,
        roughness: 0.52,
        metalness: 0.05
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = this.arenaFloorY;
    floor.receiveShadow = true;
    this.group.add(floor);

    // 3. Médaillon en verre dépoli doré flottant au centre (Frosted Glass Medallion)
    const medalCanvas = document.createElement('canvas');
    medalCanvas.width = 1024;
    medalCanvas.height = 1024;
    const gctx = medalCanvas.getContext('2d');
    gctx.clearRect(0, 0, 1024, 1024);

    // Dégradé semi-transparent restreint au disque central (permet à la mosaïque animée de briller tout autour)
    const vGrad = gctx.createRadialGradient(512, 512, 50, 512, 512, 330);
    vGrad.addColorStop(0, 'rgba(255, 252, 245, 0.88)');
    vGrad.addColorStop(0.7, 'rgba(255, 248, 235, 0.65)');
    vGrad.addColorStop(1, 'rgba(255, 248, 235, 0.0)');
    gctx.fillStyle = vGrad;
    gctx.beginPath();
    gctx.arc(512, 512, 330, 0, Math.PI * 2);
    gctx.fill();

    // Anneaux d'or massif autour du médaillon central
    gctx.strokeStyle = '#d4af37';
    gctx.lineWidth = 8;
    gctx.beginPath();
    gctx.arc(512, 512, 318, 0, Math.PI * 2);
    gctx.stroke();

    gctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
    gctx.lineWidth = 3;
    gctx.beginPath();
    gctx.arc(512, 512, 306, 0, Math.PI * 2);
    gctx.stroke();

    // Emplacements guidés dorés pour les Decks Cartes
    // Chance Guide
    gctx.save();
    gctx.translate(720, 260);
    gctx.rotate(Math.PI / 4);
    gctx.fillStyle = 'rgba(255, 107, 53, 0.12)';
    gctx.fillRect(-125, -80, 250, 160);
    gctx.strokeStyle = '#ff6b35';
    gctx.lineWidth = 6;
    gctx.strokeRect(-125, -80, 250, 160);
    gctx.fillStyle = '#ff6b35';
    gctx.font = '900 32px "Outfit", sans-serif';
    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';
    gctx.fillText('✨ CHANCE DECK', 0, 0);
    gctx.restore();

    // Community Chest Guide
    gctx.save();
    gctx.translate(304, 764);
    gctx.rotate(Math.PI / 4);
    gctx.fillStyle = 'rgba(30, 90, 168, 0.12)';
    gctx.fillRect(-125, -80, 250, 160);
    gctx.strokeStyle = '#1e5aa8';
    gctx.lineWidth = 6;
    gctx.strokeRect(-125, -80, 250, 160);
    gctx.fillStyle = '#1e5aa8';
    gctx.font = '900 28px "Outfit", sans-serif';
    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';
    gctx.fillText('🍞 COMMUNITY CHEST', 0, 0);
    gctx.restore();

    // Logo Diagonale MONOPOLY rouge carmin & or
    gctx.save();
    gctx.translate(512, 512);
    gctx.rotate(-Math.PI / 4);

    // Ombre portée sous le logo
    gctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    gctx.fillRect(-396, -66, 800, 148);

    // Bandeau rouge carmin
    const redGrad = gctx.createLinearGradient(0, -70, 0, 70);
    redGrad.addColorStop(0, '#e52d27');
    redGrad.addColorStop(1, '#b31217');
    gctx.fillStyle = redGrad;
    gctx.fillRect(-390, -70, 780, 140);
    gctx.strokeStyle = '#ffffff';
    gctx.lineWidth = 8;
    gctx.strokeRect(-390, -70, 780, 140);

    gctx.strokeStyle = '#ffd15a';
    gctx.lineWidth = 3;
    gctx.strokeRect(-382, -62, 764, 124);

    // Texte MONOPOLY blanc avec biseau
    gctx.fillStyle = '#ffffff';
    gctx.font = '900 94px "Fredoka", "Outfit", sans-serif';
    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';
    gctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    gctx.shadowOffsetY = 5;
    gctx.shadowBlur = 8;
    gctx.fillText('MONOPOLY', 0, -2);
    gctx.shadowColor = 'transparent';

    // Sous-titre collector doré
    gctx.fillStyle = '#ffd15a';
    gctx.font = '900 25px "Outfit", sans-serif';
    gctx.fillText('BWED COLLECTOR’S EDITION', 0, 105);
    gctx.restore();

    const medalTex = new THREE.CanvasTexture(medalCanvas);
    medalTex.colorSpace = THREE.SRGBColorSpace;
    medalTex.anisotropy = 8;

    const frostedPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(innerSize - 0.1, innerSize - 0.1),
      new THREE.MeshStandardMaterial({
        map: medalTex,
        transparent: true,
        opacity: 0.90,
        roughness: 0.28,
        metalness: 0.08,
        depthWrite: false
      })
    );
    frostedPlane.rotation.x = -Math.PI / 2;
    frostedPlane.position.y = this.arenaFloorY + 0.008;
    frostedPlane.receiveShadow = true;
    this.group.add(frostedPlane);

    this.createPhysicalCardDecks();
    this.initPodiumStage();
  }

  // ==========================================================================
  // PHYSICAL 3D CARD DECKS (ELEVATED ON WOODEN/BRASS TRAYS - ZERO CLIPPING)
  // Les paquets de cartes physiques reposent sur de beaux plateaux biseautés
  // ==========================================================================

  createPhysicalCardDecks() {
    this.decksGroup = new THREE.Group();
    this.decksGroup.name = 'PhysicalCardDecks';

    // Deck 1 : CHANCE (Orange Bwed chaud + sticker lunettes)
    const chanceTray = this.createCardTrayMesh(2.55, 1.70);
    chanceTray.position.set(2.52, this.arenaFloorY + 0.04, -3.06);
    chanceTray.rotation.y = -Math.PI / 4;
    this.decksGroup.add(chanceTray);

    const chanceDeck = this.createCardDeckMesh({
      title: 'CHANCE',
      sub: 'BWED EDITION',
      bgColor: '#ff6b35',
      bgGrad: '#d84a1b',
      accentColor: '#ffd15a',
      stickerPath: './assets/stickers/bwed-tg-03-sunglasses-fingerguns.webp',
      badgeText: '✨',
      width: 2.3,
      depth: 1.48,
      height: 0.32
    });
    chanceDeck.position.set(2.52, this.arenaFloorY + 0.24, -3.06);
    chanceDeck.rotation.y = -Math.PI / 4;
    this.decksGroup.add(chanceDeck);

    // Deck 2 : COMMUNITY CHEST (Bleu Royal Bwed + sticker liasse de billets)
    const chestTray = this.createCardTrayMesh(2.55, 1.70);
    chestTray.position.set(-2.52, this.arenaFloorY + 0.04, 3.06);
    chestTray.rotation.y = -Math.PI / 4;
    this.decksGroup.add(chestTray);

    const chestDeck = this.createCardDeckMesh({
      title: 'COMMUNITY',
      sub: 'CHEST',
      bgColor: '#1e5aa8',
      bgGrad: '#103463',
      accentColor: '#ffd15a',
      stickerPath: './assets/stickers/bwed-tg-19-dollar-bills-cash.webp',
      badgeText: '🍞',
      width: 2.3,
      depth: 1.48,
      height: 0.32
    });
    chestDeck.position.set(-2.52, this.arenaFloorY + 0.24, 3.06);
    chestDeck.rotation.y = -Math.PI / 4;
    this.decksGroup.add(chestDeck);

    this.group.add(this.decksGroup);
  }

  createCardTrayMesh(width, depth) {
    const group = new THREE.Group();

    // Corps en noyer foncé biseauté
    const trayGeo = new RoundedBoxGeometry(width, 0.08, depth, 4, 0.06);
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x24120a, roughness: 0.48 });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.castShadow = true;
    tray.receiveShadow = true;
    group.add(tray);

    // Rebord surélevé en laiton doré
    const rimGeo = new RoundedBoxGeometry(width + 0.06, 0.05, depth + 0.06, 4, 0.04);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.88, roughness: 0.22 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.03;
    rim.castShadow = true;
    group.add(rim);

    return group;
  }

  createCardDeckMesh({ title, sub, bgColor, bgGrad, accentColor, stickerPath, badgeText, width, height, depth }) {
    const group = new THREE.Group();

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 320);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, bgGrad);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 320);

    // Bordure blanche de carte à jouer de collection
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 14;
    ctx.strokeRect(10, 10, 492, 300);

    // Filet doré intérieur
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(26, 26, 460, 268);

    // Médaillon central
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.arc(256, 160, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Typo du deck en haut et bas
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 28px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 6;
    ctx.fillText(title, 256, 54);
    if (sub) {
      ctx.fillText(sub, 256, 280);
    }

    const cardTex = new THREE.CanvasTexture(canvas);
    cardTex.colorSpace = THREE.SRGBColorSpace;

    // Charger le sticker officiel Bwed au cœur de la carte
    if (stickerPath) {
      const img = new Image();
      img.src = stickerPath;
      img.onload = () => {
        ctx.shadowColor = 'transparent';
        ctx.drawImage(img, 256 - 54, 160 - 54, 108, 108);
        cardTex.needsUpdate = true;
      };
    }

    const sideMat = new THREE.MeshStandardMaterial({
      color: 0xfbf6ea,
      roughness: 0.72
    });
    const topMat = new THREE.MeshStandardMaterial({
      map: cardTex,
      roughness: 0.3,
      metalness: 0.08
    });

    const geo = new RoundedBoxGeometry(width, height, depth, 4, 0.06);
    const materials = [
      sideMat, sideMat,
      topMat,
      sideMat, sideMat, sideMat
    ];

    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    return group;
  }

  // ==========================================================================
  // 3D ENDGAME CELEBRATION PODIUM (ARCADE TIERED CAKE & CONFETTI FOUNTAIN)
  // Podium 3D officiel de fin de partie avec célébration et cotillons
  // ==========================================================================

  initPodiumStage() {
    this.podiumGroup = new THREE.Group();
    this.podiumGroup.name = 'VictoryPodium';
    this.podiumGroup.position.set(0, this.arenaFloorY + 0.02, 0);
    this.podiumGroup.visible = false; // Caché pendant le cours normal de la partie

    // Chargement du modèle GLTF arcade-podium-tiered-cake.glb à l'échelle héroïque (8.2x)
    this.loader.load('./assets/buildings/arcade-podium-tiered-cake.glb', (gltf) => {
      const cakeModel = gltf.scene;
      cakeModel.scale.setScalar(8.2);
      cakeModel.position.set(0, 0, 0);
      cakeModel.traverse(n => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });
      this.podiumGroup.add(cakeModel);
      if (this.proceduralPodium) {
        this.proceduralPodium.visible = false;
      }
    }, undefined, () => {
      // Le podium procédural reste actif en fallback
    });

    // Scène de podium procédurale (immédiate, calibrée aux mêmes dimensions 4.38 / 3.32 / 2.94)
    const procStage = new THREE.Group();
    this.proceduralPodium = procStage;

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd15a, roughness: 0.25, metalness: 0.85 });
    const silverMat = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, roughness: 0.3, metalness: 0.75 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xcd7f32, roughness: 0.35, metalness: 0.7 });

    // Marche 1 : Vainqueur Or (Centre haut : Y = 4.38)
    const t1 = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 4.38, 32), goldMat);
    t1.position.set(0, 4.38 / 2, 0);
    t1.castShadow = true;
    t1.receiveShadow = true;
    procStage.add(t1);

    // Marche 2 : 2ème Place Argent (Gauche : Y = 3.32)
    const t2 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 3.32, 32), silverMat);
    t2.position.set(-1.65, 3.32 / 2, 0.15);
    t2.castShadow = true;
    t2.receiveShadow = true;
    procStage.add(t2);

    // Marche 3 : 3ème Place Bronze (Droite : Y = 2.94)
    const t3 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 2.94, 32), bronzeMat);
    t3.position.set(1.67, 2.94 / 2, 0.15);
    t3.castShadow = true;
    t3.receiveShadow = true;
    procStage.add(t3);

    // Base circulaire en marbre noir/chocolat
    const stageBase = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4, 4.6, 0.15, 32),
      new THREE.MeshStandardMaterial({ color: 0x22110a, roughness: 0.6 })
    );
    stageBase.position.y = 0.075;
    stageBase.receiveShadow = true;
    procStage.add(stageBase);

    this.podiumGroup.add(procStage);

    // Projecteur doré de victoire
    this.winnerSpotlight = new THREE.PointLight(0xffd700, 3.8, 16);
    this.winnerSpotlight.position.set(0, 7.5, 0);
    this.podiumGroup.add(this.winnerSpotlight);

    // Nuée de cotillons / confettis 3D
    this.confettiGroup = new THREE.Group();
    this.confettiParticles = [];
    const confettiColors = [0xffd700, 0xe63946, 0x2ec4b6, 0xff9f1c, 0xffffff, 0x9b5de5];
    const confGeo = new THREE.PlaneGeometry(0.12, 0.16);

    for (let i = 0; i < 180; i++) {
      const color = confettiColors[i % confettiColors.length];
      const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(confGeo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 5.0,
        this.arenaFloorY + 2.0 + Math.random() * 6.5,
        (Math.random() - 0.5) * 5.0
      );
      this.confettiGroup.add(mesh);

      this.confettiParticles.push({
        mesh,
        speedY: 1.2 + Math.random() * 1.8,
        driftX: 0.4 + Math.random() * 0.8,
        driftZ: 0.4 + Math.random() * 0.8,
        rotX: (Math.random() - 0.5) * 0.1,
        rotY: (Math.random() - 0.5) * 0.15,
        rotZ: (Math.random() - 0.5) * 0.1,
        seed: Math.random() * 10
      });
    }

    this.podiumGroup.add(this.confettiGroup);
    this.group.add(this.podiumGroup);
  }

  celebrateEndgame(rankings = [], pawnManager = null) {
    if (!this.podiumGroup) return;
    this.podiumGroup.visible = true;
    this.isCelebrating = true;

    // Déplacer les decks de cartes pour laisser le podium briller
    if (this.decksGroup) {
      this.decksGroup.visible = false;
    }

    if (!pawnManager || !rankings || rankings.length === 0) return;

    // Placer les pions sur les marches 1, 2, 3
    const p1 = rankings[0];
    if (p1) {
      const pawn1 = pawnManager.getPawn(p1.id);
      if (pawn1) {
        this.winnerPawnInstance = pawn1;
        pawn1.setOffset(0, 0);
        pawn1.group.position.set(0, this.arenaFloorY + 4.38, 0);
        pawn1.meshContainer.rotation.y = 0;
      }
    }

    const p2 = rankings[1];
    if (p2) {
      const pawn2 = pawnManager.getPawn(p2.id);
      if (pawn2) {
        pawn2.setOffset(0, 0);
        pawn2.group.position.set(-1.65, this.arenaFloorY + 3.32, 0.15);
        pawn2.meshContainer.rotation.y = 0.25;
      }
    }

    const p3 = rankings[2];
    if (p3) {
      const pawn3 = pawnManager.getPawn(p3.id);
      if (pawn3) {
        pawn3.setOffset(0, 0);
        pawn3.group.position.set(1.67, this.arenaFloorY + 2.94, 0.15);
        pawn3.meshContainer.rotation.y = -0.25;
      }
    }

    const p4 = rankings[3];
    if (p4) {
      const pawn4 = pawnManager.getPawn(p4.id);
      if (pawn4) {
        pawn4.setOffset(0, 0);
        pawn4.group.position.set(0, this.arenaFloorY + 0.15, 3.5);
        pawn4.meshContainer.rotation.y = Math.PI; // Regarde vers le podium
      }
    }
  }

  // ==========================================================================
  // TABLETOP DECOR — GAME NIGHT CHEZ BWED (REMPLIR LE VIDE DE LA TABLE)
  // Réserve de la banque (coffre & beurre doré) + Tasse de café & Croissant
  // ==========================================================================

  createTabletopDecor() {
    this.decorGroup = new THREE.Group();
    this.decorGroup.name = 'TabletopDecor';

    // ------------------------------------------------------------------------
    // CÔTÉ GAUCHE : LA BANQUE BWED (Coffre-fort, lingots de beurre doré & billets)
    // ------------------------------------------------------------------------
    const bankZone = new THREE.Group();
    bankZone.position.set(-13.4, 0, 1.8);
    bankZone.rotation.y = 0.28;

    // Tapis de feutrine verte sous la banque
    const bankMat = new THREE.Mesh(
      new RoundedBoxGeometry(5.4, 0.04, 4.4, 4, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x1f3328, roughness: 0.85 })
    );
    bankMat.position.y = -0.04;
    bankMat.receiveShadow = true;
    bankZone.add(bankMat);

    // Coffre au trésor de la Banque Bwed
    this.loader.load('./assets/buildings/treasure-chest.glb', (gltf) => {
      const chest = gltf.scene;
      chest.scale.setScalar(1.35);
      chest.position.set(-0.6, 0.02, 0.1);
      chest.rotation.y = 0.35;
      chest.traverse(n => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });
      bankZone.add(chest);
    });

    // Lingots de beurre doré empilés (Gold Bullion Butter Bars)
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      metalness: 0.94,
      roughness: 0.2,
      envMapIntensity: 1.5
    });
    const ingotGeo = new RoundedBoxGeometry(0.72, 0.24, 0.38, 4, 0.05);
    const ingotPositions = [
      { x: 1.2, y: 0.12, z: -0.5, r: 0.1 },
      { x: 1.2, y: 0.12, z: 0.1, r: -0.05 },
      { x: 1.2, y: 0.34, z: -0.2, r: 0.02 },
      { x: 1.7, y: 0.12, z: 0.65, r: 0.35 }
    ];
    ingotPositions.forEach(p => {
      const ingot = new THREE.Mesh(ingotGeo, goldMat);
      ingot.position.set(p.x, p.y, p.z);
      ingot.rotation.y = p.r;
      ingot.castShadow = true;
      ingot.receiveShadow = true;
      bankZone.add(ingot);
    });

    // Piles de billets Monopoly Bwed
    const billColors = [0xffbe0b, 0x06d6a0, 0x118ab2, 0xef476f];
    billColors.forEach((col, idx) => {
      const stack = new THREE.Mesh(
        new RoundedBoxGeometry(0.85, 0.16, 0.46, 3, 0.03),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.65 })
      );
      stack.position.set(0.6 + idx * 0.42, 0.08, -1.1 + (idx % 2) * 0.15);
      stack.rotation.y = (idx - 1.5) * 0.15;
      stack.castShadow = true;
      stack.receiveShadow = true;
      bankZone.add(stack);
    });

    this.decorGroup.add(bankZone);

    // ------------------------------------------------------------------------
    // CÔTÉ DROIT : LE COIN DÉGUSTATION (Tasse café latte & Croissant artisanal)
    // ------------------------------------------------------------------------
    const snackZone = new THREE.Group();
    snackZone.position.set(13.4, 0, 1.8);
    snackZone.rotation.y = -0.28;

    // Soucoupe en bois d'acajou
    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(2.3, 2.4, 0.08, 32),
      new THREE.MeshStandardMaterial({ color: 0x3d2214, roughness: 0.55 })
    );
    saucer.position.y = -0.02;
    saucer.receiveShadow = true;
    snackZone.add(saucer);

    // Napperon blanc brodé
    const doily = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.15, 0.02, 32),
      new THREE.MeshStandardMaterial({ color: 0xfaf5ec, roughness: 0.9 })
    );
    doily.position.y = 0.03;
    doily.receiveShadow = true;
    snackZone.add(doily);

    // Tasse de café / cappuccino hazelnut
    this.loader.load('./assets/buildings/hazelnut-cup.glb', (gltf) => {
      const cup = gltf.scene;
      cup.scale.setScalar(1.22);
      cup.position.set(-0.6, 0.04, -0.3);
      cup.traverse(n => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });
      snackZone.add(cup);
    });

    // Croissant doré artisanal
    this.loader.load('./assets/buildings/golden-croissant.glb', (gltf) => {
      const croissant = gltf.scene;
      croissant.scale.setScalar(1.15);
      croissant.position.set(0.65, 0.04, 0.35);
      croissant.rotation.y = -0.6;
      croissant.traverse(n => {
        if (n.isMesh) {
          n.castShadow = true;
          n.receiveShadow = true;
        }
      });
      snackZone.add(croissant);
    });

    this.decorGroup.add(snackZone);
    this.group.add(this.decorGroup);
  }

  // ==========================================================================
  // AMBIENT FLOUR PARTICLES (POUSSIÈRE DE FARINE DORÉE EN SUSPENSION)
  // 75 micro-particules scintillantes douces flottant au-dessus du plateau
  // ==========================================================================

  createAmbientFlourParticles() {
    const count = 75;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = 0.8 + Math.random() * 5.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pctx = pCanvas.getContext('2d');
    const grad = pctx.createRadialGradient(32, 32, 2, 32, 32, 28);
    grad.addColorStop(0, 'rgba(255, 235, 180, 0.95)');
    grad.addColorStop(0.4, 'rgba(255, 210, 120, 0.45)');
    grad.addColorStop(1, 'rgba(255, 180, 80, 0)');
    pctx.fillStyle = grad;
    pctx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const mat = new THREE.PointsMaterial({
      map: pTex,
      size: 0.35,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.flourParticles = new THREE.Points(geo, mat);
    this.group.add(this.flourParticles);
  }

  adjustColor(hex, amount) {
    let col = hex.replace('#', '');
    if (col.length === 3) col = col.split('').map(c => c + c).join('');
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // ==========================================================================
  // PILLOWY BREAD SLICE TILES (COZY SHIBA BRIOCHE & 3D EMBOSSED RELIEF)
  // ==========================================================================

  createBoardTiles() {
    this.tileCoordinates.forEach((coord, idx) => {
      const tileData = coord.data;
      const width = coord.isCorner ? this.cornerSize : this.stdWidth;
      const length = coord.isCorner ? this.cornerSize : this.stdLength;

      const { map, bumpMap } = this.generateTileTexture(tileData, coord.isCorner);
      const matTop = new THREE.MeshStandardMaterial({
        map,
        bumpMap,
        bumpScale: 0.038,
        roughness: 0.38,
        metalness: 0.04
      });

      // Croûte dorée au four façon pain de mie / brioche Bwed
      const matSide = new THREE.MeshStandardMaterial({
        color: 0xaa5e24, // Riche croûte de brioche dorée cuite au four
        roughness: 0.68,
        metalness: 0.02
      });

      const radius = coord.isCorner ? 0.22 : 0.14;
      const geo = new RoundedBoxGeometry(width - 0.045, this.tileHeight, length - 0.045, 4, radius);

      const materials = [
        matSide, matSide,
        matTop,
        matSide, matSide, matSide
      ];

      const mesh = new THREE.Mesh(geo, materials);
      mesh.position.set(coord.x, coord.y, coord.z);
      mesh.rotation.y = coord.rotY;
      mesh.receiveShadow = true;
      mesh.castShadow = true;
      mesh.userData = { tileIndex: idx, tileData };

      this.tileMeshes[idx] = mesh;
      this.group.add(mesh);
    });
  }

  generateTileTexture(data, isCorner) {
    const w = isCorner ? 512 : 360;
    const h = 512;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = w;
    bumpCanvas.height = h;
    const bctx = bumpCanvas.getContext('2d');

    // 1. Fond Mie de Brioche Cozy Shiba (douceur, chaleur, micro-alvéoles)
    const baseGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, h * 0.7);
    baseGrad.addColorStop(0, '#fbf4e6'); // Mie dorée crème
    baseGrad.addColorStop(0.7, '#f6e4c7'); // Mie tiède
    baseGrad.addColorStop(1, '#ebd0a5'); // Bordure toastée
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, w, h);

    // Micro-alvéoles de mie de brioche (texture stippling douce)
    ctx.fillStyle = 'rgba(180, 110, 45, 0.06)';
    for (let p = 0; p < 120; p++) {
      const px = (p * 79) % w;
      const py = (p * 131) % h;
      const pr = 1 + (p % 4);
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Double contour croûte de pain cuit au four
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#a45722'; // Brun croûte dorée
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(4, 4, w - 8, h - 8, 18);
      ctx.stroke();
    } else {
      ctx.strokeRect(4, 4, w - 8, h - 8);
    }
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#f1b774'; // Liseré intérieur miel doré
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(8, 8, w - 16, h - 16, 14);
      ctx.stroke();
    }

    // Bump Map Base (Gris neutre 128)
    bctx.fillStyle = '#808080';
    bctx.fillRect(0, 0, w, h);
    bctx.lineWidth = 5;
    bctx.strokeStyle = '#444444'; // Rainure en creux sur le bord
    if (bctx.roundRect) {
      bctx.beginPath();
      bctx.roundRect(5, 5, w - 10, h - 10, 16);
      bctx.stroke();
    }

    const groupConfig = COLOR_GROUPS[data.group] || COLOR_GROUPS.SPECIAL;

    if (isCorner) {
      this.drawCornerCanvas(ctx, bctx, w, h, data);
    } else if (data.type === 'PROPERTY') {
      this.drawPropertyCanvas(ctx, bctx, w, h, data, groupConfig);
    } else {
      this.drawSpecialCanvas(ctx, bctx, w, h, data, groupConfig);
    }

    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;

    const bumpMap = new THREE.CanvasTexture(bumpCanvas);
    bumpMap.anisotropy = 8;

    return { map, bumpMap };
  }

  // ==========================================================================
  // 3D EXTRUDED BLOCK TYPOGRAPHY & TACTILE CANVAS SHADING (ZERO EMOJIS)
  // Lettrage en relief 3D prononcé (5 couches d'extrusion isométrique, biseau, bump)
  // ==========================================================================

  draw3DExtrudedText(ctx, bctx, text, x, y, options = {}) {
    const depth = options.depth || 5;
    const shadowColor = options.shadowColor || '#140602';
    const faceColor = options.faceColor || '#fffdf5';
    const bevelColor = options.bevelColor || 'rgba(255, 255, 255, 0.95)';
    const outlineColor = options.outlineColor || '#0a0301';
    const outlineWidth = options.outlineWidth || 3.5;

    ctx.save();

    // 1. Contour extérieur sombre et net
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    for (let d = depth; d >= 1; d--) {
      ctx.strokeText(text, x + d * 0.75, y + d * 1.0);
    }
    ctx.strokeText(text, x, y);

    // 2. Couches d'extrusion isométrique vers le bas-droite
    for (let d = depth; d >= 1; d--) {
      ctx.fillStyle = shadowColor;
      ctx.fillText(text, x + d * 0.75, y + d * 1.0);
    }

    // 3. Biseau spéculaire supérieur gauche
    ctx.fillStyle = bevelColor;
    ctx.fillText(text, x - 0.8, y - 0.8);

    // 4. Face avant lumineuse
    ctx.fillStyle = faceColor;
    ctx.fillText(text, x, y);

    ctx.restore();

    // 5. Relief bump map Three.js (accroche réelle de la lumière)
    if (bctx) {
      bctx.save();
      for (let d = depth; d >= 1; d--) {
        bctx.fillStyle = '#262626';
        bctx.fillText(text, x + d * 0.75, y + d * 1.0);
      }
      bctx.fillStyle = '#ffffff';
      bctx.fillText(text, x, y);
      bctx.restore();
    }
  }

  drawPropertyCanvas(ctx, bctx, w, h, data, group) {
    const bannerH = 120;

    // Coussinet de couleur bombé
    const bGrad = ctx.createLinearGradient(0, 10, 0, bannerH + 10);
    bGrad.addColorStop(0, group.color);
    bGrad.addColorStop(1, this.adjustColor(group.color, -25));
    ctx.fillStyle = bGrad;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(10, 10, w - 20, bannerH, [14, 14, 10, 10]);
      ctx.fill();
    } else {
      ctx.fillRect(10, 10, w - 20, bannerH);
    }

    // Liseré or brossé autour du bandeau
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3.5;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(10, 10, w - 20, bannerH, [14, 14, 10, 10]);
      ctx.stroke();
    }

    // Lueur glossy sur le haut du bandeau
    ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(12, 12, w - 24, 30, [12, 12, 4, 4]);
      ctx.fill();
    }

    // Bump map bandeau
    bctx.fillStyle = '#a8a8a8';
    if (bctx.roundRect) {
      bctx.beginPath();
      bctx.roundRect(10, 10, w - 20, bannerH, [14, 14, 10, 10]);
      bctx.fill();
      bctx.strokeStyle = '#cccccc';
      bctx.lineWidth = 3;
      bctx.stroke();
    }

    // ------------------------------------------------------------------------
    // NOM DE LA PROPRIÉTÉ : STRICTEMENT 1 MOT PAR LIGNE & COULEUR CROÛTE (#52240b)
    // ------------------------------------------------------------------------
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';

    const words = data.name.toUpperCase().split(/\s+/).filter(Boolean);
    const maxLen = Math.max(...words.map(w => w.length));
    let fontSize = 28;
    if (maxLen > 11) fontSize = 23;
    else if (maxLen > 8) fontSize = 25;
    else if (maxLen <= 5) fontSize = 32;

    ctx.font = `900 ${fontSize}px "Fredoka", "Outfit", sans-serif`;
    bctx.font = `900 ${fontSize}px "Fredoka", "Outfit", sans-serif`;

    const totalWords = words.length;
    const startY = totalWords === 1 ? 280
      : totalWords === 2 ? 255
      : totalWords === 3 ? 230
      : 205;
    const lineSpacing = totalWords >= 3 ? (fontSize + 16) : (fontSize + 18);

    words.forEach((word, i) => {
      const y = startY + (i - (totalWords - 1) / 2) * lineSpacing;
      this.draw3DExtrudedText(ctx, bctx, word, w / 2, y, {
        depth: 4,
        faceColor: '#52240b', // Couleur exacte croûte de brioche cuite au four
        bevelColor: 'rgba(255, 252, 238, 0.95)', // Reflet spéculaire crème tiède
        shadowColor: '#1d0b04', // Ombre portée profonde
        outlineColor: '#381605', // Définition nette des contours
        outlineWidth: 2.0
      });
    });

    // ------------------------------------------------------------------------
    // BADGE DE PRIX EN LINGOT DE BEURRE DORÉ AVEC TEXTE EN RELIEF 3D
    // ------------------------------------------------------------------------
    const pillW = 144;
    const pillH = 46;
    const pillX = w / 2 - pillW / 2;
    const pillY = h - 62;

    const pGrad = ctx.createLinearGradient(0, pillY, 0, pillY + pillH);
    pGrad.addColorStop(0, '#ffd15a'); // Beurre doré
    pGrad.addColorStop(1, '#f59e0b'); // Miel caramélisé
    ctx.fillStyle = pGrad;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 12);
      ctx.fill();
      ctx.strokeStyle = '#9e4e16';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Prix embossé en blocs 3D
    ctx.font = '900 28px "Outfit", sans-serif';
    bctx.font = '900 28px "Outfit", sans-serif';
    this.draw3DExtrudedText(ctx, bctx, `$${data.price}`, w / 2, pillY + pillH / 2, {
      depth: 4,
      faceColor: '#1d0c04',
      bevelColor: '#fff9d6',
      shadowColor: '#5c2d0c',
      outlineColor: '#3d1a05',
      outlineWidth: 2.0
    });

    // Bump map pour la tablette de prix
    bctx.fillStyle = '#c4c4c4';
    if (bctx.roundRect) {
      bctx.beginPath();
      bctx.roundRect(pillX, pillY, pillW, pillH, 12);
      bctx.fill();
    }
  }

  drawSpecialCanvas(ctx, bctx, w, h, data, group) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';

    // Titre embossé 3D (Strictement 1 mot par ligne & couleur croûte #52240b)
    const rawWords = data.shortName.toUpperCase().split(/\s+/).filter(Boolean);
    const maxLen = Math.max(...rawWords.map(w => w.length));
    let sFontSize = 24;
    if (maxLen > 10) sFontSize = 21;
    ctx.font = `900 ${sFontSize}px "Fredoka", "Outfit", sans-serif`;
    bctx.font = `900 ${sFontSize}px "Fredoka", "Outfit", sans-serif`;

    const titleCenterY = rawWords.length > 1 ? 58 : 68;
    const sLineSpacing = sFontSize + 10;
    rawWords.forEach((word, i) => {
      const y = titleCenterY + (i - (rawWords.length - 1) / 2) * sLineSpacing;
      this.draw3DExtrudedText(ctx, bctx, word, w / 2, y, {
        depth: 3,
        faceColor: '#52240b', // Couleur croûte cuite au four
        bevelColor: 'rgba(255, 252, 238, 0.95)',
        shadowColor: '#1d0b04',
        outlineColor: '#381605',
        outlineWidth: 2.0
      });
    });

    // Médaillon central doré sous l'icône vectorielle
    const medalCenterY = 232;
    ctx.fillStyle = 'rgba(212, 175, 55, 0.14)';
    ctx.beginPath();
    ctx.arc(w / 2, medalCenterY, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(w / 2, medalCenterY, 73, 0, Math.PI * 2);
    ctx.stroke();

    // Rendu d'icônes vectorielles nettes et pro (AUCUN EMOJI)
    this.drawSpecialVectorBadge(ctx, w / 2, medalCenterY, data);

    // Badge montant / prix en bas
    const pillW = 146;
    const pillH = 46;
    const pillX = w / 2 - pillW / 2;
    const pillY = h - 62;

    let priceLabel = '';
    if (data.price) priceLabel = `$${data.price}`;
    else if (data.amount) priceLabel = `PAY $${data.amount}`;
    else priceLabel = data.shortName;

    const pGrad = ctx.createLinearGradient(0, pillY, 0, pillY + pillH);
    pGrad.addColorStop(0, '#ffd15a');
    pGrad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = pGrad;
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 12);
      ctx.fill();
      ctx.strokeStyle = '#9e4e16';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.font = '900 22px "Outfit", sans-serif';
    bctx.font = '900 22px "Outfit", sans-serif';
    this.draw3DExtrudedText(ctx, bctx, priceLabel, w / 2, pillY + pillH / 2, {
      depth: 3,
      faceColor: '#1e0f07',
      bevelColor: '#fff9d6',
      shadowColor: '#5c2d0c',
      outlineColor: '#3d1a05',
      outlineWidth: 2.0
    });

    bctx.fillStyle = '#c4c4c4';
    if (bctx.roundRect) {
      bctx.beginPath();
      bctx.roundRect(pillX, pillY, pillW, pillH, 12);
      bctx.fill();
    }
  }

  drawSpecialVectorBadge(ctx, cx, cy, data) {
    ctx.save();
    ctx.translate(cx, cy);

    if (data.type === 'RAILROAD') {
      // Locomotive à vapeur stylisée de boulangerie
      ctx.fillStyle = '#26140d';
      // Corps locomotive
      ctx.fillRect(-32, -10, 64, 28);
      // Cabine conducteur
      ctx.fillRect(8, -26, 24, 22);
      // Cheminée
      ctx.fillRect(-24, -28, 12, 18);
      ctx.fillRect(-27, -32, 18, 5);
      // Roues dorées
      ctx.fillStyle = '#ffd15a';
      ctx.strokeStyle = '#9e4e16';
      ctx.lineWidth = 2;
      [-20, 0, 20].forEach(wx => {
        ctx.beginPath();
        ctx.arc(wx, 20, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      // Panache de fumée mie de pain
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(-26, -42, 7, 0, Math.PI * 2);
      ctx.arc(-34, -50, 9, 0, Math.PI * 2);
      ctx.fill();
    } else if (data.id === 'u_electric' || data.name.includes('Electric')) {
      // Éclair d'énergie électrique doré
      ctx.fillStyle = '#ffd15a';
      ctx.strokeStyle = '#c97800';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(8, -42);
      ctx.lineTo(-24, 2);
      ctx.lineTo(0, 2);
      ctx.lineTo(-12, 42);
      ctx.lineTo(24, -4);
      ctx.lineTo(0, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (data.id === 'u_water' || data.name.includes('Water')) {
      // Goutte d'eau cristalline de source
      ctx.fillStyle = '#3a86ff';
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.bezierCurveTo(28, -4, 30, 22, 0, 38);
      ctx.bezierCurveTo(-30, 22, -28, -4, 0, -42);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Reflet spéculaire
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(-8, 10, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (data.type === 'TAX') {
      // Bague diamant ou lingot de taxe
      ctx.fillStyle = '#ffd15a';
      ctx.strokeStyle = '#9e4e16';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(28, -12);
      ctx.lineTo(0, 32);
      ctx.lineTo(-28, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.lineTo(14, -12);
      ctx.lineTo(0, 32);
      ctx.lineTo(-14, -12);
      ctx.closePath();
      ctx.fill();
    } else if (data.type === 'CHANCE') {
      // Grand point d'interrogation doré Chance
      ctx.fillStyle = '#ff6b35';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.font = '900 78px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText('?', 0, 2);
      ctx.fillText('?', 0, 2);
    } else if (data.type === 'COMMUNITY_CHEST') {
      // Coffre au trésor de communauté doré
      ctx.fillStyle = '#ffd15a';
      ctx.strokeStyle = '#7c3f00';
      ctx.lineWidth = 3;
      ctx.fillRect(-28, -10, 56, 32);
      ctx.strokeRect(-28, -10, 56, 32);
      ctx.beginPath();
      ctx.arc(0, -10, 28, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, 0, 10, 12);
    } else {
      // Étoile d'artisan boulanger
      ctx.fillStyle = '#ffd15a';
      ctx.strokeStyle = '#9e4e16';
      ctx.lineWidth = 2.5;
      ctx.font = '900 68px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeText('★', 0, 0);
      ctx.fillText('★', 0, 0);
    }

    ctx.restore();
  }

  drawCornerCanvas(ctx, bctx, w, h, data) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';

    if (data.type === 'GO') {
      // 1. Textes salaires en relief 3D
      ctx.font = '900 36px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'COLLECT $200', w / 2, 72, {
        depth: 4,
        faceColor: '#ffffff',
        shadowColor: '#1e0c05',
        outlineColor: '#0a0301',
        outlineWidth: 3
      });
      ctx.font = '900 24px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'AS YOU PASS', w / 2, 114, {
        depth: 3,
        faceColor: '#ffd15a',
        shadowColor: '#2b1206',
        outlineColor: '#0a0301',
        outlineWidth: 2.5
      });

      // 2. Chevron flèche directionnelle verte & or
      ctx.save();
      ctx.translate(w / 2, 235);
      const chGrad = ctx.createLinearGradient(0, -60, 0, 60);
      chGrad.addColorStop(0, '#43a047');
      chGrad.addColorStop(1, '#1b5e20');
      ctx.fillStyle = chGrad;
      ctx.strokeStyle = '#ffd15a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(-110, -25);
      ctx.lineTo(20, -25);
      ctx.lineTo(20, -55);
      ctx.lineTo(110, 0);
      ctx.lineTo(20, 55);
      ctx.lineTo(20, 25);
      ctx.lineTo(-110, 25);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 3. Typo géante GO en blocs 3D
      ctx.font = '900 110px "Fredoka", "Outfit", sans-serif';
      bctx.font = '900 110px "Fredoka", "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'GO', w / 2, 400, {
        depth: 7,
        faceColor: '#ffffff',
        shadowColor: '#0b3511',
        outlineColor: '#051808',
        outlineWidth: 5
      });
    } else if (data.type === 'JAIL') {
      // Titre In Jail
      ctx.font = '900 42px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'IN JAIL', w / 2, 75, {
        depth: 4,
        faceColor: '#ff9800',
        shadowColor: '#3a1602',
        outlineColor: '#1e0a01',
        outlineWidth: 3.5
      });

      // Cage / Grille-pain prison stylisé
      ctx.save();
      ctx.translate(w / 2, 235);
      // Fond cellule sombre
      ctx.fillStyle = '#1e1109';
      ctx.fillRect(-90, -75, 180, 150);
      ctx.strokeStyle = '#ffd15a';
      ctx.lineWidth = 4;
      ctx.strokeRect(-90, -75, 180, 150);
      // Barres de prison dorées
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 6;
      [-60, -30, 0, 30, 60].forEach(bx => {
        ctx.beginPath();
        ctx.moveTo(bx, -75);
        ctx.lineTo(bx, 75);
        ctx.stroke();
      });
      // Visage de tranche de pain derrière les barreaux
      ctx.fillStyle = '#ffd15a';
      ctx.beginPath();
      ctx.arc(0, 5, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22110a';
      ctx.fillRect(-10, 0, 6, 6);
      ctx.fillRect(4, 0, 6, 6);
      ctx.restore();

      ctx.font = '900 32px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'JUST VISITING', w / 2, 412, {
        depth: 3,
        faceColor: '#fffdf5',
        shadowColor: '#2b1206',
        outlineColor: '#0a0301',
        outlineWidth: 2.5
      });
    } else if (data.type === 'FREE_PARKING') {
      ctx.font = '900 40px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'FREE', w / 2, 75, {
        depth: 4,
        faceColor: '#e53935',
        shadowColor: '#3d0808',
        outlineColor: '#1c0303',
        outlineWidth: 3.5
      });
      this.draw3DExtrudedText(ctx, bctx, 'PARKING', w / 2, 125, {
        depth: 4,
        faceColor: '#ffffff',
        shadowColor: '#3d0808',
        outlineColor: '#1c0303',
        outlineWidth: 3.5
      });

      // Tasse de café / pause gourmande Bwed
      ctx.save();
      ctx.translate(w / 2, 275);
      // Médaillon
      ctx.fillStyle = '#ffd15a';
      ctx.beginPath();
      ctx.arc(0, 0, 72, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9e4e16';
      ctx.lineWidth = 4;
      ctx.stroke();
      // Tasse en porcelaine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 8, 38, 0, Math.PI);
      ctx.fill();
      // Anse
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(42, 8, 14, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      // Vapeur chaude
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3.5;
      [-15, 0, 15].forEach(sx => {
        ctx.beginPath();
        ctx.moveTo(sx, -8);
        ctx.bezierCurveTo(sx + 10, -20, sx - 10, -32, sx, -45);
        ctx.stroke();
      });
      ctx.restore();

      ctx.font = '900 28px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'TAKE A BREAK', w / 2, 415, {
        depth: 3,
        faceColor: '#ffd15a',
        shadowColor: '#2b1206',
        outlineColor: '#0a0301',
        outlineWidth: 2.5
      });
    } else if (data.type === 'GO_TO_JAIL') {
      ctx.font = '900 42px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'GO TO', w / 2, 75, {
        depth: 4,
        faceColor: '#d32f2f',
        shadowColor: '#3a0808',
        outlineColor: '#1a0303',
        outlineWidth: 3.5
      });
      this.draw3DExtrudedText(ctx, bctx, 'JAIL', w / 2, 125, {
        depth: 4,
        faceColor: '#ffffff',
        shadowColor: '#3a0808',
        outlineColor: '#1a0303',
        outlineWidth: 3.5
      });

      // Écusson d'officier de police & sirène d'alarme
      ctx.save();
      ctx.translate(w / 2, 275);
      // Bouclier étoilé
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#ffd15a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(55, -35);
      ctx.lineTo(45, 30);
      ctx.lineTo(0, 65);
      ctx.lineTo(-45, 30);
      ctx.lineTo(-55, -35);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Gyrophare rouge au centre
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -5, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.font = '900 30px "Outfit", sans-serif';
      this.draw3DExtrudedText(ctx, bctx, 'DIRECTLY TO JAIL', w / 2, 415, {
        depth: 3,
        faceColor: '#ffd15a',
        shadowColor: '#3a0808',
        outlineColor: '#1a0303',
        outlineWidth: 2.5
      });
    }
  }

  // ==========================================================================
  // DOUBLE SHOWROOM VITRINE (23 CHARACTERS + 21 BAKERY BUILDINGS)
  // Generous vertical shelf clearance: 2.55 units (no clipping / overlapping!)
  // ==========================================================================

  createDoubleShowroomVitrine() {
    this.showroomGroup = new THREE.Group();
    this.showroomGroup.name = 'DoubleShowroom';

    // Vitrine 1 (Gauche) : Les 24 Figurines de personnages (cadrées élégamment vers le centre)
    this.createCabinet({
      title: 'COLLECTOR FIGURINES (24 BWED CHARACTERS)',
      posX: -12.5,
      posZ: -12.5,
      rotY: 0.18,
      items: ALL_BWED_PAWNS,
      isPawnRoster: true
    });

    // Vitrine 2 (Droite) : Les 27 Bâtiments & Monuments Iconiques (27 assets 100% uniques)
    this.createCabinet({
      title: 'BWEDVERSE MONUMENTS & ARCHITECTURE (27 ASSETS)',
      posX: 12.5,
      posZ: -12.5,
      rotY: -0.18,
      items: BAKERY_BUILDINGS_PROPS,
      isPawnRoster: false
    });

    this.group.add(this.showroomGroup);
  }

  createCabinet({ title, posX, posZ, rotY, items, isPawnRoster }) {
    const cabinet = new THREE.Group();
    cabinet.position.set(posX, 0, posZ);
    cabinet.rotation.y = rotY;

    const cabWidth = 22.0;
    const cabHeight = 8.2;
    const cabDepth = 2.4;

    // Meuble acajou sombre
    const backMesh = new THREE.Mesh(
      new RoundedBoxGeometry(cabWidth, cabHeight, 0.35, 4, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.75 })
    );
    backMesh.position.set(0, cabHeight / 2, -cabDepth / 2);
    cabinet.add(backMesh);

    // Fronton doré gravé
    const banner = new THREE.Mesh(
      new RoundedBoxGeometry(cabWidth + 0.4, 0.85, cabDepth + 0.2, 4, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.88, roughness: 0.22 })
    );
    banner.position.set(0, cabHeight + 0.42, 0);
    cabinet.add(banner);

    // 3 Étagères avec 2.55 unités de hauteur libre
    const tierHeights = [0.85, 3.4, 5.95];
    tierHeights.forEach((y) => {
      const shelf = new THREE.Mesh(
        new RoundedBoxGeometry(cabWidth - 0.2, 0.18, cabDepth, 4, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x3d2517, roughness: 0.55 })
      );
      shelf.position.set(0, y, 0);
      cabinet.add(shelf);
    });

    // 1 seule source douce par vitrine (optimisation GPU majeure pour réduire la chauffe)
    const led = new THREE.PointLight(0xffeed4, 1.6, 20);
    led.position.set(0, 4.2, 1.8);
    cabinet.add(led);

    const perShelf = Math.ceil(items.length / 3);
    items.forEach((item, idx) => {
      const tierIdx = Math.floor(idx / perShelf);
      // Sur la vitrine de gauche, on oriente les premiers personnages (Toast Tycoon, Capitaine Pirate)
      // vers le bord intérieur (côté plateau), directement dans le champ de la caméra principale !
      const colIdx = isPawnRoster ? (perShelf - 1 - (idx % perShelf)) : (idx % perShelf);
      const shelfY = tierHeights[tierIdx];
      const spacingX = (cabWidth - 2.8) / Math.max(1, perShelf);
      const startX = -((perShelf - 1) * spacingX) / 2;
      const x = startX + colIdx * spacingX;

      const pedestal = new THREE.Group();
      pedestal.position.set(x, shelfY + 0.1, 0.2);

      // Socle circulaire poli
      const ped = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.78, 0.2, 32),
        new THREE.MeshStandardMaterial({ color: item.color || 0xd4af37, roughness: 0.3, metalness: 0.4 })
      );
      pedestal.add(ped);

      // Anneau lumineux doré
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.74, 0.025, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.1;
      pedestal.add(ring);

      // Plaque nominative
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 256;
      plaqueCanvas.height = 64;
      const pctx = plaqueCanvas.getContext('2d');
      pctx.fillStyle = '#1c120c';
      pctx.fillRect(0, 0, 256, 64);
      pctx.strokeStyle = '#d4af37';
      pctx.lineWidth = 4;
      pctx.strokeRect(2, 2, 252, 60);
      pctx.fillStyle = '#ffd15a';
      pctx.font = 'bold 20px "Outfit", sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText(item.name.toUpperCase(), 128, 40);

      const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.22),
        new THREE.MeshBasicMaterial({ map: plaqueTex })
      );
      plaque.position.set(0, 0.1, 0.76);
      plaque.rotation.x = -0.3;
      pedestal.add(plaque);

      // Charger le modèle GLB
      this.loader.load(item.file, (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Calibrage intelligent basé sur la PLUS GRANDE dimension (largeur, hauteur ou profondeur)
        // Évite TOUT débordement ou objet surdimensionné (banc pretzel, coaster, arbre, etc.)
        let targetBound = isPawnRoster ? 1.15 : 1.35;
        if (item.customScale) {
          targetBound = item.customScale; // Par exemple 0.72 pour Cozy Shiba !
        } else if (item.scale) {
          targetBound = item.scale;
        }

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = targetBound / Math.max(maxDim, 0.001);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -box.min.y * scale + 0.1, -center.z * scale);

        model.traverse((node) => {
          if (node.isMesh) {
            // Optimisation GPU thermique : les vitrines d'arrière-plan ne projettent pas d'ombre dynamique
            node.castShadow = false;
            node.receiveShadow = false;
          }
        });

        pedestal.add(model);

        // Si c'est Capitaine Pirate Bwed, équiper le tricorne doré, cache-œil et crochet authentiques
        if (item.isPirate || item.id === 'captain-bean') {
          const pirateGear = this.createPirateAccessories(scale);
          pedestal.add(pirateGear);
        }

        pedestal.userData = { item, model };
        if (isPawnRoster) {
          this.showcasePawns.push(pedestal);
        } else {
          this.showcaseBuildings.push(pedestal);
        }
      });

      cabinet.add(pedestal);
    });

    this.showroomGroup.add(cabinet);
  }

  // ==========================================================================
  // PROCEDURAL 3D PIRATE ACCESSORIES (TRICORNE HAT, EYEPATCH, GOLDEN HOOK)
  // Donne une silhouette pirate unique et emblématique au Capitaine Pirate Bwed
  // ==========================================================================

  createPirateAccessories(modelScale = 1.0) {
    const pirateGroup = new THREE.Group();
    pirateGroup.name = 'PirateAccessories';

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.92,
      roughness: 0.22
    });
    const leatherMat = new THREE.MeshStandardMaterial({
      color: 0x14100e,
      roughness: 0.72,
      metalness: 0.08
    });
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xb51a24,
      roughness: 0.55
    });

    // 1. Chapeau Tricorne de Flibustier (Triangular Pirate Tricorne)
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 1.22, -0.02);

    // Calotte centrale sombre
    const hatCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.42, 0.26, 16),
      leatherMat
    );
    hatCrown.position.y = 0.13;
    hatGroup.add(hatCrown);

    // Bord retroussé façon tricorne authentique à 3 pointes
    const brimGeo = new THREE.CylinderGeometry(0.72, 0.60, 0.10, 3, 1, false);
    const brim = new THREE.Mesh(brimGeo, leatherMat);
    brim.rotation.y = Math.PI / 6;
    brim.position.y = 0.06;
    hatGroup.add(brim);

    // Galon doré brodé longeant le bord extérieur du tricorne
    const brimTrimGeo = new THREE.TorusGeometry(0.64, 0.03, 6, 24);
    const brimTrim = new THREE.Mesh(brimTrimGeo, goldTrimMat);
    brimTrim.rotation.x = Math.PI / 2;
    brimTrim.position.y = 0.10;
    hatGroup.add(brimTrim);

    // Tête de mort & tibias croisés dorés sur le devant du tricorne
    const skullGroup = new THREE.Group();
    skullGroup.position.set(0, 0.15, 0.38);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), goldTrimMat);
    skullGroup.add(skull);

    const bone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 8), goldTrimMat);
    bone1.rotation.z = Math.PI / 4;
    bone1.position.y = -0.04;
    skullGroup.add(bone1);

    const bone2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 8), goldTrimMat);
    bone2.rotation.z = -Math.PI / 4;
    bone2.position.y = -0.04;
    skullGroup.add(bone2);

    hatGroup.add(skullGroup);

    // Ruban rouge pirate flottant à l'arrière
    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.02), ribbonMat);
    ribbon1.position.set(-0.36, -0.05, -0.16);
    ribbon1.rotation.z = 0.32;
    hatGroup.add(ribbon1);

    pirateGroup.add(hatGroup);

    // 2. Cache-œil de pirate noir & lanière de maintien
    const patchGroup = new THREE.Group();
    const eyepatch = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.82 })
    );
    eyepatch.scale.set(1.0, 1.0, 0.35);
    eyepatch.position.set(0.18, 0.98, 0.33);
    patchGroup.add(eyepatch);

    // Lanière élastique noire ceinturant la tête
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.39, 0.016, 6, 24),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
    );
    strap.rotation.x = Math.PI / 2.2;
    strap.rotation.z = -0.14;
    strap.position.set(0.06, 0.99, 0.06);
    patchGroup.add(strap);

    pirateGroup.add(patchGroup);

    // 3. Crochet doré de flibustier à la main gauche
    const hookGroup = new THREE.Group();
    hookGroup.position.set(-0.52, 0.50, 0.10);
    const hookBase = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.12, 12), goldTrimMat);
    hookGroup.add(hookBase);
    const hookCurve = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 8, 16, Math.PI * 1.3), goldTrimMat);
    hookCurve.position.set(0, -0.09, 0);
    hookCurve.rotation.z = Math.PI / 2;
    hookGroup.add(hookCurve);

    pirateGroup.add(hookGroup);

    return pirateGroup;
  }

  // ==========================================================================
  // REALISTIC ORTHOGONAL DICE PHYSICS
  // ==========================================================================

  init3DDiceArena() {
    this.diceHolder = new THREE.Group();
    this.diceSize = 0.84;
    this.dieRestY = this.arenaFloorY + this.diceSize / 2;

    this.dieMesh1 = this.createDieMesh();
    this.dieMesh1.position.set(-0.75, this.dieRestY, 0);
    this.diceHolder.add(this.dieMesh1);

    this.dieMesh2 = this.createDieMesh();
    this.dieMesh2.position.set(0.75, this.dieRestY, 0);
    this.diceHolder.add(this.dieMesh2);

    this.loader.load('./assets/buildings/bwed-dice.glb', (gltf) => {
      const d1 = gltf.scene.clone();
      const d2 = gltf.scene.clone();

      [d1, d2].forEach(d => {
        const box = new THREE.Box3().setFromObject(d);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = this.diceSize / Math.max(size.y, 0.001);
        d.scale.setScalar(scale);
        d.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
      });

      while (this.dieMesh1.children.length > 0) this.dieMesh1.remove(this.dieMesh1.children[0]);
      while (this.dieMesh2.children.length > 0) this.dieMesh2.remove(this.dieMesh2.children[0]);

      this.dieMesh1.add(d1);
      this.dieMesh2.add(d2);
    });

    this.group.add(this.diceHolder);
  }

  generateDiceFaceTexture(number) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#e0cbaf';
    ctx.lineWidth = 6;
    ctx.strokeRect(2, 2, 124, 124);

    ctx.fillStyle = '#ff6b35';
    const dot = (x, y) => {
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    };
    if (number === 1) dot(64, 64);
    else if (number === 2) { dot(36, 36); dot(92, 92); }
    else if (number === 3) { dot(36, 36); dot(64, 64); dot(92, 92); }
    else if (number === 4) { dot(36, 36); dot(92, 36); dot(36, 92); dot(92, 92); }
    else if (number === 5) { dot(36, 36); dot(92, 36); dot(64, 64); dot(36, 92); dot(92, 92); }
    else if (number === 6) { dot(36, 28); dot(92, 28); dot(36, 64); dot(92, 64); dot(36, 100); dot(92, 100); }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  createDieMesh() {
    const group = new THREE.Group();
    // Alignement parfait avec le repère normal : +X=3, -X=4, +Y=1, -Y=6, +Z=5, -Z=2
    const materials = [
      new THREE.MeshStandardMaterial({ map: this.generateDiceFaceTexture(3), roughness: 0.22, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ map: this.generateDiceFaceTexture(4), roughness: 0.22, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ map: this.generateDiceFaceTexture(1), roughness: 0.22, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ map: this.generateDiceFaceTexture(6), roughness: 0.22, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ map: this.generateDiceFaceTexture(5), roughness: 0.22, metalness: 0.08 }),
      new THREE.MeshStandardMaterial({ map: this.generateDiceFaceTexture(2), roughness: 0.22, metalness: 0.08 })
    ];
    const geo = new RoundedBoxGeometry(this.diceSize, this.diceSize, this.diceSize, 4, 0.12);
    const mesh = new THREE.Mesh(geo, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return group;
  }

  getDiceFaceRotation(faceValue) {
    // Calibrage exact selon la géométrie et normales des faces de bwed-dice.glb
    // Face 1 (+Y) -> Euler(0, 0, 0)
    // Face 2 (-Z) -> Euler(Math.PI / 2, 0, 0)
    // Face 3 (+X) -> Euler(0, 0, Math.PI / 2)
    // Face 4 (-X) -> Euler(0, 0, -Math.PI / 2)
    // Face 5 (+Z) -> Euler(-Math.PI / 2, 0, 0)
    // Face 6 (-Y) -> Euler(Math.PI, 0, 0)
    switch (faceValue) {
      case 1: return new THREE.Euler(0, 0, 0);
      case 2: return new THREE.Euler(Math.PI / 2, 0, 0);
      case 3: return new THREE.Euler(0, 0, Math.PI / 2);
      case 4: return new THREE.Euler(0, 0, -Math.PI / 2);
      case 5: return new THREE.Euler(-Math.PI / 2, 0, 0);
      case 6: return new THREE.Euler(Math.PI, 0, 0);
      default: return new THREE.Euler(0, 0, 0);
    }
  }

  rollDiceAnimation(d1, d2) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const duration = 1200;

      const targetEuler1 = this.getDiceFaceRotation(d1);
      const targetEuler2 = this.getDiceFaceRotation(d2);
      const targetQuat1 = new THREE.Quaternion().setFromEuler(targetEuler1);
      const targetQuat2 = new THREE.Quaternion().setFromEuler(targetEuler2);

      const targetX1 = -0.75;
      const targetX2 = 0.75;
      const targetZ1 = -0.15;
      const targetZ2 = 0.15;

      const spinAxis1 = new THREE.Vector3(1, 1.2, 0.4).normalize();
      const spinAxis2 = new THREE.Vector3(-0.8, 1.1, -0.9).normalize();

      const animate = (time) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const decay = Math.pow(1 - progress, 2);
        const bounce = Math.abs(Math.sin(progress * Math.PI * 5)) * 1.8 * decay;

        this.dieMesh1.position.y = this.dieRestY + bounce;
        this.dieMesh2.position.y = this.dieRestY + bounce;

        this.dieMesh1.position.x = THREE.MathUtils.lerp(-2.2, targetX1, progress);
        this.dieMesh2.position.x = THREE.MathUtils.lerp(2.2, targetX2, progress);
        this.dieMesh1.position.z = THREE.MathUtils.lerp(-1.0, targetZ1, progress);
        this.dieMesh2.position.z = THREE.MathUtils.lerp(-1.0, targetZ2, progress);

        if (progress < 0.7) {
          const spinSpeed1 = (1 - progress) * 0.42;
          const spinSpeed2 = (1 - progress) * 0.46;
          const deltaQ1 = new THREE.Quaternion().setFromAxisAngle(spinAxis1, spinSpeed1);
          const deltaQ2 = new THREE.Quaternion().setFromAxisAngle(spinAxis2, spinSpeed2);
          this.dieMesh1.quaternion.multiply(deltaQ1);
          this.dieMesh2.quaternion.multiply(deltaQ2);
        } else {
          // Alignement parfait et sans heurt par interpolation sphérique de quaternion (slerp)
          this.dieMesh1.quaternion.slerp(targetQuat1, 0.28);
          this.dieMesh2.quaternion.slerp(targetQuat2, 0.28);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.dieMesh1.position.set(targetX1, this.dieRestY, targetZ1);
          this.dieMesh2.position.set(targetX2, this.dieRestY, targetZ2);
          this.dieMesh1.quaternion.copy(targetQuat1);
          this.dieMesh2.quaternion.copy(targetQuat2);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  // ==========================================================================
  // 3D HOUSES & HOTELS
  // ==========================================================================

  updatePropertyBuildings(tileIndex, houseCount) {
    if (this.houseMeshes[tileIndex]) {
      this.houseMeshes[tileIndex].forEach(m => this.group.remove(m));
      delete this.houseMeshes[tileIndex];
    }
    if (houseCount <= 0) return;

    const coord = this.tileCoordinates[tileIndex];
    if (!coord) return;

    const meshes = [];
    const bannerLocalZ = -0.72; // Alignement sur la bande de couleur intérieure du titre de propriété

    if (houseCount === 5) {
      const hotel = new THREE.Mesh(
        new RoundedBoxGeometry(0.55, 0.42, 0.35, 4, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.28, metalness: 0.1 })
      );
      hotel.castShadow = true;
      hotel.receiveShadow = true;

      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(0.38, 0.22, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.35 })
      );
      roof.rotation.y = Math.PI / 4;
      roof.position.y = 0.32;
      hotel.add(roof);

      hotel.position.set(coord.x, this.tileHeight + 0.22, coord.z);
      hotel.rotation.y = coord.rotY;

      const offset = new THREE.Vector3(0, 0, bannerLocalZ).applyAxisAngle(new THREE.Vector3(0, 1, 0), coord.rotY);
      hotel.position.add(offset);

      this.group.add(hotel);
      meshes.push(hotel);
    } else {
      const count = houseCount;
      const spacing = 0.26;
      const startX = -((count - 1) * spacing) / 2;

      for (let h = 0; h < count; h++) {
        const house = new THREE.Mesh(
          new RoundedBoxGeometry(0.22, 0.24, 0.22, 4, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.35, metalness: 0.1 })
        );
        house.castShadow = true;
        house.receiveShadow = true;

        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.14, 4),
          new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.4 })
        );
        roof.rotation.y = Math.PI / 4;
        roof.position.y = 0.18;
        house.add(roof);

        const localPos = new THREE.Vector3(startX + h * spacing, this.tileHeight + 0.12, bannerLocalZ);
        localPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), coord.rotY);
        house.position.set(coord.x + localPos.x, localPos.y, coord.z + localPos.z);
        house.rotation.y = coord.rotY;

        this.group.add(house);
        meshes.push(house);
      }
    }

    this.houseMeshes[tileIndex] = meshes;
  }

  getTileWorldPosition(tileIndex) {
    const coord = this.tileCoordinates[tileIndex % 40];
    if (!coord) return new THREE.Vector3(0, 0.5, 0);
    return new THREE.Vector3(coord.x, this.tileHeight + 0.06, coord.z);
  }

  update(delta) {
    const time = Date.now() * 0.001;
    this.frameCounter = (this.frameCounter || 0) + 1;

    // 1. Dérive dynamique de la mosaïque Bwedverse sur le sol de l'arène (Direct GPU)
    if (this.mosaicTexture) {
      this.mosaicTexture.offset.x += delta * 0.012;
      this.mosaicTexture.offset.y += delta * 0.006;
    }

    // 2. Vitrines : rotations idles douces cadencées (1 frame sur 2 pour diviser la charge de calcul matriciel)
    if (this.frameCounter % 2 === 0) {
      this.showcasePawns.forEach((p, idx) => {
        if (p.userData?.model) {
          p.userData.model.rotation.y = Math.sin(time + idx * 0.4) * 0.25;
        }
      });
      this.showcaseBuildings.forEach((b, idx) => {
        if (b.userData?.model) {
          b.userData.model.rotation.y += delta * 0.35;
        }
      });
    }

    // 3. Dérive douce des micro-particules dorées de farine (envoi GPU cadencé 1 frame sur 3 pour réduire le bus CPU-GPU)
    if (this.flourParticles && this.frameCounter % 3 === 0) {
      const pos = this.flourParticles.geometry.attributes.position.array;
      const count = pos.length / 3;
      const t = Date.now() * 0.0006;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(t + i) * 0.006;
        pos[i * 3 + 0] += Math.cos(t + i * 0.6) * 0.004;
        if (pos[i * 3 + 1] > 6.2) pos[i * 3 + 1] = 0.8;
        if (pos[i * 3 + 1] < 0.8) pos[i * 3 + 1] = 6.2;
      }
      this.flourParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Scène de victoire Endgame : Cotillons en cascade & Danse de victoire du pion #1
    if (this.isCelebrating) {
      if (this.winnerPawnInstance && this.winnerPawnInstance.group) {
        const bounce = Math.abs(Math.sin(time * 5.5)) * 0.35;
        this.winnerPawnInstance.group.position.y = (this.arenaFloorY + 4.38) + bounce;
        if (this.winnerPawnInstance.meshContainer) {
          this.winnerPawnInstance.meshContainer.rotation.y += delta * 3.5;
        }
      }

      if (this.confettiGroup && this.confettiParticles) {
        this.confettiParticles.forEach(c => {
          c.mesh.position.y -= c.speedY * delta;
          c.mesh.position.x += Math.sin(time * 3 + c.seed) * c.driftX * delta;
          c.mesh.position.z += Math.cos(time * 2.5 + c.seed) * c.driftZ * delta;
          c.mesh.rotation.x += c.rotX;
          c.mesh.rotation.y += c.rotY;
          c.mesh.rotation.z += c.rotZ;

          if (c.mesh.position.y < this.arenaFloorY + 0.1) {
            c.mesh.position.y = this.arenaFloorY + 5.5 + Math.random() * 3.5;
            c.mesh.position.x = (Math.random() - 0.5) * 4.5;
            c.mesh.position.z = (Math.random() - 0.5) * 4.5;
          }
        });
      }
    }
  }
}
