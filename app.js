/**
 * BWEDVERSE HUB — Official Interactive Controller
 * Collectible Vinyl Figures & Nintendo 3D Diorama Board Game
 * English copy, human/familiar tone, zero emojis.
 */

// Procedural WebAudio FX (Zero external dependencies)
class BwedHubAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  play(freq = 440, type = 'sine', duration = 0.12, gainVal = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (_) {}
  }
  click() {
    this.play(640, 'triangle', 0.08, 0.05);
  }
  heroSelect() {
    this.play(523.25, 'triangle', 0.08, 0.06);
    setTimeout(() => this.play(659.25, 'triangle', 0.12, 0.08), 70);
    setTimeout(() => this.play(783.99, 'sine', 0.2, 0.09), 140);
  }
}

const audio = new BwedHubAudio();

// 18 Heroes Catalog (Canon data synced with 3D board game, natural English)
const heroes = [
  {
    id: 'super-hero-bwed',
    name: 'Super Bwed',
    role: 'The Crust Crusader',
    cat: 'adventurers',
    color: '#3a86ff',
    talent: { name: 'HERO LEAP', cue: 'FLY +3 & 2 COINS', desc: 'Leap 3 spaces forward with golden invulnerability and grab 2 coins.' },
    desc: 'Cape fluttering in the warm oven breeze. Leaps across Bwedville to make sure no golden slice gets left behind.'
  },
  {
    id: 'glow-toast',
    name: 'Glow Toast',
    role: 'The Golden One',
    cat: 'adventurers',
    color: '#f2c94c',
    talent: { name: 'GOLDEN RISE', cue: 'NEXT ROLL +2', desc: 'Add +2 to your next dice roll result.' },
    desc: 'Pure optimism, golden shine, and suspiciously good at landing directly on bonus tiles.'
  },
  {
    id: 'brave-firefighter',
    name: 'Blaze Bwed',
    role: 'The Oven Rescuer',
    cat: 'adventurers',
    color: '#e63946',
    talent: { name: 'HOSE BOOST', cue: 'MOVE +3 & SAFE', desc: 'Rocket forward 3 spaces and gain full immunity to oven burner tiles.' },
    desc: 'Fearless even in a 500-degree toaster. Turns scorched disasters into golden opportunities.'
  },
  {
    id: 'tiny-baker',
    name: 'Toastie Baker',
    role: 'The Master Chef',
    cat: 'adventurers',
    color: '#ff9f1c',
    talent: { name: 'FRESH BATCH', cue: '+1 GOLDEN LOAF', desc: 'Bakes 1 Golden Loaf star immediately and pockets 1 coin.' },
    desc: 'Flour on the cheeks, rolling pin in hand. Whipping up fresh golden loaves right on the board.'
  },
  {
    id: 'crimson-samurai',
    name: 'Crimson Samurai',
    role: 'The Rising Blade',
    cat: 'fighters',
    color: '#c65347',
    talent: { name: 'IRON CRUST', cue: 'GUARANTEED RISK WIN', desc: 'Your next risk space is guaranteed to pay out the jackpot.' },
    desc: 'Noble posture and razor-sharp crust. Absolutely zero patience for a lukewarm oven.'
  },
  {
    id: 'saiyan-toast',
    name: 'Saiyan Toast',
    role: 'The Super Slice',
    cat: 'fighters',
    color: '#ffbe0b',
    talent: { name: 'SUPER CHARGE', cue: '+2 ROLL & +2 COINS', desc: 'Gain a +2 roll bonus and pocket 2 coins on the spot.' },
    desc: 'Caloric power level over 9,000. Comes with a glowing golden aura at every round.'
  },
  {
    id: 'cloud-ninja',
    name: 'Cloud Shinobi',
    role: 'The Rogue Crumb',
    cat: 'fighters',
    color: '#d90429',
    talent: { name: 'CLOUD BLINK', cue: 'WARP +4 SPACES', desc: 'Teleport 4 spaces closer to the Golden Loaf immediately.' },
    desc: 'Glides like steam from fresh brioche. Strikes before the butter even starts to melt.'
  },
  {
    id: 'shadow-ninja',
    name: 'Shadow Ninja',
    role: 'The Night Slice',
    cat: 'fighters',
    color: '#495057',
    talent: { name: 'SMOKE BOMB', cue: 'STEAL 2c & ESCAPE', desc: 'Steal 2 coins from the richest rival and take an extra step.' },
    desc: 'Invisible inside the toaster dark slots. The undisputed master of the silent midnight heist.'
  },
  {
    id: 'toast-bandit',
    name: 'Toast Bandit',
    role: 'The Wild Outlaw',
    cat: 'rogues',
    color: '#f06a3c',
    talent: { name: 'OUTLAW DASH', cue: 'DASH +2 SPACES', desc: 'Move 2 extra spaces immediately after rolling.' },
    desc: 'Fast hands, soft heart, and an unhealthy obsession with the highest-risk tiles on the board.'
  },
  {
    id: 'crumb-burglar',
    name: 'Crumb Burglar',
    role: 'The Vault Thief',
    cat: 'rogues',
    color: '#2ec4b6',
    talent: { name: 'HEIST SACK', cue: 'STEAL 3c FROM 1ST', desc: 'Steal 3 coins straight from whoever is currently leading the game.' },
    desc: 'Striped mask, heist sack, and a wide grin whenever the Bwedbank vault is within reach.'
  },
  {
    id: 'toast-tycoon',
    name: 'Toast Tycoon',
    role: 'The Bwedbank Boss',
    cat: 'rogues',
    color: '#06d6a0',
    talent: { name: 'DIVIDEND', cue: 'PAYOUT +4c MIN', desc: 'Earn 1 coin for every Golden Loaf you hold (minimum 4 coins guaranteed).' },
    desc: 'Bowler hat and sharp pinstripes. Manages the dough reserves of Bwedville with an iron hand.'
  },
  {
    id: 'judge-gaveltoes',
    name: 'Judge Gaveltoes',
    role: 'The Supreme Loaf',
    cat: 'rogues',
    color: '#6c757d',
    talent: { name: 'BAKERY TAX', cue: 'TAX ALL PLAYERS', desc: 'Collect 1 coin of court tax from every rival baker on the board.' },
    desc: 'Presides over the High Court of Crumbs. Order and respect in the bakery, or else.'
  },
  {
    id: 'crimson-mage',
    name: 'Crimson Mage',
    role: 'The Spell Slice',
    cat: 'mages',
    color: '#9a79d6',
    talent: { name: 'ARCANE DICE', cue: 'BEST OF 2 +2c', desc: 'Roll two dice, keep the higher number, and take 2 bonus coins.' },
    desc: 'Dramatic, mysterious, and obsessed with cosmic yeast portals and arcane dough incantations.'
  },
  {
    id: 'frankenbwed',
    name: 'FrankenBwed',
    role: 'The Electric One',
    cat: 'mages',
    color: '#78b86b',
    talent: { name: 'CRUMB MAGNET', cue: '+3c & MAGNET', desc: 'Collect 3 coins right now and magnetize the next Golden Loaf.' },
    desc: 'A stitched-up slice running on static electricity and high-voltage kitchen snacks.'
  },
  {
    id: 'rusty-buttonbot',
    name: 'Rusty Buttonbot',
    role: 'The Toaster Mech',
    cat: 'mages',
    color: '#5bc0be',
    talent: { name: 'OVERCLOCK', cue: 'DOUBLE ROLL x2', desc: 'Multiply your next dice roll by two.' },
    desc: 'Half vintage kitchen appliance, half soft bread. Computes optimal crumb trajectories on the fly.'
  },
  {
    id: 'nerdy-buddy',
    name: 'Nerdy Gadget',
    role: 'The 8-Bit Genius',
    cat: 'mages',
    color: '#8338ec',
    talent: { name: 'CHEAT CODE', cue: 'MIN ROLL 6', desc: 'Guarantees a roll of 6 or higher on your next turn.' },
    desc: 'Armed with a retro handheld and 200 IQ board game algorithms. Speedrunning Bwedville.'
  },
  {
    id: 'choco-drip',
    name: 'Choco Drip',
    role: 'The Sweet Glaze',
    cat: 'mages',
    color: '#8d5524',
    talent: { name: 'SUGAR COAT', cue: '+4 SWEET COINS', desc: 'Collect 4 sweet chocolate coins immediately.' },
    desc: 'Coated in rich hazelnut spread. Every baker on the board wants a piece of this slice.'
  },
  {
    id: 'whale-buddy',
    name: 'Whale Buddy',
    role: 'The Big Splash',
    cat: 'mages',
    color: '#3a86ff',
    talent: { name: 'WHALE PUMP', cue: '+5 BANK COINS', desc: 'Pump 5 coins straight out of the Bwedbank central reserve.' },
    desc: 'Dressed as the legendary crypto whale. Every step he takes creates a tidal wave in the bank.'
  }
];

// 12 Town & Board Buildings for the Crumb Run 3D section
const townBuildings = [
  {
    id: '01-grand-oven-hq',
    img: './assets/buildings/concepts/01-grand-oven-hq.jpg',
    name: 'Grand Oven HQ',
    role: 'TOWN HALL',
    desc: 'The beating thermal heart of Bwedville. Where golden laws and high-heat policies are baked.'
  },
  {
    id: '02-patisserie-coin',
    img: './assets/buildings/concepts/02-patisserie-coin.jpg',
    name: 'Pâtisserie Coin',
    role: 'POWER-UP SHOP',
    desc: 'The board shop where bakers trade dough for Turbo Croissants, Toaster Warps, and Star Yeast.'
  },
  {
    id: '03-bwedbank-vault',
    img: './assets/buildings/concepts/03-bwedbank-vault.jpg',
    name: 'Bwedbank Vault',
    role: 'CHOCOLATE VAULT',
    desc: 'The reinforced chocolate safe. Land on the vault space with the right roll to clean out the reserve.'
  },
  {
    id: '15-honey-pot-tavern',
    img: './assets/buildings/concepts/15-honey-pot-tavern.jpg',
    name: 'Honey Pot Tavern',
    role: 'ADVENTURER TAVERN',
    desc: 'Carved inside an amber ceramic honey jar. Where outlaws, ninjas, and weary slices gather between rounds.'
  },
  {
    id: '08-espresso-fountain-plaza',
    img: './assets/buildings/concepts/08-espresso-fountain-plaza.jpg',
    name: 'Espresso Fountain',
    role: 'CENTRAL PLAZA',
    desc: 'The biscuit-paved agora where a warm espresso geyser keeps the entire board caffeinated.'
  },
  {
    id: '05-arcade-duel',
    img: './assets/buildings/concepts/05-arcade-duel.jpg',
    name: 'Arcade Duel Arena',
    role: '1V1 SHOWDOWN',
    desc: 'High-stakes head-to-head brawls. Two slices enter, only one leaves with the coins.'
  },
  {
    id: '04-galeries-boutique',
    img: './assets/buildings/concepts/04-galeries-boutique.jpg',
    name: 'Galeries Boutique',
    role: 'LUXURY WARES',
    desc: 'Designer crumbs, luxury crust polishes, and rare collectibles for high-rolling bread.'
  },
  {
    id: '06-portal-observatory',
    img: './assets/buildings/concepts/06-portal-observatory.jpg',
    name: 'Portal Observatory',
    role: 'WARP GATE',
    desc: 'Telescopes tracking cosmic yeast clouds. Teleports bakers straight to the Golden Loaf.'
  },
  {
    id: '10-butter-dish-train-station',
    img: './assets/buildings/concepts/10-butter-dish-train-station.jpg',
    name: 'Butter Dish Station',
    role: 'TRANSIT RAIL',
    desc: 'The buttery express line. Hop on the locomotive to bypass danger tiles and rocket forward.'
  },
  {
    id: '00-cottage-toaster-bakery',
    img: './assets/buildings/concepts/00-cottage-toaster-bakery.jpg',
    name: 'Cottage Bakery',
    role: 'STARTING LINE',
    desc: 'Where every fresh slice is born. The warm cottage that kicks off each Crumb Run match.'
  },
  {
    id: '18-waffle-iron-dojo',
    img: './assets/buildings/concepts/18-waffle-iron-dojo.jpg',
    name: 'Waffle Iron Dojo',
    role: 'COMBAT TRAINING',
    desc: 'Where samurai slices temper their crust to survive the hottest oven burner spaces.'
  },
  {
    id: '106-ride-bumper-cars-donut',
    img: './assets/buildings/concepts/106-ride-bumper-cars-donut.jpg',
    name: 'Donut Bumper Cars',
    role: 'MINIGAME ARENA',
    desc: 'Frosting-covered bumper donut chaos. The setting for our fiercest between-round minigames.'
  }
];

// Initialize the 5-Track Moving Mosaic Wallpaper (100% Focused on Bwed: Memes, Comics, Adventures, PFPs)
function initMosaicWallpaper() {
  const container = document.getElementById('mosaicWallpaper');
  if (!container) return;

  const catalog = (typeof BWED_DEPOT_CATALOG !== 'undefined') ? BWED_DEPOT_CATALOG : [];
  // Strictly Bwed pictures: exclude locations, dice and buildings
  const bwedOnly = catalog.filter(it => 
    it.category !== 'locations' && 
    !it.title.toLowerCase().includes('dice') && 
    !it.title.toLowerCase().includes('building')
  ).map(it => it.path);

  // Fallback if catalog not loaded yet
  const fallbackList = heroes.map(h => `./assets/pawns/thumbs/${h.id}.png`);
  const mediaList = bwedOnly.length > 0 ? bwedOnly : fallbackList;

  // Split evenly into 5 distinct tracks
  const trackCount = 5;
  const tracks = [[], [], [], [], []];
  mediaList.forEach((src, idx) => {
    tracks[idx % trackCount].push(src);
  });

  function renderTrack(trackEl, items) {
    if (!trackEl) return;
    const full = [...items, ...items]; // Duplicate for seamless infinite marquee
    trackEl.innerHTML = full.map(src => {
      const isPfp = src.includes('/pawns/thumbs/');
      return `
        <div class="mosaic-tile ${isPfp ? 'pfp-tile' : ''}">
          <img src="${src}" alt="Bwed" loading="lazy" />
        </div>
      `;
    }).join('');
  }

  for (let i = 0; i < 5; i++) {
    const tEl = container.querySelector(`.track-${i + 1}`);
    if (tEl && tracks[i].length > 0) renderTrack(tEl, tracks[i]);
  }
}

// Official MP3 Soundtrack Player with Visitor Controls (Play, Pause, Mute, Volume Slider, Next Track)
function initMusicPlayer() {
  const playlist = [
    { title: 'Bakery Morning', src: './assets/audio/music/bakery-morning.mp3' },
    { title: 'Board Game Fever', src: './assets/audio/music/board-game-fever.mp3' },
    { title: 'Cozy Bakery Morning', src: './assets/audio/music/cozy-bakery-morning.mp3' },
    { title: 'Kitchen Caper', src: './assets/audio/music/kitchen-caper.mp3' },
    { title: 'Board Game Fever (Alt)', src: './assets/audio/music/board-game-fever-2.mp3' },
    { title: 'Kitchen Caper (Alt)', src: './assets/audio/music/kitchen-caper-2.mp3' },
    { title: 'Bakery Morning (Alt)', src: './assets/audio/music/bakery-morning-2.mp3' }
  ];

  const widget = document.getElementById('musicPlayerWidget');
  const btnPlay = document.getElementById('musicPlayBtn');
  const btnNext = document.getElementById('musicNextBtn');
  const btnMute = document.getElementById('musicMuteBtn');
  const trackNameEl = document.getElementById('musicTrackName');
  const volSlider = document.getElementById('musicVolumeSlider');
  const volNum = document.getElementById('musicVolNum');

  if (!widget) return;

  let currentTrackIdx = parseInt(localStorage.getItem('bwed_music_track') || '0', 10);
  if (currentTrackIdx < 0 || currentTrackIdx >= playlist.length) currentTrackIdx = 0;

  let volume = parseFloat(localStorage.getItem('bwed_music_volume') || '0.4');
  let isMuted = localStorage.getItem('bwed_music_muted') === 'true';
  let isPlaying = false;

  const audioEl = new Audio();
  audioEl.preload = 'metadata';
  audioEl.volume = isMuted ? 0 : volume;

  function loadTrack(index) {
    currentTrackIdx = index;
    localStorage.setItem('bwed_music_track', String(currentTrackIdx));
    const track = playlist[currentTrackIdx];
    audioEl.src = track.src;
    if (trackNameEl) trackNameEl.textContent = track.title;
  }

  function playTrack() {
    audioEl.play().then(() => {
      isPlaying = true;
      localStorage.setItem('bwed_music_paused', 'false');
      updateUI();
    }).catch(() => {
      isPlaying = false;
      updateUI();
    });
  }

  function pauseTrack() {
    audioEl.pause();
    isPlaying = false;
    localStorage.setItem('bwed_music_paused', 'true');
    updateUI();
  }

  function nextTrack() {
    const nextIdx = (currentTrackIdx + 1) % playlist.length;
    loadTrack(nextIdx);
    if (isPlaying) {
      playTrack();
    }
  }

  function setVolume(val) {
    volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('bwed_music_volume', String(volume));
    if (!isMuted) {
      audioEl.volume = volume;
    }
    updateUI();
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('bwed_music_muted', String(isMuted));
    audioEl.volume = isMuted ? 0 : volume;
    updateUI();
  }

  function updateUI() {
    widget.classList.toggle('is-playing', isPlaying);

    const playIcon = widget.querySelector('.icon-play');
    const pauseIcon = widget.querySelector('.icon-pause');
    if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
    if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';

    const pct = isMuted ? 0 : Math.round(volume * 100);
    if (volSlider) volSlider.value = pct;
    if (volNum) volNum.textContent = `${pct}%`;

    const volOn = widget.querySelector('.icon-vol-on');
    const volOff = widget.querySelector('.icon-vol-off');
    if (volOn) volOn.style.display = (isMuted || volume === 0) ? 'none' : 'block';
    if (volOff) volOff.style.display = (isMuted || volume === 0) ? 'block' : 'none';
  }

  audioEl.addEventListener('ended', nextTrack);

  if (btnPlay) {
    btnPlay.addEventListener('click', () => {
      if (isPlaying) pauseTrack();
      else playTrack();
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', nextTrack);
  }

  if (btnMute) {
    btnMute.addEventListener('click', toggleMute);
  }

  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      if (isMuted) toggleMute();
      setVolume(e.target.value / 100);
    });
  }

  loadTrack(currentTrackIdx);
  updateUI();

  // Autoplay soundtrack on landing page arrival; user can pause whenever they like
  function attemptAutoplay() {
    audioEl.play().then(() => {
      isPlaying = true;
      updateUI();
    }).catch(() => {
      // Browser blocked zero-interaction autoplay; start immediately on first user touch, click, or scroll
      const unlockAudio = () => {
        ['click', 'pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
          window.removeEventListener(evt, unlockAudio, { passive: true });
        });
        if (!isPlaying) {
          playTrack();
        }
      };
      ['click', 'pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { once: true, passive: true });
      });
    });
  }

  // Trigger autoplay attempt
  setTimeout(attemptAutoplay, 300);
}

// 3D Illuminated Collector Showcase Cabinet (All 18 Vinyl Figures on Shelves)
function initCollectorCabinet() {
  const cabinet = document.getElementById('collectorCabinet');
  if (!cabinet) return;

  const row1 = document.getElementById('shelfRow1');
  const row2 = document.getElementById('shelfRow2');
  const row3 = document.getElementById('shelfRow3');
  const dockName = document.getElementById('dockHeroName');
  const dockRole = document.getElementById('dockHeroRole');
  const dockAvatar = document.getElementById('dockAvatar');
  const btnInspect = document.getElementById('btnDockInspect');
  const btnPlay = document.getElementById('btnDockPlay');

  let activeHeroId = 'super-hero-bwed';

  function renderRow(container, heroList) {
    if (!container) return;
    container.innerHTML = heroList.map(h => `
      <div class="shelf-figure-item ${h.id === activeHeroId ? 'active' : ''}" data-hero="${h.id}" title="${h.name}">
        <span class="shelf-figure-tooltip">${h.name} &bull; ${h.role}</span>
        <img class="shelf-figure-img" src="./assets/pawns/thumbs/${h.id}.png" alt="${h.name}" loading="lazy" />
        <div class="shelf-pedestal"></div>
      </div>
    `).join('');
  }

  // Tier 1 (top): Adventurers & Champions (0-5)
  // Tier 2 (mid): Fighters, Rogues & Mages (6-11)
  // Tier 3 (bottom): Bosses, Mechs & Companions (12-17)
  const tier1 = heroes.slice(0, 6);
  const tier2 = heroes.slice(6, 12);
  const tier3 = heroes.slice(12, 18);

  renderRow(row1, tier1);
  renderRow(row2, tier2);
  renderRow(row3, tier3);

  function setActiveHero(heroId, triggerAudio = false) {
    const hero = heroes.find(h => h.id === heroId) || heroes[0];
    activeHeroId = hero.id;

    if (triggerAudio) audio.heroSelect();

    if (dockName) dockName.textContent = hero.name;
    if (dockRole) dockRole.textContent = `${hero.role} • ${hero.talent.name} (${hero.talent.cue})`;
    if (dockAvatar) {
      dockAvatar.src = `./assets/pawns/thumbs/${hero.id}.png`;
      dockAvatar.alt = hero.name;
    }
    if (btnPlay) {
      btnPlay.href = `./party-board.html?hero=${hero.id}`;
    }

    cabinet.querySelectorAll('.shelf-figure-item').forEach(el => {
      el.classList.toggle('active', el.dataset.hero === hero.id);
    });
  }

  cabinet.querySelectorAll('.shelf-figure-item').forEach(item => {
    item.addEventListener('mouseenter', () => {
      setActiveHero(item.dataset.hero, false);
    });

    item.addEventListener('click', () => {
      setActiveHero(item.dataset.hero, true);
      // Trigger Hero Inspector modal on click
      if (typeof window.openHeroInspectorModal === 'function') {
        window.openHeroInspectorModal(item.dataset.hero);
      }
    });
  });

  if (btnInspect) {
    btnInspect.addEventListener('click', () => {
      audio.click();
      if (typeof window.openHeroInspectorModal === 'function') {
        window.openHeroInspectorModal(activeHeroId);
      }
    });
  }

  setActiveHero('super-hero-bwed', false);
}

// 18 Heroes Roster Rendering, Filtering and Modal Inspector
function initHeroRoster() {
  const grid = document.getElementById('heroesGrid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modalBackdrop = document.getElementById('heroModalBackdrop');
  const modalClose = document.getElementById('heroModalClose');

  if (!grid) return;

  function renderHeroes(filter = 'all') {
    const list = filter === 'all' ? heroes : heroes.filter(h => h.cat === filter);
    grid.innerHTML = list.map(h => `
      <article class="hero-card" data-id="${h.id}" style="--card-color: ${h.color};">
        <div class="hero-avatar-box">
          <img class="hero-avatar-img" src="./assets/pawns/thumbs/${h.id}.png" alt="${h.name}" loading="lazy" />
        </div>
        <div class="hero-card-header">
          <h3 class="hero-card-name">${h.name}</h3>
          <span class="hero-card-role">${h.role}</span>
        </div>
        <div class="hero-card-talent">
          <strong>${h.talent.name} &bull; ${h.talent.cue}</strong>
          <span>${h.talent.desc}</span>
        </div>
        <div class="hero-card-action">
          <span>INSPECT CARD</span>
          <span>PLAY IN 3D &rarr;</span>
        </div>
      </article>
    `).join('');

    grid.querySelectorAll('.hero-card').forEach(card => {
      card.addEventListener('click', () => {
        audio.heroSelect();
        openHeroModal(card.dataset.id);
      });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      audio.click();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHeroes(btn.dataset.cat);
    });
  });

  function openHeroModal(heroId) {
    const h = heroes.find(item => item.id === heroId);
    if (!h || !modalBackdrop) return;

    modalBackdrop.querySelector('.modal-avatar-img').src = `./assets/pawns/thumbs/${h.id}.png`;
    modalBackdrop.querySelector('.modal-avatar-img').alt = h.name;
    modalBackdrop.querySelector('.modal-hero-meta h3').textContent = h.name;
    modalBackdrop.querySelector('.modal-hero-role').textContent = h.role;
    modalBackdrop.querySelector('.modal-hero-desc').textContent = h.desc;

    const talentCard = modalBackdrop.querySelector('.modal-talent-card');
    talentCard.querySelector('strong').textContent = `ACTIVE TALENT: ${h.talent.name} (${h.talent.cue})`;
    talentCard.querySelector('p').textContent = h.talent.desc;

    const playBtn = modalBackdrop.querySelector('.btn-modal-play');
    if (playBtn) {
      playBtn.href = `./party-board.html?hero=${h.id}`;
      playBtn.innerHTML = `<span>Play ${h.name} in Crumb Run 3D</span> <b>&rarr;</b>`;
    }

    modalBackdrop.classList.add('open');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('open');
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  window.openHeroInspectorModal = openHeroModal;
  renderHeroes('all');
}

// 13 Town & Board Buildings Grid (100% In-Game GLB models from party-board.js)
function initBuildingsGrid() {
  const grid = document.getElementById('buildingsGrid');
  if (!grid) return;

  const buildingsList = (typeof IN_GAME_BUILDINGS !== 'undefined' && IN_GAME_BUILDINGS.length > 0)
    ? IN_GAME_BUILDINGS
    : townBuildings;

  grid.innerHTML = buildingsList.map(b => `
    <article class="building-card">
      <div class="building-thumb-wrap">
        <span class="building-role-badge">${b.role}</span>
        <span class="building-glb-badge">GLB 3D IN-GAME</span>
        <img src="${b.img}" alt="${b.name}" loading="lazy" />
      </div>
      <div class="building-body">
        <h4>${b.name}</h4>
        <p>${b.desc}</p>
        <div style="margin-top: auto; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-family: var(--font-mono); font-size: 9px; color: var(--gold-main); font-weight: 700;">${b.glb || '3D Model'}</span>
          <a href="./party-board.html" style="font-family: var(--font-mono); font-size: 9px; color: var(--mint); text-decoration: none; font-weight: 800;">SEE IN GAME &rarr;</a>
        </div>
      </div>
    </article>
  `).join('');
}

// BwedDepot: Community Media Vault & Meme Index (MemeDepot Style)
function initBwedDepot() {
  const grid = document.getElementById('depotGrid');
  if (!grid) return;

  const catalog = (typeof BWED_DEPOT_CATALOG !== 'undefined' && BWED_DEPOT_CATALOG.length > 0)
    ? BWED_DEPOT_CATALOG
    : [];

  const tabs = document.querySelectorAll('#depotCategoryTabs .depot-tab');
  const searchInput = document.getElementById('depotSearchInput');
  const sortSelect = document.getElementById('depotSortSelect');
  const btnLoadMore = document.getElementById('btnLoadMoreDepot');
  const totalLikesEl = document.getElementById('depotTotalLikes');
  const totalCountEl = document.getElementById('depotTotalCount');

  // Lightbox elements
  const lightbox = document.getElementById('depotLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxLikeBtn = document.getElementById('lightboxLikeBtn');
  const lightboxLikeCount = document.getElementById('lightboxLikeCount');
  const lightboxDownloadBtn = document.getElementById('lightboxDownloadBtn');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxOverlay = document.getElementById('lightboxOverlay');

  // Persistent Likes State in LocalStorage
  // Complete reset of inflated seeds; strict cap to <= 15 automated likes per 24h
  const LIKES_KEY = 'bwed_depot_likes_v3';
  const USER_LIKES_KEY = 'bwed_depot_user_likes_v3';
  const DAILY_AUTO_KEY = 'bwed_depot_daily_auto_v3';

  // Purge legacy inflated keys
  ['bwed_depot_likes', 'bwed_depot_likes_v2', 'bwed_depot_user_likes', 'bwed_depot_user_likes_v2', 'bwed_depot_last_tick', 'bwed_depot_last_tick_v2'].forEach(k => {
    try { localStorage.removeItem(k); } catch (e) {}
  });

  let likesMap = {};
  try {
    likesMap = JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
  } catch (e) {
    likesMap = {};
  }

  // Initialize missing items with clean baseLikes (0)
  catalog.forEach(item => {
    if (typeof likesMap[item.id] !== 'number') {
      likesMap[item.id] = typeof item.baseLikes === 'number' ? item.baseLikes : 0;
    }
  });

  // User liked IDs set
  let userLikesSet = new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(USER_LIKES_KEY) || '[]');
    userLikesSet = new Set(raw);
  } catch (e) {
    userLikesSet = new Set();
  }

  // Strict daily automated growth: max 15 likes per calendar day
  const MAX_AUTO_LIKES_PER_DAY = 15;
  const now = Date.now();
  const todayStr = new Date().toISOString().slice(0, 10);
  let dailyAuto = { date: todayStr, count: 0, lastTick: now };
  try {
    const rawDaily = JSON.parse(localStorage.getItem(DAILY_AUTO_KEY) || 'null');
    if (rawDaily && typeof rawDaily === 'object') {
      if (rawDaily.date === todayStr) {
        dailyAuto = rawDaily;
      } else {
        dailyAuto = { date: todayStr, count: 0, lastTick: now };
      }
    }
  } catch (e) {
    dailyAuto = { date: todayStr, count: 0, lastTick: now };
  }

  // Drip at most ~1 like per 96 minutes if under 15/day cap
  if (dailyAuto.count < MAX_AUTO_LIKES_PER_DAY && dailyAuto.lastTick > 0 && now > dailyAuto.lastTick) {
    const elapsedMinutes = Math.floor((now - dailyAuto.lastTick) / 60000);
    const eligibleLikes = Math.min(Math.floor(elapsedMinutes / 96), MAX_AUTO_LIKES_PER_DAY - dailyAuto.count);
    if (eligibleLikes > 0 && catalog.length > 0) {
      for (let i = 0; i < eligibleLikes; i++) {
        const randItem = catalog[Math.floor(Math.random() * catalog.length)];
        likesMap[randItem.id] = (likesMap[randItem.id] || 0) + 1;
      }
      dailyAuto.count += eligibleLikes;
      dailyAuto.lastTick = now;
    }
  } else if (!dailyAuto.lastTick) {
    dailyAuto.lastTick = now;
  }

  try {
    localStorage.setItem(DAILY_AUTO_KEY, JSON.stringify(dailyAuto));
  } catch (e) {}
  saveLikes();

  function saveLikes() {
    try {
      localStorage.setItem(LIKES_KEY, JSON.stringify(likesMap));
      localStorage.setItem(USER_LIKES_KEY, JSON.stringify(Array.from(userLikesSet)));
    } catch (e) {}
    updateTotalLikesCounter();
  }

  function updateTotalLikesCounter() {
    if (!totalLikesEl) return;
    const total = Object.values(likesMap).reduce((acc, n) => acc + n, 0);
    totalLikesEl.textContent = total.toLocaleString();
    if (totalCountEl) totalCountEl.textContent = String(catalog.length);
  }

  // Global total community likes synchronization
  const GLOBAL_LIKES_KEY = 'bwedverse_total_likes';
  const GLOBAL_LIKES_GET = 'https://countapi.mileshilliard.com/api/v1/get/' + GLOBAL_LIKES_KEY;
  const GLOBAL_LIKES_HIT = 'https://countapi.mileshilliard.com/api/v1/hit/' + GLOBAL_LIKES_KEY;

  function fetchGlobalTotalLikes() {
    fetch(GLOBAL_LIKES_GET, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.value === 'number') {
          const localTotal = Object.values(likesMap).reduce((acc, n) => acc + n, 0);
          const finalTotal = Math.max(localTotal, data.value);
          if (totalLikesEl) totalLikesEl.textContent = finalTotal.toLocaleString();
        }
      })
      .catch(() => {});
  }
  fetchGlobalTotalLikes();

  // Active Filters & Pagination State
  let currentCategory = 'all';
  let currentSearch = '';
  let currentSort = 'likes';
  const PAGE_SIZE = 18;
  let visibleCount = PAGE_SIZE;
  let currentLightboxId = null;

  function getFilteredItems() {
    return catalog.filter(item => {
      if (currentCategory !== 'all' && item.category !== currentCategory) {
        return false;
      }
      if (currentSearch) {
        const q = currentSearch.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.desc.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat) return false;
      }
      return true;
    }).sort((a, b) => {
      const likesA = likesMap[a.id] || 0;
      const likesB = likesMap[b.id] || 0;
      if (currentSort === 'likes') return likesB - likesA;
      if (currentSort === 'az') return a.title.localeCompare(b.title);
      if (currentSort === 'newest') return b.id.localeCompare(a.id);
      if (currentSort === 'trending') return (likesB % 17) - (likesA % 17);
      return 0;
    });
  }

  function renderGrid() {
    const filtered = getFilteredItems();
    const slice = filtered.slice(0, visibleCount);

    if (slice.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: rgba(30,14,8,0.5); border-radius: 18px; border: 1px dashed var(--border-gold);">
          <h4 style="font-size: 18px; color: var(--gold-main); margin-bottom: 8px;">No Bwed media found</h4>
          <p style="font-size: 13px; color: var(--cream-soft);">Try clearing your search query or switching category tabs.</p>
        </div>
      `;
      if (btnLoadMore) btnLoadMore.style.display = 'none';
      return;
    }

    const isStickersTab = currentCategory === 'stickers';
    let bannerHtml = '';
    if (isStickersTab) {
      bannerHtml = `
        <div class="depot-sticker-banner" style="grid-column: 1 / -1; background: linear-gradient(135deg, rgba(38,18,10,0.85) 0%, rgba(20,8,4,0.95) 100%); border: 1px solid var(--border-gold); border-radius: 18px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; margin-bottom: 8px;">
          <div>
            <h3 style="font-family: var(--font-display); font-size: 16px; color: var(--gold-main); margin-bottom: 4px;">Official Bwed Telegram Sticker Pack</h3>
            <p style="font-size: 13px; color: var(--cream-soft); margin: 0;">23 exclusive transparent Bwed stickers for Telegram and community chats. Download individually or use across web3.</p>
          </div>
          <a href="https://t.me/addstickers/bwed" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="font-size: 12px; padding: 10px 20px;">
            <span>Open in Telegram</span> <b>&rarr;</b>
          </a>
        </div>
      `;
    }

    grid.innerHTML = bannerHtml + slice.map(item => {
      const likes = likesMap[item.id] || item.baseLikes || 180;
      const isLiked = userLikesSet.has(item.id);
      const isPfp = item.category === 'pfp' || item.category === 'stickers';

      return `
        <article class="depot-card ${isPfp ? 'pfp-card' : ''}" data-id="${item.id}">
          <div class="depot-media-wrap" data-id="${item.id}">
            <span class="depot-badge">${item.category}</span>
            <img src="${item.path}" alt="${item.title}" loading="lazy" />
            <div class="depot-zoom-indicator">
              <span>VIEW FULL</span>
            </div>
          </div>
          <div class="depot-card-body">
            <div class="depot-card-meta">
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
            <div class="depot-card-actions">
              <button type="button" class="btn-like-pill ${isLiked ? 'is-liked' : ''}" data-id="${item.id}" title="Upvote this Bwed meme">
                <svg class="heart-icon" width="14" height="14" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span class="like-num">${likes.toLocaleString()}</span>
              </button>
              <a href="${item.path}" download="${item.filename}" class="btn-download-pill" title="Direct Download High-Res File">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span>Save</span>
              </a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click events
    grid.querySelectorAll('.depot-media-wrap').forEach(wrap => {
      wrap.addEventListener('click', () => {
        openLightbox(wrap.dataset.id);
      });
    });

    grid.querySelectorAll('.btn-like-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleLike(btn.dataset.id, btn);
      });
    });

    if (btnLoadMore) {
      btnLoadMore.style.display = visibleCount >= filtered.length ? 'none' : 'inline-flex';
    }
  }

  function toggleLike(id, btnEl = null) {
    const current = likesMap[id] || 0;
    const isLiked = userLikesSet.has(id);

    if (isLiked) {
      userLikesSet.delete(id);
      likesMap[id] = Math.max(0, current - 1);
    } else {
      userLikesSet.add(id);
      likesMap[id] = current + 1;
      audio.heroSelect();

      // Global synchronization
      fetch(GLOBAL_LIKES_HIT, { cache: 'no-store' }).catch(() => {});
      fetch('https://countapi.mileshilliard.com/api/v1/hit/bwedverse_like_' + encodeURIComponent(id), { cache: 'no-store' }).catch(() => {});

      if (btnEl) {
        btnEl.classList.add('bump');
        const crumb = document.createElement('span');
        crumb.className = 'floating-crumb-crumb';
        crumb.textContent = '+1';
        btnEl.appendChild(crumb);
        setTimeout(() => crumb.remove(), 800);
        setTimeout(() => btnEl.classList.remove('bump'), 400);
      }
    }

    saveLikes();

    const cardBtn = grid.querySelector(`.btn-like-pill[data-id="${id}"]`);
    if (cardBtn) {
      cardBtn.classList.toggle('is-liked', !isLiked);
      const icon = cardBtn.querySelector('svg');
      if (icon) icon.setAttribute('fill', !isLiked ? 'currentColor' : 'none');
      const num = cardBtn.querySelector('.like-num');
      if (num) num.textContent = (likesMap[id] || 0).toLocaleString();
    }

    if (currentLightboxId === id && lightboxLikeBtn) {
      syncLightboxLike(id);
    }
  }

  function syncLightboxLike(id) {
    if (!lightboxLikeBtn) return;
    const isLiked = userLikesSet.has(id);
    lightboxLikeBtn.classList.toggle('is-liked', isLiked);
    const icon = lightboxLikeBtn.querySelector('svg');
    if (icon) icon.setAttribute('fill', isLiked ? 'currentColor' : 'none');
    if (lightboxLikeCount) {
      lightboxLikeCount.textContent = (likesMap[id] || 0).toLocaleString();
    }
  }

  function openLightbox(id) {
    const item = catalog.find(i => i.id === id);
    if (!item || !lightbox) return;

    currentLightboxId = id;
    audio.click();

    if (lightboxImg) {
      lightboxImg.src = item.path;
      lightboxImg.alt = item.title;
    }
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDesc) lightboxDesc.textContent = item.desc;
    if (lightboxCategory) lightboxCategory.textContent = item.category.toUpperCase();

    if (lightboxDownloadBtn) {
      lightboxDownloadBtn.href = item.path;
      lightboxDownloadBtn.download = item.filename;
    }

    syncLightboxLike(id);
    lightbox.classList.add('open');

    // Fetch latest global likes for this meme
    fetch('https://countapi.mileshilliard.com/api/v1/get/bwedverse_like_' + encodeURIComponent(id), { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.value === 'number' && data.value > (likesMap[id] || 0)) {
          likesMap[id] = data.value;
          saveLikes();
          if (currentLightboxId === id) syncLightboxLike(id);
          const cardBtn = grid.querySelector(`.btn-like-pill[data-id="${id}"] .like-num`);
          if (cardBtn) cardBtn.textContent = data.value.toLocaleString();
        }
      })
      .catch(() => {});
  }

  function closeLightbox() {
    if (lightbox) lightbox.classList.remove('open');
    currentLightboxId = null;
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
  if (lightboxLikeBtn) {
    lightboxLikeBtn.addEventListener('click', () => {
      if (currentLightboxId) {
        toggleLike(currentLightboxId, lightboxLikeBtn);
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      audio.click();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat || 'all';
      visibleCount = PAGE_SIZE;
      renderGrid();
    });
  });

  let searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        currentSearch = searchInput.value.trim();
        visibleCount = PAGE_SIZE;
        renderGrid();
      }, 180);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      audio.click();
      currentSort = sortSelect.value;
      visibleCount = PAGE_SIZE;
      renderGrid();
    });
  }

  if (btnLoadMore) {
    btnLoadMore.addEventListener('click', () => {
      audio.click();
      visibleCount += PAGE_SIZE;
      renderGrid();
    });
  }

  // Controlled background drip strictly respecting the <= 15 likes/day cap
  setInterval(() => {
    if (catalog.length === 0) return;
    const currentToday = new Date().toISOString().slice(0, 10);
    if (dailyAuto.date !== currentToday) {
      dailyAuto.date = currentToday;
      dailyAuto.count = 0;
      dailyAuto.lastTick = Date.now();
    }
    if (dailyAuto.count >= MAX_AUTO_LIKES_PER_DAY) return;

    const tickNow = Date.now();
    const elapsedMinutes = Math.floor((tickNow - dailyAuto.lastTick) / 60000);
    if (elapsedMinutes >= 96) { // ~1.6 hours between auto likes
      const rand = catalog[Math.floor(Math.random() * catalog.length)];
      likesMap[rand.id] = (likesMap[rand.id] || 0) + 1;
      dailyAuto.count += 1;
      dailyAuto.lastTick = tickNow;
      try {
        localStorage.setItem(DAILY_AUTO_KEY, JSON.stringify(dailyAuto));
      } catch (e) {}
      saveLikes();

      const numEl = grid.querySelector(`.depot-card[data-id="${rand.id}"] .like-num`);
      if (numEl) {
        numEl.textContent = (likesMap[rand.id] || 0).toLocaleString();
      }
    }
  }, 300000); // Check periodically every 5 minutes

  updateTotalLikesCounter();
  renderGrid();
}

// Baguette Contract Address Copy Pill
function initBaguetteCA() {
  const btn = document.getElementById('caBaguetteBtn');
  const badge = document.getElementById('caCopyBadge');
  const CA = '5nfDdZFMsDz34y6p1PAm1yN4FpXrGjFRj2V48dgPpump';
  if (!btn) return;

  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(CA).then(() => {
      audio.heroSelect();
      btn.classList.add('copied');
      if (badge) badge.textContent = 'COPIED!';
      setTimeout(() => {
        btn.classList.remove('copied');
        if (badge) badge.textContent = 'COPY';
      }, 2000);
    }).catch(() => {
      prompt('Bwed Contract Address:', CA);
    });
  });
}

// Discreet Bwed Visitor Clicker Widget (Global Shared Counter across all visitors)
function initBwedClicker() {
  const pill = document.getElementById('bwedClickerPill');
  const countEl = document.getElementById('clickerCount');
  if (!pill) return;

  const CLICKER_KEY = 'bwed_visitor_clicks_v1';
  const BASE_CLICKS = 1420;
  const COUNTAPI_GET = 'https://countapi.mileshilliard.com/api/v1/get/bwedverse_bwed_was_here';
  const COUNTAPI_HIT = 'https://countapi.mileshilliard.com/api/v1/hit/bwedverse_bwed_was_here';
  const ABACUS_HIT = 'https://abacus.jasoncameron.dev/hit/bwedverse/bwed_was_here';

  let visitorClicks = parseInt(localStorage.getItem(CLICKER_KEY) || String(BASE_CLICKS), 10);
  if (isNaN(visitorClicks) || visitorClicks < BASE_CLICKS) visitorClicks = BASE_CLICKS;

  function renderCount() {
    if (countEl) {
      countEl.textContent = visitorClicks.toLocaleString();
    }
  }
  renderCount();

  // Fetch live global count on initial load
  fetch(COUNTAPI_GET, { cache: 'no-store' })
    .then(res => res.json())
    .then(data => {
      if (data && typeof data.value === 'number') {
        if (data.value > visitorClicks) {
          visitorClicks = data.value;
          try { localStorage.setItem(CLICKER_KEY, String(visitorClicks)); } catch (e) {}
          renderCount();
        }
      }
    })
    .catch(() => {});

  // Batched outbound sync for rapid clicks
  let pendingHits = 0;
  let flushTimer = null;

  function flushHits() {
    if (pendingHits <= 0) return;
    const batch = pendingHits;
    pendingHits = 0;
    flushTimer = null;

    for (let i = 0; i < batch; i++) {
      fetch(COUNTAPI_HIT, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.value === 'number' && data.value > visitorClicks) {
            visitorClicks = data.value;
            try { localStorage.setItem(CLICKER_KEY, String(visitorClicks)); } catch (e) {}
            renderCount();
          }
        })
        .catch(() => {
          fetch(ABACUS_HIT, { cache: 'no-store' }).catch(() => {});
        });
    }
  }

  pill.addEventListener('click', (e) => {
    e.stopPropagation();
    visitorClicks++;
    try {
      localStorage.setItem(CLICKER_KEY, String(visitorClicks));
    } catch (err) {}
    renderCount();

    // Queue outgoing sync
    pendingHits++;
    if (!flushTimer) {
      flushTimer = setTimeout(flushHits, 300);
    }

    // Squish & bounce animation
    pill.classList.remove('clicked');
    void pill.offsetWidth;
    pill.classList.add('clicked');

    // Floating +1 particle pop
    const pop = document.createElement('span');
    pop.className = 'clicker-floating-pop';
    pop.textContent = '+1';
    pill.appendChild(pop);
    setTimeout(() => {
      if (pop && pop.parentNode) pop.remove();
    }, 700);

    // Play subtle audio feedback
    if (typeof audio !== 'undefined' && audio.diceRoll) {
      audio.diceRoll();
    }
  });

  pill.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pill.click();
    }
  });
}

// Floating Modern Glassmorphism Token Live Stats Widget ($BWED)
function initBwedLiveWidget() {
  const widget = document.getElementById('bwedLiveWidget');
  const pill = document.getElementById('bwedLivePill');
  const card = document.getElementById('bwedLiveCard');
  const refreshBtn = document.getElementById('liveRefreshBtn');
  const closeBtn = document.getElementById('liveCloseBtn');

  if (!widget || !pill || !card) return;

  const TOKEN_MINT = '5nfDdZFMsDz34y6p1PAm1yN4FpXrGjFRj2V48dgPpump';
  const DEXSCREENER_API = `https://api.dexscreener.com/latest/dex/tokens/${TOKEN_MINT}`;
  const PUMPFUN_API = `https://frontend-api-v2.pump.fun/coins/${TOKEN_MINT}`;

  const dom = {
    pillPrice: document.getElementById('pillPrice'),
    pillChange: document.getElementById('pillChange'),
    cardPrice: document.getElementById('cardPrice'),
    cardPriceSol: document.getElementById('cardPriceSol'),
    cardChange: document.getElementById('cardChange'),
    cardMcap: document.getElementById('cardMcap'),
    cardFdv: document.getElementById('cardFdv'),
    cardVolume: document.getElementById('cardVolume'),
    cardTxns: document.getElementById('cardTxns'),
    cardHolders: document.getElementById('cardHolders'),
    cardSupply: document.getElementById('cardSupply')
  };

  function formatPriceUsd(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return '$0.00';
    if (num < 0.00001) return `$${num.toFixed(8)}`;
    if (num < 0.001) return `$${num.toFixed(6)}`;
    if (num < 1) return `$${num.toFixed(4)}`;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatCompactNumber(val, prefix = '$') {
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return `${prefix}0`;
    if (num >= 1e9) return `${prefix}${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${prefix}${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${prefix}${(num / 1e3).toFixed(1)}K`;
    return `${prefix}${num.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  }

  function formatPercentChange(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return { text: '+0.00%', isPositive: true };
    const sign = num > 0 ? '+' : '';
    return {
      text: `${sign}${num.toFixed(2)}%`,
      isPositive: num >= 0
    };
  }

  let isFetching = false;

  async function fetchTokenData() {
    if (isFetching) return;
    isFetching = true;
    if (refreshBtn) refreshBtn.classList.add('is-spinning');

    let priceUsd = null;
    let priceSol = null;
    let priceChangeH24 = null;
    let mcap = null;
    let fdv = null;
    let volumeH24 = null;
    let txnsCount = null;
    let holderCount = null;

    try {
      // 1. Primary: DexScreener Public API (CORS enabled)
      const dexRes = await fetch(DEXSCREENER_API, { cache: 'no-store' });
      if (dexRes.ok) {
        const dexData = await dexRes.json();
        if (dexData && dexData.pairs && dexData.pairs.length > 0) {
          const pair = dexData.pairs[0];
          priceUsd = pair.priceUsd;
          priceSol = pair.priceNative;
          priceChangeH24 = pair.priceChange?.h24;
          mcap = pair.marketCap || pair.fdv;
          fdv = pair.fdv;
          volumeH24 = pair.volume?.h24;
          const buys = pair.txns?.h24?.buys || 0;
          const sells = pair.txns?.h24?.sells || 0;
          txnsCount = buys + sells;
        }
      }
    } catch (err) {
      // Fallback gracefully on network interruptions
    }

    try {
      // 2. Secondary: Pump.fun coins API for holders
      const pumpRes = await fetch(PUMPFUN_API, { cache: 'no-store' });
      if (pumpRes.ok) {
        const pumpData = await pumpRes.json();
        if (pumpData && typeof pumpData.holder_count !== 'undefined') {
          holderCount = pumpData.holder_count;
        }
      }
    } catch (err) {
      // Fallback
    }

    // Apply values with elegant defaults if first load or offline
    const finalPriceUsd = priceUsd || '0.000185';
    const finalPriceSol = priceSol ? `${parseFloat(priceSol).toFixed(8)} SOL` : '0.00000112 SOL';
    const finalChange = formatPercentChange(priceChangeH24 !== null ? priceChangeH24 : 12.4);
    const finalMcap = mcap ? formatCompactNumber(mcap) : '$185K';
    const finalFdv = fdv ? formatCompactNumber(fdv) : '$185K';
    const finalVolume = volumeH24 ? formatCompactNumber(volumeH24) : '$42.5K';
    const finalTxns = txnsCount ? `${txnsCount.toLocaleString()} txns` : '240+ txns';
    const finalHolders = holderCount ? Number(holderCount).toLocaleString() : '1,280+';

    // Update Pill DOM
    if (dom.pillPrice) dom.pillPrice.textContent = formatPriceUsd(finalPriceUsd);
    if (dom.pillChange) {
      dom.pillChange.textContent = finalChange.text;
      dom.pillChange.classList.toggle('positive', finalChange.isPositive);
      dom.pillChange.classList.toggle('negative', !finalChange.isPositive);
    }

    // Update Card DOM
    if (dom.cardPrice) dom.cardPrice.textContent = formatPriceUsd(finalPriceUsd);
    if (dom.cardPriceSol) dom.cardPriceSol.textContent = finalPriceSol;
    if (dom.cardChange) {
      dom.cardChange.textContent = finalChange.text;
      dom.cardChange.classList.toggle('positive', finalChange.isPositive);
      dom.cardChange.classList.toggle('negative', !finalChange.isPositive);
    }
    if (dom.cardMcap) dom.cardMcap.textContent = finalMcap;
    if (dom.cardFdv) dom.cardFdv.textContent = `FDV: ${finalFdv}`;
    if (dom.cardVolume) dom.cardVolume.textContent = finalVolume;
    if (dom.cardTxns) dom.cardTxns.textContent = finalTxns;
    if (dom.cardHolders) dom.cardHolders.textContent = finalHolders;

    isFetching = false;
    setTimeout(() => {
      if (refreshBtn) refreshBtn.classList.remove('is-spinning');
    }, 450);
  }

  // Card View Switching (Overview vs Live Chart)
  const tabOverview = document.getElementById('liveTabOverview');
  const tabChart = document.getElementById('liveTabChart');
  const panelOverview = document.getElementById('liveOverviewPanel');
  const panelChart = document.getElementById('liveChartPanel');
  const dexIframe = document.getElementById('liveDexIframe');
  const toggleChartBtn = document.getElementById('liveToggleChartBtn');
  const toggleChartText = document.getElementById('liveToggleChartText');

  let currentView = 'overview';

  function switchWidgetView(view) {
    currentView = view;
    if (view === 'chart') {
      card.classList.add('has-chart');
      if (panelOverview) panelOverview.hidden = true;
      if (panelChart) panelChart.hidden = false;
      if (tabOverview) {
        tabOverview.classList.remove('active');
        tabOverview.setAttribute('aria-selected', 'false');
      }
      if (tabChart) {
        tabChart.classList.add('active');
        tabChart.setAttribute('aria-selected', 'true');
      }
      if (toggleChartText) toggleChartText.textContent = 'Stats';
      if (dexIframe && !dexIframe.src && dexIframe.dataset.src) {
        dexIframe.src = dexIframe.dataset.src;
      }
    } else {
      card.classList.remove('has-chart');
      if (panelChart) panelChart.hidden = true;
      if (panelOverview) panelOverview.hidden = false;
      if (tabChart) {
        tabChart.classList.remove('active');
        tabChart.setAttribute('aria-selected', 'false');
      }
      if (tabOverview) {
        tabOverview.classList.add('active');
        tabOverview.setAttribute('aria-selected', 'true');
      }
      if (toggleChartText) toggleChartText.textContent = 'Live Chart';
    }
  }

  tabOverview?.addEventListener('click', (e) => {
    e.stopPropagation();
    switchWidgetView('overview');
  });

  tabChart?.addEventListener('click', (e) => {
    e.stopPropagation();
    switchWidgetView('chart');
  });

  toggleChartBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    switchWidgetView(currentView === 'overview' ? 'chart' : 'overview');
  });

  // Toggle card / pill display
  function openCard() {
    pill.hidden = true;
    pill.style.display = 'none';
    card.hidden = false;
    card.style.display = 'flex';
    pill.setAttribute('aria-expanded', 'true');
    fetchTokenData();
  }

  function closeCard() {
    card.hidden = true;
    card.style.display = 'none';
    pill.hidden = false;
    pill.style.display = 'inline-flex';
    pill.setAttribute('aria-expanded', 'false');
  }

  pill.addEventListener('click', openCard);
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    closeCard();
  });

  refreshBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fetchTokenData();
  });

  // Close when clicking outside widget
  document.addEventListener('click', (e) => {
    if (!card.hidden && !widget.contains(e.target)) {
      closeCard();
    }
  });

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !card.hidden) {
      closeCard();
    }
  });

  // Initial fetch and auto-refresh every 45s
  fetchTokenData();
  setInterval(fetchTokenData, 45000);
}

// Community Butter Vault ($BWED Treasury & Public Support)
function initCommunityVault() {
  const vaultSection = document.getElementById('vault');
  if (!vaultSection) return;

  const VAULT_ADDRESS = 'HoQ5WqEZjPFzVL7bbkQ8bD9Ujjmk9hng8emn6UEsHTYa';
  const TOKEN_MINT = '5nfDdZFMsDz34y6p1PAm1yN4FpXrGjFRj2V48dgPpump';
  const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

  const copyBtn = document.getElementById('btnCopyVaultAddress');
  const copyBadgeText = document.getElementById('copyVaultBadgeText');
  const toggleQrBtn = document.getElementById('btnToggleVaultQR');
  const qrDrawer = document.getElementById('vaultQrDrawer');
  const solBalanceEl = document.getElementById('vaultSolBalance');
  const bwedBalanceEl = document.getElementById('vaultBwedBalance');
  const canvas = document.getElementById('vaultCanvas3D');
  const fallbackImg = document.getElementById('vaultFallbackImg');

  // Copy address to clipboard
  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(VAULT_ADDRESS).then(() => {
      if (typeof audio !== 'undefined' && audio.heroSelect) audio.heroSelect();
      copyBtn.classList.add('copied');
      if (copyBadgeText) copyBadgeText.textContent = 'COPIED!';
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        if (copyBadgeText) copyBadgeText.textContent = 'COPY';
      }, 2200);
    }).catch(() => {
      prompt('Vault Solana Address:', VAULT_ADDRESS);
    });
  });

  // Toggle QR Code
  toggleQrBtn?.addEventListener('click', () => {
    if (typeof audio !== 'undefined' && audio.click) audio.click();
    if (qrDrawer) {
      qrDrawer.hidden = !qrDrawer.hidden;
      toggleQrBtn.classList.toggle('active', !qrDrawer.hidden);
    }
  });

  // Fetch live on-chain balances from Solana RPC
  async function fetchVaultOnChainData() {
    try {
      // 1. SOL balance
      const solRes = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [VAULT_ADDRESS]
        })
      });
      if (solRes.ok) {
        const solData = await solRes.json();
        if (solData?.result?.value !== undefined) {
          const lamports = solData.result.value;
          const sol = lamports / 1e9;
          if (solBalanceEl) {
            solBalanceEl.textContent = `${sol.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} SOL`;
          }
        }
      }

      // 2. $BWED SPL token balance
      const splRes = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getTokenAccountsByOwner',
          params: [
            VAULT_ADDRESS,
            { mint: TOKEN_MINT },
            { encoding: 'jsonParsed' }
          ]
        })
      });
      if (splRes.ok) {
        const splData = await splRes.json();
        if (splData?.result?.value && splData.result.value.length > 0) {
          const tokenAmount = splData.result.value[0]?.account?.data?.parsed?.info?.tokenAmount;
          if (tokenAmount) {
            const rawAmount = parseFloat(tokenAmount.uiAmountString || tokenAmount.uiAmount || 0);
            if (bwedBalanceEl) {
              bwedBalanceEl.textContent = `${rawAmount >= 1e6 ? (rawAmount / 1e6).toFixed(2) + 'M' : rawAmount.toLocaleString()} $BWED`;
            }
          }
        }
      }
    } catch (e) {
      // Graceful offline fallback
    }
  }

  fetchVaultOnChainData();

  // Lazy initialize 3D interactive Chest / Safe with Three.js
  let threeLoaded = false;
  function initVault3D() {
    if (threeLoaded || !canvas) return;
    threeLoaded = true;

    // Dynamically load Three.js & GLTFLoader modules
    import('https://unpkg.com/three@0.161.0/build/three.module.js').then(async (THREE) => {
      const { GLTFLoader } = await import('https://unpkg.com/three@0.161.0/examples/jsm/loaders/GLTFLoader.js');

      const width = canvas.parentElement.clientWidth || 380;
      const height = canvas.parentElement.clientHeight || 380;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(0, 1.6, 3.8);

      // Warm bakery studio lights
      const ambLight = new THREE.AmbientLight(0xfff5e6, 1.8);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xffd15a, 2.5);
      dirLight.position.set(4, 6, 4);
      scene.add(dirLight);

      const rimLight = new THREE.DirectionalLight(0xff8c42, 1.5);
      rimLight.position.set(-4, 3, -3);
      scene.add(rimLight);

      const loader = new GLTFLoader();
      const modelPath = './assets/buildings/prop-treasure-chest.glb';

      let modelRoot = null;
      loader.load(modelPath, (gltf) => {
        modelRoot = gltf.scene;

        // Auto center and scale
        const box = new THREE.Box3().setFromObject(modelRoot);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / (maxDim || 1);

        modelRoot.scale.setScalar(scale);
        modelRoot.position.sub(center.multiplyScalar(scale));
        modelRoot.position.y -= 0.15;

        scene.add(modelRoot);
      }, undefined, () => {
        if (fallbackImg) fallbackImg.classList.add('active');
        if (canvas) canvas.style.display = 'none';
      });

      // Mouse drag rotation interaction
      let isDragging = false;
      let prevMouseX = 0;
      let rotSpeed = 0.005;

      canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        prevMouseX = e.clientX;
      });
      window.addEventListener('mouseup', () => { isDragging = false; });
      window.addEventListener('mousemove', (e) => {
        if (isDragging && modelRoot) {
          const delta = e.clientX - prevMouseX;
          modelRoot.rotation.y += delta * rotSpeed;
          prevMouseX = e.clientX;
        }
      });

      // Touch drag for mobile
      canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          isDragging = true;
          prevMouseX = e.touches[0].clientX;
        }
      }, { passive: true });
      window.addEventListener('touchend', () => { isDragging = false; });
      window.addEventListener('touchmove', (e) => {
        if (isDragging && modelRoot && e.touches.length === 1) {
          const delta = e.touches[0].clientX - prevMouseX;
          modelRoot.rotation.y += delta * rotSpeed;
          prevMouseX = e.touches[0].clientX;
        }
      }, { passive: true });

      // Handle resize
      window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        const w = canvas.parentElement.clientWidth;
        const h = canvas.parentElement.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });

      // Render loop
      function animate() {
        requestAnimationFrame(animate);
        if (modelRoot && !isDragging) {
          modelRoot.rotation.y += 0.007; // gentle idle rotation
        }
        renderer.render(scene, camera);
      }
      animate();
    }).catch(() => {
      if (fallbackImg) fallbackImg.classList.add('active');
      if (canvas) canvas.style.display = 'none';
    });
  }

  // Use IntersectionObserver to lazy load the 3D model only when visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initVault3D();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(vaultSection);
}

// Global UI controls (Motion, Sound, Mobile menu, Scroll reveals)
function initGlobalControls() {
  // Auto device detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
  if (isMobile) {
    document.documentElement.classList.add('is-mobile-device');
  }

  const toggleMosaicBtn = document.getElementById('toggleMosaic');
  const wallpaper = document.getElementById('mosaicWallpaper');
  let mosaicRunning = true;

  if (toggleMosaicBtn && wallpaper) {
    toggleMosaicBtn.addEventListener('click', () => {
      audio.click();
      mosaicRunning = !mosaicRunning;
      wallpaper.classList.toggle('is-paused', !mosaicRunning);
      toggleMosaicBtn.classList.toggle('active', mosaicRunning);
      toggleMosaicBtn.innerHTML = mosaicRunning
        ? '<span>Motion: ON</span>'
        : '<span>Motion: PAUSED</span>';
    });
  }

  const toggleAudioBtn = document.getElementById('toggleAudio');
  if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener('click', () => {
      audio.enabled = !audio.enabled;
      toggleAudioBtn.classList.toggle('active', audio.enabled);
      toggleAudioBtn.innerHTML = audio.enabled
        ? '<span>Sound: ON</span>'
        : '<span>Sound: MUTED</span>';
      if (audio.enabled) audio.click();
    });
  }

  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      audio.click();
      mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
      });
    });
  }

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Start on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initMosaicWallpaper();
  initMusicPlayer();
  initCollectorCabinet();
  initHeroRoster();
  initBuildingsGrid();
  initBwedDepot();
  initBaguetteCA();
  initBwedClicker();
  initBwedLiveWidget();
  initCommunityVault();
  initGlobalControls();
});
