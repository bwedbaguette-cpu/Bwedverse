import { Engine } from './core/Engine.js';
import { CameraController } from './core/CameraController.js';
import { InputManager } from './core/InputManager.js';
import { PhysicsWorld } from './core/PhysicsWorld.js';
import { WorldManager } from './world/WorldManager.js';
import { LocalPlayer } from './entities/LocalPlayer.js';
import { RemotePlayer } from './entities/RemotePlayer.js';
import { NetworkAdapter } from './net/NetworkAdapter.js';
import { HUD } from './ui/HUD.js';
import { VirtualJoystick } from './ui/VirtualJoystick.js';
import { NETWORK } from '../../shared/constants.js';

/* ==========================================================================
   POINT D'ENTRÉE PRINCIPAL — BWED WORLD (JALON 2)
   - 18 Pions jouables avec sélection instantanée
   - 2 Biomes connectés par le Pont du Beurre d'Amande
   - Fondu progressif d'ambiance et synchronisation multi-joueurs à 15 Hz
   ========================================================================== */

class BwedWorldApp {
  constructor() {
    this.engine = null;
    this.physics = null;
    this.world = null;
    this.cameraController = null;
    this.input = null;
    this.hud = null;

    this.localPlayer = null;
    this.remotePlayers = new Map();
    this.network = null;

    this.lastNetworkTick = 0;

    this.init();
  }

  init() {
    // 1. Identité du joueur et pion mémorisé
    const storedName = localStorage.getItem('bwed_world_pseudo');
    const storedAvatar = localStorage.getItem('bwed_world_avatar');

    const defaultPseudos = ['Chef Émile', 'Mitron Doré', 'Boulanger Miel', 'Pâtissier Matcha', 'Brioche Fan'];
    const randomDefault = defaultPseudos[Math.floor(Math.random() * defaultPseudos.length)] + '_' + Math.floor(100 + Math.random() * 900);
    const playerName = storedName || randomDefault;
    const playerId = 'player_' + Math.random().toString(36).substr(2, 9);
    const avatarId = storedAvatar || 'tiny-baker';

    // 2. Moteur de rendu 3D
    const canvasContainer = document.getElementById('canvasContainer');
    this.engine = new Engine(canvasContainer);

    // 3. Physique & Monde multi-biomes
    this.physics = new PhysicsWorld();
    this.world = new WorldManager(this.engine.scene, this.physics, ({ kicker, name }) => {
      this.hud?.setDistrict(kicker, name);
    });

    // 4. Caméra 3/4 plongeante panoramique
    this.cameraController = new CameraController(this.engine.camera);

    // 5. Entrées clavier & sol
    this.input = new InputManager(this.engine.camera, this.world.groundMesh);

    // 6. Joystick virtuel tactile mobile
    new VirtualJoystick(document.body, (x, y) => {
      this.input.setJoystickVector(x, y);
    });

    // 7. Joueur Local
    this.localPlayer = new LocalPlayer(playerId, playerName, avatarId, this.engine.scene, this.physics);
    // Position initiale sur la grand-place
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDist = 4.0 + Math.random() * 3.0;
    this.localPlayer.setPosition(Math.cos(spawnAngle) * spawnDist, 0, Math.sin(spawnAngle) * spawnDist);
    this.cameraController.setInstantTarget(this.localPlayer.position);

    // 8. Interface utilisateur (HUD) & Garde-robe
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
      }
    });

    // 9. Adaptateur Multijoueur
    this.initNetwork(playerId, playerName, avatarId);

    // 10. Boucle de rendu
    this.engine.onUpdate((delta, elapsed) => this.update(delta, elapsed));
    this.engine.start();

    // Masquage du loader
    const loaderEl = document.getElementById('worldLoader');
    if (loaderEl) {
      loaderEl.style.opacity = '0';
      setTimeout(() => loaderEl.remove(), 400);
    }
  }

  initNetwork(playerId, playerName, avatarId) {
    this.network = new NetworkAdapter(playerId, playerName, avatarId);

    // Connexion d'un autre joueur
    this.network.onPlayerJoined = (data) => {
      if (data.id === playerId) return;

      if (!this.remotePlayers.has(data.id)) {
        const remote = new RemotePlayer(data.id, data.name, data.avatarId || 'tiny-baker', this.engine.scene);
        this.remotePlayers.set(data.id, remote);
        this.updatePlayerCount();
      } else {
        const remote = this.remotePlayers.get(data.id);
        if (data.avatarId && data.avatarId !== remote.avatarId) {
          remote.changeAvatar(data.avatarId);
        }
      }
    };

    // Mise à jour de la position d'un autre joueur
    this.network.onPlayerUpdated = (data) => {
      if (data.id === playerId) return;

      let remote = this.remotePlayers.get(data.id);
      if (!remote) {
        remote = new RemotePlayer(data.id, data.name, data.avatarId || 'tiny-baker', this.engine.scene);
        this.remotePlayers.set(data.id, remote);
        this.updatePlayerCount();
      }
      remote.pushSnapshot(data);
    };

    // Déconnexion d'un joueur
    this.network.onPlayerLeft = (id) => {
      const remote = this.remotePlayers.get(id);
      if (remote) {
        remote.dispose();
        this.remotePlayers.delete(id);
        this.updatePlayerCount();
      }
    };
  }

  updatePlayerCount() {
    const count = 1 + this.remotePlayers.size;
    this.hud.updatePlayerCount(count);
  }

  update(delta, elapsed) {
    // 1. Entrées & Déplacement joueur local
    const inputResult = this.input.getMovementVector(this.localPlayer.position);
    this.localPlayer.update(delta, inputResult);

    // 2. Monde, animations et fondu d'atmosphère
    this.world.update(delta, elapsed);
    this.world.updateAtmosphere(this.localPlayer.position);

    // 3. Suivi caméra fluide
    this.cameraController.setTarget(this.localPlayer.position);
    this.cameraController.update(delta);

    // 4. Joueurs distants interpolés
    for (const remote of this.remotePlayers.values()) {
      remote.update(delta);
    }

    // 5. Envoi réseau cadencé à 15 Hz
    const now = performance.now();
    if (now - this.lastNetworkTick >= NETWORK.TICK_INTERVAL_MS) {
      this.lastNetworkTick = now;
      if (this.network && this.localPlayer) {
        this.network.sendUpdate(this.localPlayer.getNetworkPacket());
      }
    }
  }
}

// Initialisation garantie sans bloquer sur DOMContentLoaded
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
