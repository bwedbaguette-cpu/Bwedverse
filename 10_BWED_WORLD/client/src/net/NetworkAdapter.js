import { NETWORK } from '../../../shared/constants.js';

/* ==========================================================================
   ADAPTATEUR RÉSEAU MULTIJOUEUR — BWED WORLD
   Mode local BroadcastChannel (2 onglets instantanés) + Connecteur Colyseus
   ========================================================================== */

export class NetworkAdapter {
  constructor(localPlayerId, playerName, avatarId) {
    this.localPlayerId = localPlayerId;
    this.playerName = playerName;
    this.avatarId = avatarId;

    this.channel = null;
    this.ws = null;
    this.isOnline = false;

    // Callbacks
    this.onPlayerJoined = null;
    this.onPlayerUpdated = null;
    this.onPlayerLeft = null;
    this.onChatMessage = null;

    // Timbres des joueurs distants pour détecter les déconnexions
    this.remoteHeartbeats = new Map();

    this.initBroadcastChannel();
    this.startHeartbeatCheck();
  }

  initBroadcastChannel() {
    try {
      this.channel = new BroadcastChannel('bwed_world_network_bus');
      this.channel.onmessage = (event) => this.handleMessage(event.data);

      // Annonce de connexion immédiate
      this.broadcastJoin();
    } catch (e) {
      console.warn('BroadcastChannel non supporté, mode solo:', e);
    }
  }

  broadcastJoin() {
    this.send({
      type: 'JOIN',
      id: this.localPlayerId,
      name: this.playerName,
      avatarId: this.avatarId,
      ts: Date.now()
    });
  }

  setAvatar(newAvatarId) {
    this.avatarId = newAvatarId;
    this.broadcastJoin();
  }

  broadcastLeave() {
    this.send({
      type: 'LEAVE',
      id: this.localPlayerId
    });
  }

  sendUpdate(packet) {
    this.send({
      type: 'UPDATE',
      ...packet
    });
  }

  sendChatMessage(text, targetId = null, targetName = null) {
    const isPrivate = !!targetId;
    const packet = {
      type: isPrivate ? 'CHAT_PRIVATE' : 'CHAT_PUBLIC',
      id: this.localPlayerId,
      senderId: this.localPlayerId,
      senderName: this.playerName,
      targetId: targetId || null,
      targetName: targetName || null,
      text: text.trim(),
      ts: Date.now()
    };
    this.send(packet);
    return packet;
  }

  send(data) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  handleMessage(data) {
    if (!data || data.id === this.localPlayerId) return;

    this.remoteHeartbeats.set(data.id, Date.now());

    switch (data.type) {
      case 'JOIN':
        if (this.onPlayerJoined) {
          this.onPlayerJoined(data);
        }
        // Répondre avec notre propre JOIN pour que le nouvel arrivant nous voie
        this.send({
          type: 'JOIN_ACK',
          id: this.localPlayerId,
          name: this.playerName,
          avatarId: this.avatarId,
          ts: Date.now()
        });
        break;

      case 'JOIN_ACK':
        if (this.onPlayerJoined) {
          this.onPlayerJoined(data);
        }
        break;

      case 'UPDATE':
        if (this.onPlayerUpdated) {
          this.onPlayerUpdated(data);
        }
        break;

      case 'LEAVE':
        if (this.onPlayerLeft) {
          this.onPlayerLeft(data.id);
        }
        this.remoteHeartbeats.delete(data.id);
        break;

      case 'CHAT_PUBLIC':
        if (this.onChatMessage) {
          this.onChatMessage(data);
        }
        break;

      case 'CHAT_PRIVATE':
        if (data.targetId === this.localPlayerId || data.senderId === this.localPlayerId) {
          if (this.onChatMessage) {
            this.onChatMessage(data);
          }
        }
        break;
    }
  }

  startHeartbeatCheck() {
    setInterval(() => {
      const now = Date.now();
      for (const [id, lastTime] of this.remoteHeartbeats.entries()) {
        if (now - lastTime > NETWORK.HEARTBEAT_TIMEOUT_MS) {
          if (this.onPlayerLeft) {
            this.onPlayerLeft(id);
          }
          this.remoteHeartbeats.delete(id);
        }
      }
    }, 2000);

    // Déconnexion propre à la fermeture de l'onglet
    window.addEventListener('beforeunload', () => {
      this.broadcastLeave();
    });
  }
}
