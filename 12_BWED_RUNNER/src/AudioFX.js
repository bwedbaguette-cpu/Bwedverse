/* ==========================================================================
   BWED BUTTER ESCAPE — PROCEDURAL AUDIO SYNTHESIZER (V2 PRO)
   100% synthesized sound FX and music with volume sliders, shield breaks,
   heart pickups, magnet hums, and hurt grunts.
   ========================================================================== */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;

    this.masterVolume = 0.7;
    this.musicVolume = 0.35;
    this.sfxVolume = 0.8;

    this.isMuted = false;
    this.musicPlaying = false;
    this.musicTimer = null;

    this.initContext();
  }

  initContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // ---------------------------------------------------------------------------
  // SFX: Jump & Slide
  // ---------------------------------------------------------------------------
  playJump() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.16);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  playSlide() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.26;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, t);
    filter.frequency.exponentialRampToValueAtTime(260, t + 0.24);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.26);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.26);
  }

  // ---------------------------------------------------------------------------
  // SFX: Collectables & Pickups
  // ---------------------------------------------------------------------------
  playCroissantCollect() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const freqs = [659.25, 987.77, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.035);

      gain.gain.setValueAtTime(0, t + idx * 0.035);
      gain.gain.linearRampToValueAtTime(0.28, t + idx * 0.035 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.035 + 0.32);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.035);
      osc.stop(t + idx * 0.035 + 0.33);
    });
  }

  playHeal() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (heavenly chord)
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.06);

      gain.gain.setValueAtTime(0.3, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.06);
      osc.stop(t + i * 0.06 + 0.46);
    });
  }

  playShieldPickup() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  playShieldBreak() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.28);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  playMagnetPickup() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.2);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  playStumble() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.28);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.33);
  }

  playTurbo() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + i * 0.05);

      gain.gain.setValueAtTime(0.18, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.21);
    });
  }

  playZoneFanfare() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + i * 0.08);

      gain.gain.setValueAtTime(0.3, t + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.08);
      osc.stop(t + i * 0.08 + 0.42);
    });
  }

  playSlice() {
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.35);

    oscGain.gain.setValueAtTime(0.85, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.42);

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(75, t);
    sub.frequency.exponentialRampToValueAtTime(25, t + 0.6);

    subGain.gain.setValueAtTime(0.9, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.72);
  }

  // ---------------------------------------------------------------------------
  // Procedural BGM
  // ---------------------------------------------------------------------------
  startMusic() {
    if (this.musicPlaying || !this.ctx) return;
    this.resume();
    this.musicPlaying = true;

    const tempo = 128;
    const beatDuration = 60 / tempo;
    const sixteenth = beatDuration / 4;

    const bassScale = [110, 123.47, 130.81, 146.83, 164.81, 174.61, 196.0];
    const bassPattern = [0, 0, 3, 0, 4, 0, 2, 0, 0, 0, 5, 0, 4, 3, 2, 1];

    let step = 0;

    const scheduleBeat = () => {
      if (!this.musicPlaying || this.isMuted) {
        this.musicTimer = setTimeout(scheduleBeat, sixteenth * 1000);
        return;
      }

      const t = this.ctx.currentTime;

      const noteIdx = bassPattern[step % bassPattern.length];
      if (noteIdx >= 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassScale[noteIdx % bassScale.length] * 0.75, t);

        bassGain.gain.setValueAtTime(0.24, t);
        bassGain.gain.exponentialRampToValueAtTime(0.01, t + sixteenth * 2.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(t);
        bassOsc.stop(t + sixteenth * 2.6);
      }

      if (step % 4 === 0) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.frequency.setValueAtTime(130, t);
        kick.frequency.exponentialRampToValueAtTime(35, t + 0.1);
        kickGain.gain.setValueAtTime(0.28, t);
        kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        kick.connect(kickGain);
        kickGain.connect(this.musicGain);
        kick.start(t);
        kick.stop(t + 0.13);
      } else if (step % 2 === 0) {
        const hat = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        hat.type = 'triangle';
        hat.frequency.setValueAtTime(6000, t);
        hatGain.gain.setValueAtTime(0.05, t);
        hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        hat.connect(hatGain);
        hatGain.connect(this.musicGain);
        hat.start(t);
        hat.stop(t + 0.05);
      }

      step++;
      this.musicTimer = setTimeout(scheduleBeat, sixteenth * 1000);
    };

    scheduleBeat();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) clearTimeout(this.musicTimer);
  }

  pauseMusic() {
    this.musicPlaying = false;
    if (this.musicTimer) clearTimeout(this.musicTimer);
  }

  resumeMusic() {
    if (!this.musicPlaying && !this.isMuted) {
      this.startMusic();
    }
  }
}
