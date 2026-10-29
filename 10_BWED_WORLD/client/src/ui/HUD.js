import { CONFIG } from '../config.js';

/* ==========================================================================
   GESTIONNAIRE DE L'INTERFACE 2D (HUD) & MINI-JEUX — BWED WORLD (JALON 3)
   - Overlays HTML légers (Boulangerie, Café, Moulin, Gare)
   - Garde-robe 18 pions
   - Bulle d'interaction contextuelle
   - Contrôles de zoom
   - Salle d'arcade Mini-Jeu Bwed Catch avec chargement dynamique
   ========================================================================== */

export class HUD {
  constructor(options = {}) {
    this.playerName = options.playerName || 'Chef Émile';
    this.currentAvatarId = options.currentAvatarId || 'tiny-baker';
    this.playerCount = 1;

    this.onNameChange = options.onNameChange || null;
    this.onAvatarChange = options.onAvatarChange || null;
    this.onZoomIn = options.onZoomIn || null;
    this.onZoomOut = options.onZoomOut || null;

    // Interaction courante
    this.currentInteractionTrigger = null;
    this.activeModalId = null;

    // Mini-jeu instance
    this.activeMinigame = null;

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
      wardrobeGrid: document.getElementById('wardrobeGrid'),

      // Bulle d'interaction
      interactionPrompt: document.getElementById('interactionPrompt'),
      interactText: document.getElementById('interactText'),

      // Contrôles de zoom
      zoomInBtn: document.getElementById('zoomInBtn'),
      zoomOutBtn: document.getElementById('zoomOutBtn'),

      // Portail Mini-Jeux
      minigameModal: document.getElementById('minigameModal'),
      closeMinigameModalBtn: document.getElementById('closeMinigameModalBtn'),
      minigameLobbyView: document.getElementById('minigameLobbyView'),
      minigameActiveView: document.getElementById('minigameActiveView'),
      minigameResultView: document.getElementById('minigameResultView'),
      launchCatchGameBtn: document.getElementById('launchCatchGameBtn'),
      restartGameBtn: document.getElementById('restartGameBtn'),
      exitToHubBtn: document.getElementById('exitToHubBtn'),
      replayBtn: document.getElementById('replayBtn'),
      returnToVillageBtn: document.getElementById('returnToVillageBtn'),
      catchGameCanvas: document.getElementById('catchGameCanvas'),
      bestCatchScore: document.getElementById('bestCatchScore'),
      lastCatchScore: document.getElementById('lastCatchScore'),
      finalScoreVal: document.getElementById('finalScoreVal'),
      finalSummaryText: document.getElementById('finalSummaryText')
    };

    this.initWardrobeGrid();
    this.initScores();
    this.bindEvents();
    this.updatePlayerCount(1);
    this.setPlayerName(this.playerName);
    this.setAvatar(this.currentAvatarId);
  }

  /* --------------------------------------------------------------------------
     1. IDENTITÉ DU JOUEUR & QUARTIER
     -------------------------------------------------------------------------- */
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

  /* --------------------------------------------------------------------------
     2. GARDE-ROBE DES 18 PIONS
     -------------------------------------------------------------------------- */
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
        this.closeModal('wardrobeModal');
      });

      this.dom.wardrobeGrid.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     3. INTERACTIONS CONTEXTUELLES & OVERLAYS
     -------------------------------------------------------------------------- */
  showInteractionPrompt(label, onTrigger) {
    if (!this.dom.interactionPrompt) return;
    this.currentInteractionTrigger = onTrigger;
    if (this.dom.interactText) {
      this.dom.interactText.textContent = label;
    }
    this.dom.interactionPrompt.hidden = false;
  }

  hideInteractionPrompt() {
    if (!this.dom.interactionPrompt) return;
    this.currentInteractionTrigger = null;
    this.dom.interactionPrompt.hidden = true;
  }

  triggerCurrentInteraction() {
    if (this.currentInteractionTrigger && !this.activeModalId) {
      this.currentInteractionTrigger();
      this.hideInteractionPrompt();
    }
  }

  openModal(modalId) {
    this.closeAllModals();
    const el = document.getElementById(modalId);
    if (el) {
      el.hidden = false;
      this.activeModalId = modalId;
    }
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.hidden = true;
    }
    if (this.activeModalId === modalId) {
      this.activeModalId = null;
    }
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach((m) => {
      m.hidden = true;
    });
    this.activeModalId = null;

    if (this.activeMinigame) {
      this.activeMinigame.stop();
    }
  }

  /* --------------------------------------------------------------------------
     4. GESTION DU MINI-JEU BWED CATCH (SALLE DÉDIÉE)
     -------------------------------------------------------------------------- */
  initScores() {
    const best = localStorage.getItem('bwed_catch_best_score') || '0';
    const last = localStorage.getItem('bwed_catch_last_score') || '0';
    if (this.dom.bestCatchScore) this.dom.bestCatchScore.textContent = best;
    if (this.dom.lastCatchScore) this.dom.lastCatchScore.textContent = last;
  }

  async launchMinigame() {
    if (this.dom.minigameLobbyView) this.dom.minigameLobbyView.hidden = true;
    if (this.dom.minigameResultView) this.dom.minigameResultView.hidden = true;
    if (this.dom.minigameActiveView) this.dom.minigameActiveView.hidden = false;

    if (!this.activeMinigame) {
      // Chargement dynamique du module (lazy-load)
      const { BwedCatchGame } = await import('../minigames/BwedCatchGame.js');
      this.activeMinigame = new BwedCatchGame(this.dom.catchGameCanvas, (results) => {
        this.onMinigameOver(results);
      });
    }

    this.activeMinigame.start();
  }

  onMinigameOver(results) {
    const score = results.score || 0;
    const maxCombo = results.maxCombo || 0;

    // Enregistrement des scores
    localStorage.setItem('bwed_catch_last_score', score.toString());
    const prevBest = parseInt(localStorage.getItem('bwed_catch_best_score') || '0', 10);
    if (score > prevBest) {
      localStorage.setItem('bwed_catch_best_score', score.toString());
    }
    this.initScores();

    if (this.dom.finalScoreVal) {
      this.dom.finalScoreVal.textContent = `${score} pts`;
    }
    if (this.dom.finalSummaryText) {
      this.dom.finalSummaryText.textContent = `Combo maximum : x${maxCombo} ! Félicitations pour cette belle récolte de brioches.`;
    }

    if (this.dom.minigameActiveView) this.dom.minigameActiveView.hidden = true;
    if (this.dom.minigameResultView) this.dom.minigameResultView.hidden = false;
  }

  exitMinigameToHub() {
    if (this.activeMinigame) {
      this.activeMinigame.stop();
    }
    if (this.dom.minigameActiveView) this.dom.minigameActiveView.hidden = true;
    if (this.dom.minigameResultView) this.dom.minigameResultView.hidden = true;
    if (this.dom.minigameLobbyView) this.dom.minigameLobbyView.hidden = false;
    this.closeModal('minigameModal');
  }

  /* --------------------------------------------------------------------------
     5. ÉCOUTEURS D'ÉVÉNEMENTS
     -------------------------------------------------------------------------- */
  bindEvents() {
    // 1. Changement de pseudo
    this.dom.changeNameBtn?.addEventListener('click', () => {
      this.openModal('nameModal');
      this.dom.playerNameInput?.focus();
    });

    this.dom.cancelNameBtn?.addEventListener('click', () => {
      this.closeModal('nameModal');
    });

    this.dom.saveNameBtn?.addEventListener('click', () => {
      const val = this.dom.playerNameInput?.value.trim();
      if (val) {
        this.setPlayerName(val);
        if (this.onNameChange) {
          this.onNameChange(val);
        }
      }
      this.closeModal('nameModal');
    });

    this.dom.playerNameInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.dom.saveNameBtn?.click();
      }
    });

    // 2. Garde-robe
    this.dom.changeAvatarBtn?.addEventListener('click', () => {
      this.openModal('wardrobeModal');
    });

    this.dom.closeWardrobeBtn?.addEventListener('click', () => {
      this.closeModal('wardrobeModal');
    });

    // 3. Bulle d'interaction
    this.dom.interactionPrompt?.addEventListener('click', () => {
      this.triggerCurrentInteraction();
    });

    // 4. Zoom interactif
    this.dom.zoomInBtn?.addEventListener('click', () => {
      if (this.onZoomIn) this.onZoomIn();
    });

    this.dom.zoomOutBtn?.addEventListener('click', () => {
      if (this.onZoomOut) this.onZoomOut();
    });

    // 5. Fermeture automatique des modales avec data-close-modal
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        if (modalId) {
          this.closeModal(modalId);
        }
      });
    });

    // 6. Mini-jeu d'arcade
    this.dom.launchCatchGameBtn?.addEventListener('click', () => {
      this.launchMinigame();
    });

    this.dom.restartGameBtn?.addEventListener('click', () => {
      this.launchMinigame();
    });

    this.dom.replayBtn?.addEventListener('click', () => {
      this.launchMinigame();
    });

    this.dom.exitToHubBtn?.addEventListener('click', () => {
      this.exitMinigameToHub();
    });

    this.dom.returnToVillageBtn?.addEventListener('click', () => {
      this.exitMinigameToHub();
    });

    this.dom.closeMinigameModalBtn?.addEventListener('click', () => {
      this.exitMinigameToHub();
    });

    // 7. Touches globales : Échap pour fermer, Espace pour interagir
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        // Espace déclenche l'interaction si aucune modale n'est ouverte
        if (!this.activeModalId && this.currentInteractionTrigger) {
          e.preventDefault();
          this.triggerCurrentInteraction();
        }
      }
    });
  }
}
