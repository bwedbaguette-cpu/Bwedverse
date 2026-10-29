import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ==========================================================================
   BWEDTRIS 3D — Le Tetris Pâtissier du Bwedverse
   Moteur de jeu complet : 7-tetrominoes, SRS, Audio Web, Fourneau 3D
   ========================================================================== */

// --- CONFIGURATION DU JEU ---
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 1.0;
const HALF_WIDTH = (COLS * CELL_SIZE) / 2;
const LOCK_DELAY_MS = 500;
const MAX_LOCK_RESETS = 15;

// Vitesses de chute par niveau (en millisecondes par case)
const LEVEL_SPEEDS = [
  1000, 850, 720, 600, 500, 410, 330, 260, 200, 150, 110, 80, 60, 45, 30
];

// --- PALETTES & TEXTURES PÂTISSIÈRES ---
const PIECE_THEMES = {
  I: {
    name: 'Baguette Dorée',
    color: '#38bdf8',
    glow: '#0284c7',
    specular: 0x67e8f9,
    roughness: 0.28,
    metalness: 0.1,
    desc: 'Baguette croustillante dorée au miel'
  },
  O: {
    name: 'Crème Pistache',
    color: '#eab308',
    glow: '#ca8a04',
    specular: 0xfef08a,
    roughness: 0.32,
    metalness: 0.05,
    desc: 'Pavé fondant de beurre et pistache'
  },
  T: {
    name: 'Gaufre Cacao',
    color: '#a855f7',
    glow: '#7e22ce',
    specular: 0xd8b4fe,
    roughness: 0.45,
    metalness: 0.08,
    desc: 'Gaufre artisanale au coulis de myrtille'
  },
  L: {
    name: 'Brioche Indigo',
    color: '#f97316',
    glow: '#c2410c',
    specular: 0xfdba74,
    roughness: 0.35,
    metalness: 0.12,
    desc: 'Brioche tressée aux éclats d caramel'
  },
  J: {
    name: 'Sablé Myrtille',
    color: '#3b82f6',
    glow: '#1d4ed8',
    specular: 0x93c5fd,
    roughness: 0.4,
    metalness: 0.05,
    desc: 'Sablé breton trempé au sirop d azur'
  },
  S: {
    name: 'Roulé Matcha',
    color: '#22c55e',
    glow: '#15803d',
    specular: 0x86efac,
    roughness: 0.38,
    metalness: 0.08,
    desc: 'Roulé moelleux au thé vert matcha'
  },
  Z: {
    name: 'Framboise Royale',
    color: '#ef4444',
    glow: '#b91c1c',
    specular: 0xfca5a5,
    roughness: 0.25,
    metalness: 0.15,
    desc: 'Macaron rouge velours à la framboise'
  }
};

// Matrices des pièces (rotations 0, 1, 2, 3)
const TETROMINOES = {
  I: {
    size: 4,
    shapes: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ]
  },
  O: {
    size: 2,
    shapes: [
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]],
      [[1,1], [1,1]]
    ]
  },
  T: {
    size: 3,
    shapes: [
      [[0,1,0], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,1], [0,1,0]],
      [[0,1,0], [1,1,0], [0,1,0]]
    ]
  },
  L: {
    size: 3,
    shapes: [
      [[0,0,1], [1,1,1], [0,0,0]],
      [[0,1,0], [0,1,0], [0,1,1]],
      [[0,0,0], [1,1,1], [1,0,0]],
      [[1,1,0], [0,1,0], [0,1,0]]
    ]
  },
  J: {
    size: 3,
    shapes: [
      [[1,0,0], [1,1,1], [0,0,0]],
      [[0,1,1], [0,1,0], [0,1,0]],
      [[0,0,0], [1,1,1], [0,0,1]],
      [[0,1,0], [0,1,0], [1,1,0]]
    ]
  },
  S: {
    size: 3,
    shapes: [
      [[0,1,1], [1,1,0], [0,0,0]],
      [[0,1,0], [0,1,1], [0,0,1]],
      [[0,0,0], [0,1,1], [1,1,0]],
      [[1,0,0], [1,1,0], [0,1,0]]
    ]
  },
  Z: {
    size: 3,
    shapes: [
      [[1,1,0], [0,1,1], [0,0,0]],
      [[0,0,1], [0,1,1], [0,1,0]],
      [[0,0,0], [1,1,0], [0,1,1]],
      [[0,1,0], [1,1,0], [1,0,0]]
    ]
  }
};

// Tables de décalage mural SRS (Super Rotation System)
const WALL_KICKS_JLSTZ = {
  '0->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  '1->0': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  '1->2': [[0,0], [1,0], [1,-1], [0,2], [1,2]],
  '2->1': [[0,0], [-1,0], [-1,1], [0,-2], [-1,-2]],
  '2->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]],
  '3->2': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '3->0': [[0,0], [-1,0], [-1,-1], [0,2], [-1,2]],
  '0->3': [[0,0], [1,0], [1,1], [0,-2], [1,-2]]
};

const WALL_KICKS_I = {
  '0->1': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
  '1->0': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
  '1->2': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]],
  '2->1': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
  '2->3': [[0,0], [2,0], [-1,0], [2,1], [-1,-2]],
  '3->2': [[0,0], [-2,0], [1,0], [-2,-1], [1,2]],
  '3->0': [[0,0], [1,0], [-2,0], [1,-2], [-2,1]],
  '0->3': [[0,0], [-1,0], [2,0], [-1,2], [2,-1]]
};

/* ==========================================================================
   GESTIONNAIRE AUDIO SYNTHÉTIQUE WEB & MUSIQUE
   Garantit zéro latence et un fonctionnement fluide sans dépendances externes
   ========================================================================== */

class BwedAudioManager {
  constructor() {
    this.audioCtx = null;
    this.musicAudio = null;
    this.isMuted = true;
    this.isMusicPlaying = false;
    this.initMusic();
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initMusic() {
    this.musicAudio = new Audio('./assets/audio/bakery-theme.mp3');
    this.musicAudio.loop = true;
    this.musicAudio.volume = 0.35;
  }

  toggleMusic() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.musicAudio) this.musicAudio.pause();
      this.isMusicPlaying = false;
      return false;
    } else {
      if (this.musicAudio) {
        this.musicAudio.play().catch(() => {});
        this.isMusicPlaying = true;
      }
      return true;
    }
  }

  playTone(freq, type, duration, gainValue = 0.15, attack = 0.01, decay = 0.08) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainValue, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {
      // Audio synth non-bloquant
    }
  }

  playMove() {
    this.playTone(280, 'triangle', 0.06, 0.08, 0.005, 0.05);
  }

  playRotate() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  playSoftDrop() {
    this.playTone(180, 'sine', 0.04, 0.05, 0.005, 0.03);
  }

  playHardDrop() {
    this.playTone(95, 'triangle', 0.14, 0.22, 0.01, 0.12);
  }

  playHold() {
    this.playTone(440, 'triangle', 0.1, 0.1, 0.01, 0.09);
  }

  playLineClear(linesCount) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.audioCtx) return;

    const chords = {
      1: [523.25, 659.25],            // Do5, Mi5
      2: [523.25, 659.25, 783.99],     // Do, Mi, Sol
      3: [523.25, 659.25, 783.99, 1046.50], // Arpège 4 notes
      4: [523.25, 659.25, 783.99, 1046.50, 1318.51] // Fanfare Tetris
    };

    const notes = chords[Math.min(linesCount, 4)] || chords[1];
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.22, 0.14, 0.01, 0.18);
      }, index * 45);
    });
  }

  playTetrisFanfare() {
    if (this.isMuted) return;
    const fanfare = [
      { f: 523.25, d: 80 },
      { f: 659.25, d: 80 },
      { f: 783.99, d: 80 },
      { f: 1046.50, d: 180 },
      { f: 880.00, d: 90 },
      { f: 1046.50, d: 300 }
    ];
    let time = 0;
    fanfare.forEach(step => {
      setTimeout(() => {
        this.playTone(step.f, 'triangle', step.d / 1000, 0.18, 0.01, step.d / 1000);
      }, time);
      time += step.d;
    });
  }

  playGameOver() {
    const notes = [440, 415.3, 392, 349.2, 329.6];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.25, 0.12, 0.02, 0.2);
      }, idx * 110);
    });
  }
}

/* ==========================================================================
   GÉNÉRATEUR DE PIÈCES (7-BAG RANDOMIZER)
   ========================================================================== */

class TetrisBag {
  constructor() {
    this.types = ['I', 'O', 'T', 'L', 'J', 'S', 'Z'];
    this.bag = [];
  }

  next() {
    if (this.bag.length === 0) {
      this.bag = [...this.types];
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop();
  }
}

/* ==========================================================================
   SCÈNE THREE.JS & FOURNEAU 3D
   ========================================================================== */

class BwedOvenScene {
  constructor(containerEl) {
    this.container = containerEl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Groupes 3D
    this.boardGroup = new THREE.Group();
    this.activePieceGroup = new THREE.Group();
    this.ghostPieceGroup = new THREE.Group();
    this.lockedBlocksGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();
    this.decorGroup = new THREE.Group();

    // Dictionnaires de géométries et matériaux réutilisables
    this.boxGeometry = null;
    this.bevelGeometry = null;
    this.materials = {};

    // Modèles GLB chargés
    this.loadedModels = {};
    this.gltfLoader = new GLTFLoader();

    // Particules actives
    this.particles = [];
    this.dustParticles = [];

    // Mascot mesh reference
    this.mascotMesh = null;
    this.mascotHopTime = 0;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scène
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x120804);
    this.scene.fog = new THREE.FogExp2(0x1a0b06, 0.022);

    // Caméra
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    // Position optimale pour cadrer l'enceinte de 10x20
    this.camera.position.set(0, 10.2, 28.5);
    this.camera.lookAt(0, 9.8, 0);

    // Moteur de rendu
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Hiérarchie des groupes
    this.scene.add(this.boardGroup);
    this.boardGroup.add(this.lockedBlocksGroup);
    this.boardGroup.add(this.ghostPieceGroup);
    this.boardGroup.add(this.activePieceGroup);
    this.scene.add(this.particlesGroup);
    this.scene.add(this.decorGroup);

    // Géométries standards
    this.boxGeometry = new THREE.BoxGeometry(0.94, 0.94, 0.94);

    // Initialisation de l'éclairage et du décor
    this.setupLighting();
    this.buildOvenChamber();
    this.setupFlourDust();
    this.loadDecorAssets();

    // Redimensionnement réactif
    window.addEventListener('resize', () => this.onResize());
  }

  setupLighting() {
    // Lumière ambiante chaude de cuisine
    const ambientLight = new THREE.AmbientLight(0xffecd1, 1.2);
    this.scene.add(ambientLight);

    // Lumière directionnelle principale (fournil supérieur)
    const sunLight = new THREE.DirectionalLight(0xffeed6, 2.2);
    sunLight.position.set(12, 24, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // Lueur rougeoyante du foyer inférieur (braises du four)
    const hearthGlow = new THREE.PointLight(0xff6b1a, 2.8, 22);
    hearthGlow.position.set(0, -1.5, 4);
    this.scene.add(hearthGlow);

    // Lumière dorée douce en contre-plongée
    const rimLight = new THREE.DirectionalLight(0xffb84d, 0.9);
    rimLight.position.set(-14, 12, -8);
    this.scene.add(rimLight);
  }

  buildOvenChamber() {
    // 1. Fond du fourneau en briques sombres lustrées
    const backWallGeo = new THREE.PlaneGeometry(10.6, 20.6);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x1d100b,
      roughness: 0.85,
      metalness: 0.1
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 9.5, -0.52);
    this.boardGroup.add(backWall);

    // 2. Grillage quadrillé de cuisson subtil (lignes de guidage)
    const gridHelperMat = new THREE.LineBasicMaterial({
      color: 0x5a341e,
      transparent: true,
      opacity: 0.45
    });

    // Lignes verticales
    for (let c = 0; c <= COLS; c++) {
      const x = (c - COLS / 2) * CELL_SIZE;
      const points = [
        new THREE.Vector3(x, -0.5, -0.5),
        new THREE.Vector3(x, ROWS - 0.5, -0.5)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, gridHelperMat);
      this.boardGroup.add(line);
    }

    // Lignes horizontales
    for (let r = 0; r <= ROWS; r++) {
      const y = r * CELL_SIZE - 0.5;
      const points = [
        new THREE.Vector3(-HALF_WIDTH, y, -0.5),
        new THREE.Vector3(HALF_WIDTH, y, -0.5)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, gridHelperMat);
      this.boardGroup.add(line);
    }

    // 3. Cadre monumental en laiton cuit du fourneau
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xc88937,
      roughness: 0.35,
      metalness: 0.75
    });

    const borderThickness = 0.55;
    const borderDepth = 1.3;

    // Colonne gauche
    const leftCol = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, 21.6, borderDepth), frameMat);
    leftCol.position.set(-HALF_WIDTH - borderThickness / 2, 9.5, 0);
    this.boardGroup.add(leftCol);

    // Colonne droite
    const rightCol = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, 21.6, borderDepth), frameMat);
    rightCol.position.set(HALF_WIDTH + borderThickness / 2, 9.5, 0);
    this.boardGroup.add(rightCol);

    // Traverse supérieure avec fronton
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(11.8 + borderThickness * 2, borderThickness, borderDepth), frameMat);
    topBar.position.set(0, ROWS - 0.5 + borderThickness / 2, 0);
    this.boardGroup.add(topBar);

    // Sole de cuisson inférieure (pierre de lave chaude)
    const bottomHearthMat = new THREE.MeshStandardMaterial({
      color: 0x2a160d,
      roughness: 0.9,
      metalness: 0.05
    });
    const bottomHearth = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 5.5), bottomHearthMat);
    bottomHearth.position.set(0, -1.1, 1.5);
    bottomHearth.receiveShadow = true;
    this.boardGroup.add(bottomHearth);

    // Bande lumineuse de préchauffage en bas
    const glowBarGeo = new THREE.BoxGeometry(10.2, 0.12, 0.3);
    const glowBarMat = new THREE.MeshBasicMaterial({ color: 0xff7b22 });
    const glowBar = new THREE.Mesh(glowBarGeo, glowBarMat);
    glowBar.position.set(0, -0.5, 0.4);
    this.boardGroup.add(glowBar);
  }

  setupFlourDust() {
    // Particules de farine et de poussière flottant doucement dans la lumière chaude
    const count = 45;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      velocities.push({
        vx: (Math.random() - 0.5) * 0.008,
        vy: -0.004 - Math.random() * 0.008,
        vz: (Math.random() - 0.5) * 0.008
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffecd4,
      size: 0.22,
      transparent: true,
      opacity: 0.55
    });

    const dust = new THREE.Points(geom, mat);
    this.scene.add(dust);
    this.dustParticles = { mesh: dust, velocities, count };
  }

  loadDecorAssets() {
    // 1. Lanterne de miel dorée (sur le montant droit)
    this.gltfLoader.load(
      './assets/decor/honey-lantern.glb',
      (gltf) => {
        const lantern = gltf.scene;
        lantern.scale.set(1.4, 1.4, 1.4);
        lantern.position.set(HALF_WIDTH + 1.8, 14.5, 1.2);
        this.decorGroup.add(lantern);

        // Lueur de la lanterne
        const lanternLight = new THREE.PointLight(0xffb84d, 2.5, 12);
        lanternLight.position.set(HALF_WIDTH + 1.8, 14.5, 1.8);
        this.decorGroup.add(lanternLight);
      },
      undefined,
      () => {}
    );

    // 2. Feu de camp de chamallows (en bas à gauche sur la pierre de foyer)
    this.gltfLoader.load(
      './assets/decor/marshmallow-campfire.glb',
      (gltf) => {
        const campfire = gltf.scene;
        campfire.scale.set(1.1, 1.1, 1.1);
        campfire.position.set(-HALF_WIDTH - 2.8, -0.6, 2.2);
        this.decorGroup.add(campfire);
      },
      undefined,
      () => {}
    );

    // 3. Mascotte Chef Émile le Pâtissier (au premier plan à gauche)
    this.gltfLoader.load(
      './assets/mascot/tiny-baker.glb',
      (gltf) => {
        const baker = gltf.scene;
        baker.scale.set(1.25, 1.25, 1.25);
        baker.position.set(-HALF_WIDTH - 2.6, 1.8, 3.2);
        baker.rotation.y = 0.45;
        this.mascotMesh = baker;
        this.decorGroup.add(baker);
      },
      undefined,
      () => {}
    );
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // Création d'un matériau pâtissier chaleureux
  getPieceMaterial(type, isGhost = false) {
    const key = `${type}_${isGhost ? 'ghost' : 'solid'}`;
    if (this.materials[key]) return this.materials[key];

    const theme = PIECE_THEMES[type] || PIECE_THEMES.I;
    let mat;

    if (isGhost) {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(theme.color),
        transparent: true,
        opacity: 0.22,
        roughness: 0.6,
        wireframe: false
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(theme.color),
        roughness: theme.roughness,
        metalness: theme.metalness,
        emissive: new THREE.Color(theme.glow),
        emissiveIntensity: 0.18
      });
    }

    this.materials[key] = mat;
    return mat;
  }

  // Rendu de la pièce active
  renderActivePiece(piece) {
    // Vider le groupe actif
    while (this.activePieceGroup.children.length > 0) {
      const child = this.activePieceGroup.children.pop();
      child.geometry?.dispose();
    }

    if (!piece) return;

    const shape = piece.getShape();
    const mat = this.getPieceMaterial(piece.type, false);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const col = piece.col + c;
          const row = piece.row - r;
          const x = (col - COLS / 2 + 0.5) * CELL_SIZE;
          const y = row * CELL_SIZE;

          const cube = new THREE.Mesh(this.boxGeometry, mat);
          cube.position.set(x, y, 0);
          cube.castShadow = true;
          cube.receiveShadow = true;

          // Glaçage supérieur (petit topping croustillant)
          const icingGeo = new THREE.BoxGeometry(0.82, 0.08, 0.82);
          const icingMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.05
          });
          const icing = new THREE.Mesh(icingGeo, icingMat);
          icing.position.set(0, 0.44, 0);
          cube.add(icing);

          this.activePieceGroup.add(cube);
        }
      }
    }
  }

  // Rendu de la silhouette fantôme (ghost piece)
  renderGhostPiece(piece, ghostRow) {
    while (this.ghostPieceGroup.children.length > 0) {
      const child = this.ghostPieceGroup.children.pop();
      child.geometry?.dispose();
    }

    if (!piece || ghostRow === piece.row) return;

    const shape = piece.getShape();
    const mat = this.getPieceMaterial(piece.type, true);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const col = piece.col + c;
          const row = ghostRow - r;
          const x = (col - COLS / 2 + 0.5) * CELL_SIZE;
          const y = row * CELL_SIZE;

          const cube = new THREE.Mesh(this.boxGeometry, mat);
          cube.position.set(x, y, 0);
          this.ghostPieceGroup.add(cube);
        }
      }
    }
  }

  // Reconstruction intégrale des blocs verrouillés de la grille
  rebuildLockedGrid(grid) {
    while (this.lockedBlocksGroup.children.length > 0) {
      const child = this.lockedBlocksGroup.children.pop();
      child.geometry?.dispose();
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell) {
          const mat = this.getPieceMaterial(cell.type, false);
          const x = (c - COLS / 2 + 0.5) * CELL_SIZE;
          const y = r * CELL_SIZE;

          const cube = new THREE.Mesh(this.boxGeometry, mat);
          cube.position.set(x, y, 0);
          cube.castShadow = true;
          cube.receiveShadow = true;
          cube.userData = { row: r, col: c };

          this.lockedBlocksGroup.add(cube);
        }
      }
    }
  }

  // Animation de flash lumineux doré sur les lignes cuites
  flashLines(rowIndices, callback) {
    const targets = this.lockedBlocksGroup.children.filter(mesh =>
      rowIndices.includes(mesh.userData.row)
    );

    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const originalMaterials = targets.map(m => m.material);

    targets.forEach(m => {
      m.material = flashMat;
      m.scale.set(1.15, 1.15, 1.15);
    });

    setTimeout(() => {
      targets.forEach((m, idx) => {
        m.material = originalMaterials[idx];
        m.scale.set(1, 1, 1);
      });
      if (callback) callback();
    }, 180);
  }

  // Émission d'éclats de miettes croustillantes et sucre étincelant
  spawnCrumbBurst(rows) {
    rows.forEach(r => {
      const y = r * CELL_SIZE;
      for (let i = 0; i < 35; i++) {
        const x = (Math.random() - 0.5) * (COLS * CELL_SIZE);
        const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const pMat = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.4 ? 0xffd15a : 0xff7b22,
          roughness: 0.4
        });
        const mesh = new THREE.Mesh(pGeo, pMat);
        mesh.position.set(x, y + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.8);

        this.particlesGroup.add(mesh);
        this.particles.push({
          mesh,
          vx: (Math.random() - 0.5) * 4.5,
          vy: 2.5 + Math.random() * 4.0,
          vz: (Math.random() - 0.5) * 3.5,
          rx: (Math.random() - 0.5) * 8.0,
          ry: (Math.random() - 0.5) * 8.0,
          life: 1.0,
          decay: 0.94
        });
      }
    });
  }

  triggerMascotHop() {
    this.mascotHopTime = Date.now();
  }

  // Boucle d'animation continue du moteur 3D
  update(deltaTime) {
    // 1. Mise à jour des miettes en chute
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.x += p.vx * deltaTime;
      p.mesh.position.y += p.vy * deltaTime;
      p.mesh.position.z += p.vz * deltaTime;

      p.vy -= 9.8 * deltaTime; // Gravité

      p.mesh.rotation.x += p.rx * deltaTime;
      p.mesh.rotation.y += p.ry * deltaTime;

      p.life *= p.decay;
      p.mesh.scale.setScalar(Math.max(0.01, p.life));

      if (p.life < 0.05 || p.mesh.position.y < -3) {
        this.particlesGroup.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      }
    }

    // 2. Mise à jour de la poussière de farine flottante
    if (this.dustParticles && this.dustParticles.mesh) {
      const pos = this.dustParticles.mesh.geometry.attributes.position.array;
      for (let i = 0; i < this.dustParticles.count; i++) {
        const vel = this.dustParticles.velocities[i];
        pos[i * 3 + 0] += vel.vx;
        pos[i * 3 + 1] += vel.vy;
        pos[i * 3 + 2] += vel.vz;

        if (pos[i * 3 + 1] < -1.5) {
          pos[i * 3 + 1] = 21.0;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 22;
        }
      }
      this.dustParticles.mesh.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animation du chef pâtissier
    if (this.mascotMesh) {
      const now = Date.now();
      const timeSinceHop = now - this.mascotHopTime;
      if (timeSinceHop < 600) {
        // Saut festif
        const progress = timeSinceHop / 600;
        const hopY = Math.sin(progress * Math.PI) * 0.65;
        this.mascotMesh.position.y = 1.8 + hopY;
        this.mascotMesh.rotation.y = 0.45 + Math.sin(progress * Math.PI * 2) * 0.25;
      } else {
        // Respiration douce
        this.mascotMesh.position.y = 1.8 + Math.sin(now * 0.003) * 0.04;
        this.mascotMesh.rotation.y = 0.45 + Math.sin(now * 0.0015) * 0.03;
      }
    }

    // Rendu
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

/* ==========================================================================
   INSTANCE D'UNE PIÈCE (ACTIVE TETROMINO)
   ========================================================================== */

class TetrominoPiece {
  constructor(type) {
    this.type = type;
    this.rotation = 0;
    this.def = TETROMINOES[type];
    this.shape = this.def.shapes[0];
    this.size = this.def.size;

    // Position de départ centrée au sommet
    this.col = Math.floor((COLS - this.size) / 2);
    this.row = ROWS - 1;
  }

  getShape(rot = this.rotation) {
    return this.def.shapes[rot % 4];
  }

  clone() {
    const copy = new TetrominoPiece(this.type);
    copy.rotation = this.rotation;
    copy.col = this.col;
    copy.row = this.row;
    return copy;
  }
}

/* ==========================================================================
   MOTEUR LOGIQUE CENTRAL DU JEU BWEDTRIS
   ========================================================================== */

class BwedTrisGame {
  constructor() {
    this.grid = [];
    this.currentPiece = null;
    this.heldPieceType = null;
    this.canHold = true;

    this.bag = new TetrisBag();
    this.nextQueue = [];

    // Statistiques
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.highScore = 0;
    this.combo = -1;
    this.backToBack = false;

    // États
    this.isPaused = false;
    this.isGameOver = false;

    // Timers
    this.lastDropTime = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.isOnGround = false;

    // Gestionnaires
    this.audio = new BwedAudioManager();
    this.ovenScene = null;

    // UI Éléments
    this.dom = {
      scoreVal: document.getElementById('scoreVal'),
      highScoreVal: document.getElementById('highScoreVal'),
      levelVal: document.getElementById('levelVal'),
      linesVal: document.getElementById('linesVal'),
      finalScoreVal: document.getElementById('finalScoreVal'),
      finalLinesVal: document.getElementById('finalLinesVal'),
      soundBtn: document.getElementById('soundBtn'),
      soundLabel: document.getElementById('soundLabel'),
      pauseBtn: document.getElementById('pauseBtn'),
      pauseModal: document.getElementById('pauseModal'),
      resumeBtn: document.getElementById('resumeBtn'),
      restartBtn: document.getElementById('restartBtn'),
      gameOverModal: document.getElementById('gameOverModal'),
      retryBtn: document.getElementById('retryBtn'),
      eventBanner: document.getElementById('eventBanner'),
      eventTitle: document.getElementById('eventTitle'),
      eventSubtitle: document.getElementById('eventSubtitle'),
      mascotSpeech: document.getElementById('mascotSpeech'),
      holdStage: document.getElementById('holdStage'),
      nextStage: document.getElementById('nextStage'),
      holdEmptyHint: document.getElementById('holdEmptyHint')
    };

    // Création des mini-canvas 2D pour la Réserve et la Pièce Suivante
    this.holdCanvas = this.createPreviewCanvas(this.dom.holdStage);
    this.nextCanvas = this.createPreviewCanvas(this.dom.nextStage);

    this.init();
  }

  createPreviewCanvas(container) {
    if (!container) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 100;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    return canvas;
  }

  init() {
    this.loadHighScore();

    // Initialisation de la grille 10x20
    this.resetGrid();

    // Initialisation de la file des pièces
    this.nextQueue = [this.bag.next(), this.bag.next(), this.bag.next()];

    // Initialisation 3D
    const container = document.getElementById('canvasContainer');
    this.ovenScene = new BwedOvenScene(container);

    // Écouteurs de contrôles
    this.bindKeyboardControls();
    this.bindTouchControls();
    this.bindModalButtons();

    // Démarrage de la première pièce
    this.spawnPiece();

    // Lancement de la boucle de rendu et du game loop
    this.lastLoopTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loadHighScore() {
    try {
      const stored = localStorage.getItem('bwedtris_high_score');
      this.highScore = stored ? parseInt(stored, 10) : 0;
      if (this.dom.highScoreVal) this.dom.highScoreVal.textContent = this.highScore.toLocaleString('fr-FR');
    } catch {
      this.highScore = 0;
    }
  }

  saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      if (this.dom.highScoreVal) this.dom.highScoreVal.textContent = this.highScore.toLocaleString('fr-FR');
      try {
        localStorage.setItem('bwedtris_high_score', this.highScore.toString());
      } catch {}
    }
  }

  resetGrid() {
    this.grid = [];
    for (let r = 0; r < ROWS; r++) {
      this.grid[r] = new Array(COLS).fill(null);
    }
  }

  restart() {
    this.resetGrid();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = -1;
    this.backToBack = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.heldPieceType = null;
    this.canHold = true;
    this.bag = new TetrisBag();
    this.nextQueue = [this.bag.next(), this.bag.next(), this.bag.next()];

    this.updateHUD();
    this.renderPreviews();

    if (this.dom.pauseModal) this.dom.pauseModal.hidden = true;
    if (this.dom.gameOverModal) this.dom.gameOverModal.hidden = true;

    this.ovenScene.rebuildLockedGrid(this.grid);
    this.spawnPiece();
    this.sayMascot('Nouveau tablier, nouvelle pâte ! Fais chauffer le four !');
  }

  spawnPiece() {
    const nextType = this.nextQueue.shift();
    this.nextQueue.push(this.bag.next());
    this.renderPreviews();

    this.currentPiece = new TetrominoPiece(nextType);
    this.canHold = true;
    this.lockResets = 0;
    this.isOnGround = false;

    // Vérification de collision immédiate (Game Over)
    if (this.checkCollision(this.currentPiece, this.currentPiece.col, this.currentPiece.row, this.currentPiece.rotation)) {
      this.triggerGameOver();
      return;
    }

    this.syncActive3D();
  }

  syncActive3D() {
    if (!this.ovenScene || !this.currentPiece) return;
    const ghostRow = this.calculateGhostRow();
    this.ovenScene.renderActivePiece(this.currentPiece);
    this.ovenScene.renderGhostPiece(this.currentPiece, ghostRow);
  }

  calculateGhostRow() {
    if (!this.currentPiece) return 0;
    let r = this.currentPiece.row;
    while (!this.checkCollision(this.currentPiece, this.currentPiece.col, r - 1, this.currentPiece.rotation)) {
      r--;
    }
    return r;
  }

  checkCollision(piece, targetCol, targetRow, targetRot) {
    const shape = piece.getShape(targetRot);
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const col = targetCol + c;
          const row = targetRow - r;

          // Limites latérales
          if (col < 0 || col >= COLS) return true;
          // Limite basse
          if (row < 0) return true;
          // Case déjà occupée dans la grille
          if (row < ROWS && this.grid[row][col] !== null) return true;
        }
      }
    }
    return false;
  }

  moveLeft() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    if (!this.checkCollision(this.currentPiece, this.currentPiece.col - 1, this.currentPiece.row, this.currentPiece.rotation)) {
      this.currentPiece.col--;
      this.onPieceManipulated();
      this.audio.playMove();
      this.syncActive3D();
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    if (!this.checkCollision(this.currentPiece, this.currentPiece.col + 1, this.currentPiece.row, this.currentPiece.rotation)) {
      this.currentPiece.col++;
      this.onPieceManipulated();
      this.audio.playMove();
      this.syncActive3D();
      return true;
    }
    return false;
  }

  rotate(clockwise = true) {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return false;
    const fromRot = this.currentPiece.rotation;
    const toRot = clockwise ? (fromRot + 1) % 4 : (fromRot + 3) % 4;

    const kicksTable = this.currentPiece.type === 'I' ? WALL_KICKS_I : WALL_KICKS_JLSTZ;
    const kickKey = `${fromRot}->${toRot}`;
    const kicks = kicksTable[kickKey] || [[0, 0]];

    for (const [dx, dy] of kicks) {
      if (!this.checkCollision(this.currentPiece, this.currentPiece.col + dx, this.currentPiece.row + dy, toRot)) {
        this.currentPiece.col += dx;
        this.currentPiece.row += dy;
        this.currentPiece.rotation = toRot;
        this.onPieceManipulated();
        this.audio.playRotate();
        this.syncActive3D();
        return true;
      }
    }
    return false;
  }

  softDrop() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return;
    if (!this.checkCollision(this.currentPiece, this.currentPiece.col, this.currentPiece.row - 1, this.currentPiece.rotation)) {
      this.currentPiece.row--;
      this.score += 1;
      this.updateHUD();
      this.audio.playSoftDrop();
      this.syncActive3D();
    }
  }

  hardDrop() {
    if (this.isPaused || this.isGameOver || !this.currentPiece) return;
    let droppedCells = 0;
    while (!this.checkCollision(this.currentPiece, this.currentPiece.col, this.currentPiece.row - 1, this.currentPiece.rotation)) {
      this.currentPiece.row--;
      droppedCells++;
    }
    this.score += droppedCells * 2;
    this.updateHUD();
    this.audio.playHardDrop();
    this.lockPiece();
  }

  hold() {
    if (this.isPaused || this.isGameOver || !this.currentPiece || !this.canHold) return;

    this.audio.playHold();
    const currentType = this.currentPiece.type;

    if (!this.heldPieceType) {
      this.heldPieceType = currentType;
      this.spawnPiece();
    } else {
      const swapType = this.heldPieceType;
      this.heldPieceType = currentType;
      this.currentPiece = new TetrominoPiece(swapType);
      this.syncActive3D();
    }

    this.canHold = false;
    this.renderPreviews();
  }

  onPieceManipulated() {
    // Si la pièce était posée, on réinitialise le délai de verrouillage (jusqu'à la limite)
    if (this.isOnGround && this.lockResets < MAX_LOCK_RESETS) {
      this.lockTimer = performance.now();
      this.lockResets++;
    }
  }

  lockPiece() {
    const shape = this.currentPiece.getShape();
    const theme = PIECE_THEMES[this.currentPiece.type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const col = this.currentPiece.col + c;
          const row = this.currentPiece.row - r;
          if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            this.grid[row][col] = {
              type: this.currentPiece.type,
              color: theme.color,
              glow: theme.glow
            };
          }
        }
      }
    }

    // Réinitialisation de la pièce active
    this.currentPiece = null;
    this.ovenScene.rebuildLockedGrid(this.grid);
    this.ovenScene.renderActivePiece(null);
    this.ovenScene.renderGhostPiece(null, 0);

    // Vérification des lignes complétées
    this.checkLines();
  }

  checkLines() {
    const clearedRows = [];
    for (let r = 0; r < ROWS; r++) {
      if (this.grid[r].every(cell => cell !== null)) {
        clearedRows.push(r);
      }
    }

    if (clearedRows.length > 0) {
      this.combo++;
      const isTetris = clearedRows.length === 4;

      // Calcul des points
      const basePoints = {
        1: 100,
        2: 300,
        3: 500,
        4: 800
      }[clearedRows.length] || 100;

      let lineScore = basePoints * this.level;

      if (isTetris) {
        if (this.backToBack) {
          lineScore = Math.floor(lineScore * 1.5);
        }
        this.backToBack = true;
      } else {
        this.backToBack = false;
      }

      if (this.combo > 0) {
        lineScore += 50 * this.combo * this.level;
      }

      this.score += lineScore;
      this.lines += clearedRows.length;

      // Montée de niveau tous les 10 lignes
      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.showToast('NIVEAU SUPÉRIEUR !', `Vitesse de cuisson accrue (Niveau ${this.level})`);
      }

      this.saveHighScore();
      this.updateHUD();

      // Audio & Effets visuels
      if (isTetris) {
        this.audio.playTetrisFanfare();
        this.showToast('TETRIS PUR BEURRE !', `+${lineScore} Points Croustillants`);
        this.sayMascot('INCROYABLE ! Un Tetris doré au caramel ! Un vrai travail de maître !');
      } else {
        this.audio.playLineClear(clearedRows.length);
        const titles = { 1: 'SIMPLE DORURE', 2: 'DOUBLE CROÛTE !', 3: 'TRIPLE FEUILLETAGE !' };
        this.showToast(titles[clearedRows.length] || 'LIGNE CUITE !', `+${lineScore} Points`);

        const quotes = [
          'Joli coup de rouleau à pâtisserie !',
          'La pâte est dorée à point !',
          'Quelle régularité dans la découpe !',
          'Les clients du village vont adorer !'
        ];
        this.sayMascot(quotes[Math.floor(Math.random() * quotes.length)]);
      }

      this.ovenScene.triggerMascotHop();
      this.ovenScene.spawnCrumbBurst(clearedRows);

      // Flash et effacement
      this.ovenScene.flashLines(clearedRows, () => {
        // Suppression des lignes de la matrice
        const remaining = this.grid.filter((_, idx) => !clearedRows.includes(idx));
        while (remaining.length < ROWS) {
          remaining.push(new Array(COLS).fill(null));
        }
        this.grid = remaining;
        this.ovenScene.rebuildLockedGrid(this.grid);
        this.spawnPiece();
      });
    } else {
      this.combo = -1;
      this.spawnPiece();
    }
  }

  showToast(title, subtitle) {
    if (!this.dom.eventBanner) return;
    this.dom.eventTitle.textContent = title;
    this.dom.eventSubtitle.textContent = subtitle;
    this.dom.eventBanner.hidden = false;
    this.dom.eventBanner.classList.remove('banner-pop');
    void this.dom.eventBanner.offsetWidth; // Reflow
    this.dom.eventBanner.classList.add('banner-pop');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.dom.eventBanner.hidden = true;
    }, 1800);
  }

  sayMascot(text) {
    if (this.dom.mascotSpeech) {
      this.dom.mascotSpeech.textContent = text;
    }
  }

  triggerGameOver() {
    this.isGameOver = true;
    this.audio.playGameOver();
    this.saveHighScore();

    if (this.dom.finalScoreVal) this.dom.finalScoreVal.textContent = this.score.toLocaleString('fr-FR');
    if (this.dom.finalLinesVal) this.dom.finalLinesVal.textContent = this.lines.toString();
    if (this.dom.gameOverModal) this.dom.gameOverModal.hidden = false;

    this.sayMascot('Le fourneau a débordé ! Mais quelle magnifique fournée croustillante !');
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
    if (this.dom.pauseModal) this.dom.pauseModal.hidden = !this.isPaused;
  }

  updateHUD() {
    if (this.dom.scoreVal) this.dom.scoreVal.textContent = this.score.toLocaleString('fr-FR');
    if (this.dom.levelVal) this.dom.levelVal.textContent = this.level.toString();
    if (this.dom.linesVal) this.dom.linesVal.textContent = this.lines.toString();
  }

  renderPreviews() {
    // 1. Réserve
    if (this.holdCanvas) {
      const ctx = this.holdCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
      if (this.heldPieceType) {
        if (this.dom.holdEmptyHint) this.dom.holdEmptyHint.hidden = true;
        this.drawPiecePreview(ctx, this.heldPieceType, this.holdCanvas.width, this.holdCanvas.height);
      } else {
        if (this.dom.holdEmptyHint) this.dom.holdEmptyHint.hidden = false;
      }
    }

    // 2. Pièce Suivante
    if (this.nextCanvas && this.nextQueue.length > 0) {
      const ctx = this.nextCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
      this.drawPiecePreview(ctx, this.nextQueue[0], this.nextCanvas.width, this.nextCanvas.height);
    }
  }

  drawPiecePreview(ctx, type, width, height) {
    const def = TETROMINOES[type];
    if (!def) return;
    const shape = def.shapes[0];
    const theme = PIECE_THEMES[type] || PIECE_THEMES.I;

    const cellSize = 18;
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    // Calcul du centrage
    let minR = shapeRows, maxR = -1, minC = shapeCols, maxC = -1;
    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (shape[r][c]) {
          minR = Math.min(minR, r);
          maxR = Math.max(maxR, r);
          minC = Math.min(minC, c);
          maxC = Math.max(maxC, c);
        }
      }
    }

    const usedW = (maxC - minC + 1) * cellSize;
    const usedH = (maxR - minR + 1) * cellSize;
    const startX = (width - usedW) / 2 - minC * cellSize;
    const startY = (height - usedH) / 2 - minR * cellSize;

    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (shape[r][c]) {
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;

          // Pavé pâtissier dégradé
          const grad = ctx.createLinearGradient(x, y, x + cellSize, y + cellSize);
          grad.addColorStop(0, theme.color);
          grad.addColorStop(1, theme.glow);

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
          ctx.fill();

          // Reflet de glaçage
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          ctx.roundRect(x + 3, y + 3, cellSize - 6, 3, 2);
          ctx.fill();
        }
      }
    }
  }

  // Boucle de mise à jour physique & temporelle
  loop(timestamp) {
    const dt = (timestamp - this.lastLoopTime) / 1000;
    this.lastLoopTime = timestamp;

    if (!this.isPaused && !this.isGameOver && this.currentPiece) {
      // Vitesse actuelle de gravité
      const speedIndex = Math.min(this.level - 1, LEVEL_SPEEDS.length - 1);
      const dropInterval = LEVEL_SPEEDS[speedIndex];

      // Vérification du contact avec le sol
      const touchingGround = this.checkCollision(
        this.currentPiece,
        this.currentPiece.col,
        this.currentPiece.row - 1,
        this.currentPiece.rotation
      );

      if (touchingGround) {
        if (!this.isOnGround) {
          this.isOnGround = true;
          this.lockTimer = timestamp;
        } else if (timestamp - this.lockTimer >= LOCK_DELAY_MS) {
          this.lockPiece();
        }
      } else {
        this.isOnGround = false;
        if (timestamp - this.lastDropTime >= dropInterval) {
          this.currentPiece.row--;
          this.lastDropTime = timestamp;
          this.syncActive3D();
        }
      }
    }

    // Mise à jour de la scène 3D
    if (this.ovenScene) {
      this.ovenScene.update(dt);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  // Contrôles clavier
  bindKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      // Éviter le défilement navigateur
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
        return;
      }

      if (this.isPaused || this.isGameOver) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.moveLeft();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.moveRight();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.rotate(true);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.softDrop();
          break;
        case ' ':
          this.hardDrop();
          break;
        case 'c':
        case 'C':
          this.hold();
          break;
      }
    });
  }

  // Contrôles tactiles mobiles
  bindTouchControls() {
    const bindBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        action();
      });
      el.addEventListener('click', (e) => {
        e.preventDefault();
        action();
      });
    };

    bindBtn('btnTouchLeft', () => this.moveLeft());
    bindBtn('btnTouchRight', () => this.moveRight());
    bindBtn('btnTouchRotate', () => this.rotate(true));
    bindBtn('btnTouchSoftDrop', () => this.softDrop());
    bindBtn('btnTouchHardDrop', () => this.hardDrop());
    bindBtn('btnTouchHold', () => this.hold());
  }

  // Boutons des modales
  bindModalButtons() {
    this.dom.soundBtn?.addEventListener('click', () => {
      const isNowOn = this.audio.toggleMusic();
      if (this.dom.soundLabel) {
        this.dom.soundLabel.textContent = isNowOn ? 'Musique : ON' : 'Musique : OFF';
      }
    });

    this.dom.pauseBtn?.addEventListener('click', () => this.togglePause());
    this.dom.resumeBtn?.addEventListener('click', () => this.togglePause());
    this.dom.restartBtn?.addEventListener('click', () => this.restart());
    this.dom.retryBtn?.addEventListener('click', () => this.restart());
  }
}

// Initialisation globale au chargement du DOM
window.addEventListener('DOMContentLoaded', () => {
  window.bwedTris = new BwedTrisGame();
});
