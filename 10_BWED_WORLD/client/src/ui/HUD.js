/* ==========================================================================
   GESTIONNAIRE DE L'INTERFACE 2D (HUD) — BWED WORLD
   Overlays HTML légers, indicateur multijoueur et contrôles d'identité
   ========================================================================== */

export class HUD {
  constructor(options = {}) {
    this.playerName = options.playerName || 'Mitron';
    this.playerCount = 1;
    this.onNameChange = options.onNameChange || null;

    this.dom = {
      districtName: document.getElementById('districtName'),
      playerCountBadge: document.getElementById('playerCountBadge'),
      playerNameInput: document.getElementById('playerNameInput'),
      changeNameBtn: document.getElementById('changeNameBtn'),
      nameModal: document.getElementById('nameModal'),
      saveNameBtn: document.getElementById('saveNameBtn'),
      cancelNameBtn: document.getElementById('cancelNameBtn'),
      currentPlayerName: document.getElementById('currentPlayerName')
    };

    this.bindEvents();
    this.updatePlayerCount(1);
    this.setPlayerName(this.playerName);
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

  updatePlayerCount(count) {
    this.playerCount = Math.max(1, count);
    if (this.dom.playerCountBadge) {
      const s = this.playerCount > 1 ? 's' : '';
      this.dom.playerCountBadge.textContent = `${this.playerCount} joueur${s} dans le village`;
    }
  }

  bindEvents() {
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
  }
}
