import * as THREE from 'three';

/* ==========================================================================
   GESTIONNAIRE D'EMOTES & RÉACTIONS 3D — BWED WORLD
   - Roue d'emotes kawaii et raccourci clavier (E)
   - Badges 3D vectoriels géométriques sans aucun emoji
   - Animations procédurales (Spin, Hop, Wave, Heart)
   - Synchronisation réseau multi-joueurs en temps réel
   ========================================================================== */

export class EmoteManager {
  constructor(options = {}) {
    this.camera = options.camera;
    this.localPlayer = options.localPlayer;
    this.remotePlayers = options.remotePlayers;
    this.network = options.network;

    this.emotes = [
      { id: 'wave', label: 'Wave', color: '#ffd15a', anim: 'wave', symbol: 'WAVE' },
      { id: 'dance', label: 'Spin Dance', color: '#38bdf8', anim: 'spin', symbol: 'SPIN' },
      { id: 'cheer', label: 'Cheer Jump', color: '#4ade80', anim: 'jump', symbol: 'STAR' },
      { id: 'heart', label: 'Love', color: '#f43f5e', anim: 'love', symbol: 'HEART' },
      { id: 'laugh', label: 'Laugh', color: '#facc15', anim: 'laugh', symbol: 'JOY' },
      { id: 'think', label: 'Think', color: '#c084fc', anim: 'think', symbol: 'IDEA' }
    ];

    this.activeBadges = [];

    this.dom = {
      emoteBtn: document.getElementById('openEmotesBtn'),
      emoteModal: document.getElementById('emoteModal'),
      emoteWheel: document.getElementById('emoteWheelGrid'),
      bubblesLayer: document.getElementById('chatBubblesLayer')
    };

    this.initEvents();
  }

  setCamera(camera) {
    this.camera = camera;
  }

  initEvents() {
    this.dom.emoteBtn?.addEventListener('click', () => {
      this.toggleEmoteModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'e' || e.key === 'E') {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          e.preventDefault();
          this.toggleEmoteModal();
        }
      }
    });

    this.buildEmoteWheel();
  }

  toggleEmoteModal() {
    if (!this.dom.emoteModal) return;
    this.dom.emoteModal.hidden = !this.dom.emoteModal.hidden;
  }

  closeEmoteModal() {
    if (this.dom.emoteModal) {
      this.dom.emoteModal.hidden = true;
    }
  }

  buildEmoteWheel() {
    if (!this.dom.emoteWheel) return;
    this.dom.emoteWheel.innerHTML = '';

    this.emotes.forEach((em) => {
      const card = document.createElement('button');
      card.className = 'emote-card-btn';
      card.type = 'button';
      card.innerHTML = `
        <span class="emote-badge-tag" style="border-color:${em.color}; color:${em.color}">${em.symbol}</span>
        <span class="emote-label">${em.label}</span>
      `;

      card.addEventListener('click', () => {
        this.triggerLocalEmote(em.id);
        this.closeEmoteModal();
      });

      this.dom.emoteWheel.appendChild(card);
    });
  }

  triggerLocalEmote(emoteId) {
    const emoteDef = this.emotes.find((e) => e.id === emoteId);
    if (!emoteDef) return;

    // Animation locale du joueur
    this.applyEmoteAnimation(this.localPlayer, emoteDef.anim);

    // Bulle/Badge au-dessus de notre tête
    this.spawnEmoteBadge(this.localPlayer.avatar.rootGroup, emoteDef);

    // Diffusion réseau
    if (this.network) {
      this.network.send({
        type: 'EMOTE',
        id: this.localPlayer.id,
        emoteId: emoteDef.id,
        ts: Date.now()
      });
    }
  }

  handleRemoteEmote(data) {
    const player = this.remotePlayers.get(data.id);
    if (!player) return;

    const emoteDef = this.emotes.find((e) => e.id === data.emoteId);
    if (!emoteDef) return;

    this.applyEmoteAnimation(player, emoteDef.anim);
    this.spawnEmoteBadge(player.avatar.rootGroup, emoteDef);
  }

  applyEmoteAnimation(player, animType) {
    if (!player || !player.avatar) return;

    const group = player.avatar.visualGroup;
    let elapsed = 0;
    const duration = 1.4;

    const animUpdate = (delta) => {
      elapsed += delta;
      const progress = Math.min(1.0, elapsed / duration);

      if (animType === 'spin') {
        // Rotation complète 360 avec saut
        group.rotation.y = progress * Math.PI * 4;
        group.position.y = Math.sin(progress * Math.PI) * 0.8;
      } else if (animType === 'jump') {
        // Deux petits bonds vifs
        group.position.y = Math.abs(Math.sin(progress * Math.PI * 2)) * 0.65;
        group.rotation.z = Math.sin(progress * Math.PI * 4) * 0.1;
      } else if (animType === 'wave') {
        // Dandinement doux
        group.rotation.z = Math.sin(progress * Math.PI * 6) * 0.22;
      } else if (animType === 'love') {
        // Compression / étirement kawaii
        const s = 1.0 + Math.sin(progress * Math.PI * 4) * 0.15;
        group.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
      } else {
        group.rotation.x = Math.sin(progress * Math.PI * 4) * 0.15;
      }

      if (progress < 1.0) {
        requestAnimationFrame(() => animUpdate(0.016));
      } else {
        group.rotation.set(0, 0, 0);
        group.position.set(0, 0, 0);
        group.scale.set(1, 1, 1);
      }
    };

    animUpdate(0.016);
  }

  spawnEmoteBadge(targetGroup, emoteDef) {
    if (!this.dom.bubblesLayer || !targetGroup) return;

    const el = document.createElement('div');
    el.className = 'emote-floating-badge';
    el.style.borderColor = emoteDef.color;
    el.style.color = emoteDef.color;
    el.textContent = emoteDef.symbol;

    this.dom.bubblesLayer.appendChild(el);

    this.activeBadges.push({
      element: el,
      targetGroup,
      createdAt: performance.now(),
      duration: 3200
    });
  }

  update(delta) {
    if (!this.camera || this.activeBadges.length === 0) return;

    const now = performance.now();
    const tempVec = new THREE.Vector3();
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = this.activeBadges.length - 1; i >= 0; i--) {
      const b = this.activeBadges[i];
      const age = now - b.createdAt;

      if (age >= b.duration) {
        b.element.remove();
        this.activeBadges.splice(i, 1);
        continue;
      }

      // Fade out
      if (age >= b.duration - 600) {
        b.element.style.opacity = Math.max(0, (b.duration - age) / 600).toString();
      }

      b.targetGroup.getWorldPosition(tempVec);
      tempVec.y += 2.8 + (age / b.duration) * 0.4; // Float slowly upward

      tempVec.project(this.camera);

      if (tempVec.z > 1.0) {
        b.element.style.display = 'none';
        continue;
      }

      b.element.style.display = 'flex';
      const screenX = (tempVec.x * 0.5 + 0.5) * width;
      const screenY = (-tempVec.y * 0.5 + 0.5) * height;

      b.element.style.transform = `translate(-50%, -100%) translate(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px)`;
    }
  }
}
