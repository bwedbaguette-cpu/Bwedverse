import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ==========================================================================
   BWED BOY 3D — BWEDTRIS ARCADE
   Moteur de jeu complet pour console rétro portable Game Boy 3D
   Pièces réelles GLB Meshy, Système SRS, Menus Rétro, Audio Synthétique
   ========================================================================== */

// --- CONFIGURATION GRILLE & JEU ---
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 1.0;
const HALF_WIDTH = (COLS * CELL_SIZE) / 2;
const LOCK_DELAY_MS = 500;
const MAX_LOCK_RESETS = 15;

// Vitesses de chute par niveau (en millisecondes par case)
const LEVEL_SPEEDS = [
  950, 800, 680, 560, 460, 370, 290, 220, 160, 110, 80, 60, 45, 30
];

// Configuration des modèles GLB et transformations 3D par pièce
const PIECE_CONFIG = {
  I: {
    name: 'Baguette Dorée',
    file: './assets/blocks/block-i-bread-cubes.glb',
    color: '#38bdf8',
    glow: '#0284c7',
    pivot: [1.5, 1.5],
    scale: 2.1,
    baseRot: [0, 0, Math.PI / 2],
    baseOffset: [0, 0.5, 0],
    reflectX: false
  },
  O: {
    name: 'Crème Pistache',
    file: './assets/blocks/block-o-pistachio-glow.glb',
    color: '#eab308',
    glow: '#ca8a04',
    pivot: [0.5, 0.5],
    scale: 1.05,
    baseRot: [Math.PI / 2, 0, 0],
    baseOffset: [0, 0, 0],
    reflectX: false
  },
  T: {
    name: 'Gaufre Cacao',
    file: './assets/blocks/block-t-waffle-tower.glb',
    color: '#a855f7',
    glow: '#7e22ce',
    pivot: [1.0, 1.0],
    scale: 1.58,
    baseRot: [0, 0, Math.PI],
    baseOffset: [0, 0, 0],
    reflectX: false
  },
  L: {
    name: 'Brioche Indigo',
    file: './assets/blocks/block-l-cosmic-indigo.glb',
    color: '#f97316',
    glow: '#c2410c',
    pivot: [1.0, 1.0],
    scale: 1.58,
    baseRot: [0, 0, 0],
    baseOffset: [0, 0, 0],
    reflectX: false
  },
  J: {
    name: 'Sablé Myrtille',
    file: './assets/blocks/block-l-cosmic-indigo.glb',
    color: '#3b82f6',
    glow: '#1d4ed8',
    pivot: [1.0, 1.0],
    scale: 1.58,
    baseRot: [0, 0, 0],
    baseOffset: [0, 0, 0],
    reflectX: true
  },
  S: {
    name: 'Roulé Matcha',
    file: './assets/blocks/block-z-crimson-snowflake.glb',
    color: '#22c55e',
    glow: '#15803d',
    pivot: [1.0, 1.0],
    scale: 1.58,
    baseRot: [Math.PI / 2, 0, 0],
    baseOffset: [0, 0, 0],
    reflectX: true
  },
  Z: {
    name: 'Framboise Royale',
    file: './assets/blocks/block-z-crimson-snowflake.glb',
    color: '#ef4444',
    glow: '#b91c1c',
    pivot: [1.0, 1.0],
    scale: 1.58,
    baseRot: [Math.PI / 2, 0, 0],
    baseOffset: [0, 0, 0],
    reflectX: false
  }
};

// Matrices des tétrominos (rotations 0, 1, 2, 3)
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

// Tables de décalage mural SRS
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
   SYSTÈME AUDIO RÉTRO WEB
   ========================================================================== */

class BwedAudioManager {
  constructor() {
    this.audioCtx = null;
    this.musicAudio = null;
    this.isMuted = true;
    this.initMusic();
  }

  ensureContext() {
    try {
      if (!this.audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) this.audioCtx = new AudioClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
    } catch {}
  }

  initMusic() {
    try {
      this.musicAudio = new Audio('./assets/audio/bakery-theme.mp3');
      this.musicAudio.loop = true;
      this.musicAudio.volume = 0.28;
    } catch {}
  }

  toggleMusic() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.musicAudio?.pause();
      return false;
    } else {
      this.musicAudio?.play().catch(() => {});
      return true;
    }
  }

  playTone(freq, type, duration, gainVal = 0.12, attack = 0.005, decay = 0.06) {
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
      gain.gain.linearRampToValueAtTime(gainVal, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch {}
  }

  playCursor() {
    this.playTone(480, 'square', 0.04, 0.08, 0.002, 0.035);
  }

  playSelect() {
    this.playTone(520, 'triangle', 0.06, 0.1, 0.005, 0.05);
    setTimeout(() => this.playTone(780, 'triangle', 0.09, 0.12, 0.005, 0.08), 50);
  }

  playMove() {
    this.playTone(260, 'triangle', 0.05, 0.07, 0.004, 0.04);
  }

  playRotate() {
    this.playTone(420, 'sine', 0.07, 0.09, 0.005, 0.06);
  }

  playSoftDrop() {
    this.playTone(190, 'sine', 0.04, 0.05, 0.005, 0.03);
  }

  playHardDrop() {
    this.playTone(110, 'triangle', 0.12, 0.18, 0.008, 0.1);
  }

  playHold() {
    this.playTone(440, 'triangle', 0.08, 0.1, 0.005, 0.07);
  }

  playLineClear(linesCount) {
    const chords = {
      1: [523.25, 659.25],
      2: [523.25, 659.25, 783.99],
      3: [523.25, 659.25, 783.99, 1046.50],
      4: [523.25, 659.25, 783.99, 1046.50, 1318.51]
    };
    const notes = chords[Math.min(linesCount, 4)] || chords[1];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.18, 0.12, 0.01, 0.15), idx * 45);
    });
  }

  playTetrisFanfare() {
    const notes = [
      { f: 523.25, d: 70 },
      { f: 659.25, d: 70 },
      { f: 783.99, d: 70 },
      { f: 1046.50, d: 150 },
      { f: 880.00, d: 80 },
      { f: 1046.50, d: 250 }
    ];
    let time = 0;
    notes.forEach(step => {
      setTimeout(() => this.playTone(step.f, 'triangle', step.d / 1000, 0.15, 0.01, step.d / 1000), time);
      time += step.d;
    });
  }

  playGameOver() {
    const notes = [440, 415.3, 392, 349.2, 329.6];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, 'sawtooth', 0.22, 0.1, 0.02, 0.18), idx * 100);
    });
  }
}

/* ==========================================================================
   SAC DE PIÈCES (7-BAG RANDOMIZER)
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
   SCÈNE THREE.JS & MOTEUR 3D DANS L'ÉCRAN BWED BOY
   ========================================================================== */

class BwedBoyScreen3D {
  constructor(containerEl) {
    this.container = containerEl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Modèles 3D préchargés
    this.gltfLoader = new GLTFLoader();
    this.models = {};
    this.isModelsReady = false;

    // Groupes 3D
    this.boardGroup = new THREE.Group();
    this.activePieceGroup = new THREE.Group();
    this.ghostPieceGroup = new THREE.Group();
    this.lockedPiecesGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();
    this.titleDecorGroup = new THREE.Group();

    this.particles = [];
    this.dustParticles = [];
    this.titleDemoMesh = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 380;
    const height = this.container.clientHeight || 494;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e0704);
    this.scene.fog = new THREE.FogExp2(0x180b06, 0.02);

    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    this.camera.position.set(0, 9.5, 27.5);
    this.camera.lookAt(0, 9.5, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Hiérarchie
    this.scene.add(this.boardGroup);
    this.boardGroup.add(this.lockedPiecesGroup);
    this.boardGroup.add(this.ghostPieceGroup);
    this.boardGroup.add(this.activePieceGroup);
    this.scene.add(this.particlesGroup);
    this.scene.add(this.titleDecorGroup);

    this.setupLighting();
    this.buildOvenBackdrop();
    this.setupFlourDust();

    // Pièce de démonstration immédiate dès la frame 1
    this.setupTitleDemoPiece('T');

    // Lancement du chargement asynchrone des GLB
    this.preloadGLBModels();

    window.addEventListener('resize', () => this.onResize());
    setTimeout(() => this.onResize(), 100);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffecd1, 1.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffeed6, 2.5);
    mainLight.position.set(10, 22, 16);
    mainLight.castShadow = true;
    this.scene.add(mainLight);

    const hearthGlow = new THREE.PointLight(0xff7722, 2.5, 20);
    hearthGlow.position.set(0, -1, 3);
    this.scene.add(hearthGlow);

    const rimLight = new THREE.DirectionalLight(0xffb84d, 0.8);
    rimLight.position.set(-12, 10, -8);
    this.scene.add(rimLight);
  }

  buildOvenBackdrop() {
    // Fond sombre
    const wallGeo = new THREE.PlaneGeometry(10.5, 20.5);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x160c07,
      roughness: 0.88,
      metalness: 0.08
    });
    const backWall = new THREE.Mesh(wallGeo, wallMat);
    backWall.position.set(0, 9.5, -0.52);
    this.boardGroup.add(backWall);

    // Grillage de guidage
    const lineMat = new THREE.LineBasicMaterial({ color: 0x472715, transparent: true, opacity: 0.5 });
    for (let c = 0; c <= COLS; c++) {
      const x = (c - COLS / 2) * CELL_SIZE;
      const pts = [new THREE.Vector3(x, -0.5, -0.5), new THREE.Vector3(x, ROWS - 0.5, -0.5)];
      this.boardGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }
    for (let r = 0; r <= ROWS; r++) {
      const y = r * CELL_SIZE - 0.5;
      const pts = [new THREE.Vector3(-HALF_WIDTH, y, -0.5), new THREE.Vector3(HALF_WIDTH, y, -0.5)];
      this.boardGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
    }

    // Montants latéraux
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xb57c32, roughness: 0.4, metalness: 0.7 });
    const colGeo = new THREE.BoxGeometry(0.35, 21.2, 0.8);

    const leftCol = new THREE.Mesh(colGeo, brassMat);
    leftCol.position.set(-HALF_WIDTH - 0.2, 9.5, 0);
    this.boardGroup.add(leftCol);

    const rightCol = new THREE.Mesh(colGeo, brassMat);
    rightCol.position.set(HALF_WIDTH + 0.2, 9.5, 0);
    this.boardGroup.add(rightCol);

    // Sole de cuisson
    const hearthMat = new THREE.MeshStandardMaterial({ color: 0x22120a, roughness: 0.9 });
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(12, 0.8, 3), hearthMat);
    hearth.position.set(0, -0.9, 0.8);
    this.boardGroup.add(hearth);
  }

  setupFlourDust() {
    const count = 35;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

      velocities.push({
        vx: (Math.random() - 0.5) * 0.006,
        vy: -0.003 - Math.random() * 0.007,
        vz: (Math.random() - 0.5) * 0.006
      });
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffecd4,
      size: 0.25,
      transparent: true,
      opacity: 0.5
    });

    const dust = new THREE.Points(geom, mat);
    this.scene.add(dust);
    this.dustParticles = { mesh: dust, velocities, count };
  }

  preloadGLBModels() {
    const uniqueFiles = {
      I: './assets/blocks/block-i-bread-cubes.glb',
      O: './assets/blocks/block-o-pistachio-glow.glb',
      T: './assets/blocks/block-t-waffle-tower.glb',
      L: './assets/blocks/block-l-cosmic-indigo.glb',
      Z: './assets/blocks/block-z-crimson-snowflake.glb'
    };

    let loadedCount = 0;
    const totalCount = Object.keys(uniqueFiles).length;

    Object.entries(uniqueFiles).forEach(([key, path]) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          this.models[key] = gltf.scene;
          loadedCount++;
          if (loadedCount === totalCount) {
            this.isModelsReady = true;
            this.setupTitleDemoPiece('T');
          }
        },
        undefined,
        () => {
          loadedCount++;
          if (loadedCount === totalCount) this.isModelsReady = true;
        }
      );
    });
  }

  createPiece3D(type, isGhost = false) {
    const cfg = PIECE_CONFIG[type] || PIECE_CONFIG.I;
    const rootGroup = new THREE.Group();

    const sourceKey = type === 'J' ? 'L' : (type === 'S' ? 'Z' : type);
    const template = this.models[sourceKey];

    if (template) {
      const cloned = template.clone(true);
      cloned.rotation.set(cfg.baseRot[0], cfg.baseRot[1], cfg.baseRot[2]);
      cloned.position.set(cfg.baseOffset[0], cfg.baseOffset[1], cfg.baseOffset[2]);

      const sx = cfg.reflectX ? -cfg.scale : cfg.scale;
      cloned.scale.set(sx, cfg.scale, cfg.scale);

      if (isGhost) {
        const ghostMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(cfg.color),
          transparent: true,
          opacity: 0.28,
          wireframe: false
        });
        cloned.traverse((node) => {
          if (node.isMesh) node.material = ghostMat;
        });
      } else {
        cloned.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
      }

      rootGroup.add(cloned);
    } else {
      // Secours procédural instantané
      const boxGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(cfg.color),
        roughness: 0.35,
        transparent: isGhost,
        opacity: isGhost ? 0.3 : 1.0
      });
      const def = TETROMINOES[type].shapes[0];
      for (let r = 0; r < def.length; r++) {
        for (let c = 0; c < def[r].length; c++) {
          if (def[r][c]) {
            const cube = new THREE.Mesh(boxGeo, mat);
            cube.position.set(c - cfg.pivot[0], -(r - cfg.pivot[1]), 0);
            rootGroup.add(cube);
          }
        }
      }
    }

    return rootGroup;
  }

  setupTitleDemoPiece(type = 'T') {
    this.titleDecorGroup.clear();
    const piece = this.createPiece3D(type, false);
    piece.position.set(0, 9.5, 2.5);
    piece.scale.set(1.4, 1.4, 1.4);
    this.titleDecorGroup.add(piece);
    this.titleDemoMesh = piece;
  }

  showTitleMode(show) {
    this.titleDecorGroup.visible = show;
    this.boardGroup.visible = !show;
  }

  renderActivePiece(piece) {
    this.activePieceGroup.clear();
    if (!piece) return;

    const cfg = PIECE_CONFIG[piece.type];
    const mesh = this.createPiece3D(piece.type, false);

    const pivotCol = piece.col + cfg.pivot[0];
    const pivotRow = piece.row - cfg.pivot[1];

    const worldX = (pivotCol - COLS / 2 + 0.5) * CELL_SIZE;
    const worldY = pivotRow * CELL_SIZE;

    mesh.position.set(worldX, worldY, 0.4);
    mesh.rotation.z = -piece.rotation * (Math.PI / 2);

    this.activePieceGroup.add(mesh);
  }

  renderGhostPiece(piece, ghostRow) {
    this.ghostPieceGroup.clear();
    if (!piece || ghostRow === piece.row) return;

    const cfg = PIECE_CONFIG[piece.type];
    const mesh = this.createPiece3D(piece.type, true);

    const pivotCol = piece.col + cfg.pivot[0];
    const pivotRow = ghostRow - cfg.pivot[1];

    const worldX = (pivotCol - COLS / 2 + 0.5) * CELL_SIZE;
    const worldY = pivotRow * CELL_SIZE;

    mesh.position.set(worldX, worldY, 0.2);
    mesh.rotation.z = -piece.rotation * (Math.PI / 2);

    this.ghostPieceGroup.add(mesh);
  }

  rebuildLockedPieces(placedPieces, grid) {
    this.lockedPiecesGroup.clear();
    const boxGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);

    for (const p of placedPieces) {
      if (!p.broken) {
        const cfg = PIECE_CONFIG[p.type];
        const mesh = this.createPiece3D(p.type, false);
        const pivotCol = p.col + cfg.pivot[0];
        const pivotRow = p.row - cfg.pivot[1];
        const worldX = (pivotCol - COLS / 2 + 0.5) * CELL_SIZE;
        const worldY = pivotRow * CELL_SIZE;
        mesh.position.set(worldX, worldY, 0.4);
        mesh.rotation.z = -p.rot * (Math.PI / 2);
        this.lockedPiecesGroup.add(mesh);
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell && cell.broken) {
          const cfg = PIECE_CONFIG[cell.type] || PIECE_CONFIG.I;
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(cfg.color),
            roughness: 0.35,
            metalness: 0.08
          });
          const cube = new THREE.Mesh(boxGeo, mat);
          const worldX = (c - COLS / 2 + 0.5) * CELL_SIZE;
          const worldY = r * CELL_SIZE;
          cube.position.set(worldX, worldY, 0.4);
          cube.userData = { row: r, col: c };
          this.lockedPiecesGroup.add(cube);
        }
      }
    }
  }

  flashClearedRows(rowIndices, callback) {
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const targets = this.lockedPiecesGroup.children.filter(m =>
      m.userData && rowIndices.includes(m.userData.row)
    );
    targets.forEach(m => {
      m.material = flashMat;
      m.scale.set(1.15, 1.15, 1.15);
    });

    setTimeout(() => {
      if (callback) callback();
    }, 150);
  }

  spawnCrumbBurst(rows) {
    rows.forEach(r => {
      const y = r * CELL_SIZE;
      for (let i = 0; i < 28; i++) {
        const x = (Math.random() - 0.5) * (COLS * CELL_SIZE);
        const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
        const mat = new THREE.MeshStandardMaterial({
          color: Math.random() > 0.4 ? 0xffd15a : 0xf97316,
          roughness: 0.4
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + (Math.random() - 0.5) * 0.5, 0.5);

        this.particlesGroup.add(mesh);
        this.particles.push({
          mesh,
          vx: (Math.random() - 0.5) * 4.0,
          vy: 2.0 + Math.random() * 3.5,
          vz: (Math.random() - 0.5) * 2.5,
          rx: (Math.random() - 0.5) * 8.0,
          ry: (Math.random() - 0.5) * 8.0,
          life: 1.0,
          decay: 0.94
        });
      }
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 380;
    const height = this.container.clientHeight || 494;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  update(deltaTime) {
    if (this.titleDemoMesh && this.titleDecorGroup.visible) {
      this.titleDemoMesh.rotation.y += deltaTime * 1.2;
      this.titleDemoMesh.rotation.x = Math.sin(Date.now() * 0.002) * 0.25;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.mesh.position.x += p.vx * deltaTime;
      p.mesh.position.y += p.vy * deltaTime;
      p.mesh.position.z += p.vz * deltaTime;

      p.vy -= 9.8 * deltaTime;
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

    if (this.dustParticles && this.dustParticles.mesh) {
      const pos = this.dustParticles.mesh.geometry.attributes.position.array;
      for (let i = 0; i < this.dustParticles.count; i++) {
        const vel = this.dustParticles.velocities[i];
        pos[i * 3 + 0] += vel.vx;
        pos[i * 3 + 1] += vel.vy;
        pos[i * 3 + 2] += vel.vz;

        if (pos[i * 3 + 1] < -1.5) {
          pos[i * 3 + 1] = 21.0;
          pos[i * 3 + 0] = (Math.random() - 0.5) * 18;
        }
      }
      this.dustParticles.mesh.geometry.attributes.position.needsUpdate = true;
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

/* ==========================================================================
   PIÈCE ACTIVE TETROMINO
   ========================================================================== */

class TetrominoPiece {
  constructor(type) {
    this.type = type;
    this.rotation = 0;
    this.def = TETROMINOES[type];
    this.size = this.def.size;
    this.col = Math.floor((COLS - this.size) / 2);
    this.row = ROWS - 1;
  }

  getShape(rot = this.rotation) {
    return this.def.shapes[rot % 4];
  }
}

/* ==========================================================================
   CONTRÔLEUR CENTRAL DU JEU & MACHINE D'ÉTATS
   ========================================================================== */

class BwedBoyApp {
  constructor() {
    this.state = 'TITLE';

    this.grid = [];
    this.placedPieces = [];
    this.pieceIdCounter = 1;

    this.currentPiece = null;
    this.heldPieceType = null;
    this.canHold = true;

    this.bag = new TetrisBag();
    this.nextQueue = [];

    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.selectedStartLevel = 1;
    this.highScore = 0;
    this.highLines = 0;
    this.combo = -1;
    this.backToBack = false;

    this.lastDropTime = 0;
    this.lockTimer = 0;
    this.lockResets = 0;
    this.isOnGround = false;

    this.titleMenuIndex = 0;
    this.titleOptionsList = ['play', 'level-select', 'scores', 'help'];

    this.audio = new BwedAudioManager();
    this.screen3D = null;

    this.holdCanvas = null;
    this.nextCanvas = null;

    this.dom = {};
    this.initDOM();
    this.init();
  }

  initDOM() {
    this.dom = {
      titleMenu: document.getElementById('titleMenu'),
      levelMenu: document.getElementById('levelMenu'),
      scoresMenu: document.getElementById('scoresMenu'),
      helpMenu: document.getElementById('helpMenu'),
      pauseMenu: document.getElementById('pauseMenu'),
      gameOverMenu: document.getElementById('gameOverMenu'),
      screenHud: document.getElementById('screenHud'),
      screenToast: document.getElementById('screenToast'),
      toastTitle: document.getElementById('toastTitle'),
      toastSub: document.getElementById('toastSub'),

      hudScore: document.getElementById('hudScore'),
      hudLines: document.getElementById('hudLines'),
      hudLevel: document.getElementById('hudLevel'),
      holdSlotFrame: document.getElementById('holdSlotFrame'),
      nextSlotFrame: document.getElementById('nextSlotFrame'),
      holdEmptyText: document.getElementById('holdEmptyText'),

      selectedLevelNum: document.getElementById('selectedLevelNum'),
      selectedLevelSpeed: document.getElementById('selectedLevelSpeed'),
      btnPrevLevel: document.getElementById('btnPrevLevel'),
      btnNextLevel: document.getElementById('btnNextLevel'),
      btnStartWithLevel: document.getElementById('btnStartWithLevel'),
      btnBackFromLevel: document.getElementById('btnBackFromLevel'),

      recordScoreVal: document.getElementById('recordScoreVal'),
      recordLinesVal: document.getElementById('recordLinesVal'),
      recordRankVal: document.getElementById('recordRankVal'),
      btnBackFromScores: document.getElementById('btnBackFromScores'),

      btnBackFromHelp: document.getElementById('btnBackFromHelp'),

      btnResume: document.getElementById('btnResume'),
      btnRestartGame: document.getElementById('btnRestartGame'),
      btnToggleSound: document.getElementById('btnToggleSound'),
      soundOptLabel: document.getElementById('soundOptLabel'),
      btnQuitToTitle: document.getElementById('btnQuitToTitle'),

      finalScoreVal: document.getElementById('finalScoreVal'),
      finalLinesVal: document.getElementById('finalLinesVal'),
      finalRankLabel: document.getElementById('finalRankLabel'),
      btnRetryGame: document.getElementById('btnRetryGame'),
      btnOverToTitle: document.getElementById('btnOverToTitle'),

      btnDpadUp: document.getElementById('btnDpadUp'),
      btnDpadDown: document.getElementById('btnDpadDown'),
      btnDpadLeft: document.getElementById('btnDpadLeft'),
      btnDpadRight: document.getElementById('btnDpadRight'),
      btnActionA: document.getElementById('btnActionA'),
      btnActionB: document.getElementById('btnActionB'),
      btnActionX: document.getElementById('btnActionX'),
      btnStart: document.getElementById('btnStart'),
      btnSelect: document.getElementById('btnSelect')
    };

    if (this.dom.holdSlotFrame) {
      this.holdCanvas = document.createElement('canvas');
      this.holdCanvas.width = 64;
      this.holdCanvas.height = 42;
      this.holdCanvas.style.width = '100%';
      this.holdCanvas.style.height = '100%';
      this.dom.holdSlotFrame.appendChild(this.holdCanvas);
    }

    if (this.dom.nextSlotFrame) {
      this.nextCanvas = document.createElement('canvas');
      this.nextCanvas.width = 64;
      this.nextCanvas.height = 42;
      this.nextCanvas.style.width = '100%';
      this.nextCanvas.style.height = '100%';
      this.dom.nextSlotFrame.appendChild(this.nextCanvas);
    }
  }

  init() {
    this.loadScores();
    this.resetGrid();

    const canvasContainer = document.getElementById('canvasContainer');
    this.screen3D = new BwedBoyScreen3D(canvasContainer);

    this.bindEvents();
    this.setMenuState('TITLE');

    this.lastLoopTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  loadScores() {
    try {
      this.highScore = parseInt(localStorage.getItem('bwedboy_hiscore') || '0', 10);
      this.highLines = parseInt(localStorage.getItem('bwedboy_hilines') || '0', 10);
    } catch {
      this.highScore = 0;
      this.highLines = 0;
    }
    this.updateScoreRecordsUI();
  }

  saveScores() {
    try {
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem('bwedboy_hiscore', this.highScore.toString());
      }
      if (this.lines > this.highLines) {
        this.highLines = this.lines;
        localStorage.setItem('bwedboy_hilines', this.highLines.toString());
      }
    } catch {}
    this.updateScoreRecordsUI();
  }

  getRankName(score) {
    if (score >= 20000) return 'Légende Vivante du Bwedverse';
    if (score >= 12000) return 'Grand Chef Pâtissier';
    if (score >= 6000) return 'Maître du Fournil';
    if (score >= 2000) return 'Boulanger Compagnon';
    return 'Apprenti Mitron';
  }

  updateScoreRecordsUI() {
    if (this.dom.recordScoreVal) this.dom.recordScoreVal.textContent = this.highScore.toLocaleString('fr-FR');
    if (this.dom.recordLinesVal) this.dom.recordLinesVal.textContent = this.highLines.toString();
    if (this.dom.recordRankVal) this.dom.recordRankVal.textContent = this.getRankName(this.highScore);
  }

  resetGrid() {
    this.grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    this.placedPieces = [];
  }

  setMenuState(newState) {
    this.state = newState;

    const overlays = [
      this.dom.titleMenu,
      this.dom.levelMenu,
      this.dom.scoresMenu,
      this.dom.helpMenu,
      this.dom.pauseMenu,
      this.dom.gameOverMenu
    ];
    overlays.forEach(o => { if (o) o.hidden = true; });

    if (this.dom.screenHud) {
      this.dom.screenHud.hidden = (newState !== 'PLAYING');
    }

    if (this.screen3D) {
      this.screen3D.showTitleMode(newState === 'TITLE');
    }

    switch (newState) {
      case 'TITLE':
        if (this.dom.titleMenu) this.dom.titleMenu.hidden = false;
        this.updateTitleMenuSelection();
        break;
      case 'LEVEL_SELECT':
        if (this.dom.levelMenu) this.dom.levelMenu.hidden = false;
        this.updateLevelSelectUI();
        break;
      case 'SCORES':
        if (this.dom.scoresMenu) this.dom.scoresMenu.hidden = false;
        this.updateScoreRecordsUI();
        break;
      case 'HELP':
        if (this.dom.helpMenu) this.dom.helpMenu.hidden = false;
        break;
      case 'PAUSED':
        if (this.dom.pauseMenu) this.dom.pauseMenu.hidden = false;
        break;
      case 'GAMEOVER':
        if (this.dom.gameOverMenu) this.dom.gameOverMenu.hidden = false;
        if (this.dom.finalScoreVal) this.dom.finalScoreVal.textContent = this.score.toLocaleString('fr-FR');
        if (this.dom.finalLinesVal) this.dom.finalLinesVal.textContent = this.lines.toString();
        if (this.dom.finalRankLabel) this.dom.finalRankLabel.textContent = this.getRankName(this.score);
        break;
    }
  }

  updateTitleMenuSelection() {
    const btns = document.querySelectorAll('#titleOptions .retro-opt-btn');
    btns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === this.titleMenuIndex);
    });
  }

  updateLevelSelectUI() {
    if (this.dom.selectedLevelNum) {
      this.dom.selectedLevelNum.textContent = this.selectedStartLevel.toString();
    }
    if (this.dom.selectedLevelSpeed) {
      const labels = [
        'Vitesse : Douce',
        'Vitesse : Standard',
        'Vitesse : Cadencée',
        'Vitesse : Rapide',
        'Vitesse : Four Chaud',
        'Vitesse : Très Rapide',
        'Vitesse : Expert',
        'Vitesse : Cuisson Éclair',
        'Vitesse : Frénésie',
        'Vitesse : Légendaire'
      ];
      this.dom.selectedLevelSpeed.textContent = labels[this.selectedStartLevel - 1] || 'Vitesse : Éclair';
    }
  }

  startNewGame() {
    this.resetGrid();
    this.score = 0;
    this.lines = 0;
    this.level = this.selectedStartLevel;
    this.combo = -1;
    this.backToBack = false;
    this.heldPieceType = null;
    this.canHold = true;

    this.lastDropTime = performance.now();
    this.lockTimer = 0;
    this.isOnGround = false;

    this.bag = new TetrisBag();
    this.nextQueue = [this.bag.next(), this.bag.next(), this.bag.next()];

    this.updateHUD();
    this.renderPreviews();

    this.screen3D.rebuildLockedPieces(this.placedPieces, this.grid);
    this.setMenuState('PLAYING');
    this.spawnPiece();
    this.audio.playSelect();
  }

  spawnPiece() {
    const nextType = this.nextQueue.shift();
    this.nextQueue.push(this.bag.next());
    this.renderPreviews();

    this.currentPiece = new TetrominoPiece(nextType);
    this.canHold = true;
    this.lockResets = 0;
    this.isOnGround = false;

    if (this.checkCollision(this.currentPiece, this.currentPiece.col, this.currentPiece.row, this.currentPiece.rotation)) {
      this.triggerGameOver();
      return;
    }

    this.syncActive3D();
  }

  syncActive3D() {
    if (!this.screen3D || !this.currentPiece) return;
    const ghostRow = this.calculateGhostRow();
    this.screen3D.renderActivePiece(this.currentPiece);
    this.screen3D.renderGhostPiece(this.currentPiece, ghostRow);
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
          if (col < 0 || col >= COLS) return true;
          if (row < 0) return true;
          if (row < ROWS && this.grid[row][col] !== null) return true;
        }
      }
    }
    return false;
  }

  moveLeft() {
    if (this.state !== 'PLAYING' || !this.currentPiece) return;
    if (!this.checkCollision(this.currentPiece, this.currentPiece.col - 1, this.currentPiece.row, this.currentPiece.rotation)) {
      this.currentPiece.col--;
      this.onPieceManipulated();
      this.audio.playMove();
      this.syncActive3D();
    }
  }

  moveRight() {
    if (this.state !== 'PLAYING' || !this.currentPiece) return;
    if (!this.checkCollision(this.currentPiece, this.currentPiece.col + 1, this.currentPiece.row, this.currentPiece.rotation)) {
      this.currentPiece.col++;
      this.onPieceManipulated();
      this.audio.playMove();
      this.syncActive3D();
    }
  }

  rotate(clockwise = true) {
    if (this.state !== 'PLAYING' || !this.currentPiece) return;
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
        return;
      }
    }
  }

  softDrop() {
    if (this.state !== 'PLAYING' || !this.currentPiece) return;
    if (!this.checkCollision(this.currentPiece, this.currentPiece.col, this.currentPiece.row - 1, this.currentPiece.rotation)) {
      this.currentPiece.row--;
      this.score += 1;
      this.updateHUD();
      this.audio.playSoftDrop();
      this.syncActive3D();
    }
  }

  hardDrop() {
    if (this.state !== 'PLAYING' || !this.currentPiece) return;
    let dropped = 0;
    while (!this.checkCollision(this.currentPiece, this.currentPiece.col, this.currentPiece.row - 1, this.currentPiece.rotation)) {
      this.currentPiece.row--;
      dropped++;
    }
    this.score += dropped * 2;
    this.updateHUD();
    this.audio.playHardDrop();
    this.lockPiece();
  }

  hold() {
    if (this.state !== 'PLAYING' || !this.currentPiece || !this.canHold) return;
    this.audio.playHold();
    const type = this.currentPiece.type;

    if (!this.heldPieceType) {
      this.heldPieceType = type;
      this.spawnPiece();
    } else {
      const swap = this.heldPieceType;
      this.heldPieceType = type;
      this.currentPiece = new TetrominoPiece(swap);
      this.syncActive3D();
    }

    this.canHold = false;
    this.renderPreviews();
  }

  onPieceManipulated() {
    if (this.isOnGround && this.lockResets < MAX_LOCK_RESETS) {
      this.lockTimer = performance.now();
      this.lockResets++;
    }
  }

  lockPiece() {
    const pieceId = this.pieceIdCounter++;
    const shape = this.currentPiece.getShape();
    const cells = [];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const col = this.currentPiece.col + c;
          const row = this.currentPiece.row - r;
          if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            this.grid[row][col] = {
              type: this.currentPiece.type,
              pieceId,
              broken: false
            };
            cells.push({ col, row });
          }
        }
      }
    }

    this.placedPieces.push({
      id: pieceId,
      type: this.currentPiece.type,
      col: this.currentPiece.col,
      row: this.currentPiece.row,
      rot: this.currentPiece.rotation,
      cells,
      broken: false
    });

    this.currentPiece = null;
    this.screen3D.renderActivePiece(null);
    this.screen3D.renderGhostPiece(null, 0);
    this.screen3D.rebuildLockedPieces(this.placedPieces, this.grid);

    this.checkLines();
  }

  checkLines() {
    const clearedRows = [];
    for (let r = 0; r < ROWS; r++) {
      if (this.grid[r].every(c => c !== null)) {
        clearedRows.push(r);
      }
    }

    if (clearedRows.length > 0) {
      this.combo++;
      const isTetris = clearedRows.length === 4;

      const basePoints = { 1: 100, 2: 300, 3: 500, 4: 800 }[clearedRows.length] || 100;
      let lineScore = basePoints * this.level;

      if (isTetris) {
        if (this.backToBack) lineScore = Math.floor(lineScore * 1.5);
        this.backToBack = true;
      } else {
        this.backToBack = false;
      }

      if (this.combo > 0) {
        lineScore += 50 * this.combo * this.level;
      }

      this.score += lineScore;
      this.lines += clearedRows.length;

      const newLevel = Math.floor(this.lines / 10) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.showToast('NIVEAU SUPÉRIEUR !', `Four plus rapide (Niveau ${this.level})`);
      }

      this.saveScores();
      this.updateHUD();

      if (isTetris) {
        this.audio.playTetrisFanfare();
        this.showToast('TETRIS PUR BEURRE !', `+${lineScore} Points`);
      } else {
        this.audio.playLineClear(clearedRows.length);
        const titles = { 1: 'SIMPLE DORURE', 2: 'DOUBLE CROÛTE !', 3: 'TRIPLE FEUILLETAGE !' };
        this.showToast(titles[clearedRows.length] || 'LIGNE CUITE !', `+${lineScore} Points`);
      }

      this.screen3D.spawnCrumbBurst(clearedRows);

      for (const p of this.placedPieces) {
        const initCount = p.cells.length;
        p.cells = p.cells.filter(cell => !clearedRows.includes(cell.row));
        if (p.cells.length < initCount) {
          p.broken = true;
        }
        for (const cell of p.cells) {
          let drops = 0;
          for (const cr of clearedRows) {
            if (cell.row > cr) drops++;
          }
          cell.row -= drops;
        }
      }

      this.screen3D.flashClearedRows(clearedRows, () => {
        const remaining = this.grid.filter((_, idx) => !clearedRows.includes(idx));
        while (remaining.length < ROWS) {
          remaining.push(new Array(COLS).fill(null));
        }
        this.grid = remaining;

        for (const p of this.placedPieces) {
          if (p.broken) {
            for (const cell of p.cells) {
              if (this.grid[cell.row] && this.grid[cell.row][cell.col]) {
                this.grid[cell.row][cell.col].broken = true;
              }
            }
          }
        }

        this.screen3D.rebuildLockedPieces(this.placedPieces, this.grid);
        this.spawnPiece();
      });
    } else {
      this.combo = -1;
      this.spawnPiece();
    }
  }

  showToast(title, sub) {
    if (!this.dom.screenToast) return;
    this.dom.toastTitle.textContent = title;
    this.dom.toastSub.textContent = sub;
    this.dom.screenToast.hidden = false;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.dom.screenToast.hidden = true;
    }, 1600);
  }

  triggerGameOver() {
    this.setMenuState('GAMEOVER');
    this.audio.playGameOver();
    this.saveScores();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.setMenuState('PAUSED');
      this.audio.playSelect();
    } else if (this.state === 'PAUSED') {
      this.setMenuState('PLAYING');
      this.audio.playSelect();
    }
  }

  updateHUD() {
    if (this.dom.hudScore) this.dom.hudScore.textContent = this.score.toLocaleString('fr-FR');
    if (this.dom.hudLines) this.dom.hudLines.textContent = this.lines.toString();
    if (this.dom.hudLevel) this.dom.hudLevel.textContent = this.level.toString();
  }

  renderPreviews() {
    if (this.holdCanvas) {
      const ctx = this.holdCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
      if (this.heldPieceType) {
        if (this.dom.holdEmptyText) this.dom.holdEmptyText.hidden = true;
        this.drawPieceCanvas(ctx, this.heldPieceType, this.holdCanvas.width, this.holdCanvas.height);
      } else {
        if (this.dom.holdEmptyText) this.dom.holdEmptyText.hidden = false;
      }
    }

    if (this.nextCanvas && this.nextQueue.length > 0) {
      const ctx = this.nextCanvas.getContext('2d');
      ctx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
      this.drawPieceCanvas(ctx, this.nextQueue[0], this.nextCanvas.width, this.nextCanvas.height);
    }
  }

  drawPieceCanvas(ctx, type, w, h) {
    const def = TETROMINOES[type];
    if (!def) return;
    const shape = def.shapes[0];
    const cfg = PIECE_CONFIG[type] || PIECE_CONFIG.I;

    const cellSize = 10;
    const sRows = shape.length;
    const sCols = shape[0].length;

    let minR = sRows, maxR = -1, minC = sCols, maxC = -1;
    for (let r = 0; r < sRows; r++) {
      for (let c = 0; c < sCols; c++) {
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
    const startX = (w - usedW) / 2 - minC * cellSize;
    const startY = (h - usedH) / 2 - minR * cellSize;

    for (let r = 0; r < sRows; r++) {
      for (let c = 0; c < sCols; c++) {
        if (shape[r][c]) {
          const x = startX + c * cellSize;
          const y = startY + r * cellSize;

          ctx.fillStyle = cfg.color;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 2);
          } else {
            ctx.rect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          }
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x + 2, y + 2, cellSize - 4, 2, 1);
          } else {
            ctx.rect(x + 2, y + 2, cellSize - 4, 2);
          }
          ctx.fill();
        }
      }
    }
  }

  loop(timestamp) {
    const dt = (timestamp - this.lastLoopTime) / 1000;
    this.lastLoopTime = timestamp;

    if (this.state === 'PLAYING' && this.currentPiece) {
      const speedIdx = Math.min(this.level - 1, LEVEL_SPEEDS.length - 1);
      const interval = LEVEL_SPEEDS[speedIdx];

      const touching = this.checkCollision(
        this.currentPiece,
        this.currentPiece.col,
        this.currentPiece.row - 1,
        this.currentPiece.rotation
      );

      if (touching) {
        if (!this.isOnGround) {
          this.isOnGround = true;
          this.lockTimer = timestamp;
        } else if (timestamp - this.lockTimer >= LOCK_DELAY_MS) {
          this.lockPiece();
        }
      } else {
        this.isOnGround = false;
        if (timestamp - this.lastDropTime >= interval) {
          this.currentPiece.row--;
          this.lastDropTime = timestamp;
          this.syncActive3D();
        }
      }
    }

    if (this.screen3D) {
      this.screen3D.update(dt);
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  bindEvents() {
    // 1. Boutons du Menu Titre
    document.querySelectorAll('#titleOptions .retro-opt-btn').forEach((btn, idx) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.titleMenuIndex = idx;
        this.updateTitleMenuSelection();
        this.executeTitleAction(btn.dataset.action);
      });
    });

    // Clic n'importe où sur l'écran titre pour démarrer immédiatement
    document.getElementById('btnQuickPlay')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startNewGame();
    });

    this.dom.titleMenu?.addEventListener('click', (e) => {
      if (e.target.closest('.retro-opt-btn')) return;
      this.startNewGame();
    });

    document.getElementById('pressStartPrompt')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startNewGame();
    });

    // 2. Sélecteur de niveau
    this.dom.btnPrevLevel?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectedStartLevel = Math.max(1, this.selectedStartLevel - 1);
      this.audio.playCursor();
      this.updateLevelSelectUI();
    });

    this.dom.btnNextLevel?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectedStartLevel = Math.min(10, this.selectedStartLevel + 1);
      this.audio.playCursor();
      this.updateLevelSelectUI();
    });

    this.dom.btnStartWithLevel?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startNewGame();
    });

    this.dom.btnBackFromLevel?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playCursor();
      this.setMenuState('TITLE');
    });

    // 3. Palmarès & Aide
    this.dom.btnBackFromScores?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playCursor();
      this.setMenuState('TITLE');
    });

    this.dom.btnBackFromHelp?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playCursor();
      this.setMenuState('TITLE');
    });

    // 4. Menu Pause
    this.dom.btnResume?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePause();
    });

    this.dom.btnRestartGame?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startNewGame();
    });

    this.dom.btnToggleSound?.addEventListener('click', (e) => {
      e.stopPropagation();
      const on = this.audio.toggleMusic();
      if (this.dom.soundOptLabel) {
        this.dom.soundOptLabel.textContent = on ? 'SON : ACTIF' : 'SON : COUPE';
      }
    });

    this.dom.btnQuitToTitle?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playCursor();
      this.setMenuState('TITLE');
    });

    // 5. Game Over
    this.dom.btnRetryGame?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.startNewGame();
    });

    this.dom.btnOverToTitle?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.playCursor();
      this.setMenuState('TITLE');
    });

    // 6. Commandes physiques du châssis Bwed Boy (pointerdown + click avec anti-rebond)
    const addHoldOrClick = (el, action) => {
      if (!el) return;
      let lastCall = 0;
      const trigger = (e) => {
        const now = Date.now();
        if (now - lastCall < 120) return;
        lastCall = now;
        e.preventDefault();
        el.classList.add('pressed');
        setTimeout(() => el.classList.remove('pressed'), 120);
        action();
      };
      el.addEventListener('pointerdown', trigger);
      el.addEventListener('click', trigger);
    };

    addHoldOrClick(this.dom.btnDpadUp, () => this.handleDirection('up'));
    addHoldOrClick(this.dom.btnDpadDown, () => this.handleDirection('down'));
    addHoldOrClick(this.dom.btnDpadLeft, () => this.handleDirection('left'));
    addHoldOrClick(this.dom.btnDpadRight, () => this.handleDirection('right'));

    addHoldOrClick(this.dom.btnActionA, () => this.handleActionA());
    addHoldOrClick(this.dom.btnActionB, () => this.handleActionB());
    addHoldOrClick(this.dom.btnActionX, () => this.handleActionX());

    addHoldOrClick(this.dom.btnStart, () => this.handleStart());
    addHoldOrClick(this.dom.btnSelect, () => this.handleSelect());

    // 7. Commandes Clavier
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          this.handleDirection('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.handleDirection('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.handleDirection('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.handleDirection('right');
          break;
        case 'Enter':
          this.handleActionA();
          break;
        case ' ':
          this.handleActionX();
          break;
        case 'c':
        case 'C':
          this.handleActionB();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          this.handleStart();
          break;
      }
    });
  }

  handleDirection(dir) {
    if (this.state === 'TITLE') {
      if (dir === 'up') {
        this.titleMenuIndex = (this.titleMenuIndex + this.titleOptionsList.length - 1) % this.titleOptionsList.length;
        this.audio.playCursor();
        this.updateTitleMenuSelection();
      } else if (dir === 'down') {
        this.titleMenuIndex = (this.titleMenuIndex + 1) % this.titleOptionsList.length;
        this.audio.playCursor();
        this.updateTitleMenuSelection();
      }
      return;
    }

    if (this.state === 'LEVEL_SELECT') {
      if (dir === 'left') {
        this.selectedStartLevel = Math.max(1, this.selectedStartLevel - 1);
        this.audio.playCursor();
        this.updateLevelSelectUI();
      } else if (dir === 'right') {
        this.selectedStartLevel = Math.min(10, this.selectedStartLevel + 1);
        this.audio.playCursor();
        this.updateLevelSelectUI();
      }
      return;
    }

    if (this.state === 'PLAYING') {
      if (dir === 'left') this.moveLeft();
      if (dir === 'right') this.moveRight();
      if (dir === 'up') this.rotate(true);
      if (dir === 'down') this.softDrop();
    }
  }

  handleActionA() {
    if (this.state === 'TITLE') {
      const action = this.titleOptionsList[this.titleMenuIndex];
      this.executeTitleAction(action);
      return;
    }
    if (this.state === 'LEVEL_SELECT') {
      this.startNewGame();
      return;
    }
    if (this.state === 'SCORES' || this.state === 'HELP') {
      this.setMenuState('TITLE');
      this.audio.playCursor();
      return;
    }
    if (this.state === 'PLAYING') {
      this.rotate(true);
    }
  }

  handleActionB() {
    if (this.state === 'LEVEL_SELECT' || this.state === 'SCORES' || this.state === 'HELP') {
      this.setMenuState('TITLE');
      this.audio.playCursor();
      return;
    }
    if (this.state === 'PLAYING') {
      this.hold();
    }
  }

  handleActionX() {
    if (this.state === 'PLAYING') {
      this.hardDrop();
    }
  }

  handleStart() {
    if (this.state === 'TITLE') {
      this.startNewGame();
      return;
    }
    if (this.state === 'PLAYING' || this.state === 'PAUSED') {
      this.togglePause();
    }
  }

  handleSelect() {
    const on = this.audio.toggleMusic();
    if (this.dom.soundOptLabel) {
      this.dom.soundOptLabel.textContent = on ? 'SON : ACTIF' : 'SON : COUPE';
    }
  }

  executeTitleAction(action) {
    this.audio.playSelect();
    switch (action) {
      case 'play':
        this.startNewGame();
        break;
      case 'level-select':
        this.setMenuState('LEVEL_SELECT');
        break;
      case 'scores':
        this.setMenuState('SCORES');
        break;
      case 'help':
        this.setMenuState('HELP');
        break;
    }
  }
}

// Initialisation garantie même si DOMContentLoaded a déjà eu lieu
function boot() {
  if (!window.bwedBoyApp) {
    window.bwedBoyApp = new BwedBoyApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
