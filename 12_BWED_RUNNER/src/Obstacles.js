/* ==========================================================================
   BWED BUTTER ESCAPE — OBSTACLES SYSTEM (V3 REAL 3D ASSETS)
   Integrates real 3D GLB assets from the workspace:
   - prop-stacked-bread-cubes.glb (Full Block Hazard)
   - bwed-dice.glb (Bonus obstacle / dice hazard)
   - Sculpted Golden Butter Blocks (Low Jump)
   - Jam-dripping Slicing Spatula Arches (High Slide)
   ========================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LANES } from './Player.js';

export const OBSTACLE_TYPES = {
  LOW_JUMP: 'LOW_JUMP',
  HIGH_SLIDE: 'HIGH_SLIDE',
  FULL_BLOCK: 'FULL_BLOCK',
};

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.activeObstacles = [];
    this.gltfLoader = new GLTFLoader();

    // Cache for loaded 3D models
    this.breadCubesModel = null;
    this.diceModel = null;

    this.initMaterials();
    this.preload3DAssets();
  }

  initMaterials() {
    this.butterMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      roughness: 0.3,
      metalness: 0.1,
    });

    this.crustMat = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.85,
    });

    this.jamMat = new THREE.MeshStandardMaterial({
      color: 0xba1331,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9,
    });

    this.warningMat = new THREE.MeshStandardMaterial({
      color: 0xff4757,
      emissive: 0x551111,
      roughness: 0.4,
    });
  }

  // ---------------------------------------------------------------------------
  // Pre-load Real 3D Assets (Asynchronous with instant clone)
  // ---------------------------------------------------------------------------
  preload3DAssets() {
    const loadAndNormalize = (path, targetH, onLoaded) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const scale = targetH / (size.y || 1);
          model.scale.setScalar(scale);

          model.position.x = -center.x * scale;
          model.position.y = -box.min.y * scale;
          model.position.z = -center.z * scale;

          const root = new THREE.Group();
          root.add(model);
          onLoaded(root);
        },
        undefined,
        (e) => console.warn(`Asset ${path} not loaded, procedural fallback active:`, e)
      );
    };

    // 1. Stacked Bread Cubes
    loadAndNormalize('./assets/buildings/prop-stacked-bread-cubes.glb', 2.0, (m) => {
      this.breadCubesModel = m;
    });

    // 2. Bwed Dice
    loadAndNormalize('./assets/buildings/bwed-dice.glb', 1.4, (m) => {
      this.diceModel = m;
    });

    // 3. Toaster Bot
    loadAndNormalize('./assets/buildings/npc-shopkeeper-toaster-bot.glb', 2.1, (m) => {
      this.toasterBotModel = m;
    });

    // 4. Snack Cart
    loadAndNormalize('./assets/buildings/prop-snack-cart.glb', 1.9, (m) => {
      this.snackCartModel = m;
    });

    // 5. Croissant Ram (Low hurdle)
    loadAndNormalize('./assets/buildings/creature-croissant-ram.glb', 1.1, (m) => {
      this.croissantRamModel = m;
    });
  }

  // ---------------------------------------------------------------------------
  // Build LOW_JUMP (Butter Bar Hurdle or 3D Croissant Ram)
  // ---------------------------------------------------------------------------
  buildLowJumpMesh() {
    if (this.croissantRamModel && Math.random() < 0.6) {
      const clone = this.croissantRamModel.clone(true);
      clone.rotation.y = Math.PI; // Face runner
      clone.userData = {
        type: OBSTACLE_TYPES.LOW_JUMP,
        minY: 0,
        maxY: 0.9,
      };
      return clone;
    }

    const group = new THREE.Group();

    // Butter bar
    const slabGeo = new THREE.BoxGeometry(1.8, 0.65, 0.8);
    const slab = new THREE.Mesh(slabGeo, this.butterMat);
    slab.position.y = 0.32;
    slab.castShadow = true;
    group.add(slab);

    // Warning strip
    const stripGeo = new THREE.BoxGeometry(1.85, 0.12, 0.82);
    const strip = new THREE.Mesh(stripGeo, this.warningMat);
    strip.position.y = 0.32;
    group.add(strip);

    // Wafer base
    const baseGeo = new THREE.BoxGeometry(2.0, 0.08, 1.0);
    const base = new THREE.Mesh(baseGeo, this.crustMat);
    base.position.y = 0.04;
    group.add(base);

    group.userData = {
      type: OBSTACLE_TYPES.LOW_JUMP,
      minY: 0,
      maxY: 0.75,
    };

    return group;
  }

  // ---------------------------------------------------------------------------
  // Build HIGH_SLIDE (Hanging Jam Spatula Arch)
  // ---------------------------------------------------------------------------
  buildHighSlideMesh() {
    const group = new THREE.Group();

    const postGeo = new THREE.CylinderGeometry(0.12, 0.14, 2.8, 12);
    const postL = new THREE.Mesh(postGeo, this.crustMat);
    postL.position.set(-1.1, 1.4, 0);
    postL.castShadow = true;
    group.add(postL);

    const postR = new THREE.Mesh(postGeo, this.crustMat);
    postR.position.set(1.1, 1.4, 0);
    postR.castShadow = true;
    group.add(postR);

    // Hanging spatula beam at height 1.1m to 2.2m (clearance underneath is 1.05m)
    const beamGeo = new THREE.BoxGeometry(2.3, 0.85, 0.3);
    const beam = new THREE.Mesh(beamGeo, this.warningMat);
    beam.position.y = 1.6;
    beam.castShadow = true;
    group.add(beam);

    // Dripping jam drops
    for (let j = 0; j < 3; j++) {
      const dropGeo = new THREE.ConeGeometry(0.1, 0.35, 8);
      dropGeo.rotateX(Math.PI);
      const drop = new THREE.Mesh(dropGeo, this.jamMat);
      drop.position.set(-0.6 + j * 0.6, 1.05, 0);
      group.add(drop);
    }

    group.userData = {
      type: OBSTACLE_TYPES.HIGH_SLIDE,
      minY: 1.0,
      maxY: 2.3,
    };

    return group;
  }

  // ---------------------------------------------------------------------------
  // Build FULL_BLOCK (Using real 3D assets: Bread Cubes, Toaster Bot, Snack Cart, Dice)
  // ---------------------------------------------------------------------------
  buildFullBlockMesh() {
    const modelsPool = [];
    if (this.breadCubesModel) modelsPool.push(this.breadCubesModel);
    if (this.toasterBotModel) modelsPool.push(this.toasterBotModel);
    if (this.snackCartModel) modelsPool.push(this.snackCartModel);
    if (this.diceModel) modelsPool.push(this.diceModel);

    if (modelsPool.length > 0 && Math.random() < 0.85) {
      const picked = modelsPool[Math.floor(Math.random() * modelsPool.length)];
      const clone = picked.clone(true);
      clone.rotation.y = (Math.random() - 0.5) * 0.4;
      clone.userData = {
        type: OBSTACLE_TYPES.FULL_BLOCK,
        minY: 0,
        maxY: 2.2,
      };
      return clone;
    }

    // Procedural Fallback: Giant Strawberry Jam Jar
    const group = new THREE.Group();

    const jarGeo = new THREE.CylinderGeometry(0.85, 0.85, 1.9, 16);
    const jar = new THREE.Mesh(jarGeo, this.jamMat);
    jar.position.y = 0.95;
    jar.castShadow = true;
    group.add(jar);

    const lidGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.25, 16);
    const lid = new THREE.Mesh(lidGeo, this.butterMat);
    lid.position.y = 1.95;
    lid.castShadow = true;
    group.add(lid);

    group.userData = {
      type: OBSTACLE_TYPES.FULL_BLOCK,
      minY: 0,
      maxY: 2.2,
    };

    return group;
  }

  // ---------------------------------------------------------------------------
  // Spawning
  // ---------------------------------------------------------------------------
  spawnObstacle(laneIndex, zPos, forcedType = null) {
    let type = forcedType;
    if (!type) {
      const rand = Math.random();
      if (rand < 0.4) type = OBSTACLE_TYPES.LOW_JUMP;
      else if (rand < 0.75) type = OBSTACLE_TYPES.HIGH_SLIDE;
      else type = OBSTACLE_TYPES.FULL_BLOCK;
    }

    let mesh;
    if (type === OBSTACLE_TYPES.LOW_JUMP) mesh = this.buildLowJumpMesh();
    else if (type === OBSTACLE_TYPES.HIGH_SLIDE) mesh = this.buildHighSlideMesh();
    else mesh = this.buildFullBlockMesh();

    mesh.position.set(LANES[laneIndex], 0, zPos);
    this.scene.add(mesh);

    const obstacleObj = {
      mesh,
      type,
      laneIndex,
      z: zPos,
      box: new THREE.Box3(),
      hit: false,
    };

    this.activeObstacles.push(obstacleObj);
    return obstacleObj;
  }

  // ---------------------------------------------------------------------------
  // Collision Detection with Player (Forgiving thresholds)
  // ---------------------------------------------------------------------------
  checkCollision(player, isInvincible = false) {
    const playerBox = player.getBoundingBox();
    const playerPosZ = player.group.position.z;
    const playerY = player.jumpY;
    const isSliding = player.isSliding;

    for (const obs of this.activeObstacles) {
      if (obs.hit) continue;

      const zDist = Math.abs(obs.z - playerPosZ);
      if (zDist > 1.8) continue;

      obs.box.setFromObject(obs.mesh);

      if (playerBox.intersectsBox(obs.box)) {
        if (obs.type === OBSTACLE_TYPES.LOW_JUMP) {
          // Clear if jumped high enough
          if (playerY > 0.65) {
            continue;
          }
        } else if (obs.type === OBSTACLE_TYPES.HIGH_SLIDE) {
          // Clear if sliding under
          if (isSliding && playerY < 0.25) {
            continue;
          }
        }

        obs.hit = true;

        if (isInvincible) {
          this.smashObstacle(obs);
          return { hit: false, smashed: true };
        }

        return { hit: true, obstacle: obs };
      }
    }

    return { hit: false };
  }

  smashObstacle(obs) {
    obs.mesh.position.y += 2.5;
    obs.mesh.rotation.x += Math.PI * 0.5;
    obs.mesh.scale.setScalar(0.2);
    setTimeout(() => {
      this.scene.remove(obs.mesh);
    }, 350);
  }

  cleanupBehind(playerZ) {
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      if (obs.z > playerZ + 16) {
        this.scene.remove(obs.mesh);
        this.activeObstacles.splice(i, 1);
      }
    }
  }

  reset() {
    for (const obs of this.activeObstacles) {
      this.scene.remove(obs.mesh);
    }
    this.activeObstacles = [];
  }
}
