import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ASSET_ROOT = './assets/pawns/';
const BUILDING_ASSET_ROOT = './assets/buildings/';

const pawnCatalog = [
  { id: 'glow-toast', badge: 'GOLD', name: 'Glow Toast', role: 'THE GOLDEN ONE', description: 'Optimistic, shiny and suspiciously good at landing on bonus tiles.', color: 0xf2c94c, model: 'glow-toast.glb', talent: { name: 'GOLDEN RISE', description: 'Add +2 to your next roll.', cue: 'NEXT ROLL +2', type: 'roll2' } },
  { id: 'toast-bandit', badge: 'OUTLAW', name: 'Toast Bandit', role: 'THE WILD OUTLAW', description: 'Fast hands, soft heart and a highly questionable relationship with risk tiles.', color: 0xf06a3c, model: 'toast-bandit.glb', talent: { name: 'OUTLAW DASH', description: 'Move +2 extra spaces after your next roll.', cue: 'NEXT MOVE +2', type: 'step2' } },
  { id: 'crimson-mage', badge: 'MAGE', name: 'Crimson Mage', role: 'THE SPELL SLICE', description: 'A little mysterious, a little dramatic, always ready for a mystery portal.', color: 0x9a79d6, model: 'crimson-mage.glb', talent: { name: 'ARCANE DICE', description: 'Roll twice and keep the higher result (+2 coins).', cue: 'BEST OF 2 +2c', type: 'reroll' } },
  { id: 'crimson-samurai', badge: 'BLADE', name: 'Crimson Samurai', role: 'THE RISING BLADE', description: 'Quiet stance, sharp style and absolutely no patience for a cold oven.', color: 0xc65347, model: 'crimson-samurai.glb', talent: { name: 'IRON CRUST', description: 'Your next risk tile is guaranteed to hit the jackpot.', cue: 'GUARANTEED RISK WIN', type: 'shield' } },
  { id: 'frankenbwed', badge: 'SPARK', name: 'FrankenBwed', role: 'THE ELECTRIC ONE', description: 'A stitched-up slice with bright sparks and high-voltage laboratory snacks.', color: 0x78b86b, model: 'frankenbwed.glb', talent: { name: 'CRUMB MAGNET', description: 'Gain +3 coins immediately and magnetize your next star.', cue: '+3c + MAGNET', type: 'magnet' } },
  { id: 'brave-firefighter', badge: 'RESCUE', name: 'Blaze Bwed', role: 'THE OVEN RESCUER', description: 'Fearless in a 450°F toaster. Turns burnt disasters into golden opportunities.', color: 0xe63946, model: 'brave-firefighter.glb', talent: { name: 'HOSE BOOST', description: 'Rocket forward +3 spaces on your next roll and immune to burn.', cue: 'MOVE +3 & SAFE', type: 'fireboost' } },
  { id: 'choco-drip', badge: 'GLAZE', name: 'Choco Drip', role: 'THE SWEET GLAZE', description: 'Coated in rich hazelnut spread. Everybody wants a piece of this slice.', color: 0x8d5524, model: 'choco-drip.glb', talent: { name: 'SUGAR COAT', description: 'Collect +4 sweet coins right now.', cue: 'INSTANT +4 COINS', type: 'coins4' } },
  { id: 'judge-gaveltoes', badge: 'JUDGE', name: 'Judge Gaveltoes', role: 'THE SUPREME LOAF', description: 'Presides over the High Court of Crumbs. Order in the bakery!', color: 0x6c757d, model: 'judge-gaveltoes.glb', talent: { name: 'BAKERY TAX', description: 'Collect 1 coin from every other player on the board.', cue: 'TAX ALL PLAYERS', type: 'tax' } },
  { id: 'rusty-buttonbot', badge: 'MECH', name: 'Rusty Buttonbot', role: 'THE TOASTER MECH', description: 'Half vintage appliance, half soft bread. Computes optimal crumb trajectories.', color: 0x5bc0be, model: 'rusty-buttonbot.glb', talent: { name: 'OVERCLOCK', description: 'Double your next dice roll!', cue: 'DOUBLE ROLL ×2', type: 'double' } },
  { id: 'saiyan-toast', badge: 'SUPER', name: 'Saiyan Toast', role: 'THE SUPER SLICE', description: 'Power level over 9,000 calories. Golden aura included.', color: 0xffbe0b, model: 'saiyan-toast.glb', talent: { name: 'SUPER CHARGE', description: 'Gain +2 roll bonus and +2 coins immediately.', cue: '+2 ROLL & +2c', type: 'saiyan' } },
  { id: 'cloud-ninja', badge: 'SHINOBI', name: 'Cloud Shinobi', role: 'THE ROGUE CRUMB', description: 'Moves like steam from a fresh loaf. Strikes before the butter melts.', color: 0xd90429, model: 'cloud-ninja.glb', talent: { name: 'CLOUD BLINK', description: 'Teleport 4 spaces closer to the Golden Crumb right now.', cue: 'WARP +4 SPACES', type: 'blink' } },
  { id: 'whale-buddy', badge: 'WHALE', name: 'Whale Buddy', role: 'THE BIG SPLASH', description: 'Dressed as a legendary crypto whale. Makes huge waves in the Bwedbank.', color: 0x3a86ff, model: 'whale-buddy.glb', talent: { name: 'WHALE PUMP', description: 'Gain +5 coins from the Bwedbank reserve.', cue: 'INSTANT +5 COINS', type: 'whale' } },
  { id: 'nerdy-buddy', badge: '8BIT', name: 'Nerdy Gadget', role: 'THE 8-BIT GENIUS', description: 'Armed with a retro handheld and 200 IQ bakery strategies.', color: 0x8338ec, model: 'nerdy-buddy.glb', talent: { name: 'CHEAT CODE', description: 'Guarantee a high roll (6+) on your next turn.', cue: 'MIN ROLL 6', type: 'cheat' } },
  { id: 'shadow-ninja', badge: 'SHADOW', name: 'Shadow Ninja', role: 'THE NIGHT SLICE', description: 'Invisible in the dark toaster slots. Master of the silent crumb heist.', color: 0x495057, model: 'shadow-ninja.glb', talent: { name: 'SMOKE BOMB', description: 'Steal 2 coins from the richest rival and gain +1 step.', cue: 'STEAL 2c + STEP', type: 'steal' } },
  { id: 'crumb-burglar', badge: 'HEIST', name: 'Crumb Burglar', role: 'THE VAULT THIEF', description: 'Striped shirt, mask and a sack full of freshly liberated Bwedbank coins.', color: 0x2ec4b6, model: 'crumb-burglar.glb', talent: { name: 'HEIST SACK', description: 'Steal 3 coins from the current leader.', cue: 'STEAL 3c FROM 1ST', type: 'heist' } },
  { id: 'tiny-baker', badge: 'CHEF', name: 'Toastie Baker', role: 'THE MASTER CHEF', description: 'Flour on the cheeks, rolling pin in hand. Bakes extra stars from scratch.', color: 0xff9f1c, model: 'tiny-baker.glb', talent: { name: 'FRESH BATCH', description: 'Bake +1 ★ Golden Loaf and +1 coin on the spot!', cue: 'INSTANT +1 ★ LOAF', type: 'bake' } },
  { id: 'toast-tycoon', badge: 'TYCOON', name: 'Toast Tycoon', role: 'THE BWEDBANK BOSS', description: 'Bowler hat, pinstripe suit and a briefcase overflowing with fresh dough.', color: 0x06d6a0, model: 'toast-tycoon.glb', talent: { name: 'DIVIDEND', description: 'Earn +1 coin for every ★ Loaf you own (min +4 coins).', cue: 'DIVIDEND PAYOUT', type: 'dividend' } },
  { id: 'super-hero-bwed', badge: 'HERO', name: 'Super Bwed', role: 'THE CRUST CRUSADER', description: 'Cape fluttering in the warm oven breeze. Leaps across Bwedville to rescue golden slices!', color: 0x3a86ff, model: 'super-hero-bwed.glb', talent: { name: 'HERO LEAP', description: 'Fly +3 spaces forward on your next roll with golden invulnerability (+2 coins).', cue: 'HERO FLY +3 & 2c', type: 'hero' } }
];

const shopItems = [
  { id: 'double-croissant', tag: 'TURBO', name: 'Turbo Croissant', cost: 4, description: 'Add +3 to your next dice roll!' },
  { id: 'warp-whistle', tag: 'WARP', name: 'Toaster Warp', cost: 5, description: 'Teleport 5 spaces closer to the Golden Crumb right now!' },
  { id: 'crumb-vacuum', tag: 'HEIST', name: 'Crumb Vacuum', cost: 5, description: 'Steal 3 coins from the richest rival baker!' },
  { id: 'golden-yeast', tag: 'STAR', name: 'Golden Yeast', cost: 9, description: 'Instantly bake +1 ★ Golden Loaf!' }
];

const makePlayer = (pawn, index = 0, isBot = index > 0) => ({
  ...pawn,
  isBot,
  position: 0,
  coins: 5,
  crumbs: 0,
  rollBonus: 0,
  goldenHits: 0,
  minigameWins: 0,
  chaosTiles: 0,
  talentUsed: false,
  talentRollBonus: 0,
  talentStepBonus: 0,
  talentReroll: false,
  talentRiskShield: false,
  talentCrumbMagnet: false,
  talentDoubleRoll: false,
  talentMinSix: false
});

const urlParams = (typeof window !== 'undefined' && window.location) ? new URLSearchParams(window.location.search) : null;
const urlHeroParam = urlParams ? urlParams.get('hero') : null;
const urlDirectBoard = urlParams ? (urlParams.get('direct') === '1' || urlParams.get('mode') === 'board') : false;
const urlCinematic = urlParams ? (urlParams.get('cinematic') === '1' || urlParams.get('snapshot') === '1') : false;
const initialHero = (urlHeroParam && pawnCatalog.find(p => p.id === urlHeroParam)) || pawnCatalog[0];
const otherPawns = pawnCatalog.filter(p => p.id !== initialHero.id);
const players = [initialHero, ...otherPawns.slice(0, 3)].map((p, i) => makePlayer(p, i, i > 0));
const MAX_ROUNDS = 8;
const roundTwists = [
  { id: 'double-bake', name: 'DOUBLE BAKE', detail: 'Coin spaces pay double (+4c) this round!' },
  { id: 'hot-oven', name: 'HOT OVEN', detail: 'Burner spaces hit harder — mega jackpot or crispy burn!' },
  { id: 'sugar-rush', name: 'SUGAR RUSH', detail: 'Every baker gets +1 speed on their roll this round!' },
  { id: 'golden-hour', name: 'GOLDEN HOUR', detail: 'The Golden Crumb rewards +2 extra ★ Loaves!' }
];

const tileTypes = ['start', 'coin', 'event', 'coin', 'shop', 'duel', 'springboard', 'risk', 'coin', 'vault', 'shop', 'event', 'coin'];
const tilePalette = {
  start: 0xf4bd5f,
  coin: 0xa8c779,
  shop: 0x5bc0be,
  event: 0x9a79d6,
  duel: 0xe76d43,
  risk: 0xcf5d4d,
  springboard: 0xffa07a,
  vault: 0x2ec4b6
};
const tileLabels = {
  start: 'START',
  coin: '+2c',
  shop: 'SHOP',
  event: 'MYSTERY',
  duel: 'VS',
  risk: 'INFERNO',
  springboard: 'HOP',
  vault: 'VAULT'
};

const state = {
  currentPlayer: 0,
  round: 1,
  roundStarter: 0,
  turnsInRound: 0,
  maxRounds: MAX_ROUNDS,
  moving: false,
  paths: [],
  tiles: [],
  buildings: [],
  pawnGroups: [],
  npcGroups: [],
  pawnsLoaded: false,
  clock: 0,
  goldCrumbIndex: 9,
  bankVaultJackpot: 6,
  roundTwist: roundTwists[0],
  gameOver: false,
  inModal: false,
  arcadeMode: false,
  autoCam: true,
  smartCutaway: true,
  hoveredTileIndex: null
};

// Procedural WebAudio Synthesizer
class BwedSoundEngine {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  gain(mult = 1) {
    return ((settings.sfx || 0) / 100) * 0.22 * mult;
  }
  tone(freq, duration = 0.1, type = 'triangle', slideTo = null, delay = 0, vol = 1) {
    if ((settings.sfx || 0) <= 0) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    g.gain.setValueAtTime(this.gain(vol), now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }
  diceTick(i = 0) { this.tone(280 + i * 42, 0.045, 'square', null, 0, 0.55); }
  stepHop() { this.tone(320, 0.09, 'sine', 540, 0, 0.7); }
  coin() {
    this.tone(987.77, 0.08, 'sine', null, 0, 0.8);
    this.tone(1318.5, 0.22, 'sine', null, 0.07, 0.85);
  }
  burn() {
    this.tone(240, 0.16, 'sawtooth', 110, 0, 0.75);
    this.tone(140, 0.24, 'sawtooth', 75, 0.12, 0.75);
  }
  star() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((n, idx) => {
      this.tone(n, 0.16, 'triangle', null, idx * 0.07, 0.95);
    });
  }
  warioIntro() {
    [440, 554.37, 659.25, 880].forEach((n, idx) => {
      this.tone(n, 0.09, 'square', null, idx * 0.06, 0.75);
    });
  }
  pop() { this.tone(520, 0.07, 'triangle', 880, 0, 0.8); }
}
const sfx = new BwedSoundEngine();

// DOM references
const viewport = document.querySelector('#viewport');
const rollButton = document.querySelector('#rollButton');
const resetButton = document.querySelector('#resetButton');
const playerList = document.querySelector('#playerList');
const eventLog = document.querySelector('#eventLog');
const turnLabel = document.querySelector('#turnLabel');
const turnRoleLabel = document.querySelector('#turnRoleLabel');
const turnLocationLabel = document.querySelector('#turnLocationLabel');
const turnOrderPill = document.querySelector('#turnOrderPill');
const turnAvatar = document.querySelector('#turnAvatar');
const roundLabel = document.querySelector('#roundLabel');
const roundLabelDetail = document.querySelector('#roundLabelDetail');
const roundProgressFill = document.querySelector('#roundProgressFill');
const roundTwistElement = document.querySelector('#roundTwist');
const roundTwistDetail = document.querySelector('#roundTwistDetail');
const diceResult = document.querySelector('#diceResult strong');
const toast = document.querySelector('#toast');
const turnBanner = document.querySelector('#turnBanner');
const goldDistanceChip = document.querySelector('#goldDistanceChip');
const bankVaultChip = document.querySelector('#bankVaultChip');
const wheelModal = document.querySelector('#wheelModal');
const wheelSubtitle = document.querySelector('#wheelSubtitle');
const wheelResultBanner = document.querySelector('#wheelResultBanner');
const wheelResultTitle = document.querySelector('#wheelResultTitle');
const wheelResultDesc = document.querySelector('#wheelResultDesc');
const wheelSpinButton = document.querySelector('#wheelSpinButton');
const rollButtonLabel = rollButton.querySelector('span');
const autoCamButton = document.querySelector('#autoCamButton');
const cutawayButton = document.querySelector('#cutawayButton');
const focusCurrentButton = document.querySelector('#focusCurrentButton');
const topViewButton = document.querySelector('#topViewButton');
const resetCameraButton = document.querySelector('#resetCameraButton');
const inspectorBadge = document.querySelector('#inspectorBadge');
const inspectorTitle = document.querySelector('#inspectorTitle');
const inspectorDesc = document.querySelector('#inspectorDesc');
const frontDoor = document.querySelector('#frontDoor');
const protocolWarning = document.querySelector('#protocolWarning');
const gameShell = document.querySelector('#gameShell');
const menuScreens = [...document.querySelectorAll('.menu-screen')];
const playerSlots = document.querySelector('#playerSlots');
const pawnCatalogElement = document.querySelector('#pawnCatalog');
const countSummary = document.querySelector('#countSummary');
const playerCountButtons = [...document.querySelectorAll('[data-player-count]')];
const selectionPreview = document.querySelector('#selectionPreview');
const selectedPawnRole = document.querySelector('#selectedPawnRole');
const selectedPawnName = document.querySelector('#selectedPawnName');
const selectedPawnDescription = document.querySelector('#selectedPawnDescription');
const selectedPawnTalent = document.querySelector('#selectedPawnTalent');
const selectedPawnTalentDescription = document.querySelector('#selectedPawnTalentDescription');
const selectedSlotBotToggle = document.querySelector('#selectedSlotBotToggle');
const selectionProgress = document.querySelector('#selectionProgress');
const settingsModal = document.querySelector('#settingsModal');
const helpModal = document.querySelector('#helpModal');
const shopModal = document.querySelector('#shopModal');
const shopGrid = document.querySelector('#shopGrid');
const shopSubtitle = document.querySelector('#shopSubtitle');
const skipShopButton = document.querySelector('#skipShopButton');
const minigameModal = document.querySelector('#minigameModal');
const minigameCanvas = document.querySelector('#minigameCanvas');
const minigamePromptBanner = document.querySelector('#minigamePromptBanner');
const minigameTitle = document.querySelector('#minigameTitle');
const minigameDirective = document.querySelector('#minigameDirective');
const minigameCategory = document.querySelector('#minigameCategory');
const minigameTimerText = document.querySelector('#minigameTimerText');
const minigameTimerFill = document.querySelector('#minigameTimerFill');
const minigameControlsHint = document.querySelector('#minigameControlsHint');
const minigameLiveScore = document.querySelector('#minigameLiveScore');
const minigameResults = document.querySelector('#minigameResults');
const minigameResultHeading = document.querySelector('#minigameResultHeading');
const minigamePodium = document.querySelector('#minigamePodium');
const minigameContinueButton = document.querySelector('#minigameContinueButton');
const minigameNextArcadeButton = document.querySelector('#minigameNextArcadeButton');
const closeMinigameButton = document.querySelector('#closeMinigameButton');
const finaleModal = document.querySelector('#finaleModal');
const winnerName = document.querySelector('#winnerName');
const winnerSummary = document.querySelector('#winnerSummary');
const bonusStarsBox = document.querySelector('#bonusStarsBox');
const finaleStandings = document.querySelector('#finaleStandings');
const talentButton = document.querySelector('#talentButton');
const talentLabel = document.querySelector('#talentLabel');
const talentStatus = document.querySelector('#talentStatus');

const settings = { music: 55, sfx: 80, camera: 100, reducedMotion: false };
const previewTag = selectionPreview.querySelector('.preview-tag');
let activePlayerSlot = 0;
let previewRenderer;
let previewScene;
let previewCamera;
let previewPawn;
let goldenCrumb;
let activeTurnRing;
let hoverTileRing;
let diceMesh3D;
let windmillBlades;
let toasterSlices = [];
let animatedProps = [];
let burstParticles = [];
let ambientParticles;
let selectedPlayerCount = players.length;

try { Object.assign(settings, JSON.parse(localStorage.getItem('crumb-run-settings') || '{}')); } catch (e) { /* Ignore */ }

// Background In-Game Soundtrack (plays official Bwed MP3s)
const gameMusicList = [
  './assets/audio/music/board-game-fever.mp3',
  './assets/audio/music/bakery-morning.mp3',
  './assets/audio/music/cozy-bakery-morning.mp3',
  './assets/audio/music/kitchen-caper.mp3',
  './assets/audio/music/board-game-fever-2.mp3'
];
let gameMusicIdx = 0;
const gameMusicTitles = ['Bakery Morning', 'Cozy Morning', 'Kitchen Caper', 'Game Fever'];
const bgMusicAudio = new Audio(gameMusicList[0]);
bgMusicAudio.preload = 'metadata';
bgMusicAudio.volume = Math.max(0, Math.min(1, (settings.music || 50) / 100));
bgMusicAudio.addEventListener('ended', () => {
  gameMusicIdx = (gameMusicIdx + 1) % gameMusicList.length;
  bgMusicAudio.src = gameMusicList[gameMusicIdx];
  if (settings.music > 0) bgMusicAudio.play().catch(() => {});
  updateGameMusicVolume();
});

let savedGameMusicVol = settings.music || 50;

function updateGameMusicVolume() {
  if (!bgMusicAudio) return;
  const vol = Math.max(0, Math.min(1, (settings.music || 0) / 100));
  bgMusicAudio.volume = vol;
  if (vol > 0 && bgMusicAudio.paused) {
    bgMusicAudio.play().catch(() => {});
  } else if (vol === 0 && !bgMusicAudio.paused) {
    bgMusicAudio.pause();
  }

  // Update In-Game HUD audio pill
  const hudSlider = document.getElementById('hudAudioSlider');
  const iconOn = document.querySelector('.hud-icon-vol-on');
  const iconOff = document.querySelector('.hud-icon-vol-off');
  const trackLabel = document.getElementById('hudAudioTrack');

  if (hudSlider) hudSlider.value = settings.music;
  if (iconOn) iconOn.style.display = (settings.music > 0 && !bgMusicAudio.paused) ? 'block' : (settings.music > 0 ? 'block' : 'none');
  if (iconOff) iconOff.style.display = settings.music > 0 ? 'none' : 'block';
  if (trackLabel) trackLabel.textContent = gameMusicTitles[gameMusicIdx] || 'Bakery OST';
}

function initHudAudioControls() {
  const toggleBtn = document.getElementById('hudAudioToggle');
  const nextBtn = document.getElementById('hudAudioNext');
  const slider = document.getElementById('hudAudioSlider');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (settings.music > 0) {
        savedGameMusicVol = settings.music;
        settings.music = 0;
      } else {
        settings.music = savedGameMusicVol > 0 ? savedGameMusicVol : 50;
      }
      updateGameMusicVolume();
      refreshSettingsUI();
      saveSettings();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      gameMusicIdx = (gameMusicIdx + 1) % gameMusicList.length;
      bgMusicAudio.src = gameMusicList[gameMusicIdx];
      if (settings.music > 0) bgMusicAudio.play().catch(() => {});
      updateGameMusicVolume();
    });
  }

  if (slider) {
    slider.addEventListener('input', (e) => {
      settings.music = Number(e.target.value);
      if (settings.music > 0) savedGameMusicVol = settings.music;
      updateGameMusicVolume();
      refreshSettingsUI();
      saveSettings();
    });
  }
}

window.addEventListener('click', () => {
  if (settings.music > 0 && bgMusicAudio.paused) {
    bgMusicAudio.play().catch(() => {});
  }
}, { once: true });

// ============================================================================
// THREE.JS DIORAMA SCENE & STUDIO LIGHTING SETUP
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x23100a);
scene.fog = new THREE.FogExp2(0x23100a, 0.012);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 130);
let cameraDistance = 27.5;
let cameraDistanceGoal = 27.5;
let cameraAzimuth = 0.52;
let cameraElevation = 0.92;
const cameraTarget = new THREE.Vector3(0, 0.5, 0);
const cameraTargetGoal = new THREE.Vector3(0, 0.5, 0);
const desiredCameraPosition = new THREE.Vector3();
let cameraFocusPlayer = null;
const raycaster = new THREE.Raycaster();

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default', preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
viewport.appendChild(renderer.domElement);

// Studio environment reflections for rich toy-diorama look on all GLB models
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
pmremGenerator.dispose(); // Free generator memory immediately

scene.add(new THREE.HemisphereLight(0xfff2de, 0x452013, 1.95));
const keyLight = new THREE.DirectionalLight(0xffe2ba, 3.9);
keyLight.position.set(-12, 21, 13);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.near = 2;
keyLight.shadow.camera.far = 52;
const d = 17.5;
keyLight.shadow.camera.left = -d;
keyLight.shadow.camera.right = d;
keyLight.shadow.camera.top = d;
keyLight.shadow.camera.bottom = -d;
keyLight.shadow.bias = -0.0006;
scene.add(keyLight);

const rimLight = new THREE.PointLight(0xff8c42, 30, 38);
rimLight.position.set(12, 8, -11);
scene.add(rimLight);

const warmGlow = new THREE.PointLight(0xffc857, 24, 22);
warmGlow.position.set(0, 4.8, 0);
scene.add(warmGlow);

const boardGroup = new THREE.Group();
scene.add(boardGroup);
const sceneDecor = new THREE.Group();
scene.add(sceneDecor);
const fxGroup = new THREE.Group();
scene.add(fxGroup);

// ============================================================================
// PROCEDURAL BWEDWORLD SEAMLESS PBR & BUMP TEXTURES (Cobble, Brioche, Waffle, Choco)
// ============================================================================
function makeSeamlessCanvasPair(size = 256, drawFn) {
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  drawFn(colorCanvas.getContext('2d'), bumpCanvas.getContext('2d'), size);

  const map = new THREE.CanvasTexture(colorCanvas);
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.anisotropy = 4;

  return { map, bumpMap };
}

// 1. Pavés Sablés & Cacao (tex-cobble-biscuit)
const cobbleTex = makeSeamlessCanvasPair(256, (ctx, bctx, s) => {
  ctx.fillStyle = '#583722';
  ctx.fillRect(0, 0, s, s);
  bctx.fillStyle = '#181818';
  bctx.fillRect(0, 0, s, s);

  const rows = 4;
  const cols = 4;
  const cellW = s / cols;
  const cellH = s / rows;
  const palette = ['#b87d4b', '#9e6236', '#c9915d', '#7c4828', '#d4a26e'];

  for (let r = 0; r < rows; r += 1) {
    const offset = (r % 2) * (cellW * 0.5);
    for (let c = -1; c <= cols; c += 1) {
      const cx = c * cellW + offset + 4;
      const cy = r * cellH + 4;
      const w = cellW - 8;
      const h = cellH - 8;
      const col = palette[(r * 3 + c + 4) % palette.length];

      // Rounded biscuit cobblestone
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect(cx, cy, w, h, 12);
      ctx.fill();

      // Inner warm highlight
      ctx.fillStyle = 'rgba(255, 238, 205, 0.18)';
      ctx.beginPath();
      ctx.roundRect(cx + 4, cy + 3, w - 8, h * 0.55, 8);
      ctx.fill();

      // Bump map dome
      bctx.fillStyle = '#d8d8d8';
      bctx.beginPath();
      bctx.roundRect(cx, cy, w, h, 12);
      bctx.fill();
      bctx.fillStyle = '#ffffff';
      bctx.beginPath();
      bctx.roundRect(cx + 5, cy + 5, w - 10, h - 10, 8);
      bctx.fill();
    }
  }
});
cobbleTex.map.repeat.set(9, 7);
cobbleTex.bumpMap.repeat.set(9, 7);

// 2. Mie de Brioche Dorée & Sésame (tex-brioche-crumb)
const briocheTex = makeSeamlessCanvasPair(256, (ctx, bctx, s) => {
  ctx.fillStyle = '#f8e2ba';
  ctx.fillRect(0, 0, s, s);
  bctx.fillStyle = '#c8c8c8';
  bctx.fillRect(0, 0, s, s);

  for (let i = 0; i < 180; i += 1) {
    const x = ((i * 73) % s);
    const y = ((i * 137) % s);
    const r = 2 + (i % 5);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(214, 158, 88, 0.28)' : 'rgba(255, 248, 230, 0.35)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    bctx.fillStyle = i % 2 === 0 ? '#909090' : '#f0f0f0';
    bctx.beginPath();
    bctx.arc(x, y, r, 0, Math.PI * 2);
    bctx.fill();
  }
});
briocheTex.map.repeat.set(2, 2);
briocheTex.bumpMap.repeat.set(2, 2);

// 3. Gaufre Caramélisée & Or (tex-waffle-caramel)
const waffleTex = makeSeamlessCanvasPair(256, (ctx, bctx, s) => {
  ctx.fillStyle = '#e5a34b';
  ctx.fillRect(0, 0, s, s);
  bctx.fillStyle = '#f2f2f2';
  bctx.fillRect(0, 0, s, s);

  const grid = 4;
  const step = s / grid;
  for (let r = 0; r < grid; r += 1) {
    for (let c = 0; c < grid; c += 1) {
      const x = c * step + 7;
      const y = r * step + 7;
      const w = step - 14;
      ctx.fillStyle = '#b56727';
      ctx.beginPath();
      ctx.roundRect(x, y, w, w, 8);
      ctx.fill();

      ctx.fillStyle = '#8f4916';
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, w - 10, w - 10, 5);
      ctx.fill();

      bctx.fillStyle = '#383838';
      bctx.beginPath();
      bctx.roundRect(x, y, w, w, 8);
      bctx.fill();
    }
  }
});
waffleTex.map.repeat.set(5, 5);
waffleTex.bumpMap.repeat.set(5, 5);

// 4. Chocolat Chaud Marbré (tex-melted-choco)
const chocoTex = makeSeamlessCanvasPair(256, (ctx, bctx, s) => {
  ctx.fillStyle = '#3b1b10';
  ctx.fillRect(0, 0, s, s);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, s, s);

  for (let y = 0; y < s; y += 4) {
    const wave = Math.sin((y / s) * Math.PI * 4) * 18;
    ctx.fillStyle = y % 16 < 8 ? 'rgba(92, 46, 28, 0.55)' : 'rgba(245, 213, 174, 0.16)';
    ctx.beginPath();
    ctx.arc((s * 0.5 + wave) % s, y, 22, 0, Math.PI * 2);
    ctx.fill();

    bctx.fillStyle = y % 16 < 8 ? '#a8a8a8' : '#606060';
    bctx.beginPath();
    bctx.arc((s * 0.5 + wave) % s, y, 20, 0, Math.PI * 2);
    bctx.fill();
  }
});
chocoTex.map.repeat.set(4, 4);
chocoTex.bumpMap.repeat.set(4, 4);

// Load generated seamless BwedWorld biome textures from assets/textures/
const texLoader = new THREE.TextureLoader();
function loadSeamlessBiomeTex(url, repeatX = 2, repeatY = 2) {
  const t = texLoader.load(url);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.repeat.set(repeatX, repeatY);
  return t;
}
const castIronLavaMap = loadSeamlessBiomeTex('./assets/textures/57-tex-cast-iron-lava.png', 2, 2);
const macaronTilesMap = loadSeamlessBiomeTex('./assets/textures/58-tex-pastel-macaron-tiles.png', 2, 2);
const matchaMossMap = loadSeamlessBiomeTex('./assets/textures/55-tex-matcha-moss.png', 2, 2);
const woodBoardMap = loadSeamlessBiomeTex('./assets/textures/60-tex-wood-cutting-board.png', 2, 2);
const gingerbreadBrickMap = loadSeamlessBiomeTex('./assets/textures/100-tex-gingerbread-brick-wall.png', 2, 2);
const croissantRoofMap = loadSeamlessBiomeTex('./assets/textures/59-tex-flaky-croissant-roof.png', 2, 2);
const ginghamClothMap = loadSeamlessBiomeTex('./assets/textures/97-tex-gingham-picnic-cloth.png', 2, 2);
const tableWoodMap = loadSeamlessBiomeTex('./assets/textures/60-tex-wood-cutting-board.png', 10, 10);

// Shared Materials for 3D Town & Toy-Diorama Aesthetic
const MAT = {
  crust: new THREE.MeshStandardMaterial({ color: 0xb86f39, roughness: 0.65 }),
  crustDark: new THREE.MeshStandardMaterial({ color: 0x7d4522, roughness: 0.72 }),
  gingham: new THREE.MeshStandardMaterial({ color: 0xffffff, map: ginghamClothMap, roughness: 0.62 }),
  mie: new THREE.MeshStandardMaterial({
    color: 0xfff3dc,
    map: briocheTex.map,
    bumpMap: briocheTex.bumpMap,
    bumpScale: 0.025,
    roughness: 0.68
  }),
  ironLava: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: castIronLavaMap,
    roughness: 0.45,
    metalness: 0.35
  }),
  macaronTiles: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: macaronTilesMap,
    roughness: 0.32,
    metalness: 0.12
  }),
  wafflePlaza: new THREE.MeshStandardMaterial({
    color: 0xffdf9e,
    map: waffleTex.map,
    bumpMap: waffleTex.bumpMap,
    bumpScale: 0.045,
    roughness: 0.48
  }),
  stuccoCream: new THREE.MeshStandardMaterial({ color: 0xfff3de, roughness: 0.68 }),
  stuccoPeach: new THREE.MeshStandardMaterial({ color: 0xf6c9a0, roughness: 0.68 }),
  stuccoRose: new THREE.MeshStandardMaterial({ color: 0xebb1a3, roughness: 0.68 }),
  stuccoMint: new THREE.MeshStandardMaterial({ color: 0xbde0c6, roughness: 0.65 }),
  slateRoof: new THREE.MeshStandardMaterial({ color: 0x3b4254, roughness: 0.55, metalness: 0.15 }),
  terracottaRoof: new THREE.MeshStandardMaterial({ color: 0xffe0c2, map: croissantRoofMap, roughness: 0.58 }),
  purpleRoof: new THREE.MeshStandardMaterial({ color: 0x5a3b8c, roughness: 0.48, metalness: 0.2 }),
  butter: new THREE.MeshStandardMaterial({ color: 0xffe46b, roughness: 0.32, metalness: 0.05 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xffd15a, roughness: 0.22, metalness: 0.78, emissive: 0xff9f1c, emissiveIntensity: 0.22 }),
  choco: new THREE.MeshStandardMaterial({
    color: 0x4b2416,
    map: chocoTex.map,
    bumpMap: chocoTex.bumpMap,
    bumpScale: 0.03,
    roughness: 0.24,
    metalness: 0.08
  }),
  brick: new THREE.MeshStandardMaterial({ color: 0xffd8c4, map: gingerbreadBrickMap, roughness: 0.74 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xded2c1, roughness: 0.78 }),
  cobble: new THREE.MeshStandardMaterial({
    color: 0xd8b28e,
    map: cobbleTex.map,
    bumpMap: cobbleTex.bumpMap,
    bumpScale: 0.055,
    roughness: 0.76
  }),
  iron: new THREE.MeshStandardMaterial({ color: 0x2b2927, roughness: 0.42, metalness: 0.68 }),
  ember: new THREE.MeshStandardMaterial({ color: 0xff5400, emissive: 0xff4800, emissiveIntensity: 1.4, roughness: 0.4 }),
  warmWindow: new THREE.MeshStandardMaterial({ color: 0xffe89e, emissive: 0xffae34, emissiveIntensity: 0.95, roughness: 0.2 }),
  portal: new THREE.MeshStandardMaterial({ color: 0xb589ff, emissive: 0x7b2cbf, emissiveIntensity: 0.95, roughness: 0.25 }),
  cyanNeon: new THREE.MeshStandardMaterial({ color: 0x5bc0be, emissive: 0x2ec4b6, emissiveIntensity: 0.65, roughness: 0.28 }),
  creamStripe: new THREE.MeshStandardMaterial({ color: 0xfff7ea, roughness: 0.58 }),
  redStripe: new THREE.MeshStandardMaterial({ color: 0xd94336, roughness: 0.52 }),
  greenStripe: new THREE.MeshStandardMaterial({ color: 0x5ca468, roughness: 0.55 }),
  foliage: new THREE.MeshStandardMaterial({ color: 0xdff5d4, map: matchaMossMap, roughness: 0.68 }),
  wood: new THREE.MeshStandardMaterial({ color: 0xe8c7a3, map: woodBoardMap, roughness: 0.72 })
};

// 26-Space Monopoly Boulevard Path (spaced at 2.2 units for generous building lots)
function makePath() {
  const path = [];
  const add = (x, z) => path.push(new THREE.Vector3(x, 0, z));
  for (let i = -4; i <= 4; i += 1) add(i * 2.2, -5.5);        // 9 North spaces (0..8)
  for (let j = -1.5; j <= 2.5; j += 1) add(8.8, j * 2.2);     // 5 East spaces (9..13)
  for (let i = 3; i >= -4; i -= 1) add(i * 2.2, 5.5);         // 8 South spaces (14..21)
  for (let j = 1.5; j >= -1.5; j -= 1) add(-8.8, j * 2.2);    // 4 West spaces (22..25)
  return path;
}

// Metadata for each of the 26 Monopoly-style town spaces (mapped strictly to authentic 3D .glb buildings!)
function getSpaceMeta(index) {
  const rawType = tileTypes[index % tileTypes.length];
  const type = index === 0 ? 'start' : (rawType === 'start' ? 'coin' : rawType);
  const num = `#${String(index + 1).padStart(2, '0')}`;
  if (type === 'start') {
    return {
      num,
      type,
      badge: '[HQ]',
      name: 'Grand Oven Bakery HQ',
      glbFile: 'patisserie-coin.glb',
      targetHeight: 3.45,
      desc: 'Pass for +3c · Stop in front for +1★ Loaf & +3c!'
    };
  }
  if (type === 'shop') {
    const shopVariants = [
      { name: 'Bwed Grand Boutique', glbFile: 'galeries-boutique.glb' },
      { name: 'Honey Pot Tavern', glbFile: 'honey-pot-tavern.glb' },
      { name: 'Whipped Cream Barber', glbFile: 'shop-barber-chantilly.glb' },
      { name: 'Macaron Tea Gazebo', glbFile: 'teacup-gazebo-park.glb' },
      { name: 'Golden Ribbon Emporium', glbFile: 'galeries-boutique.glb' }
    ];
    const shopPick = shopVariants[index % shopVariants.length];
    return {
      num,
      type,
      badge: '[SHOP]',
      name: shopPick.name,
      glbFile: shopPick.glbFile,
      targetHeight: 3.10,
      desc: 'Stop in front of this boutique to buy Power-Ups or +1★ Loaf!'
    };
  }
  if (type === 'event') {
    const variants = [
      { name: 'Starlight Sugar Tower', glbFile: 'portal-observatory.glb' },
      { name: 'Miracle Jam Apothecary', glbFile: 'jam-jar-apothecary.glb' },
      { name: 'Celestial Sugar Observatory', glbFile: 'portal-observatory.glb' },
      { name: 'Mystic Tea Pavilion', glbFile: 'teacup-gazebo-park.glb' }
    ];
    const pick = variants[index % variants.length];
    return {
      num,
      type,
      badge: '[PORTAL]',
      name: pick.name,
      glbFile: pick.glbFile,
      targetHeight: 3.15,
      desc: 'Trigger a Mystery Portal: Warp, Stimulus, Espresso or Secret ★ Loaf!'
    };
  }
  if (type === 'duel') {
    return {
      num,
      type,
      badge: '[ARCADE]',
      name: 'Toaster BwedWare Arcade',
      glbFile: 'arcade-duel.glb',
      targetHeight: 3.05,
      desc: 'Launches an instant 5-second BwedWare micro-game for all players!'
    };
  }
  if (type === 'springboard') {
    return {
      num,
      type,
      badge: '[SPRING]',
      name: 'Waffle Springboard Relay',
      glbFile: 'honey-pot-tavern.glb',
      targetHeight: 3.05,
      desc: 'Super waffle spring: Catapults you +3 spaces ahead instantly!'
    };
  }
  if (type === 'vault') {
    return {
      num,
      type,
      badge: '[VAULT]',
      name: 'Bwedbank Central Reserve',
      glbFile: 'patisserie-coin.glb',
      targetHeight: 3.25,
      desc: 'Municipal vault: Collect the accumulated town jackpot!'
    };
  }
  if (type === 'risk') {
    const names = ['Inferno Oven Furnace (450°F)', 'Bubbling Jam Cauldron'];
    const glbPick = index % 2 === 0 ? 'arcade-duel.glb' : 'jam-jar-apothecary.glb';
    return {
      num,
      type,
      badge: '[FURNACE]',
      name: names[index % names.length],
      glbFile: glbPick,
      targetHeight: 3.05,
      desc: 'High-stakes furnace: Win +1★ Loaf & +4c, or get singed for -2c!'
    };
  }
  const coinVariants = [
    { name: 'Golden Croissant Bakery', glbFile: 'patisserie-coin.glb' },
    { name: 'Milk Carton Apartments', glbFile: 'milk-carton-apartments.glb' },
    { name: 'Jam Jar Apothecary', glbFile: 'jam-jar-apothecary.glb' },
    { name: 'Honey Pot Tavern', glbFile: 'honey-pot-tavern.glb' },
    { name: 'Chantilly Cream Salon', glbFile: 'shop-barber-chantilly.glb' },
    { name: 'Village Gallery Row', glbFile: 'galeries-boutique.glb' },
    { name: 'Teacup Pavilion Park', glbFile: 'teacup-gazebo-park.glb' }
  ];
  const coinPick = coinVariants[index % coinVariants.length];
  return {
    num,
    type,
    badge: '[BAKERY]',
    name: coinPick.name,
    glbFile: coinPick.glbFile,
    targetHeight: 3.05,
    desc: 'Collect +2 fresh coins (+4c during Double Bake rounds)!'
  };
}

const medallionRedrawCallbacks = [];
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    medallionRedrawCallbacks.forEach((fn) => fn());
  });
}

function addTextSprite(text, color = '#11100f', scale = 1, fontSize = 30, bg = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 144;
  const context = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const draw = () => {
    context.clearRect(0, 0, 512, 144);
    if (bg) {
      context.fillStyle = '#24110b';
      context.beginPath();
      context.roundRect(24, 22, 464, 108, 54);
      context.fill();

      context.fillStyle = bg;
      context.beginPath();
      context.roundRect(24, 14, 464, 108, 54);
      context.fill();

      context.strokeStyle = '#fff7ea';
      context.lineWidth = 6;
      context.stroke();
    }
    context.font = `700 ${fontSize * 2}px "Fredoka", "Nunito", sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.lineJoin = 'round';
    context.strokeStyle = 'rgba(36, 17, 11, 0.35)';
    context.lineWidth = 8;
    context.strokeText(text, 256, 69);
    context.fillStyle = color;
    context.fillText(text, 256, 69);
    texture.needsUpdate = true;
  };

  draw();
  medallionRedrawCallbacks.push(draw);

  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.18 * scale, 0.54 * scale, 1);
  return sprite;
}

// High-DPI 512x512 Baked Porcelain & Brass Floor Medallion Texture (Mounted Flat on each Sidewalk Space!)
function createSpaceMedallionTexture(meta, type) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const themes = {
    start: { bgA: '#ffe985', bgB: '#e69628', ring: '#fff7ea', text: '#2c1711', tag: 'START', sub: '+3c / ★' },
    coin: { bgA: '#ffd875', bgB: '#d97f24', ring: '#fff5de', text: '#2c1711', tag: '+2 COINS', sub: 'BAKERY' },
    shop: { bgA: '#6ee7df', bgB: '#1fa398', ring: '#fff7ea', text: '#163836', tag: 'BOUTIQUE', sub: 'SHOP' },
    event: { bgA: '#c39bff', bgB: '#6f32be', ring: '#f7ebff', text: '#fff7ea', tag: 'PORTAL', sub: 'MYSTERY' },
    duel: { bgA: '#ff8566', bgB: '#c92a2a', ring: '#ffe89e', text: '#fff7ea', tag: 'ARCADE', sub: 'VS DUEL' },
    risk: { bgA: '#ff6b35', bgB: '#8f1d14', ring: '#ffb703', text: '#fff7ea', tag: 'FURNACE', sub: 'RISK!' }
  };
  const th = themes[type] || themes.coin;

  const draw = () => {
    ctx.clearRect(0, 0, 512, 512);
    const cx = 256;
    const cy = 256;

    // Outer brass rim base
    ctx.fillStyle = '#d4943a';
    ctx.beginPath();
    ctx.arc(cx, cy, 248, 0, Math.PI * 2);
    ctx.fill();

    // Radial enamel glaze fill
    const grad = ctx.createRadialGradient(cx, cy - 45, 25, cx, cy, 228);
    grad.addColorStop(0, th.bgA);
    grad.addColorStop(1, th.bgB);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 226, 0, Math.PI * 2);
    ctx.fill();

    // Inner porcelain cream/gold double ring
    ctx.strokeStyle = th.ring;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, 204, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(44, 23, 17, 0.25)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 188, 0, Math.PI * 2);
    ctx.stroke();

    // 8 Brass Rivet Pearls around the bezel
    for (let i = 0; i < 8; i += 1) {
      const ang = (i * Math.PI) / 4;
      const rx = cx + Math.cos(ang) * 236;
      const ry = cy + Math.sin(ang) * 236;
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.arc(rx, ry, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top Number Pill Badge (e.g. #01 .. #26)
    ctx.fillStyle = '#2c1711';
    ctx.beginPath();
    ctx.roundRect(cx - 66, 48, 132, 54, 27);
    ctx.fill();
    ctx.strokeStyle = '#ffd15a';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = '700 34px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe46b';
    ctx.fillText(meta.num, cx, 76);

    // Center Emblem Icon
    ctx.font = '126px "Apple Color Emoji", "Segoe UI Emoji", "Fredoka", sans-serif';
    ctx.fillText(meta.icon, cx, 218);

    // Bottom Ribbon Tag with Thick Cocoa Stroke
    ctx.font = '700 54px "Fredoka", "Nunito", sans-serif';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#24110b';
    ctx.lineWidth = 16;
    ctx.strokeText(th.tag, cx, 344);
    ctx.fillStyle = '#fff7ea';
    ctx.fillText(th.tag, cx, 344);

    // Sub-caption
    ctx.font = '700 28px "Fredoka", "Nunito", sans-serif';
    ctx.fillStyle = th.ring;
    ctx.fillText(th.sub, cx, 402);

    texture.needsUpdate = true;
  };

  draw();
  medallionRedrawCallbacks.push(draw);
  return texture;
}

// Compute outward unit vector from the street so every building sits cleanly behind its sidewalk pad
function getOutwardDir(pos) {
  const isCornerX = Math.abs(pos.x) >= 8.5;
  const isCornerZ = Math.abs(pos.z) >= 5.2;
  if (isCornerX && isCornerZ) {
    return new THREE.Vector3(Math.sign(pos.x), 0, Math.sign(pos.z)).normalize();
  }
  if (isCornerZ) return new THREE.Vector3(0, 0, Math.sign(pos.z));
  if (isCornerX) return new THREE.Vector3(Math.sign(pos.x), 0, 0);
  return new THREE.Vector3(pos.x, 0, pos.z).normalize();
}

// Helper to add a warm glowing window + frame to a building facade
function addShopWindow(parent, x, y, z, w = 0.44, h = 0.48) {
  const frame = new THREE.Mesh(new RoundedBoxGeometry(w + 0.08, h + 0.08, 0.08, 0.02, 2), MAT.wood);
  frame.position.set(x, y, z);
  const glass = new THREE.Mesh(new RoundedBoxGeometry(w, h, 0.1, 0.02, 2), MAT.warmWindow);
  glass.position.set(x, y, z + 0.01);
  parent.add(frame, glass);
}

// Helper to add a striped Parisian awning on the front of a building (+z faces the sidewalk)
function addStripedAwning(parent, y, z, width = 1.62, stripeMatA = MAT.redStripe, stripeMatB = MAT.creamStripe) {
  const awning = new THREE.Group();
  awning.position.set(0, y, z);
  awning.rotation.x = 0.32;
  const count = 5;
  const stripeW = width / count;
  for (let i = 0; i < count; i += 1) {
    const x = (i - (count - 1) / 2) * stripeW;
    const stripe = new THREE.Mesh(
      new RoundedBoxGeometry(stripeW * 0.96, 0.12, 0.56, 0.03, 2),
      i % 2 === 0 ? stripeMatA : stripeMatB
    );
    stripe.position.x = x;
    stripe.castShadow = true;
    awning.add(stripe);
  }
  parent.add(awning);
}

// ============================================================================
// MONOPOLY-STYLE 3D BUILDINGS (BEHIND EVERY SIDEWALK PAWN PAD)
// ============================================================================

// 1. START BUILDING — Grand Oven City Hall (2-story Brick & Gold Bakery HQ)
function buildStartCityHall(upperGroup) {
  const firstFloor = new THREE.Mesh(new RoundedBoxGeometry(1.92, 1.35, 1.32, 0.1, 3), MAT.brick);
  firstFloor.position.y = 0.68;
  firstFloor.castShadow = true;
  firstFloor.receiveShadow = true;

  const secondFloor = new THREE.Mesh(new RoundedBoxGeometry(1.74, 1.05, 1.18, 0.08, 3), MAT.stuccoCream);
  secondFloor.position.y = 1.82;
  secondFloor.castShadow = true;

  const mansardRoof = new THREE.Mesh(new THREE.ConeGeometry(1.32, 0.95, 4), MAT.slateRoof);
  mansardRoof.rotation.y = Math.PI / 4;
  mansardRoof.position.y = 2.75;
  mansardRoof.castShadow = true;

  // Glowing Grand Oven Archway on the front facade (+Z faces sidewalk)
  const ovenArch = new THREE.Mesh(new RoundedBoxGeometry(0.76, 0.88, 0.16, 0.08, 3), MAT.iron);
  ovenArch.position.set(0, 0.46, 0.64);
  const hearth = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.68, 0.18, 0.06, 2), MAT.ember);
  hearth.position.set(0, 0.42, 0.66);

  addShopWindow(upperGroup, -0.58, 0.72, 0.64, 0.34, 0.44);
  addShopWindow(upperGroup, 0.58, 0.72, 0.64, 0.34, 0.44);
  addShopWindow(upperGroup, -0.45, 1.82, 0.58, 0.34, 0.42);
  addShopWindow(upperGroup, 0.45, 1.82, 0.58, 0.34, 0.42);

  // Golden Clock / Crest on 2nd story
  const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 20), MAT.gold);
  clock.rotation.x = Math.PI / 2;
  clock.position.set(0, 2.02, 0.6);

  // Chimney + animated steam clouds
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.85, 12), MAT.brick);
  chimney.position.set(0.52, 2.95, -0.15);
  for (let i = 0; i < 3; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(0.16 + i * 0.04, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff7ea, transparent: true, opacity: 0.78, roughness: 1 })
    );
    puff.position.set(0.52 + (i - 1) * 0.08, 3.45 + i * 0.32, -0.15);
    puff.userData = { animType: 'float', baseY: puff.position.y, phase: i * 1.1 };
    animatedProps.push(puff);
    upperGroup.add(puff);
  }

  const sign = addTextSprite('GRAND OVEN HQ', '#2c1711', 1.25, 22, '#ffe46b');
  sign.position.set(0, 3.45, 0.25);

  upperGroup.add(firstFloor, secondFloor, mansardRoof, ovenArch, hearth, clock, chimney, sign);
}

// 2. COIN BUILDINGS — 3 Architectural Variants (Patisserie, BwedBank, Café Brioché)
function buildCoinBuilding(upperGroup, index) {
  const variant = index % 3;

  if (variant === 0) {
    // Variant A: Haussmannian 2-Story Patisserie Dorée
    const walls = new THREE.Mesh(new RoundedBoxGeometry(1.66, 1.65, 1.18, 0.08, 3), MAT.stuccoCream);
    walls.position.y = 0.82;
    walls.castShadow = true;
    walls.receiveShadow = true;

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.18, 0.78, 4), MAT.terracottaRoof);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = 1.98;
    roof.castShadow = true;

    const door = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.75, 0.1, 0.03, 2), MAT.wood);
    door.position.set(-0.36, 0.38, 0.58);
    addShopWindow(upperGroup, 0.32, 0.52, 0.58, 0.58, 0.48);
    addShopWindow(upperGroup, -0.38, 1.28, 0.58, 0.36, 0.36);
    addShopWindow(upperGroup, 0.38, 1.28, 0.58, 0.36, 0.36);
    addStripedAwning(upperGroup, 0.88, 0.72, 1.54, MAT.greenStripe, MAT.creamStripe);

    upperGroup.add(walls, roof, door);
  } else if (variant === 1) {
    // Variant B: Neoclassical BwedBank Mint (Marble Columns & Pediment)
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.68, 1.55, 1.2, 0.08, 3), MAT.stuccoMint);
    body.position.y = 0.78;
    body.castShadow = true;
    body.receiveShadow = true;

    [-0.58, -0.2, 0.2, 0.58].forEach((x) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.38, 12), MAT.stone);
      col.position.set(x, 0.7, 0.62);
      col.castShadow = true;
      upperGroup.add(col);
    });

    const pediment = new THREE.Mesh(new THREE.ConeGeometry(1.22, 0.68, 4), MAT.gold);
    pediment.rotation.y = Math.PI / 4;
    pediment.position.y = 1.85;
    pediment.castShadow = true;

    addShopWindow(upperGroup, 0, 0.62, 0.58, 0.56, 0.66);
    upperGroup.add(body, pediment);
  } else {
    // Variant C: Cozy Timber & Rose Café Brioché
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.64, 1.52, 1.16, 0.09, 3), MAT.stuccoRose);
    body.position.y = 0.76;
    body.castShadow = true;
    body.receiveShadow = true;

    const roof = new THREE.Mesh(new RoundedBoxGeometry(1.76, 0.36, 1.28, 0.08, 3), MAT.crustDark);
    roof.position.y = 1.62;
    roof.castShadow = true;

    addShopWindow(upperGroup, -0.38, 0.56, 0.57, 0.44, 0.5);
    addShopWindow(upperGroup, 0.38, 0.56, 0.57, 0.44, 0.5);
    addStripedAwning(upperGroup, 0.94, 0.7, 1.52, MAT.redStripe, MAT.creamStripe);

    upperGroup.add(body, roof);
  }

  // Spinning 3D Gold Coin Rooftop Emblem on all Coin buildings
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.09, 20), MAT.gold);
  coin.rotation.x = Math.PI / 2;
  coin.position.set(0, 2.38, 0.15);
  coin.castShadow = true;
  coin.userData = { animType: 'floatSpin', baseY: 2.38, phase: index * 0.6 };
  animatedProps.push(coin);
  upperGroup.add(coin);
}

// 3. SHOP BUILDING — Galeries Bwed Luxury Boutique (2-Story Turquoise & Gold)
function buildShopBoutiqueBuilding(upperGroup) {
  const groundFloor = new THREE.Mesh(new RoundedBoxGeometry(1.82, 1.15, 1.26, 0.09, 3), MAT.wood);
  groundFloor.position.y = 0.58;
  groundFloor.castShadow = true;
  groundFloor.receiveShadow = true;

  const upperFloor = new THREE.Mesh(new RoundedBoxGeometry(1.72, 0.95, 1.18, 0.08, 3), MAT.stuccoCream);
  upperFloor.position.y = 1.58;
  upperFloor.castShadow = true;

  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.72, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), MAT.cyanNeon);
  dome.position.y = 2.02;
  dome.castShadow = true;

  addShopWindow(upperGroup, -0.44, 0.55, 0.62, 0.52, 0.54);
  addShopWindow(upperGroup, 0.44, 0.55, 0.62, 0.52, 0.54);
  addShopWindow(upperGroup, -0.42, 1.55, 0.58, 0.42, 0.4);
  addShopWindow(upperGroup, 0.42, 1.55, 0.58, 0.42, 0.4);
  addStripedAwning(upperGroup, 1.02, 0.76, 1.72, MAT.cyanNeon, MAT.creamStripe);

  // Giant Golden Croissant Sign on Roof
  const croissant = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.09, 10, 18, Math.PI * 1.35), MAT.gold);
  croissant.position.set(0, 2.75, 0.2);
  croissant.castShadow = true;

  const badge = addTextSprite('BOUTIQUE', '#fff7ea', 1.08, 24, '#2ec4b6');
  badge.position.set(0, 3.25, 0.25);

  upperGroup.add(groundFloor, upperFloor, dome, croissant, badge);
}

// 4. EVENT BUILDING — Astral Observatory & Tarot Bakery Tower
function buildEventSanctuaryBuilding(upperGroup, index) {
  const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.86, 1.85, 12), MAT.stuccoPeach);
  towerBase.position.y = 0.92;
  towerBase.castShadow = true;
  towerBase.receiveShadow = true;

  const wizardRoof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.15, 12), MAT.purpleRoof);
  wizardRoof.position.y = 2.38;
  wizardRoof.castShadow = true;

  // Rotating Cosmic Portal Ring framing the front entrance
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.07, 12, 28), MAT.portal);
  ring.position.set(0, 0.78, 0.78);
  ring.userData = { animType: 'spinZ', speed: 1.5 };
  animatedProps.push(ring);

  // Floating 3D Question Block above the spire
  const qBlock = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.42, 0.42, 0.08, 3), MAT.portal);
  qBlock.position.set(0, 3.22, 0);
  qBlock.castShadow = true;
  qBlock.userData = { animType: 'floatSpin', baseY: 3.22, phase: index };
  animatedProps.push(qBlock);

  const badge = addTextSprite('PORTAL', '#fff7ea', 1.0, 24, '#7b2cbf');
  badge.position.set(0, 3.78, 0.2);

  upperGroup.add(towerBase, wizardRoof, ring, qBlock, badge);
}

// 5. DUEL BUILDING — Shibuya Neon BwedWare Arcade Hall
function buildDuelArcadeBuilding(upperGroup, index) {
  const hall = new THREE.Mesh(new RoundedBoxGeometry(1.76, 1.82, 1.24, 0.1, 3), MAT.iron);
  hall.position.y = 0.91;
  hall.castShadow = true;
  hall.receiveShadow = true;

  // Neon side pillars
  [-0.78, 0.78].forEach((x) => {
    const neonBar = new THREE.Mesh(new RoundedBoxGeometry(0.12, 1.72, 0.14, 0.03, 2), MAT.cyanNeon);
    neonBar.position.set(x, 0.91, 0.62);
    upperGroup.add(neonBar);
  });

  // Glowing Arcade Screen Marquee on front facade
  const screen = new THREE.Mesh(new RoundedBoxGeometry(1.22, 0.62, 0.1, 0.04, 2), MAT.warmWindow);
  screen.position.set(0, 1.25, 0.62);

  const door = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.74, 0.1, 0.03, 2), MAT.redStripe);
  door.position.set(0, 0.38, 0.61);

  const holo = addTextSprite('BWED ARCADE', '#1f100b', 1.08, 24, '#ffe46b');
  holo.position.set(0, 2.38, 0.25);
  holo.userData = { animType: 'float', baseY: 2.38, phase: index };
  animatedProps.push(holo);

  upperGroup.add(hall, screen, door, holo);
}

// 6. RISK BUILDING — Cast-Iron Inferno Furnace & Smokehouse
function buildRiskFurnaceBuilding(upperGroup, index) {
  const forge = new THREE.Mesh(new RoundedBoxGeometry(1.74, 1.58, 1.22, 0.1, 3), MAT.brick);
  forge.position.y = 0.79;
  forge.castShadow = true;
  forge.receiveShadow = true;

  const ironRoof = new THREE.Mesh(new RoundedBoxGeometry(1.84, 0.32, 1.32, 0.08, 3), MAT.iron);
  ironRoof.position.y = 1.68;
  ironRoof.castShadow = true;

  // Blazing furnace mouth on the front facade
  const grate = new THREE.Mesh(new RoundedBoxGeometry(0.88, 0.72, 0.14, 0.06, 2), MAT.iron);
  grate.position.set(0, 0.44, 0.6);
  const fireCore = new THREE.Mesh(new RoundedBoxGeometry(0.68, 0.54, 0.16, 0.04, 2), MAT.ember);
  fireCore.position.set(0, 0.42, 0.62);

  // Twin iron smokestacks
  [-0.45, 0.45].forEach((x) => {
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.78, 12), MAT.iron);
    stack.position.set(x, 2.15, -0.15);
    stack.castShadow = true;
    upperGroup.add(stack);
  });

  // Floating Fire Crystal over the furnace
  const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 1), MAT.ember);
  flame.position.set(0, 2.75, 0.1);
  flame.userData = { animType: 'floatSpin', baseY: 2.75, phase: index * 0.8 };
  animatedProps.push(flame);

  const badge = addTextSprite('INFERNO FURNACE', '#fff7ea', 1.0, 24, '#cf5d4d');
  badge.position.set(0, 3.28, 0.25);

  upperGroup.add(forge, ironRoof, grate, fireCore, flame, badge);
}

// ============================================================================
// BUILD EACH SPACE: FRONT SIDEWALK PAWN PAD + BACK 3D BUILDING LOT
// ============================================================================
function makeTile(position, index) {
  const meta = getSpaceMeta(index);
  const { type } = meta;
  const tile = new THREE.Group();
  tile.position.copy(position);

  const outwardDir = getOutwardDir(position);
  const isCorner = Math.abs(position.x) >= 8.5 && Math.abs(position.z) >= 5.2;
  tile.userData = { type, index, meta, outwardDir };

  // --------------------------------------------------------------------------
  // A. FRONT SIDEWALK STOPPING PLAZA (Chubby Biscuit-and-Brioche Boulevard Pad)
  // --------------------------------------------------------------------------
  const sidewalkBase = new THREE.Mesh(
    new RoundedBoxGeometry(2.16, 0.36, 2.16, 0.16, 5),
    type === 'risk' ? MAT.iron : MAT.crust
  );
  sidewalkBase.position.y = 0.15;
  sidewalkBase.castShadow = true;
  sidewalkBase.receiveShadow = true;
  tile.add(sidewalkBase);

  const sidewalkTopMat =
    type === 'risk'
      ? MAT.ironLava
      : type === 'shop'
        ? MAT.macaronTiles
        : MAT.mie;
  const sidewalkTop = new THREE.Mesh(
    new RoundedBoxGeometry(1.98, 0.14, 1.98, 0.10, 4),
    sidewalkTopMat
  );
  sidewalkTop.position.y = 0.34;
  sidewalkTop.receiveShadow = true;
  tile.add(sidewalkTop);

  // 4 Golden Chocolate-Drop Corner Studs on each Sidewalk Pad
  [
    [-0.82, -0.82], [0.82, -0.82],
    [-0.82, 0.82], [0.82, 0.82]
  ].forEach(([sx, sz]) => {
    const stud = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), MAT.gold);
    stud.scale.y = 0.55;
    stud.position.set(sx, 0.41, sz);
    tile.add(stud);
  });

  // Monopoly Glazed Property Curb Strip along the Building Entrance Edge
  const colorMat = new THREE.MeshStandardMaterial({
    color: tilePalette[type],
    roughness: 0.28,
    metalness: 0.16,
    emissive: tilePalette[type],
    emissiveIntensity: 0.15
  });
  const propertyStrip = new THREE.Mesh(new RoundedBoxGeometry(1.76, 0.1, 0.36, 0.04, 3), colorMat);
  propertyStrip.position.set(outwardDir.x * 0.68, 0.42, outwardDir.z * 0.68);
  propertyStrip.lookAt(
    propertyStrip.position.x + outwardDir.x,
    propertyStrip.position.y,
    propertyStrip.position.z + outwardDir.z
  );
  tile.add(propertyStrip);

  // --------------------------------------------------------------------------
  // B. TACTILE 3D PORCELAIN & BRASS STOPPING MEDALLION (Mounted Flat on Ground!)
  // --------------------------------------------------------------------------
  const medGroup = new THREE.Group();
  medGroup.position.set(-outwardDir.x * 0.12, 0.41, -outwardDir.z * 0.12);

  // Brass base cylinder + Torus bezel ring
  const medBase = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.66, 0.06, 32), MAT.gold);
  medBase.receiveShadow = true;
  const medBezel = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.042, 12, 32), MAT.gold);
  medBezel.rotation.x = Math.PI / 2;
  medBezel.position.y = 0.025;

  // High-DPI Porcelain Enamel Face lying flat on the medallion
  const medFaceTex = createSpaceMedallionTexture(meta, type);
  const medFaceMat = new THREE.MeshStandardMaterial({
    map: medFaceTex,
    roughness: 0.26,
    metalness: 0.08
  });
  const medFace = new THREE.Mesh(new THREE.CircleGeometry(0.58, 32), medFaceMat);
  medFace.rotation.x = -Math.PI / 2;
  // Orient the medallion face so the top faces the building and bottom faces the street/camera
  medFace.rotation.z = Math.atan2(-outwardDir.x, -outwardDir.z);
  medFace.position.y = 0.033;
  medFace.receiveShadow = true;

  medGroup.add(medBase, medBezel, medFace);
  tile.add(medGroup);

  // --------------------------------------------------------------------------
  // C. CHUBBY 3D BRASS & BISCUIT STEPPING CHEVRON TO NEXT SPACE
  // --------------------------------------------------------------------------
  const next = state.paths[(index + 1) % state.paths.length];
  const direction = next.clone().sub(position).normalize();
  const chevronGroup = new THREE.Group();
  chevronGroup.position.set(direction.x * 0.92, 0.41, direction.z * 0.92);
  chevronGroup.rotation.y = Math.atan2(direction.x, direction.z);

  const stepStone = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.06, 0.32, 0.03, 3), MAT.butter);
  const wingL = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.05, 0.07, 0.02, 2), MAT.gold);
  wingL.position.set(-0.06, 0.035, 0.02);
  wingL.rotation.y = -0.55;
  const wingR = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.05, 0.07, 0.02, 2), MAT.gold);
  wingR.position.set(0.06, 0.035, 0.02);
  wingR.rotation.y = 0.55;
  chevronGroup.add(stepStone, wingL, wingR);
  tile.add(chevronGroup);

  // --------------------------------------------------------------------------
  // D. 3D BUILDING LOT & GINGHAM PORCH RIGHT BEHIND THE SIDEWALK PAD
  // --------------------------------------------------------------------------
  const lotDist = isCorner ? 2.45 : 2.15;
  const buildingLot = new THREE.Group();
  buildingLot.position.copy(outwardDir).multiplyScalar(lotDist);
  // Orient buildingLot so +Z faces directly toward the sidewalk pad (0, 0, 0)
  buildingLot.lookAt(0, buildingLot.position.y, 0);

  // Two-Tier Toasted Biscuit & Brioche Property Terrace
  const foundation = new THREE.Mesh(new RoundedBoxGeometry(2.28, 0.38, 1.95, 0.14, 4), MAT.crustDark);
  foundation.position.set(0, 0.16, 0.06);
  foundation.castShadow = true;
  foundation.receiveShadow = true;
  buildingLot.add(foundation);

  const terraceTop = new THREE.Mesh(new RoundedBoxGeometry(2.12, 0.12, 1.78, 0.09, 3), MAT.mie);
  terraceTop.position.set(0, 0.35, 0.06);
  terraceTop.receiveShadow = true;
  buildingLot.add(terraceTop);

  // Woven Red-and-Cream Gingham Entrance Doormat + Brass Threshold connecting Building Door to Sidewalk
  const doormat = new THREE.Mesh(new RoundedBoxGeometry(0.92, 0.07, 0.56, 0.03, 3), MAT.gingham);
  doormat.position.set(0, 0.4, 0.88);
  doormat.receiveShadow = true;
  buildingLot.add(doormat);

  const brassThreshold = new THREE.Mesh(new RoundedBoxGeometry(0.98, 0.05, 0.1, 0.02, 2), MAT.gold);
  brassThreshold.position.set(0, 0.41, 1.08);
  buildingLot.add(brassThreshold);

  // Twin Chubby Golden Butter-Drop Porch Bollards flanking the entrance
  [-0.58, 0.58].forEach((bx) => {
    const bollard = new THREE.Group();
    bollard.position.set(bx, 0.4, 0.86);
    const bPost = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.085, 0.22, 12), MAT.crust);
    bPost.position.y = 0.11;
    const bCap = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 10), MAT.gold);
    bCap.position.y = 0.24;
    bollard.add(bPost, bCap);
    buildingLot.add(bollard);
  });

  // Upper 3D Building Structure (supports Smart Camera Cutaway when in foreground)
  const buildingUpper = new THREE.Group();
  buildingUpper.position.y = 0.38;
  buildingUpper.userData = { tileIndex: index };

  // Procedural fallback hull (automatically replaced by real .glb building in loadBoardBuildingsGLB)
  const hullGroup = new THREE.Group();
  buildingUpper.add(hullGroup);

  if (type === 'start') buildStartCityHall(hullGroup);
  else if (type === 'shop') buildShopBoutiqueBuilding(hullGroup);
  else if (type === 'event') buildEventSanctuaryBuilding(hullGroup, index);
  else if (type === 'duel') buildDuelArcadeBuilding(hullGroup, index);
  else if (type === 'risk') buildRiskFurnaceBuilding(hullGroup, index);
  else buildCoinBuilding(hullGroup, index);

  // Subtle 3D Floating Collectible Token above roof (Zero flat 2D text billboards!)
  const roofBadgeGroup = new THREE.Group();
  if (type === 'event') {
    const qBlock = new THREE.Mesh(new RoundedBoxGeometry(0.32, 0.32, 0.32, 0.08, 3), MAT.portal);
    qBlock.position.set(0, 2.68, 0);
    qBlock.castShadow = true;
    qBlock.userData = { animType: 'floatSpin', baseY: 2.68, phase: index };
    animatedProps.push(qBlock);
    roofBadgeGroup.add(qBlock);
  } else if (type === 'risk') {
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), MAT.ember);
    flame.position.set(0, 2.62, 0.08);
    flame.userData = { animType: 'floatSpin', baseY: 2.62, phase: index * 0.8 };
    animatedProps.push(flame);
    roofBadgeGroup.add(flame);
  } else if (type === 'coin') {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.07, 20), MAT.gold);
    coin.rotation.x = Math.PI / 2;
    coin.position.set(0, 2.52, 0.1);
    coin.castShadow = true;
    coin.userData = { animType: 'floatSpin', baseY: 2.52, phase: index * 0.6 };
    animatedProps.push(coin);
    roofBadgeGroup.add(coin);
  }
  buildingUpper.add(roofBadgeGroup);

  buildingLot.add(buildingUpper);
  tile.add(buildingLot);

  boardGroup.add(tile);
  state.tiles.push(tile);
  state.buildings.push({
    index,
    meta,
    tile,
    buildingLot,
    buildingUpper,
    hullGroup,
    roofBadgeGroup,
    outwardDir: outwardDir.clone(),
    currentScaleY: 1
  });
  return tile;
}

// ============================================================================
// TOWN BOULEVARD ROADBED, BRIDGES, TEASPOON LANTERNS & CENTRAL PLAZA
// ============================================================================
function buildStreetLamp(parent, x, z) {
  const lamp = new THREE.Group();
  lamp.position.set(x, 0.18, z);

  // Chubby Biscuit & Brass Pedestal Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.22, 14), MAT.crustDark);
  base.position.y = 0.11;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 16), MAT.gold);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.22;

  // Brushed Brass Teaspoon Stem
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.08, 1.75, 12), MAT.gold);
  post.position.y = 0.98;
  post.castShadow = true;

  // Curved Top Arm + Warm Glowing Honey-Jar Lantern
  const arm = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 10, 16, Math.PI), MAT.gold);
  arm.position.set(0.22, 1.84, 0);

  const honeyJar = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.34, 0.28, 0.08, 3), MAT.warmWindow);
  honeyJar.position.set(0.42, 1.66, 0);

  const jarLid = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.08, 14), MAT.crustDark);
  jarLid.position.set(0.42, 1.86, 0);

  lamp.add(base, collar, post, arm, honeyJar, jarLid);
  parent.add(lamp);
}

function buildTopiaryTree(parent, x, z, scale = 1) {
  const tree = new THREE.Group();
  tree.position.set(x, -0.35, z);
  tree.scale.setScalar(scale);

  // Honey-Wood Barrel with Twin Brass Hoops
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.68, 16), MAT.wood);
  barrel.position.y = 0.34;
  barrel.castShadow = true;

  [0.18, 0.5].forEach((hy) => {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.03, 8, 20), MAT.gold);
    hoop.rotation.x = Math.PI / 2;
    hoop.position.y = hy;
    tree.add(hoop);
  });

  // Cinnamon-Stick Trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.92, 12), MAT.crustDark);
  trunk.position.y = 0.96;

  // Lush Choux-Pistachio Billowy Canopy
  const crownA = new THREE.Mesh(new THREE.SphereGeometry(0.72, 18, 14), MAT.foliage);
  crownA.position.y = 1.66;
  crownA.castShadow = true;

  const crownB = new THREE.Mesh(new THREE.SphereGeometry(0.52, 16, 12), MAT.foliage);
  crownB.position.y = 2.3;
  crownB.castShadow = true;

  // Cute Pastel Sugar-Berry Blossoms on the canopy
  [
    [0.52, 1.62, 0.32], [-0.48, 1.74, 0.36],
    [0.28, 2.28, 0.38], [-0.32, 2.18, -0.34]
  ].forEach(([bx, by, bz], i) => {
    const berry = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 10, 8),
      i % 2 === 0 ? MAT.stuccoRose : MAT.butter
    );
    berry.position.set(bx, by, bz);
    tree.add(berry);
  });

  tree.add(barrel, trunk, crownA, crownB);
  parent.add(tree);
}

function buildPretzelHedge(parent, x, z, length = 3.2, rotY = 0) {
  const hedge = new THREE.Group();
  hedge.position.set(x, 0.12, z);
  hedge.rotation.y = rotY;

  const planter = new THREE.Mesh(new RoundedBoxGeometry(length, 0.18, 0.44, 0.06, 3), MAT.crustDark);
  planter.castShadow = true;
  planter.receiveShadow = true;

  const sponge = new THREE.Mesh(new RoundedBoxGeometry(length - 0.12, 0.28, 0.36, 0.12, 4), MAT.foliage);
  sponge.position.y = 0.2;
  sponge.castShadow = true;

  hedge.add(planter, sponge);
  parent.add(hedge);
}

function buildCenterpieceIsland() {
  const island = new THREE.Group();

  // Continuous Cobblestone Town Foundation under the entire Boulevard & Buildings
  const townFoundation = new THREE.Mesh(
    new RoundedBoxGeometry(25.2, 0.44, 18.8, 1.4, 6),
    MAT.cobble
  );
  townFoundation.position.y = -0.22;
  townFoundation.receiveShadow = true;
  island.add(townFoundation);

  // Golden Toasted-Crust Outer Curb framing Bwedville
  const outerBorder = new THREE.Mesh(
    new RoundedBoxGeometry(25.8, 0.28, 19.4, 1.5, 6),
    MAT.crustDark
  );
  outerBorder.position.y = -0.32;
  island.add(outerBorder);

  // Continuous Tactile Cobblestone Boulevard Roadbed connecting all 26 Sidewalk Spaces
  const avenues = [
    { x: 0, z: -5.5, w: 20.2, d: 2.38, isHorizontal: true },
    { x: 0, z: 5.5, w: 20.2, d: 2.38, isHorizontal: true },
    { x: -8.8, z: 0, w: 2.38, d: 13.4, isHorizontal: false },
    { x: 8.8, z: 0, w: 2.38, d: 13.4, isHorizontal: false }
  ];

  avenues.forEach((ave) => {
    // 1. Tactile Cobblestone Paving Slab
    const roadSlab = new THREE.Mesh(new RoundedBoxGeometry(ave.w, 0.16, ave.d, 0.1, 3), MAT.cobble);
    roadSlab.position.set(ave.x, 0.04, ave.z);
    roadSlab.receiveShadow = true;
    island.add(roadSlab);

    // 2. Beveled Golden Biscuit Curbs framing the avenue sides
    if (ave.isHorizontal) {
      [-ave.d * 0.48, ave.d * 0.48].forEach((cz) => {
        const curb = new THREE.Mesh(new RoundedBoxGeometry(ave.w * 0.98, 0.12, 0.18, 0.04, 3), MAT.crust);
        curb.position.set(ave.x, 0.11, ave.z + cz);
        curb.receiveShadow = true;
        island.add(curb);
      });
      // Dashed Icing Centerline
      for (let dx = -ave.w * 0.42; dx <= ave.w * 0.42; dx += 1.8) {
        const dash = new THREE.Mesh(new RoundedBoxGeometry(0.72, 0.03, 0.09, 0.02, 2), MAT.butter);
        dash.position.set(ave.x + dx, 0.125, ave.z);
        dash.receiveShadow = true;
        island.add(dash);
      }
    } else {
      [-ave.w * 0.48, ave.w * 0.48].forEach((cx) => {
        const curb = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.12, ave.d * 0.98, 0.04, 3), MAT.crust);
        curb.position.set(ave.x + cx, 0.11, ave.z);
        curb.receiveShadow = true;
        island.add(curb);
      });
      // Dashed Icing Centerline
      for (let dz = -ave.d * 0.42; dz <= ave.d * 0.42; dz += 1.8) {
        const dash = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.03, 0.72, 0.02, 2), MAT.butter);
        dash.position.set(ave.x, 0.125, ave.z + dz);
        dash.receiveShadow = true;
        island.add(dash);
      }
    }
  });

  // Matcha-Sponge & Biscuit Low Hedges framing the Inner Boulevard Avenues
  buildPretzelHedge(island, -3.6, -4.15, 3.4, 0);
  buildPretzelHedge(island, 3.6, -4.15, 3.4, 0);
  buildPretzelHedge(island, -3.6, 4.15, 3.4, 0);
  buildPretzelHedge(island, 3.6, 4.15, 3.4, 0);

  // Warm Melted Chocolate Canal Moat around the Central Plaza
  const chocoMoat = new THREE.Mesh(new THREE.CylinderGeometry(6.65, 6.85, 0.28, 64), MAT.choco);
  chocoMoat.position.y = -0.08;
  chocoMoat.receiveShadow = true;
  island.add(chocoMoat);

  // 4 Arched Biscuit-and-Rolling-Pin Bridges crossing the Chocolate Moat (North, South, East, West)
  [
    { x: 0, z: -5.8, rot: 0, w: 1.9, l: 2.1 },
    { x: 0, z: 5.8, rot: 0, w: 1.9, l: 2.1 },
    { x: -6.4, z: 0, rot: Math.PI / 2, w: 1.9, l: 2.6 },
    { x: 6.4, z: 0, rot: Math.PI / 2, w: 1.9, l: 2.6 }
  ].forEach((b) => {
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(b.x, 0.06, b.z);
    bridgeGroup.rotation.y = b.rot;

    const deck = new THREE.Mesh(new RoundedBoxGeometry(b.w, 0.26, b.l, 0.1, 4), MAT.mie);
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    [-b.w * 0.44, b.w * 0.44].forEach((rx) => {
      const rail = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.22, b.l * 0.88, 0.05, 3), MAT.crust);
      rail.position.set(rx, 0.2, 0);
      rail.castShadow = true;
      bridgeGroup.add(rail);
    });

    island.add(bridgeGroup);
  });

  // Central Grand Plaza Tiered Cake-Stand
  const plazaBase = new THREE.Mesh(new THREE.CylinderGeometry(5.65, 5.95, 0.48, 64), MAT.crust);
  plazaBase.position.y = 0.02;
  plazaBase.receiveShadow = true;
  island.add(plazaBase);

  const plazaTop = new THREE.Mesh(new THREE.CylinderGeometry(5.25, 5.4, 0.16, 64), MAT.wafflePlaza);
  plazaTop.position.y = 0.24;
  plazaTop.receiveShadow = true;
  island.add(plazaTop);

  const goldTrim = new THREE.Mesh(new THREE.TorusGeometry(5.32, 0.06, 12, 64), MAT.gold);
  goldTrim.rotation.x = Math.PI / 2;
  goldTrim.position.y = 0.32;
  island.add(goldTrim);

  // 6 Teaspoon & Honey-Jar Streetlamps around the Central Plaza
  [
    [-4.3, -2.5], [4.3, -2.5],
    [-4.3, 2.5], [4.3, 2.5],
    [0, -4.6], [0, 4.6]
  ].forEach(([lx, lz]) => buildStreetLamp(island, lx, lz));

  // Royal Centerpiece Pedestal for the Giant Red Joystick Toaster GLB Monument
  const centerpiecePedestal = new THREE.Group();
  centerpiecePedestal.position.set(0, 0.32, -0.35);

  const pedBase = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.55, 0.22, 48), MAT.crustDark);
  pedBase.position.y = 0.11;
  pedBase.castShadow = true;
  pedBase.receiveShadow = true;
  centerpiecePedestal.add(pedBase);

  const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(2.12, 2.22, 0.12, 48), MAT.mie);
  pedTop.position.y = 0.24;
  pedTop.receiveShadow = true;
  centerpiecePedestal.add(pedTop);

  const pedBrassRing = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.055, 12, 48), MAT.gold);
  pedBrassRing.rotation.x = Math.PI / 2;
  pedBrassRing.position.y = 0.28;
  centerpiecePedestal.add(pedBrassRing);

  // Front Gingham Welcome Carpet leading down from the Giant Arcade Toaster
  const centerCarpet = new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.08, 1.05, 0.04, 3), MAT.gingham);
  centerCarpet.position.set(0, 0.28, 1.85);
  centerCarpet.receiveShadow = true;
  centerpiecePedestal.add(centerCarpet);

  island.add(centerpiecePedestal);

  // Central Plaza GLB Landmarks (Golden Bloom Monument + Welcoming Sentries + Café Gazebo + NPC Bot)
  const plazaLandmarks = new THREE.Group();
  plazaLandmarks.name = 'plazaLandmarks';
  island.add(plazaLandmarks);

  // Distant Off-Map Scenic Fairground (Tournament Cake Stage, Donut Bumper Arena & Salutes)
  const scenicFairground = new THREE.Group();
  scenicFairground.name = 'scenicFairground';
  island.add(scenicFairground);

  // Build Off-Map Toy-Bakery Spectator Tribunes ("Hors Map" Crowd Stands around Bwedville!)
  buildSpectatorTribunes(island);

  boardGroup.add(island);
}

// Build Toy-Bakery Spectator Bleachers & VIP Fan Pods around the outside of the Bwedville Island
function buildSpectatorTribunes(parent) {
  const makeBleacher = (x, z, width, rotY) => {
    const g = new THREE.Group();
    g.position.set(x, -0.22, z);
    g.rotation.y = rotY;

    // Lower Biscuit Step + Gingham Runner
    const step1 = new THREE.Mesh(new RoundedBoxGeometry(width, 0.56, 1.85, 0.16, 4), MAT.crustDark);
    step1.position.set(0, 0.28, 0);
    step1.castShadow = true;
    step1.receiveShadow = true;
    g.add(step1);

    const cushion1 = new THREE.Mesh(new RoundedBoxGeometry(width - 0.24, 0.1, 1.65, 0.06, 3), MAT.mie);
    cushion1.position.set(0, 0.58, 0);
    cushion1.receiveShadow = true;
    g.add(cushion1);

    // Upper Tiered Tribune Step (so spectators stand high enough to see over buildings!)
    const step2 = new THREE.Mesh(new RoundedBoxGeometry(width - 0.3, 0.52, 1.15, 0.14, 4), MAT.crust);
    step2.position.set(0, 0.84, -0.32);
    step2.castShadow = true;
    step2.receiveShadow = true;
    g.add(step2);

    const ginghamBanner = new THREE.Mesh(new RoundedBoxGeometry(width - 0.48, 0.1, 0.98, 0.05, 3), MAT.gingham);
    ginghamBanner.position.set(0, 1.12, -0.32);
    ginghamBanner.receiveShadow = true;
    g.add(ginghamBanner);

    // Front Brass Guardrail + Golden Finial Posts
    const rail = new THREE.Mesh(new RoundedBoxGeometry(width - 0.4, 0.06, 0.06, 0.02, 2), MAT.gold);
    rail.position.set(0, 0.82, 0.68);
    g.add(rail);

    [-width * 0.44, 0, width * 0.44].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.28, 10), MAT.gold);
      post.position.set(px, 0.68, 0.68);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), MAT.gold);
      ball.position.set(px, 0.84, 0.68);
      g.add(post, ball);
    });

    parent.add(g);
  };

  // North Grand Tribune (behind the North avenue, facing South toward the board)
  makeBleacher(0, -11.35, 12.6, 0);
  // West Tribune (outside West avenue, facing East toward the board)
  makeBleacher(-14.25, 0, 9.6, Math.PI / 2);
  // East Tribune (outside East avenue, facing West toward the board)
  makeBleacher(14.25, 0, 9.6, -Math.PI / 2);

  // 2 South-Corner VIP Fan Pods (South-West & South-East, keeping center-south open for the camera)
  [
    [-11.4, 10.35],
    [11.4, 10.35]
  ].forEach(([cx, cz]) => {
    const pod = new THREE.Group();
    pod.position.set(cx, -0.22, cz);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.85, 0.56, 28), MAT.crustDark);
    base.position.y = 0.28;
    base.castShadow = true;
    base.receiveShadow = true;
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.56, 0.12, 28), MAT.gingham);
    top.position.y = 0.58;
    top.receiveShadow = true;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.05, 10, 28), MAT.gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.62;
    pod.add(base, top, ring);
    parent.add(pod);
  });
}

function SphereOrBox(r) {
  return new THREE.SphereGeometry(r, 12, 10);
}

const pawnGlbCache = new Map();

// Lightweight procedural vinyl bakery spectators (0 network latency, 0 CPU spikes!)
function loadDioramaNPCs() {
  state.npcGroups.forEach((npc) => boardGroup.remove(npc));
  state.npcGroups = [];

  const activeIds = new Set(players.map((p) => p.id));
  const bench = pawnCatalog.filter((p) => !activeIds.has(p.id));
  const crowdRoster = bench.length > 0 ? bench : pawnCatalog;

  // Spectator Spots on distant bleachers (North Grandstand, West & East Tribunes)
  const spots = [
    // North Grandstand (elevated at y=0.95, facing South toward board)
    { pos: new THREE.Vector3(-4.8, 0.95, -11.65), rotY: 0.08, scale: 0.72 },
    { pos: new THREE.Vector3(-2.4, 0.95, -11.65), rotY: 0.04, scale: 0.72 },
    { pos: new THREE.Vector3(0.0, 0.95, -11.65), rotY: 0.0, scale: 0.75 },
    { pos: new THREE.Vector3(2.4, 0.95, -11.65), rotY: -0.04, scale: 0.72 },
    { pos: new THREE.Vector3(4.8, 0.95, -11.65), rotY: -0.08, scale: 0.72 },
    // West Tribune (elevated at y=0.95, facing East toward board)
    { pos: new THREE.Vector3(-14.55, 0.95, -3.3), rotY: Math.PI / 2 - 0.12, scale: 0.72 },
    { pos: new THREE.Vector3(-14.55, 0.95, -1.1), rotY: Math.PI / 2 - 0.04, scale: 0.72 },
    { pos: new THREE.Vector3(-14.55, 0.95, 1.1), rotY: Math.PI / 2 + 0.04, scale: 0.72 },
    { pos: new THREE.Vector3(-14.55, 0.95, 3.3), rotY: Math.PI / 2 + 0.12, scale: 0.72 },
    // East Tribune (elevated at y=0.95, facing West toward board)
    { pos: new THREE.Vector3(14.55, 0.95, -3.3), rotY: -Math.PI / 2 + 0.12, scale: 0.72 },
    { pos: new THREE.Vector3(14.55, 0.95, -1.1), rotY: -Math.PI / 2 + 0.04, scale: 0.72 },
    { pos: new THREE.Vector3(14.55, 0.95, 1.1), rotY: -Math.PI / 2 - 0.04, scale: 0.72 },
    { pos: new THREE.Vector3(14.55, 0.95, 3.3), rotY: -Math.PI / 2 - 0.12, scale: 0.72 },
    // Corner VIP Fan Pods
    { pos: new THREE.Vector3(-11.4, 0.42, 10.35), rotY: Math.PI * 0.72, scale: 0.75 },
    { pos: new THREE.Vector3(11.4, 0.42, 10.35), rotY: -Math.PI * 0.72, scale: 0.75 }
  ];

  const loader = new GLTFLoader();

  spots.forEach((spot, idx) => {
    const pick = crowdRoster[idx % crowdRoster.length];
    if (!pick) return;

    const wrapper = new THREE.Group();
    wrapper.position.copy(spot.pos);
    wrapper.rotation.y = spot.rotY;
    wrapper.scale.setScalar(spot.scale || 0.72);
    wrapper.userData = {
      isNPC: true,
      pawnMeta: pick,
      baseY: spot.pos.y,
      baseRotY: spot.rotY,
      phase: idx * 0.85
    };

    const attach3DModel = (scene) => {
      const clone = scene.clone(true);
      normalizeModel(clone);
      // Disable shadows on spectators completely for silky 60fps & 0 heat
      clone.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = false;
          node.receiveShadow = false;
          if (node.material) {
            node.material.envMapIntensity = 1.0;
          }
        }
      });
      wrapper.add(clone);
    };

    if (pawnGlbCache.has(pick.model)) {
      attach3DModel(pawnGlbCache.get(pick.model));
    } else {
      loader.load(`${ASSET_ROOT}${pick.model}`, (gltf) => {
        pawnGlbCache.set(pick.model, gltf.scene);
        attach3DModel(gltf.scene);
      }, undefined, () => {
        // Fallback procedural stand if model fails
        const standDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.06, 16), MAT.gold);
        wrapper.add(standDisc);
      });
    }

    boardGroup.add(wrapper);
    state.npcGroups.push(wrapper);
  });
}

// ============================================================================
// LOAD REAL 3D .GLB BUILDINGS ACROSS ALL 26 TOWN LOTS
// ============================================================================
const buildingGlbCache = new Map();

function normalizeBuildingModel(root, targetHeight = 3.05) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.setScalar(scale);
  root.position.set(
    -center.x * scale,
    -box.min.y * scale,
    -center.z * scale
  );
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
      if (node.material) {
        node.material.envMapIntensity = 1.15;
      }
    }
  });
}

function loadBoardBuildingsGLB() {
  const loader = new GLTFLoader();
  const uniqueFiles = new Set();
  state.buildings.forEach((b) => {
    if (b.meta?.glbFile) uniqueFiles.add(b.meta.glbFile);
  });
  // Ensure landmark, atmospheric and scenic fairground models are loaded
  uniqueFiles.add('monument-golden-bloom.glb');
  uniqueFiles.add('teacup-gazebo-park.glb');
  uniqueFiles.add('npc-shopkeeper-toaster-bot.glb');
  uniqueFiles.add('arcade-podium-tiered-cake.glb');
  uniqueFiles.add('ride-bumper-cars-donut.glb');
  uniqueFiles.add('board-cannon-sugar-blast.glb');
  uniqueFiles.add('prop-golden-croissant.glb');

  const plazaLandmarks = boardGroup.getObjectByName('plazaLandmarks');
  const scenicFairground = boardGroup.getObjectByName('scenicFairground');

  const fileList = Array.from(uniqueFiles);
  let queueIndex = 0;

  function loadNextBuilding() {
    if (queueIndex >= fileList.length) return;
    const file = fileList[queueIndex++];
    loader.load(
      `${BUILDING_ASSET_ROOT}${file}`,
      (gltf) => {
        buildingGlbCache.set(file, gltf.scene);

        // 1. Populate real boulevard building lots
        state.buildings.forEach((b) => {
          if (b.meta?.glbFile !== file || !b.hullGroup) return;
          while (b.hullGroup.children.length > 0) {
            b.hullGroup.remove(b.hullGroup.children[0]);
          }
          const clone = gltf.scene.clone(true);
          normalizeBuildingModel(clone, b.meta.targetHeight || 3.05);
          b.hullGroup.add(clone);
        });

        // 2. Central Plaza: Elegant, serene, uncluttered diorama town square
        if (plazaLandmarks && file === 'monument-golden-bloom.glb') {
          // Central Grand Monument on royal round pedestal
          const centerMonument = new THREE.Group();
          centerMonument.position.set(0, 0.62, -0.35);
          const clone = gltf.scene.clone(true);
          normalizeBuildingModel(clone, 2.65);
          centerMonument.add(clone);
          plazaLandmarks.add(centerMonument);
        } else if (plazaLandmarks && file === 'teacup-gazebo-park.glb') {
          // East Plaza Park Café Gazebo
          const gazebo = new THREE.Group();
          gazebo.position.set(3.1, 0.32, -0.35);
          gazebo.rotation.y = -0.45;
          const clone = gltf.scene.clone(true);
          normalizeBuildingModel(clone, 1.75);
          gazebo.add(clone);
          plazaLandmarks.add(gazebo);
        } else if (plazaLandmarks && file === 'npc-shopkeeper-toaster-bot.glb') {
          // West Plaza Courtyard NPC Shopkeeper
          const botGroup = new THREE.Group();
          botGroup.position.set(-3.1, 0.32, -0.35);
          botGroup.rotation.y = 0.45;
          const clone = gltf.scene.clone(true);
          normalizeBuildingModel(clone, 1.35);
          botGroup.add(clone);
          botGroup.userData = { baseY: 0.32, phase: 1.8 };
          state.npcGroups.push(botGroup);
          plazaLandmarks.add(botGroup);
        }

        // 3. Scenic Off-Map Fairground (North of the Boulevard, behind bleachers)
        if (scenicFairground && file === 'arcade-podium-tiered-cake.glb') {
          // Championship celebration podium in fairground center
          const podium = new THREE.Group();
          podium.position.set(0, -0.05, -11.2);
          const clone = gltf.scene.clone(true);
          normalizeBuildingModel(clone, 2.25);
          podium.add(clone);
          scenicFairground.add(podium);
        } else if (scenicFairground && file === 'prop-golden-croissant.glb') {
          // Floating golden trophy crowning the distant tournament stage
          const trophy = new THREE.Group();
          trophy.position.set(0, 2.45, -11.2);
          const clone = gltf.scene.clone(true);
          normalizeBuildingModel(clone, 1.35);
          trophy.add(clone);
          trophy.userData = { animType: 'floatSpin', baseY: 2.45, phase: 0 };
          animatedProps.push(trophy);
          scenicFairground.add(trophy);
        } else if (scenicFairground && file === 'ride-bumper-cars-donut.glb') {
          // Donut Bumper Cars Arena in West fairground
          const ride = new THREE.Group();
          ride.position.set(-7.5, -0.05, -10.0);
          ride.rotation.y = 0.25;
          const clone = gltf.scene.clone(true);
          normalizeBuildingModel(clone, 1.95);
          ride.add(clone);
          scenicFairground.add(ride);
        } else if (scenicFairground && file === 'board-cannon-sugar-blast.glb') {
          // Sugar blast salute cannons in East fairground
          [-1, 1].forEach((dir) => {
            const cannon = new THREE.Group();
            cannon.position.set(7.2 + dir * 1.4, -0.05, -10.0);
            cannon.rotation.y = -0.35;
            const clone = gltf.scene.clone(true);
            normalizeBuildingModel(clone, 1.35);
            cannon.add(clone);
            scenicFairground.add(cannon);
          });
        }
        setTimeout(loadNextBuilding, 30);
      },
      undefined,
      () => {
        // Keep procedural fallback if optional GLB is not present yet
        setTimeout(loadNextBuilding, 30);
      }
    );
  }

  loadNextBuilding();
}

// ============================================================================
// OVERHEAD 3D BWED PARTY DICE BLOCK + GIANT MARIO-PARTY NUMBER CREST
// ============================================================================
let diceCubeHolder = null;
let diceBadgeSprite = null;
let diceBadgeDrawFn = null;

function createDiceFaceTexture(faceNum) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const pipLayouts = {
    1: [[256, 256]],
    2: [[140, 140], [372, 372]],
    3: [[136, 136], [256, 256], [376, 376]],
    4: [[140, 140], [372, 140], [140, 372], [372, 372]],
    5: [[136, 136], [376, 136], [256, 256], [136, 376], [376, 376]],
    6: [[140, 128], [372, 128], [140, 256], [372, 256], [140, 384], [372, 384]]
  };

  const draw = () => {
    // Toasted Brioche Outer Crust
    ctx.fillStyle = '#b86f39';
    ctx.fillRect(0, 0, 512, 512);

    // Golden Brass Frame
    ctx.fillStyle = '#ffd15a';
    ctx.beginPath();
    ctx.roundRect(22, 22, 468, 468, 64);
    ctx.fill();

    // Soft Cream Brioche Inner Face
    ctx.fillStyle = '#fff5df';
    ctx.beginPath();
    ctx.roundRect(44, 44, 424, 424, 52);
    ctx.fill();

    // Subtle Chocolate Pips in background
    const pips = pipLayouts[faceNum] || pipLayouts[1];
    pips.forEach(([px, py]) => {
      ctx.fillStyle = 'rgba(75, 36, 22, 0.22)';
      ctx.beginPath();
      ctx.arc(px, py, 32, 0, Math.PI * 2);
      ctx.fill();
    });

    // Huge Bold Numeral on the 3D Face
    ctx.font = '700 260px "Fredoka", "Nunito", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2c150d';
    ctx.lineWidth = 28;
    ctx.strokeText(String(faceNum), 256, 272);
    ctx.fillStyle = faceNum === 6 ? '#ffbe0b' : '#e0533c';
    ctx.fillText(String(faceNum), 256, 272);

    tex.needsUpdate = true;
  };

  draw();
  medallionRedrawCallbacks.push(draw);
  return tex;
}

function updateOverheadDiceBadge(numText, subText = 'ROLLING...', mode = 'roll') {
  if (diceBadgeDrawFn) {
    diceBadgeDrawFn(String(numText), subText, mode);
  }
}

function buildOverheadDiceGroup() {
  const group = new THREE.Group();

  // 1. 3D Rotating Dice Cube Holder (procedural Brioche & Brass cube, auto-replaced if bwed-dice.glb exists!)
  diceCubeHolder = new THREE.Group();
  const faceMats = [1, 2, 3, 4, 5, 6].map((n) => new THREE.MeshStandardMaterial({
    map: createDiceFaceTexture(n),
    roughness: 0.26,
    metalness: 0.12,
    emissive: 0xffb703,
    emissiveIntensity: 0.14
  }));

  const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), faceMats);
  cubeMesh.castShadow = true;
  diceCubeHolder.add(cubeMesh);

  // 8 Golden Brass Corner Bumpers on the Dice Block
  [-0.36, 0.36].forEach((cx) => {
    [-0.36, 0.36].forEach((cy) => {
      [-0.36, 0.36].forEach((cz) => {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), MAT.gold);
        cap.position.set(cx, cy, cz);
        diceCubeHolder.add(cap);
      });
    });
  });

  // Glowing Golden Halo around the Dice
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.045, 10, 28),
    new THREE.MeshBasicMaterial({ color: 0xffe46b, transparent: true, opacity: 0.85 })
  );
  diceCubeHolder.add(halo);
  group.add(diceCubeHolder);

  // Auto-load custom `./assets/buildings/bwed-dice.glb` if the user drops it in!
  const loader = new GLTFLoader();
  loader.load(
    `${BUILDING_ASSET_ROOT}bwed-dice.glb`,
    (gltf) => {
      while (diceCubeHolder.children.length > 0) {
        diceCubeHolder.remove(diceCubeHolder.children[0]);
      }
      const customDice = gltf.scene;
      normalizeBuildingModel(customDice, 0.92);
      // Center vertically around (0,0,0) for clean 3D tumbling
      const box = new THREE.Box3().setFromObject(customDice);
      const center = box.getCenter(new THREE.Vector3());
      customDice.position.sub(center);
      diceCubeHolder.add(customDice, halo);
    },
    undefined,
    () => {
      // Uses the Brioche & Brass 3D Dice Block until bwed-dice.glb is added
    }
  );

  // 2. High-Visibility Overhead Number Crest Sprite (Hovering gracefully above the dice)
  const badgeCanvas = document.createElement('canvas');
  badgeCanvas.width = 512;
  badgeCanvas.height = 512;
  const bctx = badgeCanvas.getContext('2d');
  const badgeTex = new THREE.CanvasTexture(badgeCanvas);
  badgeTex.colorSpace = THREE.SRGBColorSpace;
  badgeTex.anisotropy = 4;

  diceBadgeDrawFn = (numStr, subStr, mode) => {
    bctx.clearRect(0, 0, 512, 512);
    const cx = 256;
    const cy = 228;

    // Outer Golden Glow Halo
    const glow = bctx.createRadialGradient(cx, cy, 40, cx, cy, 225);
    glow.addColorStop(0, mode === 'final' ? 'rgba(255, 214, 10, 0.95)' : 'rgba(255, 183, 3, 0.65)');
    glow.addColorStop(1, 'rgba(255, 183, 3, 0)');
    bctx.fillStyle = glow;
    bctx.beginPath();
    bctx.arc(cx, cy, 225, 0, Math.PI * 2);
    bctx.fill();

    // Royal Cocoa & Gold Shield Medallion
    bctx.fillStyle = '#24110b';
    bctx.beginPath();
    bctx.arc(cx, cy, 152, 0, Math.PI * 2);
    bctx.fill();

    bctx.lineWidth = 14;
    bctx.strokeStyle = mode === 'step' ? '#5bc0be' : '#ffd15a';
    bctx.stroke();

    bctx.lineWidth = 6;
    bctx.strokeStyle = '#fff7ea';
    bctx.beginPath();
    bctx.arc(cx, cy, 134, 0, Math.PI * 2);
    bctx.stroke();

    // Number in the Center
    bctx.font = '700 205px "Fredoka", "Nunito", sans-serif';
    bctx.textAlign = 'center';
    bctx.textBaseline = 'middle';
    bctx.lineJoin = 'round';
    bctx.strokeStyle = '#140805';
    bctx.lineWidth = 26;
    bctx.strokeText(numStr, cx, cy + 8);

    const numGrad = bctx.createLinearGradient(cx, cy - 90, cx, cy + 90);
    if (mode === 'step') {
      numGrad.addColorStop(0, '#ffffff');
      numGrad.addColorStop(1, '#72efdd');
    } else {
      numGrad.addColorStop(0, '#fff9db');
      numGrad.addColorStop(0.5, '#ffd15a');
      numGrad.addColorStop(1, '#ff9f1c');
    }
    bctx.fillStyle = numGrad;
    bctx.fillText(numStr, cx, cy + 8);

    // Bottom Ribbon Tag
    if (subStr) {
      bctx.fillStyle = '#24110b';
      bctx.beginPath();
      bctx.roundRect(cx - 155, 366, 310, 74, 37);
      bctx.fill();
      bctx.lineWidth = 7;
      bctx.strokeStyle = mode === 'step' ? '#5bc0be' : '#ffd15a';
      bctx.stroke();

      bctx.font = '700 38px "Fredoka", "Nunito", sans-serif';
      bctx.fillStyle = '#fff7ea';
      bctx.fillText(subStr, cx, 404);
    }

    badgeTex.needsUpdate = true;
  };

  diceBadgeDrawFn('6', 'BWED DICE', 'roll');

  const badgeMat = new THREE.SpriteMaterial({
    map: badgeTex,
    transparent: true,
    depthTest: false,
    depthWrite: false
  });
  diceBadgeSprite = new THREE.Sprite(badgeMat);
  diceBadgeSprite.scale.set(1.65, 1.65, 1);
  diceBadgeSprite.position.set(0, 1.15, 0);
  diceBadgeSprite.renderOrder = 999;
  group.add(diceBadgeSprite);

  return group;
}

function buildBoard() {
  state.paths = makePath();
  state.paths.forEach(makeTile);
  buildCenterpieceIsland();
  loadBoardBuildingsGLB();

  // Golden Crumb Jackpot Trophy + Beacon Beam on the Sidewalk
  goldenCrumb = new THREE.Group();
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.2, 20), MAT.gold);
  pedestal.position.y = -0.32;
  const crumbGlow = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.36, 1),
    new THREE.MeshStandardMaterial({ color: 0xffe46b, emissive: 0xffa52f, emissiveIntensity: 1.15, roughness: 0.18, metalness: 0.65 })
  );
  crumbGlow.castShadow = true;
  const crumbHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.055, 10, 32),
    new THREE.MeshBasicMaterial({ color: 0xffd15a, transparent: true, opacity: 0.9 })
  );
  crumbHalo.rotation.x = Math.PI / 2;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.42, 3.4, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffe46b, transparent: true, opacity: 0.15, side: THREE.DoubleSide, depthWrite: false })
  );
  beam.position.y = 1.15;

  const starLabel = addTextSprite('★ GOLDEN LOAF', '#1f100b', 1.05, 25, '#ffe46b');
  starLabel.position.y = 0.85;

  goldenCrumb.add(pedestal, crumbGlow, crumbHalo, beam, starLabel);
  goldenCrumb.userData = { baseY: 1.02, phase: 1.2 };
  boardGroup.add(goldenCrumb);

  // Active Turn Spotlight Ring under current pawn
  activeTurnRing = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.68, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe46b, side: THREE.DoubleSide, transparent: true, opacity: 0.92 })
  );
  activeTurnRing.rotation.x = -Math.PI / 2;
  activeTurnRing.position.y = 0.44;
  boardGroup.add(activeTurnRing);

  // Hover Space Highlight Ring when inspecting a building
  hoverTileRing = new THREE.Mesh(
    new THREE.RingGeometry(0.84, 1.02, 32),
    new THREE.MeshBasicMaterial({ color: 0x5bc0be, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
  );
  hoverTileRing.rotation.x = -Math.PI / 2;
  hoverTileRing.position.y = 0.43;
  hoverTileRing.visible = false;
  boardGroup.add(hoverTileRing);

  // 3D Rolling Bwed Party Dice Block + Giant Overhead Number Crest
  diceMesh3D = buildOverheadDiceGroup();
  diceMesh3D.visible = false;
  boardGroup.add(diceMesh3D);

  // Ambient Bakery Dust / Floating Golden Crumb Particles
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 32;
    positions[i * 3 + 1] = 0.5 + Math.random() * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 24;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffe46b, size: 0.16, transparent: true, opacity: 0.65 });
  ambientParticles = new THREE.Points(pGeo, pMat);
  scene.add(ambientParticles);

  moveGoldenCrumb(state.goldCrumbIndex);
}

// Spawn 3D burst of coins/stars when a tile event happens!
function spawnBurstParticles(worldPos, colorHex = 0xffe46b, count = 14) {
  state.crowdCheerUntil = performance.now() + 1850;
  if (settings.reducedMotion) return;
  for (let i = 0; i < count; i += 1) {
    const p = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      new THREE.MeshBasicMaterial({ color: colorHex })
    );
    p.position.copy(worldPos).add(new THREE.Vector3(0, 0.9, 0));
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 1.8 + Math.random() * 2.4;
    p.userData = {
      vx: Math.cos(angle) * speed,
      vy: 3.2 + Math.random() * 2.5,
      vz: Math.sin(angle) * speed,
      born: performance.now()
    };
    fxGroup.add(p);
    burstParticles.push(p);
  }
}

function makeBreadLoaf(position, scale = 1, rotY = 0) {
  const loaf = new THREE.Group();
  loaf.position.copy(position);
  loaf.rotation.y = rotY;
  loaf.scale.setScalar(scale);
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), MAT.crust);
  body.scale.set(1.35, 0.55, 0.72);
  body.castShadow = true;
  loaf.add(body);
  [-0.42, 0, 0.42].forEach((x) => {
    const score = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.035, 0.42), MAT.mie);
    score.position.set(x, 0.48, 0);
    score.rotation.z = -0.34;
    loaf.add(score);
  });
  sceneDecor.add(loaf);
}

function makeJamJar(position, color = 0xd62828) {
  const jar = new THREE.Group();
  jar.position.copy(position);
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.58, 0.58, 1.25, 20),
    new THREE.MeshStandardMaterial({ color, roughness: 0.18, metalness: 0.15 })
  );
  glass.position.y = 0.62;
  glass.castShadow = true;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.24, 20), MAT.gold);
  lid.position.y = 1.28;
  jar.add(glass, lid);
  sceneDecor.add(jar);
}

function makeBakeryDecor() {
  // Warm Butcher-Block Beechwood Bakery Table under the Bwedville Island
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshStandardMaterial({ color: 0xb88658, map: tableWoodMap, roughness: 0.78 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.44;
  floor.receiveShadow = true;
  sceneDecor.add(floor);

  // Luxury Polished Mahogany Collector Board Tray Rim
  const boardFrame = new THREE.Mesh(
    new RoundedBoxGeometry(26.6, 0.32, 20.2, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x3d1a0e, roughness: 0.42, metalness: 0.08 })
  );
  boardFrame.position.y = -0.34;
  boardFrame.receiveShadow = true;
  sceneDecor.add(boardFrame);

  // 4 Polished Brass Corner Brackets on the Collector Board Tray
  [
    [-13.2, -10.0], [13.2, -10.0],
    [-13.2, 10.0], [13.2, 10.0]
  ].forEach(([cx, cz]) => {
    const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.26, 16), MAT.gold);
    bracket.position.set(cx, -0.28, cz);
    bracket.castShadow = true;
    sceneDecor.add(bracket);
  });

  // Giant Baker's Beechwood Rolling Pin resting beside the board
  const rollingPin = new THREE.Group();
  rollingPin.position.set(16.5, -0.16, 7.5);
  rollingPin.rotation.y = 0.55;
  const pinBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 6.4, 24), MAT.mie);
  pinBarrel.rotation.z = Math.PI / 2;
  pinBarrel.castShadow = true;
  pinBarrel.receiveShadow = true;
  const handleL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.6, 16), MAT.crust);
  handleL.rotation.z = Math.PI / 2;
  handleL.position.x = -4.0;
  const handleR = handleL.clone();
  handleR.position.x = 4.0;
  rollingPin.add(pinBarrel, handleL, handleR);
  sceneDecor.add(rollingPin);

  // Ceramic Baker's Sugar Pot beside the board
  const sugarPot = new THREE.Group();
  sugarPot.position.set(-16.2, -0.12, -7.8);
  const potBody = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 1.2, 24), MAT.stuccoCream);
  potBody.position.y = 0.6;
  potBody.castShadow = true;
  const potLid = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.92, 0.25, 24), MAT.gold);
  potLid.position.y = 1.3;
  const potKnob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), MAT.gold);
  potKnob.position.y = 1.5;
  sugarPot.add(potBody, potLid, potKnob);
  sceneDecor.add(sugarPot);

  // Corner Choux-Pistachio Topiary Trees framing the town blocks
  [
    [-13.0, -9.2, 1.15], [13.0, -9.2, 1.15],
    [-13.0, 9.2, 1.08], [13.0, 9.2, 1.08],
    [-13.6, 0, 0.98], [13.6, 0, 0.98]
  ].forEach(([tx, tz, sc]) => buildTopiaryTree(sceneDecor, tx, tz, sc));

  // Streetlamps at the 4 Outer Town Corners
  [
    [-11.2, -7.8], [11.2, -7.8],
    [-11.2, 7.8], [11.2, 7.8]
  ].forEach(([lx, lz]) => buildStreetLamp(sceneDecor, lx, lz));
}

function normalizeModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const targetHeight = 1.38;
  const scale = targetHeight / Math.max(size.y, 0.001);
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, 0, -center.z * scale);
  root.userData.groundOffset = Math.max(0, -box.min.y * scale);
  root.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
}

function saveSettings() {
  try { localStorage.setItem('crumb-run-settings', JSON.stringify(settings)); } catch (e) { /* Ignore */ }
}

function setPlayerCount(count) {
  const previousPlayers = players.slice();
  players.length = 0;
  for (let index = 0; index < count; index += 1) {
    const previous = previousPlayers[index];
    const pawn = previous
      ? (pawnCatalog.find((item) => item.id === previous.id) || pawnCatalog[index % pawnCatalog.length])
      : pawnCatalog[index % pawnCatalog.length];
    const isBot = previous ? previous.isBot : index > 0;
    players.push(makePlayer(pawn, index, isBot));
  }
  selectedPlayerCount = count;
  state.maxRounds = count >= 5 ? 6 : MAX_ROUNDS;
  activePlayerSlot = Math.min(activePlayerSlot, players.length - 1);
  const label = playerCountButtons.find((button) => Number(button.dataset.playerCount) === count)?.querySelector('span')?.textContent || 'PARTY';
  countSummary.textContent = `${String(count).padStart(2, '0')} PLAYERS / ${label}`;
  playerCountButtons.forEach((button) => button.classList.toggle('is-selected', Number(button.dataset.playerCount) === count));
}

function randomizeParty() {
  const shuffled = [...pawnCatalog].sort(() => Math.random() - 0.5);
  players.forEach((player, idx) => {
    const pick = shuffled[idx % shuffled.length];
    Object.assign(player, makePlayer(pick, idx, player.isBot));
  });
  sfx.pop();
  renderPlayerSlots();
  renderPawnCatalog();
  updateSelectionDetails();
}

function setRoundTwist(round = state.round) {
  state.roundTwist = roundTwists[(round - 1) % roundTwists.length];
  roundLabelDetail.textContent = `OF ${String(state.maxRounds).padStart(2, '0')} / ${round === 1 ? 'FIRST LOAF' : `LOAF ${String(round).padStart(2, '0')}`}`;
  if (roundProgressFill) {
    roundProgressFill.style.width = `${Math.min(100, (round / state.maxRounds) * 100)}%`;
  }
  roundTwistElement.textContent = state.roundTwist.name;
  roundTwistDetail.textContent = state.roundTwist.detail;
  if (state.roundTwist.id === 'sugar-rush') {
    players.forEach((player) => { player.rollBonus = Math.max(player.rollBonus, 1); });
  }
}

function showMenuScreen(screenName) {
  menuScreens.forEach((screen) => {
    const active = screen.dataset.screen === screenName;
    screen.hidden = !active;
    screen.classList.toggle('is-active', active);
  });
  if (screenName === 'select') {
    renderPlayerSlots();
    renderPawnCatalog();
    updateSelectionDetails();
    startPreviewLoop();
    requestAnimationFrame(resizePreview);
  } else {
    stopPreviewLoop();
  }
}

// ============================================================================
// CLIENT-SIDE 3D PAWN SNAPSHOT THUMBNAIL CACHE & INSTANT 2.5D VINYL BADGES
// ============================================================================
const pawnThumbnailCache = new Map();
let thumbnailRenderer = null;
let thumbnailScene = null;
let thumbnailCamera = null;
let thumbnailQueueStarted = false;

// Synchronous high-DPI stylized vinyl toy badge generator (0ms latency, zero pop-in!)
function generatePawnAvatarBadge(pawn) {
  const canvas = document.createElement('canvas');
  canvas.width = 160;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  const hex = `#${pawn.color.toString(16).padStart(6, '0')}`;

  ctx.save();
  ctx.beginPath();
  ctx.arc(80, 80, 76, 0, Math.PI * 2);
  ctx.clip();

  // Vibrant radial gradient vignette matching hero signature palette
  const bgGrad = ctx.createRadialGradient(80, 60, 8, 80, 80, 80);
  bgGrad.addColorStop(0, '#fff6e5');
  bgGrad.addColorStop(0.38, hex);
  bgGrad.addColorStop(1, '#1e0c08');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 160, 160);

  // Subtle vinyl record grooves
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 1.5;
  [32, 50, 66].forEach((r) => {
    ctx.beginPath();
    ctx.arc(80, 80, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Glossy reflection arc
  const glossGrad = ctx.createLinearGradient(0, 0, 0, 75);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glossGrad;
  ctx.beginPath();
  ctx.ellipse(80, 34, 58, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chubby 3D Shadowed Character Icon
  ctx.font = '74px "Apple Color Emoji", "Segoe UI Emoji", "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;
  ctx.fillText(pawn.icon, 80, 84);
  ctx.restore();

  // Double golden bezel rim
  ctx.strokeStyle = '#ffd15a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(80, 80, 76, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(44, 23, 17, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(80, 80, 71, 0, Math.PI * 2);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

// Pre-fill cache with authentic 3D transparent studio renders (256x256 collectible figurine photos)
pawnCatalog.forEach((pawn) => {
  pawnThumbnailCache.set(pawn.id, `./assets/pawns/thumbs/${pawn.id}.png`);
});

function initPawnThumbnails() {
  // Pre-rendered 3D Studio PNGs are loaded instantly via browser HTTP cache.
  // Zero CPU/GPU background overhead, 100% photorealistic studio lighting!
}

function updatePawnThumbnailDOM(pawnId, dataUrl) {
  // Update in pawn selection cards
  const card = document.querySelector(`.pawn-card[data-pawn-id="${pawnId}"]`);
  if (card) {
    const img = card.querySelector('img.pawn-card-thumb');
    if (img) img.src = dataUrl;
  }

  // Update in player slot buttons
  players.forEach((player, slotIndex) => {
    if (player.id === pawnId) {
      const slotButton = document.querySelector(`.slot-tab[data-slot="${slotIndex}"]`);
      if (slotButton) {
        const img = slotButton.querySelector('img.slot-avatar-img');
        if (img) img.src = dataUrl;
      }
    }
  });
}

function renderPlayerSlots() {
  playerSlots.innerHTML = players.map((player, index) => {
    const thumb = pawnThumbnailCache.get(player.id) || `./assets/pawns/thumbs/${player.id}.png`;
    const colorHex = `#${player.color.toString(16).padStart(6, '0')}`;
    return `
      <button class="slot-tab ${index === activePlayerSlot ? 'active' : ''}" data-slot="${index}" type="button">
        <span class="slot-number">${String(index + 1).padStart(2, '0')}</span>
        <span class="slot-avatar-badge" style="--player-accent:${colorHex}">
          <img class="slot-avatar-img" src="${thumb}" alt="${player.name}" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'slot-avatar-emoji\\'>${player.badge || 'BWED'}</span>';">
        </span>
        <span class="slot-info">
          <strong>PLAYER ${index + 1}</strong>
          <small>${player.name}</small>
        </span>
        <span class="slot-bot-badge" data-toggle-bot="${index}">${player.isBot ? 'BOT' : 'HUMAN'}</span>
      </button>
    `;
  }).join('');

  playerSlots.querySelectorAll('[data-slot]').forEach((button) => {
    button.addEventListener('click', (event) => {
      const botToggleAttr = event.target.closest('[data-toggle-bot]');
      const slotIndex = Number(button.dataset.slot);
      if (botToggleAttr) {
        event.stopPropagation();
        players[slotIndex].isBot = !players[slotIndex].isBot;
        sfx.pop();
      }
      activePlayerSlot = slotIndex;
      renderPlayerSlots();
      renderPawnCatalog();
      updateSelectionDetails();
    });
  });
}

function renderPawnCatalog() {
  const selectedId = players[activePlayerSlot].id;
  pawnCatalogElement.innerHTML = pawnCatalog.map((pawn, index) => {
    const selectedBy = players.findIndex((player, playerIndex) => playerIndex !== activePlayerSlot && player.id === pawn.id);
    const isSelected = pawn.id === selectedId;
    const thumb = pawnThumbnailCache.get(pawn.id) || `./assets/pawns/thumbs/${pawn.id}.png`;
    const colorHex = `#${pawn.color.toString(16).padStart(6, '0')}`;

    let claimPill = '';
    if (isSelected) {
      claimPill = `<span class="pawn-claim-pill is-active">PLAY P${activePlayerSlot + 1}</span>`;
    } else if (selectedBy !== -1) {
      claimPill = `<span class="pawn-claim-pill is-claimed">P${selectedBy + 1} PICKED</span>`;
    }

    return `
      <button class="pawn-card ${isSelected ? 'selected' : ''} ${selectedBy !== -1 ? 'claimed' : ''}" data-pawn-id="${pawn.id}" type="button">
        <span class="pawn-card-art" style="--pawn-color:${colorHex}">
          <img class="pawn-card-thumb" src="${thumb}" alt="${pawn.name}" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'pawn-card-emoji\\'>${pawn.badge || 'BWED'}</span>';">
          <span class="pawn-card-num">${String(index + 1).padStart(2, '0')}</span>
        </span>
        <span class="pawn-card-body">
          <span class="pawn-card-title-row">
            <strong>${pawn.name}</strong>
            ${claimPill}
          </span>
          <span class="pawn-card-role">${pawn.role}</span>
          <span class="pawn-card-talent-pill"><span class="talent-cue">${pawn.talent.cue}</span></span>
        </span>
      </button>
    `;
  }).join('');

  pawnCatalogElement.querySelectorAll('[data-pawn-id]').forEach((button) => {
    button.addEventListener('mouseenter', () => {
      // Subtle audio feedback when hovering hero collection
      if (settings.sfx > 10) sfx.tick();
    });
    button.addEventListener('click', () => {
      const pawn = pawnCatalog.find((item) => item.id === button.dataset.pawnId);
      if (!pawn) return;
      const keepBot = players[activePlayerSlot].isBot;
      Object.assign(players[activePlayerSlot], makePlayer(pawn, activePlayerSlot, keepBot));
      sfx.pop();
      renderPlayerSlots();
      renderPawnCatalog();
      updateSelectionDetails();
    });
  });
}

function updateSelectionDetails() {
  const player = players[activePlayerSlot];
  selectedPawnRole.textContent = `${player.role} · P${activePlayerSlot + 1}`;
  selectedPawnName.textContent = player.name;
  selectedPawnDescription.textContent = player.description;
  selectedPawnTalent.textContent = player.talent.name;
  selectedPawnTalentDescription.textContent = player.talent.description;
  selectedSlotBotToggle.textContent = player.isBot ? 'CPU BOT' : 'HUMAN';
  const humanCount = players.filter((p) => !p.isBot).length;
  const botCount = players.length - humanCount;
  selectionProgress.textContent = `${humanCount} HUMAN · ${botCount} BOT${botCount === 1 ? '' : 'S'} · 18 HEROES READY`;
  loadPreviewPawn(player);
}

function resizePreview() {
  if (!previewRenderer || !previewCamera) return;
  const width = selectionPreview.clientWidth;
  const height = selectionPreview.clientHeight;
  previewRenderer.setSize(width, height, false);
  previewCamera.aspect = width / Math.max(height, 1);
  previewCamera.updateProjectionMatrix();
}

let previewLoadToken = 0;
function loadPreviewPawn(pawn) {
  if (!previewScene) return;
  const token = ++previewLoadToken;
  if (previewPawn) previewScene.remove(previewPawn);
  previewPawn = null;
  previewTag.textContent = `LOADING ${pawn.name.toUpperCase()}...`;
  const loader = new GLTFLoader();
  loader.load(`${ASSET_ROOT}${pawn.model}`, (gltf) => {
    if (!previewScene || token !== previewLoadToken) return;
    if (previewPawn) previewScene.remove(previewPawn);
    previewPawn = gltf.scene;
    normalizeModel(previewPawn);
    previewPawn.position.y = 0.05 + (previewPawn.userData.groundOffset || 0);
    previewScene.add(previewPawn);
    previewTag.textContent = `${pawn.name.toUpperCase()} · READY`;
  }, undefined, () => {
    if (token === previewLoadToken) previewTag.textContent = '3D PREVIEW UNAVAILABLE';
  });
}

let previewLoopRunning = false;
let previewLoopRaf = null;

function startPreviewLoop() {
  if (previewLoopRunning) return;
  previewLoopRunning = true;
  const loop = () => {
    if (!previewLoopRunning) return;
    previewLoopRaf = requestAnimationFrame(loop);
    if (previewPawn && !settings.reducedMotion) previewPawn.rotation.y += 0.01;
    if (previewRenderer && previewScene && previewCamera) {
      previewRenderer.render(previewScene, previewCamera);
    }
  };
  loop();
}

function stopPreviewLoop() {
  previewLoopRunning = false;
  if (previewLoopRaf) {
    cancelAnimationFrame(previewLoopRaf);
    previewLoopRaf = null;
  }
}

function initSelectionPreview() {
  if (!selectionPreview) return;
  previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
  previewRenderer.shadowMap.enabled = true;
  previewRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  previewRenderer.toneMappingExposure = 1.1;
  selectionPreview.appendChild(previewRenderer.domElement);
  previewScene = new THREE.Scene();
  previewScene.environment = scene.environment;
  previewCamera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  previewCamera.position.set(0, 1.2, 6.0);
  previewCamera.lookAt(0, 0.9, 0);
  previewScene.add(new THREE.HemisphereLight(0xffead0, 0x4a2618, 2.2));
  const previewKey = new THREE.DirectionalLight(0xffd5a6, 3.8);
  previewKey.position.set(-3, 6, 4);
  previewKey.castShadow = true;
  previewKey.shadow.mapSize.set(512, 512);
  previewScene.add(previewKey);
  const previewFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(1.45, 1.6, 0.16, 40),
    MAT.crust
  );
  previewFloor.position.y = -0.08;
  previewScene.add(previewFloor);
  resizePreview();
  window.addEventListener('resize', resizePreview);
  // Do NOT start loop here: only run when selection screen is visible!
}

function openModal(modal) { modal.hidden = false; }
function closeModal(modal) { modal.hidden = true; }

function refreshSettingsUI() {
  const ranges = [['music', 'musicRange', 'musicValue'], ['sfx', 'sfxRange', 'sfxValue'], ['camera', 'cameraRange', 'cameraValue']];
  ranges.forEach(([key, inputId, outputId]) => {
    document.querySelector(`#${inputId}`).value = settings[key];
    document.querySelector(`#${outputId}`).textContent = settings[key];
  });
  document.querySelector('#motionToggle').checked = settings.reducedMotion;
}

let bannerTimer;
function showTurnBanner(text, duration = 1400) {
  if (!turnBanner) return;
  turnBanner.textContent = text;
  turnBanner.classList.add('visible');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => turnBanner.classList.remove('visible'), duration);
}

// Place pawns on the Front Sidewalk Stopping Plaza in front of the space's 3D Building!
function placePawn(pawn, playerIndex, pathIndex = 0, animated = false) {
  const safeIndex = pathIndex % state.paths.length;
  const pathPosition = state.paths[safeIndex];
  const outward = getOutwardDir(pathPosition);
  // Tangent along the sidewalk curb so multiple pawns stand side-by-side in front of the building
  const tangent = new THREE.Vector3(-outward.z, 0, outward.x).normalize();

  const slotSpread = ((playerIndex % 4) - 1.5) * 0.34;
  const rowDepth = playerIndex >= 4 ? -0.28 : 0.08;
  const offset = tangent.clone().multiplyScalar(slotSpread)
    .add(outward.clone().multiplyScalar(-0.18 + rowDepth));

  const destination = pathPosition.clone().add(offset);
  destination.y = 0.42 + (pawn.userData.groundOffset || 0);

  // Face away from the building (toward the street / plaza) like Monopoly tokens in front of a shop
  const targetRotY = Math.atan2(-outward.x, -outward.z);
  pawn.userData.targetRotY = targetRotY;

  if (!animated) {
    pawn.position.copy(destination);
    pawn.rotation.y = targetRotY;
    pawn.userData.restingY = destination.y;
    return;
  }
  pawn.userData.start = pawn.position.clone();
  pawn.userData.destination = destination;
  pawn.userData.restingY = destination.y;
  pawn.userData.moveStart = performance.now();
  pawn.userData.moveDuration = 235;
}

function updateSpaceInspector(tileIndex = null) {
  const idx = tileIndex !== null
    ? tileIndex
    : (players[state.currentPlayer]?.position || 0);
  const meta = getSpaceMeta(idx);
  if (inspectorBadge) inspectorBadge.textContent = `${meta.icon} ${meta.num} · ${meta.type.toUpperCase()}`;
  if (inspectorTitle) inspectorTitle.textContent = meta.name;
  if (inspectorDesc) inspectorDesc.textContent = meta.desc;
}

function clearLoadedPawns() {
  state.pawnGroups.forEach((pawn) => {
    if (pawn) boardGroup.remove(pawn);
  });
  state.pawnGroups = [];
}

function loadPawns() {
  const loader = new GLTFLoader();
  clearLoadedPawns();
  loadDioramaNPCs();
  state.assetLoads = 0;
  state.assetErrors = 0;
  state.pawnsLoaded = false;
  rollButton.disabled = true;
  talentButton.disabled = true;
  rollButtonLabel.textContent = 'PREPARING BWEDVILLE...';

  const finishAssetLoad = () => {
    state.assetLoads += 1;
    if (state.assetLoads !== players.length) return;
    if (state.assetErrors === 0) {
      state.pawnsLoaded = true;
      rollButton.disabled = false;
      talentButton.disabled = false;
      rollButtonLabel.textContent = 'ROLL THE DICE';
      showToast('Welcome to Bwedville 3D Party Town!');
      showTurnBanner(`ROUND 01 · ${players[0].name.toUpperCase()}!`, 1500);
      scheduleBotTurnIfNeeded();
    } else {
      rollButtonLabel.textContent = 'SERVER REQUIRED';
      showToast('Run through http://localhost:4173 to load 3D heroes');
    }
  };

  players.forEach((player, index) => {
    loader.load(`${ASSET_ROOT}${player.model}`, (gltf) => {
      const loaded = gltf.scene;
      normalizeModel(loaded);
      loaded.userData.playerIndex = index;
      loaded.userData.pathIndex = 0;
      boardGroup.add(loaded);
      state.pawnGroups[index] = loaded;
      placePawn(loaded, index, player.position);
      finishAssetLoad();
    }, undefined, () => {
      state.assetErrors += 1;
      log(`<strong>${player.name}</strong> could not enter Bwedville.`);
      finishAssetLoad();
    });
  });
}

function renderTalentControl() {
  const player = players[state.currentPlayer];
  if (!player) return;
  talentLabel.textContent = player.talent.name;
  const armed = player.talentRollBonus || player.talentStepBonus || player.talentReroll || player.talentRiskShield || player.talentCrumbMagnet || player.talentDoubleRoll || player.talentMinSix;
  talentStatus.textContent = player.talentUsed
    ? (armed ? `${player.talent.cue} · ARMED` : 'USED · 1× PER PARTY')
    : `${player.talent.cue} · READY`;
  talentButton.disabled = !state.pawnsLoaded || state.moving || state.gameOver || player.talentUsed || player.isBot;
}

function useTalent(silentForBot = false) {
  const player = players[state.currentPlayer];
  if (!player || state.moving || state.gameOver || !state.pawnsLoaded || player.talentUsed) return;
  player.talentUsed = true;
  sfx.star();
  if (state.pawnGroups[state.currentPlayer]) {
    spawnBurstParticles(state.pawnGroups[state.currentPlayer].position, player.color, 18);
  }

  const t = player.talent.type;
  if (t === 'roll2') player.talentRollBonus = 2;
  else if (t === 'step2') player.talentStepBonus = 2;
  else if (t === 'reroll') { player.talentReroll = true; player.coins += 2; }
  else if (t === 'shield') player.talentRiskShield = true;
  else if (t === 'magnet') { player.coins += 3; player.talentCrumbMagnet = true; }
  else if (t === 'fireboost') { player.talentStepBonus = 3; player.talentRiskShield = true; }
  else if (t === 'coins4') player.coins += 4;
  else if (t === 'tax') {
    let taxed = 0;
    players.forEach((other, idx) => {
      if (idx !== state.currentPlayer && other.coins > 0) {
        other.coins -= 1;
        taxed += 1;
      }
    });
    player.coins += taxed + 1;
  } else if (t === 'double') player.talentDoubleRoll = true;
  else if (t === 'saiyan') { player.talentRollBonus = 2; player.coins += 2; }
  else if (t === 'blink') {
    player.position = (player.position + 4) % state.paths.length;
    if (state.pawnGroups[state.currentPlayer]) placePawn(state.pawnGroups[state.currentPlayer], state.currentPlayer, player.position, true);
  } else if (t === 'whale') player.coins += 5;
  else if (t === 'cheat') player.talentMinSix = true;
  else if (t === 'steal') {
    const rivals = players.filter((_, idx) => idx !== state.currentPlayer).sort((a, b) => b.coins - a.coins);
    if (rivals[0]) {
      const taken = Math.min(2, rivals[0].coins);
      rivals[0].coins -= taken;
      player.coins += taken;
    }
    player.talentStepBonus = 1;
  } else if (t === 'heist') {
    const rivals = players.filter((_, idx) => idx !== state.currentPlayer).sort((a, b) => (b.crumbs * 10 + b.coins) - (a.crumbs * 10 + a.coins));
    if (rivals[0]) {
      const taken = Math.min(3, rivals[0].coins);
      rivals[0].coins -= taken;
      player.coins += taken;
    }
  } else if (t === 'bake') {
    player.crumbs += 1;
    player.coins += 1;
  } else if (t === 'dividend') {
    player.coins += Math.max(4, player.crumbs * 2);
  } else if (t === 'hero') {
    player.talentStepBonus = 3;
    player.talentRiskShield = true;
    player.coins += 2;
  }

  if (!silentForBot) showToast(`${player.talent.name} activated!`);
  log(`<strong>${player.name}</strong> unleashed <em>${player.talent.name}</em>: ${player.talent.description}`);
  renderPlayerList();
}

function updateGoldenDistanceUI() {
  const current = players[state.currentPlayer];
  if (!current || !state.paths.length) return;
  const dist = (state.goldCrumbIndex - current.position + state.paths.length) % state.paths.length;
  goldDistanceChip.textContent = `★ JACKPOT: ${dist === 0 ? 'HERE!' : `${dist} SPACES AHEAD`}`;
}

function updateVaultChip() {
  if (bankVaultChip) {
    bankVaultChip.textContent = `VAULT: ${state.bankVaultJackpot}c`;
  }
}

function getPlayerActiveBuffText(player) {
  if (player.talentDoubleRoll) return '×2 ROLL';
  if (player.talentMinSix) return 'MIN 6 ROLL';
  if (player.talentReroll) return '2× DICE';
  if (player.talentRiskShield) return 'SAFE';
  if (player.talentCrumbMagnet) return 'MAGNET';
  const totalRoll = (player.rollBonus || 0) + (player.talentRollBonus || 0) + (player.talentStepBonus || 0);
  if (totalRoll > 0) return `+${totalRoll} ROLL`;
  return '';
}

function renderPlayerList() {
  // Compute standings ranks
  const rankedIndices = players
    .map((p, idx) => ({ idx, score: p.crumbs * 100 + p.coins }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.idx);

  const rankLabels = ['#1', '#2', '#3', '#4', '#5', '#6'];

  playerList.innerHTML = players.map((player, index) => {
    const rankPos = rankedIndices.indexOf(index);
    const spaceMeta = getSpaceMeta(player.position || 0);
    const buffText = getPlayerActiveBuffText(player);
    const hexColor = `#${player.color.toString(16).padStart(6, '0')}`;
    const thumb = pawnThumbnailCache.get(player.id) || `./assets/pawns/thumbs/${player.id}.png`;
    return `
      <div class="player-row ${index === state.currentPlayer ? 'active' : ''} ${rankPos === 0 ? 'rank-1' : ''}" data-focus-player="${index}" style="--player-color:${hexColor}">
        <span class="player-rank-badge">${rankPos === 0 ? '#1' : rankLabels[rankPos] || `#${rankPos + 1}`}</span>
        <div class="player-avatar-ring">
          <img class="player-avatar-img" src="${thumb}" alt="${player.name}" onerror="this.onerror=null;this.parentElement.innerHTML='<span class=\\'player-avatar-fallback\\'>${player.badge || 'BWED'}</span>';">
        </div>
        <div class="player-info-col">
          <div class="player-name-row">
            <span class="player-name">${player.name}</span>
            <small class="player-tag ${player.isBot ? 'is-bot' : 'is-you'}">${player.isBot ? 'BOT' : 'YOU'}</small>
          </div>
          <div class="player-submeta">
            <span class="player-location-text">${spaceMeta.num} ${spaceMeta.name}</span>
            ${buffText ? `<span class="player-buff-pill">${buffText}</span>` : ''}
          </div>
        </div>
        <div class="player-stats-col">
          <span class="stat-pill stars" title="Golden Loaves"><span class="stat-star-icon">★</span> <b>${player.crumbs}</b></span>
          <span class="stat-pill coins" title="Coins"><span class="stat-coin-badge">c</span> <b>${player.coins}c</b></span>
        </div>
      </div>
    `;
  }).join('');

  playerList.querySelectorAll('[data-focus-player]').forEach((row) => {
    row.addEventListener('click', () => focusPawn(Number(row.dataset.focusPlayer)));
  });

  const current = players[state.currentPlayer];
  const currentMeta = getSpaceMeta(current.position || 0);
  turnLabel.textContent = current.name;
  turnRoleLabel.textContent = current.isBot ? `CPU BOT · PLAYER ${state.currentPlayer + 1}` : `YOUR TURN · PLAYER ${state.currentPlayer + 1}`;
  if (turnLocationLabel) {
    turnLocationLabel.textContent = `${currentMeta.num} ${currentMeta.name}`;
  }
  if (turnOrderPill) {
    turnOrderPill.textContent = `TURN ${state.currentPlayer + 1}/${players.length}`;
  }
  const currentThumb = pawnThumbnailCache.get(current.id) || `./assets/pawns/thumbs/${current.id}.png`;
  turnAvatar.innerHTML = `<img class="turn-avatar-img" src="${currentThumb}" alt="${current.name}" onerror="this.onerror=null;this.parentElement.textContent='${current.badge || 'BWED'}';">`;
  turnAvatar.style.borderColor = `#${current.color.toString(16).padStart(6, '0')}`;
  rollButton.disabled = !state.pawnsLoaded || state.moving || state.gameOver || current.isBot;
  rollButtonLabel.textContent = current.isBot ? `${current.name.toUpperCase()} ROLLING DICE...` : 'ROLL DICE';
  updateGoldenDistanceUI();
  renderTalentControl();
  if (state.hoveredTileIndex === null) {
    updateSpaceInspector(current.position || 0);
  }
}

function log(message) {
  const item = document.createElement('div');
  item.className = 'log-entry';
  item.innerHTML = message;
  eventLog.prepend(item);
  while (eventLog.children.length > 6) eventLog.lastElementChild.remove();
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2300);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function moveGoldenCrumb(nextIndex = null) {
  if (!goldenCrumb || !state.paths.length) return;
  const next = nextIndex === null
    ? (state.goldCrumbIndex + 6 + Math.floor(Math.random() * 7)) % state.paths.length
    : nextIndex % state.paths.length;
  state.goldCrumbIndex = next;
  const target = state.paths[next];
  const outward = getOutwardDir(target);
  // Position Golden Crumb trophy on the street-front side of the sidewalk so it sits cleanly in front of the building
  goldenCrumb.position.set(
    target.x - outward.x * 0.32,
    0.98,
    target.z - outward.z * 0.32
  );
  updateGoldenDistanceUI();
}

// ============================================================================
// FRUIT TART WHEEL OF FORTUNE (ROULETTE PÂTISSIÈRE)
// ============================================================================
const wheelSlices = [
  { badge: 'STAR', label: '+1 GOLDEN LOAF', desc: 'Secret Sourdough Vault jackpot!', color: '#f4bd5f', textColor: '#2a140c', reward: (p) => { p.crumbs += 1; sfx.star(); return '+1 ★ Golden Loaf!'; } },
  { badge: 'WARP', label: '+4 STEPS AHEAD', desc: 'Toaster Catapult rocket launch!', color: '#e76d43', textColor: '#fff', reward: (p) => { p.position = (p.position + 4) % state.paths.length; placePawn(state.pawnGroups[state.currentPlayer], state.currentPlayer, p.position, true); sfx.pop(); return 'Catapulted +4 spaces ahead!'; } },
  { badge: 'COINS', label: '+5 COINS', desc: 'Golden coin windfall!', color: '#ffd15a', textColor: '#2a140c', reward: (p) => { p.coins += 5; sfx.coin(); return '+5 crispy coins!'; } },
  { badge: 'BOOST', label: 'TURBO POWER-UP', desc: 'Free boutique gadget from chef!', color: '#5bc0be', textColor: '#0a3230', reward: (p) => { p.rollBonus += 3; sfx.pop(); return 'Turbo Croissant (+3 next roll)!'; } },
  { badge: 'FEAST', label: 'FEAST +2c ALL', desc: 'All bakers celebrate and get +2c!', color: '#ffbe76', textColor: '#2a140c', reward: (p) => { players.forEach((pl) => { pl.coins += 2; }); sfx.coin(); return 'Bakery Feast: +2 coins for ALL bakers!'; } },
  { badge: 'LUCKY', label: 'LUCKY 6+ ROLL', desc: 'Next dice roll is guaranteed high!', color: '#9a79d6', textColor: '#fff', reward: (p) => { p.talentMinSix = true; sfx.pop(); return 'Guaranteed minimum roll of 6 on next turn!'; } },
  { badge: 'VAULT', label: 'VAULT RAID', desc: 'Steal from the Bwedbank vault!', color: '#2ec4b6', textColor: '#fff', reward: (p) => { const take = Math.max(3, Math.floor(state.bankVaultJackpot * 0.5)); state.bankVaultJackpot = Math.max(0, state.bankVaultJackpot - take); updateVaultChip(); p.coins += take; sfx.coin(); return `Vault Raid: Took ${take} coins from Bwedbank!`; } },
  { badge: 'ARCADE', label: 'BWEDWARE SHOWDOWN', desc: 'Instant BwedWare micro-game!', color: '#ff5400', textColor: '#fff', reward: async () => { await launchMicroGame('FORTUNE WHEEL SHOWDOWN!', false); return 'Arcade Showdown completed!'; } }
];

function openWheelOfFortune(player) {
  return new Promise((resolve) => {
    state.inModal = true;
    wheelModal.hidden = false;
    wheelResultBanner.hidden = true;
    wheelSpinButton.disabled = false;
    wheelSubtitle.textContent = `${player.name} landed on the Mystery Portal! Spin the Fruit Tart Wheel of Fortune!`;

    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) {
      wheelModal.hidden = true;
      state.inModal = false;
      resolve();
      return;
    }
    const ctx = canvas.getContext('2d');
    let currentAngle = 0;
    const numSlices = wheelSlices.length;
    const sliceAngle = (Math.PI * 2) / numSlices;

    function drawWheel(angle) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = cx - 14;

      // Outer fluted golden shortbread tart crust
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = '#b86f39';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffd15a';
      ctx.stroke();

      // Fluted crust bumps
      const numBumps = 32;
      for (let b = 0; b < numBumps; b++) {
        const bA = (b / numBumps) * Math.PI * 2;
        const bx = cx + Math.cos(bA) * (radius + 8);
        const by = cy + Math.sin(bA) * (radius + 8);
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffd15a';
        ctx.fill();
      }

      // Slices
      for (let i = 0; i < numSlices; i++) {
        const slice = wheelSlices[i];
        const startA = angle + i * sliceAngle;
        const endA = startA + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startA, endA);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#fff5df';
        ctx.stroke();

        // Label and badge
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startA + sliceAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = slice.textColor;
        ctx.font = 'bold 12px "Fredoka", sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 3;
        ctx.fillText(`[${slice.badge}] ${slice.label}`, radius - 20, 5);
        ctx.restore();
      }

      // Center golden hub with cream star
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd15a';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#8d5524';
      ctx.stroke();

      ctx.fillStyle = '#2a140c';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'transparent';
      ctx.fillText('★', cx, cy);

      ctx.restore();
    }

    drawWheel(currentAngle);

    let hasSpun = false;
    async function spin() {
      if (hasSpun) return;
      hasSpun = true;
      wheelSpinButton.disabled = true;

      let velocity = 0.42 + Math.random() * 0.28;
      const friction = 0.984;
      sfx.warioIntro();

      while (velocity > 0.0035) {
        currentAngle += velocity;
        velocity *= friction;
        drawWheel(currentAngle);
        sfx.diceTick(1);
        await wait(16);
      }

      const pointerAngle = (1.5 * Math.PI - currentAngle) % (Math.PI * 2);
      const normalizedAngle = (pointerAngle + Math.PI * 2) % (Math.PI * 2);
      const winningIndex = Math.floor(normalizedAngle / sliceAngle) % numSlices;
      const winningSlice = wheelSlices[winningIndex];

      sfx.star();
      const currentPawn = state.pawnGroups[state.currentPlayer];
      if (currentPawn) spawnBurstParticles(currentPawn.position, 0xffe46b, 24);

      wheelResultTitle.textContent = `${winningSlice.label}!`;
      const descResult = await winningSlice.reward(player);
      wheelResultDesc.textContent = descResult;
      wheelResultBanner.hidden = false;
      renderPlayerList();

      await wait(2400);
      wheelModal.hidden = true;
      state.inModal = false;
      resolve();
    }

    wheelSpinButton.onclick = spin;

    if (player.isBot) {
      setTimeout(spin, 700);
    }
  });
}

// ============================================================================
// BAKERY ITEM SHOP
// ============================================================================
function openBakeryShop(player) {
  return new Promise((resolve) => {
    if (player.isBot) {
      const affordable = shopItems.filter((item) => player.coins >= item.cost);
      if (affordable.length > 0 && Math.random() > 0.25) {
        const pick = affordable[affordable.length - 1];
        applyShopItem(player, pick);
      }
      resolve();
      return;
    }
    state.inModal = true;
    shopSubtitle.textContent = `${player.name} has ${player.coins} coins. Pick a fresh power-up or save your coins!`;
    shopGrid.innerHTML = shopItems.map((item) => `
      <button class="shop-item" data-item-id="${item.id}" type="button" ${player.coins < item.cost ? 'disabled' : ''}>
        <div>
          <div class="shop-item-top">
            <span class="shop-item-icon">${item.icon}</span>
            <span class="shop-item-cost">${item.cost} COINS</span>
          </div>
          <strong>${item.name}</strong>
          <p>${item.description}</p>
        </div>
      </button>
    `).join('');

    const cleanup = () => {
      shopModal.hidden = true;
      state.inModal = false;
      resolve();
    };

    shopGrid.querySelectorAll('[data-item-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = shopItems.find((i) => i.id === btn.dataset.itemId);
        if (item && player.coins >= item.cost) {
          applyShopItem(player, item);
          cleanup();
        }
      });
    });

    skipShopButton.onclick = cleanup;
    shopModal.hidden = false;
  });
}

function applyShopItem(player, item) {
  player.coins -= item.cost;
  state.bankVaultJackpot += 1;
  updateVaultChip();
  sfx.coin();
  if (state.pawnGroups[state.currentPlayer]) {
    spawnBurstParticles(state.pawnGroups[state.currentPlayer].position, 0x5bc0be, 14);
  }
  if (item.id === 'double-croissant') {
    player.rollBonus += 3;
    showToast(`${player.name} bought Turbo Croissant (+3 next roll)!`);
    log(`<strong>${player.name}</strong> bought <em>Turbo Croissant</em> (+3 next roll).`);
  } else if (item.id === 'warp-whistle') {
    player.position = (player.position + 5) % state.paths.length;
    if (state.pawnGroups[state.currentPlayer]) {
      placePawn(state.pawnGroups[state.currentPlayer], state.currentPlayer, player.position, true);
    }
    showToast(`${player.name} warped +5 spaces with Toaster Warp!`);
    log(`<strong>${player.name}</strong> used <em>Toaster Warp</em> to jump 5 spaces ahead!`);
  } else if (item.id === 'crumb-vacuum') {
    const rivals = players.filter((p) => p !== player).sort((a, b) => b.coins - a.coins);
    if (rivals[0]) {
      const stolen = Math.min(3, rivals[0].coins);
      rivals[0].coins -= stolen;
      player.coins += stolen;
      showToast(`${player.name} vacuumed ${stolen}c from ${rivals[0].name}!`);
      log(`<strong>${player.name}</strong> vacuumed ${stolen} coins from <strong>${rivals[0].name}</strong>!`);
    }
  } else if (item.id === 'golden-yeast') {
    player.crumbs += 1;
    sfx.star();
    showToast(`${player.name} baked +1 ★ Golden Loaf at the Boutique!`);
    log(`<strong>${player.name}</strong> bought <em>Golden Yeast</em> and gained +1 ★ Loaf!`);
  }
  renderPlayerList();
}

// ============================================================================
// WARIOWARE MICRO-GAME ENGINE ("BWED WARE!")
// ============================================================================
const microGames = [
  { id: 'toast-pop', title: 'TOASTER REFLEX', directive: 'POP IN GREEN!', controls: 'SPACEBAR OR CLICK TO POP THE TOAST', duration: 5.0 },
  { id: 'crumb-catch', title: 'CRUMB FRENZY', directive: 'CATCH CRUMBS!', controls: 'MOVE MOUSE / TOUCH OR ← → ARROWS', duration: 5.5 },
  { id: 'moon-pump', title: 'SOLANA ROCKET', directive: 'MASH SPACE / CLICK!', controls: 'MASH SPACEBAR OR CLICK REPEATEDLY!', duration: 4.8 },
  { id: 'toaster-whack', title: 'WHACK-A-BWED', directive: 'TAP THE BWEDS!', controls: 'CLICK GOLDEN BWEDS · AVOID BOMBS!', duration: 5.5 },
  { id: 'butter-spread', title: 'BUTTER SPREAD', directive: 'BUTTER THE SLICE!', controls: 'SWIPE CURSOR ACROSS THE BREAD SLICE!', duration: 5.0 },
  { id: 'spot-bwed', title: 'BWED DETECTIVE', directive: 'FIND THE TARGET!', controls: 'CLICK THE MATCHING BWED CARD FAST!', duration: 5.0 }
];

let activeMinigameCleanup = null;
let lastMinigameIndex = -1;

function pickNextMicroGame() {
  let idx = Math.floor(Math.random() * microGames.length);
  if (idx === lastMinigameIndex) idx = (idx + 1) % microGames.length;
  lastMinigameIndex = idx;
  return microGames[idx];
}

function launchMicroGame(categoryLabel = 'END OF ROUND SHOWDOWN', arcade = false) {
  return new Promise((resolve) => {
    if (activeMinigameCleanup) activeMinigameCleanup();
    state.inModal = true;
    state.arcadeMode = arcade;
    const gameSpec = pickNextMicroGame();

    minigameCategory.textContent = categoryLabel;
    minigameTitle.textContent = gameSpec.title;
    minigameDirective.textContent = gameSpec.directive;
    minigameControlsHint.textContent = gameSpec.controls;
    minigameLiveScore.textContent = 'SCORE: 0';
    minigameResults.hidden = true;
    closeMinigameButton.hidden = !arcade;
    minigameNextArcadeButton.hidden = !arcade;
    minigameContinueButton.querySelector('span').textContent = arcade ? 'EXIT TO MENU' : 'CONTINUE PARTY';
    minigamePromptBanner.classList.remove('is-hidden');
    minigameModal.hidden = false;
    sfx.warioIntro();

    const ctx = minigameCanvas.getContext('2d');
    const W = minigameCanvas.width;
    const H = minigameCanvas.height;

    let running = true;
    let started = false;
    let humanScore = 0;
    let finishedEarly = false;
    const startTime = performance.now() + 1050;
    const durationMs = gameSpec.duration * 1000;

    const mg = {
      needle: 0.1,
      needleSpeed: 1.75,
      targetMin: 0.42,
      targetMax: 0.66,
      popped: false,
      popY: 0,
      basketX: W / 2,
      falling: [],
      lastSpawn: 0,
      keys: { left: false, right: false },
      pumps: 0,
      stars: Array.from({ length: 24 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 1 + Math.random() * 2 })),
      holes: Array.from({ length: 6 }, (_, i) => ({
        x: 165 + (i % 3) * 215,
        y: 155 + Math.floor(i / 3) * 155,
        state: 'empty',
        until: 0
      })),
      butterGrid: Array.from({ length: 36 }, (_, i) => ({
        x: 215 + (i % 6) * 58,
        y: 82 + Math.floor(i / 6) * 46,
        buttered: false
      })),
      cursorX: W / 2,
      cursorY: H / 2,
      cards: [],
      targetTrait: '',
      roundSolved: 0,
      popups: []
    };

    const addPopup = (x, y, text, color = '#ffe46b') => {
      mg.popups.push({ x, y, text, color, born: performance.now() });
    };

    const spotCardImages = new Map();
    const preloadHeroThumbs = () => {
      pawnCatalog.forEach((p) => {
        const img = new Image();
        img.src = `./assets/pawns/thumbs/${p.id}.png`;
        spotCardImages.set(p.id, img);
      });
    };
    if (gameSpec.id === 'spot-bwed') preloadHeroThumbs();

    const setupSpotCards = () => {
      const shuffled = [...pawnCatalog].sort(() => Math.random() - 0.5);
      const target = shuffled[0];
      const decoys = shuffled.slice(1, 6);
      mg.targetTrait = `FIND THE HERO: ${target.name.toUpperCase()}!`;
      const items = [
        { hero: target, correct: true },
        ...decoys.map((d) => ({ hero: d, correct: false }))
      ].sort(() => Math.random() - 0.5);
      mg.cards = items.map((item, idx) => ({
        ...item,
        x: 105 + (idx % 3) * 200,
        y: 110 + Math.floor(idx / 3) * 145,
        w: 175,
        h: 125
      }));
    };
    if (gameSpec.id === 'spot-bwed') setupSpotCards();

    const getCanvasPos = (e) => {
      const rect = minigameCanvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * W,
        y: ((e.clientY - rect.top) / rect.height) * H
      };
    };

    const handleAction = (pos = null) => {
      if (!running || !started || finishedEarly) return;
      if (gameSpec.id === 'toast-pop' && !mg.popped) {
        mg.popped = true;
        const center = (mg.targetMin + mg.targetMax) / 2;
        const dist = Math.abs(mg.needle - center);
        if (mg.needle >= mg.targetMin && mg.needle <= mg.targetMax) {
          humanScore = Math.round(90 + (1 - dist / 0.14) * 30);
          addPopup(320, 140, 'PERFECT GOLDEN TOAST!', '#a8c779');
          sfx.star();
        } else if (dist < 0.22) {
          humanScore = 55;
          addPopup(320, 140, 'WARM TOAST! +55', '#f4bd5f');
          sfx.coin();
        } else {
          humanScore = 15;
          addPopup(320, 140, 'BURNT CRUST!', '#cf5d4d');
          sfx.burn();
        }
        minigameLiveScore.textContent = `SCORE: ${humanScore}`;
        setTimeout(() => { finishedEarly = true; }, 650);
      } else if (gameSpec.id === 'moon-pump') {
        mg.pumps += 1;
        humanScore = Math.min(130, mg.pumps * 6);
        addPopup(W / 2 + (Math.random() - 0.5) * 90, 220, '+6 UP!', '#a8c779');
        sfx.pop();
        minigameLiveScore.textContent = `SCORE: ${humanScore}`;
        if (humanScore >= 120) {
          sfx.star();
          finishedEarly = true;
        }
      } else if (gameSpec.id === 'toaster-whack' && pos) {
        mg.holes.forEach((h) => {
          if (h.state !== 'empty' && Math.hypot(pos.x - h.x, pos.y - h.y) < 58) {
            if (h.state === 'bwed') {
              humanScore += 22;
              addPopup(h.x, h.y - 25, '+22 CRISPY!', '#ffe46b');
              sfx.coin();
            } else {
              humanScore = Math.max(0, humanScore - 15);
              addPopup(h.x, h.y - 25, '-15 OUCH!', '#cf5d4d');
              sfx.burn();
            }
            h.state = 'empty';
            minigameLiveScore.textContent = `SCORE: ${humanScore}`;
          }
        });
      } else if (gameSpec.id === 'spot-bwed' && pos) {
        mg.cards.forEach((c) => {
          if (pos.x >= c.x && pos.x <= c.x + c.w && pos.y >= c.y && pos.y <= c.y + c.h) {
            if (c.correct) {
              humanScore += 42;
              mg.roundSolved += 1;
              addPopup(c.x + c.w / 2, c.y, '+42 FOUND!', '#a8c779');
              sfx.coin();
              if (mg.roundSolved >= 3) {
                finishedEarly = true;
              } else {
                setupSpotCards();
              }
            } else {
              humanScore = Math.max(0, humanScore - 15);
              addPopup(c.x + c.w / 2, c.y, 'WRONG SLICE!', '#cf5d4d');
              sfx.burn();
            }
            minigameLiveScore.textContent = `SCORE: ${humanScore}`;
          }
        });
      }
    };

    const onPointerDown = (e) => {
      const pos = getCanvasPos(e);
      mg.basketX = pos.x;
      mg.cursorX = pos.x;
      mg.cursorY = pos.y;
      handleAction(pos);
    };

    const onPointerMove = (e) => {
      const pos = getCanvasPos(e);
      mg.basketX = THREE.MathUtils.clamp(pos.x, 60, W - 60);
      mg.cursorX = pos.x;
      mg.cursorY = pos.y;
      if (started && gameSpec.id === 'butter-spread') {
        let count = 0;
        mg.butterGrid.forEach((cell) => {
          if (!cell.buttered && Math.hypot(pos.x - (cell.x + 25), pos.y - (cell.y + 20)) < 48) {
            cell.buttered = true;
            sfx.pop();
          }
          if (cell.buttered) count += 1;
        });
        humanScore = Math.round((count / mg.butterGrid.length) * 115);
        minigameLiveScore.textContent = `SCORE: ${humanScore}%`;
        if (count === mg.butterGrid.length) {
          sfx.star();
          finishedEarly = true;
        }
      }
    };

    const onKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleAction();
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') mg.keys.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') mg.keys.right = true;
    };
    const onKeyUp = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') mg.keys.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') mg.keys.right = false;
    };

    minigameCanvas.addEventListener('pointerdown', onPointerDown);
    minigameCanvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let lastFrame = performance.now();
    const renderFrame = (now) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;

      if (now >= startTime && !started) {
        started = true;
        minigamePromptBanner.classList.add('is-hidden');
      }

      const elapsed = Math.max(0, now - startTime);
      const remaining = Math.max(0, durationMs - elapsed);
      minigameTimerText.textContent = `${(remaining / 1000).toFixed(1)}s`;
      minigameTimerFill.style.width = `${(remaining / durationMs) * 100}%`;

      ctx.fillStyle = '#25120c';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(255, 247, 234, 0.05)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < W; gx += 38) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 38) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      if (gameSpec.id === 'toast-pop') {
        if (started && !mg.popped) {
          mg.needle += mg.needleSpeed * dt;
          if (mg.needle > 1) { mg.needle = 1; mg.needleSpeed *= -1; }
          if (mg.needle < 0) { mg.needle = 0; mg.needleSpeed *= -1; }
        }
        if (mg.popped) mg.popY = Math.min(110, mg.popY + 420 * dt);

        ctx.fillStyle = '#b6713e';
        ctx.beginPath(); ctx.roundRect(235, 130 - mg.popY, 170, 150, 26); ctx.fill();
        ctx.fillStyle = '#f6d8b0';
        ctx.beginPath(); ctx.roundRect(250, 145 - mg.popY, 140, 125, 18); ctx.fill();
        ctx.fillStyle = '#1f100b';
        ctx.beginPath(); ctx.arc(295, 195 - mg.popY, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(345, 195 - mg.popY, 12, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#e76d43';
        ctx.beginPath(); ctx.roundRect(195, 215, 250, 145, 24); ctx.fill();
        ctx.fillStyle = '#fff7ea';
        ctx.font = 'bold 20px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(mg.popped ? (humanScore >= 85 ? 'PERFECT GOLDEN TOAST!' : 'POPPED!') : 'PRESS SPACE / CLICK IN GREEN ZONE!', 320, 295);

        const bx = 525, by = 70, bw = 54, bh = 280;
        ctx.fillStyle = '#3d1e14';
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
        const gy1 = by + (1 - mg.targetMax) * bh;
        const gh = (mg.targetMax - mg.targetMin) * bh;
        ctx.fillStyle = '#a8c779';
        ctx.fillRect(bx + 4, gy1, bw - 8, gh);
        const ny = by + (1 - mg.needle) * bh;
        ctx.fillStyle = '#f4bd5f';
        ctx.fillRect(bx - 12, ny - 6, bw + 24, 12);
      } else if (gameSpec.id === 'crumb-catch') {
        if (started) {
          if (mg.keys.left) mg.basketX = Math.max(60, mg.basketX - 420 * dt);
          if (mg.keys.right) mg.basketX = Math.min(W - 60, mg.basketX + 420 * dt);
          if (now - mg.lastSpawn > 240) {
            mg.lastSpawn = now;
            const bad = Math.random() < 0.24;
            mg.falling.push({
              x: 70 + Math.random() * (W - 140),
              y: -20,
              vy: 215 + Math.random() * 130,
              bad,
              itemType: bad ? 'bomb' : (Math.random() > 0.4 ? 'croissant' : 'star')
            });
          }
        }
        mg.falling.forEach((item) => {
          if (started) item.y += item.vy * dt;

          ctx.save();
          ctx.translate(item.x, item.y);
          if (item.itemType === 'star') {
            // Procedural Golden Ka-Ching Star
            ctx.beginPath();
            for (let s = 0; s < 5; s++) {
              ctx.lineTo(Math.cos((18 + s * 72) * Math.PI / 180) * 17, -Math.sin((18 + s * 72) * Math.PI / 180) * 17);
              ctx.lineTo(Math.cos((54 + s * 72) * Math.PI / 180) * 7.5, -Math.sin((54 + s * 72) * Math.PI / 180) * 7.5);
            }
            ctx.closePath();
            const sGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, 18);
            sGrad.addColorStop(0, '#fffbe6');
            sGrad.addColorStop(0.5, '#ffd15a');
            sGrad.addColorStop(1, '#ff9f1c');
            ctx.fillStyle = sGrad;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
          } else if (item.itemType === 'croissant') {
            // Procedural Glazed Croissant
            ctx.fillStyle = '#e59b3a';
            ctx.beginPath();
            ctx.arc(0, 0, 16, Math.PI * 0.15, Math.PI * 0.85);
            ctx.quadraticCurveTo(0, -6, 0, -14);
            ctx.quadraticCurveTo(0, -6, 0, 0);
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#8d4b1a';
            ctx.stroke();
            ctx.strokeStyle = '#fff1c5';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, 10, Math.PI * 0.25, Math.PI * 0.75);
            ctx.stroke();
          } else {
            // Charcoal Ember Bomb
            ctx.fillStyle = '#261410';
            ctx.beginPath();
            ctx.arc(0, 4, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#ff3c00';
            ctx.stroke();
            // Burning fuse
            ctx.fillStyle = '#ffbe0b';
            ctx.beginPath();
            ctx.arc(4, -12, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ff5400';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(4, -12);
            ctx.stroke();
          }
          ctx.restore();

          if (!item.caught && item.y > H - 95 && item.y < H - 30 && Math.abs(item.x - mg.basketX) < 62) {
            item.caught = true;
            if (item.bad) {
              humanScore = Math.max(0, humanScore - 18);
              addPopup(item.x, H - 90, '-18 BURN!', '#cf5d4d');
              sfx.burn();
            } else {
              humanScore += 18;
              addPopup(item.x, H - 90, '+18 CRISPY!', '#ffe46b');
              sfx.coin();
            }
            minigameLiveScore.textContent = `SCORE: ${humanScore}`;
          }
        });
        mg.falling = mg.falling.filter((i) => !i.caught && i.y < H + 30);

        // Tactile Wood & Linen Pastry Tray
        ctx.fillStyle = '#3a1e14';
        ctx.beginPath(); ctx.roundRect(mg.basketX - 60, H - 72, 120, 44, 12); ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ffd15a';
        ctx.stroke();
        ctx.fillStyle = '#fff7ea';
        ctx.beginPath(); ctx.roundRect(mg.basketX - 52, H - 68, 104, 34, 8); ctx.fill();
        ctx.fillStyle = '#2c1711';
        ctx.font = 'bold 15px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BWED TRAY', mg.basketX, H - 46);
      } else if (gameSpec.id === 'moon-pump') {
        ctx.fillStyle = '#fff7ea';
        mg.stars.forEach((s) => {
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.strokeStyle = '#5bc0be';
        ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(80, 75); ctx.lineTo(W - 80, 75); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#5bc0be';
        ctx.font = 'bold 18px "Fredoka", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('SOLANA APEX (120 PTS)', 90, 62);

        const progress = Math.min(1, humanScore / 120);
        const ry = (H - 80) - progress * (H - 165);
        ctx.fillStyle = '#5bc0be';
        ctx.fillRect(W / 2 - 26, ry, 52, H - 60 - ry);

        // Procedural Vector Bwed Rocket Capsule
        ctx.save();
        ctx.translate(W / 2, ry - 14);

        // Rocket exhaust fire trail
        const flameH = 18 + Math.sin(now * 0.04) * 8;
        ctx.fillStyle = '#ff5400';
        ctx.beginPath();
        ctx.moveTo(-11, 22);
        ctx.lineTo(0, 22 + flameH);
        ctx.lineTo(11, 22);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffd15a';
        ctx.beginPath();
        ctx.moveTo(-6, 22);
        ctx.lineTo(0, 22 + flameH * 0.6);
        ctx.lineTo(6, 22);
        ctx.closePath();
        ctx.fill();

        // Booster fins
        ctx.fillStyle = '#d90429';
        ctx.beginPath();
        ctx.moveTo(-15, 10); ctx.lineTo(-26, 24); ctx.lineTo(-15, 22); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(15, 10); ctx.lineTo(26, 24); ctx.lineTo(15, 22); ctx.fill();

        // Brioche rocket fuselage
        ctx.fillStyle = '#f4bd5f';
        ctx.beginPath();
        ctx.roundRect(-15, -24, 30, 46, [15, 15, 6, 6]);
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#8d4b1a';
        ctx.stroke();

        // Porthole window showing Bwed eyes
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath(); ctx.arc(0, -6, 8.5, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#ffd15a'; ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(-2.5, -6.5, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2.5, -6.5, 2.2, 0, Math.PI * 2); ctx.fill();

        ctx.restore();

        ctx.fillStyle = '#fff7ea';
        ctx.font = 'bold 20px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MASH SPACE OR CLICK TO PUMP BWED UP!', W / 2, H - 24);
      } else if (gameSpec.id === 'toaster-whack') {
        mg.holes.forEach((h) => {
          if (started && now > h.until) {
            if (h.state === 'empty' && Math.random() < 0.08) {
              h.state = Math.random() < 0.25 ? 'mold' : 'bwed';
              h.until = now + 680 + Math.random() * 450;
            } else if (h.state !== 'empty') {
              h.state = 'empty';
              h.until = now + 220;
            }
          }
          // Toaster Chamber Slot
          ctx.fillStyle = '#3a1b12';
          ctx.beginPath(); ctx.arc(h.x, h.y, 54, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#ffd15a';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Heat-coil lines
          ctx.strokeStyle = 'rgba(255, 100, 30, 0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(h.x - 30, h.y); ctx.lineTo(h.x + 30, h.y);
          ctx.moveTo(h.x - 24, h.y + 14); ctx.lineTo(h.x + 24, h.y + 14);
          ctx.moveTo(h.x - 24, h.y - 14); ctx.lineTo(h.x + 24, h.y - 14);
          ctx.stroke();

          if (h.state === 'bwed') {
            // Golden Smiling Bwed Slice
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.fillStyle = '#8d4b1a';
            ctx.beginPath(); ctx.roundRect(-24, -26, 48, 50, 10); ctx.fill();
            ctx.fillStyle = '#ffd99b';
            ctx.beginPath(); ctx.roundRect(-20, -22, 40, 42, 8); ctx.fill();
            // Butter square
            ctx.fillStyle = '#ffe169';
            ctx.beginPath(); ctx.roundRect(-6, -24, 12, 9, 3); ctx.fill();
            // Happy eyes
            ctx.fillStyle = '#24110b';
            ctx.beginPath(); ctx.arc(-7, -8, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(7, -8, 3, 0, Math.PI * 2); ctx.fill();
            // Rosy cheeks
            ctx.fillStyle = 'rgba(235, 87, 87, 0.5)';
            ctx.beginPath(); ctx.arc(-11, -2, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(11, -2, 3.5, 0, Math.PI * 2); ctx.fill();
            // Smile
            ctx.strokeStyle = '#24110b';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(0, -3, 6, 0.2, Math.PI - 0.2); ctx.stroke();
            ctx.restore();
          } else if (h.state === 'mold') {
            // Burnt Charcoal Slice
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.fillStyle = '#180e0c';
            ctx.beginPath(); ctx.roundRect(-24, -26, 48, 50, 10); ctx.fill();
            ctx.fillStyle = '#341f17';
            ctx.beginPath(); ctx.roundRect(-20, -22, 40, 42, 8); ctx.fill();
            // Crossed red eyes
            ctx.strokeStyle = '#ff3c00';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(-10, -11); ctx.lineTo(-4, -5);
            ctx.moveTo(-4, -11); ctx.lineTo(-10, -5);
            ctx.moveTo(4, -11); ctx.lineTo(10, -5);
            ctx.moveTo(10, -11); ctx.lineTo(4, -5);
            ctx.stroke();
            // Frown
            ctx.beginPath(); ctx.arc(0, 4, 7, Math.PI + 0.3, -0.3); ctx.stroke();
            ctx.restore();
          }
        });
      } else if (gameSpec.id === 'butter-spread') {
        ctx.fillStyle = '#b6713e';
        ctx.beginPath(); ctx.roundRect(190, 58, 395, 315, 36); ctx.fill();
        ctx.fillStyle = '#f6d8b0';
        ctx.beginPath(); ctx.roundRect(208, 74, 359, 283, 26); ctx.fill();

        mg.butterGrid.forEach((cell) => {
          if (cell.buttered) {
            ctx.fillStyle = '#ffe169';
            ctx.beginPath(); ctx.roundRect(cell.x, cell.y, 54, 42, 10); ctx.fill();
            ctx.fillStyle = '#fff9db';
            ctx.beginPath(); ctx.roundRect(cell.x + 8, cell.y + 6, 20, 6, 3); ctx.fill();
          } else {
            ctx.strokeStyle = 'rgba(182, 113, 62, 0.25)';
            ctx.strokeRect(cell.x, cell.y, 54, 42);
          }
        });

        // Procedural Silver Butter Spreader Knife
        ctx.save();
        ctx.translate(mg.cursorX, mg.cursorY);
        ctx.rotate(-0.55);
        ctx.fillStyle = '#cfd8dc';
        ctx.beginPath(); ctx.roundRect(-8, -35, 16, 45, [8, 8, 2, 2]); ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = '#90a4ae'; ctx.stroke();
        ctx.fillStyle = '#ffd15a';
        ctx.beginPath(); ctx.arc(0, -30, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff9db';
        ctx.beginPath(); ctx.arc(-2, -32, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5d2b1d';
        ctx.beginPath(); ctx.roundRect(-6, 10, 12, 30, 4); ctx.fill();
        ctx.restore();
      } else if (gameSpec.id === 'spot-bwed') {
        ctx.fillStyle = '#ffd15a';
        ctx.font = 'bold 24px "Fredoka", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(mg.targetTrait, W / 2, 68);

        mg.cards.forEach((c) => {
          ctx.fillStyle = '#2c150e';
          ctx.beginPath(); ctx.roundRect(c.x, c.y, c.w, c.h, 16); ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#ffd15a';
          ctx.stroke();

          // Real Hero Avatar Thumbnail
          const img = spotCardImages.get(c.hero.id);
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(c.x + c.w / 2 - 32, c.y + 10, 64, 64, 32);
            ctx.clip();
            ctx.drawImage(img, c.x + c.w / 2 - 32, c.y + 10, 64, 64);
            ctx.restore();
          } else {
            ctx.fillStyle = `#${c.hero.color.toString(16).padStart(6, '0')}`;
            ctx.beginPath();
            ctx.arc(c.x + c.w / 2, c.y + 42, 26, 0, Math.PI * 2);
            ctx.fill();
          }

          // Hero Name
          ctx.fillStyle = '#ffd15a';
          ctx.font = 'bold 15px "Fredoka", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(c.hero.name, c.x + c.w / 2, c.y + 94);

          // Hero Role Badge
          ctx.fillStyle = '#fff7ea';
          ctx.font = '700 11px "DM Mono", monospace';
          ctx.fillText(`[${c.hero.badge || 'HERO'}]`, c.x + c.w / 2, c.y + 112);
        });
      }

      // Draw floating score popups
      ctx.font = 'bold 20px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      mg.popups = mg.popups.filter((p) => {
        const age = (now - p.born) / 600;
        if (age >= 1) return false;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 1 - age;
        ctx.fillText(p.text, p.x, p.y - age * 35);
        ctx.globalAlpha = 1;
        return true;
      });

      if (started && (remaining <= 0 || finishedEarly)) {
        finishMinigame();
        return;
      }
      requestAnimationFrame(renderFrame);
    };

    const finishMinigame = () => {
      if (!running) return;
      running = false;
      minigameCanvas.removeEventListener('pointerdown', onPointerDown);
      minigameCanvas.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);

      const results = players.map((p, idx) => {
        const score = !p.isBot
          ? Math.max(10, humanScore + Math.floor(Math.random() * 6))
          : Math.round(45 + Math.random() * 55);
        return { player: p, index: idx, score };
      }).sort((a, b) => b.score - a.score);

      results.forEach((entry, rank) => {
        if (rank === 0) {
          entry.player.coins += 4;
          entry.player.crumbs += 1;
          entry.player.minigameWins += 1;
          entry.rewardText = '+1★ +4c';
        } else if (rank === 1) {
          entry.player.coins += 2;
          entry.rewardText = '+2 COINS';
        } else {
          entry.player.coins += 1;
          entry.rewardText = '+1 COIN';
        }
      });

      sfx.star();
      minigameResultHeading.textContent = `VICTORY! ${results[0].player.name.toUpperCase()} WINS!`;
      minigamePodium.innerHTML = results.map((r, rank) => {
        const thumb = pawnThumbnailCache.get(r.player.id) || `./assets/pawns/thumbs/${r.player.id}.png`;
        return `
          <div class="podium-row">
            <span class="podium-rank">#${rank + 1}</span>
            <span class="podium-name"><img class="podium-avatar-img" src="${thumb}" alt="${r.player.name}" onerror="this.onerror=null;this.replaceWith('${r.player.badge || 'BWED'}');"> ${r.player.name}</span>
            <span class="podium-score">${r.score} PTS</span>
            <span class="podium-reward">${r.rewardText}</span>
          </div>
        `;
      }).join('');
      minigameResults.hidden = false;
      log(`<strong>[BWEDWARE] ${gameSpec.title}:</strong> <strong>${results[0].player.name}</strong> won 1st place (+1★ & +4c)!`);
      renderPlayerList();
    };

    const closeAndResolve = () => {
      running = false;
      minigameModal.hidden = true;
      state.inModal = false;
      resolve();
    };

    activeMinigameCleanup = () => {
      running = false;
      minigameCanvas.removeEventListener('pointerdown', onPointerDown);
      minigameCanvas.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };

    minigameContinueButton.onclick = closeAndResolve;
    closeMinigameButton.onclick = closeAndResolve;
    minigameNextArcadeButton.onclick = () => {
      launchMicroGame('BWEDWARE ARCADE RUSH', true).then(resolve);
    };

    requestAnimationFrame(renderFrame);
  });
}

// ============================================================================
// BOARD MOVEMENT & TILE RESOLUTION
// ============================================================================
async function movePlayer(playerIndex, steps) {
  const player = players[playerIndex];
  const pawn = state.pawnGroups[playerIndex];
  if (!pawn) return;

  if (state.autoCam) {
    cameraFocusPlayer = playerIndex;
    cameraDistanceGoal = 15.5;
  }

  // Keep the overhead number badge visible above the pawn and count down steps!
  if (diceMesh3D) {
    diceMesh3D.visible = true;
    if (diceCubeHolder) diceCubeHolder.visible = false;
    if (diceBadgeSprite) {
      diceBadgeSprite.position.y = 0.55;
      diceBadgeSprite.scale.set(1.45, 1.45, 1);
    }
  }

  for (let step = 0; step < steps; step += 1) {
    const remaining = steps - step;
    updateOverheadDiceBadge(remaining, remaining === 1 ? 'LAST STEP!' : 'STEPS LEFT', 'step');
    player.position = (player.position + 1) % state.paths.length;
    placePawn(pawn, playerIndex, player.position, true);
    sfx.stepHop();

    if (player.position === 0 && step < steps - 1) {
      player.coins += 3;
      sfx.coin();
      spawnBurstParticles(pawn.position, 0xf4bd5f, 12);
      showToast(`${player.name} passed the Grand Oven: +3 coins!`);
      log(`<strong>${player.name}</strong> passed the Grand Oven and collected +3 coins.`);
    }

    if (player.position === state.goldCrumbIndex) {
      const coinJackpot = state.roundTwist.id === 'golden-hour' ? 6 : 4;
      const starGain = (state.roundTwist.id === 'golden-hour' ? 2 : 1) + (player.talentCrumbMagnet ? 1 : 0);
      player.talentCrumbMagnet = false;
      player.coins += coinJackpot;
      player.crumbs += starGain;
      player.goldenHits += 1;
      sfx.star();
      spawnBurstParticles(pawn.position, 0xffe46b, 26);
      showTurnBanner(`★ GOLDEN LOAF! +${starGain}★!`, 1450);
      showToast(`JACKPOT: +${starGain}★ Loaf & +${coinJackpot} coins!`);
      log(`<strong>${player.name}</strong> captured the <strong>★ Golden Loaf</strong> (+${starGain}★ & +${coinJackpot}c)!`);
      moveGoldenCrumb();
      renderPlayerList();
    }

    await wait(315);
  }

  if (diceMesh3D) {
    diceMesh3D.visible = false;
    if (diceCubeHolder) diceCubeHolder.visible = true;
  }

  // Check for pawn collisions (Bwed Bump & Coin Snatch!)
  const rivalsOnTile = players.filter((p, i) => i !== playerIndex && p.position === player.position);
  if (rivalsOnTile.length > 0) {
    const victim = rivalsOnTile[0];
    const stolen = Math.min(2, victim.coins);
    if (stolen > 0) {
      victim.coins -= stolen;
      player.coins += stolen;
      sfx.warioIntro();
      spawnBurstParticles(pawn.position, 0xffa52f, 18);
      showTurnBanner(`[BUMP] SNATCHED ${stolen}c!`, 1250);
      showToast(`[BUMP] ${player.name} collided with ${victim.name} and snatched ${stolen} coins!`);
      log(`<strong>${player.name}</strong> collided with <strong>${victim.name}</strong>! Bwed Bump snatch: +${stolen} coins!`);
      renderPlayerList();
      await wait(850);
    }
  }

  const spaceMeta = getSpaceMeta(player.position);
  const tileType = spaceMeta.type;

  if (tileType === 'start') {
    player.coins += 3;
    player.crumbs += 1;
    sfx.star();
    spawnBurstParticles(pawn.position, 0xf4bd5f, 20);
    showToast(`${player.name} stopped at ${spaceMeta.name}: +1★ & +3c!`);
    log(`<strong>${player.name}</strong> stopped at <strong>${spaceMeta.name}</strong>: +1★ Loaf & +3 coins!`);
  } else if (tileType === 'coin') {
    const gain = state.roundTwist.id === 'double-bake' ? 4 : 2;
    player.coins += gain;
    sfx.coin();
    spawnBurstParticles(pawn.position, 0xa8c779, 12);
    showToast(`${spaceMeta.name}: +${gain} fresh coins!`);
    log(`<strong>${player.name}</strong> visited <strong>${spaceMeta.name}</strong> (+${gain} coins).`);
  } else if (tileType === 'shop') {
    showToast(`${player.name} entered ${spaceMeta.name}!`);
    await openBakeryShop(player);
  } else if (tileType === 'duel') {
    player.chaosTiles += 1;
    spawnBurstParticles(pawn.position, 0xe76d43, 16);
    showTurnBanner(`[ARCADE] ${spaceMeta.name.toUpperCase()}!`, 1200);
    await wait(900);
    await launchMicroGame('ARCADE BUILDING SHOWDOWN!', false);
  } else if (tileType === 'event') {
    player.chaosTiles += 1;
    spawnBurstParticles(pawn.position, 0x9a79d6, 18);
    await openWheelOfFortune(player);
  } else if (tileType === 'springboard') {
    player.chaosTiles += 1;
    sfx.pop();
    spawnBurstParticles(pawn.position, 0xffa07a, 16);
    showTurnBanner(`[SPRING] WAFER SPRINGBOARD! +3 SPACES!`, 1200);
    showToast(`[SPRING] ${player.name} hit the Wafer Springboard and bounced +3 spaces ahead!`);
    log(`<strong>${player.name}</strong> bounced on the <strong>Wafer Springboard</strong> (+3 spaces forward)!`);
    player.position = (player.position + 3) % state.paths.length;
    placePawn(pawn, playerIndex, player.position, true);
    await wait(750);
  } else if (tileType === 'vault') {
    player.chaosTiles += 1;
    const bounty = state.bankVaultJackpot;
    player.coins += bounty;
    state.bankVaultJackpot = 3;
    updateVaultChip();
    sfx.star();
    spawnBurstParticles(pawn.position, 0x2ec4b6, 25);
    showTurnBanner(`[VAULT] VAULT CRACKED! +${bounty}c!`, 1400);
    showToast(`[VAULT] ${player.name} cracked open the Bwedbank Vault and collected ${bounty} coins!`);
    log(`<strong>${player.name}</strong> cracked open the <strong>Bwedbank Vault</strong> for a jackpot of <strong>+${bounty} coins</strong>!`);
    await wait(850);
  } else if (tileType === 'risk') {
    player.chaosTiles += 1;
    const hotOven = state.roundTwist.id === 'hot-oven';
    const shielded = player.talentRiskShield;
    const wonRisk = shielded || Math.random() > 0.42;
    if (shielded) player.talentRiskShield = false;
    if (wonRisk) {
      const bonus = hotOven ? 6 : 4;
      player.coins += bonus;
      player.crumbs += 1;
      sfx.star();
      spawnBurstParticles(pawn.position, 0xffe46b, 20);
      showToast(`[FURNACE] ${spaceMeta.name}: JACKPOT! +1★ & +${bonus}c!`);
      log(`<strong>${player.name}</strong> mastered <strong>${spaceMeta.name}</strong>: +1★ Loaf & +${bonus} coins!`);
    } else {
      const loss = hotOven ? 3 : 2;
      player.coins = Math.max(0, player.coins - loss);
      state.bankVaultJackpot += 1;
      updateVaultChip();
      sfx.burn();
      spawnBurstParticles(pawn.position, 0xcf5d4d, 14);
      showToast(`[FURNACE] ${spaceMeta.name}: BURNT CRUST! -${loss}c`);
      log(`<strong>${player.name}</strong> got singed at <strong>${spaceMeta.name}</strong> (-${loss} coins).`);
    }
  }

  if (state.autoCam) {
    cameraFocusPlayer = null;
    cameraTargetGoal.set(0, 0.5, 0);
    cameraDistanceGoal = 27.5;
  }

  renderPlayerList();
}

function finishParty() {
  state.gameOver = true;
  rollButton.disabled = true;
  talentButton.disabled = true;
  rollButtonLabel.textContent = 'PARTY COMPLETE';

  const richWinner = [...players].sort((a, b) => b.coins - a.coins)[0];
  const mgWinner = [...players].sort((a, b) => b.minigameWins - a.minigameWins || b.coins - a.coins)[0];
  const chaosWinner = [...players].sort((a, b) => b.chaosTiles - a.chaosTiles || b.goldenHits - a.goldenHits)[0];

  richWinner.crumbs += 1;
  mgWinner.crumbs += 1;
  chaosWinner.crumbs += 1;

  bonusStarsBox.innerHTML = `
    <div class="bonus-star-item"><span>★ RICH BAKER BONUS</span><strong>${richWinner.icon} ${richWinner.name} (+1★)</strong></div>
    <div class="bonus-star-item"><span>★ BWEDWARE CHAMP</span><strong>${mgWinner.icon} ${mgWinner.name} (+1★)</strong></div>
    <div class="bonus-star-item"><span>★ CHAOS EXPLORER</span><strong>${chaosWinner.icon} ${chaosWinner.name} (+1★)</strong></div>
  `;

  const standings = players.map((player, index) => ({
    ...player,
    index,
    score: player.crumbs * 10 + player.coins
  })).sort((a, b) => b.crumbs - a.crumbs || b.coins - a.coins || b.goldenHits - a.goldenHits);

  const winner = standings[0];
  sfx.star();
  const winnerThumb = pawnThumbnailCache.get(winner.id) || `./assets/pawns/thumbs/${winner.id}.png`;
  winnerName.innerHTML = `<img class="winner-avatar-img" src="${winnerThumb}" alt="${winner.name}" onerror="this.onerror=null;this.replaceWith('${winner.icon}');"> ${winner.name}`;
  winnerSummary.textContent = `${winner.name} remporte la Couronne Dorée avec ${winner.crumbs} ★ Pains Dorés et ${winner.coins} pièces (${winner.score} pts de fête totale) !`;
  finaleStandings.innerHTML = standings.map((player, index) => {
    const thumb = pawnThumbnailCache.get(player.id) || `./assets/pawns/thumbs/${player.id}.png`;
    return `
      <div class="finale-row">
        <span>#${index + 1}</span>
        <strong class="finale-name"><img class="finale-avatar-img" src="${thumb}" alt="${player.name}" onerror="this.onerror=null;this.replaceWith('${player.icon}');"> ${player.name} ${player.isBot ? '<small>(BOT)</small>' : ''}</strong>
        <small>${player.crumbs}★ · ${player.coins}c (${player.score} PTS)</small>
      </div>
    `;
  }).join('');
  finaleModal.hidden = false;
  showToast(`${winner.name} wins the Bwed Party!`);
}

let botTurnTimeout = null;
function scheduleBotTurnIfNeeded() {
  clearTimeout(botTurnTimeout);
  if (state.gameOver || state.moving || state.inModal || !state.pawnsLoaded) return;
  const current = players[state.currentPlayer];
  if (current && current.isBot) {
    botTurnTimeout = setTimeout(() => {
      if (state.gameOver || state.moving || state.inModal) return;
      if (!current.talentUsed && Math.random() < 0.45) {
        useTalent(true);
      }
      roll();
    }, 750);
  }
}

async function roll() {
  if (state.moving || state.gameOver || state.inModal || !state.pawnsLoaded) return;
  state.moving = true;
  rollButton.disabled = true;
  talentButton.disabled = true;

  const player = players[state.currentPlayer];
  const activePawn = state.pawnGroups[state.currentPlayer];
  const rollBonus = player.rollBonus + player.talentRollBonus;
  const hadTalentReroll = player.talentReroll;
  const hadDouble = player.talentDoubleRoll;
  const hadMinSix = player.talentMinSix;

  player.rollBonus = 0;
  player.talentRollBonus = 0;
  player.talentReroll = false;
  player.talentDoubleRoll = false;
  player.talentMinSix = false;

  if (state.autoCam) {
    cameraFocusPlayer = state.currentPlayer;
    cameraDistanceGoal = 16.2;
  }

  if (diceMesh3D && activePawn) {
    diceMesh3D.visible = true;
    diceMesh3D.position.copy(activePawn.position).add(new THREE.Vector3(0, 3.45, 0));
    if (diceCubeHolder) {
      diceCubeHolder.visible = true;
      diceCubeHolder.scale.setScalar(1);
    }
    if (diceBadgeSprite) {
      diceBadgeSprite.position.y = 1.15;
      diceBadgeSprite.scale.set(1.65, 1.65, 1);
    }
  }

  let rollValue = 1;
  const totalTicks = 14;
  for (let i = 0; i < totalTicks; i += 1) {
    const firstRoll = hadMinSix ? 6 : (1 + Math.floor(Math.random() * 6));
    const secondRoll = hadTalentReroll ? (1 + Math.floor(Math.random() * 6)) : firstRoll;
    let base = Math.max(firstRoll, secondRoll);
    if (hadDouble) base *= 2;
    rollValue = Math.min(12, base + rollBonus);
    diceResult.textContent = rollValue;
    updateOverheadDiceBadge(rollValue, 'ROLLING...', 'roll');
    if (diceCubeHolder) {
      diceCubeHolder.rotation.x += 0.68;
      diceCubeHolder.rotation.y += 0.84;
      diceCubeHolder.rotation.z += 0.32;
    }
    sfx.diceTick(i);
    await wait(55 + i * 13);
  }

  const stepBonus = player.talentStepBonus;
  player.talentStepBonus = 0;
  const totalSteps = Math.min(12, rollValue + stepBonus);
  diceResult.textContent = totalSteps;

  // Dramatic Mario-Party Dice Hit & Number Reveal Pause above the player's head!
  const subBanner = hadDouble
    ? '×2 OVERCLOCK!'
    : (rollBonus + stepBonus > 0 ? `+${rollBonus + stepBonus} BOOST!` : 'ROLLED!');
  updateOverheadDiceBadge(totalSteps, subBanner, 'final');

  if (activePawn) {
    activePawn.position.y = (activePawn.userData.restingY || 0.42) + 0.58;
  }
  if (diceCubeHolder) {
    diceCubeHolder.rotation.set(0.38, 0.62, 0);
    diceCubeHolder.scale.setScalar(1.06);
  }
  if (diceBadgeSprite) {
    diceBadgeSprite.scale.set(1.95, 1.95, 1);
  }
  if (diceMesh3D) {
    spawnBurstParticles(diceMesh3D.position, 0xffe46b, 18);
  }
  sfx.pop();
  showTurnBanner(`[ROLL] ${player.name.toUpperCase()} ROLLED ${totalSteps}!`, 1150);
  await wait(1150);

  log(`<strong>${player.name}</strong> rolled <strong>${totalSteps}</strong>${rollBonus ? ` (+${rollBonus} boost)` : ''}${hadDouble ? ' (×2 Overclock)' : ''}.`);
  await movePlayer(state.currentPlayer, totalSteps);

  state.turnsInRound += 1;
  if (state.turnsInRound >= players.length) {
    state.turnsInRound = 0;

    showTurnBanner(`[SHOWDOWN] ROUND ${state.round} BWEDWARE!`, 1300);
    await wait(1150);
    await launchMicroGame(`ROUND ${String(state.round).padStart(2, '0')} SHOWDOWN`, false);

    state.round += 1;
    if (state.round > state.maxRounds) {
      state.round = state.maxRounds;
      roundLabel.textContent = String(state.maxRounds).padStart(2, '0');
      renderPlayerList();
      finishParty();
      state.moving = false;
      return;
    }
    state.roundStarter = (state.roundStarter + 1) % players.length;
    state.currentPlayer = state.roundStarter;
    setRoundTwist();
    showTurnBanner(`ROUND ${String(state.round).padStart(2, '0')} · ${state.roundTwist.name}!`, 1400);
  } else {
    state.currentPlayer = (state.currentPlayer + 1) % players.length;
  }

  roundLabel.textContent = String(state.round).padStart(2, '0');
  state.moving = false;
  renderPlayerList();
  scheduleBotTurnIfNeeded();
}

function resetGame() {
  clearTimeout(botTurnTimeout);
  players.forEach((player, idx) => {
    const fresh = makePlayer(pawnCatalog.find((p) => p.id === player.id) || pawnCatalog[idx], idx, player.isBot);
    Object.assign(player, fresh);
  });
  state.currentPlayer = 0;
  state.roundStarter = 0;
  state.turnsInRound = 0;
  state.round = 1;
  state.gameOver = false;
  state.moving = false;
  state.bankVaultJackpot = 6;
  updateVaultChip();
  diceResult.textContent = '—';
  roundLabel.textContent = '01';
  setRoundTwist(1);
  moveGoldenCrumb(9);
  state.pawnGroups.forEach((pawn, index) => placePawn(pawn, index, 0));
  eventLog.innerHTML = '';
  log('<strong>Welcome to Bwedville!</strong> Stop in front of the 3D town buildings, chase the ★ Golden Loaf, and win the BwedWare showdowns!');
  renderPlayerList();
}

function updateCamera(immediate = false) {
  cameraDistance += (cameraDistanceGoal - cameraDistance) * (immediate ? 1 : 0.12);
  const horizontal = Math.cos(cameraElevation) * cameraDistance;
  desiredCameraPosition.set(
    cameraTarget.x + Math.sin(cameraAzimuth) * horizontal,
    cameraTarget.y + Math.sin(cameraElevation) * cameraDistance,
    cameraTarget.z + Math.cos(cameraAzimuth) * horizontal
  );
  if (immediate) {
    cameraTarget.copy(cameraTargetGoal);
    camera.position.copy(desiredCameraPosition);
  } else {
    cameraTarget.lerp(cameraTargetGoal, 0.12);
    camera.position.lerp(desiredCameraPosition, 0.12);
  }
  camera.lookAt(cameraTarget);
}

function resetCameraView() {
  cameraFocusPlayer = null;
  cameraDistanceGoal = 27.5;
  cameraAzimuth = 0.52;
  cameraElevation = 0.92;
  cameraTargetGoal.set(0, 0.5, 0);
  showToast('Town overview restored');
}

function setTopBoardView() {
  cameraFocusPlayer = null;
  cameraDistanceGoal = 29.5;
  cameraAzimuth = 0;
  cameraElevation = 1.38;
  cameraTargetGoal.set(0, 0, 0);
  showToast('Top-down town map view');
}

function focusPawn(playerIndex) {
  const pawn = state.pawnGroups[playerIndex];
  if (!pawn) return;
  cameraFocusPlayer = playerIndex;
  cameraTargetGoal.copy(pawn.position).add(new THREE.Vector3(0, 0.75, 0));
  cameraDistanceGoal = 11.2;
  showToast(`Focused on ${players[playerIndex].name}`);
}

function inspectSpaceOrPawnFromPointer(event, isClick = false) {
  const rect = viewport.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(pointer, camera);

  if (isClick) {
    const pawnHits = raycaster.intersectObjects(state.pawnGroups.filter(Boolean), true);
    if (pawnHits.length) {
      let obj = pawnHits[0].object;
      while (obj && obj.userData?.playerIndex === undefined) obj = obj.parent;
      if (obj?.userData?.playerIndex !== undefined) {
        focusPawn(obj.userData.playerIndex);
        return;
      }
    }

    const npcHits = raycaster.intersectObjects(state.npcGroups.filter(Boolean), true);
    if (npcHits.length) {
      let obj = npcHits[0].object;
      while (obj && !obj.userData?.isNPC) obj = obj.parent;
      if (obj?.userData?.pawnMeta) {
        const m = obj.userData.pawnMeta;
        sfx.pop();
        state.crowdCheerUntil = performance.now() + 1850;
        showToast(`${m.icon} ${m.name} (${m.role}) cheers from the Bwedville Tribune!`);
        return;
      }
    }
  }

  const tileHits = raycaster.intersectObjects(state.tiles, true);
  if (tileHits.length) {
    let obj = tileHits[0].object;
    while (obj && obj.userData?.index === undefined) obj = obj.parent;
    if (obj?.userData?.index !== undefined) {
      const idx = obj.userData.index;
      state.hoveredTileIndex = idx;
      updateSpaceInspector(idx);
      if (hoverTileRing && state.paths[idx]) {
        hoverTileRing.position.x = state.paths[idx].x;
        hoverTileRing.position.z = state.paths[idx].z;
        hoverTileRing.visible = true;
      }
      if (isClick) {
        const meta = getSpaceMeta(idx);
        showToast(`${meta.icon} ${meta.num} ${meta.name}`);
      }
      return;
    }
  }

  if (!isClick && state.hoveredTileIndex !== null) {
    state.hoveredTileIndex = null;
    if (hoverTileRing) hoverTileRing.visible = false;
    updateSpaceInspector(players[state.currentPlayer]?.position || 0);
  }
}

let pointerState = null;
viewport.addEventListener('pointerdown', (event) => {
  pointerState = { x: event.clientX, y: event.clientY, moved: false, pan: event.shiftKey || event.button === 1 || event.button === 2 };
  viewport.setPointerCapture(event.pointerId);
});
viewport.addEventListener('pointermove', (event) => {
  if (!pointerState) {
    inspectSpaceOrPawnFromPointer(event, false);
    return;
  }
  const dx = event.clientX - pointerState.x;
  const dy = event.clientY - pointerState.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) pointerState.moved = true;
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  if (pointerState.pan) {
    cameraFocusPlayer = null;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 1);
    const panScale = 0.012 * (settings.camera / 100) * Math.max(cameraDistance, 10);
    cameraTargetGoal.addScaledVector(right, -dx * panScale);
    cameraTargetGoal.addScaledVector(up, dy * panScale);
  } else {
    cameraAzimuth -= dx * 0.008 * (settings.camera / 100);
    cameraElevation = THREE.MathUtils.clamp(cameraElevation + dy * 0.006 * (settings.camera / 100), 0.32, 1.42);
  }
});
viewport.addEventListener('pointerup', (event) => {
  if (pointerState && !pointerState.moved && event.button === 0) inspectSpaceOrPawnFromPointer(event, true);
  pointerState = null;
});
viewport.addEventListener('pointercancel', () => { pointerState = null; });
viewport.addEventListener('contextmenu', (event) => event.preventDefault());
viewport.addEventListener('wheel', (event) => {
  event.preventDefault();
  cameraDistanceGoal = THREE.MathUtils.clamp(cameraDistanceGoal + event.deltaY * 0.018, 6.5, 42);
}, { passive: false });

function resize() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

function initMenu() {
  if (window.location.protocol === 'file:') protocolWarning.hidden = false;
  initSelectionPreview();
  initPawnThumbnails();
  updateVaultChip();
  setPlayerCount(selectedPlayerCount);
  showMenuScreen('home');
  refreshSettingsUI();
  initHudAudioControls();
  updateGameMusicVolume();

  if (urlCinematic) {
    document.body.classList.add('is-cinematic');
    frontDoor.classList.add('is-hidden');
    gameShell.classList.add('is-active');
    state.autoCam = false;
    cameraFocusPlayer = null;
    cameraDistance = 25.5;
    cameraDistanceGoal = 25.5;
    cameraAzimuth = 0.58;
    cameraElevation = 0.82;
    cameraTargetGoal.set(0, 0.4, 0);
    updateCamera(true);
    resize();
  }

  document.querySelector('#playButton').addEventListener('click', () => { sfx.pop(); showMenuScreen('count'); });

  const directSelectBtn = document.querySelector('#directSelectButton');
  if (directSelectBtn) {
    directSelectBtn.addEventListener('click', () => {
      sfx.pop();
      showMenuScreen('select');
    });
  }

  const directBoardBtn = document.querySelector('#directBoardButton');
  if (directBoardBtn) {
    directBoardBtn.addEventListener('click', () => {
      sfx.warioIntro();
      stopPreviewLoop();
      frontDoor.classList.add('is-hidden');
      gameShell.classList.add('is-active');
      state.autoCam = true;
      resize();
      showTurnBanner('WELCOME TO BWEDVILLE 3D TOWN!', 1500);
      scheduleBotTurnIfNeeded();
    });
    if (urlDirectBoard) {
      setTimeout(() => directBoardBtn.click(), 60);
    }
  }

  document.querySelector('#arcadeButton').addEventListener('click', () => {
    sfx.warioIntro();
    launchMicroGame('BWEDWARE ARCADE RUSH', true);
  });
  document.querySelector('#backHomeButton').addEventListener('click', () => showMenuScreen('home'));
  document.querySelector('#backCountButton').addEventListener('click', () => showMenuScreen('count'));
  document.querySelector('#randomizePartyButton').addEventListener('click', randomizeParty);
  selectedSlotBotToggle.addEventListener('click', () => {
    players[activePlayerSlot].isBot = !players[activePlayerSlot].isBot;
    sfx.pop();
    renderPlayerSlots();
    updateSelectionDetails();
  });

  playerCountButtons.forEach((button) => button.addEventListener('click', () => {
    sfx.pop();
    setPlayerCount(Number(button.dataset.playerCount));
  }));
  document.querySelector('#continueToSelectionButton').addEventListener('click', () => { sfx.pop(); showMenuScreen('select'); });
  document.querySelector('#settingsButton').addEventListener('click', () => openModal(settingsModal));
  document.querySelector('#gameSettingsButton').addEventListener('click', () => openModal(settingsModal));
  document.querySelector('#helpButton').addEventListener('click', () => openModal(helpModal));
  document.querySelector('#triggerMinigameButton').addEventListener('click', async () => {
    if (state.moving || state.inModal) return;
    await launchMicroGame('INSTANT BWEDWARE BONUS!', false);
    scheduleBotTurnIfNeeded();
  });
  document.querySelector('#returnMenuButton').addEventListener('click', () => {
    clearTimeout(botTurnTimeout);
    gameShell.classList.remove('is-active');
    frontDoor.classList.remove('is-hidden');
    showMenuScreen('home');
  });

  if (autoCamButton) {
    autoCamButton.addEventListener('click', () => {
      state.autoCam = !state.autoCam;
      autoCamButton.classList.toggle('is-toggled', state.autoCam);
      autoCamButton.textContent = `Cam: ${state.autoCam ? 'AUTO' : 'MANUAL'}`;
      if (!state.autoCam) resetCameraView();
    });
  }
  if (cutawayButton) {
    cutawayButton.addEventListener('click', () => {
      state.smartCutaway = !state.smartCutaway;
      cutawayButton.classList.toggle('is-toggled', state.smartCutaway);
      cutawayButton.textContent = `Roofs: ${state.smartCutaway ? 'SMART' : 'SOLID'}`;
      showToast(state.smartCutaway ? 'Smart foreground roof cutaway ON' : 'All town buildings at 100% height');
    });
  }
  focusCurrentButton.addEventListener('click', () => focusPawn(state.currentPlayer));
  topViewButton.addEventListener('click', setTopBoardView);
  resetCameraButton.addEventListener('click', resetCameraView);
  talentButton.addEventListener('click', () => useTalent(false));

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', () => closeModal(document.querySelector(`#${button.dataset.closeModal}`)));
  });
  [settingsModal, helpModal].forEach((modal) => {
    modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); });
  });

  [['musicRange', 'music'], ['sfxRange', 'sfx'], ['cameraRange', 'camera']].forEach(([id, key]) => {
    document.querySelector(`#${id}`).addEventListener('input', (event) => {
      settings[key] = Number(event.target.value);
      if (key === 'music') updateGameMusicVolume();
      refreshSettingsUI();
      saveSettings();
    });
  });
  document.querySelector('#motionToggle').addEventListener('change', (event) => {
    settings.reducedMotion = event.target.checked;
    saveSettings();
  });

  document.querySelector('#playAgainButton').addEventListener('click', () => {
    finaleModal.hidden = true;
    clearLoadedPawns();
    gameShell.classList.remove('is-active');
    frontDoor.classList.remove('is-hidden');
    showMenuScreen('select');
  });

  document.querySelector('#startGameButton').addEventListener('click', () => {
    sfx.star();
    stopPreviewLoop();
    frontDoor.classList.add('is-hidden');
    gameShell.classList.add('is-active');
    resetGame();
    loadPawns();
    requestAnimationFrame(() => { resize(); updateCamera(true); });
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameShell.classList.contains('is-active') && !state.inModal && !state.moving && !state.gameOver) {
      const current = players[state.currentPlayer];
      if (current && !current.isBot) {
        e.preventDefault();
        roll();
      }
    }
  });
}

// Smart Foreground Cutaway: lowers buildings that sit between the camera and the sidewalk pawn pads!
const tempCamDir = new THREE.Vector3();
function updateBuildingCutaways() {
  tempCamDir.copy(camera.position).sub(cameraTarget);
  tempCamDir.y = 0;
  if (tempCamDir.lengthSq() < 0.001) return;
  tempCamDir.normalize();

  const lowAngle = cameraElevation < 1.18;
  state.buildings.forEach((b) => {
    const dot = b.outwardDir.dot(tempCamDir);
    const isHovered = state.hoveredTileIndex === b.index;
    let targetScaleY = 1.0;
    if (state.smartCutaway && lowAngle && dot > 0.42 && !isHovered) {
      targetScaleY = 0.35;
    } else if (isHovered) {
      targetScaleY = 1.08;
    }
    b.currentScaleY += (targetScaleY - b.currentScaleY) * 0.14;
    b.buildingUpper.scale.y = b.currentScaleY;
  });
}

let lastBoardFrameTime = 0;
const boardFrameBudget = 1000 / 60; // Smooth 60 FPS cap (avoids running at 120 FPS on Mac ProMotion displays)

function animate(now = 0) {
  requestAnimationFrame(animate);

  // When frontDoor menu covers the screen, pause rendering the hidden 3D board completely!
  if (!frontDoor.classList.contains('is-hidden')) {
    return;
  }

  // 60 FPS cap to keep GPU cool and silent
  const delta = now - lastBoardFrameTime;
  if (delta < boardFrameBudget - 1) return;
  lastBoardFrameTime = now - (delta % boardFrameBudget);

  state.clock = now * 0.001;

  if (cameraFocusPlayer !== null && state.pawnGroups[cameraFocusPlayer]) {
    cameraTargetGoal.copy(state.pawnGroups[cameraFocusPlayer].position).add(new THREE.Vector3(0, 0.72, 0));
  }

  boardGroup.rotation.y = settings.reducedMotion ? 0 : Math.sin(state.clock * 0.14) * 0.014;

  updateBuildingCutaways();

  // Centerpiece toaster slices bobbing + Croissant Windmill spinning
  toasterSlices.forEach((slice) => {
    slice.position.y = slice.userData.baseY + Math.abs(Math.sin(state.clock * 2.2 + slice.userData.phase)) * 0.3;
  });
  if (windmillBlades && !settings.reducedMotion) {
    windmillBlades.rotation.z += 0.015;
  }

  // Animate roadside tile monuments (coins, question blocks, portal rings, steam)
  if (!settings.reducedMotion) {
    animatedProps.forEach((prop) => {
      if (prop.userData.animType === 'float') {
        prop.position.y = prop.userData.baseY + Math.sin(state.clock * 2.4 + prop.userData.phase) * 0.1;
      } else if (prop.userData.animType === 'floatSpin') {
        prop.position.y = prop.userData.baseY + Math.sin(state.clock * 2.8 + prop.userData.phase) * 0.12;
        prop.rotation.y += 0.032;
      } else if (prop.userData.animType === 'spinZ') {
        prop.rotation.z += 0.025;
      }
    });
  }

  // Animate living 3D GLB Spectator Crowd in the off-map Tribunes & Central Plaza!
  const isCheering = (state.crowdCheerUntil || 0) > now;
  state.npcGroups.forEach((npc) => {
    if (!settings.reducedMotion) {
      const hopSpeed = isCheering ? 9.5 : 3.2;
      const hopHeight = isCheering ? 0.34 : 0.11;
      npc.position.y = npc.userData.baseY + Math.abs(Math.sin(state.clock * hopSpeed + npc.userData.phase)) * hopHeight;
      const baseRot = npc.userData.baseRotY ?? npc.rotation.y;
      const swayAmp = isCheering ? 0.32 : 0.12;
      npc.rotation.y = baseRot + Math.sin(state.clock * (isCheering ? 6.5 : 1.6) + npc.userData.phase) * swayAmp;
    }
  });

  // Update 3D burst particles
  for (let i = burstParticles.length - 1; i >= 0; i -= 1) {
    const p = burstParticles[i];
    const age = (now - p.userData.born) / 1000;
    if (age > 0.85) {
      fxGroup.remove(p);
      burstParticles.splice(i, 1);
    } else {
      p.position.x += p.userData.vx * 0.016;
      p.position.y += p.userData.vy * 0.016;
      p.position.z += p.userData.vz * 0.016;
      p.userData.vy -= 9.8 * 0.016;
      p.rotation.x += 0.12;
      p.rotation.y += 0.15;
      p.scale.setScalar(1 - age * 0.9);
    }
  }

  if (ambientParticles && !settings.reducedMotion) {
    ambientParticles.rotation.y = state.clock * 0.03;
  }

  const activePawn = state.pawnGroups[state.currentPlayer];
  if (activeTurnRing && activePawn) {
    activeTurnRing.position.x = activePawn.position.x;
    activeTurnRing.position.z = activePawn.position.z;
    activeTurnRing.scale.setScalar(1 + Math.sin(state.clock * 5) * 0.1);
  }
  if (diceMesh3D && diceMesh3D.visible && activePawn) {
    diceMesh3D.position.x = activePawn.position.x;
    diceMesh3D.position.z = activePawn.position.z;
    diceMesh3D.position.y = 3.45 + Math.sin(state.clock * 4.2) * 0.08;
  }

  // Lightweight diorama crowd cheering bob (0 GPU strain, 60fps locked)
  if (!settings.reducedMotion && state.npcGroups.length > 0) {
    state.npcGroups.forEach((npc) => {
      if (npc.userData?.baseY !== undefined) {
        const cheer = Math.sin(state.clock * 3.8 + (npc.userData.phase || 0));
        npc.position.y = npc.userData.baseY + Math.max(0, cheer) * 0.05;
      }
    });
  }

  if (goldenCrumb) {
    goldenCrumb.rotation.y += 0.025;
    goldenCrumb.position.y = goldenCrumb.userData.baseY + Math.sin(state.clock * 2.5) * 0.08;
  }

  boardGroup.children.forEach((child) => {
    if (child.userData?.destination) {
      const progress = Math.min((performance.now() - child.userData.moveStart) / child.userData.moveDuration, 1);
      const eased = progress * (2 - progress);
      child.position.lerpVectors(child.userData.start, child.userData.destination, eased);
      child.position.y += Math.sin(progress * Math.PI) * 0.76;
      child.rotation.y += 0.08;
      if (progress >= 1) {
        delete child.userData.destination;
        if (child.userData.targetRotY !== undefined) {
          child.rotation.y = child.userData.targetRotY;
        }
      }
    } else if (child.userData?.playerIndex !== undefined && !settings.reducedMotion) {
      const isTurn = child.userData.playerIndex === state.currentPlayer;
      const base = child.userData.restingY || 0.42;
      child.position.y = base + Math.abs(Math.sin(state.clock * (isTurn ? 4.5 : 2.0) + child.userData.playerIndex)) * (isTurn ? 0.14 : 0.04);
      if (child.userData.targetRotY !== undefined) {
        child.rotation.y += (child.userData.targetRotY - child.rotation.y) * 0.12;
      }
    }
  });

  updateCamera();
  renderer.render(scene, camera);
}

buildBoard();
makeBakeryDecor();
renderPlayerList();
updateCamera(true);
resize();
window.addEventListener('resize', resize);
rollButton.addEventListener('click', roll);
resetButton.addEventListener('click', () => {
  resetGame();
  scheduleBotTurnIfNeeded();
});
initMenu();
animate();
