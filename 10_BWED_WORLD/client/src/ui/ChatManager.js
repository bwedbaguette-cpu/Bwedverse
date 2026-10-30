import * as THREE from 'three';

/* ==========================================================================
   GESTIONNAIRE DE CHAT & BULLES DE DIALOGUE 3D — BWED WORLD
   - Bulles de dialogue flottant au-dessus des têtes en 3D
   - Messages publics pour tout le village
   - Messages privés (MP / Whispers) discrets entre deux joueurs
   - Historique scrollable et onglets Global / Privé
   ========================================================================== */

export class ChatManager {
  constructor(options = {}) {
    this.camera = options.camera;
    this.localPlayer = options.localPlayer;
    this.remotePlayers = options.remotePlayers; // Map<id, RemotePlayer>
    this.network = options.network;
    this.onFocusChange = options.onFocusChange || null;
    this.onMessageSent = options.onMessageSent || null;

    this.activeTab = 'global'; // 'global' ou 'private'
    this.selectedRecipientId = null;

    // Liste des bulles actives { id, element, targetGroup, yOffset, createdAt, duration }
    this.activeBubbles = [];

    // DOM
    this.dom = {
      container: document.getElementById('chatContainer'),
      toggleBtn: document.getElementById('chatToggleBtn'),
      drawer: document.getElementById('chatDrawer'),
      tabGlobal: document.getElementById('chatTabGlobal'),
      tabPrivate: document.getElementById('chatTabPrivate'),
      recipientSelectWrap: document.getElementById('chatRecipientSelectWrap'),
      recipientSelect: document.getElementById('chatRecipientSelect'),
      messagesList: document.getElementById('chatMessagesList'),
      input: document.getElementById('chatInput'),
      sendBtn: document.getElementById('chatSendBtn'),
      unreadBadge: document.getElementById('chatUnreadBadge'),
      bubblesLayer: document.getElementById('chatBubblesLayer')
    };

    this.unreadCount = 0;
    this.isDrawerOpen = false;

    this.initEvents();
  }

  setCamera(camera) {
    this.camera = camera;
  }

  initEvents() {
    // 1. Bouton bascule du panneau de chat
    this.dom.toggleBtn?.addEventListener('click', () => {
      this.toggleDrawer();
    });

    // 2. Onglets Global / Privé
    this.dom.tabGlobal?.addEventListener('click', () => {
      this.switchTab('global');
    });

    this.dom.tabPrivate?.addEventListener('click', () => {
      this.switchTab('private');
    });

    // 3. Envoi de message
    this.dom.sendBtn?.addEventListener('click', () => {
      this.submitMessage();
    });

    this.dom.input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submitMessage();
      } else if (e.key === 'Escape') {
        this.closeDrawer();
        this.dom.input.blur();
      }
    });

    // Écoute de la touche Entrée globale pour ouvrir le chat rapidement
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
          e.preventDefault();
          this.openDrawer();
          this.dom.input?.focus();
        }
      }
    });

    // Notification de focus pour ne pas déclencher les déplacements ZQSD en tapant
    this.dom.input?.addEventListener('focus', () => {
      if (this.onFocusChange) this.onFocusChange(true);
    });

    this.dom.input?.addEventListener('blur', () => {
      if (this.onFocusChange) this.onFocusChange(false);
    });
  }

  toggleDrawer() {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.isDrawerOpen = true;
    if (this.dom.drawer) this.dom.drawer.classList.add('open');
    if (this.dom.unreadBadge) {
      this.unreadCount = 0;
      this.dom.unreadBadge.hidden = true;
      this.dom.unreadBadge.textContent = '0';
    }
    this.updateRecipientOptions();
    this.dom.input?.focus();
  }

  closeDrawer() {
    this.isDrawerOpen = false;
    if (this.dom.drawer) this.dom.drawer.classList.remove('open');
    this.dom.input?.blur();
  }

  switchTab(tab) {
    this.activeTab = tab;
    if (tab === 'global') {
      this.dom.tabGlobal?.classList.add('active');
      this.dom.tabPrivate?.classList.remove('active');
      if (this.dom.recipientSelectWrap) this.dom.recipientSelectWrap.hidden = true;
      if (this.dom.input) this.dom.input.placeholder = 'Type a message... (Press Enter to send)';
    } else {
      this.dom.tabPrivate?.classList.add('active');
      this.dom.tabGlobal?.classList.remove('active');
      if (this.dom.recipientSelectWrap) this.dom.recipientSelectWrap.hidden = false;
      this.updateRecipientOptions();
      if (this.dom.input) this.dom.input.placeholder = 'Whisper private message...';
    }
  }

  updateRecipientOptions() {
    if (!this.dom.recipientSelect) return;
    const currentVal = this.dom.recipientSelect.value;
    this.dom.recipientSelect.innerHTML = '';

    if (!this.remotePlayers || this.remotePlayers.size === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'No other players online';
      this.dom.recipientSelect.appendChild(opt);
      this.selectedRecipientId = null;
      return;
    }

    let isSelectedFound = false;
    for (const [id, player] of this.remotePlayers.entries()) {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = player.name || `Player ${id.substring(0, 5)}`;
      if (id === currentVal) {
        opt.selected = true;
        isSelectedFound = true;
      }
      this.dom.recipientSelect.appendChild(opt);
    }

    if (!isSelectedFound && this.remotePlayers.size > 0) {
      const firstId = this.remotePlayers.keys().next().value;
      this.dom.recipientSelect.value = firstId;
      this.selectedRecipientId = firstId;
    } else {
      this.selectedRecipientId = this.dom.recipientSelect.value;
    }
  }

  submitMessage() {
    const text = this.dom.input?.value.trim();
    if (!text) return;

    this.dom.input.value = '';

    // Détection de la commande whisper "/w [pseudo] [message]"
    if (text.startsWith('/w ') || text.startsWith('/whisper ')) {
      const parts = text.split(' ');
      if (parts.length >= 3) {
        const targetQuery = parts[1].toLowerCase();
        const whisperBody = parts.slice(2).join(' ');

        // Recherche du joueur cible par pseudo
        let foundId = null;
        let foundName = null;
        for (const [id, player] of this.remotePlayers.entries()) {
          if (player.name && player.name.toLowerCase().includes(targetQuery)) {
            foundId = id;
            foundName = player.name;
            break;
          }
        }

        if (foundId) {
          this.sendPrivateMessage(whisperBody, foundId, foundName);
        } else {
          this.addSystemMessage(`Player matching "${parts[1]}" not found.`);
        }
        return;
      }
    }

    if (this.activeTab === 'private') {
      this.selectedRecipientId = this.dom.recipientSelect?.value || null;
      if (!this.selectedRecipientId) {
        this.addSystemMessage('No player selected for private whisper.');
        return;
      }
      const targetPlayer = this.remotePlayers.get(this.selectedRecipientId);
      const targetName = targetPlayer?.name || 'Player';
      this.sendPrivateMessage(text, this.selectedRecipientId, targetName);
    } else {
      this.sendPublicMessage(text);
    }
  }

  sendPublicMessage(text) {
    if (!this.network) return;

    const packet = this.network.sendChatMessage(text, null, null);

    // Ajout local immédiat
    this.addChatMessage({
      senderName: this.localPlayer.name,
      senderId: this.localPlayer.id,
      text,
      isLocal: true,
      isPrivate: false,
      ts: Date.now()
    });

    // Bulle 3D au-dessus de notre avatar
    this.spawnSpeechBubble(this.localPlayer.avatar.rootGroup, text, this.localPlayer.name, false);
    if (this.onMessageSent) this.onMessageSent(text);
  }

  sendPrivateMessage(text, targetId, targetName) {
    if (!this.network) return;

    this.network.sendChatMessage(text, targetId, targetName);

    // Ajout local immédiat
    this.addChatMessage({
      senderName: this.localPlayer.name,
      senderId: this.localPlayer.id,
      targetName,
      targetId,
      text,
      isLocal: true,
      isPrivate: true,
      ts: Date.now()
    });

    // Bulle 3D discrète au-dessus de notre avatar
    this.spawnSpeechBubble(this.localPlayer.avatar.rootGroup, text, `To ${targetName}`, true);
    if (this.onMessageSent) this.onMessageSent(text);
  }

  // Réception réseau d'un message d'un autre joueur
  handleIncomingMessage(data) {
    const isPrivate = data.type === 'CHAT_PRIVATE';
    const isLocal = data.senderId === this.localPlayer.id;

    if (isLocal) return; // Déjà géré localement à l'envoi

    // Trouver le joueur expéditeur pour accrocher la bulle 3D
    const sender = this.remotePlayers.get(data.senderId);
    const targetGroup = sender ? sender.avatar.rootGroup : null;

    this.addChatMessage({
      senderName: data.senderName,
      senderId: data.senderId,
      targetName: data.targetName,
      text: data.text,
      isLocal: false,
      isPrivate,
      ts: data.ts
    });

    if (targetGroup) {
      const bubbleHeader = isPrivate ? `Whisper from ${data.senderName}` : data.senderName;
      this.spawnSpeechBubble(targetGroup, data.text, bubbleHeader, isPrivate);
    }

    // Incrément du badge non-lu si le panneau est fermé
    if (!this.isDrawerOpen) {
      this.unreadCount++;
      if (this.dom.unreadBadge) {
        this.dom.unreadBadge.hidden = false;
        this.dom.unreadBadge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount.toString();
      }
    }
  }

  addChatMessage({ senderName, targetName, text, isLocal, isPrivate, ts }) {
    if (!this.dom.messagesList) return;

    const row = document.createElement('div');
    row.className = `chat-row ${isPrivate ? 'private' : ''} ${isLocal ? 'local' : ''}`;

    const date = new Date(ts || Date.now());
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    let headerHtml = '';
    if (isPrivate) {
      if (isLocal) {
        headerHtml = `<span class="chat-tag-private">DM &rarr; ${targetName}</span>`;
      } else {
        headerHtml = `<span class="chat-tag-private">DM from ${senderName}</span>`;
      }
    } else {
      headerHtml = `<strong class="chat-sender ${isLocal ? 'self' : ''}">${senderName}</strong>`;
    }

    row.innerHTML = `
      <span class="chat-time">${timeStr}</span>
      ${headerHtml}:
      <span class="chat-body">${this.escapeHtml(text)}</span>
    `;

    this.dom.messagesList.appendChild(row);
    this.dom.messagesList.scrollTop = this.dom.messagesList.scrollHeight;
  }

  addSystemMessage(text) {
    if (!this.dom.messagesList) return;

    const row = document.createElement('div');
    row.className = 'chat-row system';
    row.innerHTML = `<span class="chat-system-tag">SYSTEM:</span> <span class="chat-body">${this.escapeHtml(text)}</span>`;
    this.dom.messagesList.appendChild(row);
    this.dom.messagesList.scrollTop = this.dom.messagesList.scrollHeight;
  }

  /* --------------------------------------------------------------------------
     BULLES DE DIALOGUE 3D PROJETÉES À L'ÉCRAN
     -------------------------------------------------------------------------- */
  spawnSpeechBubble(targetGroup, text, authorName, isPrivate = false) {
    if (!this.dom.bubblesLayer || !targetGroup) return;

    const el = document.createElement('div');
    el.className = `speech-bubble ${isPrivate ? 'private' : ''}`;
    el.innerHTML = `
      <div class="speech-author">${this.escapeHtml(authorName)}</div>
      <div class="speech-text">${this.escapeHtml(text)}</div>
      <div class="speech-tail"></div>
    `;

    this.dom.bubblesLayer.appendChild(el);

    const bubbleObj = {
      id: Math.random().toString(36).substr(2, 9),
      element: el,
      targetGroup,
      createdAt: performance.now(),
      duration: 5500
    };

    // Supprimer les bulles précédentes associées au même joueur
    for (let i = this.activeBubbles.length - 1; i >= 0; i--) {
      if (this.activeBubbles[i].targetGroup === targetGroup) {
        this.activeBubbles[i].element.remove();
        this.activeBubbles.splice(i, 1);
      }
    }

    this.activeBubbles.push(bubbleObj);
  }

  update(delta) {
    if (!this.camera || this.activeBubbles.length === 0) return;

    const now = performance.now();
    const tempVec = new THREE.Vector3();
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = this.activeBubbles.length - 1; i >= 0; i--) {
      const b = this.activeBubbles[i];
      const age = now - b.createdAt;

      if (age >= b.duration) {
        b.element.remove();
        this.activeBubbles.splice(i, 1);
        continue;
      }

      // Effet de fondu en fin de durée
      if (age >= b.duration - 800) {
        const fade = (b.duration - age) / 800;
        b.element.style.opacity = Math.max(0, fade).toString();
      }

      // Positionnement de la bulle à 3.15m au-dessus des pieds (au-dessus du pseudo)
      b.targetGroup.getWorldPosition(tempVec);
      tempVec.y += 3.15;

      tempVec.project(this.camera);

      // Si le joueur est derrière la caméra, on masque la bulle
      if (tempVec.z > 1.0) {
        b.element.style.display = 'none';
        continue;
      }

      b.element.style.display = 'flex';
      const screenX = (tempVec.x * 0.5 + 0.5) * width;
      const screenY = (-tempVec.y * 0.5 + 0.5) * height;

      b.element.style.left = `${screenX.toFixed(1)}px`;
      b.element.style.top = `${screenY.toFixed(1)}px`;
      b.element.style.transform = 'translate(-50%, -100%)';
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}
