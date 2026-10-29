import * as THREE from 'three';
import { CAMERA } from '../../../shared/constants.js';

/* ==========================================================================
   CONTRÔLEUR DE CAMÉRA 3/4 PLONGEANTE — BWED WORLD
   Style Animal Crossing / Pokémon, suivi amorti et cadrage doux
   ========================================================================== */

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    this.pitch = (CAMERA.PITCH_DEG * Math.PI) / 180;
    this.yaw = (CAMERA.YAW_DEG * Math.PI) / 180;
    this.distance = CAMERA.DISTANCE;
    this.followSpeed = CAMERA.FOLLOW_LERP;

    // Calcul initial de l'offset relatif
    this.offset = new THREE.Vector3();
    this.updateOffset();
  }

  updateOffset() {
    const horizontalDist = this.distance * Math.cos(this.pitch);
    const y = this.distance * Math.sin(this.pitch);
    const x = horizontalDist * Math.sin(this.yaw);
    const z = horizontalDist * Math.cos(this.yaw);
    this.offset.set(x, y, z);
  }

  setTarget(pos) {
    this.targetPosition.copy(pos);
  }

  setInstantTarget(pos) {
    this.targetPosition.copy(pos);
    this.currentLookAt.copy(pos);
    this.camera.position.copy(pos).add(this.offset);
    this.camera.lookAt(pos);
  }

  update(delta) {
    // Amortissement doux de la cible regardée
    this.currentLookAt.lerp(this.targetPosition, Math.min(1.0, this.followSpeed * delta * 60));

    // Position souhaitée de la caméra
    const desiredPos = new THREE.Vector3().copy(this.currentLookAt).add(this.offset);
    this.camera.position.lerp(desiredPos, Math.min(1.0, this.followSpeed * delta * 60));

    this.camera.lookAt(this.currentLookAt);
  }
}
