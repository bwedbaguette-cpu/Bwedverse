import { CONFIG } from '../config.js';

/* ==========================================================================
   GESTIONNAIRE DE L'INTERFACE 2D (HUD) — BWED WORLD
   Overlays HTML légers, indicateur multijoueur, sélecteur des 18 pions
   et indicateur dynamique de district en temps réel
   ========================================================================== */

export class HUD {
  constructor(options = {}) {
    this.playerName = options.playerName || 'Chef Émile';
    this.currentAvatarId = options.currentAvatarId || 'tiny-baker';
    this.playerCount = 1;

    this.onNameChange = options.onNameChange || null;
    this.onAvatarChange = options.onAvatarChange || null;

    this.dom = {
      districtKicker: document.getElementById('districtKicker'),
      districtName: document.getElementById('districtName'),
      playerCountBadge: document.getElementById('playerCountBadge'),
      playerNameInput: document.getElementById('playerNameInput'),
      changeNameBtn: document.getElementById('changeNameBtn'),
      nameModal: document.getElementById('nameModal'),
      saveNameBtn: document.getElementById('saveNameBtn'),
      cancelNameBtn: document.getElementById('cancelNameBtn'),
      currentPlayerName: document.getElementById('currentPlayerName'),

      // Garde-robe
      changeAvatarBtn: document.getElementById('changeAvatarBtn'),
      currentAvatarName: document.getElementById('currentAvatarName'),
      wardrobeModal: document.getElementById('wardrobeModal'),
      closeWardrobeBtn: document.getElementById('closeWardrobeBtn'),
      wardrobeGrid: document.getElementById('wardrobeGrid')
    };

    this.initWardrobeGrid();
    this.bindEvents();
    this.updatePlayerCount(1);
    this.setPlayerName(this.playerName);
    this.setAvatar(this.currentAvatarId);
  }

  setPlayerName(name) {
    this.playerName = name;
    if (this.dom.currentPlayerName) {
      this.dom.currentPlayerName.textContent = name;
    }
    if (this.dom.playerNameInput) {
      this.dom.playerNameInput.value = name;
    }
  }

  setAvatar(avatarId) {
    this.currentAvatarId = avatarId;
    const def = CONFIG.avatars[avatarId] || CONFIG.avatars['tiny-baker'];
    if (this.dom.currentAvatarName && def) {
      this.dom.currentAvatarName.textContent = def.name;
    }

    // Mise à jour visuelle des cartes actives
    if (this.dom.wardrobeGrid) {
      const cards = this.dom.wardrobeGrid.querySelectorAll('.pawn-card');
      cards.forEach((card) => {
        if (card.dataset.avatarId === avatarId) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
  }

  setDistrict(kicker, name) {
    if (this.dom.districtKicker && kicker) {
      this.dom.districtKicker.innerHTML = kicker;
    }
    if (this.dom.districtName && name) {
      this.dom.districtName.textContent = name;
    }
  }

  updatePlayerCount(count) {
    this.playerCount = Math.max(1, count);
    if (this.dom.playerCountBadge) {
      const s = this.playerCount > 1 ? 's' : '';
      this.dom.playerCountBadge.textContent = `${this.playerCount} joueur${s} dans le village`;
    }
  }

  initWardrobeGrid() {
    if (!this.dom.wardrobeGrid) return;
    this.dom.wardrobeGrid.innerHTML = '';

    Object.values(CONFIG.avatars).forEach((avatar) => {
      const card = document.createElement('div');
      card.className = `pawn-card ${avatar.id === this.currentAvatarId ? 'active' : ''}`;
      card.dataset.avatarId = avatar.id;
      card.title = `${avatar.name} — ${avatar.role}`;

      card.innerHTML = `
        <img class="pawn-card-thumb" src="${avatar.thumb}" alt="${avatar.name}" loading="lazy" />
        <span class="pawn-card-name">${avatar.name}</span>
        <span class="pawn-card-role">${avatar.role}</span>
      `;

      card.addEventListener('click', () => {
        this.setAvatar(avatar.id);
        if (this.onAvatarChange) {
          this.onAvatarChange(avatar.id);
        }
        if (this.dom.wardrobeModal) {
          this.dom.wardrobeModal.hidden = true;
        }
      });

      this.dom.wardrobeGrid.appendChild(card);
    });
  }

  bindEvents() {
    // 1. Modale de changement de pseudo
    this.dom.changeNameBtn?.addEventListener('click', () => {
      if (this.dom.nameModal) this.dom.nameModal.hidden = false;
      this.dom.playerNameInput?.focus();
    });

    this.dom.cancelNameBtn?.addEventListener('click', () => {
      if (this.dom.nameModal) this.dom.nameModal.hidden = true;
    });

    this.dom.saveNameBtn?.addEventListener('click', () => {
      const val = this.dom.playerNameInput?.value.trim();
      if (val) {
        this.setPlayerName(val);
        if (this.onNameChange) {
          this.onNameChange(val);
        }
      }
      if (this.dom.nameModal) this.dom.nameModal.hidden = true;
    });

    this.dom.playerNameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.dom.saveNameBtn?.click();
      }
    });

    // 2. Modale de garde-robe (changement d'avatar)
    this.dom.changeAvatarBtn?.addEventListener('click', () => {
      if (this.dom.wardrobeModal) this.dom.wardrobeModal.hidden = false;
    });

    this.dom.closeWardrobeBtn?.addEventListener('click', () => {
      if (this.dom.wardrobeModal) this.dom.wardrobeModal.hidden = true;
    });

    // Fermeture avec la touche Échap
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.nameModal) this.dom.nameModal.hidden = true;
        if (this.dom.wardrobeModal) this.dom.wardrobeModal.hidden = true;
      }
    });
  }
}
