import * as THREE from 'three';

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
    this.scene.fog = new THREE.Fog(0xf5dfc6, 25, 85);

    // Caméra perspective
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200);
    this.camera.position.set(12, 14, 12);
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
