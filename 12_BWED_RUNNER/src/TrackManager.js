/* ==========================================================================
   BWED BUTTER ESCAPE — STREET BOULEVARD & TRACK (V4 100% REAL 3D BUILDINGS)
   Replaces ALL buildings along the street exclusively with real 3D GLBs
   from the Bwedverse assets:
   - patisserie-coin.glb
   - milk-carton-apartments.glb
   - galeries-boutique.glb
   - honey-pot-tavern.glb
   - shop-barber-chantilly.glb
   - jam-jar-apothecary.glb
   - arcade-duel.glb
   - teacup-gazebo-park.glb
   - arcade-podium-tiered-cake.glb
   ========================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LANES } from './Player.js';
import { OBSTACLE_TYPES } from './Obstacles.js';

export const CHUNK_LENGTH = 32.0;
export const NUM_CHUNKS = 8;

export const ZONES = [
  { id: 1, name: "Baker's Alley", startDist: 0, length: 300, speedMin: 13.5, speedMax: 16.5 },
  { id: 2, name: 'Golden Butter Boulevard', startDist: 300, length: 450, speedMin: 17.0, speedMax: 20.0 },
  { id: 3, name: 'Whipped Cream Avenue', startDist: 750, length: 650, speedMin: 20.5, speedMax: 23.5 },
  { id: 4, name: 'The Grand Gourmet Challenge', startDist: 1400, length: 1200, speedMin: 24.0, speedMax: 27.5 },
];

export const REAL_BUILDINGS_CONFIG = [
  { id: 'patisserie-coin', file: './assets/buildings/patisserie-coin.glb', targetHeight: 9.5 },
  { id: 'milk-carton-apartments', file: './assets/buildings/milk-carton-apartments.glb', targetHeight: 11.0 },
  { id: 'galeries-boutique', file: './assets/buildings/galeries-boutique.glb', targetHeight: 9.5 },
  { id: 'honey-pot-tavern', file: './assets/buildings/honey-pot-tavern.glb', targetHeight: 9.0 },
  { id: 'shop-barber-chantilly', file: './assets/buildings/shop-barber-chantilly.glb', targetHeight: 9.0 },
  { id: 'jam-jar-apothecary', file: './assets/buildings/jam-jar-apothecary.glb', targetHeight: 9.5 },
  { id: 'arcade-duel', file: './assets/buildings/arcade-duel.glb', targetHeight: 9.5 },
  { id: 'teacup-gazebo-park', file: './assets/buildings/teacup-gazebo-park.glb', targetHeight: 8.5 },
  { id: 'arcade-podium-tiered-cake', file: './assets/buildings/arcade-podium-tiered-cake.glb', targetHeight: 10.5 },
  { id: 'monument-golden-bloom', file: './assets/buildings/monument-golden-bloom.glb', targetHeight: 10.0 },
  { id: 'portal-observatory', file: './assets/buildings/portal-observatory.glb', targetHeight: 10.0 },
  { id: 'board-cannon-sugar-blast', file: './assets/buildings/board-cannon-sugar-blast.glb', targetHeight: 8.5 },
  { id: 'ride-bumper-cars-donut', file: './assets/buildings/ride-bumper-cars-donut.glb', targetHeight: 9.0 },
  { id: 'vehicle-waffle-submarine', file: './assets/buildings/vehicle-waffle-submarine.glb', targetHeight: 8.0 },
  { id: 'ride-roller-coaster-churro', file: './assets/buildings/ride-roller-coaster-churro.glb', targetHeight: 11.5 },
];

export class TrackManager {
  constructor(scene, obstacleManager, collectableManager) {
    this.scene = scene;
    this.obstacles = obstacleManager;
    this.collectables = collectableManager;

    this.chunks = [];
    this.currentZoneIndex = 0;
    this.onZoneChange = null;

    this.gltfLoader = new GLTFLoader();
    this.loadedBuildingsMap = new Map();
    this.loadedBuildingList = [];

    this.initMaterials();
    this.preloadRealBuildings();
    this.buildInitialTrack();
  }

  initMaterials() {
    this.roadMat = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      roughness: 0.8,
      metalness: 0.1,
    });

    this.sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0xdcd1b4,
      roughness: 0.85,
    });

    this.curbMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      emissive: 0xffaa00,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    });

    this.dashMat = new THREE.MeshStandardMaterial({
      color: 0xf5deb3,
      roughness: 0.9,
    });

    this.lampPostMat = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.8,
      roughness: 0.3,
    });

    this.lampLightMat = new THREE.MeshBasicMaterial({
      color: 0xffeaa7,
    });

    this.treeTrunkMat = new THREE.MeshStandardMaterial({
      color: 0x5d4037,
      roughness: 0.9,
    });

    this.treeFoliageMat = new THREE.MeshStandardMaterial({
      color: 0x55efc4,
      roughness: 0.6,
    });
  }

  // ---------------------------------------------------------------------------
  // Pre-load All Real 3D Buildings
  // ---------------------------------------------------------------------------
  preloadRealBuildings() {
    REAL_BUILDINGS_CONFIG.forEach((cfg) => {
      this.gltfLoader.load(
        cfg.file,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.roughness = Math.max(0.4, child.material.roughness || 0.6);
              }
            }
          });

          // Normalize size & ground pivot
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const targetH = cfg.targetHeight || 9.5;
          const scale = targetH / (size.y || 1);
          model.scale.setScalar(scale);

          // Center horizontally and ground at Y = 0
          model.position.x = -center.x * scale;
          model.position.z = -center.z * scale;
          model.position.y = -box.min.y * scale;

          const root = new THREE.Group();
          root.name = `building_${cfg.id}`;
          root.add(model);

          this.loadedBuildingsMap.set(cfg.id, root);
          this.loadedBuildingList.push(root);

          // Dynamically re-distribute diverse buildings across all boulevard chunks
          this.distributeDiverseBuildings();
        },
        undefined,
        (err) => console.warn(`Could not load building ${cfg.file}:`, err)
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Assign a specific or random real GLB building to a slot
  // ---------------------------------------------------------------------------
  assignSlotBuilding(slot, modelIndex = -1) {
    if (this.loadedBuildingList.length === 0) return;

    while (slot.container.children.length > 0) {
      slot.container.remove(slot.container.children[0]);
    }

    const idx = modelIndex >= 0 ? (modelIndex % this.loadedBuildingList.length) : Math.floor(Math.random() * this.loadedBuildingList.length);
    const sourceModel = this.loadedBuildingList[idx];
    const clone = sourceModel.clone(true);

    // Orient facing the road boulevard
    clone.rotation.y = slot.side === 'left' ? Math.PI * 0.5 : -Math.PI * 0.5;

    // Subtle height and scale variation for realism (+-5%)
    const varScale = 0.95 + ((idx * 7) % 11) * 0.01;
    clone.scale.multiplyScalar(varScale);

    slot.container.add(clone);
    slot.hasRealBuilding = true;
    slot.modelIndex = idx;
  }

  // ---------------------------------------------------------------------------
  // Distribute loaded buildings so that left and right and adjacent slots are diverse
  // ---------------------------------------------------------------------------
  distributeDiverseBuildings() {
    if (this.loadedBuildingList.length === 0) return;

    let globalCounter = 0;
    for (let c = 0; c < this.chunks.length; c++) {
      const chunk = this.chunks[c];
      if (chunk.buildingSlots) {
        chunk.buildingSlots.forEach((slot, sIdx) => {
          // Stride to avoid repeating opposite sides
          const pick = (globalCounter + sIdx * 3) % this.loadedBuildingList.length;
          globalCounter++;
          this.assignSlotBuilding(slot, pick);
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Get Real 3D Building for a slot (Initial slot builder)
  // ---------------------------------------------------------------------------
  createBuildingSlot(side) {
    const slotContainer = new THREE.Group();
    const slot = { container: slotContainer, side, hasRealBuilding: false, modelIndex: -1 };

    if (this.loadedBuildingList.length > 0) {
      this.assignSlotBuilding(slot);
    } else {
      // Temporary warm bakery placeholder while GLB streams in
      const tempGeo = new THREE.BoxGeometry(11, 8.5, 7.5);
      const tempMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.85 });
      const tempMesh = new THREE.Mesh(tempGeo, tempMat);
      tempMesh.position.y = 4.25;
      slotContainer.add(tempMesh);
    }

    return slot;
  }

  buildStreetLamp() {
    const lamp = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.14, 4.6, 12);
    const pole = new THREE.Mesh(poleGeo, this.lampPostMat);
    pole.position.y = 2.3;
    pole.castShadow = true;
    lamp.add(pole);

    const lanternGeo = new THREE.OctahedronGeometry(0.35);
    const lantern = new THREE.Mesh(lanternGeo, this.lampLightMat);
    lantern.position.y = 4.7;
    lamp.add(lantern);
    return lamp;
  }

  buildStreetTree() {
    const tree = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.24, 2.5, 8);
    const trunk = new THREE.Mesh(trunkGeo, this.treeTrunkMat);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    tree.add(trunk);

    const folGeo = new THREE.DodecahedronGeometry(1.4);
    const foliage = new THREE.Mesh(folGeo, this.treeFoliageMat);
    foliage.position.y = 3.2;
    foliage.castShadow = true;
    tree.add(foliage);
    return tree;
  }

  // ---------------------------------------------------------------------------
  // Build Chunk with Real GLB Buildings Lining Both Sides
  // ---------------------------------------------------------------------------
  createChunkMesh(zOffset) {
    const group = new THREE.Group();
    group.position.z = zOffset;

    const roadWidth = 8.6;
    const roadThickness = 0.5;
    const sidewalkWidth = 4.5;
    const buildingBaseX = roadWidth / 2 + sidewalkWidth + 5.0; // Distance to buildings

    // 1. Road Platform
    const roadGeo = new THREE.BoxGeometry(roadWidth, roadThickness, CHUNK_LENGTH);
    const road = new THREE.Mesh(roadGeo, this.roadMat);
    road.position.y = -roadThickness / 2;
    road.receiveShadow = true;
    group.add(road);

    // 2. Glowing Butter Curbs
    const curbGeo = new THREE.BoxGeometry(0.45, 0.35, CHUNK_LENGTH);
    const curbL = new THREE.Mesh(curbGeo, this.curbMat);
    curbL.position.set(-roadWidth / 2 - 0.22, 0.1, 0);
    group.add(curbL);

    const curbR = new THREE.Mesh(curbGeo, this.curbMat);
    curbR.position.set(roadWidth / 2 + 0.22, 0.1, 0);
    group.add(curbR);

    // 3. Lane dashed marks
    const dividers = [-1.3, 1.3];
    const numDashes = 6;
    const dashLen = 2.4;
    const spacing = CHUNK_LENGTH / numDashes;

    dividers.forEach((x) => {
      for (let d = 0; d < numDashes; d++) {
        const dashGeo = new THREE.BoxGeometry(0.12, 0.02, dashLen);
        const dash = new THREE.Mesh(dashGeo, this.dashMat);
        dash.position.set(x, 0.01, -CHUNK_LENGTH / 2 + d * spacing + dashLen / 2);
        group.add(dash);
      }
    });

    // 4. Sidewalks
    const swGeo = new THREE.BoxGeometry(sidewalkWidth, 0.25, CHUNK_LENGTH);

    const swL = new THREE.Mesh(swGeo, this.sidewalkMat);
    swL.position.set(-roadWidth / 2 - sidewalkWidth / 2 - 0.45, 0.08, 0);
    swL.receiveShadow = true;
    group.add(swL);

    const swR = new THREE.Mesh(swGeo, this.sidewalkMat);
    swR.position.set(roadWidth / 2 + sidewalkWidth / 2 + 0.45, 0.08, 0);
    swR.receiveShadow = true;
    group.add(swR);

    // 5. Lamps & Trees
    const lampL = this.buildStreetLamp();
    lampL.position.set(-roadWidth / 2 - 0.9, 0.2, -CHUNK_LENGTH * 0.25);
    group.add(lampL);

    const lampR = this.buildStreetLamp();
    lampR.position.set(roadWidth / 2 + 0.9, 0.2, CHUNK_LENGTH * 0.25);
    group.add(lampR);

    const treeL = this.buildStreetTree();
    treeL.position.set(-roadWidth / 2 - 1.2, 0.2, CHUNK_LENGTH * 0.25);
    group.add(treeL);

    const treeR = this.buildStreetTree();
    treeR.position.set(roadWidth / 2 + 1.2, 0.2, -CHUNK_LENGTH * 0.25);
    group.add(treeR);

    // 6. REAL 3D BUILDINGS on BOTH SIDES (2 per side per chunk)
    const buildingSlots = [];
    const slotSpacing = CHUNK_LENGTH / 2;

    // Left Side Buildings
    for (let b = 0; b < 2; b++) {
      const bZ = -CHUNK_LENGTH / 2 + (b + 0.5) * slotSpacing;
      const slot = this.createBuildingSlot('left');
      slot.container.position.set(-buildingBaseX, 0, bZ);
      group.add(slot.container);
      buildingSlots.push(slot);
    }

    // Right Side Buildings
    for (let b = 0; b < 2; b++) {
      const bZ = -CHUNK_LENGTH / 2 + (b + 0.5) * slotSpacing;
      const slot = this.createBuildingSlot('right');
      slot.container.position.set(buildingBaseX, 0, bZ);
      group.add(slot.container);
      buildingSlots.push(slot);
    }

    this.scene.add(group);
    return { mesh: group, buildingSlots };
  }

  buildInitialTrack() {
    this.nextChunkZ = 0;
    for (let i = 0; i < NUM_CHUNKS; i++) {
      const z = -i * CHUNK_LENGTH;
      const { mesh, buildingSlots } = this.createChunkMesh(z);
      this.chunks.push({ mesh, buildingSlots, z });

      if (i >= 2) {
        this.populateChunk(z, 0);
      }
    }
  }

  getZoneForDistance(dist) {
    for (let i = ZONES.length - 1; i >= 0; i--) {
      if (dist >= ZONES[i].startDist) {
        return { zone: ZONES[i], index: i };
      }
    }
    return { zone: ZONES[0], index: 0 };
  }

  populateChunk(chunkCenterZ, currentDistance) {
    const { zone } = this.getZoneForDistance(currentDistance);
    const z1 = chunkCenterZ + CHUNK_LENGTH * 0.25;
    const z2 = chunkCenterZ - CHUNK_LENGTH * 0.25;

    const powerupRoll = Math.random();
    if (powerupRoll < 0.22) {
      const pLane = Math.floor(Math.random() * 3);
      if (powerupRoll < 0.035) {
        this.collectables.spawnHeart(pLane, z1);
      } else if (powerupRoll < 0.07) {
        this.collectables.spawnShield(pLane, z1);
      } else if (powerupRoll < 0.105) {
        this.collectables.spawnMagnet(pLane, z1);
      } else if (powerupRoll < 0.14) {
        this.collectables.spawnTreasureChest(pLane, z1);
      } else if (powerupRoll < 0.18) {
        this.collectables.spawnGoldenStatue(pLane, z1);
      } else {
        this.collectables.spawnMascotFigurine(pLane, z1);
      }
    }

    if (zone.id === 1) {
      const rand = Math.random();
      if (rand < 0.5) {
        const lane = Math.floor(Math.random() * 3);
        this.obstacles.spawnObstacle(lane, z1, OBSTACLE_TYPES.LOW_JUMP);
        this.collectables.spawnCroissantArch(lane, z1 + 3.0, 5);
      } else {
        const lane = Math.floor(Math.random() * 3);
        this.obstacles.spawnObstacle(lane, z1, OBSTACLE_TYPES.HIGH_SLIDE);
        this.collectables.spawnCroissant(lane, z1 - 2.5);
      }
    } else if (zone.id === 2) {
      const rand = Math.random();
      if (rand < 0.4) {
        const lane = Math.floor(Math.random() * 3);
        this.obstacles.spawnObstacle(lane, z1 + 2, OBSTACLE_TYPES.LOW_JUMP);
        this.obstacles.spawnObstacle(lane, z1 - 6, OBSTACLE_TYPES.HIGH_SLIDE);
        this.collectables.spawnCroissant(lane, z1 + 2);
      } else if (rand < 0.7) {
        const free = Math.floor(Math.random() * 3);
        const block = (free + 1) % 3;
        const jump = (free + 2) % 3;
        this.obstacles.spawnObstacle(block, z1, OBSTACLE_TYPES.FULL_BLOCK);
        this.obstacles.spawnObstacle(jump, z1, OBSTACLE_TYPES.LOW_JUMP);
        this.collectables.spawnCroissant(free, z1);
        this.collectables.spawnCroissant(free, z1 - 2.2);
      } else {
        const lane = Math.floor(Math.random() * 3);
        this.collectables.spawnTurboButter(lane, z1);
        this.collectables.spawnCroissantArch(lane, z1 - 4, 5);
      }
    } else {
      const rand = Math.random();
      if (rand < 0.4) {
        const freeLane1 = Math.floor(Math.random() * 3);
        const freeLane2 = (freeLane1 + 1) % 3;
        this.obstacles.spawnObstacle((freeLane1 + 1) % 3, z1, OBSTACLE_TYPES.FULL_BLOCK);
        this.obstacles.spawnObstacle((freeLane1 + 2) % 3, z1, OBSTACLE_TYPES.FULL_BLOCK);

        this.obstacles.spawnObstacle(freeLane1, z2, OBSTACLE_TYPES.LOW_JUMP);
        this.collectables.spawnCroissant(freeLane2, z2);
      } else {
        this.obstacles.spawnObstacle(0, z1, OBSTACLE_TYPES.LOW_JUMP);
        this.obstacles.spawnObstacle(1, z1, OBSTACLE_TYPES.HIGH_SLIDE);
        this.obstacles.spawnObstacle(2, z1, OBSTACLE_TYPES.FULL_BLOCK);

        this.collectables.spawnCroissantArch(0, z1 + 2, 4);
      }
    }
  }

  update(playerZ, currentDistance) {
    const { zone, index } = this.getZoneForDistance(currentDistance);
    if (index !== this.currentZoneIndex) {
      this.currentZoneIndex = index;
      if (this.onZoneChange) {
        this.onZoneChange(zone);
      }
    }

    for (const chunk of this.chunks) {
      if (chunk.z > playerZ + CHUNK_LENGTH) {
        let minZ = 0;
        for (const c of this.chunks) {
          if (c.z < minZ) minZ = c.z;
        }

        const newZ = minZ - CHUNK_LENGTH;
        chunk.z = newZ;
        chunk.mesh.position.z = newZ;

        // Re-randomize buildings on the recycled chunk for non-stop street diversity
        if (chunk.buildingSlots && this.loadedBuildingList.length > 0) {
          const usedPicks = new Set();
          chunk.buildingSlots.forEach((slot) => {
            let pick = Math.floor(Math.random() * this.loadedBuildingList.length);
            for (let retry = 0; retry < 6 && usedPicks.has(pick) && this.loadedBuildingList.length > 3; retry++) {
              pick = Math.floor(Math.random() * this.loadedBuildingList.length);
            }
            usedPicks.add(pick);
            this.assignSlotBuilding(slot, pick);
          });
        }

        this.populateChunk(newZ, currentDistance);
      }
    }
  }

  reset() {
    this.currentZoneIndex = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      const z = -i * CHUNK_LENGTH;
      this.chunks[i].z = z;
      this.chunks[i].mesh.position.z = z;
      if (i >= 2) {
        this.populateChunk(z, 0);
      }
    }
  }
}
