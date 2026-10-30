/* ==========================================================================
   RETRO AUDIO SYNTHESIZER — POKÉMON DS AUDIO ENGINE
   Générateur procédural de bruitages et de mélodies chiptune rétro via Web Audio API.
   Zéro latence, zéro fichier externe requis.
   ========================================================================== */

export class RetroAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicPlaying = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playStep(isRoad = false) {
    if (this.isMuted) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Bruit de pas feutré (herbe) ou net (pavé)
      osc.type = isRoad ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isRoad ? 360 : 220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playBump() {
    if (this.isMuted) return;
    try {
      this.initContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Bruitage authentique "Bump" contre le mur (Pokémon DS)
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  playCoinCollect() {
    if (this.isMuted) return;
    try {
      this.initContext();
      // Double note arpège joyeuse (Si -> Mi aigu)
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.28);
    } catch (e) {}
  }

  playDoor() {
    if (this.isMuted) return;
    try {
      this.initContext();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.06);
      osc.frequency.setValueAtTime(783.99, now + 0.12);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  toggleMusic() {
    this.initContext();
    this.musicPlaying = !this.musicPlaying;

    if (this.musicPlaying) {
      // Mélodie bucolique Pokémon DS (Bonaugure / Twinleaf vibes)
      const melody = [
        { f: 523.25, d: 0.24 }, // Do
        { f: 659.25, d: 0.24 }, // Mi
        { f: 783.99, d: 0.24 }, // Sol
        { f: 987.77, d: 0.38 }, // Si
        { f: 880.00, d: 0.24 }, // La
        { f: 783.99, d: 0.24 }, // Sol
        { f: 659.25, d: 0.38 }, // Mi
        { f: 587.33, d: 0.24 }, // Ré
        { f: 659.25, d: 0.24 }, // Mi
        { f: 523.25, d: 0.45 }  // Do long
      ];

      this.musicStep = 0;
      this.musicTimer = setInterval(() => {
        if (!this.musicPlaying) return;
        const note = melody[this.musicStep % melody.length];
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note.f, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.035, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.d);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + note.d);
        } catch (e) {}
        this.musicStep++;
      }, 340);
    } else {
      clearInterval(this.musicTimer);
    }

    return this.musicPlaying;
  }
}
