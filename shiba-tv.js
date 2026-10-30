import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ==========================================================================
   COZY SHIBA BUDDY 3D — RETRO TV & TAMAGOTCHI INTERACTIVE STUDIO
   - Real-time Three.js diorama viewer with turntable OrbitControls
   - Full 13 motion-capture skeleton animations with seamless crossfade
   - Vintage CRT TV chassis with scanlines, live OSD and hardware dials
   - Tamagotchi care vitals (Feed crumbs, Pet head, Sparring, Dance party)
   ========================================================================== */

const SHIBA_MODEL_URL = './assets/shiba/cozy-shiba-animated.glb';

const ANIMATIONS = [
  { id: 'alert', key: 'alert', title: 'Alert Idle', tag: 'IDLE', ch: '01', mood: 'Vigilant', energy: '50%', desc: 'Classic upright alert stance with gentle breathing.' },
  { id: 'agree', key: 'agree_gesture', title: 'Happy Nod', tag: 'EMOTE', ch: '02', mood: 'Loving', energy: '65%', desc: 'Affirmative nod, wagging, and happy agreement.' },
  { id: 'boom_dance', key: 'boom_dance', title: 'Boom Dance', tag: 'DANCE', ch: '03', mood: 'Hype', energy: '95%', desc: 'Bouncy rhythm dance with hip hop arm swings.' },
  { id: 'all_night', key: 'all_night_dance', title: 'All-Night Disco', tag: 'DANCE', ch: '04', mood: 'Party', energy: '100%', desc: 'Late-night party groove with energetic steps.' },
  { id: 'boxing', key: 'boxing_practice', title: 'Boxer Warmup', tag: 'SPORT', ch: '05', mood: 'Feisty', energy: '85%', desc: 'Quick jabs, cross punches, and agile bob-and-weave.' },
  { id: 'attack', key: 'attack', title: 'Paw Strike', tag: 'ACTION', ch: '06', mood: 'Brave', energy: '80%', desc: 'Sharp forward doggo strike.' },
  { id: 'combo', key: 'triple_combo_attack', title: 'Triple Combo', tag: 'ACTION', ch: '07', mood: 'Martial Arts', energy: '92%', desc: '3-hit martial arts combination.' },
  { id: 'skill_1', key: 'skill_01', title: 'Super Skill Alpha', tag: 'ACTION', ch: '08', mood: 'Epic', energy: '94%', desc: 'Acrobatic power move and leap.' },
  { id: 'skill_3', key: 'skill_03', title: 'Super Skill Omega', tag: 'ACTION', ch: '09', mood: 'Heroic', energy: '97%', desc: 'Dynamic superhero finisher stance.' },
  { id: 'walk', key: 'walking', title: 'Doggo Walk', tag: 'MOVE', ch: '10', mood: 'Casual', energy: '40%', desc: 'Paws pacing in a gentle walk cycle.' },
  { id: 'strut', key: 'walking_woman', title: 'Sassy Strut', tag: 'MOVE', ch: '11', mood: 'Fabulous', energy: '70%', desc: 'Confident high-fashion strut walk.' },
  { id: 'run', key: 'running', title: 'Playful Run', tag: 'MOVE', ch: '12', mood: 'Zoomies', energy: '88%', desc: 'Energetic jog across the diorama.' },
  { id: 'sprint', key: 'run_03', title: 'Speed Sprint', tag: 'MOVE', ch: '13', mood: 'Turbo', energy: '99%', desc: 'Full-speed forward sprint.' }
];

// Audio helpers
function playClickSound() {
  if (window.bwedAudio && typeof window.bwedAudio.click === 'function') {
    window.bwedAudio.click();
  } else {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (_) {}
  }
}

function playHappySound() {
  if (window.bwedAudio && typeof window.bwedAudio.heroSelect === 'function') {
    window.bwedAudio.heroSelect();
  } else {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  }
}

class ShibaTamagotchiTV {
  constructor() {
    this.canvas = document.getElementById('shibaCanvas');
    this.container = document.getElementById('shibaTvTube');
    if (!this.canvas || !this.container) return;

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();

    // Model & Animation State
    this.model = null;
    this.mixer = null;
    this.actionsMap = new Map();
    this.currentAction = null;
    this.currentAnimIndex = 2; // Default to Boom Dance (Ch 03)
    this.playbackSpeed = 1.0;
    this.isLoaded = false;
    this.autoRotate = true;

    // Tamagotchi Vitals
    this.vitals = {
      happiness: 100,
      fullness: 90,
      energy: 95,
      crumbsGiven: 0,
      petsGiven: 0
    };

    this.initThree();
    this.buildPedestal();
    this.setupControls();
    this.bindDOM();
    this.renderChannelsGrid();
    this.loadModel();
    this.animate();
  }

  initThree() {
    const width = this.container.clientWidth || 640;
    const height = this.container.clientHeight || 440;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, 1.05, 3.8);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.3);
    this.scene.add(ambientLight);

    // Key Light (Sun / Warm Spotlight)
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    this.scene.add(keyLight);

    // Amber Rim Light (Back edge glow)
    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.8);
    rimLight.position.set(-3, 3, -3);
    this.scene.add(rimLight);

    // Pastel Blue Under Bounce
    const bounceLight = new THREE.DirectionalLight(0xc7d2fe, 0.6);
    bounceLight.position.set(0, -3, 2);
    this.scene.add(bounceLight);

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => this.onResize());
    resizeObserver.observe(this.container);
  }

  buildPedestal() {
    const pedestalGroup = new THREE.Group();

    // Warm Bakery Wooden Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.05, 1.12, 0.12, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d1c06,
      roughness: 0.65,
      metalness: 0.1
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.06;
    baseMesh.receiveShadow = true;
    pedestalGroup.add(baseMesh);

    // Golden Inset Rim
    const rimGeo = new THREE.CylinderGeometry(1.08, 1.08, 0.025, 36);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xffd15a,
      roughness: 0.3,
      metalness: 0.6
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = -0.005;
    pedestalGroup.add(rimMesh);

    // Soft Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(2.1, 2.1);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x120803,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.005;
    pedestalGroup.add(shadowMesh);

    this.scene.add(pedestalGroup);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.target.set(0, 0.65, 0);
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 7.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.08;
    this.controls.autoRotate = this.autoRotate;
    this.controls.autoRotateSpeed = 2.0;

    // Pause auto-rotation temporarily when the user manually interacts
    this.controls.addEventListener('start', () => {
      this.controls.autoRotate = false;
    });

    this.controls.addEventListener('end', () => {
      if (this.autoRotate) {
        setTimeout(() => {
          if (this.autoRotate) this.controls.autoRotate = true;
        }, 3200);
      }
    });
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  loadModel() {
    const loader = new GLTFLoader();
    const progressText = document.getElementById('shibaLoadProgress');
    const loadingOverlay = document.getElementById('shibaLoadingOverlay');

    loader.load(
      SHIBA_MODEL_URL,
      (gltf) => {
        this.model = gltf.scene;

        // 1. Calculate bounding box for normalization
        const bbox = new THREE.Box3().setFromObject(this.model);
        const size = new THREE.Vector3();
        bbox.getSize(size);

        // 2. Scale height to 1.26 units (comfortably fits head and jump animations)
        const currentHeight = size.y > 0.1 ? size.y : 1.26;
        const scaleFactor = 1.26 / currentHeight;
        this.model.scale.setScalar(scaleFactor);

        // 3. Re-center pivot strictly on ground
        const scaledBbox = new THREE.Box3().setFromObject(this.model);
        const center = new THREE.Vector3();
        scaledBbox.getCenter(center);

        this.model.position.x = -center.x;
        this.model.position.z = -center.z;
        this.model.position.y = -scaledBbox.min.y;

        // 4. Cel-shading materials and shadow setup
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.isSkinnedMesh) {
              child.frustumCulled = false;
            }
            if (child.material) {
              child.material.roughness = Math.max(0.42, child.material.roughness ?? 0.55);
              child.material.metalness = Math.min(0.12, child.material.metalness ?? 0.05);
            }
          }
        });

        this.scene.add(this.model);

        // 5. Setup Animation Mixer with all 13 clips
        const animations = gltf.animations || [];
        if (animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);

          ANIMATIONS.forEach((animDef) => {
            const clip = animations.find(c => {
              const name = c.name.toLowerCase();
              if (animDef.key === 'walking') {
                return name.includes('walking') && !name.includes('woman');
              }
              if (animDef.key === 'attack') {
                return name.includes('attack') && !name.includes('triple');
              }
              if (animDef.key === 'running') {
                return name.includes('running');
              }
              return name.includes(animDef.key);
            });

            if (clip) {
              const action = this.mixer.clipAction(clip);
              this.actionsMap.set(animDef.id, action);
            }
          });

          // Play default starting animation (Boom Dance)
          this.playAnimationByIndex(this.currentAnimIndex, 0.1);
        }

        this.isLoaded = true;
        if (loadingOverlay) loadingOverlay.classList.add('hidden');

        // Generate crisp 3D thumbnail for Tamagotchi avatar card
        setTimeout(() => {
          try {
            const pfpImg = document.getElementById('tamaPfpImg');
            if (pfpImg && this.renderer && this.scene && this.camera) {
              this.renderer.render(this.scene, this.camera);
              const shot = this.renderer.domElement.toDataURL('image/jpeg', 0.9);
              if (shot && shot.length > 500) {
                pfpImg.src = shot;
              }
            }
          } catch (_) {}
        }, 500);
      },
      (xhr) => {
        if (xhr.lengthComputable && progressText) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          progressText.textContent = `Tuning Cozy Shiba Buddy 3D (${pct}%)`;
        }
      },
      (err) => {
        console.error('Failed to load Cozy Shiba GLB:', err);
        if (progressText) {
          progressText.textContent = 'Failed to load 3D model. Check network connection.';
        }
      }
    );
  }

  playAnimationByIndex(index, duration = 0.32) {
    if (index < 0 || index >= ANIMATIONS.length) return;
    const animDef = ANIMATIONS[index];
    const nextAction = this.actionsMap.get(animDef.id);
    if (!nextAction) return;

    if (this.currentAction && this.currentAction !== nextAction) {
      nextAction.reset();
      nextAction.setEffectiveTimeScale(this.playbackSpeed);
      nextAction.setEffectiveWeight(1);
      nextAction.crossFadeFrom(this.currentAction, duration, true);
      nextAction.play();
    } else if (!this.currentAction) {
      nextAction.reset();
      nextAction.setEffectiveTimeScale(this.playbackSpeed);
      nextAction.setEffectiveWeight(1);
      nextAction.play();
    }

    this.currentAction = nextAction;
    this.currentAnimIndex = index;
    this.updateOSD(animDef);
    this.updateActiveChannelButton(animDef.id);
  }

  updateOSD(animDef) {
    const chNum = document.getElementById('osdChannelNumber');
    const chTitle = document.getElementById('osdChannelTitle');
    const chEnergy = document.getElementById('osdEnergy');
    const statusMsg = document.getElementById('osdStatusMsg');
    const hwChText = document.getElementById('hwCurrentChannelText');

    if (chNum) chNum.textContent = `CH ${animDef.ch}`;
    if (chTitle) chTitle.textContent = animDef.title.toUpperCase();
    if (chEnergy) chEnergy.textContent = `${animDef.tag} &bull; ${animDef.energy}`;
    if (hwChText) hwChText.textContent = `CH ${animDef.ch}`;
    if (statusMsg) {
      statusMsg.textContent = `MOOD: ${animDef.mood.toUpperCase()} &bull; CRUMBS: ${this.vitals.crumbsGiven}`;
    }
  }

  updateActiveChannelButton(activeId) {
    document.querySelectorAll('.channel-btn-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.animId === activeId);
    });
  }

  renderChannelsGrid() {
    const grid = document.getElementById('shibaChannelsGrid');
    if (!grid) return;

    grid.innerHTML = ANIMATIONS.map((anim, idx) => `
      <button type="button" class="channel-btn-item ${idx === this.currentAnimIndex ? 'active' : ''}" data-anim-id="${anim.id}" data-anim-idx="${idx}">
        <div class="ch-badge">CH ${anim.ch}</div>
        <div class="ch-info">
          <strong class="ch-title">${anim.title}</strong>
          <span class="ch-tag">${anim.tag}</span>
        </div>
      </button>
    `).join('');

    grid.querySelectorAll('.channel-btn-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.animIdx, 10);
        this.playAnimationByIndex(idx);
        playClickSound();
      });
    });
  }

  spawnReactionParticle(text = 'CRUMB +1', className = 'crumb-fx') {
    const container = document.getElementById('osdParticlesContainer');
    if (!container) return;

    const particle = document.createElement('div');
    particle.className = `osd-reaction-particle ${className}`;
    particle.textContent = text;
    particle.style.left = `${35 + Math.random() * 30}%`;
    particle.style.top = `${45 + Math.random() * 15}%`;

    container.appendChild(particle);
    setTimeout(() => particle.remove(), 1200);
  }

  bindDOM() {
    // Next Channel Dial Knob
    const nextBtn = document.getElementById('tvNextChannelBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const nextIdx = (this.currentAnimIndex + 1) % ANIMATIONS.length;
        this.playAnimationByIndex(nextIdx);
        playClickSound();

        // Subtle rotate animation on knob
        nextBtn.style.transform = `rotate(${(nextIdx + 1) * 27.6}deg)`;
      });
    }

    // Turntable 360 Spin Toggle
    const turntableBtn = document.getElementById('tvTurntableBtn');
    if (turntableBtn) {
      turntableBtn.addEventListener('click', () => {
        this.autoRotate = !this.autoRotate;
        if (this.controls) this.controls.autoRotate = this.autoRotate;
        turntableBtn.classList.toggle('active', this.autoRotate);
        playClickSound();
      });
    }

    // Reset Camera Button
    const resetCamBtn = document.getElementById('tvResetCamBtn');
    if (resetCamBtn) {
      resetCamBtn.addEventListener('click', () => {
        if (this.camera && this.controls) {
          this.camera.position.set(0, 1.05, 3.8);
          this.controls.target.set(0, 0.65, 0);
          this.controls.update();
        }
        playClickSound();
      });
    }

    // Zoom Controls
    const zoomInBtn = document.getElementById('tvZoomInBtn');
    const zoomOutBtn = document.getElementById('tvZoomOutBtn');
    const zoomFitBtn = document.getElementById('tvZoomFitBtn');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        if (!this.camera || !this.controls) return;
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
        const currentDist = this.camera.position.distanceTo(this.controls.target);
        const newDist = Math.max(this.controls.minDistance, currentDist - 0.45);
        this.camera.position.copy(this.controls.target).addScaledVector(dir, newDist);
        this.controls.update();
        playClickSound();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        if (!this.camera || !this.controls) return;
        const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target).normalize();
        const currentDist = this.camera.position.distanceTo(this.controls.target);
        const newDist = Math.min(this.controls.maxDistance, currentDist + 0.45);
        this.camera.position.copy(this.controls.target).addScaledVector(dir, newDist);
        this.controls.update();
        playClickSound();
      });
    }

    if (zoomFitBtn) {
      zoomFitBtn.addEventListener('click', () => {
        if (!this.camera || !this.controls) return;
        this.camera.position.set(0, 1.05, 3.8);
        this.controls.target.set(0, 0.65, 0);
        this.controls.update();
        playClickSound();
      });
    }

    // Speed Pills
    document.querySelectorAll('.speed-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.speed-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const spd = parseFloat(pill.dataset.speed || '1.0');
        this.playbackSpeed = spd;
        if (this.currentAction) {
          this.currentAction.setEffectiveTimeScale(spd);
        }
        playClickSound();
      });
    });

    // Snapshot Photo Button
    const snapshotBtn = document.getElementById('tvSnapshotBtn');
    if (snapshotBtn) {
      snapshotBtn.addEventListener('click', () => {
        if (!this.canvas) return;
        const link = document.createElement('a');
        const currentAnim = ANIMATIONS[this.currentAnimIndex];
        link.download = `cozy-shiba-${currentAnim.id}-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
        playHappySound();
      });
    }

    // Tamagotchi Action: Feed Bwed Crumb
    const feedBtn = document.getElementById('tamaFeedBtn');
    if (feedBtn) {
      feedBtn.addEventListener('click', () => {
        this.vitals.crumbsGiven++;
        this.vitals.fullness = Math.min(100, this.vitals.fullness + 10);
        this.vitals.happiness = Math.min(100, this.vitals.happiness + 5);
        this.updateVitalsUI();

        // Trigger Happy Nod animation
        const agreeIdx = ANIMATIONS.findIndex(a => a.id === 'agree');
        if (agreeIdx !== -1) this.playAnimationByIndex(agreeIdx);

        this.spawnReactionParticle('DELICIOUS CRUMB +1', 'crumb-fx');
        playHappySound();
      });
    }

    // Tamagotchi Action: Pet Head
    const petBtn = document.getElementById('tamaPetBtn');
    if (petBtn) {
      petBtn.addEventListener('click', () => {
        this.vitals.petsGiven++;
        this.vitals.happiness = 100;
        this.updateVitalsUI();

        // Trigger Happy Nod or Alert
        const targetIdx = ANIMATIONS.findIndex(a => a.id === 'agree');
        if (targetIdx !== -1) this.playAnimationByIndex(targetIdx);

        this.spawnReactionParticle('PATTED ON HEAD +1', 'pet-fx');
        playHappySound();
      });
    }

    // Tamagotchi Action: Dance Party
    const discoBtn = document.getElementById('tamaDiscoBtn');
    if (discoBtn) {
      discoBtn.addEventListener('click', () => {
        const danceIdx = (this.currentAnimIndex === 2) ? 3 : 2; // Toggle between Boom and All-Night
        this.playAnimationByIndex(danceIdx);
        this.spawnReactionParticle('DISCO GROOVE', 'dance-fx');
        playHappySound();
      });
    }
  }

  updateVitalsUI() {
    const barHappy = document.getElementById('vitalHappiness');
    const barHunger = document.getElementById('vitalHunger');
    const barEnergy = document.getElementById('vitalEnergy');
    const valHappy = document.getElementById('valHappiness');
    const valHunger = document.getElementById('valHunger');
    const valEnergy = document.getElementById('valEnergy');

    if (barHappy) barHappy.style.width = `${this.vitals.happiness}%`;
    if (barHunger) barHunger.style.width = `${this.vitals.fullness}%`;
    if (barEnergy) barEnergy.style.width = `${this.vitals.energy}%`;

    if (valHappy) valHappy.textContent = `${this.vitals.happiness}%`;
    if (valHunger) valHunger.textContent = `${this.vitals.fullness}%`;
    if (valEnergy) valEnergy.textContent = `${this.vitals.energy}%`;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    if (this.mixer) {
      this.mixer.update(delta);
    }

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ShibaTamagotchiTV());
} else {
  new ShibaTamagotchiTV();
}
