/* ==========================================================================
   BWED BUTTER ESCAPE — UI & HUD CONTROLLER (V4 LEADERBOARD & REAL GLB)
   Features live 3D Title Showroom, 23-Avatar Catalog, Leaderboard system,
   Bwed stickers, glassmorphism modals, and sound sliders.
   ========================================================================== */

import { ALL_AVATARS } from './Player.js';
import { LeaderboardManager } from './Leaderboard.js';

export class UIManager {
  constructor(handlers, audio) {
    this.handlers = handlers; // { onStart, onRestart, onResume, onAvatarSelect, onTurboActivate, onCameraChange, onQualityChange }
    this.audio = audio;

    this.leaderboard = new LeaderboardManager();
    this.selectedAvatar = ALL_AVATARS[0];
    this.currentLives = 3;

    this.cacheElements();
    this.bindEvents();
    this.renderAvatarCatalog();
    this.renderLeaderboard();
    this.updateTitleScreenHero();
  }

  cacheElements() {
    // Title Screen
    this.titleScreen = document.getElementById('titleScreen');
    this.titlePlayBtn = document.getElementById('titlePlayBtn');
    this.titleHeroPill = document.getElementById('titleHeroPill');
    this.titleSettingsBtn = document.getElementById('titleSettingsBtn');
    this.titleLeaderboardBtn = document.getElementById('titleLeaderboardBtn');
    this.titleLeaderboardMainBtn = document.getElementById('titleLeaderboardMainBtn');
    this.titleBestScore = document.getElementById('titleBestScore');
    this.heroPillImg = document.getElementById('heroPillImg');
    this.heroPillName = document.getElementById('heroPillName');

    // In-Game HUD
    this.hudLayer = document.querySelector('.hud-layer');
    this.distVal = document.getElementById('distVal');
    this.croissantVal = document.getElementById('croissantVal');
    this.scoreVal = document.getElementById('scoreVal');
    this.hudLeaderboardBtn = document.getElementById('hudLeaderboardBtn');

    // Hearts
    this.heart1 = document.getElementById('heart1');
    this.heart2 = document.getElementById('heart2');
    this.heart3 = document.getElementById('heart3');
    this.hearts = [this.heart1, this.heart2, this.heart3];

    // Powerups Tray
    this.shieldBadge = document.getElementById('shieldBadge');
    this.magnetBadge = document.getElementById('magnetBadge');
    this.magnetTimeText = document.getElementById('magnetTimeText');
    this.turboBadge = document.getElementById('turboBadge');

    // Zone Banner
    this.zoneBanner = document.getElementById('zoneBanner');
    this.zoneBannerTitle = document.getElementById('zoneBannerTitle');

    // FX
    this.dangerVignette = document.getElementById('dangerVignette');
    this.turboOverlay = document.getElementById('turboOverlay');

    // Turbo Meter
    this.turboFill = document.getElementById('turboFill');
    this.turboText = document.getElementById('turboText');
    this.turboReadyBtn = document.getElementById('turboReadyBtn');

    // Power-Up Guide Card
    this.powerupGuideCard = document.getElementById('powerupGuideCard');
    this.togglePowerupGuideBtn = document.getElementById('togglePowerupGuideBtn');
    this.closePowerupGuideBtn = document.getElementById('closePowerupGuideBtn');
    this.hudGuideBtn = document.getElementById('hudGuideBtn');

    // Leaderboard Modal
    this.leaderboardModal = document.getElementById('leaderboardModal');
    this.closeLeaderboardBtn = document.getElementById('closeLeaderboardBtn');
    this.leaderboardTableBody = document.getElementById('leaderboardTableBody');
    this.playerPseudoInput = document.getElementById('playerPseudoInput');
    this.savePseudoBtn = document.getElementById('savePseudoBtn');
    this.gameOverLeaderboardBtn = document.getElementById('gameOverLeaderboardBtn');

    // Pause Modal
    this.pauseModal = document.getElementById('pauseModal');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.resumeBtn = document.getElementById('resumeBtn');
    this.pauseRestartBtn = document.getElementById('pauseRestartBtn');
    this.pauseSettingsBtn = document.getElementById('pauseSettingsBtn');

    // Settings Modal
    this.settingsModal = document.getElementById('settingsModal');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
    this.musicSlider = document.getElementById('musicSlider');
    this.sfxSlider = document.getElementById('sfxSlider');
    this.cameraSelect = document.getElementById('cameraSelect');
    this.fpsSelect = document.getElementById('fpsSelect');
    this.qualitySelect = document.getElementById('qualitySelect');

    // Game Over Modal
    this.gameOverModal = document.getElementById('gameOverModal');
    this.restartBtn = document.getElementById('restartBtn');
    this.finalDist = document.getElementById('finalDist');
    this.finalCroissants = document.getElementById('finalCroissants');
    this.finalScore = document.getElementById('finalScore');
    this.bestScore = document.getElementById('bestScore');
    this.newRecordBadge = document.getElementById('newRecordBadge');

    // Avatar Catalog Modal
    this.avatarModal = document.getElementById('avatarModal');
    this.avatarBtn = document.getElementById('avatarBtn');
    this.closeAvatarModalBtn = document.getElementById('closeAvatarModalBtn');
    this.avatarGrid = document.getElementById('avatarGrid');
  }

  bindEvents() {
    // Title Screen Start
    this.titlePlayBtn.addEventListener('click', () => {
      this.titleScreen.style.display = 'none';
      this.hudLayer.classList.add('active');
      this.handlers.onStart();
    });

    this.titleHeroPill.addEventListener('click', () => {
      this.avatarModal.style.display = 'flex';
    });

    this.titleSettingsBtn.addEventListener('click', () => {
      this.settingsModal.style.display = 'flex';
    });

    // Leaderboard
    const openLeaderboard = () => {
      this.renderLeaderboard();
      this.leaderboardModal.style.display = 'flex';
    };

    this.titleLeaderboardBtn.addEventListener('click', openLeaderboard);
    if (this.titleLeaderboardMainBtn) this.titleLeaderboardMainBtn.addEventListener('click', openLeaderboard);
    if (this.hudLeaderboardBtn) this.hudLeaderboardBtn.addEventListener('click', openLeaderboard);
    if (this.gameOverLeaderboardBtn) this.gameOverLeaderboardBtn.addEventListener('click', openLeaderboard);

    this.closeLeaderboardBtn.addEventListener('click', () => {
      this.leaderboardModal.style.display = 'none';
    });

    this.savePseudoBtn.addEventListener('click', () => {
      const newPseudo = this.leaderboard.setPseudo(this.playerPseudoInput.value);
      this.playerPseudoInput.value = newPseudo;
      this.savePseudoBtn.textContent = 'Saved!';
      setTimeout(() => {
        this.savePseudoBtn.textContent = 'Save';
      }, 1500);
      this.renderLeaderboard();
    });

    // Pause
    this.pauseBtn.addEventListener('click', () => {
      if (this.handlers.onPause) {
        this.handlers.onPause();
      } else {
        this.showPause();
      }
    });

    this.resumeBtn.addEventListener('click', () => {
      this.hidePause();
      this.handlers.onResume();
    });

    this.pauseRestartBtn.addEventListener('click', () => {
      this.hidePause();
      this.handlers.onRestart();
    });

    // Game Over Restart
    this.restartBtn.addEventListener('click', () => {
      this.gameOverModal.style.display = 'none';
      this.handlers.onRestart();
    });

    // Settings
    const openSettings = () => {
      this.settingsModal.style.display = 'flex';
    };
    this.settingsBtn.addEventListener('click', openSettings);
    this.pauseSettingsBtn.addEventListener('click', openSettings);

    this.closeSettingsBtn.addEventListener('click', () => {
      this.settingsModal.style.display = 'none';
    });

    this.musicSlider.addEventListener('input', (e) => {
      this.audio.setMusicVolume(parseFloat(e.target.value));
    });

    this.sfxSlider.addEventListener('input', (e) => {
      this.audio.setSfxVolume(parseFloat(e.target.value));
    });

    this.cameraSelect.addEventListener('change', (e) => {
      if (this.handlers.onCameraChange) {
        this.handlers.onCameraChange(e.target.value);
      }
    });

    if (this.fpsSelect) {
      this.fpsSelect.addEventListener('change', (e) => {
        if (this.handlers.onFPSChange) {
          this.handlers.onFPSChange(e.target.value);
        }
      });
    }

    this.qualitySelect.addEventListener('change', (e) => {
      if (this.handlers.onQualityChange) {
        this.handlers.onQualityChange(e.target.value);
      }
    });

    // Avatars
    this.avatarBtn.addEventListener('click', () => {
      this.avatarModal.style.display = 'flex';
    });

    this.closeAvatarModalBtn.addEventListener('click', () => {
      this.avatarModal.style.display = 'none';
    });

    this.turboReadyBtn.addEventListener('click', () => {
      this.handlers.onTurboActivate();
    });

    // Discreet Power-up Guide Card Toggle
    const toggleGuide = () => {
      const isHidden = !this.powerupGuideCard.style.display || this.powerupGuideCard.style.display === 'none';
      this.powerupGuideCard.style.display = isHidden ? 'flex' : 'none';
    };

    if (this.togglePowerupGuideBtn) this.togglePowerupGuideBtn.addEventListener('click', toggleGuide);
    if (this.hudGuideBtn) this.hudGuideBtn.addEventListener('click', toggleGuide);
    if (this.closePowerupGuideBtn) this.closePowerupGuideBtn.addEventListener('click', () => {
      this.powerupGuideCard.style.display = 'none';
    });
  }

  updateTitleScreenHero() {
    const topScore = this.leaderboard.getScores()[0]?.score || 0;
    this.titleBestScore.textContent = `#1 GLOBAL: ${topScore.toLocaleString()} PTS`;
    if (this.heroPillImg) this.heroPillImg.src = this.selectedAvatar.thumb;
    if (this.heroPillName) this.heroPillName.textContent = this.selectedAvatar.name;
    if (this.playerPseudoInput) this.playerPseudoInput.value = this.leaderboard.getPseudo();
  }

  renderLeaderboard() {
    this.leaderboardTableBody.innerHTML = '';
    const scores = this.leaderboard.getScores();
    const currentPseudo = this.leaderboard.getPseudo();

    scores.forEach((entry) => {
      const tr = document.createElement('tr');
      tr.className = `leaderboard-row ${entry.rank <= 3 ? `rank-${entry.rank}` : ''}`;
      if (entry.pseudo === currentPseudo) {
        tr.style.outline = '2px solid #ffd700';
      }

      tr.innerHTML = `
        <td style="text-align: center;"><span class="rank-badge rank-badge-${entry.rank}">#${entry.rank}</span></td>
        <td style="display: flex; align-items: center; gap: 8px;">
          <span class="player-avatar-badge">${(entry.pseudo || 'B').charAt(0).toUpperCase()}</span>
          <span>${entry.pseudo}</span>
        </td>
        <td style="text-align: right; color: #ffd700; font-weight: 900;">${entry.score.toLocaleString()}</td>
        <td style="text-align: right; color: #fff;">${entry.distance}m</td>
        <td style="text-align: center; color: #ffdda1; font-size: 0.75rem;">${entry.zone}</td>
      `;

      this.leaderboardTableBody.appendChild(tr);
    });
  }

  renderAvatarCatalog() {
    this.avatarGrid.innerHTML = '';

    const rarityClass = {
      'LEGENDARY': 'rarity-leg',
      'EPIC': 'rarity-epi',
      'RARE': 'rarity-rar',
      'COMMON': 'rarity-com',
    };

    ALL_AVATARS.forEach((av) => {
      const card = document.createElement('div');
      card.className = `avatar-card-item ${av.id === this.selectedAvatar.id ? 'selected' : ''}`;
      card.dataset.id = av.id;

      card.innerHTML = `
        <img class="avatar-card-img" src="${av.thumb}" alt="${av.name}" onerror="this.src='./assets/thumbs/tiny-baker.png'" />
        <span class="avatar-card-name">${av.name}</span>
        <span class="avatar-rarity-pill ${rarityClass[av.rarity] || 'rarity-com'}">${av.rarity}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.avatar-card-item').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        this.selectedAvatar = av;
        this.updateTitleScreenHero();
        if (this.audio) this.audio.playSlide();
        this.handlers.onAvatarSelect(av.id);
      });

      this.avatarGrid.appendChild(card);
    });
  }

  showPause() {
    this.pauseModal.style.display = 'flex';
  }

  hidePause() {
    this.pauseModal.style.display = 'none';
  }

  announceZone(zone) {
    this.zoneBannerTitle.textContent = zone.name;
    this.zoneBanner.classList.add('visible');
    this.audio.playZoneFanfare();

    setTimeout(() => {
      this.zoneBanner.classList.remove('visible');
    }, 3800);
  }

  updateHUD(distanceMeters, croissants, score, lives, player, turboPercent, isTurbo) {
    this.distVal.textContent = `${Math.floor(distanceMeters)}m`;
    this.croissantVal.textContent = croissants;
    this.scoreVal.textContent = score;

    // 3 Hearts
    if (lives !== this.currentLives) {
      this.currentLives = lives;
      for (let i = 0; i < 3; i++) {
        if (i < lives) {
          this.hearts[i].classList.remove('lost');
        } else {
          this.hearts[i].classList.add('lost');
        }
      }
    }

    // Powerups
    if (player.hasShield) {
      this.shieldBadge.classList.add('active');
    } else {
      this.shieldBadge.classList.remove('active');
    }

    if (player.hasMagnet) {
      this.magnetBadge.classList.add('active');
      this.magnetTimeText.textContent = `${Math.ceil(player.magnetTimer)}s`;
    } else {
      this.magnetBadge.classList.remove('active');
    }

    if (isTurbo) {
      this.turboBadge.classList.add('active');
    } else {
      this.turboBadge.classList.remove('active');
    }

    if (lives === 1) {
      this.dangerVignette.classList.add('active');
    } else {
      this.dangerVignette.classList.remove('active');
    }

    // Turbo Meter
    this.turboFill.style.width = `${turboPercent}%`;
    if (isTurbo) {
      this.turboText.textContent = 'HYPER BUTTER SPEED ACTIVE!';
      this.turboReadyBtn.classList.remove('visible');
      this.turboOverlay.classList.add('active');
    } else if (turboPercent >= 100) {
      this.turboText.textContent = 'TURBO READY [SHIFT]!';
      this.turboReadyBtn.classList.add('visible');
      this.turboOverlay.classList.remove('active');
    } else {
      this.turboText.textContent = `SUGAR RUSH: ${Math.floor(turboPercent)}%`;
      this.turboReadyBtn.classList.remove('visible');
      this.turboOverlay.classList.remove('active');
    }
  }

  showGameOver(distance, croissants, score, zoneName) {
    const isHighScore = this.leaderboard.isHighScore(score);

    // Save to leaderboard
    this.leaderboard.addScore(score, distance, this.selectedAvatar.id, zoneName);
    this.renderLeaderboard();
    this.updateTitleScreenHero();

    if (isHighScore) {
      this.newRecordBadge.style.display = 'block';
    } else {
      this.newRecordBadge.style.display = 'none';
    }

    this.finalDist.textContent = `${Math.floor(distance)} m`;
    this.finalCroissants.textContent = croissants;
    this.finalScore.textContent = score;
    this.bestScore.textContent = this.leaderboard.getScores()[0]?.score || score;

    this.dangerVignette.classList.remove('active');
    this.turboOverlay.classList.remove('active');

    setTimeout(() => {
      this.gameOverModal.style.display = 'flex';
    }, 600);
  }
}
