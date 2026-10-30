import * as THREE from 'three';
import { CAMERA } from '../../../shared/constants.js';

/* ==========================================================================
   3D THREE.JS RENDERING ENGINE — BWED WORLD
   Mobile-first, optimized for thermal efficiency and smooth 60fps rendering
   ========================================================================== */

export class Engine {
  constructor(canvasContainerEl) {
    this.container = canvasContainerEl;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.clock = new THREE.Clock();
    this.isRunning = false;
    this.callbacks = [];

    this.currentResolutionLevel = 'balanced';
    this.currentShadowLevel = 'soft';

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 3D Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfff4e6);
    this.scene.fog = new THREE.Fog(0xf5dfc6, 55, 180);

    // Panoramic camera
    this.camera = new THREE.PerspectiveCamera(CAMERA.FOV, width / height, 0.5, 500);
    this.camera.position.set(24, 30, 24);
    this.camera.lookAt(0, 0, 0);

    // Optimized WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);

    // Default to balanced 1.25x on Retina displays to cut GPU heat by over 50% while preserving crispness
    const initialPixelRatio = Math.min(window.devicePixelRatio, 1.25);
    this.renderer.setPixelRatio(initialPixelRatio);

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Dynamic resize handler
    window.addEventListener('resize', () => this.onResize());
  }

  setGraphicsResolution(level) {
    if (!this.renderer) return;
    this.currentResolutionLevel = level;

    let ratio = 1.0;
    if (level === 'high' || level === 'ultra') {
      ratio = Math.min(window.devicePixelRatio, 2.0);
    } else if (level === 'balanced') {
      ratio = Math.min(window.devicePixelRatio, 1.25);
    } else {
      ratio = 1.0;
    }

    this.renderer.setPixelRatio(ratio);
  }

  setHighResolution(isHigh) {
    this.setGraphicsResolution(isHigh ? 'high' : 'standard');
  }

  setShadowsQuality(level) {
    if (!this.renderer) return;
    this.currentShadowLevel = level;

    const enabled = level !== 'off' && level !== false;
    this.renderer.shadowMap.enabled = enabled;

    this.scene.traverse((child) => {
      if (child.material) {
        child.material.needsUpdate = true;
      }
    });
  }

  setShadowsEnabled(enabled) {
    this.setShadowsQuality(enabled ? 'soft' : 'off');
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onUpdate(callback) {
    this.callbacks.push(callback);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.getElapsedTime();

    for (let i = 0; i < this.callbacks.length; i++) {
      this.callbacks[i](delta, elapsed);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
