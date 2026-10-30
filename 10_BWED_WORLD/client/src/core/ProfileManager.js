/* ==========================================================================
   GESTIONNAIRE DE PROFIL & PROGRESSION AAA — BWEDTOWN
   - Sauvegarde unifiée persistante (identité, XP, niveau, monnaies, succès)
   - Persistance de la collecte de croissants et des statistiques
   - Support de l'export/import de sauvegarde (.json) et multi-profils
   ========================================================================== */

export const LEVEL_TITLES = [
  { level: 1, xpReq: 0, title: 'Crumb Apprentice', icon: '🌱' },
  { level: 2, xpReq: 120, title: 'Golden Mitron', icon: '🥖' },
  { level: 3, xpReq: 280, title: 'Sunday Pastry Chef', icon: '🥐' },
  { level: 4, xpReq: 500, title: 'Brioche Artisan', icon: '🍞' },
  { level: 5, xpReq: 800, title: 'BwedTown Master Baker', icon: '👑' },
  { level: 6, xpReq: 1200, title: 'Grand Sourdough Alchemist', icon: '✨' },
  { level: 7, xpReq: 1750, title: 'Epic Bread Trainer', icon: '⚡' },
  { level: 8, xpReq: 2500, title: 'Crispy Legend of BwedWorld', icon: '🌟' }
];

export const ACHIEVEMENTS_LIST = [
  { id: 'first_steps', name: 'First Steps', desc: 'Take your first 10 steps in BwedTown', reqType: 'steps', reqCount: 10, xp: 50, coins: 50, icon: '👟' },
  { id: 'hiker', name: 'Urban Stroller', desc: 'Walk 100 tiles across the town districts', reqType: 'steps', reqCount: 100, xp: 120, coins: 100, icon: '🚶' },
  { id: 'first_croissant', name: 'The First Croissant', desc: 'Find your first hidden Golden Croissant', reqType: 'croissants', reqCount: 1, xp: 100, coins: 75, icon: '🥐' },
  { id: 'croissant_half', name: 'Fine Gourmet', desc: 'Collect 5 Golden Croissants', reqType: 'croissants', reqCount: 5, xp: 250, coins: 200, icon: '🧺' },
  { id: 'croissant_master', name: 'Grand Master Baker', desc: 'Discover all 10 Golden Croissants in town', reqType: 'croissants', reqCount: 10, xp: 600, coins: 500, icon: '🏆' },
  { id: 'first_chat', name: 'Village Greetings', desc: 'Send your first message in the chat', reqType: 'chat', reqCount: 1, xp: 50, coins: 30, icon: '💬' },
  { id: 'socialite', name: 'Town Socialite', desc: 'Send 5 messages with 3D chat bubbles', reqType: 'chat', reqCount: 5, xp: 120, coins: 80, icon: '📢' },
  { id: 'first_furniture', name: 'Habbo Homeowner', desc: 'Place your first furniture item in your room', reqType: 'furniture', reqCount: 1, xp: 100, coins: 60, icon: '🛋️' },
  { id: 'interior_designer', name: 'Interior Architect', desc: 'Place at least 5 furniture items in your room', reqType: 'furniture', reqCount: 5, xp: 250, coins: 150, icon: '🏡' }
];

export class ProfileManager {
  static STORAGE_KEY = 'bwed_player_profile';
  static PROFILES_LIST_KEY = 'bwed_profiles_registry';

  constructor(options = {}) {
    this.audio = options.audio || null;
    this.toast = options.toast || null;
    this.onProfileChange = options.onProfileChange || null;

    this.profile = this.loadOrCreateProfile();
  }

  loadOrCreateProfile() {
    let profile = null;
    try {
      const saved = localStorage.getItem(ProfileManager.STORAGE_KEY);
      if (saved) {
        profile = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('[ProfileManager] Erreur lecture profil, réinitialisation:', e);
    }

    if (!profile) {
      profile = this.createDefaultProfile();
      this.saveProfile(profile);
    } else {
      // Migration / Complétion des champs manquants si nécessaire
      this.migrateProfileSchema(profile);
    }

    // Enregistrement dans le registre multi-profils
    this.registerProfileInRegistry(profile.id, profile.nickname);

    return profile;
  }

  createDefaultProfile(nickname = null) {
    const defaultNames = ['Chef Émile', 'Toast Master', 'Baker Red', 'Matcha Spark', 'Honey Ash'];
    const randomName = defaultNames[Math.floor(Math.random() * defaultNames.length)] + '_' + Math.floor(100 + Math.random() * 900);
    const chosenName = nickname || localStorage.getItem('bwed_world_pseudo') || randomName;
    const chosenAvatar = localStorage.getItem('bwed_world_avatar') || 'tiny-baker';

    return {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      nickname: chosenName,
      title: 'Crumb Apprentice',
      avatarId: chosenAvatar,
      level: 1,
      xp: 0,
      xpNext: 120,
      bwedCoins: 250,
      croissantsCollectedIds: [], // Unique IDs of collected croissants
      totalCroissantsFound: 0,
      stepsWalked: 0,
      messagesSent: 0,
      furniturePlacedCount: 0,
      badges: [
        { id: 'badge_welcome', name: 'Welcome to BwedTown', icon: '🍞', date: new Date().toLocaleDateString('en-US'), desc: 'Official arrival in the gourmet city of BwedTown.' }
      ],
      completedAchievements: {},
      createdAt: Date.now(),
      lastSeenAt: Date.now()
    };
  }

  migrateProfileSchema(p) {
    if (!Array.isArray(p.croissantsCollectedIds)) p.croissantsCollectedIds = [];
    if (typeof p.totalCroissantsFound !== 'number') p.totalCroissantsFound = p.croissantsCollectedIds.length;
    if (typeof p.stepsWalked !== 'number') p.stepsWalked = 0;
    if (typeof p.messagesSent !== 'number') p.messagesSent = 0;
    if (typeof p.furniturePlacedCount !== 'number') p.furniturePlacedCount = 0;
    if (!p.completedAchievements) p.completedAchievements = {};
    if (!Array.isArray(p.badges)) p.badges = [];
    if (!p.bwedCoins) p.bwedCoins = 250;
    if (!p.xpNext) p.xpNext = 120;
    this.updateTitleByLevel(p);
  }

  saveProfile(profile = this.profile) {
    try {
      profile.lastSeenAt = Date.now();
      localStorage.setItem(ProfileManager.STORAGE_KEY, JSON.stringify(profile));
      // Maintien rétro-compatible des clés simples
      localStorage.setItem('bwed_world_pseudo', profile.nickname);
      localStorage.setItem('bwed_world_avatar', profile.avatarId);
    } catch (e) {
      console.error('[ProfileManager] Échec sauvegarde du profil:', e);
    }
    this.notifyUpdate();
  }

  notifyUpdate() {
    if (typeof this.onProfileChange === 'function') {
      this.onProfileChange(this.profile);
    }
  }

  // --- ACTIONS SUR L'IDENTITÉ ---
  setNickname(newName) {
    const trimmed = (newName || '').trim();
    if (!trimmed || trimmed.length < 2) return false;
    this.profile.nickname = trimmed.substring(0, 20);
    this.saveProfile();
    this.registerProfileInRegistry(this.profile.id, this.profile.nickname);
    return true;
  }

  setAvatarId(newAvatarId) {
    this.profile.avatarId = newAvatarId;
    this.saveProfile();
  }

  // --- PROGRESSION XP & NIVEAU ---
  addXP(amount, sourceHint = '') {
    if (amount <= 0) return;
    this.profile.xp += amount;

    // Vérification de la montée de niveau
    let levelChanged = false;
    while (this.profile.xp >= this.profile.xpNext && this.profile.level < LEVEL_TITLES.length) {
      this.profile.level++;
      const currentLevelDef = LEVEL_TITLES.find(l => l.level === this.profile.level);
      const nextLevelDef = LEVEL_TITLES.find(l => l.level === this.profile.level + 1);
      this.profile.xpNext = nextLevelDef ? nextLevelDef.xpReq : this.profile.xp + 1000;
      this.profile.title = currentLevelDef ? currentLevelDef.title : this.profile.title;
      this.profile.bwedCoins += 100; // Bonus de pièces à chaque niveau
      levelChanged = true;
    }

    if (levelChanged) {
      this.toast?.showLevelUp(this.profile.level, this.profile.title, 100);
      this.audio?.playCoinCollect?.();
    }

    this.saveProfile();
  }

  updateTitleByLevel(p) {
    const def = LEVEL_TITLES.find(l => l.level === p.level) || LEVEL_TITLES[0];
    p.title = def.title;
    const nextDef = LEVEL_TITLES.find(l => l.level === p.level + 1);
    p.xpNext = nextDef ? nextDef.xpReq : p.xp + 1000;
  }

  addBwedCoins(amount) {
    this.profile.bwedCoins = Math.max(0, this.profile.bwedCoins + amount);
    this.saveProfile();
  }

  // --- ÉVÉNEMENTS DU GAMEPLAY ---
  recordStep() {
    this.profile.stepsWalked++;
    if (this.profile.stepsWalked % 25 === 0) {
      this.addXP(10, 'Walking');
    }
    this.checkAchievements('steps', this.profile.stepsWalked);
    if (this.profile.stepsWalked % 10 === 0) {
      this.saveProfile();
    }
  }

  recordChatMessage() {
    this.profile.messagesSent++;
    this.addXP(25, 'Chat Bubble');
    this.checkAchievements('chat', this.profile.messagesSent);
    this.saveProfile();
  }

  recordFurniturePlaced() {
    this.profile.furniturePlacedCount++;
    this.addXP(50, 'Room Decor');
    this.checkAchievements('furniture', this.profile.furniturePlacedCount);
    this.saveProfile();
  }

  collectCroissant(croissantId) {
    if (!this.profile.croissantsCollectedIds.includes(croissantId)) {
      this.profile.croissantsCollectedIds.push(croissantId);
      this.profile.totalCroissantsFound++;
      this.addXP(100, 'Golden Croissant');
      this.addBwedCoins(50);

      this.toast?.showCroissantCollected(this.profile.croissantsCollectedIds.length, 10, 100);
      this.checkAchievements('croissants', this.profile.totalCroissantsFound);

      // Si les 10 croissants sont trouvés : badge légendaire !
      if (this.profile.croissantsCollectedIds.length >= 10) {
        this.unlockBadge('badge_croissant_master', 'Grand Master Baker', '🏆', 'Discovered all 10 Golden Croissants in BwedTown.');
      }

      this.saveProfile();
      return true;
    }
    return false;
  }

  hasCollectedCroissant(croissantId) {
    return this.profile.croissantsCollectedIds.includes(croissantId);
  }

  checkAchievements(type, currentCount) {
    for (const ach of ACHIEVEMENTS_LIST) {
      if (ach.reqType === type && currentCount >= ach.reqCount && !this.profile.completedAchievements[ach.id]) {
        this.profile.completedAchievements[ach.id] = Date.now();
        this.addXP(ach.xp, ach.name);
        this.addBwedCoins(ach.coins);
        this.toast?.showAchievement(ach.name, ach.xp);
      }
    }
  }

  unlockBadge(id, name, icon, desc) {
    if (!this.profile.badges.some(b => b.id === id)) {
      this.profile.badges.push({
        id,
        name,
        icon,
        desc,
        date: new Date().toLocaleDateString('fr-FR')
      });
      this.toast?.show({
        icon,
        title: 'Badge Obtenu !',
        message: `<strong>${name}</strong> ajouté à votre passeport.`,
        tag: 'BADGE',
        type: 'badge'
      });
      this.saveProfile();
    }
  }

  // --- MULTI-PROFILS ET GESTIONNAIRE DE REGISTRE ---
  registerProfileInRegistry(id, name) {
    try {
      const reg = JSON.parse(localStorage.getItem(ProfileManager.PROFILES_LIST_KEY) || '[]');
      const index = reg.findIndex(p => p.id === id);
      if (index >= 0) {
        reg[index].name = name;
        reg[index].updatedAt = Date.now();
      } else {
        reg.push({ id, name, updatedAt: Date.now() });
      }
      localStorage.setItem(ProfileManager.PROFILES_LIST_KEY, JSON.stringify(reg));
    } catch (e) {}
  }

  getProfilesList() {
    try {
      return JSON.parse(localStorage.getItem(ProfileManager.PROFILES_LIST_KEY) || '[]');
    } catch (e) {
      return [{ id: this.profile.id, name: this.profile.nickname }];
    }
  }

  switchProfile(profileId) {
    if (profileId === this.profile.id) return;
    // Sauvegarder le profil actuel dans une clé dédiée
    localStorage.setItem(`bwed_profile_${this.profile.id}`, JSON.stringify(this.profile));

    // Charger le nouveau profil
    const targetSaved = localStorage.getItem(`bwed_profile_${profileId}`);
    if (targetSaved) {
      this.profile = JSON.parse(targetSaved);
      this.saveProfile(this.profile);
      window.location.reload();
    }
  }

  createNewProfile(nickname) {
    // Sauvegarder l'actuel
    localStorage.setItem(`bwed_profile_${this.profile.id}`, JSON.stringify(this.profile));

    // Créer un nouveau
    this.profile = this.createDefaultProfile(nickname);
    this.saveProfile(this.profile);
    window.location.reload();
  }

  // --- EXPORT & IMPORT DE SAUVEGARDE COMPLÈTE (.JSON) ---
  exportFullSaveJSON() {
    const fullBackup = {
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.profile,
      inventory: JSON.parse(localStorage.getItem('bwed_player_inventory') || '[]'),
      apartmentLayout: JSON.parse(localStorage.getItem('bwed_apartment_furniture') || '[]')
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bwedtown_save_${this.profile.nickname.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.toast?.show({
      icon: '💾',
      title: 'Sauvegarde exportée !',
      message: 'Fichier JSON téléchargé. Vous pouvez le restaurer sur n\'importe quel appareil.',
      type: 'success'
    });
  }

  importFullSaveJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (!data.profile || !data.profile.nickname) {
        throw new Error('Format de sauvegarde BwedTown invalide');
      }

      this.profile = data.profile;
      this.migrateProfileSchema(this.profile);
      this.saveProfile(this.profile);

      if (Array.isArray(data.inventory)) {
        localStorage.setItem('bwed_player_inventory', JSON.stringify(data.inventory));
      }
      if (Array.isArray(data.apartmentLayout)) {
        localStorage.setItem('bwed_apartment_furniture', JSON.stringify(data.apartmentLayout));
      }

      this.toast?.show({
        icon: '✅',
        title: 'Profil restauré avec succès !',
        message: `Bienvenue de retour, ${this.profile.nickname} !`,
        type: 'success'
      });

      setTimeout(() => {
        window.location.reload();
      }, 800);
      return true;
    } catch (err) {
      console.error('[ProfileManager] Échec import:', err);
      alert('Erreur : Fichier de sauvegarde corrompu ou incompatible.');
      return false;
    }
  }
}
