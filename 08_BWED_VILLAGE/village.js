// ============================================================================
// BWED VILLAGE 3D — MAIN ENGINE & GAME LOOP
// Dofus-style Isometric Tile Grid, A* Pathfinding, Procedural Rigged Avatar
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  MAP_CONFIG,
  TILE_TYPES,
  DISTRICTS,
  generateVillageGrid,
  VILLAGE_BUILDINGS,
  VILLAGE_LANTERNS,
  CITIZEN_HOUSES,
  VILLAGE_BENCHES,
  VILLAGE_BARRELS_CRATES,
  VILLAGE_NPCS
} from './village-map-data.js';
import {
  createWaffleTexture,
  createCobbleTexture,
  createGrassTexture,
  createVichyTexture,
  createCheckerTexture,
  createWoodTexture,
  createDirtTexture
} from './village-textures.js';

// --- GAME STATE ---
const state = {
  grid: null,
  player: {
    gridX: 25,
    gridZ: 22,
    worldPos: new THREE.Vector3(25 * MAP_CONFIG.tileSize, 0.04, 22 * MAP_CONFIG.tileSize),
    targetPos: new THREE.Vector3(25 * MAP_CONFIG.tileSize, 0.04, 22 * MAP_CONFIG.tileSize),
    rotation: 0,
    targetRotation: 0,
    isMoving: false,
    speed: 7.5,
    path: [],
    verticalVelocity: 0,
    isGrounded: true,
    activeEmote: null,
    emoteTimer: 0
  },
  camera: {
    azimuth: Math.PI / 4, // 45 deg classic Dofus isometric
    targetAzimuth: Math.PI / 4,
    pitch: Math.PI / 5.2, // ~34.6 deg isometric elevation
    distance: 26, // Close, charming tactile diorama zoom
    targetDistance: 26,
    minDistance: 12,
    maxDistance: 60,
    offset: new THREE.Vector3(0, 0, 0)
  },
  hoveredTile: null,
  nearbyBuilding: null,
  timeOfDay: 'day', // 'day', 'golden', 'night'
  audioPlaying: false,
  avatar: {
    pawnId: 'tiny-baker'
  },
  settings: {
    dpr: 1.25,
    shadows: true,
    fpsCap: 60,
    fog: true,
    musicVolume: 0.4,
    sfxVolume: 0.6,
    speed: 7.5,
    invertCam: false
  },
  quests: {
    plaza: false,
    patisserie: false,
    canal: false,
    observatory: false,
    woods: false
  }
};

// --- DOM REFERENCES ---
const container = document.getElementById('canvasContainer');
const districtNameEl = document.getElementById('districtName');
const interactionCard = document.getElementById('interactionCard');
const cardTitle = document.getElementById('cardTitle');
const cardDesc = document.getElementById('cardDesc');
const cardActionBtn = document.getElementById('cardActionBtn');
const cardActionLabel = document.getElementById('cardActionLabel');
const closeCardBtn = document.getElementById('closeCardBtn');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const todBtn = document.getElementById('todBtn');
const todIcon = document.getElementById('todIcon');
const camRotateBtn = document.getElementById('camRotateBtn');
const audioBtn = document.getElementById('audioBtn');
const audioIcon = document.getElementById('audioIcon');
const loaderEl = document.getElementById('villageLoader');
const loaderBar = document.getElementById('loaderBar');
const loaderStatus = document.getElementById('loaderStatus');

// Top Bar Action Buttons & Modals
const wardrobeBtn = document.getElementById('wardrobeBtn');
const mapBtn = document.getElementById('mapBtn');
const questBtn = document.getElementById('questBtn');
const settingsBtn = document.getElementById('settingsBtn');
const questCountBadge = document.getElementById('questCountBadge');
const modalBackdrop = document.getElementById('modalBackdrop');
const wardrobeModal = document.getElementById('wardrobeModal');
const mapModal = document.getElementById('mapModal');
const questModal = document.getElementById('questModal');
const settingsModal = document.getElementById('settingsModal');

// Toast Notification
const villageToast = document.getElementById('villageToast');
const toastIcon = document.getElementById('toastIcon');
const toastTitle = document.getElementById('toastTitle');
const toastMessage = document.getElementById('toastMessage');

// --- THREE.JS GLOBALS ---
let scene, camera, renderer, clock;
let sunLight, hemiLight;
let tileCursorMesh, targetMarkerMesh;
let playerMesh = null;
let pawnPivot = null;
let activePawnMesh = null;
const pawnCache = new Map();
let chocoMaterial = null;
const buildingObjects = [];
const landmarkPointLights = [];
const speechBubbles = [];
const particles = [];
let bgAudio = null;
let audioContext = null;

// Living Village Systems Globals
const npcInstances = [];
const chimneySmokeParticles = [];
const canalFloatingBuoys = [];
let pollenPoints = null;

// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  clock = new THREE.Clock();
  loadSavedState();
  state.grid = generateVillageGrid();

  // 1. Scene & Atmosphere (Warm, Luminous Ghibli/Animal Crossing Bakery Palette)
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfcf5e8); // Luminous soft honey-cream daylight sky
  scene.fog = new THREE.FogExp2(0xf6ebe0, 0.0035); // Gentle atmospheric perspective

  // 2. Camera (Isometric Perspective with close diorama intimacy)
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 320);
  updateCameraPosition(true);

  // 3. Renderer (Optimized for thermal efficiency: balanced DPR, standard PCF shadows)
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'default'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.appendChild(renderer.domElement);

  // 4. Lights & Sky
  setupLighting();

  // 5. Build Tile Grid
  buildInstancedTileGrid();

  // 6. Build Grid Helpers & Cursors
  setupCursors();

  // 7. Spawn Player Avatar (18 High-Fidelity GLB Heroes with Grounded Feet)
  initPlayerAvatar();

  // 8. Build Procedural Brioche Trees & Flora
  buildVillageVegetation();

  // 9. Build Modular Procedural Citizen Houses (10 Distinct Homes)
  buildCitizenHouses();

  // 10. Build Instanced Street Furniture & Props Kit (Benches, Barrels, Sacks)
  buildInstancedBenches();
  buildInstancedBarrelsAndCrates();

  // 11. Build Living Village NPCs (12 Interactive GLB Villagers)
  buildVillageNPCs();

  // 12. Build Living Village Systems (Chimney Smoke, Canal Buoys, Bunting, Pollen)
  buildChimneySmoke();
  buildChocolateCanalProps();
  buildStreetBunting();
  buildFloatingPollenParticles();

  // 13. Setup Key Landmark Colored Glows
  setupLandmarkLights();

  // 14. Load Village GLB Buildings & Props (Tracks actual progress)
  loadVillageBuildings();

  // 15. Input & Event Listeners
  setupEventListeners();

  // 16. UI Modals, Audio System & Quests Initialization
  initAudioSystem();
  setupModals();
  applySettings();
  updateQuestsUI();

  // 17. Safety fallback timeout for loader
  setTimeout(() => {
    if (!loaderEl.classList.contains('fade-out')) {
      loaderBar.style.width = '100%';
      loaderStatus.textContent = 'Village prêt ! Bienvenue à Bwedville.';
      loaderEl.classList.add('fade-out');
    }
  }, 7000);

  // 18. Start Loop
  renderer.setAnimationLoop(animate);
}

// ============================================================================
// LIGHTING & ATMOSPHERE (WARM COZY SUNNY PALETTE)
// ============================================================================
function setupLighting() {
  hemiLight = new THREE.HemisphereLight(0xfffaea, 0xd6aa70, 1.15);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight(0xfffaed, 1.75);
  sunLight.position.set(45, 65, 30);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 1024;
  sunLight.shadow.mapSize.height = 1024;
  sunLight.shadow.camera.near = 5;
  sunLight.shadow.camera.far = 250;
  const d = 75;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0003;
  scene.add(sunLight);

  // Instanced Street Lamps (2 draw calls total, glowing basic material bulbs)
  buildInstancedStreetLamps();
}

// Landmark Key Colored Lights (5 strategic dynamic lights for cool GPU operation)
function setupLandmarkLights() {
  const lights = [
    // Grand-Place: Warm Central Amber
    { x: 25, z: 25, y: 5.5, color: 0xffb84d, intensity: 2.2, dist: 35 },
    // Pâtisserie: Warm Amber Glow
    { x: 34, z: 25, y: 5.5, color: 0xff9933, intensity: 2.5, dist: 22 },
    // Taverne du Pot de Miel: Cozy Warm Hearth
    { x: 39, z: 18, y: 5.0, color: 0xffaa22, intensity: 2.2, dist: 20 },
    // Arcade BwedWare: Neon Cyan
    { x: 40, z: 41, y: 6.5, color: 0x00f0ff, intensity: 3.0, dist: 25 },
    // Observatoire Céleste: Mystic Purple
    { x: 8, z: 42, y: 9.0, color: 0xaa44ff, intensity: 3.2, dist: 30 }
  ];

  lights.forEach(l => {
    const pl = new THREE.PointLight(l.color, l.intensity, l.dist, 2);
    pl.position.set(l.x * MAP_CONFIG.tileSize, l.y, l.z * MAP_CONFIG.tileSize);
    scene.add(pl);
    landmarkPointLights.push(pl);
  });
}

function setTimeOfDay(tod) {
  state.timeOfDay = tod;
  if (tod === 'day') {
    scene.background.set(0xfcf5e8);
    scene.fog.color.set(0xf6ebe0);
    scene.fog.density = 0.0035;
    hemiLight.color.set(0xfffaea);
    hemiLight.groundColor.set(0xd6aa70);
    hemiLight.intensity = 1.15;
    sunLight.color.set(0xfffaed);
    sunLight.intensity = 1.75;
    sunLight.position.set(45, 65, 30);
    landmarkPointLights.forEach(l => (l.intensity = 0.6));
    todIcon.textContent = 'Soleil Doré';
  } else if (tod === 'golden') {
    scene.background.set(0xf8d4a8);
    scene.fog.color.set(0xf5c391);
    scene.fog.density = 0.0042;
    hemiLight.color.set(0xffaa55);
    hemiLight.groundColor.set(0x5a2310);
    hemiLight.intensity = 1.1;
    sunLight.color.set(0xff8833);
    sunLight.intensity = 1.85;
    sunLight.position.set(55, 35, 15);
    landmarkPointLights.forEach(l => (l.intensity = 1.5));
    todIcon.textContent = 'Heure Dorée';
  } else if (tod === 'night') {
    scene.background.set(0x131a2b);
    scene.fog.color.set(0x131a2b);
    scene.fog.density = 0.0055;
    hemiLight.color.set(0x3a4f77);
    hemiLight.groundColor.set(0x1a1210);
    hemiLight.intensity = 0.55;
    sunLight.color.set(0x5577bb);
    sunLight.intensity = 0.45;
    sunLight.position.set(-30, 45, -30);
    landmarkPointLights.forEach(l => (l.intensity = 2.8));
    todIcon.textContent = 'Nuit Cosy';
  }
}

// ============================================================================
// TILE GRID GENERATION (INSTANCED MESH)
// ============================================================================
function buildInstancedTileGrid() {
  const { width, height, tileSize } = MAP_CONFIG;
  const totalTiles = width * height;

  // Single beveled rounded tile geometry
  const tileGeo = new THREE.BoxGeometry(tileSize * 0.96, 0.45, tileSize * 0.96);

  // Procedural Canvas Textures (0 KB download, pure runtime generation)
  const cobbleTex = createCobbleTexture();
  const grassTex = createGrassTexture();
  const waffleTex = createWaffleTexture();
  const vichyTex = createVichyTexture();
  const checkerTex = createCheckerTexture();
  const woodTex = createWoodTexture();
  const dirtTex = createDirtTexture();

  // Materials for each tile type
  const materials = {
    [TILE_TYPES.COBBLE_SABLE]: new THREE.MeshStandardMaterial({
      map: cobbleTex,
      roughness: 0.85,
      metalness: 0.05
    }),
    [TILE_TYPES.MATCHA_GRASS]: new THREE.MeshStandardMaterial({
      map: grassTex,
      roughness: 0.95,
      metalness: 0.02
    }),
    [TILE_TYPES.WAFFLE_PLAZA]: new THREE.MeshStandardMaterial({
      map: waffleTex,
      roughness: 0.7,
      metalness: 0.08
    }),
    [TILE_TYPES.VICHY_PICNIC]: new THREE.MeshStandardMaterial({
      map: vichyTex,
      roughness: 0.8,
      metalness: 0.02
    }),
    [TILE_TYPES.CHECKER_BOARD]: new THREE.MeshStandardMaterial({
      map: checkerTex,
      roughness: 0.5,
      metalness: 0.1
    }),
    [TILE_TYPES.WOOD_PIER]: new THREE.MeshStandardMaterial({
      map: woodTex,
      roughness: 0.75,
      metalness: 0.04
    }),
    [TILE_TYPES.FOREST_DIRT]: new THREE.MeshStandardMaterial({
      map: dirtTex,
      roughness: 0.9,
      metalness: 0.02
    }),
    [TILE_TYPES.CANE_SAND]: new THREE.MeshStandardMaterial({
      color: 0xdeb887,
      roughness: 0.85,
      metalness: 0.02
    }),
    [TILE_TYPES.CHOCO_CANAL]: new THREE.MeshStandardMaterial({
      color: 0x38180c,
      roughness: 0.25,
      metalness: 0.15
    }),
    [TILE_TYPES.MILLEFEUILLE_ROCK]: new THREE.MeshStandardMaterial({
      color: 0xb58253,
      roughness: 0.9,
      metalness: 0.05
    })
  };

  chocoMaterial = materials[TILE_TYPES.CHOCO_CANAL];

  // Create an InstancedMesh per material
  const instancedMeshes = {};
  Object.keys(materials).forEach(type => {
    const mesh = new THREE.InstancedMesh(tileGeo, materials[type], totalTiles);
    mesh.castShadow = false; // Optim: Ground tiles never cast shadows, saving 2500 shadow passes
    mesh.receiveShadow = true;
    scene.add(mesh);
    instancedMeshes[type] = { mesh, count: 0 };
  });

  const dummy = new THREE.Object3D();

  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      const tile = state.grid[z][x];
      const inst = instancedMeshes[tile.type];
      if (!inst) continue;

      const worldX = x * tileSize;
      const worldZ = z * tileSize;
      const worldY = tile.elevation * MAP_CONFIG.elevationStep;

      dummy.position.set(worldX, worldY - 0.2, worldZ);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      inst.mesh.setMatrixAt(inst.count, dummy.matrix);
      inst.count++;
    }
  }

  // Update instance counts
  Object.values(instancedMeshes).forEach(inst => {
    inst.mesh.count = inst.count;
    inst.mesh.instanceMatrix.needsUpdate = true;
  });
}

// Instanced Street Lamps (2 Draw Calls for all 24 lamps, 0 extra PointLights)
function buildInstancedStreetLamps() {
  const count = VILLAGE_LANTERNS.length;
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.8,
    roughness: 0.35
  });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffe277 });

  const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.0, 8);
  const cageGeo = new THREE.SphereGeometry(0.35, 8, 8);

  const poleInstanced = new THREE.InstancedMesh(poleGeo, brassMat, count);
  poleInstanced.castShadow = true;
  poleInstanced.receiveShadow = true;

  const cageInstanced = new THREE.InstancedMesh(cageGeo, glowMat, count);

  const dummy = new THREE.Object3D();

  VILLAGE_LANTERNS.forEach((pos, idx) => {
    const wx = pos.x * MAP_CONFIG.tileSize;
    const wz = pos.z * MAP_CONFIG.tileSize;
    const tile = state.grid[pos.z] && state.grid[pos.z][pos.x];
    const wy = tile ? tile.elevation * MAP_CONFIG.elevationStep : 0;

    // Pole matrix
    dummy.position.set(wx, wy + 1.5, wz);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    poleInstanced.setMatrixAt(idx, dummy.matrix);

    // Glowing lantern cage matrix
    dummy.position.set(wx, wy + 3.1, wz);
    dummy.updateMatrix();
    cageInstanced.setMatrixAt(idx, dummy.matrix);
  });

  poleInstanced.instanceMatrix.needsUpdate = true;
  cageInstanced.instanceMatrix.needsUpdate = true;

  scene.add(poleInstanced);
  scene.add(cageInstanced);
}

// Instanced Brioche Trees (Only 4 Draw Calls for all 20 trees)
function buildVillageVegetation() {
  const treePositions = [
    // Grand-Place Corners
    { x: 19, z: 19 }, { x: 31, z: 19 },
    { x: 19, z: 31 }, { x: 31, z: 31 },
    // Boulevard Central Nord-Sud
    { x: 23, z: 15 }, { x: 27, z: 15 },
    { x: 23, z: 34 }, { x: 27, z: 34 },
    { x: 23, z: 44 }, { x: 27, z: 44 },
    // Boulevard Est-Ouest
    { x: 14, z: 23 }, { x: 14, z: 27 },
    { x: 36, z: 23 }, { x: 36, z: 27 },
    // Parc Macarons (Faubourg Ouest)
    { x: 8, z: 28 }, { x: 14, z: 28 },
    { x: 8, z: 33 }, { x: 14, z: 33 },
    // Quai du Canal
    { x: 6, z: 12 }, { x: 16, z: 12 },
    { x: 34, z: 12 }, { x: 44, z: 12 },
    // Fête Foraine Perimeter
    { x: 46, z: 36 }, { x: 46, z: 44 },
    // Colline de l'Observatoire
    { x: 4, z: 45 }, { x: 12, z: 46 }
  ];

  const totalTrees = treePositions.length;
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x5a2d12, roughness: 0.85 });
  const briocheMat = new THREE.MeshStandardMaterial({ color: 0xdd9738, roughness: 0.6 });
  const pearlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.35, 2.2, 8);
  const crownGeo = new THREE.SphereGeometry(1.15, 10, 8);
  crownGeo.scale(1.1, 0.85, 1.1);
  const sideBunGeo = new THREE.SphereGeometry(0.65, 8, 6);
  sideBunGeo.scale(0.9, 0.75, 0.9);
  const pearlGeo = new THREE.SphereGeometry(0.22, 6, 6);

  const trunkInstanced = new THREE.InstancedMesh(trunkGeo, barkMat, totalTrees);
  trunkInstanced.castShadow = true;
  trunkInstanced.receiveShadow = true;

  const crownInstanced = new THREE.InstancedMesh(crownGeo, briocheMat, totalTrees);
  crownInstanced.castShadow = true;
  crownInstanced.receiveShadow = true;

  const sideBunsInstanced = new THREE.InstancedMesh(sideBunGeo, briocheMat, totalTrees * 3);
  sideBunsInstanced.castShadow = true;
  sideBunsInstanced.receiveShadow = true;

  const pearlInstanced = new THREE.InstancedMesh(pearlGeo, pearlMat, totalTrees);

  const dummy = new THREE.Object3D();
  let sideBunCount = 0;

  treePositions.forEach((pos, idx) => {
    const wx = pos.x * MAP_CONFIG.tileSize;
    const wz = pos.z * MAP_CONFIG.tileSize;
    const tile = state.grid[pos.z] && state.grid[pos.z][pos.x];
    const wy = tile ? tile.elevation * MAP_CONFIG.elevationStep : 0;
    const s = 0.85 + (idx % 4) * 0.1;

    // 1. Trunk
    dummy.position.set(wx, wy + 1.1 * s, wz);
    dummy.scale.set(s, s, s);
    dummy.rotation.set(0, idx * 1.37, 0);
    dummy.updateMatrix();
    trunkInstanced.setMatrixAt(idx, dummy.matrix);

    // 2. Crown
    dummy.position.set(wx, wy + 2.4 * s, wz);
    dummy.updateMatrix();
    crownInstanced.setMatrixAt(idx, dummy.matrix);

    // 3. Side Buns (3 around crown)
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + idx * 1.37;
      dummy.position.set(
        wx + Math.cos(angle) * 0.7 * s,
        wy + 2.65 * s,
        wz + Math.sin(angle) * 0.7 * s
      );
      dummy.updateMatrix();
      sideBunsInstanced.setMatrixAt(sideBunCount++, dummy.matrix);
    }

    // 4. Pearl
    dummy.position.set(wx, wy + 3.35 * s, wz);
    dummy.updateMatrix();
    pearlInstanced.setMatrixAt(idx, dummy.matrix);

    if (tile) tile.walkable = false;
  });

  trunkInstanced.instanceMatrix.needsUpdate = true;
  crownInstanced.instanceMatrix.needsUpdate = true;
  sideBunsInstanced.instanceMatrix.needsUpdate = true;
  pearlInstanced.instanceMatrix.needsUpdate = true;

  scene.add(trunkInstanced);
  scene.add(crownInstanced);
  scene.add(sideBunsInstanced);
  scene.add(pearlInstanced);
}

// ============================================================================
// MODULAR PROCEDURAL CITIZEN HOUSES (10 HOMES & WORKSHOPS)
// ============================================================================
function buildCitizenHouses() {
  CITIZEN_HOUSES.forEach(h => {
    const group = new THREE.Group();
    const s = h.scale || 1.0;
    const wx = h.gridX * MAP_CONFIG.tileSize;
    const wz = h.gridZ * MAP_CONFIG.tileSize;
    const tile = state.grid[h.gridZ] && state.grid[h.gridZ][h.gridX];
    const wy = tile ? tile.elevation * MAP_CONFIG.elevationStep : 0;

    // 1. House Body (Brioche Dough Walls with soft crumb texture)
    const bodyGeo = new THREE.BoxGeometry(2.4 * s, 1.8 * s, 2.1 * s);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: h.wallColor || 0xfbf1e3,
      roughness: 0.8,
      metalness: 0.04
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9 * s;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 2. Glazed Wafer Roof
    const roofMat = new THREE.MeshStandardMaterial({
      color: h.roofColor || 0xe65271,
      roughness: 0.5,
      metalness: 0.08
    });

    if (h.roofType === 'dome') {
      // Round brioche dome roof
      const domeGeo = new THREE.SphereGeometry(1.45 * s, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const dome = new THREE.Mesh(domeGeo, roofMat);
      dome.position.y = 1.8 * s;
      dome.scale.set(1.15, 0.95, 1.05);
      dome.castShadow = true;
      group.add(dome);
    } else {
      // Pitched roof (wafer gable prism)
      const roofGeo = new THREE.ConeGeometry(1.9 * s, 1.3 * s, 4);
      roofGeo.rotateY(Math.PI / 4);
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.position.y = 2.45 * s;
      roof.scale.set(1.15, 1.0, 1.05);
      roof.castShadow = true;
      group.add(roof);
    }

    // 3. Arched Chocolate Door & Brass Handle
    const doorGeo = new THREE.BoxGeometry(0.55 * s, 0.95 * s, 0.08 * s);
    const chocoMat = new THREE.MeshStandardMaterial({ color: 0x3d1c0e, roughness: 0.6 });
    const door = new THREE.Mesh(doorGeo, chocoMat);
    door.position.set(0, 0.48 * s, 1.06 * s);
    group.add(door);

    const knobGeo = new THREE.SphereGeometry(0.05 * s, 8, 8);
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
    const knob = new THREE.Mesh(knobGeo, brassMat);
    knob.position.set(0.18 * s, 0.5 * s, 1.11 * s);
    group.add(knob);

    // 4. Biscuit Windows
    const winGeo = new THREE.BoxGeometry(0.48 * s, 0.48 * s, 0.06 * s);
    const winMat = new THREE.MeshStandardMaterial({ color: 0xfff6ea, roughness: 0.4 });
    const winL = new THREE.Mesh(winGeo, winMat);
    winL.position.set(-0.75 * s, 1.1 * s, 1.06 * s);
    group.add(winL);

    const winR = new THREE.Mesh(winGeo, winMat);
    winR.position.set(0.75 * s, 1.1 * s, 1.06 * s);
    group.add(winR);

    // 5. Canelé Chimney with Sugar Smoke Puff
    const chimGeo = new THREE.CylinderGeometry(0.16 * s, 0.22 * s, 0.7 * s, 8);
    const chimMat = new THREE.MeshStandardMaterial({ color: 0x421e10, roughness: 0.7 });
    const chimney = new THREE.Mesh(chimGeo, chimMat);
    chimney.position.set(0.7 * s, 2.5 * s, -0.3 * s);
    chimney.castShadow = true;
    group.add(chimney);

    const smokeGeo = new THREE.SphereGeometry(0.2 * s, 8, 8);
    const smokeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
    const smoke = new THREE.Mesh(smokeGeo, smokeMat);
    smoke.position.set(0.7 * s, 3.0 * s, -0.3 * s);
    group.add(smoke);

    group.position.set(wx, wy, wz);
    group.rotation.y = h.rotationY || 0;
    scene.add(group);

    // Register into buildingObjects for proximity interaction card
    buildingObjects.push({ config: h, mesh: group });

    // Mark tiles as occupied in state grid
    for (let dz = -1; dz <= 1; dz++) {
      for (let dx = -1; dx <= 1; dx++) {
        const gx = h.gridX + dx;
        const gz = h.gridZ + dz;
        if (state.grid[gz] && state.grid[gz][gx]) {
          state.grid[gz][gx].walkable = false;
          state.grid[gz][gx].occupant = h;
        }
      }
    }
  });
}

// ============================================================================
// INSTANCED STREET PROPS (BENCHES, BARRELS, CRATES & SACKS)
// ============================================================================
function buildInstancedBenches() {
  const count = VILLAGE_BENCHES.length;
  const waferMat = new THREE.MeshStandardMaterial({ color: 0xdd9c44, roughness: 0.65 });
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3d1b0d, roughness: 0.7 });

  const seatGeo = new THREE.BoxGeometry(1.5, 0.12, 0.55);
  const backGeo = new THREE.BoxGeometry(1.5, 0.45, 0.1);
  const legGeo = new THREE.BoxGeometry(0.12, 0.45, 0.45);

  const seatInstanced = new THREE.InstancedMesh(seatGeo, waferMat, count);
  seatInstanced.castShadow = true;
  seatInstanced.receiveShadow = true;

  const backInstanced = new THREE.InstancedMesh(backGeo, waferMat, count);
  backInstanced.castShadow = true;

  const legInstanced = new THREE.InstancedMesh(legGeo, legMat, count * 2);
  legInstanced.castShadow = true;

  const dummy = new THREE.Object3D();
  let legCount = 0;

  VILLAGE_BENCHES.forEach((b, idx) => {
    const wx = b.x * MAP_CONFIG.tileSize;
    const wz = b.z * MAP_CONFIG.tileSize;
    const tile = state.grid[b.z] && state.grid[b.z][b.x];
    const wy = tile ? tile.elevation * MAP_CONFIG.elevationStep : 0;
    const rot = b.rot || 0;

    // Seat
    dummy.position.set(wx, wy + 0.45, wz);
    dummy.rotation.set(0, rot, 0);
    dummy.updateMatrix();
    seatInstanced.setMatrixAt(idx, dummy.matrix);

    // Backrest
    const backOffset = new THREE.Vector3(0, 0.25, -0.22).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
    dummy.position.set(wx + backOffset.x, wy + 0.45 + backOffset.y, wz + backOffset.z);
    dummy.updateMatrix();
    backInstanced.setMatrixAt(idx, dummy.matrix);

    // Left & Right Legs
    [-0.6, 0.6].forEach(dx => {
      const legOffset = new THREE.Vector3(dx, -0.2, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
      dummy.position.set(wx + legOffset.x, wy + 0.45 + legOffset.y, wz + legOffset.z);
      dummy.updateMatrix();
      legInstanced.setMatrixAt(legCount++, dummy.matrix);
    });

    if (tile) tile.walkable = false;
  });

  seatInstanced.instanceMatrix.needsUpdate = true;
  backInstanced.instanceMatrix.needsUpdate = true;
  legInstanced.instanceMatrix.needsUpdate = true;

  scene.add(seatInstanced);
  scene.add(backInstanced);
  scene.add(legInstanced);
}

function buildInstancedBarrelsAndCrates() {
  const items = VILLAGE_BARRELS_CRATES;
  const count = items.length;

  const barrelMat = new THREE.MeshStandardMaterial({ color: 0x7a4625, roughness: 0.7 });
  const crateMat = new THREE.MeshStandardMaterial({ color: 0xc4935a, roughness: 0.8 });
  const sackMat = new THREE.MeshStandardMaterial({ color: 0xf5ead6, roughness: 0.95 });

  const barrelGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.85, 10);
  const crateGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
  const sackGeo = new THREE.SphereGeometry(0.42, 8, 8);
  sackGeo.scale(1.0, 1.25, 0.85);

  const barrelInst = new THREE.InstancedMesh(barrelGeo, barrelMat, count);
  barrelInst.castShadow = true;
  barrelInst.receiveShadow = true;

  const crateInst = new THREE.InstancedMesh(crateGeo, crateMat, count);
  crateInst.castShadow = true;
  crateInst.receiveShadow = true;

  const sackInst = new THREE.InstancedMesh(sackGeo, sackMat, count);
  sackInst.castShadow = true;
  sackInst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let bCount = 0, cCount = 0, sCount = 0;

  items.forEach(it => {
    const wx = it.x * MAP_CONFIG.tileSize;
    const wz = it.z * MAP_CONFIG.tileSize;
    const tile = state.grid[it.z] && state.grid[it.z][it.x];
    const wy = tile ? tile.elevation * MAP_CONFIG.elevationStep : 0;

    if (it.type === 'barrel') {
      dummy.position.set(wx, wy + 0.42, wz);
      dummy.rotation.set(0, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      barrelInst.setMatrixAt(bCount++, dummy.matrix);
    } else if (it.type === 'crate') {
      dummy.position.set(wx, wy + 0.38, wz);
      dummy.rotation.set(0, (it.x + it.z) * 0.3, 0);
      dummy.updateMatrix();
      crateInst.setMatrixAt(cCount++, dummy.matrix);
    } else {
      dummy.position.set(wx, wy + 0.45, wz);
      dummy.rotation.set(0.1, (it.x + it.z) * 0.5, 0);
      dummy.updateMatrix();
      sackInst.setMatrixAt(sCount++, dummy.matrix);
    }

    if (tile) tile.walkable = false;
  });

  if (bCount > 0) { barrelInst.count = bCount; barrelInst.instanceMatrix.needsUpdate = true; scene.add(barrelInst); }
  if (cCount > 0) { crateInst.count = cCount; crateInst.instanceMatrix.needsUpdate = true; scene.add(crateInst); }
  if (sCount > 0) { sackInst.count = sCount; sackInst.instanceMatrix.needsUpdate = true; scene.add(sackInst); }
}

// ============================================================================
// CURSORS & DOFUS-STYLE TILE HIGHLIGHT
// ============================================================================
function setupCursors() {
  const { tileSize } = MAP_CONFIG;

  // 1. Hover tile highlight frame
  const cursorGeo = new THREE.RingGeometry(tileSize * 0.44, tileSize * 0.48, 4);
  cursorGeo.rotateX(-Math.PI / 2);
  cursorGeo.rotateY(Math.PI / 4); // Align square
  const cursorMat = new THREE.MeshBasicMaterial({
    color: 0xffd15a,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  tileCursorMesh = new THREE.Mesh(cursorGeo, cursorMat);
  tileCursorMesh.position.y = 0.08;
  tileCursorMesh.visible = false;
  scene.add(tileCursorMesh);

  // 2. Click destination target marker
  const targetGeo = new THREE.RingGeometry(0.2, 0.45, 24);
  targetGeo.rotateX(-Math.PI / 2);
  const targetMat = new THREE.MeshBasicMaterial({
    color: 0xff6b35,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.95
  });
  targetMarkerMesh = new THREE.Mesh(targetGeo, targetMat);
  targetMarkerMesh.position.y = 0.09;
  targetMarkerMesh.visible = false;
  scene.add(targetMarkerMesh);
}

// ============================================================================
// AVATAR SYSTEM & 18 HIGH-FIDELITY GLB HEROES
// ============================================================================
const PAWN_FILES = {
  'tiny-baker': './assets/pawns/tiny-baker.glb',
  'super-hero-bwed': './assets/pawns/super-hero-bwed.glb',
  'shadow-ninja': './assets/pawns/shadow-ninja.glb',
  'crimson-samurai': './assets/pawns/crimson-samurai.glb',
  'brave-firefighter': './assets/pawns/brave-firefighter.glb',
  'crimson-mage': './assets/pawns/crimson-mage.glb',
  'choco-drip': './assets/pawns/choco-drip.glb',
  'cloud-ninja': './assets/pawns/cloud-ninja.glb',
  'crumb-burglar': './assets/pawns/crumb-burglar.glb',
  'frankenbwed': './assets/pawns/frankenbwed.glb',
  'glow-toast': './assets/pawns/glow-toast.glb',
  'judge-gaveltoes': './assets/pawns/judge-gaveltoes.glb',
  'nerdy-buddy': './assets/pawns/nerdy-buddy.glb',
  'rusty-buttonbot': './assets/pawns/rusty-buttonbot.glb',
  'saiyan-toast': './assets/pawns/saiyan-toast.glb',
  'toast-bandit': './assets/pawns/toast-bandit.glb',
  'toast-tycoon': './assets/pawns/toast-tycoon.glb',
  'whale-buddy': './assets/pawns/whale-buddy.glb'
};

function initPlayerAvatar() {
  playerMesh = new THREE.Group();
  playerMesh.position.copy(state.player.worldPos);

  // pawnPivot holds the active GLB model.
  // Animations only oscillate pawnPivot.position.y (bounce) and pawnPivot.rotation.z (waddle).
  // The model inside pawnPivot has a fixed position.y so feet/soles never penetrate the ground!
  pawnPivot = new THREE.Group();
  pawnPivot.position.y = 0;
  playerMesh.add(pawnPivot);

  scene.add(playerMesh);

  // Load selected avatar (defaults to tiny-baker or saved state)
  const initialPawn = state.avatar.pawnId || 'tiny-baker';
  loadAndSetAvatar(initialPawn);
}

function loadAndSetAvatar(pawnId) {
  state.avatar.pawnId = pawnId;
  saveAvatarState();

  if (activePawnMesh) {
    activePawnMesh.visible = false;
  }

  if (pawnCache.has(pawnId)) {
    activePawnMesh = pawnCache.get(pawnId);
    activePawnMesh.visible = true;
    return;
  }

  const filePath = PAWN_FILES[pawnId] || PAWN_FILES['tiny-baker'];
  if (!filePath) return;

  const gltfLoader = new GLTFLoader();
  gltfLoader.load(
    filePath,
    gltf => {
      const model = gltf.scene;

      // Compute bounding box to normalize height to ~1.65m
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scaleFactor = 1.65 / (maxDim || 1);
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Re-measure after scale and align base at y = 0
      model.updateMatrixWorld(true);
      const scaledBox = new THREE.Box3().setFromObject(model);
      model.position.y = -scaledBox.min.y;

      model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.roughness = Math.max(child.material.roughness || 0.6, 0.45);
          }
        }
      });

      pawnPivot.add(model);
      pawnCache.set(pawnId, model);

      if (state.avatar.pawnId === pawnId) {
        activePawnMesh = model;
        activePawnMesh.visible = true;
      } else {
        model.visible = false;
      }
    },
    undefined,
    err => {
      console.warn('Erreur chargement avatar héroïque:', pawnId, err);
    }
  );
}

// ============================================================================
// LIVING VILLAGE NPCS (12 INTERACTIVE GLB CITIZENS)
// ============================================================================
function buildVillageNPCs() {
  if (!VILLAGE_NPCS || VILLAGE_NPCS.length === 0) return;

  const loader = new GLTFLoader();

  VILLAGE_NPCS.forEach(npc => {
    const tile = state.grid[npc.gridZ] && state.grid[npc.gridZ][npc.gridX];
    const targetGroundY = tile ? tile.elevation * MAP_CONFIG.elevationStep + 0.04 : 0.04;
    const worldX = npc.gridX * MAP_CONFIG.tileSize;
    const worldZ = npc.gridZ * MAP_CONFIG.tileSize;

    const npcGroup = new THREE.Group();
    npcGroup.position.set(worldX, targetGroundY, worldZ);

    const npcPivot = new THREE.Group();
    npcPivot.rotation.y = npc.rotationY || 0;
    npcGroup.add(npcPivot);

    scene.add(npcGroup);

    if (tile) {
      tile.walkable = false;
    }

    const npcData = {
      config: npc,
      group: npcGroup,
      pivot: npcPivot,
      model: null,
      baseRotationY: npc.rotationY || 0,
      dialogueIdx: 0,
      bubbleEl: null,
      bubbleTimer: 0
    };
    npcInstances.push(npcData);

    const filePath = PAWN_FILES[npc.pawnId] || PAWN_FILES['tiny-baker'];
    loader.load(
      filePath,
      gltf => {
        const model = gltf.scene;
        model.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 1.6 / (maxDim || 1);
        model.scale.set(scaleFactor, scaleFactor, scaleFactor);

        model.updateMatrixWorld(true);
        const scaledBox = new THREE.Box3().setFromObject(model);
        model.position.y = -scaledBox.min.y;

        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        npcPivot.add(model);
        npcData.model = model;
      },
      undefined,
      err => {
        console.warn('Erreur chargement modèle PNJ:', npc.name, err);
      }
    );
  });
}

function updateVillageNPCs(dt) {
  const pPos = state.player.worldPos;
  const t = clock.elapsedTime;

  for (let i = 0; i < npcInstances.length; i++) {
    const npc = npcInstances[i];
    const nPos = npc.group.position;
    const dist = pPos.distanceTo(nPos);

    // Idle breathing
    npc.pivot.position.y = Math.sin(t * 2.2 + i * 1.3) * 0.02;

    // Head-tracking / facing player when nearby
    if (dist < 6.0) {
      const dx = pPos.x - nPos.x;
      const dz = pPos.z - nPos.z;
      const targetAngle = Math.atan2(dx, dz);
      let diff = targetAngle - npc.pivot.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      npc.pivot.rotation.y += diff * 0.08;
    } else {
      let diff = npc.baseRotationY - npc.pivot.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      npc.pivot.rotation.y += diff * 0.05;
    }

    // Proximity speech bubble
    if (dist < 3.4 && npc.bubbleTimer <= 0) {
      const dialogues = npc.config.dialogues;
      if (dialogues && dialogues.length > 0) {
        const text = dialogues[npc.dialogueIdx % dialogues.length];
        npc.dialogueIdx++;
        spawnNpcSpeechBubble(npc, text);
        npc.bubbleTimer = 6.5;
      }
    }

    if (npc.bubbleTimer > 0) {
      npc.bubbleTimer -= dt;
      if (npc.bubbleEl) {
        if (npc.bubbleTimer <= 0 || dist > 7.0) {
          npc.bubbleEl.remove();
          npc.bubbleEl = null;
        } else {
          // Project 3D position above NPC head to screen
          const headPos = new THREE.Vector3(nPos.x, nPos.y + 2.2, nPos.z);
          headPos.project(camera);
          const screenX = (headPos.x * 0.5 + 0.5) * window.innerWidth;
          const screenY = (headPos.y * -0.5 + 0.5) * window.innerHeight;
          npc.bubbleEl.style.left = `${screenX}px`;
          npc.bubbleEl.style.top = `${screenY}px`;
          if (npc.bubbleTimer < 0.8) {
            npc.bubbleEl.style.opacity = (npc.bubbleTimer / 0.8).toFixed(2);
          }
        }
      }
    }
  }
}

function spawnNpcSpeechBubble(npc, text) {
  if (npc.bubbleEl) {
    npc.bubbleEl.remove();
    npc.bubbleEl = null;
  }

  const el = document.createElement('div');
  el.className = 'speech-bubble npc-bubble';
  el.innerHTML = `<strong>${npc.config.name}</strong><span>${text}</span>`;
  container.appendChild(el);
  npc.bubbleEl = el;
}

// ============================================================================
// LIVING VILLAGE SYSTEMS (SMOKE, CANAL BUOYS, BUNTING, POLLEN)
// ============================================================================
function buildChimneySmoke() {
  const chimneyOrigins = [
    new THREE.Vector3(21 * 2, 7.8, 25 * 2), // Grande Pâtisserie
    new THREE.Vector3(37 * 2, 7.2, 23 * 2), // Taverne du Miel
    new THREE.Vector3(6 * 2, 5.0, 16 * 2),  // Cottage Fraisier
    new THREE.Vector3(14 * 2, 5.0, 16 * 2), // Villa Matcha
    new THREE.Vector3(8 * 2, 5.0, 32 * 2),  // Manoir Pain d'Épices
    new THREE.Vector3(42 * 2, 5.0, 34 * 2)  // Comptoir Sucré
  ];

  const puffGeo = new THREE.SphereGeometry(0.22, 7, 7);
  const puffMat = new THREE.MeshStandardMaterial({
    color: 0xfffcf5,
    roughness: 0.95,
    transparent: true,
    opacity: 0.45
  });

  chimneyOrigins.forEach((origin, oIdx) => {
    for (let p = 0; p < 5; p++) {
      const mesh = new THREE.Mesh(puffGeo, puffMat);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      scene.add(mesh);

      const life = (p / 5) * 2.8;
      chimneySmokeParticles.push({
        mesh,
        origin: origin.clone(),
        life,
        maxLife: 2.8,
        swirlOffset: oIdx * 1.5 + p
      });
    }
  });
}

function updateChimneySmoke(dt) {
  const t = clock.elapsedTime;
  for (let i = 0; i < chimneySmokeParticles.length; i++) {
    const sp = chimneySmokeParticles[i];
    sp.life += dt;
    if (sp.life >= sp.maxLife) {
      sp.life = 0;
    }

    const progress = sp.life / sp.maxLife;
    const riseY = progress * 2.8;
    const driftX = Math.sin(t * 1.2 + sp.swirlOffset) * 0.35 * progress;
    const driftZ = Math.cos(t * 1.0 + sp.swirlOffset) * 0.35 * progress;

    sp.mesh.position.set(
      sp.origin.x + driftX,
      sp.origin.y + riseY,
      sp.origin.z + driftZ
    );

    const s = 0.6 + progress * 1.4;
    sp.mesh.scale.set(s, s * 0.8, s);
    sp.mesh.visible = true;
  }
}

function buildChocolateCanalProps() {
  const buoyGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.35, 12);
  const buoyMatA = new THREE.MeshStandardMaterial({ color: 0xffe8d6, roughness: 0.3 }); // Chamallow vanille
  const buoyMatB = new THREE.MeshStandardMaterial({ color: 0xff99c8, roughness: 0.3 }); // Guimauve fraise

  const buoyLocations = [
    { x: 5, z: 10, phase: 0 },
    { x: 17, z: 10, phase: 1.2 },
    { x: 31, z: 10, phase: 2.5 },
    { x: 44, z: 10, phase: 4.1 }
  ];

  buoyLocations.forEach((loc, idx) => {
    const mesh = new THREE.Mesh(buoyGeo, idx % 2 === 0 ? buoyMatA : buoyMatB);
    const wx = loc.x * MAP_CONFIG.tileSize;
    const wz = loc.z * MAP_CONFIG.tileSize;
    mesh.position.set(wx, -0.4, wz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    canalFloatingBuoys.push({
      mesh,
      baseY: -0.4,
      phase: loc.phase
    });
  });
}

function updateCanalBuoys(dt) {
  const t = clock.elapsedTime;
  for (let i = 0; i < canalFloatingBuoys.length; i++) {
    const b = canalFloatingBuoys[i];
    b.mesh.position.y = b.baseY + Math.sin(t * 2.2 + b.phase) * 0.05;
    b.mesh.rotation.z = Math.sin(t * 1.8 + b.phase) * 0.08;
    b.mesh.rotation.x = Math.cos(t * 1.5 + b.phase) * 0.06;
  }
}

function buildStreetBunting() {
  const lines = [
    { start: new THREE.Vector3(21 * 2, 4.4, 21 * 2), end: new THREE.Vector3(29 * 2, 4.4, 21 * 2) },
    { start: new THREE.Vector3(21 * 2, 4.4, 29 * 2), end: new THREE.Vector3(29 * 2, 4.4, 29 * 2) },
    { start: new THREE.Vector3(21 * 2, 4.4, 21 * 2), end: new THREE.Vector3(21 * 2, 4.4, 29 * 2) },
    { start: new THREE.Vector3(29 * 2, 4.4, 21 * 2), end: new THREE.Vector3(29 * 2, 4.4, 29 * 2) }
  ];

  const colors = [0xff6b35, 0xffd15a, 0x2ec4b6, 0xe65271, 0xba6e38];
  const triGeo = new THREE.ConeGeometry(0.22, 0.42, 3);
  triGeo.rotateX(Math.PI);

  lines.forEach(line => {
    const numFlags = 10;
    for (let f = 1; f < numFlags; f++) {
      const frac = f / numFlags;
      const pos = new THREE.Vector3().lerpVectors(line.start, line.end, frac);
      const sag = Math.sin(frac * Math.PI) * 0.45;
      pos.y -= sag;

      const flagMat = new THREE.MeshStandardMaterial({
        color: colors[f % colors.length],
        roughness: 0.6,
        side: THREE.DoubleSide
      });
      const flagMesh = new THREE.Mesh(triGeo, flagMat);
      flagMesh.position.copy(pos);
      flagMesh.rotation.y = frac * Math.PI;
      scene.add(flagMesh);
    }
  });
}

function buildFloatingPollenParticles() {
  const count = 120;
  const positions = new Float32Array(count * 3);
  const mapWidth = MAP_CONFIG.width * MAP_CONFIG.tileSize;
  const mapHeight = MAP_CONFIG.height * MAP_CONFIG.tileSize;

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] = Math.random() * mapWidth;
    positions[i * 3 + 1] = 1.0 + Math.random() * 8.0;
    positions[i * 3 + 2] = Math.random() * mapHeight;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xfffae0,
    size: 0.16,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  pollenPoints = new THREE.Points(geo, mat);
  scene.add(pollenPoints);
}

function updatePollenParticles(dt) {
  if (!pollenPoints) return;
  const positions = pollenPoints.geometry.attributes.position.array;
  const count = positions.length / 3;
  const t = clock.elapsedTime;
  const mapWidth = MAP_CONFIG.width * MAP_CONFIG.tileSize;
  const mapHeight = MAP_CONFIG.height * MAP_CONFIG.tileSize;

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 0] += Math.sin(t * 0.5 + i) * 0.4 * dt;
    positions[i * 3 + 1] -= 0.25 * dt;
    positions[i * 3 + 2] += Math.cos(t * 0.5 + i) * 0.3 * dt;

    if (positions[i * 3 + 1] < 0.2) {
      positions[i * 3 + 1] = 7.5 + Math.random() * 2.0;
      positions[i * 3 + 0] = Math.random() * mapWidth;
      positions[i * 3 + 2] = Math.random() * mapHeight;
    }
  }
  pollenPoints.geometry.attributes.position.needsUpdate = true;
}

// Particle system for flour crumbs and teleportation effects
function spawnCrumbBurst(position, count = 16) {
  for (let i = 0; i < count; i++) {
    const geo = new THREE.SphereGeometry(0.07 + Math.random() * 0.06, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: Math.random() > 0.5 ? 0xffd15a : 0xfff7ea
    });
    const p = new THREE.Mesh(geo, mat);
    p.position.copy(position);
    p.position.y += 0.5 + Math.random() * 0.5;
    scene.add(p);

    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 4,
      2.5 + Math.random() * 3,
      (Math.random() - 0.5) * 4
    );

    particles.push({ mesh: p, vel, life: 1.0, maxLife: 1.0 });
  }
}

function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const pt = particles[i];
    pt.life -= dt;
    if (pt.life <= 0) {
      scene.remove(pt.mesh);
      pt.mesh.geometry.dispose();
      pt.mesh.material.dispose();
      particles.splice(i, 1);
    } else {
      pt.vel.y -= 9.8 * dt; // gravity
      pt.mesh.position.addScaledVector(pt.vel, dt);
      const s = Math.max(0.01, pt.life / pt.maxLife);
      pt.mesh.scale.set(s, s, s);
    }
  }
}

// ============================================================================
// VILLAGE GLB BUILDINGS LOADER (TRACKS REAL ASSET PROGRESS)
// ============================================================================
function loadVillageBuildings() {
  const loader = new GLTFLoader();
  const total = VILLAGE_BUILDINGS.length;
  let loadedCount = 0;

  function onBuildingLoaded(b, gltf) {
    const model = gltf.scene;
    const worldX = b.gridX * MAP_CONFIG.tileSize;
    const worldZ = b.gridZ * MAP_CONFIG.tileSize;

    // Apply scale and rotation first to compute true world bounding box
    model.scale.set(b.scale, b.scale, b.scale);
    model.rotation.y = b.rotationY || 0;
    model.position.set(worldX, 0, worldZ);
    model.updateMatrixWorld(true);

    // Align base of building perfectly with ground elevation (solves sunken models bug)
    const box = new THREE.Box3().setFromObject(model);
    const tile = state.grid[b.gridZ] && state.grid[b.gridZ][b.gridX];
    const targetGroundY = tile ? tile.elevation * MAP_CONFIG.elevationStep + 0.02 : 0.02;
    model.position.y += (targetGroundY - box.min.y);

    // Shadows & Material optimization
    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = Math.min(child.material.roughness, 0.85);
        }
      }
    });

    scene.add(model);
    buildingObjects.push({ config: b, mesh: model });

    // Mark tiles as occupied in the grid
    const halfW = Math.max(1, Math.floor(b.sizeX / 2));
    const halfH = Math.max(1, Math.floor(b.sizeZ / 2));
    for (let dz = -halfH; dz <= halfH; dz++) {
      for (let dx = -halfW; dx <= halfW; dx++) {
        const gx = b.gridX + dx;
        const gz = b.gridZ + dz;
        if (state.grid[gz] && state.grid[gz][gx]) {
          state.grid[gz][gx].walkable = false;
          state.grid[gz][gx].occupant = b;
        }
      }
    }

    loadedCount++;
    const pct = Math.round((loadedCount / total) * 100);
    loaderBar.style.width = `${pct}%`;
    loaderStatus.textContent = `Bâtiments 3D chargés (${loadedCount}/${total}) : ${b.name}`;

    if (loadedCount >= total) {
      setTimeout(() => {
        loaderStatus.textContent = 'Tous les bâtiments 3D sont en place ! Bienvenue à Bwedville.';
        setTimeout(() => {
          loaderEl.classList.add('fade-out');
        }, 350);
      }, 250);
    }
  }

  VILLAGE_BUILDINGS.forEach(b => {
    loader.load(
      b.model,
      gltf => onBuildingLoaded(b, gltf),
      undefined,
      err => {
        console.warn(`Could not load building model ${b.model}`, err);
        loadedCount++;
        const pct = Math.round((loadedCount / total) * 100);
        loaderBar.style.width = `${pct}%`;
        if (loadedCount >= total) {
          loaderEl.classList.add('fade-out');
        }
      }
    );
  });
}

// ============================================================================
// PATHFINDING & MOVEMENT (A* ALGORITHM ON TILE GRID)
// ============================================================================
function findPath(startX, startZ, endX, endZ) {
  const { width, height } = MAP_CONFIG;
  const grid = state.grid;

  if (endX < 0 || endX >= width || endZ < 0 || endZ >= height) return [];
  if (!grid[endZ][endX].walkable) return [];

  // A* implementation
  const startNode = { x: startX, z: startZ, g: 0, h: heuristic(startX, startZ, endX, endZ), parent: null };
  const openSet = [startNode];
  const closedSet = new Set();
  const nodeMap = new Map();

  const key = (x, z) => `${x},${z}`;
  nodeMap.set(key(startX, startZ), startNode);

  while (openSet.length > 0) {
    // Get lowest f = g + h
    openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
    const current = openSet.shift();

    if (current.x === endX && current.z === endZ) {
      // Reconstruct path
      const path = [];
      let curr = current;
      while (curr.parent) {
        path.push({ x: curr.x, z: curr.z });
        curr = curr.parent;
      }
      return path.reverse();
    }

    closedSet.add(key(current.x, current.z));

    // 4 cardinal neighbors
    const neighbors = [
      { x: current.x + 1, z: current.z },
      { x: current.x - 1, z: current.z },
      { x: current.x, z: current.z + 1 },
      { x: current.x, z: current.z - 1 }
    ];

    for (const n of neighbors) {
      if (n.x < 0 || n.x >= width || n.z < 0 || n.z >= height) continue;
      if (closedSet.has(key(n.x, n.z))) continue;
      if (!grid[n.z][n.x].walkable) continue;

      const tentativeG = current.g + 1;
      let neighborNode = nodeMap.get(key(n.x, n.z));

      if (!neighborNode) {
        neighborNode = {
          x: n.x,
          z: n.z,
          g: tentativeG,
          h: heuristic(n.x, n.z, endX, endZ),
          parent: current
        };
        nodeMap.set(key(n.x, n.z), neighborNode);
        openSet.push(neighborNode);
      } else if (tentativeG < neighborNode.g) {
        neighborNode.g = tentativeG;
        neighborNode.parent = current;
      }
    }
  }

  return [];
}

function heuristic(x1, z1, x2, z2) {
  return Math.abs(x1 - x2) + Math.abs(z1 - z2);
}

function navigateToTile(gridX, gridZ) {
  const currentGridX = Math.round(state.player.worldPos.x / MAP_CONFIG.tileSize);
  const currentGridZ = Math.round(state.player.worldPos.z / MAP_CONFIG.tileSize);

  const path = findPath(currentGridX, currentGridZ, gridX, gridZ);
  if (path.length > 0) {
    state.player.path = path;
    state.player.isMoving = true;

    // Show target marker
    targetMarkerMesh.position.set(gridX * MAP_CONFIG.tileSize, 0.08, gridZ * MAP_CONFIG.tileSize);
    targetMarkerMesh.visible = true;
  }
}

// ============================================================================
// CAMERA ISOMETRIC CONTROLS
// ============================================================================
function updateCameraPosition(immediate = false) {
  const p = state.player.worldPos;
  const c = state.camera;

  // Smooth lerp distance and rotation
  if (immediate) {
    c.azimuth = c.targetAzimuth;
    c.distance = c.targetDistance;
  } else {
    c.azimuth += (c.targetAzimuth - c.azimuth) * 0.1;
    c.distance += (c.targetDistance - c.distance) * 0.1;
  }

  const cx = p.x + c.distance * Math.cos(c.azimuth) * Math.cos(c.pitch);
  const cy = p.y + c.distance * Math.sin(c.pitch) + 3;
  const cz = p.z + c.distance * Math.sin(c.azimuth) * Math.cos(c.pitch);

  camera.position.set(cx, cy, cz);
  camera.lookAt(p.x, p.y + 1.2, p.z);
}

function rotateCamera(direction = 1) {
  const mult = (state.settings && state.settings.invertCam ? -1 : 1) * direction;
  state.camera.targetAzimuth += mult * (Math.PI / 4);
}

// ============================================================================
// SPEECH BUBBLE SYSTEM (DOFUS / HABBO)
// ============================================================================
function spawnSpeechBubble(text) {
  if (!text.trim()) return;

  const bubbleEl = document.createElement('div');
  bubbleEl.className = 'speech-bubble';
  bubbleEl.textContent = text;
  document.body.appendChild(bubbleEl);

  const bubble = {
    element: bubbleEl,
    timer: 5.0, // seconds
    offsetY: 2.2 // Above Bwed head
  };

  speechBubbles.push(bubble);

  // Jump animation on speech
  triggerEmote('wave');
}

function updateSpeechBubbles(dt) {
  const p = state.player.worldPos;
  const headPos = new THREE.Vector3(p.x, p.y + 2.2, p.z);
  headPos.project(camera);

  const screenX = (headPos.x * 0.5 + 0.5) * window.innerWidth;
  const screenY = (headPos.y * -0.5 + 0.5) * window.innerHeight;

  for (let i = speechBubbles.length - 1; i >= 0; i--) {
    const b = speechBubbles[i];
    b.timer -= dt;

    if (b.timer <= 0) {
      b.element.remove();
      speechBubbles.splice(i, 1);
    } else {
      b.element.style.left = `${screenX}px`;
      b.element.style.top = `${screenY}px`;
      if (b.timer < 0.6) {
        b.element.style.opacity = (b.timer / 0.6).toFixed(2);
      }
    }
  }
}

// ============================================================================
// EMOTE & ANIMATION SYSTEM
// ============================================================================
function triggerEmote(name) {
  state.player.activeEmote = name;
  state.player.emoteTimer = 1.4;

  if (name === 'jump' && state.player.isGrounded) {
    state.player.verticalVelocity = 8.5;
    state.player.isGrounded = false;
    playSfx('click');
  } else if (name === 'crumb') {
    spawnCrumbBurst(state.player.worldPos, 18);
    spawnSpeechBubble('Miettes semées !');
    playSfx('click');
  } else if (name === 'wave') {
    spawnSpeechBubble('Coucou tout le monde !');
    playSfx('click');
  } else if (name === 'cheer') {
    spawnSpeechBubble('Bravo ! Vive Bwedville !');
    playSfx('click');
  }
}

// ============================================================================
// EVENT LISTENERS & INPUT
// ============================================================================
const keysDown = new Set();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function setupEventListeners() {
  window.addEventListener('resize', onWindowResize);

  // 1. Mouse move for tile hover
  window.addEventListener('pointermove', onPointerMove);

  // 2. Mouse click for Dofus-style pathfinding
  window.addEventListener('pointerdown', onPointerDown);

  // 3. Zoom via Wheel
  window.addEventListener('wheel', e => {
    state.camera.targetDistance = THREE.MathUtils.clamp(
      state.camera.targetDistance + e.deltaY * 0.02,
      state.camera.minDistance,
      state.camera.maxDistance
    );
  }, { passive: true });

  // 4. Keyboard Direct Controls
  window.addEventListener('keydown', e => {
    // Ignore keydown if typing in chat
    if (document.activeElement === chatInput) return;

    keysDown.add(e.code);

    if (e.code === 'KeyQ') rotateCamera(-1);
    if (e.code === 'KeyE') rotateCamera(1);
    if (e.code === 'Space') triggerEmote('jump');
    if (e.code === 'Escape') closeAllModals();
    if (e.code === 'Enter') {
      chatInput.focus();
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', e => {
    keysDown.delete(e.code);
  });

  // 5. HUD Actions
  todBtn.addEventListener('click', () => {
    const nextTOD = state.timeOfDay === 'day' ? 'golden' : state.timeOfDay === 'golden' ? 'night' : 'day';
    setTimeOfDay(nextTOD);
  });

  camRotateBtn.addEventListener('click', () => rotateCamera(1));

  audioBtn.addEventListener('click', () => {
    state.audioPlaying = !state.audioPlaying;
    audioIcon.textContent = state.audioPlaying ? 'Musique : ON' : 'Musique : OFF';
    audioBtn.classList.toggle('active', state.audioPlaying);
    if (bgAudio) {
      if (state.audioPlaying) {
        bgAudio.play().catch(() => {});
      } else {
        bgAudio.pause();
      }
    }
  });

  closeCardBtn.addEventListener('click', () => {
    interactionCard.hidden = true;
  });

  // 6. Chat form submit
  chatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      spawnSpeechBubble(text);
      chatInput.value = '';
      chatInput.blur();
    }
  });

  // 7. Emote buttons
  document.querySelectorAll('.emote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      triggerEmote(btn.dataset.emote);
    });
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(e) {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(groundPlane, intersectPoint);

  if (intersectPoint) {
    const gx = Math.round(intersectPoint.x / MAP_CONFIG.tileSize);
    const gz = Math.round(intersectPoint.z / MAP_CONFIG.tileSize);

    if (gx >= 0 && gx < MAP_CONFIG.width && gz >= 0 && gz < MAP_CONFIG.height) {
      state.hoveredTile = { x: gx, z: gz };
      tileCursorMesh.position.set(gx * MAP_CONFIG.tileSize, 0.08, gz * MAP_CONFIG.tileSize);
      tileCursorMesh.visible = true;
    } else {
      tileCursorMesh.visible = false;
      state.hoveredTile = null;
    }
  }
}

function onPointerDown(e) {
  // Prevent if clicking HUD UI
  if (e.target.closest('.village-hud')) return;

  if (state.hoveredTile) {
    navigateToTile(state.hoveredTile.x, state.hoveredTile.z);
  }
}

// ============================================================================
// MAIN ANIMATION LOOP (CAPPED AT 60 FPS FOR COOL GPU THERMALS)
// ============================================================================
let lastRenderTimestamp = 0;

function animate(timestamp) {
  const targetFrameInterval = 1000 / (state.settings.fpsCap || 60);

  // Cap rendering on high-refresh rate displays or low-power mode
  if (timestamp) {
    const elapsed = timestamp - lastRenderTimestamp;
    if (elapsed < targetFrameInterval - 1.5) {
      return;
    }
    lastRenderTimestamp = timestamp;
  }

  const dt = Math.min(clock.getDelta(), 0.1);

  // 1. Process Inputs (Keyboard direct movement or Path following)
  updateMovement(dt);

  // 2. Procedural Avatar Animations (Waddle, Walk, Idle, Emotes)
  updateAvatarAnimation(dt);

  // 3. Camera Follow
  updateCameraPosition();

  // 4. District & Building Proximity Check
  checkProximity();

  // 5. Update Speech Bubbles (2D projection over 3D head)
  updateSpeechBubbles(dt);

  // 6. Update Flour Crumb Particles
  updateParticles(dt);

  // 7. Pulse Cursors
  if (tileCursorMesh.visible) {
    const s = 1 + Math.sin(clock.elapsedTime * 6) * 0.04;
    tileCursorMesh.scale.set(s, s, 1);
  }

  // 8. Liquid Chocolate Canal Shimmer Animation
  if (chocoMaterial) {
    chocoMaterial.roughness = 0.22 + Math.sin(clock.elapsedTime * 1.8) * 0.08;
  }

  // 9. Update Living Village Systems (NPCs, Chimney Smoke, Canal Buoys, Pollen)
  updateVillageNPCs(dt);
  updateChimneySmoke(dt);
  updateCanalBuoys(dt);
  updatePollenParticles(dt);

  // 10. Render
  renderer.render(scene, camera);
}

// Movement Handler (Combines Point-and-Click Pathfinding & WASD Direct Movement)
function updateMovement(dt) {
  const p = state.player;

  // Check Direct Keyboard Input
  let dirX = 0;
  let dirZ = 0;

  if (keysDown.has('KeyW') || keysDown.has('ArrowUp')) dirZ -= 1;
  if (keysDown.has('KeyS') || keysDown.has('ArrowDown')) dirZ += 1;
  if (keysDown.has('KeyA') || keysDown.has('ArrowLeft')) dirX -= 1;
  if (keysDown.has('KeyD') || keysDown.has('ArrowRight')) dirX += 1;

  if (dirX !== 0 || dirZ !== 0) {
    // Cancel pathfinding on manual input
    p.path = [];
    targetMarkerMesh.visible = false;
    p.isMoving = true;

    // Transform direction by camera azimuth
    const angle = Math.atan2(dirZ, dirX) + state.camera.azimuth - Math.PI / 4;
    const moveX = Math.cos(angle) * p.speed * dt;
    const moveZ = Math.sin(angle) * p.speed * dt;

    p.targetRotation = Math.atan2(moveX, moveZ);

    const nextX = p.worldPos.x + moveX;
    const nextZ = p.worldPos.z + moveZ;

    // Collision check against non-walkable tiles
    const checkGX = Math.round(nextX / MAP_CONFIG.tileSize);
    const checkGZ = Math.round(nextZ / MAP_CONFIG.tileSize);

    if (
      checkGX >= 0 && checkGX < MAP_CONFIG.width &&
      checkGZ >= 0 && checkGZ < MAP_CONFIG.height &&
      state.grid[checkGZ][checkGX].walkable
    ) {
      p.worldPos.x = nextX;
      p.worldPos.z = nextZ;
    }
  } else if (p.path.length > 0) {
    // Follow Path Waypoints
    const target = p.path[0];
    const targetWorldX = target.x * MAP_CONFIG.tileSize;
    const targetWorldZ = target.z * MAP_CONFIG.tileSize;

    const dx = targetWorldX - p.worldPos.x;
    const dz = targetWorldZ - p.worldPos.z;
    const dist = Math.hypot(dx, dz);

    p.targetRotation = Math.atan2(dx, dz);

    if (dist < 0.2) {
      p.worldPos.x = targetWorldX;
      p.worldPos.z = targetWorldZ;
      p.path.shift();

      if (p.path.length === 0) {
        p.isMoving = false;
        targetMarkerMesh.visible = false;
      }
    } else {
      p.worldPos.x += (dx / dist) * p.speed * dt;
      p.worldPos.z += (dz / dist) * p.speed * dt;
      p.isMoving = true;
    }
  } else {
    p.isMoving = false;
  }

  // Smooth Rotation
  let diff = p.targetRotation - p.rotation;
  while (diff < -Math.PI) diff += Math.PI * 2;
  while (diff > Math.PI) diff -= Math.PI * 2;
  p.rotation += diff * 0.2;

  // Terrain elevation calculation
  const currGX = Math.round(p.worldPos.x / MAP_CONFIG.tileSize);
  const currGZ = Math.round(p.worldPos.z / MAP_CONFIG.tileSize);
  const currTile = state.grid[currGZ] && state.grid[currGZ][currGX];
  const targetGroundY = currTile ? currTile.elevation * MAP_CONFIG.elevationStep + 0.04 : 0.04;

  // Jump Gravity & Ground alignment
  if (!p.isGrounded) {
    p.verticalVelocity -= 22 * dt;
    p.worldPos.y += p.verticalVelocity * dt;

    if (p.worldPos.y <= targetGroundY) {
      p.worldPos.y = targetGroundY;
      p.verticalVelocity = 0;
      p.isGrounded = true;
    }
  } else {
    // Smoothly step up or down slopes / ramps
    p.worldPos.y += (targetGroundY - p.worldPos.y) * 0.25;
  }

  playerMesh.position.copy(p.worldPos);
  playerMesh.rotation.y = p.rotation;
}

// Bouncy Waddle Walk & Breathing Animations for 3D Hero Pawns
function updateAvatarAnimation(dt) {
  const p = state.player;
  const t = clock.elapsedTime;

  if (!pawnPivot) return;

  if (p.isMoving) {
    const waddleFreq = 11;
    const waddleSwing = Math.sin(t * waddleFreq);
    pawnPivot.rotation.z = waddleSwing * 0.07;
    pawnPivot.rotation.x = 0.05; // slight forward lean while running
    pawnPivot.position.y = Math.abs(Math.sin(t * waddleFreq)) * 0.09;
  } else {
    const idleFreq = 2.4;
    const breathe = Math.sin(t * idleFreq);
    pawnPivot.position.y = (breathe + 1) * 0.015; // gentle idle bobbing >= 0
    pawnPivot.rotation.z = THREE.MathUtils.lerp(pawnPivot.rotation.z, 0, 0.15);
    pawnPivot.rotation.x = THREE.MathUtils.lerp(pawnPivot.rotation.x, 0, 0.15);
  }

  // Handle jump & emotes
  if (p.activeEmote === 'wave' && p.emoteTimer > 0) {
    p.emoteTimer -= dt;
    pawnPivot.rotation.z = Math.sin(t * 14) * 0.12;
  }
}

// Proximity, District & Quest Detection
function checkProximity() {
  const p = state.player.worldPos;
  const gx = Math.round(p.x / MAP_CONFIG.tileSize);
  const gz = Math.round(p.z / MAP_CONFIG.tileSize);

  // 1. Detect District
  const currentDistrict = DISTRICTS.find(d =>
    gx >= d.bounds.minX && gx <= d.bounds.maxX && gz >= d.bounds.minZ && gz <= d.bounds.maxZ
  );

  if (currentDistrict && districtNameEl.textContent !== currentDistrict.name) {
    districtNameEl.textContent = currentDistrict.name;
  }

  // 2. Detect Nearby Building
  let closestBuilding = null;
  let minDistance = 5.2;

  buildingObjects.forEach(b => {
    const bx = b.config.gridX * MAP_CONFIG.tileSize;
    const bz = b.config.gridZ * MAP_CONFIG.tileSize;
    const dist = Math.hypot(p.x - bx, p.z - bz);

    if (dist < minDistance) {
      closestBuilding = b;
      minDistance = dist;
    }
  });

  if (closestBuilding && closestBuilding !== state.nearbyBuilding) {
    state.nearbyBuilding = closestBuilding;
    const info = closestBuilding.config.interaction;

    cardTitle.textContent = info.title;
    cardDesc.textContent = info.desc;
    cardActionLabel.textContent = info.actionLabel;
    interactionCard.hidden = false;

    cardActionBtn.onclick = () => {
      spawnSpeechBubble(`[Visite] Bienvenue à : ${info.title} !`);
      interactionCard.hidden = true;
    };
  } else if (!closestBuilding && state.nearbyBuilding) {
    state.nearbyBuilding = null;
    interactionCard.hidden = true;
  }

  // 3. Check Quest Completion
  checkQuests();
}

// ============================================================================
// VILLAGE QUEST SYSTEM
// ============================================================================
const QUEST_DEFINITIONS = [
  {
    id: 'plaza',
    title: 'Premier Pas Fariné',
    check: pos => {
      const dist = Math.hypot(pos.x - 25 * MAP_CONFIG.tileSize, pos.z - 25 * MAP_CONFIG.tileSize);
      return dist <= 12;
    }
  },
  {
    id: 'patisserie',
    title: 'Le Parfum du Croissant Chaud',
    check: pos => {
      const dist = Math.hypot(pos.x - 38 * MAP_CONFIG.tileSize, pos.z - 24 * MAP_CONFIG.tileSize);
      return dist <= 10;
    }
  },
  {
    id: 'canal',
    title: 'L\'Appel du Grand Canal',
    check: pos => {
      return (
        pos.z <= 12 * MAP_CONFIG.tileSize &&
        pos.z >= 3 * MAP_CONFIG.tileSize &&
        pos.x >= 15 * MAP_CONFIG.tileSize &&
        pos.x <= 35 * MAP_CONFIG.tileSize
      );
    }
  },
  {
    id: 'observatory',
    title: 'Les Mystères Célestes',
    check: pos => {
      const dist = Math.hypot(pos.x - 10 * MAP_CONFIG.tileSize, pos.z - 40 * MAP_CONFIG.tileSize);
      return dist <= 12;
    }
  },
  {
    id: 'woods',
    title: 'La Halte Sylvestre',
    check: pos => {
      const dist = Math.hypot(pos.x - 8 * MAP_CONFIG.tileSize, pos.z - 16 * MAP_CONFIG.tileSize);
      return dist <= 10;
    }
  }
];

function checkQuests() {
  const pos = state.player.worldPos;
  QUEST_DEFINITIONS.forEach(q => {
    if (!state.quests[q.id] && q.check(pos)) {
      state.quests[q.id] = true;
      saveQuestsState();
      updateQuestsUI();
      playSfx('quest');
      showToast('Quête accomplie !', q.title, '✦');
    }
  });
}

function updateQuestsUI() {
  const questKeys = ['plaza', 'patisserie', 'canal', 'observatory', 'woods'];
  let completedCount = 0;

  questKeys.forEach(id => {
    const isDone = !!state.quests[id];
    if (isDone) completedCount++;

    const card = document.getElementById(`questCard-${id}`);
    if (card) {
      card.classList.toggle('completed', isDone);
      const statusBadge = card.querySelector('.quest-status-badge');
      if (statusBadge) {
        statusBadge.textContent = isDone ? 'Accomplie' : 'En attente';
      }
    }
  });

  const total = questKeys.length;
  if (questCountBadge) {
    questCountBadge.textContent = `${completedCount}/${total}`;
  }
  const summaryEl = document.getElementById('questSummaryCount');
  if (summaryEl) {
    summaryEl.textContent = `${completedCount} / ${total} Quêtes Accomplies`;
  }
  const fillEl = document.getElementById('questProgressFill');
  if (fillEl) {
    fillEl.style.width = `${Math.round((completedCount / total) * 100)}%`;
  }
}

// ============================================================================
// TOAST NOTIFICATIONS & AUDIO SYSTEM
// ============================================================================
let toastTimer = null;
function showToast(title, message, icon = '✦') {
  if (!villageToast) return;
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toastIcon.textContent = icon;

  villageToast.hidden = false;
  villageToast.classList.remove('toast-leave');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    villageToast.classList.add('toast-leave');
    setTimeout(() => {
      villageToast.hidden = true;
      villageToast.classList.remove('toast-leave');
    }, 300);
  }, 3200);
}

function initAudioSystem() {
  bgAudio = new Audio('./assets/audio/cozy-bakery-village.mp3');
  bgAudio.loop = true;
  bgAudio.volume = state.settings.musicVolume;

  const tryPlay = () => {
    if (state.audioPlaying) {
      bgAudio.play().catch(() => {});
    }
  };

  window.addEventListener('click', () => {
    if (!audioContext) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioCtx();
      } catch (e) {}
    }
    if (state.audioPlaying && bgAudio.paused) {
      tryPlay();
    }
  }, { once: false });
}

function playSfx(type) {
  if (!audioContext || state.settings.sfxVolume <= 0) return;
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);

  const vol = state.settings.sfxVolume * 0.35;

  if (type === 'teleport') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'quest') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.12);
    osc.frequency.setValueAtTime(783.99, now + 0.24);
    gain.gain.setValueAtTime(vol * 1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.start(now);
    osc.stop(now + 0.65);
  } else if (type === 'click') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(720, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.05);
    gain.gain.setValueAtTime(vol * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

// ============================================================================
// FAST TRAVEL (INTERACTIVE MAP)
// ============================================================================
function fastTravelTo(districtId) {
  const coords = {
    plaza: { x: 25, z: 25, name: 'La Grand-Place du Beurre Doré' },
    gourmet: { x: 38, z: 24, name: 'Le Faubourg Gourmand & Marché' },
    residential: { x: 10, z: 28, name: 'Le Village Fleuri des Pains' },
    woods: { x: 8, z: 16, name: 'Le Bois de Cannelle' },
    port: { x: 25, z: 3, name: 'Le Port & Canal de Chocolat Chaud' },
    arcade: { x: 40, z: 40, name: 'La Fête Foraine & BwedWare Arcade' },
    sanctuary: { x: 10, z: 40, name: 'La Colline de l\'Observatoire Céleste' }
  };

  const target = coords[districtId];
  if (!target) return;

  const wx = target.x * MAP_CONFIG.tileSize;
  const wz = target.z * MAP_CONFIG.tileSize;
  const tile = state.grid[target.z] && state.grid[target.z][target.x];
  const wy = tile ? tile.elevation * MAP_CONFIG.elevationStep : 0;

  state.player.worldPos.set(wx, wy, wz);
  state.player.targetPos.copy(state.player.worldPos);
  state.player.path = [];
  state.player.isMoving = false;
  if (playerMesh) playerMesh.position.copy(state.player.worldPos);

  spawnCrumbBurst(state.player.worldPos, 24);
  playSfx('teleport');
  closeAllModals();
  showToast('Voyage Rapide', `Arrivée à : ${target.name}`, '⚐');
}

// ============================================================================
// MODAL MANAGEMENT & EVENT LISTENERS
// ============================================================================
let activeModal = null;

function openModal(modal) {
  if (activeModal && activeModal !== modal) {
    activeModal.hidden = true;
  }
  modal.hidden = false;
  modalBackdrop.hidden = false;
  activeModal = modal;
  playSfx('click');
}

function closeAllModals() {
  if (activeModal) {
    activeModal.hidden = true;
    activeModal = null;
  }
  modalBackdrop.hidden = true;
}

function setupModals() {
  // 1. Navigation Buttons in Top Bar
  if (wardrobeBtn) wardrobeBtn.addEventListener('click', () => openModal(wardrobeModal));
  if (mapBtn) mapBtn.addEventListener('click', () => openModal(mapModal));
  if (questBtn) questBtn.addEventListener('click', () => openModal(questModal));
  if (settingsBtn) settingsBtn.addEventListener('click', () => openModal(settingsModal));

  // 2. Backdrop & Close Buttons
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeAllModals);
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // 3. Wardrobe Hero Pawns (18 High-Fidelity GLB Avatars)
  const pawnCards = document.querySelectorAll('#pawnGrid .pawn-card');
  pawnCards.forEach(card => {
    card.addEventListener('click', () => {
      pawnCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const pawnId = card.dataset.pawn;
      loadAndSetAvatar(pawnId);
      playSfx('click');
      const heroName = card.querySelector('h4') ? card.querySelector('h4').textContent : pawnId;
      showToast('Avatar Équipé', heroName, '✦');
    });
  });

  // 4. District Cards (Fast Travel)
  document.querySelectorAll('.district-card').forEach(card => {
    const travelBtn = card.querySelector('.travel-btn');
    const trigger = travelBtn || card;
    trigger.addEventListener('click', () => {
      fastTravelTo(card.dataset.target);
    });
  });

  // 5. Settings Tabs
  const settingsTabBtns = document.querySelectorAll('[data-settings-tab]');
  const panelGraphics = document.getElementById('settingsPanelGraphics');
  const panelAudio = document.getElementById('settingsPanelAudio');
  const panelControls = document.getElementById('settingsPanelControls');

  settingsTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      settingsTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.settingsTab;
      panelGraphics.hidden = tab !== 'graphics';
      panelAudio.hidden = tab !== 'audio';
      panelControls.hidden = tab !== 'controls';
      playSfx('click');
    });
  });

  // Settings: DPR Pills
  const dprPills = document.querySelectorAll('#dprSetting .pill-btn');
  dprPills.forEach(btn => {
    btn.addEventListener('click', () => {
      dprPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings.dpr = parseFloat(btn.dataset.val);
      saveSettingsState();
      applySettings();
      playSfx('click');
    });
  });

  // Settings: Shadows Toggle
  const shadowsToggle = document.getElementById('shadowsToggle');
  if (shadowsToggle) {
    shadowsToggle.addEventListener('change', () => {
      state.settings.shadows = shadowsToggle.checked;
      saveSettingsState();
      applySettings();
      playSfx('click');
    });
  }

  // Settings: FPS Cap Pills
  const fpsPills = document.querySelectorAll('#fpsCapSetting .pill-btn');
  fpsPills.forEach(btn => {
    btn.addEventListener('click', () => {
      fpsPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings.fpsCap = parseInt(btn.dataset.val, 10);
      saveSettingsState();
      playSfx('click');
    });
  });

  // Settings: Fog Toggle
  const fogToggle = document.getElementById('fogToggle');
  if (fogToggle) {
    fogToggle.addEventListener('change', () => {
      state.settings.fog = fogToggle.checked;
      saveSettingsState();
      applySettings();
      playSfx('click');
    });
  }

  // Settings: Audio Sliders
  const musicSlider = document.getElementById('musicVolumeSlider');
  const musicLabel = document.getElementById('musicVolumeLabel');
  if (musicSlider && musicLabel) {
    musicSlider.addEventListener('input', () => {
      const val = parseInt(musicSlider.value, 10);
      musicLabel.textContent = `${val}%`;
      state.settings.musicVolume = val / 100;
      saveSettingsState();
      applySettings();
    });
  }

  const sfxSlider = document.getElementById('sfxVolumeSlider');
  const sfxLabel = document.getElementById('sfxVolumeLabel');
  if (sfxSlider && sfxLabel) {
    sfxSlider.addEventListener('input', () => {
      const val = parseInt(sfxSlider.value, 10);
      sfxLabel.textContent = `${val}%`;
      state.settings.sfxVolume = val / 100;
      saveSettingsState();
    });
  }

  // Settings: Speed Pills
  const speedPills = document.querySelectorAll('#speedSetting .pill-btn');
  speedPills.forEach(btn => {
    btn.addEventListener('click', () => {
      speedPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings.speed = parseFloat(btn.dataset.val);
      saveSettingsState();
      applySettings();
      playSfx('click');
    });
  });

  // Settings: Invert Cam Toggle
  const invertCamToggle = document.getElementById('invertCamToggle');
  if (invertCamToggle) {
    invertCamToggle.addEventListener('change', () => {
      state.settings.invertCam = invertCamToggle.checked;
      saveSettingsState();
      playSfx('click');
    });
  }

  // Synchronize controls with loaded state
  syncSettingsUI();
}

function syncSettingsUI() {
  // Pawn cards (18 Hero Avatars)
  document.querySelectorAll('#pawnGrid .pawn-card').forEach(card => {
    card.classList.toggle('active', card.dataset.pawn === state.avatar.pawnId);
  });
  // DPR pills
  document.querySelectorAll('#dprSetting .pill-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.val) === state.settings.dpr);
  });
  // FPS pills
  document.querySelectorAll('#fpsCapSetting .pill-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.val, 10) === state.settings.fpsCap);
  });
  // Speed pills
  document.querySelectorAll('#speedSetting .pill-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.val) === state.settings.speed);
  });
  // Switches
  const shadowsToggle = document.getElementById('shadowsToggle');
  if (shadowsToggle) shadowsToggle.checked = state.settings.shadows;
  const fogToggle = document.getElementById('fogToggle');
  if (fogToggle) fogToggle.checked = state.settings.fog;
  const invertCamToggle = document.getElementById('invertCamToggle');
  if (invertCamToggle) invertCamToggle.checked = state.settings.invertCam;

  // Sliders
  const musicSlider = document.getElementById('musicVolumeSlider');
  const musicLabel = document.getElementById('musicVolumeLabel');
  if (musicSlider && musicLabel) {
    const val = Math.round(state.settings.musicVolume * 100);
    musicSlider.value = val;
    musicLabel.textContent = `${val}%`;
  }
  const sfxSlider = document.getElementById('sfxVolumeSlider');
  const sfxLabel = document.getElementById('sfxVolumeLabel');
  if (sfxSlider && sfxLabel) {
    const val = Math.round(state.settings.sfxVolume * 100);
    sfxSlider.value = val;
    sfxLabel.textContent = `${val}%`;
  }
}

function applySettings() {
  if (renderer) {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, state.settings.dpr));
    renderer.shadowMap.enabled = state.settings.shadows;
    buildingObjects.forEach(b => {
      b.mesh.traverse(child => {
        if (child.isMesh) {
          child.castShadow = state.settings.shadows;
          child.receiveShadow = state.settings.shadows;
        }
      });
    });
  }

  if (scene) {
    if (state.settings.fog) {
      if (!scene.fog) scene.fog = new THREE.FogExp2(0x180b06, 0.0055);
    } else {
      scene.fog = null;
    }
  }

  if (bgAudio) {
    bgAudio.volume = state.settings.musicVolume;
  }

  if (state.player) {
    state.player.speed = state.settings.speed;
  }
}

// ============================================================================
// PERSISTENCE (LOCAL STORAGE)
// ============================================================================
function loadSavedState() {
  try {
    const savedAvatar = localStorage.getItem('bwed_village_avatar');
    if (savedAvatar) {
      const parsed = JSON.parse(savedAvatar);
      Object.assign(state.avatar, parsed);
    }
    const savedSettings = localStorage.getItem('bwed_village_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      Object.assign(state.settings, parsed);
    }
    const savedQuests = localStorage.getItem('bwed_village_quests');
    if (savedQuests) {
      const parsed = JSON.parse(savedQuests);
      Object.assign(state.quests, parsed);
    }
  } catch (e) {
    console.warn('Erreur lecture localStorage village:', e);
  }
}

function saveAvatarState() {
  try {
    localStorage.setItem('bwed_village_avatar', JSON.stringify(state.avatar));
  } catch (e) {}
}

function saveSettingsState() {
  try {
    localStorage.setItem('bwed_village_settings', JSON.stringify(state.settings));
  } catch (e) {}
}

function saveQuestsState() {
  try {
    localStorage.setItem('bwed_village_quests', JSON.stringify(state.quests));
  } catch (e) {}
}

// Run engine
init();
