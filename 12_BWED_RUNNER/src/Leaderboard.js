/* ==========================================================================
   BWED BUTTER ESCAPE — LEADERBOARD SYSTEM (LOCAL & ONLINE READY)
   Manages top scores, player pseudo, persistence in localStorage,
   and provides async API hooks for future global Bwedverse server sync.
   ========================================================================== */

const STORAGE_KEY_LEADERBOARD = 'bwed_runner_leaderboard_v1';
const STORAGE_KEY_PSEUDO = 'bwed_runner_pseudo';

export const DEFAULT_LEADERBOARD = [
  { rank: 1, pseudo: 'Master_Croissant', score: 18420, distance: 1640, avatar: 'cozy-shiba', zone: 'Zone 4' },
  { rank: 2, pseudo: 'ShibaSupreme', score: 15210, distance: 1390, avatar: 'cozy-shiba', zone: 'Zone 4' },
  { rank: 3, pseudo: 'Chef_Emile_V', score: 12850, distance: 1150, avatar: 'tiny-baker', zone: 'Zone 3' },
  { rank: 4, pseudo: 'ButterKnight', score: 9940, distance: 920, avatar: 'honey-knight', zone: 'Zone 3' },
  { rank: 5, pseudo: 'ToastBandit_99', score: 7420, distance: 710, avatar: 'toast-bandit', zone: 'Zone 2' },
  { rank: 6, pseudo: 'SuperBwed_OG', score: 5800, distance: 580, avatar: 'super-hero-bwed', zone: 'Zone 2' },
  { rank: 7, pseudo: 'HoneyBee', score: 4120, distance: 420, avatar: 'tiny-baker', zone: 'Zone 1' },
];

export class LeaderboardManager {
  constructor() {
    this.scores = this.loadScores();
    this.playerPseudo = localStorage.getItem(STORAGE_KEY_PSEUDO) || 'BwedRunner';
  }

  loadScores() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load leaderboard from storage, using defaults:', e);
    }
    return [...DEFAULT_LEADERBOARD];
  }

  saveScores() {
    try {
      localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(this.scores));
    } catch (e) {
      console.warn('Failed to save leaderboard:', e);
    }
  }

  getPseudo() {
    return this.playerPseudo;
  }

  setPseudo(pseudo) {
    const clean = (pseudo || '').trim().slice(0, 16) || 'BwedRunner';
    this.playerPseudo = clean;
    localStorage.setItem(STORAGE_KEY_PSEUDO, clean);
    return clean;
  }

  getScores() {
    return this.scores;
  }

  isHighScore(score) {
    if (this.scores.length < 10) return true;
    return score > this.scores[this.scores.length - 1].score;
  }

  addScore(score, distance, avatarId, zoneName) {
    const newEntry = {
      pseudo: this.playerPseudo,
      score: Math.floor(score),
      distance: Math.floor(distance),
      avatar: avatarId || 'cozy-shiba',
      zone: zoneName || 'Zone 1',
      date: new Date().toLocaleDateString('en-US'),
      isPlayer: true,
    };

    this.scores.push(newEntry);
    // Sort descending by score
    this.scores.sort((a, b) => b.score - a.score);
    // Keep top 10
    this.scores = this.scores.slice(0, 10);
    // Re-assign ranks
    this.scores.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    this.saveScores();

    // Online global sync hook (future backend ready)
    this.syncOnlineAsync(newEntry).catch(() => {});

    return newEntry;
  }

  // Future hook for global Bwedverse server
  async syncOnlineAsync(entry) {
    // When ready to connect to Bwedverse API:
    // return fetch('https://api.bwedverse.com/leaderboard', { method: 'POST', body: JSON.stringify(entry) });
    return Promise.resolve({ status: 'offline_mode', entry });
  }
}
