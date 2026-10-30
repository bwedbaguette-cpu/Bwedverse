/* ==========================================================================
   SYSTÈME DE NOTIFICATIONS TOAST AAA — BWEDTOWN
   Notifications visuelles et sonores pour les succès, montées de niveau,
   collecte de croissants et actions d'aménagement.
   ========================================================================== */

export class ToastManager {
  static instance = null;

  constructor(options = {}) {
    if (ToastManager.instance) {
      return ToastManager.instance;
    }
    ToastManager.instance = this;

    this.container = options.container || document.body;
    this.audio = options.audio || null;
    this.toastQueue = [];
    this.activeToasts = new Set();
    this.maxActive = 3;

    this.initDOM();
  }

  initDOM() {
    this.wrapEl = document.createElement('div');
    this.wrapEl.id = 'bwedToastContainer';
    this.wrapEl.className = 'bwed-toast-container';
    this.container.appendChild(this.wrapEl);
  }

  show(options = {}) {
    const {
      icon = '✨',
      title = 'Notification',
      message = '',
      tag = '',
      type = 'info', // 'info', 'success', 'levelup', 'croissant', 'badge'
      duration = 3800
    } = options;

    const toastEl = document.createElement('div');
    toastEl.className = `bwed-toast-card toast-${type}`;

    let tagHtml = '';
    if (tag) {
      tagHtml = `<span class="toast-tag">${tag}</span>`;
    }

    toastEl.innerHTML = `
      <div class="toast-icon-box">${icon}</div>
      <div class="toast-content">
        <div class="toast-header-line">
          <strong class="toast-title">${title}</strong>
          ${tagHtml}
        </div>
        ${message ? `<div class="toast-body">${message}</div>` : ''}
      </div>
      <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
    `;

    // Son de récompense / feedback
    if (this.audio) {
      if (type === 'levelup') {
        this.audio.playDialogueBeep?.();
        setTimeout(() => this.audio?.playCoinCollect?.(), 120);
      } else if (type === 'croissant' || type === 'success') {
        this.audio.playCoinCollect?.();
      } else {
        this.audio.playStep?.();
      }
    }

    toastEl.addEventListener('click', () => {
      this.dismiss(toastEl);
    });

    this.wrapEl.appendChild(toastEl);
    this.activeToasts.add(toastEl);

    // Dépassement max : retirer le plus ancien
    if (this.activeToasts.size > this.maxActive) {
      const oldest = this.wrapEl.firstElementChild;
      if (oldest) this.dismiss(oldest);
    }

    // Auto-dismiss
    setTimeout(() => {
      this.dismiss(toastEl);
    }, duration);

    return toastEl;
  }

  dismiss(toastEl) {
    if (!toastEl || toastEl.classList.contains('dismissing')) return;
    toastEl.classList.add('dismissing');
    this.activeToasts.delete(toastEl);
    setTimeout(() => {
      toastEl.remove();
    }, 280);
  }

  showLevelUp(newLevel, newTitle, rewardCoins = 100) {
    this.show({
      icon: '🎉',
      title: `LEVEL ${newLevel} REACHED!`,
      message: `New title: <strong>${newTitle}</strong> &middot; +${rewardCoins} 🪙 BwedCoins`,
      tag: 'LEVEL UP',
      type: 'levelup',
      duration: 4800
    });
  }

  showCroissantCollected(count, total = 10, xp = 100) {
    this.show({
      icon: '🥐',
      title: `Golden Croissant Found! (${count}/${total})`,
      message: `Crispy golden perfection &middot; +${xp} XP`,
      tag: `+${xp} XP`,
      type: 'croissant',
      duration: 3600
    });
  }

  showAchievement(name, xpReward = 150) {
    this.show({
      icon: '🏅',
      title: `Achievement Unlocked!`,
      message: `${name} &middot; +${xpReward} XP`,
      tag: 'ACHIEVEMENT',
      type: 'badge',
      duration: 4200
    });
  }
}
