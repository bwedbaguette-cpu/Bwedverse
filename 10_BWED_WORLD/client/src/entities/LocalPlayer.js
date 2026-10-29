import * as THREE from 'three';
import { MOVEMENT } from '../../../shared/constants.js';
import { lerpAngle } from '../../../shared/math.js';
import { AvatarModel } from './AvatarModel.js';

/* ==========================================================================
   JOUEUR LOCAL CONTRÔLÉ — BWED WORLD
   Déplacements avec inertie douce, orientation naturelle et particules de pas
   ========================================================================== */

export class LocalPlayer {
  constructor(id, name, avatarId, scene, physics) {
    this.id = id;
    this.name = name;
    this.avatarId = avatarId;
    this.scene = scene;
    this.physics = physics;

    this.position = new THREE.Vector3(0, 0, 0);
    this.rotationY = 0;
    this.targetRotationY = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.state = 'idle'; // 'idle', 'walk', 'run'
    this.currentSpeed = 0;

    // Modèle d'avatar
    this.avatar = new AvatarModel(avatarId);
    this.scene.add(this.avatar.rootGroup);

    // Particules de pas
    this.particlesGroup = new THREE.Group();
    this.scene.add(this.particlesGroup);
    this.dustPool = [];
    this.lastDustTime = 0;

    this.setPosition(0, 0, 0);
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.avatar.rootGroup.position.copy(this.position);
  }

  update(delta, inputResult) {
    let targetSpeed = 0;
    let moveDir = null;

    if (inputResult && inputResult.direction) {
      moveDir = inputResult.direction;
      targetSpeed = inputResult.isRunning ? MOVEMENT.RUN_SPEED : MOVEMENT.WALK_SPEED;
      this.state = inputResult.isRunning ? 'run' : 'walk';

      // Calcul de la rotation cible
      this.targetRotationY = Math.atan2(moveDir.x, moveDir.z);
    } else {
      this.state = 'idle';
      targetSpeed = 0;
    }

    // Accélération et décélération douces
    const rate = targetSpeed > this.currentSpeed ? MOVEMENT.ACCELERATION : MOVEMENT.DECELERATION;
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, Math.min(1.0, rate * delta));

    if (this.currentSpeed > 0.05 && moveDir) {
      // Déplacement appliqué
      const displacement = moveDir.clone().multiplyScalar(this.currentSpeed * delta);
      const newPos = this.physics.resolveMovement(this.position, displacement);
      this.position.copy(newPos);

      // Orientation fluide vers la trajectoire
      this.rotationY = lerpAngle(this.rotationY, this.targetRotationY, Math.min(1.0, MOVEMENT.ROTATION_LERP * delta));
      this.avatar.rootGroup.rotation.y = this.rotationY;

      // Émission de particules de pas en course
      if (this.state === 'run') {
        this.emitDust();
      }
    }

    this.avatar.rootGroup.position.copy(this.position);
    this.avatar.updateAnimation(delta, this.state, this.currentSpeed);
    this.updateDustParticles(delta);
  }

  emitDust() {
    const now = performance.now();
    if (now - this.lastDustTime < 140) return;
    this.lastDustTime = now;

    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: 0xe6cfb8, transparent: true, opacity: 0.5 });
    const mesh = new THREE.Mesh(geo, mat);

    // Émission derrière les pieds
    const offsetBack = new THREE.Vector3(0, 0.06, -0.3).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotationY);
    mesh.position.copy(this.position).add(offsetBack);
    mesh.position.x += (Math.random() - 0.5) * 0.2;
    mesh.position.z += (Math.random() - 0.5) * 0.2;

    this.particlesGroup.add(mesh);
    this.dustPool.push({
      mesh,
      vy: 0.8 + Math.random() * 0.5,
      life: 1.0,
      scale: 1.0
    });
  }

  updateDustParticles(delta) {
    for (let i = this.dustPool.length - 1; i >= 0; i--) {
      const p = this.dustPool[i];
      p.life -= delta * 3.5;
      p.scale += delta * 2.2;
      p.mesh.position.y += p.vy * delta;
      p.mesh.scale.setScalar(p.scale);
      p.mesh.material.opacity = p.life * 0.45;

      if (p.life <= 0) {
        this.particlesGroup.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.dustPool.splice(i, 1);
      }
    }
  }

  // Paquet réseau pour diffusion aux autres joueurs
  getNetworkPacket() {
    return {
      id: this.id,
      name: this.name,
      avatarId: this.avatarId,
      x: Number(this.position.x.toFixed(3)),
      y: Number(this.position.y.toFixed(3)),
      z: Number(this.position.z.toFixed(3)),
      rot: Number(this.rotationY.toFixed(3)),
      anim: this.state,
      ts: Date.now()
    };
  }

  dispose() {
    this.scene.remove(this.avatar.rootGroup);
    this.scene.remove(this.particlesGroup);
  }
}
