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
  VILLAGE_LANTERNS
} from './village-map-data.js';

// --- GAME STATE ---
const state = {
  grid: null,
  player: {
    gridX: 18,
    gridZ: 15,
    worldPos: new THREE.Vector3(18 * MAP_CONFIG.tileSize, 0, 15 * MAP_CONFIG.tileSize),
    targetPos: new THREE.Vector3(18 * MAP_CONFIG.tileSize, 0, 15 * MAP_CONFIG.tileSize),
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
    distance: 26,
    targetDistance: 26,
    minDistance: 12,
    maxDistance: 45,
    offset: new THREE.Vector3(0, 0, 0)
  },
  hoveredTile: null,
  nearbyBuilding: null,
  timeOfDay: 'day', // 'day', 'golden', 'night'
  audioPlaying: false
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

// --- THREE.JS GLOBALS ---
let scene, camera, renderer, clock;
let sunLight, hemiLight;
let tileCursorMesh, targetMarkerMesh;
let playerMesh, playerBones = {};
const buildingObjects = [];
const lanternPointLights = [];
const speechBubbles = [];
const particles = [];

// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  clock = new THREE.Clock();
  state.grid = generateVillageGrid();

  // 1. Scene & Fog
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x180b06);
  scene.fog = new THREE.FogExp2(0x180b06, 0.012);

  // 2. Camera (Isometric Perspective)
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(40, aspect, 0.5, 180);
  updateCameraPosition(true);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  // 4. Lights & Sky
  setupLighting();

  // 5. Build Tile Grid
  buildInstancedTileGrid();

  // 6. Build Grid Helpers & Cursors
  setupCursors();

  // 7. Spawn Procedural Rigged Bwed Avatar
  buildProceduralBwed();

  // 8. Load Village GLB Buildings & Props
  loadVillageBuildings();

  // 9. Input & Event Listeners
  setupEventListeners();

  // 10. Hide Loader after brief setup
  setTimeout(() => {
    loaderBar.style.width = '100%';
    loaderStatus.textContent = 'Village prêt ! Bienvenue à Bwedville.';
    setTimeout(() => {
      loaderEl.classList.add('fade-out');
    }, 450);
  }, 900);

  // 11. Start Loop
  renderer.setAnimationLoop(animate);
}

// ============================================================================
// LIGHTING & ATMOSPHERE
// ============================================================================
function setupLighting() {
  hemiLight = new THREE.HemisphereLight(0xffecd2, 0x3d2014, 0.85);
  scene.add(hemiLight);

  sunLight = new THREE.DirectionalLight(0xfff5e1, 1.45);
  sunLight.position.set(30, 45, 20);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 5;
  sunLight.shadow.camera.far = 120;
  const d = 40;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);

  // Spawn Street Lantern Point Lights
  VILLAGE_LANTERNS.forEach(pos => {
    const light = new THREE.PointLight(0xffaa44, 1.2, 12, 1.8);
    light.position.set(pos.x * MAP_CONFIG.tileSize, 3.2, pos.z * MAP_CONFIG.tileSize);
    light.castShadow = false;
    scene.add(light);
    lanternPointLights.push(light);

    // Cute brass street lamp model
    buildStreetLampPost(pos.x, pos.z);
  });
}

function setTimeOfDay(tod) {
  state.timeOfDay = tod;
  if (tod === 'day') {
    scene.background.set(0x1a0d07);
    scene.fog.color.set(0x1a0d07);
    hemiLight.color.set(0xffecd2);
    hemiLight.groundColor.set(0x3d2014);
    hemiLight.intensity = 0.9;
    sunLight.color.set(0xfff5e1);
    sunLight.intensity = 1.45;
    sunLight.position.set(30, 45, 20);
    lanternPointLights.forEach(l => l.intensity = 0.4);
    todIcon.textContent = 'Soleil Doré';
  } else if (tod === 'golden') {
    scene.background.set(0x2d1109);
    scene.fog.color.set(0x2d1109);
    hemiLight.color.set(0xff9944);
    hemiLight.groundColor.set(0x4a180d);
    hemiLight.intensity = 0.85;
    sunLight.color.set(0xff7722);
    sunLight.intensity = 1.6;
    sunLight.position.set(45, 25, 10);
    lanternPointLights.forEach(l => l.intensity = 1.2);
    todIcon.textContent = 'Heure Dorée';
  } else if (tod === 'night') {
    scene.background.set(0x0a0504);
    scene.fog.color.set(0x0a0504);
    hemiLight.color.set(0x334466);
    hemiLight.groundColor.set(0x150b07);
    hemiLight.intensity = 0.4;
    sunLight.color.set(0x4466aa);
    sunLight.intensity = 0.35;
    sunLight.position.set(-20, 35, -20);
    lanternPointLights.forEach(l => l.intensity = 2.4);
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

  // Materials for each tile type
  const materials = {
    [TILE_TYPES.COBBLE_SABLE]: new THREE.MeshStandardMaterial({
      color: 0xd8a474,
      roughness: 0.85,
      metalness: 0.05
    }),
    [TILE_TYPES.MATCHA_GRASS]: new THREE.MeshStandardMaterial({
      color: 0x6e8f48,
      roughness: 0.95,
      metalness: 0.02
    }),
    [TILE_TYPES.WAFFLE_PLAZA]: new THREE.MeshStandardMaterial({
      color: 0xe09b3d,
      roughness: 0.7,
      metalness: 0.08
    }),
    [TILE_TYPES.CHOCO_CANAL]: new THREE.MeshStandardMaterial({
      color: 0x38180c,
      roughness: 0.25,
      metalness: 0.15
    }),
    [TILE_TYPES.WOOD_PIER]: new THREE.MeshStandardMaterial({
      color: 0x824e2c,
      roughness: 0.75,
      metalness: 0.04
    }),
    [TILE_TYPES.MILLEFEUILLE_ROCK]: new THREE.MeshStandardMaterial({
      color: 0xb58253,
      roughness: 0.9,
      metalness: 0.05
    })
  };

  // Create an InstancedMesh per material
  const instancedMeshes = {};
  Object.keys(materials).forEach(type => {
    const mesh = new THREE.InstancedMesh(tileGeo, materials[type], totalTiles);
    mesh.castShadow = true;
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

// Street Lamp Post Prop
function buildStreetLampPost(gridX, gridZ) {
  const group = new THREE.Group();
  const worldX = gridX * MAP_CONFIG.tileSize;
  const worldZ = gridZ * MAP_CONFIG.tileSize;

  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffe277 });

  // Brass Stem
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 3.0, 12);
  const pole = new THREE.Mesh(poleGeo, brassMat);
  pole.position.y = 1.5;
  pole.castShadow = true;
  group.add(pole);

  // Lantern Cage & Pearl
  const cageGeo = new THREE.SphereGeometry(0.35, 12, 12);
  const cage = new THREE.Mesh(cageGeo, glowMat);
  cage.position.y = 3.1;
  group.add(cage);

  group.position.set(worldX, 0, worldZ);
  scene.add(group);
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
// PROCEDURAL RIGGED BWED AVATAR
// ============================================================================
function buildProceduralBwed() {
  playerMesh = new THREE.Group();

  // Materials
  const crustMat = new THREE.MeshStandardMaterial({ color: 0x8a4522, roughness: 0.75, metalness: 0.05 });
  const crumbMat = new THREE.MeshStandardMaterial({ color: 0xfef7ea, roughness: 0.9, metalness: 0.02 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x110804, roughness: 0.15, metalness: 0.2 });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xcc291e, roughness: 0.5, metalness: 0.1 });
  const whiteSoleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });

  // 1. Root & Hips
  const hips = new THREE.Group();
  hips.position.y = 0.55;
  playerMesh.add(hips);
  playerBones.hips = hips;

  // 2. Bread Slice Body (Crust + Crumb)
  const body = new THREE.Group();
  hips.add(body);
  playerBones.body = body;

  // Crust Back & Rim (Rounded Loaf Shape)
  const crustGeo = new THREE.BoxGeometry(0.95, 1.15, 0.38);
  const crustMesh = new THREE.Mesh(crustGeo, crustMat);
  crustMesh.castShadow = true;
  body.add(crustMesh);

  // Crumb Front Face (Recessed)
  const crumbGeo = new THREE.BoxGeometry(0.85, 1.05, 0.08);
  const crumbMesh = new THREE.Mesh(crumbGeo, crumbMat);
  crumbMesh.position.z = 0.18;
  body.add(crumbMesh);

  // Big Shiny Black Eyes
  const eyeGeo = new THREE.SphereGeometry(0.095, 16, 16);
  eyeGeo.scale(0.9, 1.3, 0.6);

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.22, 0.08, 0.23);
  body.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.22, 0.08, 0.23);
  body.add(rightEye);

  // Specular Catchlights
  const sparkGeo = new THREE.SphereGeometry(0.025, 8, 8);
  const leftSpark = new THREE.Mesh(sparkGeo, catchlightMat);
  leftSpark.position.set(-0.2, 0.13, 0.28);
  body.add(leftSpark);

  const rightSpark = new THREE.Mesh(sparkGeo, catchlightMat);
  rightSpark.position.set(0.24, 0.13, 0.28);
  body.add(rightSpark);

  // Cute Tiny Smile
  const smileGeo = new THREE.TorusGeometry(0.05, 0.015, 8, 16, Math.PI);
  const smileMat = new THREE.MeshBasicMaterial({ color: 0x4a180d });
  const smile = new THREE.Mesh(smileGeo, smileMat);
  smile.rotation.x = Math.PI;
  smile.position.set(0, -0.12, 0.23);
  body.add(smile);

  // 3. Iconic Red Sneakers (Left & Right Legs)
  function makeShoe(isLeft) {
    const legGroup = new THREE.Group();
    legGroup.position.set(isLeft ? -0.22 : 0.22, 0, 0);

    // Thin doughy leg
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.45, 10);
    const leg = new THREE.Mesh(legGeo, crumbMat);
    leg.position.y = -0.22;
    legGroup.add(leg);

    // Chubby Red Sneaker
    const shoe = new THREE.Group();
    shoe.position.set(0, -0.42, 0.06);

    const shoeBodyGeo = new THREE.BoxGeometry(0.22, 0.18, 0.38);
    const shoeBody = new THREE.Mesh(shoeBodyGeo, shoeMat);
    shoeBody.castShadow = true;
    shoe.add(shoeBody);

    // White Rubber Sole
    const soleGeo = new THREE.BoxGeometry(0.24, 0.06, 0.4);
    const sole = new THREE.Mesh(soleGeo, whiteSoleMat);
    sole.position.y = -0.09;
    shoe.add(sole);

    legGroup.add(shoe);
    return { legGroup, shoe };
  }

  const leftLegData = makeShoe(true);
  const rightLegData = makeShoe(false);
  hips.add(leftLegData.legGroup);
  hips.add(rightLegData.legGroup);
  playerBones.leftLeg = leftLegData.legGroup;
  playerBones.rightLeg = rightLegData.legGroup;

  // 4. Arms
  function makeArm(isLeft) {
    const armGroup = new THREE.Group();
    armGroup.position.set(isLeft ? -0.52 : 0.52, 0.05, 0);

    const armGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.4, 10);
    const arm = new THREE.Mesh(armGeo, crumbMat);
    arm.position.y = -0.18;
    arm.rotation.z = isLeft ? 0.25 : -0.25;
    armGroup.add(arm);

    return armGroup;
  }

  const leftArm = makeArm(true);
  const rightArm = makeArm(false);
  body.add(leftArm);
  body.add(rightArm);
  playerBones.leftArm = leftArm;
  playerBones.rightArm = rightArm;

  // Set initial position
  playerMesh.position.copy(state.player.worldPos);
  scene.add(playerMesh);
}

// ============================================================================
// VILLAGE GLB BUILDINGS LOADER
// ============================================================================
function loadVillageBuildings() {
  const loader = new GLTFLoader();

  VILLAGE_BUILDINGS.forEach(b => {
    loader.load(
      b.model,
      gltf => {
        const model = gltf.scene;
        const worldX = b.gridX * MAP_CONFIG.tileSize;
        const worldZ = b.gridZ * MAP_CONFIG.tileSize;

        model.position.set(worldX, 0, worldZ);
        model.scale.set(b.scale, b.scale, b.scale);
        model.rotation.y = b.rotationY || 0;

        // Shadows
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);
        buildingObjects.push({ config: b, mesh: model });

        // Mark tiles as occupied in the grid
        const halfW = Math.floor(b.sizeX / 2);
        const halfH = Math.floor(b.sizeZ / 2);
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
      },
      undefined,
      err => {
        console.warn(`Could not load building model ${b.model}`, err);
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

function rotateCamera() {
  state.camera.targetAzimuth += Math.PI / 4;
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
  state.player.emoteTimer = 1.2;

  if (name === 'jump' && state.player.isGrounded) {
    state.player.verticalVelocity = 8.5;
    state.player.isGrounded = false;
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

    if (e.code === 'KeyQ') state.camera.targetAzimuth -= Math.PI / 4;
    if (e.code === 'KeyE') state.camera.targetAzimuth += Math.PI / 4;
    if (e.code === 'Space') triggerEmote('jump');
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

  camRotateBtn.addEventListener('click', rotateCamera);

  audioBtn.addEventListener('click', () => {
    state.audioPlaying = !state.audioPlaying;
    audioIcon.textContent = state.audioPlaying ? 'Musique : ON' : 'Musique : OFF';
    audioBtn.classList.toggle('active', state.audioPlaying);
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
// MAIN ANIMATION LOOP
// ============================================================================
function animate() {
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

  // 6. Pulse Cursors
  if (tileCursorMesh.visible) {
    const s = 1 + Math.sin(clock.elapsedTime * 6) * 0.04;
    tileCursorMesh.scale.set(s, s, 1);
  }

  // 7. Render
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

  // Jump Gravity
  if (!p.isGrounded) {
    p.verticalVelocity -= 22 * dt;
    p.worldPos.y += p.verticalVelocity * dt;

    if (p.worldPos.y <= 0) {
      p.worldPos.y = 0;
      p.verticalVelocity = 0;
      p.isGrounded = true;
    }
  }

  playerMesh.position.copy(p.worldPos);
  playerMesh.rotation.y = p.rotation;
}

// Procedural Waddle Walk & Breathing Animations
function updateAvatarAnimation(dt) {
  const p = state.player;
  const t = clock.elapsedTime;
  const b = playerBones;

  if (p.isMoving) {
    // Iconic Bwed Waddle: tilt body left/right, alternate leg swings
    const waddleFreq = 11;
    const waddleSwing = Math.sin(t * waddleFreq);

    b.body.rotation.z = waddleSwing * 0.12; // Body tilt
    b.body.position.y = Math.abs(Math.cos(t * waddleFreq)) * 0.1; // Step bounce

    b.leftLeg.rotation.x = waddleSwing * 0.65;
    b.rightLeg.rotation.x = -waddleSwing * 0.65;

    b.leftArm.rotation.x = -waddleSwing * 0.5;
    b.rightArm.rotation.x = waddleSwing * 0.5;
  } else {
    // Idle: gentle squash-and-stretch breathing
    const idleFreq = 2.4;
    const breathe = Math.sin(t * idleFreq);

    b.body.scale.set(1 + breathe * 0.02, 1 - breathe * 0.02, 1);
    b.body.position.y = breathe * 0.03;
    b.body.rotation.z = 0;

    b.leftLeg.rotation.x = 0;
    b.rightLeg.rotation.x = 0;

    // Emotes
    if (p.activeEmote === 'wave' && p.emoteTimer > 0) {
      p.emoteTimer -= dt;
      b.rightArm.rotation.z = -1.8 + Math.sin(t * 16) * 0.4;
    } else {
      b.leftArm.rotation.x = 0;
      b.rightArm.rotation.x = 0;
      b.rightArm.rotation.z = -0.25;
    }
  }
}

// Proximity & District Detection
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
}

// Run engine
init();
