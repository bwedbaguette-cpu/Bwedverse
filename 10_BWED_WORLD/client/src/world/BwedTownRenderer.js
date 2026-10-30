import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TILE_TYPES, COLLISION, gridToWorldPos } from './BwedTownMapData.js';
import { AvatarModel } from '../entities/AvatarModel.js';

/* ==========================================================================
   BWEDTOWN RENDERER V3 (STYLE POKÉMON DS GRAND FORMAT)
   - Échelle proportionnelle monumentale des bâtiments (remplissage 95% de l'empreinte)
   - Particules d'ambiance (étincelles de fontaine & feuilles au vent)
   - 10 Croissants Dorés à collectionner (Mini-jeu fun avec son & lueur)
   - Éclairage Nintendo DS chaud, brume douce et lanternes vivantes
   ========================================================================== */

export class BwedTownRenderer {
  constructor(scene, mapData, onCoinCollected = null, collectedCoinIds = []) {
    this.scene = scene;
    this.mapData = mapData;
    this.onCoinCollected = onCoinCollected;
    this.collectedCoinIds = collectedCoinIds || [];

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'BwedTown_WorldRoot';
    this.scene.add(this.rootGroup);

    this.buildingsGroup = new THREE.Group();
    this.buildingsGroup.name = 'BwedTown_BuildingsGroup';
    this.rootGroup.add(this.buildingsGroup);

    this.gltfLoader = new GLTFLoader();
    this.modelCache = new Map();

    this.groundMesh = null;
    this.animatedMarkers = [];
    this.npcAvatars = [];
    this.pointLights = [];
    this.ambientParticles = [];
    this.collectibleCoins = [];

    this.setupAtmosphere();
    this.initLighting();
    this.buildGround();
    this.buildPerimeterHedges();
    this.instantiateBuildings();
    this.instantiateStreetLamps();
    this.instantiateBillboards();
    this.instantiateCollectibles();
    this.instantiateAmbientParticles();
    this.instantiateNpcs();
  }

  setupAtmosphere() {
    this.scene.background = new THREE.Color(0xf6ede0);
    this.scene.fog = new THREE.Fog(0xf6ede0, 48, 95);
  }

  initLighting() {
    const ambientLight = new THREE.AmbientLight(0xfff3db, 0.95);
    this.rootGroup.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfffae8, 0x86b054, 0.6);
    this.rootGroup.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaea, 1.45);
    sunLight.position.set(32, 48, 26);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.bias = -0.0004;

    const d = 34;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;

    this.rootGroup.add(sunLight);
    this.sunLight = sunLight;
  }

  generateGroundTexture() {
    const { width, height } = this.mapData.config;
    const pixelsPerTile = 64; // 2048x2048 haute définition pour les textures d'art Nintendo DS
    const canvas = document.createElement('canvas');
    canvas.width = width * pixelsPerTile;
    canvas.height = height * pixelsPerTile;
    const ctx = canvas.getContext('2d');

    // 1. Passe initiale rapide de secours (palette chaleureuse immédiate)
    this.renderFallbackGround(ctx, width, height, pixelsPerTile);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    // 2. Chargement des textures artistiques authentiques préparées par l'équipe
    const textureSources = {
      grass: './assets/textures/55-tex-matcha-moss.png',
      cobble: './assets/textures/29-tex-cobble-biscuit.png',
      plaza: './assets/textures/58-tex-pastel-macaron-tiles.png',
      wood: './assets/textures/60-tex-wood-cutting-board.png',
      choco: './assets/textures/32-tex-melted-choco.png',
      dirt: './assets/textures/30-tex-brioche-crumb.png',
      wall: './assets/textures/100-tex-gingerbread-brick-wall.png'
    };

    const loadedImages = {};
    let pending = Object.keys(textureSources).length;

    const onImageLoaded = () => {
      pending--;
      if (pending === 0) {
        this.renderArtGround(ctx, width, height, pixelsPerTile, loadedImages);
        texture.needsUpdate = true;
      }
    };

    for (const [key, src] of Object.entries(textureSources)) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        loadedImages[key] = img;
        onImageLoaded();
      };
      img.onerror = () => {
        console.warn(`[BwedTownRenderer] Échec chargement texture ${src}`);
        onImageLoaded();
      };
      img.src = src;
    }

    return texture;
  }

  renderFallbackGround(ctx, width, height, pixelsPerTile) {
    const C = {
      grass1: '#689635',
      grass2: '#5b832e',
      cobbleJoint: '#caa467',
      cobbleBase: '#ebd59e',
      plazaBase: '#f4c44e',
      woodBase: '#9a4714',
      chocoBase: '#3c1d11'
    };

    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const tileType = this.mapData.tiles[z][x];
        const px = x * pixelsPerTile;
        const py = z * pixelsPerTile;

        switch (tileType) {
          case TILE_TYPES.COBBLE_BEURRE:
            ctx.fillStyle = C.cobbleBase;
            ctx.fillRect(px, py, pixelsPerTile, pixelsPerTile);
            break;
          case TILE_TYPES.PLAZA_GOLD:
            ctx.fillStyle = C.plazaBase;
            ctx.fillRect(px, py, pixelsPerTile, pixelsPerTile);
            break;
          case TILE_TYPES.WOOD_DECK:
            ctx.fillStyle = C.woodBase;
            ctx.fillRect(px, py, pixelsPerTile, pixelsPerTile);
            break;
          case TILE_TYPES.CHOCO_WATER:
            ctx.fillStyle = C.chocoBase;
            ctx.fillRect(px, py, pixelsPerTile, pixelsPerTile);
            break;
          default:
            ctx.fillStyle = (x + z) % 2 === 0 ? C.grass1 : C.grass2;
            ctx.fillRect(px, py, pixelsPerTile, pixelsPerTile);
            break;
        }
      }
    }
  }

  renderArtGround(ctx, width, height, pixelsPerTile, imgs) {
    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        const tileType = this.mapData.tiles[z][x];
        const px = x * pixelsPerTile;
        const py = z * pixelsPerTile;

        switch (tileType) {
          case TILE_TYPES.COBBLE_BEURRE:
            if (imgs.cobble) {
              ctx.drawImage(imgs.cobble, 0, 0, imgs.cobble.width, imgs.cobble.height, px, py, pixelsPerTile, pixelsPerTile);
            }
            break;

          case TILE_TYPES.PLAZA_GOLD:
            if (imgs.plaza) {
              ctx.drawImage(imgs.plaza, 0, 0, imgs.plaza.width, imgs.plaza.height, px, py, pixelsPerTile, pixelsPerTile);
            } else if (imgs.cobble) {
              ctx.drawImage(imgs.cobble, 0, 0, imgs.cobble.width, imgs.cobble.height, px, py, pixelsPerTile, pixelsPerTile);
            }
            break;

          case TILE_TYPES.WOOD_DECK:
            if (imgs.wood) {
              ctx.drawImage(imgs.wood, 0, 0, imgs.wood.width, imgs.wood.height, px, py, pixelsPerTile, pixelsPerTile);
            }
            break;

          case TILE_TYPES.CHOCO_WATER:
            if (imgs.choco) {
              ctx.drawImage(imgs.choco, 0, 0, imgs.choco.width, imgs.choco.height, px, py, pixelsPerTile, pixelsPerTile);
            }
            break;

          case TILE_TYPES.DIRT_PATH:
            if (imgs.dirt) {
              ctx.drawImage(imgs.dirt, 0, 0, imgs.dirt.width, imgs.dirt.height, px, py, pixelsPerTile, pixelsPerTile);
            }
            break;

          case TILE_TYPES.HEDGE_BORDER:
            if (imgs.wall) {
              ctx.drawImage(imgs.wall, 0, 0, imgs.wall.width, imgs.wall.height, px, py, pixelsPerTile, pixelsPerTile);
            } else if (imgs.grass) {
              ctx.drawImage(imgs.grass, 0, 0, imgs.grass.width, imgs.grass.height, px, py, pixelsPerTile, pixelsPerTile);
            }
            break;

          case TILE_TYPES.GRASS_MATCHA:
          default:
            if (imgs.grass) {
              // Échantillonnage variable dans la texture 384x384 pour casser la monotonie et créer un champ vivant
              const srcSize = 192;
              const ox = ((x * 47 + z * 31) % 2) * (imgs.grass.width - srcSize);
              const oy = ((x * 23 + z * 59) % 2) * (imgs.grass.height - srcSize);
              ctx.drawImage(imgs.grass, ox, oy, srcSize, srcSize, px, py, pixelsPerTile, pixelsPerTile);

              // Petites fleurs dorées mignonnes dispersées
              if ((x * 13 + z * 17) % 7 === 0) {
                ctx.fillStyle = '#ffe57f';
                ctx.fillRect(px + 40, py + 32, 8, 8);
                ctx.fillStyle = '#f59e0b';
                ctx.fillRect(px + 42, py + 34, 4, 4);
              }
            }
            break;
        }

        // Bordures et trottoirs sablés de beurre doux (Transition DS)
        const isRoadOrPlaza = tileType === TILE_TYPES.COBBLE_BEURRE || tileType === TILE_TYPES.PLAZA_GOLD || tileType === TILE_TYPES.WOOD_DECK;
        if (isRoadOrPlaza) {
          const curbColor = '#d99a4e';
          const curbHi = '#fde68a';
          const curbW = 4;

          // Gauche
          if (x > 0 && this.mapData.tiles[z][x - 1] === TILE_TYPES.GRASS_MATCHA) {
            ctx.fillStyle = curbColor;
            ctx.fillRect(px, py, curbW, pixelsPerTile);
            ctx.fillStyle = curbHi;
            ctx.fillRect(px, py, 1, pixelsPerTile);
          }
          // Droite
          if (x < width - 1 && this.mapData.tiles[z][x + 1] === TILE_TYPES.GRASS_MATCHA) {
            ctx.fillStyle = curbColor;
            ctx.fillRect(px + pixelsPerTile - curbW, py, curbW, pixelsPerTile);
            ctx.fillStyle = curbHi;
            ctx.fillRect(px + pixelsPerTile - 1, py, 1, pixelsPerTile);
          }
          // Haut
          if (z > 0 && this.mapData.tiles[z - 1][x] === TILE_TYPES.GRASS_MATCHA) {
            ctx.fillStyle = curbColor;
            ctx.fillRect(px, py, pixelsPerTile, curbW);
            ctx.fillStyle = curbHi;
            ctx.fillRect(px, py, pixelsPerTile, 1);
          }
          // Bas
          if (z < height - 1 && this.mapData.tiles[z + 1][x] === TILE_TYPES.GRASS_MATCHA) {
            ctx.fillStyle = curbColor;
            ctx.fillRect(px, py + pixelsPerTile - curbW, pixelsPerTile, curbW);
            ctx.fillStyle = curbHi;
            ctx.fillRect(px, py + pixelsPerTile - 1, pixelsPerTile, 1);
          }
        }
      }
    }
  }

  buildGround() {
    const { totalWidth, totalHeight } = this.mapData.config;
    const groundGeo = new THREE.PlaneGeometry(totalWidth, totalHeight);
    const groundTex = this.generateGroundTexture();

    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.05
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.set(0, 0, 0);
    this.groundMesh.receiveShadow = true;
    this.rootGroup.add(this.groundMesh);
  }

  buildPerimeterHedges() {
    const { width, height, tileSize } = this.mapData.config;
    const hedgeGeo = new THREE.BoxGeometry(tileSize * 0.95, 1.4, tileSize * 0.95);
    const hedgeMat = new THREE.MeshStandardMaterial({
      color: 0x3d611f,
      roughness: 0.75
    });

    const hedgesGroup = new THREE.Group();

    for (let z = 0; z < height; z++) {
      for (let x = 0; x < width; x++) {
        if (x === 0 || x === width - 1 || z === 0 || z === height - 1) {
          if ((x === 15 || x === 16) && (z === 0 || z === height - 1)) continue;
          if ((z === 15 || z === 16) && (x === 0 || x === width - 1)) continue;

          const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
          const wpos = gridToWorldPos(x, z, 0.7);
          hedge.position.set(wpos.x, wpos.y, wpos.z);
          hedge.castShadow = true;
          hedge.receiveShadow = true;
          hedgesGroup.add(hedge);
        }
      }
    }
    this.rootGroup.add(hedgesGroup);
  }

  /**
   * Instancie les Lampadaires en Pot de Miel (.glb réel)
   * Éclairage public ambré et féerique pour les boulevards et la Grand-Place
   */
  instantiateStreetLamps() {
    const lampPositions = [
      { gx: 12, gz: 12 },
      { gx: 19, gz: 12 },
      { gx: 12, gz: 19 },
      { gx: 19, gz: 19 },
      { gx: 15, gz: 7 },
      { gx: 15, gz: 24 },
      { gx: 8, gz: 15 },
      { gx: 22, gz: 15 }
    ];

    const modelPath = './assets/props/honey-lantern.glb';

    this.loadModel(modelPath, (gltfScene) => {
      const rawBbox = new THREE.Box3().setFromObject(gltfScene);
      const rawSize = new THREE.Vector3();
      rawBbox.getSize(rawSize);
      const minY = rawBbox.min.y;

      const targetHeight = 2.4; // Hauteur idéale de lampadaire urbain BwedTown
      const lampScale = targetHeight / Math.max(rawSize.y, 0.1);

      for (const pos of lampPositions) {
        const lampGroup = new THREE.Group();
        const wpos = gridToWorldPos(pos.gx, pos.gz, 0);

        // Socle stylisé en pierre biscuit sablé
        const plinthGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.22, 12);
        const plinthMat = new THREE.MeshStandardMaterial({
          color: 0x452915,
          roughness: 0.8
        });
        const plinth = new THREE.Mesh(plinthGeo, plinthMat);
        plinth.position.y = 0.11;
        plinth.receiveShadow = true;
        lampGroup.add(plinth);

        // Instance du modèle GLB réel
        const instance = gltfScene.clone(true);
        instance.scale.setScalar(lampScale);
        instance.position.y = -minY * lampScale + 0.18; // Posé fermement sur le socle

        instance.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = 0.38;
              child.material.emissive = new THREE.Color(0xff9900);
              child.material.emissiveIntensity = 0.55;
            }
          }
        });

        lampGroup.add(instance);
        lampGroup.position.set(wpos.x, 0, wpos.z);
        this.rootGroup.add(lampGroup);

        // Lumière ponctuelle chaleureuse ambrée
        const light = new THREE.PointLight(0xffbe53, 1.6, 9.5);
        light.position.set(wpos.x, 2.2, wpos.z);
        this.rootGroup.add(light);
        this.pointLights.push(light);
      }
    });
  }

  /**
   * Instancie les Grandes Affiches 3D du village (Roadmap, Gazette, Tournois)
   * Panneaux d'affichage diorama avec toiles dynamiques haute résolution et spot d'éclairage
   */
  instantiateBillboards() {
    const billboardConfigs = [
      {
        id: 'billboard_grand_place',
        gx: 18,
        gz: 11,
        facing: 'south',
        headline: 'GAZETTE & ROADMAP 2026',
        sub: '3D Pokémon DS Hub • Multiplayer',
        category: 'roadmap',
        title: 'Town Hall Grand Notice Board'
      },
      {
        id: 'billboard_residential',
        gx: 7,
        gz: 6,
        facing: 'south',
        headline: 'RESIDENTIAL DISTRICT',
        sub: 'Milk Carton Lofts & Room Decor',
        category: 'community',
        title: 'Residents Notice Board'
      },
      {
        id: 'billboard_arcade',
        gx: 21,
        gz: 20,
        facing: 'west',
        headline: 'ARCADE & TOURNAMENTS',
        sub: 'BwedTris 3D & Donut Fair',
        category: 'events',
        title: 'Tournaments Billboard'
      }
    ];

    for (const b of billboardConfigs) {
      const wpos = gridToWorldPos(b.gx, b.gz, 0);
      const boardGroup = this.createBillboard3D(b);
      boardGroup.position.set(wpos.x, 0, wpos.z);

      if (b.facing === 'west') {
        boardGroup.rotation.y = Math.PI / 2;
      } else if (b.facing === 'east') {
        boardGroup.rotation.y = -Math.PI / 2;
      } else if (b.facing === 'north') {
        boardGroup.rotation.y = Math.PI;
      }

      this.rootGroup.add(boardGroup);
    }
  }

  createBillboard3D(b) {
    const group = new THREE.Group();
    group.name = `Billboard_${b.id}`;

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x4a2a16,
      roughness: 0.75,
      metalness: 0.1
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.5,
      roughness: 0.3,
      emissive: 0xd97706,
      emissiveIntensity: 0.35
    });

    // 1. Poteaux latéraux
    const postGeo = new THREE.BoxGeometry(0.18, 2.5, 0.18);
    const postL = new THREE.Mesh(postGeo, woodMat);
    postL.position.set(-1.05, 1.25, 0);
    postL.castShadow = true;
    group.add(postL);

    const postR = new THREE.Mesh(postGeo, woodMat);
    postR.position.set(1.05, 1.25, 0);
    postR.castShadow = true;
    group.add(postR);

    // Embases en pierre de chocolat
    const baseGeo = new THREE.BoxGeometry(0.32, 0.25, 0.32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.85 });
    const baseL = new THREE.Mesh(baseGeo, baseMat);
    baseL.position.set(-1.05, 0.125, 0);
    group.add(baseL);

    const baseR = new THREE.Mesh(baseGeo, baseMat);
    baseR.position.set(1.05, 0.125, 0);
    group.add(baseR);

    // 2. Panneau arrière en bois
    const backGeo = new THREE.BoxGeometry(2.2, 1.55, 0.1);
    const backMesh = new THREE.Mesh(backGeo, woodMat);
    backMesh.position.set(0, 1.55, -0.02);
    backMesh.castShadow = true;
    group.add(backMesh);

    // 3. Toiture biseautée au sommet
    const roofGeo = new THREE.ConeGeometry(1.35, 0.45, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.15, 1, 0.35);
    roof.position.set(0, 2.45, 0);
    roof.castShadow = true;
    group.add(roof);

    // Écusson doré gravé
    const crestGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 16);
    const crest = new THREE.Mesh(crestGeo, goldMat);
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 2.45, 0.14);
    group.add(crest);

    // 4. Affiche dynamique Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 680;
    const ctx = canvas.getContext('2d');
    this.drawBillboardPosterCanvas(ctx, b);

    const posterTex = new THREE.CanvasTexture(canvas);
    posterTex.magFilter = THREE.LinearFilter;
    posterTex.minFilter = THREE.LinearMipmapLinearFilter;
    posterTex.generateMipmaps = true;

    const posterMat = new THREE.MeshStandardMaterial({
      map: posterTex,
      roughness: 0.55,
      metalness: 0.05
    });

    const posterGeo = new THREE.PlaneGeometry(2.0, 1.35);
    const posterMesh = new THREE.Mesh(posterGeo, posterMat);
    posterMesh.position.set(0, 1.55, 0.04);
    posterMesh.castShadow = true;
    group.add(posterMesh);

    // 5. Petit lampadaire chapeauté sur le panneau
    const hoodGeo = new THREE.ConeGeometry(0.18, 0.14, 8);
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
    const hood = new THREE.Mesh(hoodGeo, hoodMat);
    hood.position.set(0, 2.3, 0.22);
    group.add(hood);

    const spot = new THREE.PointLight(0xfffae0, 1.3, 5.0);
    spot.position.set(0, 2.1, 0.35);
    group.add(spot);
    this.pointLights.push(spot);

    // 6. Ombre au sol
    const shadowGeo = new THREE.PlaneGeometry(2.4, 0.7);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x180f05,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.02, 0);
    group.add(shadow);

    return group;
  }

  drawBillboardPosterCanvas(ctx, b) {
    const w = 1024;
    const h = 680;

    // Fond parchemin sablé
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(1, '#fef3c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Texture grain parchemin
    ctx.fillStyle = 'rgba(217, 119, 6, 0.04)';
    for (let i = 0; i < 400; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, Math.random() * 4 + 1, Math.random() * 4 + 1);
    }

    // Bordure dorée rétro double
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 14;
    ctx.strokeRect(16, 16, w - 32, h - 32);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 28, w - 56, h - 56);

    // Bandeau d'en-tête officiel
    ctx.fillStyle = '#451a03';
    ctx.fillRect(36, 36, w - 72, 85);

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🥐 BWEDTOWN CHRONICLE • OFFICIAL BULLETIN 🥐', w / 2, 88);

    // Grand titre de l'affiche
    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(b.headline, w / 2, 195);

    // Sous-titre
    ctx.fillStyle = '#92400e';
    ctx.font = 'italic 26px sans-serif';
    ctx.fillText(b.sub, w / 2, 240);

    // Ligne séparatrice décorative
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 265);
    ctx.lineTo(w - 120, 265);
    ctx.stroke();

    // 3 Colonnes d'annonces
    const cardY = 295;
    const cardH = 220;
    const cardW = 270;
    const cards = [
      {
        badge: 'PHASE 1 & 2',
        title: '3D WORLD & DIORAMA',
        desc: 'Three.js 60 FPS • 32x32 Grid • Shiba Buddy & Avatars'
      },
      {
        badge: 'PHASE 3',
        title: 'PRIVATE ROOMS',
        desc: 'Habbo Residence • Room Decor • JSON Save'
      },
      {
        badge: 'PHASE 4 & 5',
        title: 'MULTI & TOURNAMENTS',
        desc: 'Chat Bubbles • BwedTris Arcade • Live Events'
      }
    ];

    cards.forEach((c, i) => {
      const cx = 75 + i * (cardW + 45);

      ctx.fillStyle = 'rgba(254, 243, 199, 0.85)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fillRect(cx, cardY, cardW, cardH);
      ctx.strokeRect(cx, cardY, cardW, cardH);

      // Badge
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx + 20, cardY + 18, cardW - 40, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(c.badge, cx + cardW / 2, cardY + 40);

      // Titre
      ctx.fillStyle = '#451a03';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(c.title, cx + cardW / 2, cardY + 92);

      // Description
      ctx.fillStyle = '#78350f';
      ctx.font = '16px sans-serif';
      const words = c.desc.split('•');
      words.forEach((line, li) => {
        ctx.fillText(line.trim(), cx + cardW / 2, cardY + 135 + li * 28);
      });
    });

    // Bandeau d'action inférieur
    ctx.fillStyle = '#b45309';
    ctx.fillRect(60, 545, w - 120, 75);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('⚡ PRESS [SPACE] TO INSPECT FULL NOTICE BOARD ⚡', w / 2, 592);
  }

  /**
   * Instancie les 10 Croissants Dorés à collecter dans la ville
   */
  instantiateCollectibles() {
    const coinPositions = [
      { id: 1, gx: 15, gz: 14, label: 'North Fountain' },
      { id: 2, gx: 16, gz: 18, label: 'South Fountain' },
      { id: 3, gx: 5, gz: 5, label: 'Residence Terrace' },
      { id: 4, gx: 25, gz: 4, label: 'Tavern Garden' },
      { id: 5, gx: 28, gz: 11, label: 'Fashion Boulevard' },
      { id: 6, gx: 25, gz: 23, label: 'Arcade Podium' },
      { id: 7, gx: 28, gz: 28, label: 'Donut Track' },
      { id: 8, gx: 4, gz: 23, label: 'Tea Gazebo' },
      { id: 9, gx: 5, gz: 29, label: 'Celestial Portal' },
      { id: 10, gx: 15, gz: 4, label: 'Grand North Avenue' }
    ];

    const coinGeo = new THREE.TorusGeometry(0.28, 0.1, 8, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.2
    });

    for (const c of coinPositions) {
      const isAlreadyCollected = this.collectedCoinIds.includes(c.id);
      const wpos = gridToWorldPos(c.gx, c.gz, 0.6);

      let mesh = null;
      if (!isAlreadyCollected) {
        mesh = new THREE.Mesh(coinGeo, coinMat);
        mesh.position.set(wpos.x, wpos.y, wpos.z);
        mesh.rotation.y = Math.random() * Math.PI;
        this.rootGroup.add(mesh);
      }

      this.collectibleCoins.push({
        id: c.id,
        gx: c.gx,
        gz: c.gz,
        mesh,
        collected: isAlreadyCollected,
        wpos,
        baseY: 0.6
      });
    }
  }

  /**
   * Particules d'ambiance féeriques (étincelles dorées et feuilles matcha)
   */
  instantiateAmbientParticles() {
    // 30 particules dorées autour de la fontaine
    const goldGeo = new THREE.DodecahedronGeometry(0.08);
    const goldMat = new THREE.MeshBasicMaterial({ color: 0xffdf6d });
    for (let i = 0; i < 30; i++) {
      const p = new THREE.Mesh(goldGeo, goldMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 1.0 + Math.random() * 4.0;
      p.position.set(Math.cos(angle) * dist, 0.4 + Math.random() * 3.5, Math.sin(angle) * dist);
      this.rootGroup.add(p);
      this.ambientParticles.push({
        mesh: p,
        type: 'fountain',
        speedY: 0.2 + Math.random() * 0.3,
        orbitAngle: angle,
        orbitDist: dist,
        orbitSpeed: 0.3 + Math.random() * 0.4
      });
    }

    // 25 feuilles matcha flottant dans le parc Sud-Ouest
    const leafGeo = new THREE.PlaneGeometry(0.14, 0.08);
    const leafMat = new THREE.MeshBasicMaterial({ color: 0x86efac, side: THREE.DoubleSide });
    for (let i = 0; i < 25; i++) {
      const p = new THREE.Mesh(leafGeo, leafMat);
      p.position.set(-16 + Math.random() * 10, 0.3 + Math.random() * 3.0, 14 + Math.random() * 12);
      this.rootGroup.add(p);
      this.ambientParticles.push({
        mesh: p,
        type: 'leaf',
        rotSpeed: 1.5 + Math.random() * 2.0,
        swaySpeed: 1.2 + Math.random() * 1.5,
        baseX: p.position.x
      });
    }
  }

  /**
   * Instancie les bâtiments avec ÉCHELLE PROPORTIONNELLE MAJESTUEUSE
   * Chaque bâtiment remplit entre 88% et 95% de son empreinte en cases !
   */
  instantiateBuildings() {
    const { tileSize, totalWidth, totalHeight } = this.mapData.config;

    for (const bldg of this.mapData.buildings) {
      if (bldg.type === 'billboard' || !bldg.model) continue;
      const { gridX, gridZ, footprint, model, rotationY = 0, yOffset = 0 } = bldg;

      const centerX = (gridX + footprint.w / 2) * tileSize - totalWidth / 2;
      const centerZ = (gridZ + footprint.h / 2) * tileSize - totalHeight / 2;

      // Ombre portée sous le bâtiment couvrant toute l'empreinte
      const shadowW = footprint.w * tileSize * 0.98;
      const shadowH = footprint.h * tileSize * 0.98;
      const shadowGeo = new THREE.PlaneGeometry(shadowW, shadowH);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x180f05,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
      });
      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.rotation.x = -Math.PI / 2;
      shadowMesh.position.set(centerX, 0.02, centerZ);
      this.buildingsGroup.add(shadowMesh);

      const filePath = `./assets/props/${model}`;

      this.loadModel(filePath, (gltfScene) => {
        const instance = gltfScene.clone(true);

        // 1. Calcul de la Bounding Box brute du modèle
        const rawBbox = new THREE.Box3().setFromObject(instance);
        const rawSize = new THREE.Vector3();
        rawBbox.getSize(rawSize);

        // 2. Largeur et profondeur cibles sur la grille (90-95% de l'empreinte en cases)
        const targetW = footprint.w * tileSize * 0.94;
        const targetD = footprint.h * tileSize * 0.94;

        // Facteur d'échelle automatique pour que le bâtiment remplisse fièrement son quartier !
        const autoScaleX = targetW / Math.max(rawSize.x, 0.1);
        const autoScaleZ = targetD / Math.max(rawSize.z, 0.1);
        let finalScale = Math.min(autoScaleX, autoScaleZ);

        // Pour les petits accessoires (bancs, chariots, lanternes, cubes de pain), préserver l'échelle humaine
        if (bldg.footprint.w <= 2 && bldg.footprint.h <= 1) {
          finalScale = bldg.scale || 1.0;
        }

        instance.scale.setScalar(finalScale);

        // 3. Recalcul après mise à l'échelle pour ancrage strict au sol et centrage
        const scaledBbox = new THREE.Box3().setFromObject(instance);
        const center = new THREE.Vector3();
        scaledBbox.getCenter(center);

        instance.position.set(
          centerX - (center.x - instance.position.x),
          -scaledBbox.min.y + yOffset,
          centerZ - (center.z - instance.position.z)
        );
        instance.rotation.y = rotationY;

        // 4. Cel-shading et ombres douces
        instance.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = Math.max(0.38, child.material.roughness ?? 0.6);
              child.material.metalness = Math.min(0.12, child.material.metalness ?? 0.05);
            }
          }
        });

        // 5. Effets lumineux dynamiques pour les objets spéciaux
        if (bldg.id === 'campfire_marshmallow_1') {
          const fireLight = new THREE.PointLight(0xf97316, 2.2, 7.5);
          fireLight.position.set(centerX, 0.8, centerZ);
          this.buildingsGroup.add(fireLight);
          this.pointLights.push(fireLight);
        } else if (bldg.model === 'pistachio-glow.glb') {
          const glowLight = new THREE.PointLight(0x86efac, 0.7, 3.2);
          glowLight.position.set(centerX, 0.6, centerZ);
          this.buildingsGroup.add(glowLight);
          this.pointLights.push(glowLight);
        }

        // 6. Optimisation CPU : désactivation des recalculs matriciels inutiles sur les objets statiques
        instance.matrixAutoUpdate = false;
        instance.updateMatrix();

        this.buildingsGroup.add(instance);
      });

      // Balise de porte animée
      if (bldg.door) {
        this.createDoorMarker(bldg.door.triggerX, bldg.door.triggerZ, bldg.name);
      }
    }
  }

  createDoorMarker(gx, gz, name) {
    const markerGroup = new THREE.Group();
    const wpos = gridToWorldPos(gx, gz, 0.1);
    markerGroup.position.set(wpos.x, 0.2, wpos.z);

    const coneGeo = new THREE.ConeGeometry(0.24, 0.46, 8);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xffd147 });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.rotation.x = Math.PI;
    coneMesh.position.y = 1.6;
    markerGroup.add(coneMesh);

    const ringGeo = new THREE.RingGeometry(0.32, 0.55, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffe279,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.05;
    markerGroup.add(ringMesh);

    this.buildingsGroup.add(markerGroup);
    this.animatedMarkers.push({ group: markerGroup, cone: coneMesh, ring: ringMesh, baseTime: Math.random() * 10, isDoorMarker: true });
  }

  rebuildBuildings(newMapData) {
    if (newMapData) {
      this.mapData = newMapData;
    }

    // Vider les anciens bâtiments
    while (this.buildingsGroup.children.length > 0) {
      const obj = this.buildingsGroup.children[0];
      this.buildingsGroup.remove(obj);
      obj.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    }

    // Supprimer les balises de portes précédentes
    this.animatedMarkers = this.animatedMarkers.filter(m => !m.isDoorMarker);

    // Réinstancier les nouveaux bâtiments
    this.instantiateBuildings();
  }

  instantiateNpcs() {
    for (const npcData of this.mapData.npcs) {
      const npcAvatar = new AvatarModel(npcData.avatarId);
      const wpos = gridToWorldPos(npcData.gridX, npcData.gridZ, 0);
      npcAvatar.rootGroup.position.set(wpos.x, wpos.y, wpos.z);

      switch (npcData.facing) {
        case 'south': npcAvatar.rootGroup.rotation.y = 0; break;
        case 'north': npcAvatar.rootGroup.rotation.y = Math.PI; break;
        case 'west':  npcAvatar.rootGroup.rotation.y = -Math.PI / 2; break;
        case 'east':  npcAvatar.rootGroup.rotation.y = Math.PI / 2; break;
      }

      this.rootGroup.add(npcAvatar.rootGroup);
      this.npcAvatars.push({ avatar: npcAvatar, data: npcData });
    }
  }

  loadModel(path, callback) {
    if (this.modelCache.has(path)) {
      callback(this.modelCache.get(path));
      return;
    }

    this.gltfLoader.load(
      path,
      (gltf) => {
        this.modelCache.set(path, gltf.scene);
        callback(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn(`[BwedTownRenderer] Impossible de charger ${path}`);
      }
    );
  }

  checkCoinCollection(playerGridX, playerGridZ) {
    for (const coin of this.collectibleCoins) {
      if (!coin.collected && coin.gx === playerGridX && coin.gz === playerGridZ) {
        coin.collected = true;
        this.rootGroup.remove(coin.mesh);
        if (this.onCoinCollected) {
          this.onCoinCollected(coin);
        }
        return coin;
      }
    }
    return null;
  }

  update(delta) {
    const time = performance.now() * 0.003;

    // Animation des balises de porte
    for (const m of this.animatedMarkers) {
      m.cone.position.y = 1.6 + Math.sin(time + m.baseTime) * 0.16;
      m.cone.rotation.y += delta * 2.2;
      m.ring.rotation.z += delta * 1.6;
    }

    // Animation des pièces / croissants dorés
    for (const c of this.collectibleCoins) {
      if (!c.collected && c.mesh) {
        c.mesh.rotation.y += delta * 2.5;
        c.mesh.position.y = c.baseY + Math.sin(time * 2.0 + c.id) * 0.12;
      }
    }

    // Animation des particules d'ambiance
    for (const p of this.ambientParticles) {
      if (p.type === 'fountain') {
        p.orbitAngle += delta * p.orbitSpeed;
        p.mesh.position.x = Math.cos(p.orbitAngle) * p.orbitDist;
        p.mesh.position.z = Math.sin(p.orbitAngle) * p.orbitDist;
        p.mesh.position.y += delta * p.speedY;
        if (p.mesh.position.y > 4.2) p.mesh.position.y = 0.4;
      } else if (p.type === 'leaf') {
        p.mesh.rotation.z += delta * p.rotSpeed;
        p.mesh.position.x = p.baseX + Math.sin(time * p.swaySpeed) * 0.6;
        p.mesh.position.y -= delta * 0.3;
        if (p.mesh.position.y < 0.2) p.mesh.position.y = 3.5;
      }
    }

    // Respiration des PNJ
    for (const npc of this.npcAvatars) {
      npc.avatar.updateAnimation(delta, 'idle', 0);
    }

    // Scintillement doux des lanternes et du feu de camp
    for (let i = 0; i < this.pointLights.length; i++) {
      const pl = this.pointLights[i];
      pl.intensity = 1.25 + Math.sin(time * 3.5 + i) * 0.18;
    }
  }
}
