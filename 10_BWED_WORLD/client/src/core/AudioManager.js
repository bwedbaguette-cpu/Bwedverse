/* ==========================================================================
   COZY AMBIENT AUDIO MANAGER — BWED WORLD
   Background music jukebox with seamless transitions and user volume control
   ========================================================================== */

export class AudioManager {
  constructor() {
    this.playlist = [
      { id: 'cozy-bakery', title: 'Cozy Bakery Morning', src: './assets/audio/cozy-bakery-morning.mp3' },
      { id: 'bakery-morning', title: 'Bakery Morning', src: './assets/audio/bakery-morning.mp3' },
      { id: 'kitchen-caper', title: 'Kitchen Caper', src: './assets/audio/kitchen-caper.mp3' },
      { id: 'board-game-fever', title: 'Board Game Fever', src: './assets/audio/board-game-fever.mp3' }
    ];

    this.currentIndex = 0;
    this.audio = new Audio();
    this.audio.preload = 'none';
    this.volume = 0.22; // Low gentle volume
    this.audio.volume = this.volume;
    this.isPlaying = false;
    this.isMuted = localStorage.getItem('bwed_audio_muted') === 'true';

    this.onTrackChange = null;

    this.initEvents();
  }

  initEvents() {
    this.audio.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio track error, advancing:', e);
      setTimeout(() => this.nextTrack(), 1000);
    });

    // Auto-resume on first user gesture if unmuted
    const startAudioOnInteraction = () => {
      if (!this.isMuted && !this.isPlaying) {
        this.play();
      }
      window.removeEventListener('pointerdown', startAudioOnInteraction);
      window.removeEventListener('keydown', startAudioOnInteraction);
    };

    window.addEventListener('pointerdown', startAudioOnInteraction);
    window.addEventListener('keydown', startAudioOnInteraction);
  }

  play() {
    if (this.isMuted) return;

    if (!this.audio.src) {
      this.audio.src = this.playlist[this.currentIndex].src;
    }

    this.audio.play().then(() => {
      this.isPlaying = true;
      if (this.onTrackChange) {
        this.onTrackChange(this.getCurrentTrackInfo());
      }
    }).catch(() => {
      this.isPlaying = false;
    });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    if (this.onTrackChange) {
      this.onTrackChange(this.getCurrentTrackInfo());
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
      this.isMuted = true;
      localStorage.setItem('bwed_audio_muted', 'true');
    } else {
      this.isMuted = false;
      localStorage.setItem('bwed_audio_muted', 'false');
      this.play();
    }
  }

  nextTrack() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.audio.src = this.playlist[this.currentIndex].src;
    if (this.isPlaying || !this.isMuted) {
      this.play();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;
  }

  getCurrentTrackInfo() {
    const track = this.playlist[this.currentIndex];
    return {
      title: track.title,
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume
    };
  }
}
