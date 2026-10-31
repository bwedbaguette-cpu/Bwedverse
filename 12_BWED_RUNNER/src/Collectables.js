/* ==========================================================================
   BWED BUTTER ESCAPE — COLLECTABLES & POWER-UPS (V2 PRO)
   1. Golden Croissants (Base currency & score)
   2. Golden Brioche Heart (Rare heal: +1 HP)
   3. Butter Shield (Absorbs 1 hazard hit or knife swipe)
   4. Croissant Magnet (Pulls all croissants across 3 lanes)
   5. Turbo Butter Cube (Hyperspeed invincibility)
   6. 3D Relic Figurines (Mystery Chest, Golden Croissant, Captain Bean)
   ========================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { LANES } from './Player.js';

export const ITEM_TYPES = {
  CROISSANT: 'CROISSANT',
  HEART: 'HEART',
  SHIELD: 'SHIELD',
  MAGNET: 'MAGNET',
  TURBO_BUTTER: 'TURBO_BUTTER',
  TREASURE_CHEST: 'TREASURE_CHEST',
  GOLDEN_STATUE: 'GOLDEN_STATUE',
  MASCOT_FIGURINE: 'MASCOT_FIGURINE',
  PASTRY_FEAST: 'PASTRY_FEAST',
};

export class CollectableManager {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;
    this.items = [];
    this.gltfLoader = new GLTFLoader();

    this.chestModel = null;
    this.goldenCroissantModel = null;
    this.mascotModel = null;
    this.pastryModel = null;

    this.initMaterials();
    this.initParticlePool();
    this.preload3DCollectables();
  }

  preload3DCollectables() {
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
        (e) => console.warn(`Collectable ${path} could not be loaded:`, e)
      );
    };

    loadAndNormalize('./assets/buildings/prop-treasure-chest.glb', 1.0, (m) => { this.chestModel = m; });
    loadAndNormalize('./assets/buildings/prop-golden-croissant.glb', 1.1, (m) => { this.goldenCroissantModel = m; });
    loadAndNormalize('./assets/buildings/mascot-captain-bean.glb', 1.25, (m) => { this.mascotModel = m; });
    loadAndNormalize('./assets/buildings/prop-pastry-dessert.glb', 0.95, (m) => { this.pastryModel = m; });
  }

  initMaterials() {
    this.croissantMat = new THREE.MeshStandardMaterial({
      color: 0xf39c12,
      emissive: 0xd35400,
      emissiveIntensity: 0.25,
      roughness: 0.25,
      metalness: 0.35,
    });

    this.turboMat = new THREE.MeshStandardMaterial({
      color: 0xfff200,
      emissive: 0xffaa00,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.1,
    });

    this.heartMat = new THREE.MeshStandardMaterial({
      color: 0xff4757,
      emissive: 0xee5253,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.1,
    });

    this.shieldMat = new THREE.MeshStandardMaterial({
      color: 0x48dbfb,
      emissive: 0x0abde3,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.2,
    });

    this.magnetMat = new THREE.MeshStandardMaterial({
      color: 0xff9f43,
      emissive: 0xee5253,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.5,
    });
  }

  // ---------------------------------------------------------------------------
  // 3D Meshes for Each Powerup
  // ---------------------------------------------------------------------------
  buildCroissantMesh() {
    const group = new THREE.Group();
    const torusGeo = new THREE.TorusGeometry(0.35, 0.15, 12, 24, Math.PI * 1.1);
    const torus = new THREE.Mesh(torusGeo, this.croissantMat);
    torus.rotation.x = Math.PI * 0.5;
    torus.castShadow = true;
    group.add(torus);

    const ringGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 16, Math.PI * 1.1);
    const ring = new THREE.Mesh(ringGeo, this.croissantMat);
    ring.rotation.x = Math.PI * 0.5;
    ring.rotation.y = 0.2;
    group.add(ring);

    group.scale.setScalar(1.05);
    return group;
  }

  buildHeartMesh() {
    const group = new THREE.Group();

    // 3D Heart shape
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.3);
    heartShape.bezierCurveTo(0, 0.6, -0.4, 0.85, -0.7, 0.85);
    heartShape.bezierCurveTo(-1.1, 0.85, -1.3, 0.45, -1.3, 0.1);
    heartShape.bezierCurveTo(-1.3, -0.35, -0.7, -0.85, 0, -1.3);
    heartShape.bezierCurveTo(0.7, -0.85, 1.3, -0.35, 1.3, 0.1);
    heartShape.bezierCurveTo(1.3, 0.45, 1.1, 0.85, 0.7, 0.85);
    heartShape.bezierCurveTo(0.4, 0.85, 0, 0.6, 0, 0.3);

    const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
    const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    heartGeo.center();
    const heartMesh = new THREE.Mesh(heartGeo, this.heartMat);
    heartMesh.scale.set(0.45, 0.45, 0.45);
    group.add(heartMesh);

    return group;
  }

  buildShieldMesh() {
    const group = new THREE.Group();
    const sphereGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const sphere = new THREE.Mesh(sphereGeo, this.shieldMat);
    group.add(sphere);

    const ringGeo = new THREE.TorusGeometry(0.65, 0.05, 8, 24);
    const ring = new THREE.Mesh(ringGeo, this.shieldMat);
    ring.rotation.x = Math.PI * 0.4;
    group.add(ring);

    return group;
  }

  buildMagnetMesh() {
    const group = new THREE.Group();
    // Horseshoe U-shape
    const curve = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 16, 1, false, 0, Math.PI);
    const curveMesh = new THREE.Mesh(curve, this.magnetMat);
    curveMesh.rotation.z = Math.PI;
    group.add(curveMesh);

    return group;
  }

  buildTurboMesh() {
    const group = new THREE.Group();
    const cubeGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
    const cube = new THREE.Mesh(cubeGeo, this.turboMat);
    group.add(cube);

    const octaGeo = new THREE.OctahedronGeometry(0.75);
    const octaMat = new THREE.MeshBasicMaterial({ color: 0xfff9e6, wireframe: true });
    const octa = new THREE.Mesh(octaGeo, octaMat);
    group.add(octa);

    return group;
  }

  // ---------------------------------------------------------------------------
  // Particles
  // ---------------------------------------------------------------------------
  initParticlePool() {
    this.sparks = [];
    const sparkGeo = new THREE.DodecahedronGeometry(0.08);
    for (let i = 0; i < 30; i++) {
      const spark = new THREE.Mesh(sparkGeo, this.turboMat);
      spark.visible = false;
      this.scene.add(spark);
      this.sparks.push({
        mesh: spark,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.5,
      });
    }
  }

  triggerPickupSparks(pos) {
    for (let i = 0; i < 6; i++) {
      const spark = this.sparks.find((s) => !s.mesh.visible);
      if (!spark) break;
      spark.mesh.position.copy(pos);
      spark.mesh.visible = true;
      spark.vel.set(
        (Math.random() - 0.5) * 5,
        Math.random() * 4 + 2,
        (Math.random() - 0.5) * 5
      );
      spark.life = 0;
      spark.maxLife = 0.35 + Math.random() * 0.2;
    }
  }

  updateSparks(delta) {
    for (const s of this.sparks) {
      if (!s.mesh.visible) continue;
      s.life += delta;
      if (s.life >= s.maxLife) {
        s.mesh.visible = false;
        continue;
      }
      s.vel.y -= 12 * delta;
      s.mesh.position.addScaledVector(s.vel, delta);
      const scale = 1 - s.life / s.maxLife;
      s.mesh.scale.setScalar(scale);
    }
  }

  // ---------------------------------------------------------------------------
  // Spawners
  // ---------------------------------------------------------------------------
  spawnCroissant(laneIndex, zPos, height = 0.9) {
    const mesh = this.buildCroissantMesh();
    mesh.position.set(LANES[laneIndex], height, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.CROISSANT,
      baseY: height,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  spawnCroissantArch(laneIndex, startZ, count = 5) {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const arcHeight = 0.9 + Math.sin(t * Math.PI) * 1.5;
      this.spawnCroissant(laneIndex, startZ - i * 2.2, arcHeight);
    }
  }

  spawnHeart(laneIndex, zPos) {
    const mesh = this.buildHeartMesh();
    mesh.position.set(LANES[laneIndex], 1.2, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.HEART,
      baseY: 1.2,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  spawnShield(laneIndex, zPos) {
    const mesh = this.buildShieldMesh();
    mesh.position.set(LANES[laneIndex], 1.2, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.SHIELD,
      baseY: 1.2,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  spawnMagnet(laneIndex, zPos) {
    const mesh = this.buildMagnetMesh();
    mesh.position.set(LANES[laneIndex], 1.2, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.MAGNET,
      baseY: 1.2,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  spawnTurboButter(laneIndex, zPos) {
    const mesh = this.buildTurboMesh();
    mesh.position.set(LANES[laneIndex], 1.2, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.TURBO_BUTTER,
      baseY: 1.2,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  // ---------------------------------------------------------------------------
  // Real 3D Collectables Spawners
  // ---------------------------------------------------------------------------
  spawnTreasureChest(laneIndex, zPos) {
    let mesh;
    if (this.chestModel) {
      mesh = this.chestModel.clone(true);
    } else {
      mesh = this.buildShieldMesh();
    }
    mesh.position.set(LANES[laneIndex], 0.8, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.TREASURE_CHEST,
      baseY: 0.8,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  spawnGoldenStatue(laneIndex, zPos) {
    let mesh;
    if (this.goldenCroissantModel) {
      mesh = this.goldenCroissantModel.clone(true);
    } else {
      mesh = this.buildCroissantMesh();
      mesh.scale.setScalar(1.6);
    }
    mesh.position.set(LANES[laneIndex], 1.1, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.GOLDEN_STATUE,
      baseY: 1.1,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  spawnMascotFigurine(laneIndex, zPos) {
    let mesh;
    if (this.mascotModel) {
      mesh = this.mascotModel.clone(true);
    } else {
      mesh = this.buildTurboMesh();
    }
    mesh.position.set(LANES[laneIndex], 1.0, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.MASCOT_FIGURINE,
      baseY: 1.0,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  spawnPastryFeast(laneIndex, zPos) {
    let mesh;
    if (this.pastryModel) {
      mesh = this.pastryModel.clone(true);
    } else {
      mesh = this.buildHeartMesh();
    }
    mesh.position.set(LANES[laneIndex], 0.9, zPos);
    this.scene.add(mesh);

    this.items.push({
      mesh,
      type: ITEM_TYPES.PASTRY_FEAST,
      baseY: 0.9,
      z: zPos,
      laneIndex,
      collected: false,
    });
  }

  // ---------------------------------------------------------------------------
  // Update Loop & Collection
  // ---------------------------------------------------------------------------
  update(delta, player, isTurbo) {
    this.updateSparks(delta);

    const playerPos = player.group.position;
    const playerTargetY = player.jumpY + 0.8;
    const magnetActive = player.hasMagnet || isTurbo;

    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.collected) continue;

      item.mesh.rotation.y += delta * 2.5;
      item.mesh.position.y = item.baseY + Math.sin(Date.now() * 0.005 + item.z) * 0.12;

      // Magnetic attraction for croissants
      if (magnetActive && item.type === ITEM_TYPES.CROISSANT) {
        const distZ = Math.abs(item.z - playerPos.z);
        if (distZ < 15.0) {
          item.mesh.position.x = THREE.MathUtils.lerp(item.mesh.position.x, playerPos.x, delta * 12);
          item.mesh.position.y = THREE.MathUtils.lerp(item.mesh.position.y, playerTargetY, delta * 12);
          item.mesh.position.z = THREE.MathUtils.lerp(item.mesh.position.z, playerPos.z, delta * 12);
        }
      }

      // Check Collection
      const dx = item.mesh.position.x - playerPos.x;
      const dy = item.mesh.position.y - playerTargetY;
      const dz = item.mesh.position.z - playerPos.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 1.5 * 1.5) {
        item.collected = true;
        this.triggerPickupSparks(item.mesh.position);
        this.scene.remove(item.mesh);

        if (item.type === ITEM_TYPES.CROISSANT) {
          this.audio.playCroissantCollect();
          return { type: ITEM_TYPES.CROISSANT, points: 100 };
        } else if (item.type === ITEM_TYPES.HEART) {
          player.heal(1);
          return { type: ITEM_TYPES.HEART, points: 250 };
        } else if (item.type === ITEM_TYPES.SHIELD) {
          player.activateShield();
          return { type: ITEM_TYPES.SHIELD, points: 300 };
        } else if (item.type === ITEM_TYPES.MAGNET) {
          player.activateMagnet(10.0);
          return { type: ITEM_TYPES.MAGNET, points: 300 };
        } else if (item.type === ITEM_TYPES.TURBO_BUTTER) {
          this.audio.playTurbo();
          return { type: ITEM_TYPES.TURBO_BUTTER, points: 500 };
        } else if (item.type === ITEM_TYPES.TREASURE_CHEST) {
          this.audio.playTurbo();
          if (!player.hasShield) {
            player.activateShield();
          } else if (!player.hasMagnet) {
            player.activateMagnet(12.0);
          } else {
            player.heal(1);
          }
          return { type: ITEM_TYPES.TREASURE_CHEST, points: 600, extraCroissants: 10 };
        } else if (item.type === ITEM_TYPES.GOLDEN_STATUE) {
          this.audio.playCroissantCollect();
          return { type: ITEM_TYPES.GOLDEN_STATUE, points: 800, extraCroissants: 20 };
        } else if (item.type === ITEM_TYPES.MASCOT_FIGURINE) {
          this.audio.playTurbo();
          return { type: ITEM_TYPES.MASCOT_FIGURINE, points: 500, turboBonus: 50 };
        } else if (item.type === ITEM_TYPES.PASTRY_FEAST) {
          this.audio.playCroissantCollect();
          return { type: ITEM_TYPES.PASTRY_FEAST, points: 350, extraCroissants: 8 };
        }
      }

      if (item.z > playerPos.z + 16) {
        this.scene.remove(item.mesh);
        this.items.splice(i, 1);
      }
    }

    return null;
  }

  reset() {
    for (const item of this.items) {
      this.scene.remove(item.mesh);
    }
    this.items = [];
  }
}
