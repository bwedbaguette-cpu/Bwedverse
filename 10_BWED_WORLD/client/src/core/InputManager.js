import * as THREE from 'three';
import { CAMERA } from '../../../shared/constants.js';

/* ==========================================================================
   GESTIONNAIRE DES ENTRÉES UTILISATEUR — BWED WORLD
   Clavier ZQSD/Flèches, Joystick tactile mobile et Clic au sol
   ========================================================================== */

export class InputManager {
  constructor(camera, groundMesh = null) {
    this.camera = camera;
    this.groundMesh = groundMesh;

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      shift: false
    };

    this.virtualJoystickVector = { x: 0, y: 0 };
    this.clickTarget = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.initKeyboard();
  }

  setGroundMesh(mesh) {
    this.groundMesh = mesh;
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W':
          this.keys.up = true;
          this.clickTarget = null;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = true;
          this.clickTarget = null;
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
        case 'a':
        case 'A':
          this.keys.left = true;
          this.clickTarget = null;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = true;
          this.clickTarget = null;
          break;
        case 'Shift':
          this.keys.shift = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = false;
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
        case 'a':
        case 'A':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = false;
          break;
        case 'Shift':
          this.keys.shift = false;
          break;
      }
    });
  }

  setJoystickVector(x, y) {
    this.virtualJoystickVector.x = x;
    this.virtualJoystickVector.y = y;
    if (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) {
      this.clickTarget = null;
    }
  }

  // Calcul du vecteur de déplacement dans l'espace monde
  getMovementVector(playerPos) {
    let inputX = 0;
    let inputZ = 0;

    // 1. Clavier
    if (this.keys.up) inputZ -= 1;
    if (this.keys.down) inputZ += 1;
    if (this.keys.left) inputX -= 1;
    if (this.keys.right) inputX += 1;

    // 2. Joystick tactile
    if (Math.abs(this.virtualJoystickVector.x) > 0.05 || Math.abs(this.virtualJoystickVector.y) > 0.05) {
      inputX = this.virtualJoystickVector.x;
      inputZ = -this.virtualJoystickVector.y;
    }

    // Normalisation
    const length = Math.sqrt(inputX * inputX + inputZ * inputZ);
    if (length > 0) {
      inputX /= length;
      inputZ /= length;

      // Rotation relative à la caméra isométrique (45 degrés)
      const camYaw = (CAMERA.YAW_DEG * Math.PI) / 180;
      const worldX = inputX * Math.cos(camYaw) + inputZ * Math.sin(camYaw);
      const worldZ = -inputX * Math.sin(camYaw) + inputZ * Math.cos(camYaw);

      return {
        direction: new THREE.Vector3(worldX, 0, worldZ).normalize(),
        isRunning: this.keys.shift || length > 0.85
      };
    }

    // 3. Déplacement par clic / tap au sol
    if (this.clickTarget && playerPos) {
      const dist = playerPos.distanceTo(this.clickTarget);
      if (dist > 0.3) {
        const dir = new THREE.Vector3().subVectors(this.clickTarget, playerPos);
        dir.y = 0;
        dir.normalize();
        return {
          direction: dir,
          isRunning: dist > 5.0
        };
      } else {
        this.clickTarget = null;
      }
    }

    return null;
  }
}
