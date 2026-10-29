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

// --- GAME STATE ---
const state = {
  grid: null,
  player: {
    gridX: 25,
    gridZ: 26,
    worldPos: new THREE.Vector3(50.0, 0.05, 52.0),
    targetPos: new THREE.Vector3(50.0, 0.05, 52.0),
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
const compassTag = document.getElementById('compassTag');
const villageMapCanvas = document.getElementById('villageMapCanvas');
let mapCanvasCtx = null;

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
const fountainDroplets = [];
let pollenPoints = null;
let footstepDist = 0;
const entranceMats = [];
const bakerSignposts = [];
const houseWindowMaterials = [];
let nightStarPoints = null;
let lanternCageInstanced = null;
let lanternGlowMat = null;
let lastEnteredEntranceMat = null;

// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  try {
    clock = new THREE.Clock();
    loadSavedState();
    state.grid = generateVillageGrid();

    // 1. Scene & Atmosphere (Pastel Celestial Daylight Palette with Crisp Ground Contrast)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe0f7); // Luminous soft sky blue (Animal Crossing daylight)
    scene.fog = new THREE.Fog(0xd4edfc, 55, 140); // Gentle distant haze, leaving foreground 100% crisp!

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

    // 5. Build Immediate Procedural Ground Fallback (Frame 1 instant visibility) & Load 3D Level Map
    buildImmediateFallbackTerrain();
    loadUnifiedTerrainMap();

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

    // 12. Build Living Village Systems (Chimney Smoke, Canal Buoys, Bunting, Pollen, Fountain, Mats & Signs)
    buildChimneySmoke();
    buildChocolateCanalProps();
    buildGrandPlaceFountain();
    buildStreetBunting();
    buildFloatingPollenParticles();
    buildBuildingEntranceMats();
    buildBakerSignposts();
    buildNightSkyStars();

    // 13. Setup Key Landmark Colored Glows
    setupLandmarkLights();

    // 14. Load Village GLB Buildings & Props (Tracks actual progress)
    loadVillageBuildings();

    // 15. Input & Event Listeners
    setupEventListeners();

    // 16. UI Modals, Audio System & Quests Initialization
    initAudioSystem();
    initCadastreMinimap();
    setupModals();
    applySettings();
    updateQuestsUI();

    // 17. Immediate safety release for loader (500ms max to guarantee instant playability)
    setTimeout(() => {
      if (loaderEl && !loaderEl.classList.contains('fade-out')) {
        loaderBar.style.width = '100%';
        loaderStatus.textContent = 'Village prêt ! Bienvenue à Bwedville.';
        loaderEl.classList.add('fade-out');
      }
    }, 500);

    // 18. Start Loop
    renderer.setAnimationLoop(animate);
  } catch (err) {
    console.error('Erreur critique initialisation Bwed Village:', err);
    if (loaderEl && !loaderEl.classList.contains('fade-out')) {
      loaderEl.classList.add('fade-out');
    }
  }
}

// ============================================================================
// LIGHTING & ATMOSPHERE (WARM COZY SUNNY PALETTE)
// ============================================================================
function setupLighting() {
  hemiLight = new THREE.HemisphereLight(0xeaf4ff, 0xcaa066, 1.25);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight(0xfffaed, 1.85);
  sunLight.position.set(50, 75, 35);
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
    { x: 25, z: 26, y: 5.5, color: 0xffb84d, intensity: 2.2, dist: 35 },
    // Pâtisserie: Warm Amber Glow
    { x: 34, z: 26, y: 5.5, color: 0xff9933, intensity: 2.5, dist: 22 },
    // Taverne du Pot de Miel: Cozy Warm Hearth
    { x: 39, z: 23, y: 5.0, color: 0xffaa22, intensity: 2.2, dist: 20 },
    // Arcade BwedWare: Neon Cyan
    { x: 40, z: 41, y: 6.5, color: 0x00f0ff, intensity: 3.0, dist: 25 },
    // Observatoire Céleste: Mystic Purple
    { x: 10, z: 40, y: 9.0, color: 0xaa44ff, intensity: 3.2, dist: 30 }
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
    scene.background.set(0xbfe0f7);
    if (scene.fog) {
      scene.fog.color.set(0xd4edfc);
      scene.fog.near = 55;
      scene.fog.far = 140;
    }
    hemiLight.color.set(0xeaf4ff);
    hemiLight.groundColor.set(0xcaa066);
    hemiLight.intensity = 1.25;
    sunLight.color.set(0xfffaed);
    sunLight.intensity = 1.85;
    sunLight.position.set(50, 75, 35);
    landmarkPointLights.forEach(l => (l.intensity = 0.6));
    houseWindowMaterials.forEach(m => {
      m.color.set(0xfff6ea);
      m.emissive.set(0x000000);
      m.emissiveIntensity = 0.0;
    });
    if (lanternGlowMat) lanternGlowMat.color.set(0xd4af37);
    if (nightStarPoints) nightStarPoints.visible = false;
    todIcon.textContent = 'Soleil Doré';
  } else if (tod === 'golden') {
    scene.background.set(0xf8d4a8);
    if (scene.fog) {
      scene.fog.color.set(0xf5c391);
      scene.fog.near = 45;
      scene.fog.far = 120;
    }
    hemiLight.color.set(0xffaa55);
    hemiLight.groundColor.set(0x5a2310);
    hemiLight.intensity = 1.1;
    sunLight.color.set(0xff8833);
    sunLight.intensity = 1.85;
    sunLight.position.set(55, 35, 15);
    landmarkPointLights.forEach(l => (l.intensity = 1.5));
    houseWindowMaterials.forEach(m => {
      m.color.set(0xffe299);
      m.emissive.set(0xff9922);
      m.emissiveIntensity = 0.45;
    });
    if (lanternGlowMat) lanternGlowMat.color.set(0xffb844);
    if (nightStarPoints) {
      nightStarPoints.visible = true;
      nightStarPoints.material.opacity = 0.35;
    }
    todIcon.textContent = 'Heure Dorée';
  } else if (tod === 'night') {
    scene.background.set(0x131a2b);
    if (scene.fog) {
      scene.fog.color.set(0x131a2b);
      scene.fog.near = 40;
      scene.fog.far = 110;
    }
    hemiLight.color.set(0x3a4f77);
    hemiLight.groundColor.set(0x1a1210);
    hemiLight.intensity = 0.55;
    sunLight.color.set(0x5577bb);
    sunLight.intensity = 0.45;
    sunLight.position.set(-30, 45, -30);
    landmarkPointLights.forEach(l => (l.intensity = 2.8));
    houseWindowMaterials.forEach(m => {
      m.color.set(0xffbf42);
      m.emissive.set(0xffaa22);
      m.emissiveIntensity = 0.95;
    });
    if (lanternGlowMat) lanternGlowMat.color.set(0xffea88);
    if (nightStarPoints) {
      nightStarPoints.visible = true;
      nightStarPoints.material.opacity = 0.95;
    }
    todIcon.textContent = 'Nuit Cosy';
  }
}

// ============================================================================
// UNIFIED 3D LEVEL MAP (BWEDVILLE SCULPTED TERRAIN, ROADS, BRIDGES & CHOCOLATE CANAL)
// ============================================================================
let unifiedTerrainGroup = null;
let fallbackTerrainGroup = null;

// Immediate Frame-1 Procedural Ground (Guarantees visible ground before GLB finishes loading)
function buildImmediateFallbackTerrain() {
  fallbackTerrainGroup = new THREE.Group();

  // 1. Matcha Grass Island Base
  const islandGeo = new THREE.BoxGeometry(92, 2.5, 92);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x6ea343,
    roughness: 0.85
  });
  const islandMesh = new THREE.Mesh(islandGeo, grassMat);
  islandMesh.position.set(50, -1.25, 50);
  islandMesh.receiveShadow = true;
  fallbackTerrainGroup.add(islandMesh);

  // 2. Chocolate River Trench (z = 36.0, width 8.4)
  const canalGeo = new THREE.PlaneGeometry(92, 8.4);
  canalGeo.rotateX(-Math.PI / 2);
  const chocoMat = new THREE.MeshStandardMaterial({
    color: 0x26120a,
    roughness: 0.18,
    metalness: 0.08
  });
  const canalMesh = new THREE.Mesh(canalGeo, chocoMat);
  canalMesh.position.set(50, 0.01, 36.0);
  fallbackTerrainGroup.add(canalMesh);

  // 3. Caramel Boulevards (North-South & East-West)
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0xdfa858,
    roughness: 0.65
  });

  const nsRoadGeo = new THREE.PlaneGeometry(6.0, 92);
  nsRoadGeo.rotateX(-Math.PI / 2);
  const nsRoad = new THREE.Mesh(nsRoadGeo, roadMat);
  nsRoad.position.set(50, 0.03, 50);
  fallbackTerrainGroup.add(nsRoad);

  const ewRoadGeo = new THREE.PlaneGeometry(92, 5.4);
  ewRoadGeo.rotateX(-Math.PI / 2);
  const ewRoad = new THREE.Mesh(ewRoadGeo, roadMat);
  ewRoad.position.set(50, 0.03, 52);
  fallbackTerrainGroup.add(ewRoad);

  // 4. Grand-Place Waffle Octagon
  const plazaGeo = new THREE.CylinderGeometry(13.5, 13.5, 0.06, 8);
  const plazaMat = new THREE.MeshStandardMaterial({
    color: 0xe5ac5e,
    roughness: 0.6
  });
  const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
  plazaMesh.position.set(50, 0.04, 52);
  fallbackTerrainGroup.add(plazaMesh);

  // 5. Wooden Bridges
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x733a1e,
    roughness: 0.7
  });
  [50.0, 20.0, 80.0].forEach(bx => {
    const brGeo = new THREE.BoxGeometry(bx === 50 ? 6.6 : 4.8, 0.25, 10.4);
    const brMesh = new THREE.Mesh(brGeo, woodMat);
    brMesh.position.set(bx, 0.35, 36.0);
    brMesh.castShadow = true;
    brMesh.receiveShadow = true;
    fallbackTerrainGroup.add(brMesh);
  });

  scene.add(fallbackTerrainGroup);
}

function loadUnifiedTerrainMap() {
  const loader = new GLTFLoader();
  loader.load(
    './assets/maps/bwed-village-diorama.glb',
    gltf => {
      unifiedTerrainGroup = gltf.scene;

      unifiedTerrainGroup.traverse(child => {
        if (child.isMesh) {
          child.receiveShadow = true;
          child.castShadow = true;
          if (child.material) {
            child.material.roughness = Math.max(child.material.roughness, 0.35);
          }
        }
      });

      // Remove fallback terrain smoothly when GLB is ready
      if (fallbackTerrainGroup) {
        scene.remove(fallbackTerrainGroup);
        fallbackTerrainGroup = null;
      }

      scene.add(unifiedTerrainGroup);
      if (loaderEl && !loaderEl.classList.contains('fade-out')) {
        loaderBar.style.width = '100%';
        loaderStatus.textContent = 'Diorama stylisé 3D & niveau en place !';
        loaderEl.classList.add('fade-out');
      }
    },
    undefined,
    err => {
      console.warn('Erreur chargement terrain unifié Bwedville (le sol de secours reste actif):', err);
      if (loaderEl && !loaderEl.classList.contains('fade-out')) {
        loaderBar.style.width = '100%';
        loaderEl.classList.add('fade-out');
      }
    }
  );
}

// Analytical terrain elevation query (0ms execution, millimeter accuracy matching 3D Diorama)
function getTerrainElevation(x, z) {
  // 1. Arched Wooden Bridges over Chocolate Canal (canal center: z = 36.0m)
  const inCanalZ = Math.abs(z - 36.0) <= 5.2;
  if (inCanalZ) {
    if (Math.abs(x - 50.0) <= 3.3) {
      // Grand Center Bridge
      const t = (z - 30.8) / 10.4;
      return Math.sin(t * Math.PI) * 0.98 + 0.12;
    }
    if (Math.abs(x - 20.0) <= 2.4) {
      // West Bridge
      const t = (z - 31.0) / 10.0;
      return Math.sin(t * Math.PI) * 0.75 + 0.12;
    }
    if (Math.abs(x - 80.0) <= 2.4) {
      // East Bridge
      const t = (z - 31.0) / 10.0;
      return Math.sin(t * Math.PI) * 0.75 + 0.12;
    }
  }

  // 2. Chocolate River Trench (z between 31.5m and 40.5m)
  const canalDist = Math.abs(z - 36.0);
  if (canalDist < 4.5) {
    return -0.32; // Chocolate water surface
  }

  // 3. Observatory Hill (South-West: x=20, z=80)
  const distObs = Math.hypot(x - 20.0, z - 80.0);
  if (distObs < 13.0) {
    if (distObs < 6.5) return 3.6;
    if (distObs < 10.5) return 1.8 + (10.5 - distObs) / 4.0 * 0.4;
    return (13.0 - distObs) / 2.5 * 1.8;
  }

  // 4. Woods Hillocks (North-West: x=16, z=20)
  const distWoods = Math.hypot(x - 16.0, z - 20.0);
  if (distWoods < 11.0) {
    return Math.cos(distWoods / 11.0 * Math.PI * 0.5) * 1.35;
  }

  // 5. East Gentle Hill (x=82, z=20)
  const distEast = Math.hypot(x - 82.0, z - 20.0);
  if (distEast < 9.0) {
    return Math.cos(distEast / 9.0 * Math.PI * 0.5) * 0.85;
  }

  // 6. Base Ground & Roads
  return 0.05;
}

function isWalkable(x, z) {
  // Island boundaries
  if (x < 6.0 || x > 94.0 || z < 6.0 || z > 94.0) return false;

  // Rounded diorama corners
  const dx_c = Math.max(0, Math.abs(x - 50.0) - 38.0);
  const dz_c = Math.max(0, Math.abs(z - 50.0) - 38.0);
  if (Math.hypot(dx_c, dz_c) > 7.5) return false;

  // Canal boundary: blocked unless on bridge
  if (Math.abs(z - 36.0) < 4.2) {
    const onCenterBridge = Math.abs(x - 50.0) <= 3.3;
    const onWestBridge = Math.abs(x - 20.0) <= 2.4;
    const onEastBridge = Math.abs(x - 80.0) <= 2.4;
    if (!onCenterBridge && !onWestBridge && !onEastBridge) return false;
  }

  // Central fountain collision
  if (Math.hypot(x - 50.0, z - 52.0) < 3.8) return false;

  // Buildings clearance
  for (let i = 0; i < buildingObjects.length; i++) {
    const b = buildingObjects[i].config;
    const bx = b.gridX * MAP_CONFIG.tileSize;
    const bz = b.gridZ * MAP_CONFIG.tileSize;
    const r = Math.max(b.sizeX || 2.4, b.sizeZ || 2.4) * 0.75;
    if (Math.hypot(x - bx, z - bz) < r) return false;
  }

  return true;
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
  lanternGlowMat = glowMat;

  const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.0, 8);
  const cageGeo = new THREE.SphereGeometry(0.35, 8, 8);

  const poleInstanced = new THREE.InstancedMesh(poleGeo, brassMat, count);
  poleInstanced.castShadow = true;
  poleInstanced.receiveShadow = true;

  const cageInstanced = new THREE.InstancedMesh(cageGeo, glowMat, count);
  lanternCageInstanced = cageInstanced;

  const dummy = new THREE.Object3D();

  VILLAGE_LANTERNS.forEach((pos, idx) => {
    const wx = pos.x * MAP_CONFIG.tileSize;
    const wz = pos.z * MAP_CONFIG.tileSize;
    const wy = getTerrainElevation(wx, wz);

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

// Instanced Brioche Trees (Only 4 Draw Calls for all 28 trees)
function buildVillageVegetation() {
  const treePositions = [
    // Grand-Place Promenade Corners
    { x: 20, z: 22 }, { x: 30, z: 22 },
    { x: 20, z: 30 }, { x: 30, z: 30 },
    // Boulevard Central Nord-Sud
    { x: 23, z: 16 }, { x: 27, z: 16 },
    { x: 23, z: 34 }, { x: 27, z: 34 },
    // Bois de Cannelle (Nord-Ouest)
    { x: 6, z: 8 }, { x: 9, z: 8 },
    { x: 6, z: 12 }, { x: 10, z: 12 },
    { x: 7, z: 15 }, { x: 11, z: 15 },
    // Quai du Canal Promenades (Nord & Sud)
    { x: 12, z: 14 }, { x: 22, z: 14 }, { x: 38, z: 14 },
    { x: 12, z: 22 }, { x: 22, z: 22 }, { x: 38, z: 22 },
    // Verger d'Agrumes Est
    { x: 41, z: 8 }, { x: 45, z: 9 }, { x: 43, z: 13 },
    // Fête Foraine & Allée Arcade
    { x: 37, z: 38 }, { x: 44, z: 38 }, { x: 44, z: 44 },
    // Colline de l'Observatoire
    { x: 8, z: 38 }, { x: 12, z: 42 }, { x: 6, z: 44 }
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
    const wy = getTerrainElevation(wx, wz);
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

    const tile = state.grid[pos.z] && state.grid[pos.z][pos.x];
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
    const wy = getTerrainElevation(wx, wz);

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
    houseWindowMaterials.push(winMat);
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
    const wy = getTerrainElevation(wx, wz);
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

    const tile = state.grid[b.z] && state.grid[b.z][b.x];
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
    const wy = getTerrainElevation(wx, wz);

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

    const tile = state.grid[it.z] && state.grid[it.z][it.x];
    if (tile) tile.walkable = false;
  });

  if (bCount > 0) { barrelInst.count = bCount; barrelInst.instanceMatrix.needsUpdate = true; scene.add(barrelInst); }
  if (cCount > 0) { crateInst.count = cCount; crateInst.instanceMatrix.needsUpdate = true; scene.add(crateInst); }
  if (sCount > 0) { sackInst.count = sCount; sackInst.instanceMatrix.needsUpdate = true; scene.add(sackInst); }
}

// ============================================================================
// CURSORS & 3D GROUND RETICLES
// ============================================================================
function setupCursors() {
  // 1. Smooth circular golden hover ring
  const cursorGeo = new THREE.RingGeometry(0.35, 0.48, 24);
  cursorGeo.rotateX(-Math.PI / 2);
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

let playerBlobShadow = null;
let blobShadowMat = null;

function getBlobShadowMaterial() {
  if (!blobShadowMat) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, 'rgba(32, 16, 8, 0.62)');
    grad.addColorStop(0.5, 'rgba(32, 16, 8, 0.28)');
    grad.addColorStop(1, 'rgba(32, 16, 8, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    blobShadowMat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.65,
      depthWrite: false
    });
  }
  return blobShadowMat;
}

function initPlayerAvatar() {
  playerMesh = new THREE.Group();
  playerMesh.position.copy(state.player.worldPos);

  // pawnPivot holds the active GLB model.
  // Animations only oscillate pawnPivot.position.y (bounce) and pawnPivot.rotation.z (waddle).
  // The model inside pawnPivot has a fixed position.y so feet/soles never penetrate the ground!
  pawnPivot = new THREE.Group();
  pawnPivot.position.y = 0;
  playerMesh.add(pawnPivot);

  // Soft Contact Blob Shadow beneath player (instant tactile grounding)
  const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
  shadowGeo.rotateX(-Math.PI / 2);
  playerBlobShadow = new THREE.Mesh(shadowGeo, getBlobShadowMaterial());
  playerBlobShadow.position.set(state.player.worldPos.x, state.player.worldPos.y + 0.02, state.player.worldPos.z);
  scene.add(playerBlobShadow);

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
    const worldX = npc.gridX * MAP_CONFIG.tileSize;
    const worldZ = npc.gridZ * MAP_CONFIG.tileSize;
    const targetGroundY = getTerrainElevation(worldX, worldZ) + 0.04;

    const npcGroup = new THREE.Group();
    npcGroup.position.set(worldX, targetGroundY, worldZ);

    const npcPivot = new THREE.Group();
    npcPivot.rotation.y = npc.rotationY || 0;
    npcGroup.add(npcPivot);

    scene.add(npcGroup);

    // Contact Blob Shadow for NPC
    const shadowGeo = new THREE.PlaneGeometry(1.3, 1.3);
    shadowGeo.rotateX(-Math.PI / 2);
    const npcShadow = new THREE.Mesh(shadowGeo, getBlobShadowMaterial());
    npcShadow.position.set(worldX, targetGroundY + 0.015, worldZ);
    scene.add(npcShadow);

    const tile = state.grid[npc.gridZ] && state.grid[npc.gridZ][npc.gridX];
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
  el.className = 'npc-bubble';
  el.innerHTML = `<span class="npc-bubble-name">${npc.config.name} — ${npc.config.role || 'Citoyen'}</span><span>${text}</span>`;
  container.appendChild(el);
  npc.bubbleEl = el;
}

// ============================================================================
// LIVING VILLAGE SYSTEMS (SMOKE, CANAL BUOYS, FOUNTAIN, BUNTING, POLLEN)
// ============================================================================
function buildChimneySmoke() {
  const chimneyOrigins = [
    new THREE.Vector3(68, 7.5, 50), // Pâtisserie du Croissant d'Or
    new THREE.Vector3(78, 6.8, 36), // Taverne du Miel
    new THREE.Vector3(12, 4.8, 32), // Cottage Fraisier
    new THREE.Vector3(28, 4.8, 32), // Villa Matcha
    new THREE.Vector3(16, 4.8, 50), // Manoir Vanille
    new THREE.Vector3(12, 4.8, 64), // Lodge Caramel
    new THREE.Vector3(90, 6.5, 50)  // Apothicaire
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
  const buoyMatA = new THREE.MeshStandardMaterial({ color: 0xffe8d6, roughness: 0.25 }); // Chamallow vanille
  const buoyMatB = new THREE.MeshStandardMaterial({ color: 0xff99c8, roughness: 0.25 }); // Guimauve fraise
  const raftGeo = new THREE.BoxGeometry(1.6, 0.15, 1.2);
  const raftMat = new THREE.MeshStandardMaterial({ color: 0x8a4b23, roughness: 0.65 });
  const lanternGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffe277 });

  const buoyLocations = [
    { x: 10, z: 36.0, type: 'marshmallow', phase: 0 },
    { x: 26, z: 36.0, type: 'raft', phase: 1.5 },
    { x: 34, z: 36.0, type: 'marshmallow', phase: 2.8 },
    { x: 64, z: 36.0, type: 'raft', phase: 3.9 },
    { x: 74, z: 36.0, type: 'marshmallow', phase: 4.6 },
    { x: 88, z: 36.0, type: 'marshmallow', phase: 5.4 }
  ];

  buoyLocations.forEach((loc, idx) => {
    let mesh;
    if (loc.type === 'raft') {
      mesh = new THREE.Group();
      const raft = new THREE.Mesh(raftGeo, raftMat);
      mesh.add(raft);
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.y = 0.35;
      mesh.add(lantern);
    } else {
      mesh = new THREE.Mesh(buoyGeo, idx % 2 === 0 ? buoyMatA : buoyMatB);
    }

    mesh.position.set(loc.x, -0.28, loc.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    canalFloatingBuoys.push({
      mesh,
      baseX: loc.x,
      baseY: -0.28,
      phase: loc.phase
    });
  });
}

function updateCanalBuoys(dt) {
  const t = clock.elapsedTime;
  for (let i = 0; i < canalFloatingBuoys.length; i++) {
    const b = canalFloatingBuoys[i];
    b.mesh.position.y = b.baseY + Math.sin(t * 2.0 + b.phase) * 0.04;
    b.mesh.position.x = b.baseX + Math.sin(t * 0.4 + b.phase) * 0.4;
    b.mesh.rotation.z = Math.sin(t * 1.6 + b.phase) * 0.07;
    b.mesh.rotation.x = Math.cos(t * 1.4 + b.phase) * 0.05;
  }
}

function buildGrandPlaceFountain() {
  const fx = 50.0;
  const fz = 52.0;
  const fy = 0.05;

  // Central Spout Pillar in Fountain Basin
  const columnGeo = new THREE.CylinderGeometry(0.45, 0.65, 1.1, 12);
  const columnMat = new THREE.MeshStandardMaterial({
    color: 0xf5eee1,
    roughness: 0.55
  });
  const columnMesh = new THREE.Mesh(columnGeo, columnMat);
  columnMesh.position.set(fx, fy + 0.55, fz);
  columnMesh.castShadow = true;
  columnMesh.receiveShadow = true;
  scene.add(columnMesh);

  // Golden Butter Topper
  const topperGeo = new THREE.SphereGeometry(0.35, 12, 10);
  topperGeo.scale(1.2, 0.85, 0.9);
  const topperMat = new THREE.MeshStandardMaterial({
    color: 0xffd15a,
    roughness: 0.25,
    metalness: 0.35
  });
  const topperMesh = new THREE.Mesh(topperGeo, topperMat);
  topperMesh.position.set(fx, fy + 1.25, fz);
  scene.add(topperMesh);

  // Warm Amber Glow at Fountain Center
  const fountainLight = new THREE.PointLight(0xffea78, 1.8, 14, 2);
  fountainLight.position.set(fx, fy + 1.6, fz);
  scene.add(fountainLight);

  // Animated Butter Droplets
  const dropGeo = new THREE.SphereGeometry(0.08, 6, 5);
  const dropMat = new THREE.MeshBasicMaterial({
    color: 0xfff099,
    transparent: true,
    opacity: 0.85
  });

  for (let i = 0; i < 28; i++) {
    const mesh = new THREE.Mesh(dropGeo, dropMat);
    scene.add(mesh);
    const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.2;
    const speed = 1.1 + Math.random() * 0.8;
    fountainDroplets.push({
      mesh,
      origin: new THREE.Vector3(fx, fy + 1.35, fz),
      angle,
      speed,
      vy: 2.2 + Math.random() * 0.8,
      currentY: fy + 1.35,
      dist: 0,
      life: (i / 28) * 1.3,
      maxLife: 1.3
    });
  }
}

function updateGrandPlaceFountain(dt) {
  const fy = 0.05;
  for (let i = 0; i < fountainDroplets.length; i++) {
    const d = fountainDroplets[i];
    d.life += dt;
    if (d.life >= d.maxLife || d.currentY < fy + 0.28) {
      d.life = 0;
      d.currentY = d.origin.y;
      d.vy = 2.2 + Math.random() * 0.8;
      d.dist = 0;
    }

    d.vy -= 7.5 * dt; // Gravity
    d.currentY += d.vy * dt;
    d.dist += d.speed * dt;

    const px = d.origin.x + Math.cos(d.angle) * d.dist;
    const pz = d.origin.z + Math.sin(d.angle) * d.dist;

    d.mesh.position.set(px, d.currentY, pz);
    const progress = d.life / d.maxLife;
    const sc = Math.max(0.4, 1.0 - progress * 0.5);
    d.mesh.scale.set(sc, sc, sc);
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
// LIVING VILLAGE SYSTEM: DOORSTEP WELCOME MATS & SUGAR SPARKLES
// ============================================================================
function buildBuildingEntranceMats() {
  const rugMat = new THREE.MeshStandardMaterial({
    color: 0xdd9c44, // Biscuit gaufré doré
    roughness: 0.72,
    metalness: 0.04
  });
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xf6efe2, // Crème vanillée
    roughness: 0.52,
    metalness: 0.02
  });
  const sparkleMat = new THREE.MeshBasicMaterial({
    color: 0xffe277,
    transparent: true,
    opacity: 0.85
  });

  const rugGeo = new THREE.CylinderGeometry(0.95, 1.0, 0.05, 16);
  const innerGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.065, 16);
  const sparkleGeo = new THREE.OctahedronGeometry(0.09, 0);

  // 1. Boutiques et Monuments Emblématiques
  const landmarkEntrances = [
    { id: 'patisserie-coin', x: 65.0, z: 52.0 },
    { id: 'honey-tavern', x: 78.0, z: 50.0 },
    { id: 'arcade-hall', x: 76.5, z: 78.5 },
    { id: 'portal-observatory', x: 23.5, z: 77.0 },
    { id: 'galeries-boutique', x: 75.0, z: 60.0 },
    { id: 'jam-apothecary', x: 86.5, z: 52.0 },
    { id: 'milk-apartments', x: 33.5, z: 54.0 },
    { id: 'tea-gazebo', x: 22.0, z: 57.5 }
  ];

  landmarkEntrances.forEach(e => {
    const bObj = buildingObjects.find(b => b.config && b.config.id === e.id);
    const config = bObj ? bObj.config : null;

    const group = new THREE.Group();
    const y = getTerrainElevation(e.x, e.z) + 0.02;

    const baseRug = new THREE.Mesh(rugGeo, rugMat);
    baseRug.receiveShadow = true;
    group.add(baseRug);

    const innerRug = new THREE.Mesh(innerGeo, innerMat);
    innerRug.receiveShadow = true;
    group.add(innerRug);

    const sparkles = [];
    for (let i = 0; i < 3; i++) {
      const sp = new THREE.Mesh(sparkleGeo, sparkleMat);
      const angle = (i / 3) * Math.PI * 2;
      sp.position.set(Math.cos(angle) * 0.45, 0.35 + i * 0.12, Math.sin(angle) * 0.45);
      group.add(sp);
      sparkles.push({ mesh: sp, baseAngle: angle, baseH: 0.35 + i * 0.12 });
    }

    group.position.set(e.x, y, e.z);
    scene.add(group);

    entranceMats.push({
      x: e.x,
      z: e.z,
      y,
      group,
      sparkles,
      config
    });
  });

  // 2. Chaumières et Cottages Citoyens
  CITIZEN_HOUSES.forEach(h => {
    const s = h.scale || 1.0;
    const rot = h.rotationY || 0;
    const wx = h.gridX * MAP_CONFIG.tileSize;
    const wz = h.gridZ * MAP_CONFIG.tileSize;
    const doorDist = 1.35 * s;
    const matX = wx + Math.sin(rot) * doorDist;
    const matZ = wz + Math.cos(rot) * doorDist;
    const matY = getTerrainElevation(matX, matZ) + 0.02;

    const group = new THREE.Group();
    const baseRug = new THREE.Mesh(rugGeo, rugMat);
    baseRug.scale.set(0.8, 0.8, 0.8);
    baseRug.receiveShadow = true;
    group.add(baseRug);

    const innerRug = new THREE.Mesh(innerGeo, innerMat);
    innerRug.scale.set(0.8, 0.8, 0.8);
    innerRug.receiveShadow = true;
    group.add(innerRug);

    const sparkles = [];
    for (let i = 0; i < 2; i++) {
      const sp = new THREE.Mesh(sparkleGeo, sparkleMat);
      sp.scale.set(0.8, 0.8, 0.8);
      const angle = i * Math.PI;
      sp.position.set(Math.cos(angle) * 0.35, 0.3 + i * 0.12, Math.sin(angle) * 0.35);
      group.add(sp);
      sparkles.push({ mesh: sp, baseAngle: angle, baseH: 0.3 + i * 0.12 });
    }

    group.position.set(matX, matY, matZ);
    scene.add(group);

    entranceMats.push({
      x: matX,
      z: matZ,
      y: matY,
      group,
      sparkles,
      config: h
    });
  });
}

// ============================================================================
// LIVING VILLAGE SYSTEM: BAKER SIGNPOSTS WITH WOODEN INSIGNIA
// ============================================================================
function buildBakerSignposts() {
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x4d2612, // Écorce de cannelle
    roughness: 0.75,
    metalness: 0.04
  });
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xdca255, // Gaufrette sablée
    roughness: 0.6,
    metalness: 0.02
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.85,
    roughness: 0.3
  });

  const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.8, 8);
  const boardGeo = new THREE.BoxGeometry(0.75, 0.45, 0.06);
  const ringGeo = new THREE.TorusGeometry(0.04, 0.012, 6, 8);

  const signLocations = [
    { title: "Pâtisserie", x: 65.2, z: 50.8, rotY: -Math.PI / 2, color: 0xffaa22 },
    { title: "Taverne du Miel", x: 76.5, z: 49.5, rotY: 0, color: 0xffcc33 },
    { title: "Arcade BwedWare", x: 75.5, z: 77.5, rotY: -Math.PI / 4, color: 0x00f0ff },
    { title: "Observatoire", x: 24.5, z: 76.5, rotY: Math.PI / 4, color: 0xbb55ff },
    { title: "Galeries Royales", x: 75.2, z: 58.5, rotY: -Math.PI / 2, color: 0xff88aa },
    { title: "Port de Chocolat", x: 48.0, z: 30.5, rotY: 0, color: 0x55bbff }
  ];

  signLocations.forEach(s => {
    const group = new THREE.Group();
    const wy = getTerrainElevation(s.x, s.z);

    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.y = 0.9;
    post.castShadow = true;
    group.add(post);

    const ringL = new THREE.Mesh(ringGeo, brassMat);
    ringL.position.set(-0.25, 1.62, 0.05);
    group.add(ringL);

    const ringR = new THREE.Mesh(ringGeo, brassMat);
    ringR.position.set(0.25, 1.62, 0.05);
    group.add(ringR);

    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 1.4, 0.06);
    board.castShadow = true;
    group.add(board);

    // Pastille d'insigne colorée
    const discGeo = new THREE.CircleGeometry(0.12, 12);
    const discMat = new THREE.MeshBasicMaterial({ color: s.color });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.set(0, 1.4, 0.095);
    group.add(disc);

    group.position.set(s.x, wy, s.z);
    group.rotation.y = s.rotY;
    scene.add(group);

    bakerSignposts.push({ group, board, baseX: s.x, baseZ: s.z });
  });
}

// ============================================================================
// LIVING VILLAGE SYSTEM: TWINKLING NIGHT SKY SUGAR STARS
// ============================================================================
function buildNightSkyStars() {
  const count = 140;
  const positions = new Float32Array(count * 3);
  const cx = 50.0;
  const cz = 52.0;
  const radius = 95.0;

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * (Math.PI * 0.42); // Dôme au-dessus de l'horizon
    const r = radius + (Math.random() - 0.5) * 15.0;

    const x = cx + r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) + 10.0;
    const z = cz + r * Math.sin(phi) * Math.sin(theta);

    positions[i * 3 + 0] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.9,
    transparent: true,
    opacity: 0.0
  });

  nightStarPoints = new THREE.Points(geo, mat);
  nightStarPoints.visible = false;
  scene.add(nightStarPoints);
}

function updateBuildingEntranceMats(time) {
  entranceMats.forEach(m => {
    if (m.sparkles) {
      m.sparkles.forEach(sp => {
        sp.mesh.rotation.y = time * 2.5 + sp.baseAngle;
        sp.mesh.position.y = sp.baseH + Math.sin(time * 3.0 + sp.baseAngle) * 0.08;
      });
    }
  });

  bakerSignposts.forEach((sp, idx) => {
    if (sp.board) {
      sp.board.rotation.x = Math.sin(time * 1.8 + idx * 0.7) * 0.08;
    }
  });
}

function updateNightStars(time) {
  if (!nightStarPoints || !nightStarPoints.visible) return;
  const baseOpacity = state.timeOfDay === 'night' ? 0.9 : 0.35;
  nightStarPoints.material.opacity = baseOpacity * (0.8 + 0.2 * Math.sin(time * 2.5));
}

function updateCompassHeading() {
  if (!compassTag) return;
  const az = ((state.camera.azimuth % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const deg = (az * 180 / Math.PI);

  let label = "Nord";
  if (deg >= 22.5 && deg < 67.5) label = "Nord-Est";
  else if (deg >= 67.5 && deg < 112.5) label = "Est";
  else if (deg >= 112.5 && deg < 157.5) label = "Sud-Est";
  else if (deg >= 157.5 && deg < 202.5) label = "Sud";
  else if (deg >= 202.5 && deg < 247.5) label = "Sud-Ouest";
  else if (deg >= 247.5 && deg < 292.5) label = "Ouest";
  else if (deg >= 292.5 && deg < 337.5) label = "Nord-Ouest";

  if (compassTag.textContent !== label) {
    compassTag.textContent = label;
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
    try {
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
      const targetGroundY = getTerrainElevation(worldX, worldZ) + 0.02;
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
    } catch (err) {
      console.warn('Erreur initialisation modèle bâtisse:', b.name, err);
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
// FLUID 360° LEVEL NAVIGATION & BRIDGE ROUTING
// ============================================================================
function navigateToWorldPos(targetX, targetZ) {
  const p = state.player;
  targetX = THREE.MathUtils.clamp(targetX, 7.0, 93.0);
  targetZ = THREE.MathUtils.clamp(targetZ, 7.0, 93.0);

  // If clicking directly into the chocolate river, snap to nearest bank
  if (Math.abs(targetZ - 36.0) < 4.2) {
    const isBridge = Math.abs(targetX - 50.0) <= 3.3 || Math.abs(targetX - 20.0) <= 2.4 || Math.abs(targetX - 80.0) <= 2.4;
    if (!isBridge) {
      targetZ = targetZ >= 36.0 ? 41.5 : 30.5;
    }
  }

  const pz = p.worldPos.z;
  const crossesCanal = (pz < 36.0 && targetZ > 36.0) || (pz > 36.0 && targetZ < 36.0);

  const waypoints = [];

  if (crossesCanal) {
    // Pick nearest of the 3 bridges
    const bridges = [20.0, 50.0, 80.0];
    let bestBridgeX = 50.0;
    let bestDist = Infinity;
    bridges.forEach(bx => {
      const d = Math.abs(p.worldPos.x - bx) + Math.abs(targetX - bx);
      if (d < bestDist) {
        bestDist = d;
        bestBridgeX = bx;
      }
    });

    const startBankZ = pz < 36.0 ? 30.8 : 41.2;
    const endBankZ = pz < 36.0 ? 41.2 : 30.8;

    // Route across bridge
    waypoints.push({ x: bestBridgeX, z: startBankZ });
    waypoints.push({ x: bestBridgeX, z: 36.0 });
    waypoints.push({ x: bestBridgeX, z: endBankZ });
    waypoints.push({ x: targetX, z: targetZ });
  } else {
    // Direct path
    waypoints.push({ x: targetX, z: targetZ });
  }

  p.path = waypoints;
  p.isMoving = true;

  // Show target marker
  const targetGroundY = getTerrainElevation(targetX, targetZ);
  targetMarkerMesh.position.set(targetX, targetGroundY + 0.08, targetZ);
  targetMarkerMesh.visible = true;
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
  const hit = raycaster.ray.intersectPlane(groundPlane, intersectPoint);

  if (hit) {
    const wx = THREE.MathUtils.clamp(hit.x, 3.0, 97.0);
    const wz = THREE.MathUtils.clamp(hit.z, 3.0, 97.0);
    const wy = getTerrainElevation(wx, wz);

    tileCursorMesh.position.set(wx, wy + 0.08, wz);
    tileCursorMesh.visible = true;
    return;
  }

  tileCursorMesh.visible = false;
}

function onPointerDown(e) {
  // Only process primary left button
  if (e.button !== 0) return;

  // Prevent when clicking on HUD, modals, speech bubbles or cards
  if (e.target.closest('.village-hud, .bwed-modal, .modal-backdrop, .speech-bubble, .village-toast, .interaction-card')) return;

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersectPoint = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(groundPlane, intersectPoint);

  if (hit) {
    const wx = THREE.MathUtils.clamp(hit.x, 3.0, 97.0);
    const wz = THREE.MathUtils.clamp(hit.z, 3.0, 97.0);
    navigateToWorldPos(wx, wz);
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
  if (targetMarkerMesh && targetMarkerMesh.visible) {
    targetMarkerMesh.rotation.z += dt * 2.8;
    const s = 1.0 + Math.sin(clock.elapsedTime * 8) * 0.12;
    targetMarkerMesh.scale.set(s, s, 1);
  }

  // 8. Liquid Chocolate Canal Shimmer Animation
  if (chocoMaterial) {
    chocoMaterial.roughness = 0.22 + Math.sin(clock.elapsedTime * 1.8) * 0.08;
  }

  // 9. Update Living Village Systems (Fountain, NPCs, Smoke, Buoys, Pollen, Mats, Stars, Compass, Minimap)
  updateGrandPlaceFountain(dt);
  updateVillageNPCs(dt);
  updateChimneySmoke(dt);
  updateCanalBuoys(dt);
  updatePollenParticles(dt);
  updateBuildingEntranceMats(clock.elapsedTime);
  updateNightStars(clock.elapsedTime);
  updateCompassHeading();
  renderCadastreMinimap();

  // 10. Render
  renderer.render(scene, camera);
}

// Movement Handler (Combines Point-and-Click Smooth Path & WASD Direct Movement)
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

    const nextX = THREE.MathUtils.clamp(p.worldPos.x + moveX, 7.0, 93.0);
    const nextZ = THREE.MathUtils.clamp(p.worldPos.z + moveZ, 7.0, 93.0);

    // Canal crossing: allow only on bridges (canal center z = 36.0m)
    const inCanal = Math.abs(nextZ - 36.0) < 4.2;
    const isBridge = Math.abs(nextX - 50.0) <= 3.3 || Math.abs(nextX - 20.0) <= 2.4 || Math.abs(nextX - 80.0) <= 2.4;

    if (!inCanal || isBridge) {
      p.worldPos.x = nextX;
      p.worldPos.z = nextZ;
    }
  } else if (p.path.length > 0) {
    // Follow Path Waypoints
    const target = p.path[0];
    const dx = target.x - p.worldPos.x;
    const dz = target.z - p.worldPos.z;
    const dist = Math.hypot(dx, dz);

    p.targetRotation = Math.atan2(dx, dz);

    if (dist < 0.35) {
      p.worldPos.x = target.x;
      p.worldPos.z = target.z;
      p.path.shift();

      if (p.path.length === 0) {
        p.isMoving = false;
        targetMarkerMesh.visible = false;
      }
    } else {
      const step = Math.min(dist, p.speed * dt);
      p.worldPos.x += (dx / dist) * step;
      p.worldPos.z += (dz / dist) * step;
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

  // Ground elevation calculation directly from unified terrain
  const targetGroundY = getTerrainElevation(p.worldPos.x, p.worldPos.z);

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
    // Smoothly step up or down hills, ramps, and curved bridges
    p.worldPos.y += (targetGroundY - p.worldPos.y) * 0.35;
  }

  playerMesh.position.copy(p.worldPos);
  playerMesh.rotation.y = p.rotation;

  // Sync Contact Blob Shadow
  if (playerBlobShadow) {
    playerBlobShadow.position.x = p.worldPos.x;
    playerBlobShadow.position.z = p.worldPos.z;
    playerBlobShadow.position.y = targetGroundY + 0.02;
    const jumpOffset = Math.max(0, p.worldPos.y - targetGroundY);
    const shadowScale = Math.max(0.45, 1.0 - jumpOffset * 0.24);
    playerBlobShadow.scale.set(shadowScale, shadowScale, shadowScale);
    playerBlobShadow.material.opacity = Math.max(0.18, 0.65 - jumpOffset * 0.16);
  }

  // Soft rhythmic footstep sound when walking on ground or wooden bridges
  if (p.isMoving && p.isGrounded) {
    footstepDist += p.speed * dt;
    if (footstepDist >= 2.6) {
      footstepDist = 0;
      const onBridge = Math.abs(p.worldPos.z - 36.0) <= 5.2 && (
        Math.abs(p.worldPos.x - 50.0) <= 3.4 ||
        Math.abs(p.worldPos.x - 20.0) <= 2.5 ||
        Math.abs(p.worldPos.x - 80.0) <= 2.5
      );
      if (onBridge) {
        playSfx('wood_bridge');
      } else {
        playSfx('step');
      }
    }
  } else {
    footstepDist = 0;
  }
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

  // 3. Detect Entrance Mats & Doorsteps
  let steppedOnMat = null;
  for (let i = 0; i < entranceMats.length; i++) {
    const mat = entranceMats[i];
    const dist = Math.hypot(p.x - mat.x, p.z - mat.z);
    if (dist < 1.7) {
      steppedOnMat = mat;
      break;
    }
  }

  if (steppedOnMat && steppedOnMat !== lastEnteredEntranceMat) {
    lastEnteredEntranceMat = steppedOnMat;
    playSfx('shop_bell');
    steppedOnMat.group.scale.set(1.12, 1.12, 1.12);
    setTimeout(() => {
      if (steppedOnMat && steppedOnMat.group) steppedOnMat.group.scale.set(1.0, 1.0, 1.0);
    }, 280);
  } else if (!steppedOnMat && lastEnteredEntranceMat) {
    const dist = Math.hypot(p.x - lastEnteredEntranceMat.x, p.z - lastEnteredEntranceMat.z);
    if (dist > 2.8) {
      lastEnteredEntranceMat = null;
    }
  }

  // 4. Check Quest Completion
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
      const dist = Math.hypot(pos.x - 25 * MAP_CONFIG.tileSize, pos.z - 26 * MAP_CONFIG.tileSize);
      return dist <= 14;
    }
  },
  {
    id: 'patisserie',
    title: 'Le Parfum du Croissant Chaud',
    check: pos => {
      const dist = Math.hypot(pos.x - 34 * MAP_CONFIG.tileSize, pos.z - 26 * MAP_CONFIG.tileSize);
      return dist <= 10;
    }
  },
  {
    id: 'canal',
    title: 'L\'Appel du Grand Canal',
    check: pos => {
      return (
        pos.z >= 14 * MAP_CONFIG.tileSize &&
        pos.z <= 22 * MAP_CONFIG.tileSize &&
        pos.x >= 12 * MAP_CONFIG.tileSize &&
        pos.x <= 40 * MAP_CONFIG.tileSize
      );
    }
  },
  {
    id: 'observatory',
    title: 'Les Mystères Célestes',
    check: pos => {
      const dist = Math.hypot(pos.x - 10 * MAP_CONFIG.tileSize, pos.z - 40 * MAP_CONFIG.tileSize);
      return dist <= 14;
    }
  },
  {
    id: 'woods',
    title: 'La Halte Sylvestre',
    check: pos => {
      const dist = Math.hypot(pos.x - 8 * MAP_CONFIG.tileSize, pos.z - 8 * MAP_CONFIG.tileSize);
      return dist <= 12;
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
  } else if (type === 'step') {
    osc.type = 'triangle';
    const f = 140 + Math.random() * 30;
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.035);
    gain.gain.setValueAtTime(vol * 0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.start(now);
    osc.stop(now + 0.035);
  } else if (type === 'splash') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);
    gain.gain.setValueAtTime(vol * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.start(now);
    osc.stop(now + 0.09);
  } else if (type === 'shop_bell') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(698.46, now); // F5
    osc.frequency.setValueAtTime(880.00, now + 0.14); // A5
    gain.gain.setValueAtTime(vol * 0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc.start(now);
    osc.stop(now + 0.85);
  } else if (type === 'wood_bridge') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 + Math.random() * 25, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.05);
    gain.gain.setValueAtTime(vol * 0.28, now);
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
    plaza: { x: 25, z: 27, name: 'La Grand-Place du Beurre Doré' },
    gourmet: { x: 34, z: 26, name: 'Le Faubourg Gourmand & Marché' },
    residential: { x: 10, z: 27, name: 'Le Village Fleuri des Pains' },
    woods: { x: 8, z: 8, name: 'Le Bois de Cannelle' },
    port: { x: 25, z: 15, name: 'Le Port & Canal de Chocolat Chaud' },
    arcade: { x: 40, z: 41, name: 'La Fête Foraine & BwedWare Arcade' },
    sanctuary: { x: 10, z: 40, name: 'La Colline de l\'Observatoire Céleste' }
  };

  const target = coords[districtId];
  if (!target) return;

  const wx = target.x * MAP_CONFIG.tileSize;
  const wz = target.z * MAP_CONFIG.tileSize;
  const wy = getTerrainElevation(wx, wz);

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
// INTERACTIVE CADASTRE MINIMAP CANVAS
// ============================================================================
function initCadastreMinimap() {
  if (!villageMapCanvas) return;
  mapCanvasCtx = villageMapCanvas.getContext('2d');

  villageMapCanvas.addEventListener('click', e => {
    const rect = villageMapCanvas.getBoundingClientRect();
    const scaleX = villageMapCanvas.width / rect.width;
    const scaleY = villageMapCanvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const worldX = (clickX / 460.0) * 100.0;
    const worldZ = (clickY / 460.0) * 100.0;

    if (isWalkable(worldX, worldZ)) {
      state.player.worldPos.set(worldX, getTerrainElevation(worldX, worldZ), worldZ);
      state.player.targetPos.copy(state.player.worldPos);
      state.player.path = [];
      state.player.isMoving = false;
      if (playerMesh) playerMesh.position.copy(state.player.worldPos);

      spawnCrumbBurst(state.player.worldPos, 22);
      playSfx('teleport');
      closeAllModals();
      showToast('Téléportation Cadastre', `Coordonnées : [${Math.round(worldX / 2)}, ${Math.round(worldZ / 2)}]`, '⚐');
    } else {
      playSfx('click');
      showToast('Zone inaccessible', 'Cette zone se trouve dans le canal ou hors des sentiers.', '!');
    }
  });
}

function renderCadastreMinimap() {
  if (!mapCanvasCtx || !mapModal || mapModal.hidden) return;
  const ctx = mapCanvasCtx;
  const w = 460;
  const h = 460;
  const scale = w / 100.0; // 4.6 px per meter

  ctx.clearRect(0, 0, w, h);

  // 1. Surrounding Pastry Sea
  ctx.fillStyle = '#1e0f09';
  ctx.fillRect(0, 0, w, h);

  // 2. Island Diorama Contour (Rounded superellipse from x=4 to 96, z=4 to 96)
  const ix = 4 * scale;
  const iz = 4 * scale;
  const iw = 92 * scale;
  const ih = 92 * scale;
  const rCorner = 36;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ix + rCorner, iz);
  ctx.lineTo(ix + iw - rCorner, iz);
  ctx.quadraticCurveTo(ix + iw, iz, ix + iw, iz + rCorner);
  ctx.lineTo(ix + iw, iz + ih - rCorner);
  ctx.quadraticCurveTo(ix + iw, iz + ih, ix + iw - rCorner, iz + ih);
  ctx.lineTo(ix + rCorner, iz + ih);
  ctx.quadraticCurveTo(ix, iz + ih, ix, iz + ih - rCorner);
  ctx.lineTo(ix, iz + rCorner);
  ctx.quadraticCurveTo(ix, iz, ix + rCorner, iz);
  ctx.closePath();

  // Matcha Grass Fill
  ctx.fillStyle = '#6ea343';
  ctx.fill();

  // Vanille & Biscuit Crust Rim
  ctx.strokeStyle = '#dfa858';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();

  // 3. Shaded Elevation Rings
  // Observatory Hill (SW: centered at x=20, z=80)
  const obsPx = 20 * scale;
  const obsPy = 80 * scale;
  ctx.fillStyle = 'rgba(130, 185, 75, 0.45)';
  ctx.beginPath();
  ctx.arc(obsPx, obsPy, 13 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(150, 205, 90, 0.55)';
  ctx.beginPath();
  ctx.arc(obsPx, obsPy, 7 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Woods Hillock (NW: centered at x=16, z=20)
  const woodsPx = 16 * scale;
  const woodsPy = 20 * scale;
  ctx.fillStyle = 'rgba(110, 165, 65, 0.4)';
  ctx.beginPath();
  ctx.arc(woodsPx, woodsPy, 11 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 4. Chocolate River Canal (z = 31.8m to 40.2m, center 36m)
  const canalY = 31.8 * scale;
  const canalH = (40.2 - 31.8) * scale;
  ctx.fillStyle = '#26120a';
  ctx.fillRect(ix, canalY, iw, canalH);

  // Vanilla wave ripples in canal
  ctx.strokeStyle = 'rgba(245, 238, 225, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ix, canalY + canalH * 0.5);
  ctx.lineTo(ix + iw, canalY + canalH * 0.5);
  ctx.stroke();

  // Quays (Wood Boardwalks)
  ctx.fillStyle = '#733a1e';
  ctx.fillRect(ix + 6, (30.2) * scale, iw - 12, 1.6 * scale);
  ctx.fillRect(ix + 6, (40.2) * scale, iw - 12, 1.6 * scale);

  // 5. Roads (Caramel Boulevards)
  ctx.strokeStyle = '#dfa858';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Grand Avenue North-South
  ctx.lineWidth = 5.8 * scale;
  ctx.beginPath();
  ctx.moveTo(50 * scale, 15 * scale);
  ctx.lineTo(50 * scale, 52 * scale);
  ctx.lineTo(50 * scale, 90 * scale);
  ctx.stroke();

  // Avenue East-West
  ctx.lineWidth = 5.2 * scale;
  ctx.beginPath();
  ctx.moveTo(14 * scale, 52 * scale);
  ctx.lineTo(86 * scale, 52 * scale);
  ctx.stroke();

  // Branch to Arcade (Southeast)
  ctx.lineWidth = 4.8 * scale;
  ctx.beginPath();
  ctx.moveTo(68 * scale, 52 * scale);
  ctx.lineTo(78 * scale, 82 * scale);
  ctx.stroke();

  // Branch to Observatory (Southwest)
  ctx.lineWidth = 4.2 * scale;
  ctx.beginPath();
  ctx.moveTo(32 * scale, 52 * scale);
  ctx.lineTo(20 * scale, 80 * scale);
  ctx.stroke();

  // 6. Arched Bridges over Canal
  const drawBridge = (bx, bw) => {
    ctx.fillStyle = '#5c2d15';
    ctx.fillRect((bx - bw * 0.5) * scale, (30.8) * scale, bw * scale, (10.4) * scale);
    ctx.strokeStyle = '#c49553';
    ctx.lineWidth = 2;
    ctx.strokeRect((bx - bw * 0.5) * scale, (30.8) * scale, bw * scale, (10.4) * scale);
  };
  drawBridge(50.0, 6.6); // Center Bridge
  drawBridge(20.0, 4.8); // West Bridge
  drawBridge(80.0, 4.8); // East Bridge

  // 7. Grand-Place Octagonal Plaza (at x=50, z=52)
  const gpx = 50 * scale;
  const gpz = 52 * scale;
  const gpr = 13.5 * scale;
  ctx.fillStyle = '#e8b264';
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ax = gpx + Math.cos(a) * gpr;
    const ay = gpz + Math.sin(a) * gpr;
    if (i === 0) ctx.moveTo(ax, ay);
    else ctx.lineTo(ax, ay);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#f5eee1';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Fountain pool
  ctx.fillStyle = '#3a1e12';
  ctx.beginPath();
  ctx.arc(gpx, gpz, 3.6 * scale, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f6c344';
  ctx.beginPath();
  ctx.arc(gpx, gpz, 1.8 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 8. Citizen Cottages (Mini House Icons)
  CITIZEN_HOUSES.forEach(h => {
    const hx = h.gridX * MAP_CONFIG.tileSize * scale;
    const hz = h.gridZ * MAP_CONFIG.tileSize * scale;
    ctx.fillStyle = '#' + (h.roofColor || 0xe65271).toString(16).padStart(6, '0');
    ctx.beginPath();
    ctx.arc(hx, hz, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // 9. Landmarks Pins
  const mapPins = [
    { label: "Grand-Place", x: 50, z: 52, color: "#ffb84d" },
    { label: "Pâtisserie", x: 68, z: 52, color: "#ff8833" },
    { label: "Taverne", x: 78, z: 46, color: "#ffaa22" },
    { label: "Arcade", x: 80, z: 82, color: "#00f0ff" },
    { label: "Observatoire", x: 20, z: 80, color: "#aa44ff" },
    { label: "Port", x: 50, z: 28, color: "#55bbff" },
    { label: "Bois Cannelle", x: 16, z: 20, color: "#88cc44" }
  ];

  ctx.font = 'bold 9px Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  mapPins.forEach(p => {
    const px = p.x * scale;
    const pz = p.z * scale;

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(px, pz, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1a0c07';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label tag
    ctx.fillStyle = 'rgba(26, 12, 7, 0.85)';
    const textW = ctx.measureText(p.label).width + 8;
    ctx.fillRect(px - textW * 0.5, pz - 15, textW, 12);
    ctx.fillStyle = '#fffdf9';
    ctx.fillText(p.label, px, pz - 9);
  });

  // 10. Live Player Pin
  const playerPx = state.player.worldPos.x * scale;
  const playerPz = state.player.worldPos.z * scale;
  const pulseR = 8 + Math.sin(Date.now() * 0.007) * 3;

  // Outer golden pulse ring
  ctx.strokeStyle = 'rgba(255, 209, 90, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(playerPx, playerPz, pulseR, 0, Math.PI * 2);
  ctx.stroke();

  // Solid Player Disc
  ctx.fillStyle = '#ffd15a';
  ctx.beginPath();
  ctx.arc(playerPx, playerPz, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c1711';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Directional Pointer Arrow
  const heading = state.player.rotation;
  const arrowLen = 11;
  const ax = playerPx + Math.sin(heading) * arrowLen;
  const ay = playerPz + Math.cos(heading) * arrowLen;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(playerPx, playerPz);
  ctx.lineTo(ax, ay);
  ctx.stroke();
}
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
