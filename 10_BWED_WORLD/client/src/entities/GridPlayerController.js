import * as THREE from 'three';
import { COLLISION, TILE_TYPES, gridToWorldPos } from '../world/BwedTownMapData.js';
import { AvatarModel } from './AvatarModel.js';

/* ==========================================================================
   CONTRÔLEUR DE DÉPLACEMENT SUR GRILLE — POKÉMON DS STYLE V2
   - Déplacement rigide case par case (Grid-based step-by-step)
   - Interpolation fluide et lissée entre deux cases
   - Pivot instantané cardinal (Nord, Sud, Est, Ouest)
   - Course rapide avec maintien de Shift / bouton B
   - Effet de rebond élastique (bump) contre les obstacles avec bruitage rétro
   - Bruitages de pas différenciés (herbe vs pavé)
   - Déclenchement automatique des triggers de portes et interactions PNJ
   ========================================================================== */

export class GridPlayerController {
  constructor(options = {}) {
    this.id = options.id || 'local_player';
    this.name = options.name || 'Dresseur Bwed';
    this.avatarId = options.avatarId || 'tiny-baker';
    this.scene = options.scene;
    this.mapData = options.mapData;
    this.audio = options.audio || null;

    // Callbacks d'événements
    this.onDoorTrigger = options.onDoorTrigger || null;
    this.onInteraction = options.onInteraction || null;
    this.onDistrictChange = options.onDistrictChange || null;
    this.onStepComplete = options.onStepComplete || null;

    // Coordonnées sur la grille
    this.gridX = options.startX ?? 15;
    this.gridZ = options.startZ ?? 19;
    this.facing = options.facing || 'north';

    // État du mouvement
    this.state = 'idle';
    this.isMoving = false;
    this.isRunning = false;

    // Timing des pas (Pokémon DS authentique)
    this.stepDuration = 0.22;
    this.runDuration = 0.13;
    this.stepProgress = 0.0;
    this.stepTimer = 0.0;

    // Positions d'interpolation 3D
    this.startWorldPos = new THREE.Vector3();
    this.targetWorldPos = new THREE.Vector3();
    this.currentWorldPos = new THREE.Vector3();
    this.targetGridX = this.gridX;
    this.targetGridZ = this.gridZ;

    // Rotation et modèle 3D
    this.rotationY = 0;
    this.avatar = new AvatarModel(this.avatarId);
    this.scene.add(this.avatar.rootGroup);

    // Particules de pas et poussière
    this.particlesGroup = new THREE.Group();
    this.scene.add(this.particlesGroup);
    this.dustPool = [];
    this.lastDustTime = 0;

    // Initialisation
    this.snapToGrid(this.gridX, this.gridZ);
    this.updateRotation();
  }

  changeAvatar(newAvatarId) {
    if (!newAvatarId || this.avatarId === newAvatarId) return;
    this.avatarId = newAvatarId;
    this.avatar.loadAvatar(newAvatarId);
  }

  snapToGrid(gx, gz) {
    this.gridX = gx;
    this.gridZ = gz;
    this.targetGridX = gx;
    this.targetGridZ = gz;
    const wpos = gridToWorldPos(gx, gz, 0);
    this.currentWorldPos.set(wpos.x, wpos.y, wpos.z);
    this.avatar.rootGroup.position.copy(this.currentWorldPos);
  }

  updateRotation() {
    switch (this.facing) {
      case 'south':
        this.rotationY = 0;
        break;
      case 'north':
        this.rotationY = Math.PI;
        break;
      case 'west':
        this.rotationY = -Math.PI / 2;
        break;
      case 'east':
        this.rotationY = Math.PI / 2;
        break;
    }
    this.avatar.rootGroup.rotation.y = this.rotationY;
  }

  getDirectionDelta(dir) {
    switch (dir) {
      case 'north': return { dx: 0, dz: -1 };
      case 'south': return { dx: 0, dz: 1 };
      case 'west':  return { dx: -1, dz: 0 };
      case 'east':  return { dx: 1, dz: 0 };
      default:      return { dx: 0, dz: 0 };
    }
  }

  tryStep(direction, isRunning = false) {
    if (this.state !== 'idle') return false;

    this.isRunning = isRunning;
    this.facing = direction;
    this.updateRotation();

    const { dx, dz } = this.getDirectionDelta(direction);
    const nextX = this.gridX + dx;
    const nextZ = this.gridZ + dz;

    // Vérifier les limites de la grille
    const { width, height } = this.mapData.config;
    if (nextX < 0 || nextX >= width || nextZ < 0 || nextZ >= height) {
      this.triggerBump(dx, dz);
      return false;
    }

    // Vérifier la couche de collision
    const collisionType = this.mapData.collision[nextZ][nextX];
    if (collisionType === COLLISION.BLOCKED || collisionType === COLLISION.INTERACTABLE) {
      this.triggerBump(dx, dz);
      return false;
    }

    // Case marchable ou trigger de porte -> Lancement du pas
    this.state = 'stepping';
    this.isMoving = true;
    this.targetGridX = nextX;
    this.targetGridZ = nextZ;

    const startPos = gridToWorldPos(this.gridX, this.gridZ, 0);
    const endPos = gridToWorldPos(nextX, nextZ, 0);

    this.startWorldPos.set(startPos.x, startPos.y, startPos.z);
    this.targetWorldPos.set(endPos.x, endPos.y, endPos.z);
    this.stepProgress = 0.0;
    this.stepDuration = this.isRunning ? this.runDuration : 0.22;

    // Son de pas rétro
    if (this.audio) {
      const tileType = this.mapData.tiles[nextZ][nextX];
      const isRoad = tileType === TILE_TYPES.COBBLE_BEURRE || tileType === TILE_TYPES.PLAZA_GOLD;
      this.audio.playStep(isRoad);
    }

    return true;
  }

  triggerBump(dx, dz) {
    this.state = 'bumping';
    this.isMoving = false;
    const startPos = gridToWorldPos(this.gridX, this.gridZ, 0);
    this.startWorldPos.set(startPos.x, startPos.y, startPos.z);

    const tileSize = this.mapData.config.tileSize;
    this.targetWorldPos.set(
      startPos.x + dx * (tileSize * 0.14),
      startPos.y,
      startPos.z + dz * (tileSize * 0.14)
    );
    this.stepProgress = 0.0;
    this.stepDuration = 0.11;

    // Bruitage de bump rétro
    if (this.audio) {
      this.audio.playBump();
    }
  }

  interactInFront() {
    if (this.state !== 'idle') return null;

    const { dx, dz } = this.getDirectionDelta(this.facing);
    const checkX = this.gridX + dx;
    const checkZ = this.gridZ + dz;

    const key = `${checkX},${checkZ}`;
    const target = this.mapData.interactionMap.get(key);

    if (target) {
      if (this.onInteraction) {
        this.onInteraction(target);
      }
      return target;
    }

    return null;
  }

  update(delta, inputKeys = {}) {
    if (this.state === 'stepping') {
      this.stepProgress += delta / this.stepDuration;

      if (this.stepProgress >= 1.0) {
        this.stepProgress = 1.0;
        this.gridX = this.targetGridX;
        this.gridZ = this.targetGridZ;
        this.currentWorldPos.copy(this.targetWorldPos);
        this.avatar.rootGroup.position.copy(this.currentWorldPos);
        this.state = 'idle';
        this.isMoving = false;

        if (this.isRunning) {
          this.emitDust();
        }

        if (this.onStepComplete) {
          this.onStepComplete(this.gridX, this.gridZ);
        }

        const collisionType = this.mapData.collision[this.gridZ][this.gridX];
        if (collisionType === COLLISION.TRIGGER_DOOR) {
          const doorInfo = this.mapData.interactionMap.get(`${this.gridX},${this.gridZ}`);
          if (doorInfo && this.onDoorTrigger) {
            this.onDoorTrigger(doorInfo);
          }
        }

        this.checkDistrict();
        this.processInput(inputKeys);
      } else {
        const t = this.stepProgress;
        this.currentWorldPos.lerpVectors(this.startWorldPos, this.targetWorldPos, t);
        this.avatar.rootGroup.position.copy(this.currentWorldPos);

        if (this.isRunning && Math.random() < 0.25) {
          this.emitDust();
        }
      }
    } else if (this.state === 'bumping') {
      this.stepProgress += delta / this.stepDuration;
      if (this.stepProgress >= 1.0) {
        this.currentWorldPos.copy(this.startWorldPos);
        this.avatar.rootGroup.position.copy(this.currentWorldPos);
        this.state = 'idle';
      } else {
        const bumpFactor = Math.sin(this.stepProgress * Math.PI);
        this.currentWorldPos.lerpVectors(this.startWorldPos, this.targetWorldPos, bumpFactor);
        this.avatar.rootGroup.position.copy(this.currentWorldPos);
      }
    } else {
      this.processInput(inputKeys);
    }

    const animState = this.state === 'stepping' ? (this.isRunning ? 'run' : 'walk') : 'idle';
    const animSpeed = this.state === 'stepping' ? (this.isRunning ? 7.0 : 4.4) : 0;
    this.avatar.updateAnimation(delta, animState, animSpeed);
    this.updateDustParticles(delta);
  }

  processInput(keys) {
    if (this.state !== 'idle') return;

    const isRunning = !!keys.shift;

    if (keys.up) {
      this.tryStep('north', isRunning);
    } else if (keys.down) {
      this.tryStep('south', isRunning);
    } else if (keys.left) {
      this.tryStep('west', isRunning);
    } else if (keys.right) {
      this.tryStep('east', isRunning);
    }
  }

  checkDistrict() {
    if (!this.onDistrictChange || !this.mapData.districts) return;

    for (const district of this.mapData.districts) {
      const b = district.bounds;
      if (this.gridX >= b.minX && this.gridX <= b.maxX && this.gridZ >= b.minZ && this.gridZ <= b.maxZ) {
        this.onDistrictChange(district);
        return;
      }
    }
  }

  emitDust() {
    const now = performance.now();
    if (now - this.lastDustTime < 130) return;
    this.lastDustTime = now;

    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xe6cfb8, transparent: true, opacity: 0.55 });
    const mesh = new THREE.Mesh(geo, mat);

    mesh.position.copy(this.currentWorldPos);
    mesh.position.y = 0.08;

    this.particlesGroup.add(mesh);
    this.dustPool.push({
      mesh,
      age: 0,
      maxAge: 0.35,
      scaleSpeed: 1.8,
      fadeSpeed: 1.6
    });
  }

  updateDustParticles(delta) {
    for (let i = this.dustPool.length - 1; i >= 0; i--) {
      const p = this.dustPool[i];
      p.age += delta;

      if (p.age >= p.maxAge) {
        this.particlesGroup.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.dustPool.splice(i, 1);
      } else {
        p.mesh.scale.addScalar(p.scaleSpeed * delta);
        p.mesh.material.opacity = Math.max(0, p.mesh.material.opacity - p.fadeSpeed * delta);
      }
    }
  }
}
