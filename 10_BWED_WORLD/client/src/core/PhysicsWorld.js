import * as THREE from 'three';
import { PHYSICS } from '../../../shared/constants.js';

/* ==========================================================================
   SYSTÈME DE COLLISION PHYSIQUE — BWED WORLD
   Colliders de sol et obstacles radiaux légers optimisés pour mobile
   ========================================================================== */

export class PhysicsWorld {
  constructor() {
    this.colliders = [];
    this.groundElevationFn = (x, z) => 0.0;
  }

  setGroundElevationFunction(fn) {
    this.groundElevationFn = fn;
  }

  addObstacle(x, z, radius) {
    this.colliders.push({ x, z, radius });
  }

  getGroundHeight(x, z) {
    return this.groundElevationFn(x, z);
  }

  // Résolution des collisions avec glissement sur les obstacles
  resolveMovement(currentPos, displacement) {
    const desiredPos = currentPos.clone().add(displacement);
    const playerRadius = PHYSICS.PLAYER_RADIUS;

    for (const obs of this.colliders) {
      const dx = desiredPos.x - obs.x;
      const dz = desiredPos.z - obs.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = playerRadius + obs.radius;

      if (dist < minDist && dist > 0.0001) {
        // Poussée vers l'extérieur pour empêcher la pénétration
        const overlap = minDist - dist;
        const pushX = (dx / dist) * overlap;
        const pushZ = (dz / dist) * overlap;
        desiredPos.x += pushX;
        desiredPos.z += pushZ;
      }
    }

    // Calcul de la hauteur de sol
    desiredPos.y = this.getGroundHeight(desiredPos.x, desiredPos.z);
    return desiredPos;
  }
}
