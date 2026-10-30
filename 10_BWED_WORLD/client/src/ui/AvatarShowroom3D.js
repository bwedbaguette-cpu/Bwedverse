import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { AvatarModel } from '../entities/AvatarModel.js';

/* ==========================================================================
   SHOWROOM D'AVATARS 3D TEMPS RÉEL — BWEDTOWN
   - Remplacement 100% 3D de la sélection d'avatars (zéro vignette 2D cassée)
   - Scène Three.js dédiée avec piédestal rotatif, ombres et éclairage chaud DS
   - Rotation interactive à la souris / toucher (Orbit Drag à 360°)
   - Test en direct des animations (Repos, Marche, Course, Danses, Combos)
   - Support complet de Cozy Shiba Buddy (13 animations) et des 22 pions Bwed
   ========================================================================== */

export class AvatarShowroom3D {
  constructor(options = {}) {
    this.modalEl = document.getElementById(options.modalId || 'wardrobeModal');
    this.currentAvatarId = options.currentAvatarId || 'tiny-baker';
    this.highlightedAvatarId = this.currentAvatarId;
    this.onSelectCallback = options.onSelect || null;
    this.audio = options.audio || null;

    this.isOpen = false;
    this.isDragging = false;
    this.previousMouseX = 0;
    this.rotVelocity = 0;
    this.pedestalRotation = 0;
    this.autoRotate = true;

    // Three.js Showroom Scene
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.pedestalGroup = null;
    this.currentAvatarModel = null;
    this.clock = new THREE.Clock();
    this.animFrameId = null;

    this.categoryFilter = 'all'; // 'all', 'rigged', 'classic'

    this.initUI();
  }

  initUI() {
    if (!this.modalEl) return;

    this.modalEl.innerHTML = `
      <div class="modal-card wardrobe-showroom-card">
        <div class="showroom-header">
          <div class="showroom-header-title">
            <span class="showroom-kicker">BWEDTOWN &middot; 3D WARDROBE</span>
            <h2 class="modal-title">Avatar &amp; 3D Companion Showroom</h2>
          </div>
          <button class="modal-close-btn" id="closeShowroomBtn" type="button" title="Close wardrobe">&times;</button>
        </div>

        <div class="showroom-body">
          <!-- Left Column: 3D Stage with Pedestal and Animation Testing -->
          <div class="showroom-stage-col">
            <div class="showroom-canvas-wrap" id="showroomCanvasWrap">
              <canvas id="showroomCanvas"></canvas>
              
              <div class="showroom-overlay-badge" id="showBadgeWrap">
                <span class="showroom-badge-tag" id="showBadgeTag">REAL-TIME 3D</span>
              </div>

              <div class="showroom-drag-hint">
                <span>🖱️ Drag to rotate 360&deg;</span>
              </div>
            </div>

            <!-- Animation preview bar -->
            <div class="showroom-anim-bar">
              <span class="anim-bar-label">Test Animation:</span>
              <div class="anim-btn-group" id="animBtnGroup">
                <button class="anim-pill-btn active" data-anim="idle" type="button">🐾 Idle</button>
                <button class="anim-pill-btn" data-anim="walk" type="button">🚶 Walk</button>
                <button class="anim-pill-btn" data-anim="run" type="button">🏃 Run</button>
                <button class="anim-pill-btn" data-anim="dance" type="button">💃 Dance</button>
                <button class="anim-pill-btn" data-anim="combo" type="button">⚡ Combo</button>
              </div>
            </div>
          </div>

          <!-- Right Column: Identity Card & Avatar Picker -->
          <div class="showroom-info-col">
            <div class="avatar-profile-header">
              <div class="avatar-name-row">
                <span class="avatar-big-emoji" id="showAvatarEmoji">🐕</span>
                <div>
                  <h3 class="avatar-big-name" id="showAvatarName">Cozy Shiba Buddy</h3>
                  <div class="avatar-big-role" id="showAvatarRole">Loyal Cozy Friend &amp; Mascot</div>
                </div>
              </div>
              <p class="avatar-desc-text" id="showAvatarDesc">
                Full 3D rigged character with 13 DS animations. Your trusty friend to explore the Main Square and cozy alleys of BwedTown!
              </p>
            </div>

            <!-- Primary Validation Button -->
            <div class="showroom-select-action">
              <button class="showroom-choose-btn" id="chooseAvatarConfirmBtn" type="button">
                <span class="btn-icon">✨</span>
                <span id="chooseBtnText">CHOOSE THIS AVATAR (IN-GAME)</span>
              </button>
              <div class="chosen-status-hint" id="chosenStatusHint" hidden>
                ✅ Avatar currently equipped in town!
              </div>
            </div>

            <!-- Filters & Quick Nav Arrows -->
            <div class="showroom-filter-bar">
              <div class="showroom-category-tabs">
                <button class="cat-tab active" data-cat="all" type="button">All (23)</button>
                <button class="cat-tab" data-cat="rigged" type="button">🐕 3D Rigged</button>
                <button class="cat-tab" data-cat="classic" type="button">🍞 Bwed Pawns</button>
              </div>

              <div class="showroom-nav-arrows">
                <button class="arrow-btn" id="prevAvatarBtn" type="button" title="Previous (&larr;)">&larr;</button>
                <button class="arrow-btn" id="nextAvatarBtn" type="button" title="Next (&rarr;)">&rarr;</button>
              </div>
            </div>

            <!-- Avatar List with Pure 3D Tiles -->
            <div class="showroom-avatar-list" id="showroomAvatarList"></div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('closeShowroomBtn')?.addEventListener('click', () => {
      this.close();
    });

    document.getElementById('chooseAvatarConfirmBtn')?.addEventListener('click', () => {
      this.confirmSelection();
    });

    document.getElementById('prevAvatarBtn')?.addEventListener('click', () => {
      this.stepAvatar(-1);
    });

    document.getElementById('nextAvatarBtn')?.addEventListener('click', () => {
      this.stepAvatar(1);
    });

    // Filtres de catégories
    this.modalEl.querySelectorAll('.cat-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.modalEl.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.categoryFilter = tab.getAttribute('data-cat') || 'all';
        this.renderAvatarList();
      });
    });

    // Boutons d'animations
    this.modalEl.querySelectorAll('.anim-pill-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.modalEl.querySelectorAll('.anim-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const animType = btn.getAttribute('data-anim');
        this.triggerAnimation(animType);
      });
    });

    this.initThreeStage();
    this.renderAvatarList();
  }

  initThreeStage() {
    const wrap = document.getElementById('showroomCanvasWrap');
    const canvas = document.getElementById('showroomCanvas');
    if (!wrap || !canvas) return;

    const width = wrap.clientWidth || 380;
    const height = wrap.clientHeight || 380;

    // 1. Scène
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x190f0a);

    // 2. Caméra
    this.camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    this.camera.position.set(0, 1.35, 4.2);
    this.camera.lookAt(0, 0.95, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Éclairage Studio Doux & Chaleureux (DS Style)
    const ambientLight = new THREE.AmbientLight(0xfff0dd, 1.4);
    this.scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeed6, 2.2);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.2);
    rimLight.position.set(-3, 3, -2);
    this.scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xffd15a, 0.9, 10);
    fillLight.position.set(0, 0.2, 2.5);
    this.scene.add(fillLight);

    // 5. Piédestal 3D avec bordure dorée et ombre de contact
    this.pedestalGroup = new THREE.Group();
    this.scene.add(this.pedestalGroup);

    // Base cylindrique
    const cylinderGeo = new THREE.CylinderGeometry(1.4, 1.5, 0.18, 48);
    const cylinderMat = new THREE.MeshStandardMaterial({
      color: 0x2e180d,
      roughness: 0.45,
      metalness: 0.15
    });
    const baseMesh = new THREE.Mesh(cylinderGeo, cylinderMat);
    baseMesh.position.y = -0.09;
    baseMesh.receiveShadow = true;
    this.pedestalGroup.add(baseMesh);

    // Anneau doré décoratif
    const ringGeo = new THREE.TorusGeometry(1.42, 0.045, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf3c270,
      roughness: 0.25,
      metalness: 0.8
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.01;
    this.pedestalGroup.add(ringMesh);

    // Ombre circulaire au sol
    const shadowGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a0502,
      transparent: true,
      opacity: 0.65
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.19;
    this.scene.add(shadowMesh);

    // Étoiles / Particules douces autour du piédestal
    this.initSparkles();

    // 6. Gestion du Drag / Rotation à la souris et au toucher
    this.initDragControls(canvas);

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!this.isOpen) return;
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (w > 0 && h > 0) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    });
    ro.observe(wrap);
  }

  initSparkles() {
    const particleCount = 28;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.9;
      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.1 + Math.random() * 1.8;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffe082,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.sparklesMesh = new THREE.Points(geo, mat);
    this.scene.add(this.sparklesMesh);
  }

  initDragControls(canvas) {
    const onStart = (clientX) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMouseX = clientX;
      this.rotVelocity = 0;
    };

    const onMove = (clientX) => {
      if (!this.isDragging) return;
      const deltaX = clientX - this.previousMouseX;
      this.previousMouseX = clientX;
      this.rotVelocity = deltaX * 0.009;
      this.pedestalRotation += this.rotVelocity;
    };

    const onEnd = () => {
      this.isDragging = false;
      setTimeout(() => {
        if (!this.isDragging) this.autoRotate = true;
      }, 2500);
    };

    canvas.addEventListener('mousedown', (e) => onStart(e.clientX));
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) onStart(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) onMove(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', onEnd);
  }

  open(initialAvatarId) {
    if (initialAvatarId && CONFIG.avatars[initialAvatarId]) {
      this.highlightedAvatarId = initialAvatarId;
      this.currentAvatarId = initialAvatarId;
    }

    if (this.modalEl) {
      this.modalEl.hidden = false;
    }

    this.isOpen = true;
    this.clock.start();

    // Redimensionnement du canvas
    setTimeout(() => {
      const wrap = document.getElementById('showroomCanvasWrap');
      if (wrap && this.renderer && this.camera) {
        const w = wrap.clientWidth;
        const h = wrap.clientHeight;
        if (w > 0 && h > 0) {
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h);
        }
      }
    }, 60);

    this.loadHighlightedAvatar();
    this.renderAvatarList();
    this.startLoop();
  }

  close() {
    if (this.modalEl) {
      this.modalEl.hidden = true;
    }
    this.isOpen = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  stepAvatar(direction) {
    const list = this.getFilteredAvatars();
    if (list.length === 0) return;

    let index = list.findIndex(a => a.id === this.highlightedAvatarId);
    if (index === -1) index = 0;

    index = (index + direction + list.length) % list.length;
    this.highlightAvatar(list[index].id);
  }

  getFilteredAvatars() {
    const all = Object.values(CONFIG.avatars);
    if (this.categoryFilter === 'rigged') {
      return all.filter(a => a.isAnimatedRig || a.id === 'cozy-shiba');
    }
    if (this.categoryFilter === 'classic') {
      return all.filter(a => !a.isAnimatedRig && a.id !== 'cozy-shiba');
    }
    return all;
  }

  highlightAvatar(avatarId) {
    if (!CONFIG.avatars[avatarId]) return;
    this.highlightedAvatarId = avatarId;
    this.audio?.playStep?.();

    this.loadHighlightedAvatar();
    this.renderAvatarList();
    this.updateProfileUI();
  }

  loadHighlightedAvatar() {
    const def = CONFIG.avatars[this.highlightedAvatarId] || CONFIG.avatars['tiny-baker'];
    if (!def) return;

    // Retrait de l'ancien modèle du piédestal
    if (this.currentAvatarModel) {
      this.pedestalGroup.remove(this.currentAvatarModel.rootGroup);
    }

    // Instanciation du nouveau modèle
    this.currentAvatarModel = new AvatarModel(def.id);
    this.pedestalGroup.add(this.currentAvatarModel.rootGroup);

    this.updateProfileUI();

    // Reset du bouton d'animation sur 'idle'
    this.modalEl.querySelectorAll('.anim-pill-btn').forEach(b => b.classList.remove('active'));
    this.modalEl.querySelector('[data-anim="idle"]')?.classList.add('active');
  }

  updateProfileUI() {
    const def = CONFIG.avatars[this.highlightedAvatarId] || CONFIG.avatars['tiny-baker'];
    if (!def) return;

    const emojiEl = document.getElementById('showAvatarEmoji');
    const nameEl = document.getElementById('showAvatarName');
    const roleEl = document.getElementById('showAvatarRole');
    const descEl = document.getElementById('showAvatarDesc');
    const badgeWrap = document.getElementById('showBadgeWrap');
    const badgeTag = document.getElementById('showBadgeTag');
    const chooseBtnText = document.getElementById('chooseBtnText');
    const chosenStatusHint = document.getElementById('chosenStatusHint');

    if (emojiEl) emojiEl.textContent = def.emoji || '🥖';
    if (nameEl) nameEl.textContent = def.name;
    if (roleEl) roleEl.textContent = def.role || 'Bwed Pawn';
    if (descEl) {
      descEl.textContent = def.desc || `Ready 3D avatar for exploring BwedTown. Polished Pokémon DS isometric diorama style.`;
    }

    if (badgeWrap && badgeTag) {
      if (def.isAnimatedRig || def.id === 'cozy-shiba') {
        badgeTag.textContent = '🐕 3D RIGGED & ANIMATED (13 CLIPS)';
        badgeWrap.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      } else {
        badgeTag.textContent = '🥖 RETRO 3D BWED PAWN';
        badgeWrap.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      }
    }

    const isCurrent = this.highlightedAvatarId === this.currentAvatarId;
    if (chooseBtnText) {
      chooseBtnText.textContent = isCurrent ? 'AVATAR ALREADY EQUIPPED' : '✨ CHOOSE THIS AVATAR (IN-GAME) ✨';
    }
    if (chosenStatusHint) {
      chosenStatusHint.hidden = !isCurrent;
    }
  }

  triggerAnimation(type) {
    if (!this.currentAvatarModel) return;
    this.previewMode = type;

    if (this.currentAvatarModel.mixer) {
      if (type === 'idle') {
        this.currentAvatarModel.isPlayingSpecial = false;
        if (this.currentAvatarModel.idleClip) {
          this.currentAvatarModel.mixer.stopAllAction();
          this.currentAvatarModel.mixer.clipAction(this.currentAvatarModel.idleClip).play();
        }
      } else if (type === 'walk') {
        this.currentAvatarModel.playSpecialAction('walk', 5.0);
      } else if (type === 'run') {
        this.currentAvatarModel.playSpecialAction('run', 5.0);
      } else if (type === 'dance') {
        const ok = this.currentAvatarModel.playSpecialAction('dance', 6.0);
        if (!ok) this.currentAvatarModel.playSpecialAction('walk', 3.0);
      } else if (type === 'combo') {
        const ok = this.currentAvatarModel.playSpecialAction('attack', 4.0) || this.currentAvatarModel.playSpecialAction('skill', 4.0);
        if (!ok) this.currentAvatarModel.playSpecialAction('run', 3.0);
      }
    }
  }

  renderAvatarList() {
    const listEl = document.getElementById('showroomAvatarList');
    if (!listEl) return;

    listEl.innerHTML = '';
    const avatars = this.getFilteredAvatars();

    for (const av of avatars) {
      const isHighlighted = av.id === this.highlightedAvatarId;
      const isEquipped = av.id === this.currentAvatarId;

      const card = document.createElement('div');
      card.className = `showroom-list-item ${isHighlighted ? 'active' : ''} ${isEquipped ? 'equipped' : ''}`;
      
      const badgeHtml = av.isAnimatedRig || av.id === 'cozy-shiba'
        ? `<span class="list-item-badge rigged">Rigged 3D</span>`
        : `<span class="list-item-badge">Pawn</span>`;

      card.innerHTML = `
        <div class="list-item-icon-box">${av.emoji || '🥖'}</div>
        <div class="list-item-info">
          <strong class="list-item-name">${av.name}</strong>
          <span class="list-item-role">${av.role || 'Bwed Pawn'}</span>
        </div>
        ${badgeHtml}
      `;

      card.addEventListener('click', () => {
        this.highlightAvatar(av.id);
      });

      listEl.appendChild(card);
    }
  }

  confirmSelection() {
    const chosenId = this.highlightedAvatarId;
    this.currentAvatarId = chosenId;
    localStorage.setItem('bwed_world_avatar', chosenId);

    // Audio chime joyeux
    this.audio?.playCoinCollect?.();

    if (this.onSelectCallback) {
      this.onSelectCallback(chosenId);
    }

    const btn = document.getElementById('chooseAvatarConfirmBtn');
    if (btn) {
      btn.classList.add('confirmed');
      btn.innerHTML = `<span>🎉 AVATAR EQUIPPED SUCCESSFULLY!</span>`;
    }

    setTimeout(() => {
      this.close();
      if (btn) {
        btn.classList.remove('confirmed');
        btn.innerHTML = `<span class="btn-icon">✨</span><span id="chooseBtnText">CHOOSE THIS AVATAR (IN-GAME)</span>`;
      }
    }, 450);
  }

  startLoop() {
    const frameInterval = 1000 / 30; // 30 FPS max
    let lastTime = performance.now();

    const loop = (now = performance.now()) => {
      if (!this.isOpen) return;
      this.animFrameId = requestAnimationFrame(loop);

      if (document.hidden) return; // 0% GPU load when tab is hidden

      const elapsed = now - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = now - (elapsed % frameInterval);

      const delta = Math.min(this.clock.getDelta(), 0.1);

      // Inertie de rotation du piédestal
      if (!this.isDragging) {
        if (this.autoRotate) {
          this.pedestalRotation += delta * 0.45;
        } else {
          this.pedestalRotation += this.rotVelocity;
          this.rotVelocity *= 0.92;
        }
      }

      if (this.pedestalGroup) {
        this.pedestalGroup.rotation.y = this.pedestalRotation;
      }

      // Mise à jour de l'animation de l'avatar (repos, marche, course, danse)
      if (this.currentAvatarModel) {
        this.currentAvatarModel.updateAnimation(delta, this.previewMode || 'idle', 0);
      }

      // Rotation douce des étoiles / sparkles
      if (this.sparklesMesh) {
        this.sparklesMesh.rotation.y += delta * 0.15;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    loop();
  }
}
