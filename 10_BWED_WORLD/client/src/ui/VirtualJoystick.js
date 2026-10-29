/* ==========================================================================
   JOYSTICK VIRTUEL TACTILE MOBILE — BWED WORLD
   Apparaît au toucher sous le pouce sur smartphone et tablette
   ========================================================================== */

export class VirtualJoystick {
  constructor(containerEl, onMoveCallback) {
    this.container = containerEl;
    this.onMove = onMoveCallback;

    this.active = false;
    this.touchId = null;
    this.baseX = 0;
    this.baseY = 0;
    this.maxRadius = 45;

    this.baseEl = null;
    this.thumbEl = null;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.baseEl = document.createElement('div');
    this.baseEl.className = 'v-joystick-base';
    this.baseEl.style.display = 'none';

    this.thumbEl = document.createElement('div');
    this.thumbEl.className = 'v-joystick-thumb';

    this.baseEl.appendChild(this.thumbEl);
    this.container.appendChild(this.baseEl);
  }

  bindEvents() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    window.addEventListener('touchstart', (e) => {
      // Ignorer si le toucher est sur un bouton interactif de l'interface
      if (e.target.closest('button, a, input')) return;

      const touch = e.changedTouches[0];
      // Actif principalement sur la moitié gauche ou centrale basse de l'écran
      if (touch.clientY > window.innerHeight * 0.4 && touch.clientX < window.innerWidth * 0.7) {
        this.active = true;
        this.touchId = touch.identifier;
        this.baseX = touch.clientX;
        this.baseY = touch.clientY;

        this.baseEl.style.left = `${this.baseX - 45}px`;
        this.baseEl.style.top = `${this.baseY - 45}px`;
        this.baseEl.style.display = 'block';

        this.thumbEl.style.transform = `translate(0px, 0px)`;
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.touchId) {
          e.preventDefault();
          const dx = touch.clientX - this.baseX;
          const dy = touch.clientY - this.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);

          const clampedDist = Math.min(dist, this.maxRadius);
          const thumbX = clampedDist * Math.cos(angle);
          const thumbY = clampedDist * Math.sin(angle);

          this.thumbEl.style.transform = `translate(${thumbX}px, ${thumbY}px)`;

          // Vecteur normalisé (-1 à +1)
          const normX = thumbX / this.maxRadius;
          const normY = -thumbY / this.maxRadius; // Inversion Y pour écran

          if (this.onMove) {
            this.onMove(normX, normY);
          }
          break;
        }
      }
    }, { passive: false });

    const endTouch = (e) => {
      if (!this.active) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.active = false;
          this.touchId = null;
          this.baseEl.style.display = 'none';
          this.thumbEl.style.transform = `translate(0px, 0px)`;
          if (this.onMove) {
            this.onMove(0, 0);
          }
          break;
        }
      }
    };

    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);
  }
}
