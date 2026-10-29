import * as THREE from 'three';
import { lerpAngle } from '../../../shared/math.js';
import { AvatarModel } from './AvatarModel.js';

/* ==========================================================================
   JOUEUR DISTANT INTERPOLÉ — BWED WORLD
   Affichage lissé des autres joueurs, étiquette de pseudo et animations
   ========================================================================== */

export class RemotePlayer {
  constructor(id, name, avatarId, scene) {
    this.id = id;
    this.name = name;
    this.avatarId = avatarId;
    this.scene = scene;

    this.position = new THREE.Vector3(0, 0, 0);
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.rotationY = 0;
    this.targetRotationY = 0;
    this.state = 'idle';

    // Historique temporel pour interpolation douce
    this.snapshots = [];

    // Modèle d'avatar
    this.avatar = new AvatarModel(avatarId);
    this.scene.add(this.avatar.rootGroup);

    // Étiquette de nom (billboard 3D)
    this.nameplate = this.createNameplate(name);
    this.avatar.rootGroup.add(this.nameplate);
  }

  createNameplate(name) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Fond pilule sombre semi-transparent
    ctx.fillStyle = 'rgba(28, 14, 8, 0.75)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(16, 10, 224, 44, 22);
    } else {
      ctx.rect(16, 10, 224, 44);
    }
    ctx.fill();

    // Bordure dorée
    ctx.strokeStyle = 'rgba(255, 209, 90, 0.6)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Texte du pseudo
    ctx.fillStyle = '#fff9f0';
    ctx.font = 'bold 24px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name || 'Visiteur', 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, 2.3, 0);
    sprite.scale.set(1.8, 0.45, 1);
    return sprite;
  }

  // Réception d'un snapshot réseau
  pushSnapshot(packet) {
    const now = performance.now();
    this.snapshots.push({
      time: now,
      x: packet.x,
      y: packet.y,
      z: packet.z,
      rot: packet.rot,
      anim: packet.anim
    });

    // Conserver seulement les 6 derniers paquets
    if (this.snapshots.length > 6) {
      this.snapshots.shift();
    }
  }

  update(delta) {
    if (this.snapshots.length === 0) return;

    // Dernier snapshot disponible
    const latest = this.snapshots[this.snapshots.length - 1];
    this.targetPosition.set(latest.x, latest.y, latest.z);
    this.targetRotationY = latest.rot;
    this.state = latest.anim || 'idle';

    // Interpolation exponentielle douce (15 Hz -> 60/120 FPS fluide)
    const lerpFactor = Math.min(1.0, 16.0 * delta);
    this.position.lerp(this.targetPosition, lerpFactor);
    this.rotationY = lerpAngle(this.rotationY, this.targetRotationY, lerpFactor);

    this.avatar.rootGroup.position.copy(this.position);
    this.avatar.rootGroup.rotation.y = this.rotationY;

    // Animation procédurale
    this.avatar.updateAnimation(delta, this.state, this.state === 'run' ? 8 : 4);
  }

  dispose() {
    this.scene.remove(this.avatar.rootGroup);
    if (this.nameplate) {
      this.nameplate.material.map?.dispose();
      this.nameplate.material.dispose();
    }
  }
}
