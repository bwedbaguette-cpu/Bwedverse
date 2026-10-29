import * as THREE from 'three';
import { CAMERA } from '../../../shared/constants.js';

/* ==========================================================================
   MOTEUR DE RENDU 3D THREE.JS — BWED WORLD
   Optimisé mobile-first, gestion fluide du cycle de rendu et du redimensionnement
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

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scène
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xfff4e6);
    this.scene.fog = new THREE.Fog(0xf5dfc6, 55, 180);

    // Caméra perspective large panoramique
    this.camera = new THREE.PerspectiveCamera(CAMERA.FOV, width / height, 0.5, 500);
    this.camera.position.set(24, 30, 24);
    this.camera.lookAt(0, 0, 0);

    // Renderer WebGL
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Redimensionnement dynamique
    window.addEventListener('resize', () => this.onResize());
  }

  setShadowsEnabled(enabled) {
    if (!this.renderer) return;
    this.renderer.shadowMap.enabled = !!enabled;
    this.scene.traverse((child) => {
      if (child.material) {
        child.material.needsUpdate = true;
      }
    });
  }

  setHighResolution(isHigh) {
    if (!this.renderer) return;
    const ratio = isHigh ? Math.min(window.devicePixelRatio, 2) : 1;
    this.renderer.setPixelRatio(ratio);
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

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    for (const cb of this.callbacks) {
      cb(delta, elapsed);
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
