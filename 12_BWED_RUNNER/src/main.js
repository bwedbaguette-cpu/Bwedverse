/* ==========================================================================
   BWED BUTTER ESCAPE — MAIN GAME LOOP (V4 LEADERBOARD & REAL GLB)
   Features live 3D showroom with dancing Cozy Shiba Buddy,
   accurate runner orientation (facing forward into the track),
   100% real GLB buildings, and global-ready Leaderboard system.
   ========================================================================== */

import * as THREE from 'three';
import { Player } from './Player.js';
import { GiantKnife } from './GiantKnife.js';
import { ObstacleManager } from './Obstacles.js';
import { CollectableManager, ITEM_TYPES } from './Collectables.js';
import { TrackManager, ZONES } from './TrackManager.js';
import { AudioManager } from './AudioFX.js';
import { UIManager } from './UI.js';

class Game {
  constructor() {
    this.container = document.getElementById('canvasContainer');

    // States
    this.STATE_MENU = 'MENU';
    this.STATE_PLAYING = 'PLAYING';
    this.STATE_PAUSED = 'PAUSED';
    this.STATE_GAMEOVER = 'GAMEOVER';
    this.state = this.STATE_MENU;

    // Progression
    this.distance = 0;
    this.croissants = 0;
    this.score = 0;
    this.currentSpeed = 13.5;

    // Turbo
    this.turboPercent = 0;
    this.isTurbo = false;
    this.turboDuration = 5.0;
    this.turboTimer = 0;

    // Camera
    this.cameraMode = 'dynamic';
    this.shakeIntensity = 0;

    // Framerate Limiter (Default 30 FPS cap for ultra-smooth battery & performance)
    this.targetFPS = 30;
    this.frameInterval = 1000 / 30;
    this.lastFrameTime = performance.now();

    // Subsystems
    this.initAudio();
    this.initThree();
    this.initEntities();
    this.initShowroomPedestal();
    this.initUI();
    this.initInputs();

    this.clock = new THREE.Clock();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initAudio() {
    this.audio = new AudioManager();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x22130c);
    this.scene.fog = new THREE.FogExp2(0x22130c, 0.008);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 450);
    this.camera.position.set(0, 3.2, 5.5);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff2e0, 0.75);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff6ea, 0x4a2a18, 0.5);
    this.scene.add(hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    this.dirLight.position.set(14, 30, 18);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 90;
    this.dirLight.shadow.camera.left = -18;
    this.dirLight.shadow.camera.right = 18;
    this.dirLight.shadow.camera.top = 28;
    this.dirLight.shadow.camera.bottom = -28;
    this.dirLight.shadow.bias = -0.0004;
    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  initShowroomPedestal() {
    this.pedestal = new THREE.Group();
    const diskGeo = new THREE.CylinderGeometry(1.4, 1.6, 0.2, 32);
    const diskMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      emissive: 0xffaa00,
      emissiveIntensity: 0.35,
      metalness: 0.4,
      roughness: 0.2,
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.position.y = -0.1;
    disk.receiveShadow = true;
    this.pedestal.add(disk);

    const dustGeo = new THREE.DodecahedronGeometry(0.04);
    const dustMat = new THREE.MeshBasicMaterial({ color: 0xfff0aa, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 20; i++) {
      const p = new THREE.Mesh(dustGeo, dustMat);
      p.position.set(
        (Math.random() - 0.5) * 4.0,
        Math.random() * 2.5 + 0.2,
        (Math.random() - 0.5) * 4.0
      );
      this.pedestal.add(p);
    }

    this.scene.add(this.pedestal);
  }

  initEntities() {
    this.player = new Player(this.scene, this.audio);
    this.giantKnife = new GiantKnife(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene);
    this.collectableManager = new CollectableManager(this.scene, this.audio);
    this.trackManager = new TrackManager(this.scene, this.obstacleManager, this.collectableManager);

    this.trackManager.onZoneChange = (zone) => {
      this.ui.announceZone(zone);
    };
  }

  initUI() {
    this.ui = new UIManager(
      {
        onStart: () => this.startGame(),
        onRestart: () => this.restartGame(),
        onPause: () => this.pauseGame(),
        onResume: () => this.resumeGame(),
        onAvatarSelect: (avatarId) => {
          this.player.loadAvatar(avatarId);
          setTimeout(() => {
            if (this.state === this.STATE_MENU) {
              this.player.playDanceAnimation();
            }
          }, 200);
        },
        onTurboActivate: () => this.triggerTurbo(),
        onCameraChange: (mode) => { this.cameraMode = mode; },
        onFPSChange: (fps) => this.setFramerateLimit(fps),
        onQualityChange: (quality) => this.setGraphicQuality(quality),
      },
      this.audio
    );
  }

  setFramerateLimit(fps) {
    if (fps === 'uncapped') {
      this.targetFPS = 'uncapped';
      this.frameInterval = 0;
    } else {
      this.targetFPS = parseInt(fps, 10) || 30;
      this.frameInterval = 1000 / this.targetFPS;
    }
    this.lastFrameTime = performance.now();
  }

  setGraphicQuality(quality) {
    if (quality === 'low') {
      this.renderer.shadowMap.enabled = false;
      this.renderer.setPixelRatio(1.0);
    } else if (quality === 'medium') {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.BasicShadowMap;
      this.renderer.setPixelRatio(1.0);
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    }
  }

  initInputs() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.state === this.STATE_PLAYING) {
          this.pauseGame();
          return;
        } else if (this.state === this.STATE_PAUSED) {
          this.resumeGame();
          return;
        } else if (this.state === this.STATE_MENU) {
          const lb = document.getElementById('leaderboardModal');
          const av = document.getElementById('avatarModal');
          const st = document.getElementById('settingsModal');
          const gd = document.getElementById('powerupGuideCard');
          if (lb) lb.style.display = 'none';
          if (av) av.style.display = 'none';
          if (st) st.style.display = 'none';
          if (gd) gd.style.display = 'none';
          return;
        }
      }

      if (e.code === 'KeyM') {
        const isMuted = this.audio.toggleMute();
        return;
      }

      if (this.state !== this.STATE_PLAYING) {
        if (e.code === 'Space' || e.code === 'Enter') {
          if (this.state === this.STATE_MENU) {
            document.getElementById('titlePlayBtn').click();
          } else if (this.state === this.STATE_GAMEOVER) {
            document.getElementById('gameOverModal').style.display = 'none';
            this.restartGame();
          }
        }
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
        case 'KeyQ':
          this.player.moveLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.player.moveRight();
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'KeyZ':
        case 'Space':
          this.player.jump();
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.player.slide();
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.triggerTurbo();
          break;
      }
    });

    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.state !== this.STATE_PLAYING) return;

      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) > 28) {
        if (absDx > absDy) {
          if (dx > 0) this.player.moveRight();
          else this.player.moveLeft();
        } else {
          if (dy < 0) this.player.jump();
          else this.player.slide();
        }
      }
    }, { passive: true });

    const btnL = document.getElementById('touchLeft');
    const btnR = document.getElementById('touchRight');
    const btnJ = document.getElementById('touchJump');
    const btnS = document.getElementById('touchSlide');

    if (btnL) btnL.addEventListener('click', () => this.state === this.STATE_PLAYING && this.player.moveLeft());
    if (btnR) btnR.addEventListener('click', () => this.state === this.STATE_PLAYING && this.player.moveRight());
    if (btnJ) btnJ.addEventListener('click', () => this.state === this.STATE_PLAYING && this.player.jump());
    if (btnS) btnS.addEventListener('click', () => this.state === this.STATE_PLAYING && this.player.slide());
  }

  startGame() {
    this.state = this.STATE_PLAYING;
    this.pedestal.visible = false;
    this.player.playRunAnimation();
    this.audio.startMusic();
  }

  pauseGame() {
    if (this.state !== this.STATE_PLAYING) return;
    this.state = this.STATE_PAUSED;
    this.audio.pauseMusic();
    this.ui.showPause();
  }

  resumeGame() {
    if (this.state !== this.STATE_PAUSED) return;
    this.state = this.STATE_PLAYING;
    this.audio.resumeMusic();
    this.ui.hidePause();
  }

  restartGame() {
    this.distance = 0;
    this.croissants = 0;
    this.score = 0;
    this.currentSpeed = 13.5;
    this.turboPercent = 0;
    this.isTurbo = false;
    this.turboTimer = 0;
    this.shakeIntensity = 0;

    this.player.reset();
    this.giantKnife.reset();
    this.obstacleManager.reset();
    this.collectableManager.reset();
    this.trackManager.reset();

    this.pedestal.visible = false;
    this.state = this.STATE_PLAYING;
    this.ui.hidePause();
    this.audio.startMusic();
  }

  triggerTurbo() {
    if (this.turboPercent >= 100 && !this.isTurbo && this.state === this.STATE_PLAYING) {
      this.isTurbo = true;
      this.turboTimer = this.turboDuration;
      this.turboPercent = 0;
      this.audio.playTurbo();
    }
  }

  triggerGameOver() {
    this.state = this.STATE_GAMEOVER;
    this.audio.playSlice();
    this.giantKnife.triggerSlice();
    this.shakeIntensity = 0.8;
    const { zone } = this.trackManager.getZoneForDistance(this.distance);
    this.ui.showGameOver(this.distance, this.croissants, this.score, zone.name);
  }

  animate(timestamp) {
    requestAnimationFrame(this.animate);

    const now = timestamp || performance.now();
    const elapsed = now - this.lastFrameTime;

    // Strict Framerate Limiter: caps at 30 FPS max (unless user picks 60 or uncapped)
    if (this.targetFPS !== 'uncapped' && elapsed < this.frameInterval) {
      return;
    }

    this.lastFrameTime = now - (this.targetFPS !== 'uncapped' ? (elapsed % this.frameInterval) : 0);

    // Predictable and stable delta time (at 30 fps, delta ~ 0.0333s)
    const delta = Math.min(Math.max(elapsed * 0.001, 0.016), 0.05);

    if (this.state === this.STATE_PLAYING) {
      this.updatePlaying(delta);
    } else if (this.state === this.STATE_GAMEOVER) {
      this.updateGameOver(delta);
    } else if (this.state === this.STATE_MENU) {
      this.updateMenu(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateMenu(delta) {
    this.pedestal.visible = true;
    const time = Date.now() * 0.0012;

    // Responsive cinematic framing: fully frames ears, paws, and glowing pedestal on all screens
    const aspect = this.camera.aspect;
    const camDist = aspect < 1.1 ? 5.8 : 4.4;
    // On wide desktop screens, shift framing right so character sits in the open space beside the title card
    const lookX = aspect > 1.2 ? -0.75 : 0.0;

    // Elegant front-facing cinematic sway (+-24 degrees) so the hero is always facing the player
    const swayAngle = Math.sin(time * 0.6) * 0.38;

    this.camera.position.x = Math.sin(swayAngle) * camDist + lookX;
    this.camera.position.z = Math.cos(swayAngle) * camDist + 0.5;
    this.camera.position.y = 1.75;
    this.camera.lookAt(lookX, 0.75, 0);

    this.pedestal.rotation.y = swayAngle * 0.4;
    this.player.update(delta, 10.0, false);
  }

  updatePlaying(delta) {
    // 1. Smooth, Balanced Speed Progression (no sudden rushes or saw-tooth spikes)
    const { zone } = this.trackManager.getZoneForDistance(this.distance);
    const zoneLen = zone.length || 400;
    const zoneProg = Math.min(1.0, Math.max(0, (this.distance - zone.startDist) / zoneLen));
    const baseTargetSpeed = THREE.MathUtils.lerp(zone.speedMin, zone.speedMax, zoneProg);
    const targetSpeed = this.isTurbo ? (baseTargetSpeed + 7.5) : baseTargetSpeed;
    this.currentSpeed = THREE.MathUtils.lerp(this.currentSpeed, targetSpeed, Math.min(1.0, delta * 2.5));

    if (this.isTurbo) {
      this.turboTimer -= delta;
      if (this.turboTimer <= 0) {
        this.isTurbo = false;
      }
    }

    const moveStep = this.currentSpeed * delta;
    this.player.group.position.z -= moveStep;
    this.distance += moveStep;
    this.score += Math.floor(moveStep * (this.isTurbo ? 2.5 : 1.0));

    // 2. Light follows player
    this.dirLight.position.z = this.player.group.position.z + 18;
    this.dirLight.target.position.z = this.player.group.position.z - 8;
    this.dirLight.target.updateMatrixWorld();

    // 3. Subsystem Updates
    this.player.update(delta, this.currentSpeed, true);
    this.giantKnife.update(delta, this.player.group.position, this.currentSpeed, this.isTurbo);
    this.trackManager.update(this.player.group.position.z, this.distance);
    this.obstacleManager.cleanupBehind(this.player.group.position.z);

    // 4. Collision
    const colResult = this.obstacleManager.checkCollision(this.player, this.isTurbo);
    if (colResult.hit) {
      const damageType = this.player.takeDamage();
      if (damageType === 'shield_break') {
        this.shakeIntensity = 0.35;
      } else if (damageType === 'damage_taken') {
        this.shakeIntensity = 0.6;
        this.giantKnife.triggerFeint();

        if (this.player.lives <= 0) {
          this.triggerGameOver();
          return;
        }
      }
    }

    // 5. Collectables
    const collectedItem = this.collectableManager.update(delta, this.player, this.isTurbo);
    if (collectedItem) {
      if (collectedItem.type === ITEM_TYPES.CROISSANT) {
        this.croissants++;
        this.score += collectedItem.points;
        if (!this.isTurbo) {
          // Rewarding, smooth progression: +2.5% per croissant (40 croissants for full turbo meter)
          this.turboPercent = Math.min(100, this.turboPercent + 2.5);
        }
      } else if (collectedItem.type === ITEM_TYPES.HEART) {
        this.score += collectedItem.points;
      } else if (collectedItem.type === ITEM_TYPES.SHIELD) {
        this.score += collectedItem.points;
      } else if (collectedItem.type === ITEM_TYPES.MAGNET) {
        this.score += collectedItem.points;
      } else if (collectedItem.type === ITEM_TYPES.TURBO_BUTTER) {
        this.score += collectedItem.points;
        this.turboPercent = 100;
        this.triggerTurbo();
      } else if (collectedItem.type === ITEM_TYPES.TREASURE_CHEST) {
        this.score += collectedItem.points;
        this.croissants += (collectedItem.extraCroissants || 10);
      } else if (collectedItem.type === ITEM_TYPES.GOLDEN_STATUE) {
        this.score += collectedItem.points;
        this.croissants += (collectedItem.extraCroissants || 20);
      } else if (collectedItem.type === ITEM_TYPES.MASCOT_FIGURINE) {
        this.score += collectedItem.points;
        this.turboPercent = Math.min(100, this.turboPercent + (collectedItem.turboBonus || 40));
      } else if (collectedItem.type === ITEM_TYPES.PASTRY_FEAST) {
        this.score += collectedItem.points;
        this.croissants += (collectedItem.extraCroissants || 8);
      }
    }

    // 6. Camera
    this.updateCamera(delta);

    // 7. HUD
    this.ui.updateHUD(
      this.distance,
      this.croissants,
      this.score,
      this.player.lives,
      this.player,
      this.turboPercent,
      this.isTurbo
    );
  }

  updateGameOver(delta) {
    this.giantKnife.update(delta, this.player.group.position, 0, false);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, this.player.group.position.z + 4.5, delta * 2.0);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 2.2, delta * 2.0);
    this.camera.lookAt(this.player.group.position.x, 0.8, this.player.group.position.z);
  }

  updateCamera(delta) {
    const pPos = this.player.group.position;

    let targetCamX = pPos.x * 0.45;
    let targetCamY = 3.6;
    let targetCamZ = pPos.z + 7.8;

    if (this.cameraMode === 'close') {
      targetCamY = 2.6;
      targetCamZ = pPos.z + 5.2;
    } else if (this.cameraMode === 'classic') {
      targetCamY = 5.2;
      targetCamZ = pPos.z + 9.5;
    }

    if (this.isTurbo) {
      targetCamY += 0.4;
      targetCamZ += 1.5;
    }

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetCamX, delta * 7.5);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetCamY, delta * 5.0);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetCamZ, delta * 9.5);

    if (this.shakeIntensity > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 2.4);
    }

    const targetFov = this.isTurbo ? 74 : (this.cameraMode === 'close' ? 65 : 60);
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 4.0);
    this.camera.updateProjectionMatrix();

    this.camera.lookAt(pPos.x * 0.6, 1.2, pPos.z - 8.0);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
