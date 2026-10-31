// ============================================================================
// MONOPOLY 3D — MULTI-PAWN MANAGER (Three.js)
// Supports all 18 characters, multi-player tile offsets, and smooth hop curves
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class PawnManager {
  constructor(scene, board) {
    this.scene = scene;
    this.board = board;
    this.pawns = new Map(); // playerId -> PawnInstance
    this.loader = new GLTFLoader();
  }

  createPawn(playerInfo, playerIndex = 0) {
    if (this.pawns.has(playerInfo.id)) {
      this.removePawn(playerInfo.id);
    }

    const pawn = new PawnInstance(this.scene, this.board, this.loader, playerInfo, playerIndex);
    this.pawns.set(playerInfo.id, pawn);
    return pawn;
  }

  getPawn(playerId) {
    return this.pawns.get(playerId);
  }

  removePawn(playerId) {
    const pawn = this.pawns.get(playerId);
    if (pawn) {
      pawn.destroy();
      this.pawns.delete(playerId);
    }
  }

  clearAll() {
    this.pawns.forEach(p => p.destroy());
    this.pawns.clear();
  }

  // Update tile offsets so pawns sharing a tile do not overlap
  updateTileOffsets() {
    const tileGroups = new Map();
    this.pawns.forEach(pawn => {
      const tile = pawn.currentTile;
      if (!tileGroups.has(tile)) tileGroups.set(tile, []);
      tileGroups.get(tile).push(pawn);
    });

    const offsets4 = [
      { x: -0.28, z: -0.28 },
      { x: 0.28, z: -0.28 },
      { x: -0.28, z: 0.28 },
      { x: 0.28, z: 0.28 }
    ];

    tileGroups.forEach(group => {
      if (group.length === 1) {
        group[0].setOffset(0, 0);
      } else {
        group.forEach((pawn, idx) => {
          const off = offsets4[idx % 4];
          pawn.setOffset(off.x, off.z);
        });
      }
    });
  }
}

class PawnInstance {
  constructor(scene, board, loader, playerInfo, playerIndex) {
    this.scene = scene;
    this.board = board;
    this.loader = loader;
    this.playerInfo = playerInfo;
    this.playerIndex = playerIndex;

    this.currentTile = playerInfo.position || 0;
    this.offsetX = 0;
    this.offsetZ = 0;
    this.isMoving = false;

    this.group = new THREE.Group();
    this.group.name = `Pawn_${playerInfo.id}`;

    this.meshContainer = new THREE.Group();
    this.group.add(this.meshContainer);

    this.init();
    this.scene.add(this.group);
  }

  init() {
    this.createBasePedestal();
    this.createProceduralToast();
    if (this.playerInfo.model) {
      this.loadGLBModel(this.playerInfo.model);
    }
    this.updatePositionImmediate();
  }

  createBasePedestal() {
    if (this.pedestal) this.group.remove(this.pedestal);

    this.pedestal = new THREE.Group();

    // Base color disc
    const baseGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.08, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: this.playerInfo.color || 0xf5a623,
      roughness: 0.3,
      metalness: 0.5
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.04;
    base.receiveShadow = true;
    this.pedestal.add(base);

    // Golden trim ring
    const ringGeo = new THREE.TorusGeometry(0.4, 0.025, 8, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.2 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.06;
    this.pedestal.add(ring);

    this.group.add(this.pedestal);
  }

  createProceduralToast() {
    while (this.meshContainer.children.length > 0) {
      this.meshContainer.remove(this.meshContainer.children[0]);
    }

    const toast = new THREE.Group();

    const crumbGeo = new THREE.BoxGeometry(0.48, 0.58, 0.16);
    const crumbMat = new THREE.MeshStandardMaterial({ color: 0xfff0c2, roughness: 0.85 });
    const crumb = new THREE.Mesh(crumbGeo, crumbMat);
    crumb.position.y = 0.36;
    crumb.castShadow = true;
    toast.add(crumb);

    const crustGeo = new THREE.BoxGeometry(0.54, 0.64, 0.14);
    const crustMat = new THREE.MeshStandardMaterial({ color: 0x964b00, roughness: 0.7 });
    const crust = new THREE.Mesh(crustGeo, crustMat);
    crust.position.y = 0.36;
    crust.castShadow = true;
    toast.add(crust);

    this.meshContainer.add(toast);
  }

  loadGLBModel(path) {
    this.loader.load(
      path,
      (gltf) => {
        while (this.meshContainer.children.length > 0) {
          this.meshContainer.remove(this.meshContainer.children[0]);
        }

        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        let targetH = 1.1;
        if (this.playerInfo.characterId === 'cozy-shiba' || this.playerInfo.pawnId === 'cozy-shiba' || (this.playerInfo.model && this.playerInfo.model.includes('shiba'))) {
          targetH = 0.82;
        }

        const scale = targetH / Math.max(size.y, 0.001);

        model.scale.setScalar(scale);
        model.position.set(
          -center.x * scale,
          -box.min.y * scale + 0.07,
          -center.z * scale
        );

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.meshContainer.add(model);

        // Si le joueur incarne Capitaine Pirate Bwed, équiper le tricorne et cache-œil emblématiques
        const isPirate = this.playerInfo.characterId === 'captain-bean' ||
          this.playerInfo.pawnId === 'captain-bean' ||
          (this.playerInfo.model && this.playerInfo.model.includes('captain-bean'));

        if (isPirate) {
          const pirateGear = this.createPirateAccessories();
          this.meshContainer.add(pirateGear);
        }
      },
      undefined,
      () => {}
    );
  }

  createPirateAccessories() {
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

    // 1. Chapeau Tricorne de Flibustier
    const hatGroup = new THREE.Group();
    hatGroup.position.set(0, 1.18, -0.02);

    const hatCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.42, 0.26, 16),
      leatherMat
    );
    hatCrown.position.y = 0.13;
    hatGroup.add(hatCrown);

    const brimGeo = new THREE.CylinderGeometry(0.70, 0.58, 0.10, 3, 1, false);
    const brim = new THREE.Mesh(brimGeo, leatherMat);
    brim.rotation.y = Math.PI / 6;
    brim.position.y = 0.06;
    hatGroup.add(brim);

    const brimTrimGeo = new THREE.TorusGeometry(0.62, 0.028, 6, 24);
    const brimTrim = new THREE.Mesh(brimTrimGeo, goldTrimMat);
    brimTrim.rotation.x = Math.PI / 2;
    brimTrim.position.y = 0.10;
    hatGroup.add(brimTrim);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), goldTrimMat);
    skull.position.set(0, 0.15, 0.38);
    hatGroup.add(skull);

    const bone1 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 8), goldTrimMat);
    bone1.rotation.z = Math.PI / 4;
    bone1.position.set(0, 0.11, 0.37);
    hatGroup.add(bone1);

    const bone2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.22, 8), goldTrimMat);
    bone2.rotation.z = -Math.PI / 4;
    bone2.position.set(0, 0.11, 0.37);
    hatGroup.add(bone2);

    const ribbon1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.02), ribbonMat);
    ribbon1.position.set(-0.35, -0.05, -0.16);
    ribbon1.rotation.z = 0.32;
    hatGroup.add(ribbon1);

    pirateGroup.add(hatGroup);

    // 2. Cache-œil noir & lanière
    const patchGroup = new THREE.Group();
    const eyepatch = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.82 })
    );
    eyepatch.scale.set(1.0, 1.0, 0.35);
    eyepatch.position.set(0.18, 0.94, 0.33);
    patchGroup.add(eyepatch);

    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.39, 0.016, 6, 24),
      new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 })
    );
    strap.rotation.x = Math.PI / 2.2;
    strap.rotation.z = -0.14;
    strap.position.set(0.06, 0.95, 0.06);
    patchGroup.add(strap);

    pirateGroup.add(patchGroup);

    // 3. Crochet doré
    const hookGroup = new THREE.Group();
    hookGroup.position.set(-0.52, 0.48, 0.10);
    const hookBase = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.12, 12), goldTrimMat);
    hookGroup.add(hookBase);
    const hookCurve = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.022, 8, 16, Math.PI * 1.3), goldTrimMat);
    hookCurve.position.set(0, -0.09, 0);
    hookCurve.rotation.z = Math.PI / 2;
    hookGroup.add(hookCurve);

    pirateGroup.add(hookGroup);

    return pirateGroup;
  }

  setOffset(ox, oz) {
    this.offsetX = ox;
    this.offsetZ = oz;
    if (!this.isMoving) {
      const pos = this.board.getTileWorldPosition(this.currentTile);
      this.group.position.set(pos.x + this.offsetX, pos.y, pos.z + this.offsetZ);
    }
  }

  updatePositionImmediate() {
    const pos = this.board.getTileWorldPosition(this.currentTile);
    this.group.position.set(pos.x + this.offsetX, pos.y, pos.z + this.offsetZ);
  }

  async moveToTile(targetTileIndex, onStep = null) {
    if (this.isMoving) return;
    this.isMoving = true;

    const start = this.currentTile;
    const totalTiles = 40;
    let steps = (targetTileIndex - start + totalTiles) % totalTiles;
    if (steps === 0) steps = totalTiles;

    for (let s = 1; s <= steps; s++) {
      const fromTile = (start + s - 1) % totalTiles;
      const toTile = (start + s) % totalTiles;
      await this.hopBetweenTiles(fromTile, toTile);
      this.currentTile = toTile;
      if (onStep) onStep(toTile, s === steps);
    }

    this.isMoving = false;
    this.updatePositionImmediate();
  }

  hopBetweenTiles(fromIndex, toIndex, duration = 185) {
    return new Promise((resolve) => {
      const pStart = this.board.getTileWorldPosition(fromIndex);
      const pEnd = this.board.getTileWorldPosition(toIndex);

      const startTime = performance.now();
      const jumpHeight = 0.8;

      const animate = (time) => {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);

        this.group.position.x = THREE.MathUtils.lerp(pStart.x + this.offsetX, pEnd.x + this.offsetX, t);
        this.group.position.z = THREE.MathUtils.lerp(pStart.z + this.offsetZ, pEnd.z + this.offsetZ, t);

        const arc = Math.sin(t * Math.PI) * jumpHeight;
        this.group.position.y = pStart.y + arc;

        const stretch = 1 + Math.sin(t * Math.PI) * 0.2;
        const squash = 1 - Math.sin(t * Math.PI) * 0.12;
        this.meshContainer.scale.set(squash, stretch, squash);

        const targetAngle = Math.atan2(pEnd.x - pStart.x, pEnd.z - pStart.z);
        this.meshContainer.rotation.y = THREE.MathUtils.lerp(this.meshContainer.rotation.y, targetAngle, 0.25);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          this.group.position.set(pEnd.x + this.offsetX, pEnd.y, pEnd.z + this.offsetZ);
          this.meshContainer.scale.set(1, 1, 1);
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  destroy() {
    this.scene.remove(this.group);
  }
}
