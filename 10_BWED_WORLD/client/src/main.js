import { Engine } from './core/Engine.js';
import { CameraController } from './core/CameraController.js';
import { InputManager } from './core/InputManager.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { WorldManager } from './world/WorldManager.js';
import { DayNightCycle } from './world/DayNightCycle.js';
import { NPCManager } from './world/NPCManager.js';
import { LocalPlayer } from './entities/LocalPlayer.js';
import { RemotePlayer } from './entities/RemotePlayer.js';
import { NetworkAdapter } from './net/NetworkAdapter.js';
import { HUD } from './ui/HUD.js';
import { ChatManager } from './ui/ChatManager.js';
import { EmoteManager } from './ui/EmoteManager.js';
import { WorldEditor } from './editor/WorldEditor.js';
import { VirtualJoystick } from './ui/VirtualJoystick.js';
import { NETWORK } from '../../shared/constants.js';

/* ==========================================================================
   MAIN CLIENT APPLICATION — BWED WORLD
   - 3D overhead speech bubbles & in-game chat (Public & Direct Whispers)
   - Real-time rotating compass radar & fast travel teleportation
   - Non-intrusive docked interaction prompts
   - 18 playable pawns with instant wardrobe swap
   - Fully bilingual / English interface
   ========================================================================== */

class BwedWorldApp {
  constructor() {
    this.engine = null;
    this.physics = null;
    this.world = null;
    this.dayNight = null;
    this.npcs = null;
    this.cameraController = null;
    this.input = null;
    this.hud = null;
    this.chat = null;
    this.emotes = null;
    this.editor = null;

    this.localPlayer = null;
    this.remotePlayers = new Map();
    this.network = null;

    this.lastNetworkTick = 0;

    this.init();
  }

  init() {
    // 1. Player identity and remembered avatar
    const storedName = localStorage.getItem('bwed_world_pseudo');
    const storedAvatar = localStorage.getItem('bwed_world_avatar');

    const defaultPseudos = ['Chef Emile', 'Golden Baker', 'Honey Artisan', 'Matcha Crafter', 'Brioche Fan'];
    const randomDefault = defaultPseudos[Math.floor(Math.random() * defaultPseudos.length)] + '_' + Math.floor(100 + Math.random() * 900);
    const playerName = storedName || randomDefault;
    const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    const avatarId = storedAvatar || 'tiny-baker';

    // 2. 3D WebGL Engine
    const canvasContainer = document.getElementById('canvasContainer');
    this.engine = new Engine(canvasContainer);

    // 3. Multi-biome physics & world manager
    this.physics = new PhysicsWorld();
    this.world = new WorldManager(this.engine.scene, this.physics, ({ kicker, name }) => {
      this.hud?.setDistrict(kicker, name);
    });

    // 3b. Day / Night cycle & atmospheric sky
    this.dayNight = new DayNightCycle(this.engine.scene, this.world.sunLight, this.world.ambientLight);

    // 3c. Cozy Village NPCs
    this.npcs = new NPCManager(this.engine.scene, this.physics);

    // 4. Panoramic isometric camera
    this.cameraController = new CameraController(this.engine.camera);

    // 5. Input manager
    this.input = new InputManager(this.engine.camera, this.world.groundMesh);

    // 6. Mobile virtual joystick
    new VirtualJoystick(document.body, (x, y) => {
      this.input.setJoystickVector(x, y);
    });

    // 7. Local player instance
    this.localPlayer = new LocalPlayer(playerId, playerName, avatarId, this.engine.scene, this.physics);
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = 4.0 + Math.random() * 3.0;
    this.localPlayer.setPosition(Math.cos(spawnAngle) * spawnDist, 0, Math.sin(spawnAngle) * spawnDist);
    this.cameraController.setInstantTarget(this.localPlayer.position);

    // 8. 2D HUD, Mini-Map & Settings
    this.hud = new HUD({
      playerName,
      currentAvatarId: avatarId,
      onNameChange: (newName) => {
        this.localPlayer.name = newName;
        localStorage.setItem('bwed_world_pseudo', newName);
        this.network?.broadcastJoin();
      },
      onAvatarChange: (newAvatarId) => {
        this.localPlayer.changeAvatar(newAvatarId);
        localStorage.setItem('bwed_world_avatar', newAvatarId);
        this.network?.setAvatar(newAvatarId);
      },
      onZoomIn: () => {
        this.cameraController.zoomIn(6.0);
      },
      onZoomOut: () => {
        this.cameraController.zoomOut(6.0);
      },
      onTeleport: ({ x, z }) => {
        this.localPlayer.setPosition(x, 0, z);
        this.cameraController.setInstantTarget(this.localPlayer.position);
        if (this.network) {
          this.network.sendUpdate(this.localPlayer.getNetworkPacket());
        }
      },
      onToggleShadows: (level) => {
        this.engine.setShadowsQuality(level);
      },
      onToggleResolution: (level) => {
        this.engine.setGraphicsResolution(level);
      },
      onCameraDistance: (dist) => {
        this.cameraController.setDistance(dist);
      },
      onTimeOfDayChange: (mode) => {
        this.dayNight?.setMode(mode);
      }
    });

    // 9. Multiplayer network adapter
    this.initNetwork(playerId, playerName, avatarId);

    // 10. In-game chat & 3D speech bubbles manager
    this.chat = new ChatManager({
      camera: this.engine.camera,
      localPlayer: this.localPlayer,
      remotePlayers: this.remotePlayers,
      network: this.network,
      onFocusChange: (isFocused) => {
        if (isFocused) {
          this.input.resetKeys();
        }
      }
    });

    // Connect incoming chat to chat manager
    this.network.onChatMessage = (data) => {
      this.chat.handleIncomingMessage(data);
    };

    // 10b. Emote wheel & 3D overhead reactions
    this.emotes = new EmoteManager({
      camera: this.engine.camera,
      localPlayer: this.localPlayer,
      remotePlayers: this.remotePlayers,
      network: this.network
    });

    this.network.onEmote = (data) => {
      this.emotes?.handleRemoteEmote(data);
    };

    // 10c. In-browser 3D World Editor
    this.editor = new WorldEditor({
      scene: this.engine.scene,
      camera: this.engine.camera,
      world: this.world,
      physics: this.physics
    });

    // 11. Render loop
    this.engine.onUpdate((delta, elapsed) => this.update(delta, elapsed));
    this.engine.start();

    // Hide loading screen
    const loaderEl = document.getElementById('worldLoader');
    if (loaderEl) {
      loaderEl.style.opacity = '0';
      setTimeout(() => loaderEl.remove(), 400);
    }
  }

  initNetwork(playerId, playerName, avatarId) {
    this.network = new NetworkAdapter(playerId, playerName, avatarId);

    // Player joined
    this.network.onPlayerJoined = (data) => {
      if (data.id === playerId) return;

      if (!this.remotePlayers.has(data.id)) {
        const remote = new RemotePlayer(data.id, data.name, data.avatarId || 'tiny-baker', this.engine.scene);
        this.remotePlayers.set(data.id, remote);
        this.updatePlayerCount();
        this.chat?.updateRecipientOptions();
      } else {
        const remote = this.remotePlayers.get(data.id);
        if (data.avatarId && data.avatarId !== remote.avatarId) {
          remote.changeAvatar(data.avatarId);
        }
      }
    };

    // Player position update
    this.network.onPlayerUpdated = (data) => {
      if (data.id === playerId) return;

      let remote = this.remotePlayers.get(data.id);
      if (!remote) {
        remote = new RemotePlayer(data.id, data.name, data.avatarId || 'tiny-baker', this.engine.scene);
        this.remotePlayers.set(data.id, remote);
        this.updatePlayerCount();
        this.chat?.updateRecipientOptions();
      }
      remote.pushSnapshot(data);
    };

    // Player left
    this.network.onPlayerLeft = (id) => {
      const remote = this.remotePlayers.get(id);
      if (remote) {
        remote.dispose();
        this.remotePlayers.delete(id);
        this.updatePlayerCount();
        this.chat?.updateRecipientOptions();
      }
    };
  }

  updatePlayerCount() {
    const count = 1 + this.remotePlayers.size;
    this.hud.updatePlayerCount(count);
  }

  update(delta, elapsed) {
    // 1. Local player inputs & physics
    const inputResult = this.input.getMovementVector(this.localPlayer.position);
    this.localPlayer.update(delta, inputResult);

    // 2. World props animation & smooth atmospheric blend
    this.world.update(delta, elapsed);
    this.world.updateAtmosphere(this.localPlayer.position);

    // 2b. Day / Night cycle & atmospheric sky
    if (this.dayNight) {
      this.dayNight.update(delta);
      this.hud?.setDistrictTime(this.dayNight.getTimeFormatted());
    }

    // 2c. Cozy NPCs idle breathing
    if (this.npcs) {
      this.npcs.update(delta);
    }

    // 3. Smooth camera tracking
    this.cameraController.setTarget(this.localPlayer.position);
    this.cameraController.update(delta);

    // 4. Discreet contextual interaction prompt (NPCs prioritized, then shops/portals)
    const activeNpc = this.npcs ? this.npcs.getNearestNPC(this.localPlayer.position, 3.2) : null;
    if (activeNpc) {
      this.hud.showInteractionPrompt(`Talk to ${activeNpc.name}`, () => {
        this.hud.showDialogue(activeNpc);
      });
    } else {
      const activeZone = this.world.getNearestInteraction(this.localPlayer.position);
      if (activeZone) {
        this.hud.showInteractionPrompt(activeZone.actionLabel, () => {
          this.hud.openModal(activeZone.targetOverlay);
        });
      } else {
        this.hud.hideInteractionPrompt();
      }
    }

    // 5. Rotating compass radar update
    this.hud.updateMiniMap(
      this.localPlayer.position,
      this.localPlayer.rotationY,
      this.cameraController.yaw,
      Array.from(this.remotePlayers.values())
    );

    // 6. 3D speech bubbles & emote reactions positioning
    if (this.chat) {
      this.chat.update(delta);
    }
    if (this.emotes) {
      this.emotes.update(delta);
    }

    // 7. Interpolate remote players
    for (const remote of this.remotePlayers.values()) {
      remote.update(delta);
    }

    // 8. Broadcast network packet at 15 Hz
    const now = performance.now();
    if (now - this.lastNetworkTick >= NETWORK.TICK_INTERVAL_MS) {
      this.lastNetworkTick = now;
      if (this.network && this.localPlayer) {
        this.network.sendUpdate(this.localPlayer.getNetworkPacket());
      }
    }
  }
}

// Boot application
function boot() {
  if (!window.bwedWorldApp) {
    window.bwedWorldApp = new BwedWorldApp();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
