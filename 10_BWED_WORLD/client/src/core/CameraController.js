import * as THREE from 'three';
import { CAMERA } from '../../../shared/constants.js';

/* ==========================================================================
   CAMERA CONTROLLER — BWED WORLD
   - Dual Mode: Isometric Diorama (Dofus / Nifty Island) & 3/4 Perspective (Animal Crossing)
   - Telephoto compression with straight vertical lines
   - Smooth lerped target following and zoom limits
   ========================================================================== */

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);

    // Camera style: 'isometric' (default) or 'perspective'
    this.cameraStyle = 'isometric';

    this.pitch = (35.264 * Math.PI) / 180; // True isometric angle atan(1 / sqrt(2))
    this.yaw = (45.0 * Math.PI) / 180;
    this.distance = 32.0;
    this.followSpeed = CAMERA.FOLLOW_LERP;

    // Apply initial isometric FOV (telephoto diorama look)
    this.camera.fov = 30;
    this.camera.updateProjectionMatrix();

    // Initial offset calculation
    this.offset = new THREE.Vector3();
    this.updateOffset();
    this.initZoomListener();
  }

  setCameraStyle(style) {
    this.cameraStyle = style;
    if (style === 'perspective') {
      this.pitch = (CAMERA.PITCH_DEG * Math.PI) / 180;
      this.yaw = (CAMERA.YAW_DEG * Math.PI) / 180;
      this.distance = 42.0;
      this.camera.fov = CAMERA.FOV;
    } else {
      // 'isometric'
      this.pitch = (35.264 * Math.PI) / 180;
      this.yaw = (45.0 * Math.PI) / 180;
      this.distance = 32.0;
      this.camera.fov = 30;
    }

    this.camera.updateProjectionMatrix();
    this.updateOffset();
  }

  toggleCameraStyle() {
    const nextStyle = this.cameraStyle === 'isometric' ? 'perspective' : 'isometric';
    this.setCameraStyle(nextStyle);
    return nextStyle;
  }

  initZoomListener() {
    window.addEventListener('wheel', (e) => {
      const zoomDelta = e.deltaY * 0.025;
      this.distance = THREE.MathUtils.clamp(
        this.distance + zoomDelta,
        CAMERA.MIN_DISTANCE,
        CAMERA.MAX_DISTANCE
      );
      this.updateOffset();
    }, { passive: true });
  }

  zoomIn(step = 5.0) {
    this.distance = THREE.MathUtils.clamp(this.distance - step, CAMERA.MIN_DISTANCE, CAMERA.MAX_DISTANCE);
    this.updateOffset();
  }

  zoomOut(step = 5.0) {
    this.distance = THREE.MathUtils.clamp(this.distance + step, CAMERA.MIN_DISTANCE, CAMERA.MAX_DISTANCE);
    this.updateOffset();
  }

  setDistance(dist) {
    this.distance = THREE.MathUtils.clamp(dist, CAMERA.MIN_DISTANCE, CAMERA.MAX_DISTANCE);
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
    this.currentLookAt.lerp(this.targetPosition, Math.min(1.0, this.followSpeed * delta * 60));
    const desiredPos = new THREE.Vector3().copy(this.currentLookAt).add(this.offset);
    this.camera.position.lerp(desiredPos, Math.min(1.0, this.followSpeed * delta * 60));
    this.camera.lookAt(this.currentLookAt);
  }
}
