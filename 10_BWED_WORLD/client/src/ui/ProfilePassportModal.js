/* ==========================================================================
   CARTE DE PROFIL & PASSEPORT CITOYEN AAA — BWEDTOWN
   Inspiré des cartes de dresseur Pokémon & passeports Animal Crossing.
   Gestion complète de l'identité, statistiques, succès, export/import JSON.
   ========================================================================== */

import { ACHIEVEMENTS_LIST, LEVEL_TITLES } from '../core/ProfileManager.js';
import { CONFIG } from '../config.js';

export class ProfilePassportModal {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.profileManager = options.profileManager;
    this.audio = options.audio || null;
    this.onUpdateCallback = options.onUpdate || null;

    this.isOpen = false;
    this.activeTab = 'stats'; // 'stats', 'achievements', 'backup'

    this.initDOM();
  }

  initDOM() {
    this.overlayEl = document.createElement('div');
    this.overlayEl.id = 'profilePassportOverlay';
    this.overlayEl.className = 'profile-passport-overlay';
    this.overlayEl.hidden = true;

    this.overlayEl.innerHTML = `
      <div class="passport-modal-window">
        <!-- Bandeau d'en-tête du Passeport -->
        <div class="passport-header-bar">
          <div class="passport-kicker-group">
            <span class="passport-flag">🥐</span>
            <span class="passport-kicker">REPUBLIC OF BWEDTOWN &middot; CITIZEN PASSPORT</span>
          </div>
          <button class="passport-close-btn" id="passportCloseBtn" type="button" title="Close (Escape)">&times;</button>
        </div>

        <!-- Carte d'Identité Supérieure -->
        <div class="passport-id-card">
          <div class="passport-avatar-box" id="passportAvatarBox" title="Change Avatar in Wardrobe">
            <span class="avatar-large-icon" id="passportAvatarIcon">👨‍🍳</span>
            <span class="avatar-edit-badge">3D</span>
          </div>

          <div class="passport-id-info">
            <div class="passport-name-row">
              <h2 class="passport-player-name" id="passportPlayerName">Chef Emile</h2>
              <button class="passport-rename-btn" id="passportRenameBtn" type="button" title="Edit Nickname">✏️</button>
            </div>

            <div class="passport-title-badge" id="passportTitleBadge">
              <span id="passportTitleIcon">🌱</span>
              <strong id="passportTitleText">Crumb Apprentice</strong>
            </div>

            <!-- Jauge de Progression XP -->
            <div class="passport-xp-container">
              <div class="passport-xp-header">
                <span class="xp-level-pill" id="passportLevelPill">LEVEL 1</span>
                <span class="xp-numbers" id="passportXpNumbers">0 / 120 XP</span>
              </div>
              <div class="passport-xp-track">
                <div class="passport-xp-fill" id="passportXpFill" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <!-- Portefeuille du Citoyen -->
          <div class="passport-wallet-box">
            <div class="wallet-stat-card">
              <span class="wallet-icon">🥐</span>
              <div class="wallet-stat-info">
                <span class="wallet-label">Croissants</span>
                <strong class="wallet-value" id="walletCroissants">0 / 10</strong>
              </div>
            </div>
            <div class="wallet-stat-card">
              <span class="wallet-icon">🪙</span>
              <div class="wallet-stat-info">
                <span class="wallet-label">BwedCoins</span>
                <strong class="wallet-value" id="walletCoins">250</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Onglets du Passeport -->
        <div class="passport-nav-tabs">
          <button class="passport-tab active" data-tab="stats" id="tabStatsBtn" type="button">
            <span>📊</span> Adventure &amp; Stats
          </button>
          <button class="passport-tab" data-tab="achievements" id="tabAchBtn" type="button">
            <span>🏅</span> Badges &amp; Achievements
          </button>
          <button class="passport-tab" data-tab="backup" id="tabBackupBtn" type="button">
            <span>💾</span> Save &amp; Multi-Profiles
          </button>
        </div>

        <!-- Corps des Onglets -->
        <div class="passport-tab-body" id="passportTabBody">
          <!-- Sera alimenté dynamiquement -->
        </div>
      </div>
    `;

    this.container.appendChild(this.overlayEl);

    // Événements boutons
    document.getElementById('passportCloseBtn')?.addEventListener('click', () => {
      this.close();
    });

    document.getElementById('passportRenameBtn')?.addEventListener('click', () => {
      this.promptRename();
    });

    document.getElementById('passportAvatarBox')?.addEventListener('click', () => {
      this.close();
      document.getElementById('changeAvatarBtn')?.click();
    });

    // Gestion des onglets
    this.overlayEl.querySelectorAll('.passport-tab').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        this.overlayEl.querySelectorAll('.passport-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        this.activeTab = tabBtn.getAttribute('data-tab') || 'stats';
        this.renderTabBody();
        this.audio?.playStep?.();
      });
    });

    // Clic sur l'overlay pour fermer
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Raccourci Échap
    window.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.overlayEl.hidden = false;
    this.renderHeader();
    this.renderTabBody();
    this.audio?.playDialogueBeep?.();
  }

  close() {
    this.isOpen = false;
    this.overlayEl.hidden = true;
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  promptRename() {
    const current = this.profileManager.profile.nickname;
    const newName = prompt('Enter your new BwedTown citizen nickname:', current);
    if (newName && newName.trim() && newName.trim() !== current) {
      if (this.profileManager.setNickname(newName.trim())) {
        this.renderHeader();
        if (typeof this.onUpdateCallback === 'function') {
          this.onUpdateCallback(this.profileManager.profile);
        }
      }
    }
  }

  renderHeader() {
    const p = this.profileManager.profile;
    const avatarDef = CONFIG.avatars[p.avatarId] || CONFIG.avatars['tiny-baker'];

    const iconEl = document.getElementById('passportAvatarIcon');
    const nameEl = document.getElementById('passportPlayerName');
    const titleIconEl = document.getElementById('passportTitleIcon');
    const titleTextEl = document.getElementById('passportTitleText');
    const levelPillEl = document.getElementById('passportLevelPill');
    const xpNumbersEl = document.getElementById('passportXpNumbers');
    const xpFillEl = document.getElementById('passportXpFill');
    const croissantsEl = document.getElementById('walletCroissants');
    const coinsEl = document.getElementById('walletCoins');

    if (iconEl) iconEl.textContent = avatarDef?.emoji || '🥖';
    if (nameEl) nameEl.textContent = p.nickname;
    if (titleTextEl) titleTextEl.textContent = p.title || 'BwedTown Citizen';

    const lvlDef = LEVEL_TITLES.find(l => l.level === p.level);
    if (titleIconEl) titleIconEl.textContent = lvlDef?.icon || '🌱';

    if (levelPillEl) levelPillEl.textContent = `LEVEL ${p.level}`;
    if (xpNumbersEl) xpNumbersEl.textContent = `${p.xp} / ${p.xpNext} XP`;

    const prevReq = lvlDef ? lvlDef.xpReq : 0;
    const range = Math.max(1, p.xpNext - prevReq);
    const progress = Math.min(100, Math.max(0, ((p.xp - prevReq) / range) * 100));
    if (xpFillEl) xpFillEl.style.width = `${progress}%`;

    if (croissantsEl) croissantsEl.textContent = `${p.croissantsCollectedIds.length} / 10`;
    if (coinsEl) coinsEl.textContent = `${p.bwedCoins}`;
  }

  renderTabBody() {
    const body = document.getElementById('passportTabBody');
    if (!body) return;

    const p = this.profileManager.profile;

    if (this.activeTab === 'stats') {
      const arrivedDate = new Date(p.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      body.innerHTML = `
        <div class="passport-stats-grid">
          <div class="passport-stat-tile">
            <span class="stat-icon">👣</span>
            <div class="stat-val">${p.stepsWalked}</div>
            <div class="stat-sub">Tiles Explored</div>
          </div>
          <div class="passport-stat-tile">
            <span class="stat-icon">🥐</span>
            <div class="stat-val">${p.croissantsCollectedIds.length} / 10</div>
            <div class="stat-sub">Croissants Found</div>
          </div>
          <div class="passport-stat-tile">
            <span class="stat-icon">🛋️</span>
            <div class="stat-val">${p.furniturePlacedCount}</div>
            <div class="stat-sub">Furniture Placed</div>
          </div>
          <div class="passport-stat-tile">
            <span class="stat-icon">💬</span>
            <div class="stat-val">${p.messagesSent}</div>
            <div class="stat-sub">Bubbles Sent</div>
          </div>
        </div>

        <div class="passport-card-box">
          <div class="box-title">🏆 Official Badges &amp; Decorations</div>
          <div class="passport-badges-row">
            ${p.badges.map(b => `
              <div class="passport-badge-chip" title="${b.desc || ''}">
                <span class="badge-icon">${b.icon || '⭐'}</span>
                <span class="badge-name">${b.name}</span>
                <span class="badge-date">${b.date}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="passport-footer-meta">
          <span>📅 Move-in Date in BwedTown : <strong>${arrivedDate}</strong></span>
          <span>🆔 Citizen ID : <code>${p.id}</code></span>
        </div>
      `;
    } else if (this.activeTab === 'achievements') {
      body.innerHTML = `
        <div class="achievements-scroll-list">
          ${ACHIEVEMENTS_LIST.map(ach => {
            const isDone = !!p.completedAchievements[ach.id];
            let current = 0;
            if (ach.reqType === 'steps') current = p.stepsWalked;
            else if (ach.reqType === 'croissants') current = p.croissantsCollectedIds.length;
            else if (ach.reqType === 'chat') current = p.messagesSent;
            else if (ach.reqType === 'furniture') current = p.furniturePlacedCount;

            const progressPct = Math.min(100, Math.floor((current / ach.reqCount) * 100));

            return `
              <div class="achievement-card ${isDone ? 'completed' : ''}">
                <div class="ach-icon-box">${ach.icon}</div>
                <div class="ach-content">
                  <div class="ach-header">
                    <strong class="ach-title">${ach.name}</strong>
                    <span class="ach-status-badge ${isDone ? 'done' : ''}">${isDone ? '✅ Completed' : `${current} / ${ach.reqCount}`}</span>
                  </div>
                  <div class="ach-desc">${ach.desc}</div>
                  <div class="ach-progress-bar">
                    <div class="ach-progress-fill" style="width: ${isDone ? 100 : progressPct}%"></div>
                  </div>
                </div>
                <div class="ach-rewards">
                  <span class="ach-xp">+${ach.xp} XP</span>
                  <span class="ach-coins">+${ach.coins} 🪙</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (this.activeTab === 'backup') {
      const profiles = this.profileManager.getProfilesList();

      body.innerHTML = `
        <div class="backup-sections-wrap">
          <!-- Carte 1 : Sauvegarde Portative JSON -->
          <div class="passport-card-box">
            <div class="box-title">💾 Portable Save &amp; Data Transfer</div>
            <p class="box-desc">
              Download your complete save file (profile, inventory, room design) as a <code>.json</code> file.
              You can restore this file at any time on this device or any computer.
            </p>
            <div class="backup-actions-row">
              <button class="backup-btn primary" id="exportSaveBtn" type="button">
                <span>📥</span> <strong>Download Save (.JSON)</strong>
              </button>
              
              <label class="backup-btn secondary" for="importSaveInput">
                <span>📤</span> <strong>Restore a Save File</strong>
                <input type="file" id="importSaveInput" accept=".json" style="display: none;" />
              </label>
            </div>
          </div>

          <!-- Carte 2 : Multi-Profils sur ce Navigateur -->
          <div class="passport-card-box">
            <div class="box-title">👥 Saved Profiles on this Browser</div>
            <p class="box-desc">
              Allows multiple citizens to play on this device without overwriting each other's adventure.
            </p>
            <div class="profile-switch-list">
              ${profiles.map(prof => `
                <div class="profile-switch-item ${prof.id === p.id ? 'current' : ''}">
                  <span class="profile-item-name">👤 ${prof.name} ${prof.id === p.id ? '<span class="current-tag">(Active)</span>' : ''}</span>
                  ${prof.id !== p.id ? `<button class="switch-btn" data-switch="${prof.id}" type="button">Load</button>` : ''}
                </div>
              `).join('')}
            </div>
            <div class="new-profile-row">
              <button class="backup-btn tertiary" id="newProfileBtn" type="button">
                <span>➕</span> <strong>Create a New Citizen</strong>
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('exportSaveBtn')?.addEventListener('click', () => {
        this.profileManager.exportFullSaveJSON();
      });

      document.getElementById('importSaveInput')?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.profileManager.importFullSaveJSON(evt.target.result);
          };
          reader.readAsText(file);
        }
      });

      document.getElementById('newProfileBtn')?.addEventListener('click', () => {
        const name = prompt('Name for your new citizen:');
        if (name && name.trim()) {
          this.profileManager.createNewProfile(name.trim());
        }
      });

      body.querySelectorAll('[data-switch]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-switch');
          if (targetId) this.profileManager.switchProfile(targetId);
        });
      });
    }
  }
}
