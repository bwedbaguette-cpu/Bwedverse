// ============================================================================
// MONOPOLY 3D — CLIENT ENTRY POINT & MASTER CONTROLLER (NATIVE ENGLISH)
// Professional UI with Bwed stickers & SVG icons, 24 characters & double showcase
// ============================================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Board3D, ALL_BWED_PAWNS, BAKERY_BUILDINGS_PROPS } from './board3D.js?v=7.4.0';
import { PawnManager } from './pawn3D.js?v=7.4.0';
import { MonopolyEngine } from './monopolyEngine.js?v=7.4.0';
import { BOARD_TILES } from '../../shared/boardData.js?v=7.4.0';
import { COLOR_GROUPS } from '../../shared/constants.js?v=7.4.0';

class MonopolyApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.clock = new THREE.Clock();

    // Roster config during lobby setup
    this.setupRoster = [
      { id: 'p1', name: 'Player 1', pawnId: 'toast-tycoon', isBot: false },
      { id: 'p2', name: 'Player 2', pawnId: 'cozy-shiba', isBot: true },
      { id: 'p3', name: 'Player 3', pawnId: 'tiny-baker', isBot: true },
      { id: 'p4', name: 'Player 4', pawnId: 'toast-bandit', isBot: true }
    ];
    this.activePlayerCount = 4;
    this.editingPawnPlayerIndex = 0;

    // Configuration multijoueur en ligne & codes de salle
    const urlParams = new URLSearchParams(window.location.search);
    this.roomCode = (urlParams.get('room') || 'BWED-77').toUpperCase();
    this.isOnlineMode = !!urlParams.get('room');
    this.onlinePeersCount = 1;

    this.initAudio();
    this.initThree();
    this.initBoard();
    this.initPawnManager();
    this.initMultiplayerSync();
    this.initInteraction();
    this.initLobbyUI();
    this.initHUDUI();
    this.animate();
  }

  // ==========================================================================
  // AUDIO & AMBIANCE
  // ==========================================================================

  initAudio() {
    this.audio = new Audio('./assets/audio/music/board-game-fever.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.3;
    this.isMuted = true;
  }

  toggleAudio() {
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('btn-audio');
    if (!this.isMuted) {
      this.audio.play().catch(() => {});
      btn.classList.add('is-active-sound');
    } else {
      this.audio.pause();
      btn.classList.remove('is-active-sound');
    }
  }

  // ==========================================================================
  // THREE.JS SCENE, CAMERA & LIGHTING
  // ==========================================================================

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x100906);
    this.scene.fog = new THREE.FogExp2(0x100906, 0.015);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 140);
    this.setCameraPreset('isometric');

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.15)); // Optimisé pour éviter la surchauffe GPU Retina
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.08;
    this.controls.minDistance = 6;
    this.controls.maxDistance = 50;
    this.controls.target.set(0, 0, 0);

    // Éclairage gourmet chaud optimisé
    const ambientLight = new THREE.AmbientLight(0xffeedd, 1.4);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaea, 2.6);
    sunLight.position.set(16, 28, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 70;
    const d = 24;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    this.scene.add(sunLight);

    const warmFill = new THREE.PointLight(0xff9944, 1.3, 45);
    warmFill.position.set(-16, 14, -16);
    this.scene.add(warmFill);

    // Lumière d'ambiance bistrot / suspension chaleureuse au-dessus du plateau
    const bistroPendant = new THREE.PointLight(0xffe6b8, 1.25, 30);
    bistroPendant.position.set(0, 13, 0);
    this.scene.add(bistroPendant);

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initBoard() {
    this.board = new Board3D(this.scene);
  }

  initPawnManager() {
    this.pawnManager = new PawnManager(this.scene, this.board);
  }

  setCameraPreset(mode) {
    if (mode === 'isometric') {
      this.camera.position.set(0, 18, 22);
      if (this.controls) this.controls.target.set(0, 0, 0);
    } else if (mode === 'follow') {
      const active = this.engine?.getActivePlayer();
      const pos = this.board.getTileWorldPosition(active ? active.position : 0);
      this.camera.position.set(pos.x, pos.y + 7.5, pos.z + 9.5);
      if (this.controls) this.controls.target.set(pos.x, pos.y, pos.z);
    } else if (mode === 'characters') {
      // Zoom cinématographique sur la vitrine des figurines (24 personnages Bwed)
      this.camera.position.set(-12.5, 5.5, -4.5);
      if (this.controls) this.controls.target.set(-12.5, 3.8, -12.5);
    } else if (mode === 'buildings') {
      // Zoom cinématographique sur la vitrine des monuments (27 assets 100% uniques)
      this.camera.position.set(12.5, 5.5, -4.5);
      if (this.controls) this.controls.target.set(12.5, 3.8, -12.5);
    } else if (mode === 'topdown') {
      this.camera.position.set(0, 28, 0.1);
      if (this.controls) this.controls.target.set(0, 0, 0);
    } else if (mode === 'podium') {
      // Vue cinématographique centrée sur le grand podium gâteau de victoire (échelle 8.2x)
      this.camera.position.set(0, 5.8, 9.8);
      if (this.controls) this.controls.target.set(0, 3.5, 0);
    }
  }

  initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    window.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.hud-container') || e.target.closest('.deed-modal') || e.target.closest('.card-draw-modal') || e.target.closest('.lobby-modal')) return;

      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.board.tileMeshes, false);

      if (intersects.length > 0) {
        const hitTile = intersects[0].object.userData.tileData;
        if (hitTile) {
          this.showDeedInspectionModal(hitTile);
        }
      }
    });
  }

  // ==========================================================================
  // LOBBY & SETUP UI
  // ==========================================================================

  initLobbyUI() {
    this.startScreenEl = document.getElementById('start-screen');
    this.playerSetupContainer = document.getElementById('player-setup-container');
    this.btnStartGame = document.getElementById('btn-start-game');
    this.charPickerModal = document.getElementById('character-picker-modal');

    this.renderLobbyRoster();

    const onlinePanel = document.getElementById('online-lobby-panel');
    const inputRoom = document.getElementById('input-room-code');

    if (this.isOnlineMode) {
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('is-active'));
      const onlineCard = document.querySelector('.mode-card[data-mode="online"]');
      if (onlineCard) onlineCard.classList.add('is-active');
      if (onlinePanel) onlinePanel.style.display = 'block';
      if (inputRoom) inputRoom.value = this.roomCode;
      this.setupRoster[0].isBot = false;
      this.setupRoster[1].isBot = false;
      this.renderLobbyRoster();
    }

    document.querySelectorAll('.mode-card').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('is-active'));
        card.classList.add('is-active');

        const mode = card.dataset.mode;
        if (mode === 'bots') {
          if (onlinePanel) onlinePanel.style.display = 'none';
          this.setupRoster[0].isBot = false;
          this.setupRoster[1].isBot = true;
          this.setupRoster[2].isBot = true;
          this.setupRoster[3].isBot = true;
        } else if (mode === 'local') {
          if (onlinePanel) onlinePanel.style.display = 'none';
          this.setupRoster.forEach(p => { p.isBot = false; });
        } else if (mode === 'online') {
          if (onlinePanel) onlinePanel.style.display = 'block';
          if (inputRoom) inputRoom.value = this.roomCode;
          this.setupRoster[0].isBot = false;
          this.setupRoster[1].isBot = false;
        }
        this.renderLobbyRoster();
      });
    });

    const btnCopy = document.getElementById('btn-copy-invite');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${this.roomCode}`;
        navigator.clipboard.writeText(inviteUrl).then(() => {
          btnCopy.textContent = '✅ LINK COPIED!';
          setTimeout(() => { btnCopy.textContent = '📋 COPY INVITE LINK'; }, 2200);
        }).catch(() => {
          prompt('Copy room link:', inviteUrl);
        });
      });
    }

    const btnChangeRoom = document.getElementById('btn-change-room');
    if (btnChangeRoom && inputRoom) {
      btnChangeRoom.addEventListener('click', () => {
        const newRoom = inputRoom.value.trim().toUpperCase() || 'BWED-77';
        window.location.search = `?room=${newRoom}`;
      });
    }

    this.btnStartGame.addEventListener('click', () => this.startGameFromLobby());

    document.getElementById('btn-close-char-picker').addEventListener('click', () => {
      this.charPickerModal.classList.add('is-hidden');
    });

    this.initCharacterPickerGrid();
  }

  renderLobbyRoster() {
    this.playerSetupContainer.innerHTML = '';
    this.setupRoster.forEach((p, idx) => {
      const pawnData = ALL_BWED_PAWNS.find(pw => pw.id === p.pawnId) || ALL_BWED_PAWNS[idx];
      const row = document.createElement('div');
      row.className = 'player-setup-row';
      row.innerHTML = `
        <button class="p-avatar-btn" data-player-index="${idx}">
          <img src="${pawnData.thumb}" alt="${pawnData.name}">
          <span><strong>${pawnData.name}</strong></span>
        </button>

        <input type="text" class="p-name-input" value="${p.name}" data-player-index="${idx}" placeholder="Player Name">

        <label class="p-bot-toggle">
          <input type="checkbox" ${p.isBot ? 'checked' : ''} data-player-index="${idx}">
          <span>AI BOT</span>
        </label>
      `;

      row.querySelector('.p-avatar-btn').addEventListener('click', () => {
        this.openCharacterPicker(idx);
      });

      row.querySelector('.p-name-input').addEventListener('input', (e) => {
        this.setupRoster[idx].name = e.target.value;
      });

      row.querySelector('.p-bot-toggle input').addEventListener('change', (e) => {
        this.setupRoster[idx].isBot = e.target.checked;
      });

      this.playerSetupContainer.appendChild(row);
    });
  }

  openCharacterPicker(playerIndex) {
    this.editingPawnPlayerIndex = playerIndex;
    this.charPickerModal.classList.remove('is-hidden');
  }

  initCharacterPickerGrid() {
    const grid = document.getElementById('char-grid');
    grid.innerHTML = '';

    ALL_BWED_PAWNS.forEach((pawn) => {
      const card = document.createElement('div');
      card.className = 'roster-item';
      card.innerHTML = `
        <img src="${pawn.thumb}" alt="${pawn.name}">
        <div class="roster-meta">
          <strong>${pawn.name}</strong>
          <small>${pawn.role}</small>
        </div>
      `;

      card.addEventListener('click', () => {
        this.setupRoster[this.editingPawnPlayerIndex].pawnId = pawn.id;
        this.charPickerModal.classList.add('is-hidden');
        this.renderLobbyRoster();
      });

      grid.appendChild(card);
    });
  }

  startGameFromLobby() {
    const jackpotRule = document.getElementById('chk-jackpot').checked;
    const doubleGoBonus = document.getElementById('chk-double-go').checked;

    const finalRoster = this.setupRoster.slice(0, this.activePlayerCount).map((p, idx) => {
      const pawnData = ALL_BWED_PAWNS.find(pw => pw.id === p.pawnId) || ALL_BWED_PAWNS[idx];
      return {
        id: `p${idx + 1}`,
        name: p.name || `Player ${idx + 1}`,
        characterId: pawnData.id,
        color: pawnData.color,
        model: pawnData.file,
        isBot: p.isBot
      };
    });

    this.engine = new MonopolyEngine({
      startingCash: 1500,
      jackpotRule,
      doubleGoBonus
    });

    this.hookEngineEvents();

    this.pawnManager.clearAll();
    finalRoster.forEach((p, idx) => {
      this.pawnManager.createPawn(p, idx);
    });
    this.pawnManager.updateTileOffsets();

    this.startScreenEl.classList.add('is-hidden');
    document.getElementById('in-game-hud').style.display = 'flex';

    this.engine.initPlayers(finalRoster);
    this.setCameraPreset('isometric');
    this.log(`Game started with <strong>${finalRoster.length} players</strong>!`);
  }

  // ==========================================================================
  // HUD UI & EVENT WIRING
  // ==========================================================================

  initHUDUI() {
    this.btnRoll = document.getElementById('btn-roll');
    this.btnBuy = document.getElementById('btn-buy');
    this.btnManage = document.getElementById('btn-manage');
    this.btnEndTurn = document.getElementById('btn-end-turn');
    this.hudDie1 = document.getElementById('hud-die-1');
    this.hudDie2 = document.getElementById('hud-die-2');
    this.turnBanner = document.getElementById('turn-banner');
    this.jackpotCounter = document.getElementById('jackpot-counter');
    this.roundBadge = document.getElementById('round-badge');
    this.feedEl = document.getElementById('activity-feed');
    this.playersSidebar = document.getElementById('players-sidebar');

    this.btnRoll.addEventListener('click', () => this.handleRollClick());
    this.btnBuy.addEventListener('click', () => this.handleBuyClick());
    this.btnManage.addEventListener('click', () => this.handleManageClick());
    this.btnEndTurn.addEventListener('click', () => this.handleEndTurnClick());
    document.getElementById('btn-audio').addEventListener('click', () => this.toggleAudio());

    document.querySelectorAll('.cam-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-pill').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        if (btn.id === 'btn-podium-view') {
          this.triggerVictoryCelebration();
        } else {
          this.setCameraPreset(btn.dataset.cam);
        }
      });
    });

    const btnInspect3d = document.getElementById('btn-endgame-inspect-3d');
    if (btnInspect3d) {
      btnInspect3d.addEventListener('click', () => {
        const modal = document.getElementById('endgame-modal');
        if (modal) modal.classList.add('is-hidden');
      });
    }

    const btnEndgameClose = document.getElementById('btn-endgame-close');
    if (btnEndgameClose) {
      btnEndgameClose.addEventListener('click', () => {
        window.location.reload();
      });
    }
  }

  hookEngineEvents() {
    this.engine.subscribe((eventType, data, snapshot) => {
      this.updateHUD(snapshot);

      switch (eventType) {
        case 'DICE_ROLLED': {
          this.hudDie1.textContent = data.d1;
          this.hudDie2.textContent = data.d2;
          this.board.rollDiceAnimation(data.d1, data.d2);
          this.log(`<strong>${data.player.name}</strong> rolled <strong>${data.total}</strong> (${data.d1}+${data.d2})${data.isDouble ? ' &mdash; DOUBLES!' : ''}`);
          break;
        }
        case 'PLAYER_MOVED': {
          const pawn = this.pawnManager.getPawn(data.player.id);
          if (pawn) {
            pawn.moveToTile(data.to, () => {
              this.pawnManager.updateTileOffsets();
            });
          }
          break;
        }
        case 'PASSED_GO': {
          this.log(`<strong>${data.player.name}</strong> passed GO and collected <strong>$${data.salary}</strong>!`);
          break;
        }
        case 'LANDED_ON_TILE': {
          this.log(`<strong>${data.player.name}</strong> landed on <strong>${data.tile.name}</strong>.`);
          break;
        }
        case 'PROPERTY_BOUGHT': {
          this.log(`<strong>${data.player.name}</strong> purchased <strong>${data.tile.name}</strong> for $${data.price}!`);
          break;
        }
        case 'RENT_PAID': {
          this.log(`<strong>${data.payer.name}</strong> paid <strong>$${data.amount}</strong> rent to <strong>${data.owner.name}</strong> for ${data.tile.name}!`);
          break;
        }
        case 'TAX_PAID': {
          this.log(`<strong>${data.player.name}</strong> paid <strong>$${data.amount}</strong> tax on ${data.tile.name}!`);
          break;
        }
        case 'SENT_TO_JAIL': {
          this.log(`<strong>${data.player.name}</strong> was sent directly to <strong>JAIL</strong>!`);
          const pawn = this.pawnManager.getPawn(data.player.id);
          if (pawn) pawn.moveToTile(10);
          break;
        }
        case 'CARD_DRAWN': {
          this.showCardDrawPopup(data.card);
          break;
        }
        case 'HOUSE_BUILT': {
          this.board.updatePropertyBuildings(data.tile.index, data.houses);
          const label = data.houses === 5 ? 'a HOTEL' : `House #${data.houses}`;
          this.log(`<strong>${data.player.name}</strong> built ${label} on <strong>${data.tile.name}</strong>!`);
          break;
        }
        case 'HOUSE_SOLD': {
          this.board.updatePropertyBuildings(data.tile.index, data.houses);
          this.log(`<strong>${data.player.name}</strong> sold a house on <strong>${data.tile.name}</strong> for $${data.refund}.`);
          break;
        }
        case 'PROPERTY_MORTGAGED': {
          this.log(`<strong>${data.player.name}</strong> mortgaged <strong>${data.tile.name}</strong> for $${data.amount}.`);
          break;
        }
        case 'PROPERTY_UNMORTGAGED': {
          this.log(`<strong>${data.player.name}</strong> unmortgaged <strong>${data.tile.name}</strong> for $${data.cost}.`);
          break;
        }
        case 'JACKPOT_WON': {
          this.log(`<strong>JACKPOT!</strong> <strong>${data.player.name}</strong> collected <strong>$${data.amount}</strong> from Free Parking!`);
          break;
        }
        case 'PLAYER_BANKRUPT': {
          this.log(`<strong>${data.player.name}</strong> went <strong>BANKRUPT</strong>!`);
          this.pawnManager.removePawn(data.player.id);
          break;
        }
        case 'GAME_WON': {
          this.log(`<strong>${data.winner.name}</strong> has WON the game! Complete monopoly domination!`);
          this.triggerVictoryCelebration(data.winner);
          break;
        }
      }
    });
  }

  updateHUD(snapshot) {
    if (!snapshot) snapshot = this.engine.getSnapshot();

    const active = snapshot.activePlayer;
    if (!active) return;

    this.roundBadge.textContent = `ROUND ${snapshot.roundCount}`;
    this.turnBanner.textContent = `${active.name.toUpperCase()}'S TURN`;
    document.getElementById('turn-dot').style.background = `#${active.color.toString(16).padStart(6, '0')}`;
    this.jackpotCounter.innerHTML = `<img src="./assets/stickers/bwed-tg-06-chill-coffee-laptop.webp" class="sticker-ico" alt="pot"> JACKPOT: $${snapshot.jackpotPool.toLocaleString()}`;

    const isHuman = !active.isBot;
    const canRoll = isHuman && (snapshot.turnState === 'AWAITING_ROLL');
    this.btnRoll.disabled = !canRoll;

    const curTile = BOARD_TILES[active.position];
    const curProp = snapshot.properties[active.position];
    const canBuy = isHuman && (
      snapshot.turnState === 'TILE_ACTION' &&
      curProp && !curProp.ownerId &&
      active.cash >= curTile.price
    );
    this.btnBuy.disabled = !canBuy;
    this.btnBuy.innerHTML = `<svg class="btn-svg" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg> ${canBuy ? `BUY ($${curTile.price})` : `BUY PROPERTY`}`;

    const canEnd = isHuman && (snapshot.turnState === 'AWAITING_END_TURN');
    this.btnEndTurn.disabled = !canEnd;

    this.renderPlayersSidebar(snapshot);
  }

  renderPlayersSidebar(snapshot) {
    this.playersSidebar.innerHTML = '';

    snapshot.players.forEach(p => {
      const isActive = (p.id === snapshot.activePlayer?.id);
      const card = document.createElement('div');
      card.className = `p-summary-card glass-panel ${isActive ? 'is-active-turn' : ''}`;
      if (p.isBankrupt) card.style.opacity = '0.4';

      const owned = this.engine.getPlayerProperties(p.id);
      let dotsHtml = '';
      owned.forEach(({ tile }) => {
        const color = COLOR_GROUPS[tile.group]?.color || '#fff';
        dotsHtml += `<div class="prop-dot" style="background:${color};" title="${tile.name}"></div>`;
      });

      const pawnData = ALL_BWED_PAWNS.find(pw => pw.id === p.characterId) || ALL_BWED_PAWNS[0];

      card.innerHTML = `
        <div class="p-card-top">
          <div class="p-card-identity">
            <img class="p-card-thumb" src="${pawnData.thumb}" alt="${p.name}">
            <div>
              <div class="p-card-name">${p.name} ${p.isBot ? '<small>(AI)</small>' : ''}</div>
              <small style="font-size:11px;color:#a89685;">${p.inJail ? 'In Jail' : `Tile: ${BOARD_TILES[p.position].shortName}`}</small>
            </div>
          </div>
          <div class="p-card-cash"><img src="./assets/stickers/bwed-tg-19-dollar-bills-cash.webp" class="sticker-cash-ico" alt="$">$${p.cash.toLocaleString()}</div>
        </div>
        <div class="p-portfolio-dots">${dotsHtml || '<small style="font-size:11px;color:#7a6c60;">No properties</small>'}</div>
      `;

      card.addEventListener('click', () => {
        this.openPlayerPortfolioModal(p);
      });

      this.playersSidebar.appendChild(card);
    });
  }

  // ==========================================================================
  // BUTTON ACTIONS
  // ==========================================================================

  handleRollClick() {
    this.engine.rollDice();
    this.sendMultiplayerMessage({ type: 'SYNC_ROLL', room: this.roomCode });
  }

  handleBuyClick() {
    const active = this.engine.getActivePlayer();
    this.engine.buyProperty(active, active.position);
    this.sendMultiplayerMessage({ type: 'SYNC_BUY', room: this.roomCode });
  }

  handleEndTurnClick() {
    this.engine.endTurn();
    this.sendMultiplayerMessage({ type: 'SYNC_END_TURN', room: this.roomCode });
  }

  handleManageClick() {
    const active = this.engine.getActivePlayer();
    this.openPlayerPortfolioModal(active);
  }

  // ==========================================================================
  // MODALS & CARDS INSPECTION
  // ==========================================================================

  showCardDrawPopup(card) {
    const existing = document.querySelector('.card-draw-modal');
    if (existing) existing.remove();

    const isChance = card.id.startsWith('ch_');
    const headerBg = isChance ? 'linear-gradient(135deg, #ff6b35, #e85d04)' : 'linear-gradient(135deg, #2b6cb0, #1a365d)';
    const sticker = isChance ? './assets/stickers/bwed-tg-03-sunglasses-fingerguns.webp' : './assets/stickers/bwed-tg-19-dollar-bills-cash.webp';

    const modal = document.createElement('div');
    modal.className = 'card-draw-modal';
    modal.style.border = '3px solid #d4af37';
    modal.style.boxShadow = '0 16px 48px rgba(0,0,0,0.65), 0 0 24px rgba(212,175,55,0.3)';
    modal.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <img src="${sticker}" style="width:48px;height:48px;object-fit:contain;" alt="Bwed Card">
        <div class="card-header-badge" style="background:${headerBg};flex:1;text-align:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);">
          ${isChance ? '✨ CHANCE CARD ✨' : '🍞 COMMUNITY CHEST 🍞'}
        </div>
      </div>
      <div class="card-content-text" style="font-size:16px;line-height:1.45;color:#2c150b;font-weight:700;">${card.text}</div>
      <button class="card-close-btn" style="background:linear-gradient(135deg,#ffd15a,#ff9f1c);color:#1e0f07;font-weight:900;">CONTINUE</button>
    `;

    modal.querySelector('.card-close-btn').addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);

    setTimeout(() => { if (modal.parentNode) modal.remove(); }, 6000);
  }

  showDeedInspectionModal(tile) {
    const existing = document.querySelector('.deed-modal');
    if (existing) existing.remove();

    const group = COLOR_GROUPS[tile.group] || COLOR_GROUPS.SPECIAL;
    const prop = this.engine?.properties[tile.index];
    const owner = prop?.ownerId ? this.engine.players.find(p => p.id === prop.ownerId) : null;

    const modal = document.createElement('div');
    modal.className = 'deed-modal';

    let rentsHtml = '';
    if (tile.rents) {
      rentsHtml = `
        <div class="deed-row"><span>Rent (Bare Land)</span><strong>$${tile.rents[0]}</strong></div>
        <div class="deed-row"><span>With 1 House</span><strong>$${tile.rents[1]}</strong></div>
        <div class="deed-row"><span>With 2 Houses</span><strong>$${tile.rents[2]}</strong></div>
        <div class="deed-row"><span>With 3 Houses</span><strong>$${tile.rents[3]}</strong></div>
        <div class="deed-row"><span>With 4 Houses</span><strong>$${tile.rents[4]}</strong></div>
        <div class="deed-row"><span>With HOTEL</span><strong>$${tile.rents[5]}</strong></div>
        <div class="deed-row" style="margin-top:6px;"><span>House Cost</span><strong>$${tile.houseCost || 50} each</strong></div>
      `;
    } else {
      rentsHtml = `<div class="deed-row"><span>Description</span><span>${tile.description || 'Special space'}</span></div>`;
    }

    modal.innerHTML = `
      <div class="deed-header" style="background:${group.color};">
        ${tile.name}
      </div>
      <div class="deed-rents">
        <div class="deed-row"><span>Group</span><strong>${group.name}</strong></div>
        <div class="deed-row"><span>Owner</span><strong>${owner ? owner.name : 'Unowned (Bank)'}</strong></div>
        <div class="deed-row"><span>Price</span><strong>${tile.price ? `$${tile.price}` : 'N/A'}</strong></div>
        <div class="deed-row"><span>Mortgage Value</span><strong>${tile.mortgage ? `$${tile.mortgage}` : 'N/A'}</strong></div>
        <hr style="border:0;border-top:1px dashed #ccc;margin:4px 0;">
        ${rentsHtml}
      </div>
      <button class="btn-deed-action" style="background:#2b1e16;color:#fff;margin-top:6px;">CLOSE</button>
    `;

    modal.querySelector('.btn-deed-action').addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
  }

  openPlayerPortfolioModal(player) {
    const existing = document.querySelector('.deed-modal');
    if (existing) existing.remove();

    const owned = this.engine.getPlayerProperties(player.id);
    const modal = document.createElement('div');
    modal.className = 'deed-modal';
    modal.style.width = '420px';

    let propsListHtml = '';
    if (owned.length === 0) {
      propsListHtml = `<p style="padding:16px;text-align:center;color:#888;">No properties owned yet.</p>`;
    } else {
      owned.forEach(({ tile, houses, isMortgaged }) => {
        const canBuild = this.engine.canBuildHouse(player, tile.index);
        const canSell = this.engine.canSellHouse(player, tile.index);
        const color = COLOR_GROUPS[tile.group]?.color || '#444';

        propsListHtml += `
          <div style="border:1px solid #ddd;border-radius:8px;padding:8px;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:800;color:${color};">${tile.name}</span>
              <span>${houses === 5 ? 'HOTEL' : `${houses} Houses`} ${isMortgaged ? '(MORTGAGED)' : ''}</span>
            </div>
            <div class="deed-actions-row">
              <button class="btn-deed-action btn-build" data-tile="${tile.index}" ${canBuild ? '' : 'disabled'}>+ House ($${tile.houseCost})</button>
              <button class="btn-deed-action btn-sell" data-tile="${tile.index}" ${canSell ? '' : 'disabled'}>- House</button>
              <button class="btn-deed-action btn-mortgage" data-tile="${tile.index}">${isMortgaged ? `Unmortgage ($${Math.round(tile.mortgage * 1.1)})` : `Mortgage (+$${tile.mortgage})`}</button>
            </div>
          </div>
        `;
      });
    }

    modal.innerHTML = `
      <div class="deed-header" style="background:#3d271d;">
        ${player.name}'s Portfolio ($${player.cash.toLocaleString()} Cash)
      </div>
      <div style="max-height:360px;overflow-y:auto;padding-right:4px;">
        ${propsListHtml}
      </div>
      <button class="btn-deed-action btn-close-portfolio" style="background:#2b1e16;color:#fff;margin-top:8px;">CLOSE</button>
    `;

    modal.querySelectorAll('.btn-build').forEach(b => {
      b.addEventListener('click', () => {
        this.engine.buildHouse(player, parseInt(b.dataset.tile));
        modal.remove();
        this.openPlayerPortfolioModal(player);
      });
    });

    modal.querySelectorAll('.btn-sell').forEach(b => {
      b.addEventListener('click', () => {
        this.engine.sellHouse(player, parseInt(b.dataset.tile));
        modal.remove();
        this.openPlayerPortfolioModal(player);
      });
    });

    modal.querySelectorAll('.btn-mortgage').forEach(b => {
      b.addEventListener('click', () => {
        const tIdx = parseInt(b.dataset.tile);
        const prop = this.engine.properties[tIdx];
        if (prop.isMortgaged) {
          this.engine.unmortgageProperty(player, tIdx);
        } else {
          this.engine.mortgageProperty(player, tIdx);
        }
        modal.remove();
        this.openPlayerPortfolioModal(player);
      });
    });

    modal.querySelector('.btn-close-portfolio').addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
  }

  log(msg) {
    if (!this.feedEl) return;
    const item = document.createElement('div');
    item.className = 'feed-item';
    item.innerHTML = msg;
    this.feedEl.prepend(item);
    if (this.feedEl.children.length > 30) {
      this.feedEl.lastChild.remove();
    }
  }

  // ==========================================================================
  // ONLINE MULTIPLAYER SYNCHRONIZATION (BROADCASTCHANNEL & SOCKETS)
  // ==========================================================================

  initMultiplayerSync() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.broadcastChannel = new BroadcastChannel('bwed-monopoly-' + this.roomCode);
        this.broadcastChannel.onmessage = (e) => this.handleMultiplayerMessage(e.data);
      } catch (err) {
        console.warn('BroadcastChannel not supported in this context', err);
      }
    }

    // Signaler sa présence dans la salle
    this.sendMultiplayerMessage({ type: 'PEER_JOIN', room: this.roomCode, timestamp: Date.now() });

    // Mise à jour de l'indicateur de pairs
    setInterval(() => {
      const statusEl = document.getElementById('online-peer-status');
      if (statusEl && this.onlinePeersCount) {
        statusEl.textContent = `${this.onlinePeersCount} Player${this.onlinePeersCount > 1 ? 's' : ''} Connected`;
      }
    }, 2000);
  }

  sendMultiplayerMessage(msg) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (err) {}
    }
  }

  handleMultiplayerMessage(msg) {
    if (!msg || msg.room !== this.roomCode) return;

    switch (msg.type) {
      case 'PEER_JOIN': {
        this.onlinePeersCount = Math.max(2, (this.onlinePeersCount || 1) + 1);
        const statusEl = document.getElementById('online-peer-status');
        if (statusEl) statusEl.textContent = `${this.onlinePeersCount} Players Connected`;
        this.log(`🌐 Remote player connected to room <strong>${this.roomCode}</strong>!`);
        break;
      }
      case 'SYNC_ROLL': {
        if (this.engine) {
          this.engine.rollDice();
        }
        break;
      }
      case 'SYNC_BUY': {
        if (this.engine) {
          const active = this.engine.getActivePlayer();
          this.engine.buyProperty(active, active.position);
        }
        break;
      }
      case 'SYNC_END_TURN': {
        if (this.engine) {
          this.engine.endTurn();
        }
        break;
      }
      case 'SYNC_START_GAME': {
        if (this.startScreenEl && !this.startScreenEl.classList.contains('is-hidden')) {
          this.startGameFromLobby();
        }
        break;
      }
      case 'SYNC_PODIUM': {
        this.triggerVictoryCelebration();
        break;
      }
    }
  }

  // ==========================================================================
  // 3D ENDGAME CELEBRATION & PODIUM SEQUENCE
  // ==========================================================================

  triggerVictoryCelebration(customWinner = null) {
    let rankings = [];
    if (this.engine && this.engine.players && this.engine.players.length > 0) {
      const sorted = [...this.engine.players].sort((a, b) => {
        if (customWinner) {
          if (a.id === customWinner.id) return -1;
          if (b.id === customWinner.id) return 1;
        }
        if (a.isBankrupt !== b.isBankrupt) return a.isBankrupt ? 1 : -1;
        return this.engine.getPlayerNetWorth(b.id) - this.engine.getPlayerNetWorth(a.id);
      });
      rankings = sorted;
    } else {
      rankings = this.setupRoster.slice(0, this.activePlayerCount);
    }

    const winner = rankings[0] || this.setupRoster[0];

    // 1. Déclencher la scène 3D du podium (marches or/argent/bronze & cotillons)
    this.board.celebrateEndgame(rankings, this.pawnManager);

    // 2. Centrer la caméra cinématographique sur le podium
    this.setCameraPreset('podium');

    // 3. Ouvrir le tableau des scores de victoire
    this.showEndgameModal(winner, rankings);

    this.sendMultiplayerMessage({ type: 'SYNC_PODIUM', room: this.roomCode });
  }

  showEndgameModal(winner, rankings) {
    const modal = document.getElementById('endgame-modal');
    if (!modal) return;

    const winnerSub = document.getElementById('endgame-winner-sub');
    if (winnerSub) {
      winnerSub.innerHTML = `<strong>${winner.name}</strong> conquered the Bwedverse board with supreme bakery wealth!`;
    }

    const cardsContainer = document.getElementById('endgame-podium-cards');
    if (cardsContainer) {
      cardsContainer.innerHTML = '';
      const medals = ['🥇 1ST PLACE (CHAMPION)', '🥈 2ND PLACE (RUNNER-UP)', '🥉 3RD PLACE', '4TH PLACE'];
      const borderColors = ['#ffd15a', '#d9d9d9', '#cd7f32', '#7a6c60'];

      rankings.forEach((p, idx) => {
        const pawnData = ALL_BWED_PAWNS.find(pw => pw.id === (p.characterId || p.pawnId)) || ALL_BWED_PAWNS[0];
        const worth = this.engine ? this.engine.getPlayerNetWorth(p.id) : (p.cash || 1500);
        const card = document.createElement('div');
        card.style.cssText = `
          display:flex;align-items:center;justify-content:space-between;
          padding:10px 16px;background:rgba(20,10,6,0.85);
          border:2px solid ${borderColors[idx] || '#555'};border-radius:12px;
        `;
        card.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;">
            <img src="${pawnData.thumb}" style="width:42px;height:42px;border-radius:10px;object-fit:cover;border:1px solid ${borderColors[idx]};" alt="${p.name}">
            <div style="text-align:left;">
              <span style="font-size:11px;font-weight:900;color:${borderColors[idx]};">${medals[idx] || `${idx + 1}TH PLACE`}</span>
              <div style="font-size:16px;font-weight:800;color:#fffdf5;">${p.name} ${p.isBot ? '<small style="color:#aaa;">(AI)</small>' : ''}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px;font-weight:900;color:#ffd15a;">$${worth.toLocaleString()}</div>
            <small style="font-size:11px;color:#a89685;">Net Worth</small>
          </div>
        `;
        cardsContainer.appendChild(card);
      });
    }

    modal.classList.remove('is-hidden');
  }

  // ==========================================================================
  // ANIMATION LOOP
  // ==========================================================================

  animate() {
    requestAnimationFrame(() => this.animate());
    const now = performance.now();
    const elapsed = now - (this.lastFrameTime || 0);
    if (elapsed < 16.0) return; // Plafond strict 60 FPS (évite la surchauffe 120Hz ProMotion sur Mac)
    this.lastFrameTime = now;

    const delta = Math.min(this.clock.getDelta(), 0.05);

    this.board.update(delta);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MonopolyApp();
});
