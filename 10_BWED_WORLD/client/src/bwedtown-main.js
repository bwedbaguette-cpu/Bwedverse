import * as THREE from 'three';
import { Engine } from './core/Engine.js';
import { generateBwedTownMap, gridToWorldPos } from './world/BwedTownMapData.js';
import { BwedTownRenderer } from './world/BwedTownRenderer.js';
import { GridPlayerController } from './entities/GridPlayerController.js';
import { BwedTownModal } from './ui/BwedTownModal.js';
import { ChatManager } from './ui/ChatManager.js';
import { EmoteManager } from './ui/EmoteManager.js';
import { RetroAudio } from './core/RetroAudio.js';
import { MiniMap } from './ui/MiniMap.js';
import { NetworkAdapter } from './net/NetworkAdapter.js';
import { AvatarModel } from './entities/AvatarModel.js';
import { AvatarShowroom3D } from './ui/AvatarShowroom3D.js';
import { InventoryManager } from './ui/InventoryManager.js';
import { ApartmentManager } from './apartment/ApartmentManager.js';
import { ProfileManager } from './core/ProfileManager.js';
import { ToastManager } from './ui/ToastManager.js';
import { ProfilePassportModal } from './ui/ProfilePassportModal.js';
import { BillboardModal } from './ui/BillboardModal.js';
import { TownEditor } from './editor/TownEditor.js';
import { CONFIG } from './config.js';
import { NETWORK } from '../../shared/constants.js';

/* ==========================================================================
   BWEDTOWN — APPLICATION PRINCIPALE COMPLETE V3 (EXPANDED DS & FUN EDITION)
   - Bâtiments imposants et majestueux (échelle proportionnelle 94%)
   - Collecte de 10 Croissants Dorés avec bruitage et compteur HUD
   - Bruitages de pas, bump élastique et musique chiptune Pokémon DS
   - Caméra dynamique avec léger recul lors de la course (Shift)
   - Radar rotatif MiniMap, Roue d'émotes 3D, Garde-robe des 24 avatars
   - Résidences Habbo privées & Chat 3D avec bulles
   ========================================================================== */

class BwedTownApp {
  constructor() {
    this.engine = null;
    this.mapData = null;
    this.renderer = null;
    this.player = null;
    this.modal = null;
    this.chat = null;
    this.emotes = null;
    this.audio = null;
    this.miniMap = null;
    this.network = null;
    this.remotePlayers = new Map();

    this.toast = null;
    this.profileManager = null;
    this.profilePassport = null;
    this.billboardModal = null;

    this.coinsCollected = 0;
    this.totalCoins = 10;

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      shift: false
    };

    this.lastNetworkTick = 0;
    this.baseCamDist = 16.5;
    this.targetCamDist = 16.5;
    this.cameraOffset = new THREE.Vector3(0, 16.5, 14.5);
    this.cameraTarget = new THREE.Vector3();

    this.init();
  }

  init() {
    console.log('🎮 [BwedTown] Démarrage de la version V3 Haute Définition...');

    // 1. Synthétiseur Audio Rétro
    this.audio = new RetroAudio();

    // 2. Système de Notifications Toast AAA
    this.toast = new ToastManager({
      audio: this.audio
    });

    // 3. Gestionnaire de Profil Persistant & Progression
    this.profileManager = new ProfileManager({
      audio: this.audio,
      toast: this.toast,
      onProfileChange: (p) => {
        this.syncProfileWithHUD(p);
      }
    });

    const prof = this.profileManager.profile;
    this.playerName = prof.nickname;
    this.playerId = prof.id;
    this.avatarId = (prof.avatarId && CONFIG.avatars[prof.avatarId]) ? prof.avatarId : 'tiny-baker';
    this.coinsCollected = prof.croissantsCollectedIds.length;

    // 4. Moteur 3D Three.js
    const container = document.getElementById('canvasContainer');
    this.engine = new Engine(container);

    this.engine.camera.fov = 36;
    this.engine.camera.near = 0.5;
    this.engine.camera.far = 250;
    this.engine.camera.updateProjectionMatrix();

    // 5. Génération de la carte 32x32
    this.mapData = generateBwedTownMap();

    // 6. Moteur de rendu BwedTown avec filtre des croissants déjà ramassés
    this.renderer = new BwedTownRenderer(
      this.engine.scene,
      this.mapData,
      (coin) => {
        this.handleCoinCollected(coin);
      },
      prof.croissantsCollectedIds
    );

    // 7. Modal et Dialogues
    this.modal = new BwedTownModal();

    // 8. Contrôleur de déplacement sur grille (SPAWN DÉGAGÉ en x=15, z=19 face au Nord)
    const spawnPos = this.mapData.config.defaultSpawn;
    this.player = new GridPlayerController({
      id: this.playerId,
      name: this.playerName,
      avatarId: this.avatarId,
      scene: this.engine.scene,
      mapData: this.mapData,
      audio: this.audio,
      startX: spawnPos.x,
      startZ: spawnPos.z,
      facing: spawnPos.facing,
      onDistrictChange: (district) => {
        this.updateDistrictUI(district);
      },
      onDoorTrigger: (doorInfo) => {
        this.handleDoorTrigger(doorInfo);
      },
      onInteraction: (target) => {
        this.handleInteraction(target);
      },
      onStepComplete: (gx, gz) => {
        this.broadcastMovement();
        this.updateInteractionPrompt();
        this.profileManager?.recordStep();
        // Vérification automatique de collecte de pièces
        this.renderer.checkCoinCollection(gx, gz);
      }
    });

    this.cameraTarget.copy(this.player.currentWorldPos);
    this.engine.camera.position.copy(this.cameraTarget).add(this.cameraOffset);
    this.engine.camera.lookAt(this.cameraTarget);

    // Synchronisation initiale du HUD
    this.syncProfileWithHUD(prof);

    // 8. MiniMap / Radar
    this.initMiniMap();

    // 9. Réseau Multi
    this.initNetwork();

    // 10. Chat & Bulles
    this.chat = new ChatManager({
      camera: this.engine.camera,
      localPlayer: this.player,
      remotePlayers: this.remotePlayers,
      network: this.network,
      onFocusChange: (isFocused) => {
        if (isFocused) {
          this.resetKeys();
        }
      },
      onMessageSent: (text) => {
        this.profileManager?.recordChatMessage();
      }
    });

    this.network.onChatMessage = (data) => {
      this.chat.handleIncomingMessage(data);
    };

    // 11. Émotes
    this.emotes = new EmoteManager({
      camera: this.engine.camera,
      localPlayer: this.player,
      remotePlayers: this.remotePlayers,
      network: this.network
    });

    this.network.onEmote = (data) => {
      this.emotes?.handleRemoteEmote(data);
    };

    // 12. Clavier & UI
    this.initKeyboard();
    this.initModalsAndUI();

    // 13. Boucle de rendu
    this.engine.onUpdate((delta, elapsed) => this.update(delta, elapsed));
    this.engine.start();

    const loader = document.getElementById('worldLoader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 350);
    }
  }

  handleCoinCollected(coin) {
    this.profileManager?.collectCroissant(coin.id);
    this.coinsCollected = this.profileManager?.profile.croissantsCollectedIds.length || (this.coinsCollected + 1);

    const pill = document.getElementById('croissantPillText');
    if (pill) {
      pill.textContent = `🥐 ${this.coinsCollected} / ${this.totalCoins}`;
    }

    // Petite notification toast dans le chat
    if (this.chat) {
      this.chat.appendSystemMessage(`✨ Vous avez trouvé un Croissant Doré ! (${this.coinsCollected}/${this.totalCoins})`);
    }

    if (this.coinsCollected === this.totalCoins) {
      this.modal.showDialogue('Félicitations !', 'Incroyable ! Vous avez trouvé l\'intégralité des 10 Croissants Dorés cachés dans BwedTown ! Le titre et le badge de Grand Maître Boulanger sont à vous ! 🏆');
    }
  }

  initMiniMap() {
    const canvasEl = document.getElementById('miniMapCanvas');
    if (!canvasEl) return;

    this.miniMap = new MiniMap(canvasEl, () => {
      this.openModal('worldMapModal');
    });

    this.miniMap.landmarks = [
      { id: 'fountain', name: 'Fontaine', x: 0, z: -1.5, color: '#ffd15a', symbol: 'F' },
      { id: 'habbo', name: 'Habbo Apts', x: -16, z: -18, color: '#38bdf8', symbol: 'H' },
      { id: 'tavern', name: 'Taverne', x: 16, z: -18, color: '#f97316', symbol: 'T' },
      { id: 'arcade', name: 'Arcade 1v1', x: 16, z: 12, color: '#8b5cf6', symbol: 'A' },
      { id: 'portal', name: 'Observatoire', x: -16, z: 16, color: '#6366f1', symbol: 'O' }
    ];
  }

  initNetwork() {
    this.network = new NetworkAdapter(this.playerId, this.playerName, this.avatarId);

    this.network.onPlayerJoined = (data) => {
      if (data.id === this.playerId) return;

      if (!this.remotePlayers.has(data.id)) {
        const remoteAvatar = new AvatarModel(data.avatarId || 'tiny-baker');
        const remoteGroup = remoteAvatar.rootGroup;
        remoteGroup.position.set(data.x || 0, data.y || 0, data.z || 0);
        this.engine.scene.add(remoteGroup);

        this.remotePlayers.set(data.id, {
          id: data.id,
          name: data.name,
          avatarId: data.avatarId || 'tiny-baker',
          avatarModel: remoteAvatar,
          position: remoteGroup.position,
          targetPosition: remoteGroup.position.clone(),
          facing: data.facing || 'south',
          state: 'idle'
        });

        this.updatePlayerCountUI();
        this.chat?.updateRecipientOptions();
      }
    };

    this.network.onPlayerUpdated = (data) => {
      if (data.id === this.playerId) return;

      let remote = this.remotePlayers.get(data.id);
      if (!remote) {
        const remoteAvatar = new AvatarModel(data.avatarId || 'tiny-baker');
        this.engine.scene.add(remoteAvatar.rootGroup);
        remote = {
          id: data.id,
          name: data.name,
          avatarId: data.avatarId || 'tiny-baker',
          avatarModel: remoteAvatar,
          position: remoteAvatar.rootGroup.position,
          targetPosition: remoteAvatar.rootGroup.position.clone(),
          facing: data.facing || 'south',
          state: 'idle'
        };
        this.remotePlayers.set(data.id, remote);
        this.updatePlayerCountUI();
        this.chat?.updateRecipientOptions();
      }

      if (data.x !== undefined && data.z !== undefined) {
        remote.targetPosition.set(data.x, data.y || 0, data.z);
        if (data.rotY !== undefined) {
          remote.avatarModel.rootGroup.rotation.y = data.rotY;
        }
        if (data.state) {
          remote.state = data.state;
        }
      }
    };

    this.network.onPlayerLeft = (id) => {
      const remote = this.remotePlayers.get(id);
      if (remote) {
        this.engine.scene.remove(remote.avatarModel.rootGroup);
        this.remotePlayers.delete(id);
        this.updatePlayerCountUI();
        this.chat?.updateRecipientOptions();
      }
    };
  }

  broadcastMovement() {
    if (!this.network) return;

    this.network.sendUpdate({
      id: this.playerId,
      name: this.playerName,
      avatarId: this.avatarId,
      x: this.player.currentWorldPos.x,
      y: this.player.currentWorldPos.y,
      z: this.player.currentWorldPos.z,
      gridX: this.player.gridX,
      gridZ: this.player.gridZ,
      facing: this.player.facing,
      rotY: this.player.rotationY,
      state: this.player.state
    });
  }

  handleDoorTrigger(doorInfo) {
    this.audio?.playDoor();
    if (doorInfo.doorData?.action === 'habbo_apartments') {
      this.resetKeys();
      this.apartment?.open(this.avatarId);
    } else if (doorInfo.doorData?.action === 'open_wardrobe') {
      this.avatarShowroom?.open(this.avatarId);
    } else if (doorInfo.doorData?.dialogue) {
      this.modal.showDialogue(doorInfo.buildingName, doorInfo.doorData.dialogue);
    }
  }

  handleInteraction(target) {
    if (target.type === 'npc') {
      this.modal.showDialogue(target.npc.name, target.npc.dialogue);
    } else if (target.type === 'billboard') {
      this.billboardModal?.open({
        boardId: target.boardId,
        category: target.category,
        title: target.boardTitle
      });
    } else if (target.type === 'inspect') {
      this.modal.showDialogue(target.target, target.interaction.text);
    }
  }

  updateInteractionPrompt() {
    const promptEl = document.getElementById('interactionPrompt');
    const textEl = document.getElementById('interactText');
    if (!promptEl || !textEl) return;

    const { dx, dz } = this.player.getDirectionDelta(this.player.facing);
    const fx = this.player.gridX + dx;
    const fz = this.player.gridZ + dz;
    const target = this.mapData.interactionMap.get(`${fx},${fz}`);

    if (target) {
      promptEl.hidden = false;
      if (target.type === 'npc') {
        textEl.textContent = `Talk to ${target.npc.name}`;
      } else if (target.type === 'billboard') {
        textEl.textContent = `Inspect ${target.boardTitle || 'Notice Board'}`;
      } else if (target.type === 'inspect') {
        textEl.textContent = `Inspect ${target.target}`;
      } else if (target.type === 'door') {
        textEl.textContent = `Enter ${target.buildingName}`;
      }
    } else {
      promptEl.hidden = true;
    }
  }

  resetKeys() {
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.shift = false;
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if ((this.apartment && this.apartment.isOpen) || (this.townEditor && this.townEditor.isOpen)) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W':
          this.keys.up = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = true;
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
        case 'a':
        case 'A':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = true;
          break;
        case 'Shift':
          this.keys.shift = true;
          break;
        case 'e':
        case 'E':
          this.emotes?.toggleEmoteModal();
          break;
        case 'i':
        case 'I':
          this.inventory?.open();
          break;
        case 'p':
        case 'P':
          this.profilePassport?.toggle();
          break;
        case 'r':
        case 'R':
          this.billboardModal?.toggle();
          break;
        case 'h':
        case 'H':
          this.resetKeys();
          this.apartment?.open(this.avatarId);
          break;
        case ' ':
          this.player.interactInFront();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      if ((this.apartment && this.apartment.isOpen) || (this.townEditor && this.townEditor.isOpen)) {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = false;
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
        case 'a':
        case 'A':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = false;
          break;
        case 'Shift':
          this.keys.shift = false;
          break;
      }
    });
  }

  initModalsAndUI() {
    // 1. Initialisation de l'Inventaire & Drops Team
    this.inventory = new InventoryManager({
      modalId: 'inventoryModal',
      audio: this.audio,
      onPlaceFurniture: (item) => {
        this.apartment?.open(this.avatarId, item);
      },
      onEnterApartment: () => {
        this.apartment?.open(this.avatarId);
      }
    });

    // 2. Initialisation de l'Espace Personnel (Appartement Privé 3D Habbo)
    this.apartment = new ApartmentManager({
      engine: this.engine,
      avatarId: this.avatarId,
      audio: this.audio,
      inventory: this.inventory,
      profileManager: this.profileManager,
      onExit: () => {
        this.resetKeys();
        this.player?.snapToGrid(5, 7);
      }
    });

    // 3. Initialisation du Showroom 3D pour la Garde-Robe
    this.avatarShowroom = new AvatarShowroom3D({
      modalId: 'wardrobeModal',
      currentAvatarId: this.avatarId,
      audio: this.audio,
      onSelect: (newAvatarId) => {
        this.avatarId = newAvatarId;
        this.profileManager?.setAvatarId(newAvatarId);
        this.player.changeAvatar(newAvatarId);
        this.network?.setAvatar(newAvatarId);
        if (this.apartment) this.apartment.playerAvatarId = newAvatarId;
        this.syncProfileWithHUD(this.profileManager?.profile);

        if (this.chat) {
          const avName = CONFIG.avatars[newAvatarId]?.name || newAvatarId;
          this.chat.appendSystemMessage(`✨ You equipped avatar: ${avName}!`);
        }
      }
    });

    // 4. Initialisation du Passeport Citoyen (Profil & Progression AAA)
    this.profilePassport = new ProfilePassportModal({
      profileManager: this.profileManager,
      audio: this.audio,
      onUpdate: (p) => {
        this.playerName = p.nickname;
        this.player.name = p.nickname;
        this.network?.setName(p.nickname);
        this.syncProfileWithHUD(p);
      }
    });

    // 5. Initialisation du Panneau d'Affichage & Gazette Officielle
    this.billboardModal = new BillboardModal({
      profileManager: this.profileManager,
      audio: this.audio
    });

    // 6. Mode Éditeur de Ville & Agencement Procédural
    this.townEditor = new TownEditor(this);

    document.getElementById('openGazetteBtn')?.addEventListener('click', () => {
      this.billboardModal?.toggle();
    });

    document.getElementById('interactionPrompt')?.addEventListener('click', () => {
      this.player.interactInFront();
    });

    document.getElementById('openProfileBtn')?.addEventListener('click', () => {
      this.profilePassport?.open();
    });

    document.getElementById('croissantPill')?.addEventListener('click', () => {
      this.profilePassport?.open();
    });

    document.getElementById('changeAvatarBtn')?.addEventListener('click', () => {
      this.avatarShowroom?.open(this.avatarId);
    });

    document.getElementById('openInventoryBtn')?.addEventListener('click', () => {
      this.inventory?.open();
    });

    document.getElementById('openApartmentBtn')?.addEventListener('click', () => {
      this.resetKeys();
      this.apartment?.open(this.avatarId);
    });

    document.getElementById('openWorldMapBtn')?.addEventListener('click', () => {
      this.openModal('worldMapModal');
    });

    document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
      this.openModal('settingsModal');
    });

    // Configuration des paramètres graphiques & FPS
    const fpsSelect = document.getElementById('fpsSettingSelect');
    if (fpsSelect && this.engine) {
      fpsSelect.value = this.engine.targetFps.toString();
      fpsSelect.addEventListener('change', (e) => {
        this.engine.setTargetFps(e.target.value);
      });
    }

    const shadowsSelect = document.getElementById('shadowsSettingSelect');
    if (shadowsSelect && this.engine) {
      shadowsSelect.addEventListener('change', (e) => {
        this.engine.setShadowsQuality(e.target.value);
      });
    }

    document.getElementById('toggleAudioBtn')?.addEventListener('click', () => {
      const isPlaying = this.audio?.toggleMusic();
      const text = document.getElementById('audioPillText');
      if (text) {
        text.textContent = isPlaying ? 'DS Music: On 🎶' : 'DS Music: Off';
      }
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        this.closeModal(modalId);
      });
    });

    document.querySelectorAll('.teleport-card').forEach((card) => {
      card.addEventListener('click', () => {
        const gx = parseInt(card.getAttribute('data-tp-gx'), 10);
        const gz = parseInt(card.getAttribute('data-tp-gz'), 10);
        if (!isNaN(gx) && !isNaN(gz)) {
          this.player.snapToGrid(gx, gz);
          this.cameraTarget.copy(this.player.currentWorldPos);
          this.broadcastMovement();
          this.closeModal('worldMapModal');
        }
      });
    });

    const nameEl = document.getElementById('currentAvatarName');
    if (nameEl && CONFIG.avatars[this.avatarId]) {
      nameEl.textContent = CONFIG.avatars[this.avatarId].name;
    }

    this.updatePlayerCountUI();
  }

  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.hidden = false;
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.hidden = true;
  }

  syncProfileWithHUD(profile = this.profileManager?.profile) {
    if (!profile) return;
    const pseudoEl = document.getElementById('hudPlayerPseudo');
    if (pseudoEl) pseudoEl.textContent = profile.nickname;

    const avDef = CONFIG.avatars[profile.avatarId] || CONFIG.avatars['tiny-baker'];
    const avNameEl = document.getElementById('currentAvatarName');
    if (avNameEl) avNameEl.textContent = avDef?.name || profile.avatarId;

    const croissantPill = document.getElementById('croissantPillText');
    if (croissantPill) {
      croissantPill.textContent = `🥐 ${profile.croissantsCollectedIds.length} / ${this.totalCoins}`;
    }
  }

  updatePlayerCountUI() {
    const badge = document.getElementById('playerCountBadge');
    if (badge) {
      const count = 1 + this.remotePlayers.size;
      badge.textContent = `${count} citizen${count > 1 ? 's' : ''} in town`;
    }
  }

  updateDistrictUI(district) {
    const kickerEl = document.getElementById('districtKicker');
    const nameEl = document.getElementById('districtName');
    if (kickerEl) kickerEl.textContent = district.kicker.toUpperCase();
    if (nameEl) nameEl.textContent = district.name;
  }

  update(delta, elapsed) {
    this.player.update(delta, this.keys);

    // Caméra dynamique Pokémon DS : recul fluide en course
    this.targetCamDist = this.player.isRunning ? 18.5 : 16.0;
    this.baseCamDist = THREE.MathUtils.lerp(this.baseCamDist, this.targetCamDist, delta * 4.0);
    this.cameraOffset.y = this.baseCamDist;
    this.cameraOffset.z = this.baseCamDist * 0.88;

    this.cameraTarget.lerp(this.player.currentWorldPos, 0.08);
    this.engine.camera.position.copy(this.cameraTarget).add(this.cameraOffset);
    this.engine.camera.lookAt(this.cameraTarget);

    this.renderer.update(delta);

    for (const remote of this.remotePlayers.values()) {
      remote.position.lerp(remote.targetPosition, 0.15);
      remote.avatarModel.rootGroup.position.copy(remote.position);
      remote.avatarModel.updateAnimation(delta, remote.state === 'stepping' ? 'walk' : 'idle', 3.5);
    }

    if (this.chat) {
      this.chat.update(delta);
    }
    if (this.emotes) {
      this.emotes.update(delta);
    }

    if (this.miniMap) {
      this.miniMap.update(
        this.player.currentWorldPos,
        this.player.rotationY,
        0,
        Array.from(this.remotePlayers.values())
      );
    }

    const now = performance.now();
    if (now - this.lastNetworkTick >= NETWORK.TICK_INTERVAL_MS) {
      this.lastNetworkTick = now;
      this.broadcastMovement();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.bwedTownApp = new BwedTownApp();
});
