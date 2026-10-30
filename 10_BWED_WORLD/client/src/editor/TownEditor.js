import * as THREE from 'three';
import { BWEDTOWN_CONFIG, BWEDTOWN_BUILDINGS, generateBwedTownMap, gridToWorldPos } from '../world/BwedTownMapData.js';

/* ==========================================================================
   TOWN MAP EDITOR — BWEDTOWN 32x32 GRID DIORAMA
   - Intuitive in-browser world builder for designing custom town layouts
   - Categorized asset palette (Buildings, Nature, Street Props, Notice Boards)
   - Real-time 3D raycasting cursor with grid-snapped footprint highlight
   - Select, Move, 90° Rotate (R), Delete (Del), and Clone
   - "Apply & Play" live in-game with instant procedural rebuild & persistence
   - "Export JS Code" for copying clean procedural JavaScript arrays
   ========================================================================== */

export const EDITOR_CATALOG = [
  // --- 1. BUILDINGS & SHOPS ---
  {
    type: 'fountain_bloom',
    model: 'golden-bloom.glb',
    name: 'Golden Butter Fountain',
    category: 'buildings',
    footprint: { w: 4, h: 4 },
    scale: 1.25,
    yOffset: 0.0,
    icon: '⛲',
    desc: 'The sparkling centerpiece of the Main Square.'
  },
  {
    type: 'milk_apartments',
    model: 'milk-carton-apartments.glb',
    name: 'Milk Carton Apartments',
    category: 'buildings',
    footprint: { w: 4, h: 4 },
    scale: 1.05,
    yOffset: 0.0,
    icon: '🥛',
    desc: 'Habbo-style residences for players to decorate private 3D rooms.',
    door: { action: 'habbo_apartments', dialogue: 'Welcome to Bwed Suites! Step inside to decorate your private room.' }
  },
  {
    type: 'bakery_house',
    model: 'bakery-house.glb',
    name: 'The Golden Bakery',
    category: 'buildings',
    footprint: { w: 3, h: 3 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '🥖',
    desc: 'Smells of fresh warm sourdough and golden brioche.',
    door: { action: 'bakery_shop', dialogue: 'A warm scent of fresh brioche wafts from the bakery oven.' }
  },
  {
    type: 'honey_tavern',
    model: 'honey-cafe.glb',
    name: 'Honey Pot Tavern',
    category: 'buildings',
    footprint: { w: 4, h: 3 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '☕',
    desc: 'Social gathering spot for warm drinks and chiptunes.',
    door: { action: 'honey_tavern', dialogue: 'Push through the tavern doors for hot cocoa and friendly chiptunes?' }
  },
  {
    type: 'galeries_boutique',
    model: 'galeries-boutique.glb',
    name: 'Bwed Fashion Galeries',
    category: 'buildings',
    footprint: { w: 4, h: 3 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '👗',
    desc: 'Haute-couture boutique with 3D avatar wardrobe.',
    door: { action: 'open_wardrobe', dialogue: 'Welcome to the Bwed Fashion Galeries! Step inside to change your 3D avatar.' }
  },
  {
    type: 'teacup_gazebo',
    model: 'teacup-gazebo.glb',
    name: 'Teacup Gazebo',
    category: 'buildings',
    footprint: { w: 3, h: 3 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '🫖',
    desc: 'Cozy outdoor tea pavilion for quiet relaxation.'
  },
  {
    type: 'jam_apothecary',
    model: 'jam-jar-apothecary.glb',
    name: 'Jam Jar Apothecary',
    category: 'buildings',
    footprint: { w: 3, h: 3 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '🍓',
    desc: 'Herbal elixirs, berry marmalades, and sweet tonics.',
    door: { action: 'jam_shop', dialogue: 'Sweet jars of raspberry and apricot jam sparkle in the dispensary window.' }
  },
  {
    type: 'arcade_duel',
    model: 'arcade-duel.glb',
    name: 'Arcade Duel Arena',
    category: 'buildings',
    footprint: { w: 4, h: 4 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '🕹️',
    desc: '1v1 mini-games and retro gaming tournaments.',
    door: { action: 'arcade_duel', dialogue: '1v1 Arcade Duel arena! Step inside to challenge an opponent.' }
  },
  {
    type: 'portal_observatory',
    model: 'portal-observatory.glb',
    name: 'Sourdough Observatory',
    category: 'buildings',
    footprint: { w: 3, h: 3 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '🔭',
    desc: 'Cosmic brass telescope pointing toward the Constellation of Brioche.'
  },
  {
    type: 'donut_bumper_cars',
    model: 'ride-bumper-cars-donut.glb',
    name: 'Donut Bumper Cars',
    category: 'buildings',
    footprint: { w: 4, h: 4 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🍩',
    desc: 'Glazed donut bumper cars for fairground thrills.'
  },
  {
    type: 'arcade_podium_cake',
    model: 'arcade-podium-tiered-cake.glb',
    name: 'Tiered Cake Stage',
    category: 'buildings',
    footprint: { w: 3, h: 3 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🎂',
    desc: 'Celebratory tiered podium for tournaments and ceremonies.'
  },
  {
    type: 'waffle_tower',
    model: 'waffle-tower.glb',
    name: 'Crispy Waffle Tower',
    category: 'buildings',
    footprint: { w: 2, h: 2 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '🧇',
    desc: 'Historic lookout tower overlooking the village.'
  },

  // --- 2. NATURE & FLORA ---
  {
    type: 'crimson_tree',
    model: 'crimson-tree.glb',
    name: 'Crimson Pastry Tree',
    category: 'nature',
    footprint: { w: 2, h: 2 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🍁',
    desc: 'Lush autumnal tree with candy-red leaves.'
  },
  {
    type: 'pistachio_tree',
    model: 'pistachio-tree.glb',
    name: 'Pistachio Matcha Tree',
    category: 'nature',
    footprint: { w: 2, h: 2 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🌳',
    desc: 'Delicate pistachio green tree providing gentle shade.'
  },
  {
    type: 'pistachio_glow',
    model: 'pistachio-glow.glb',
    name: 'Glowing Pistachio Bush',
    category: 'nature',
    footprint: { w: 1, h: 1 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🌿',
    desc: 'Bioluminescent shrub casting soft green light.'
  },
  {
    type: 'marshmallow_campfire',
    model: 'marshmallow-campfire.glb',
    name: 'Marshmallow Campfire',
    category: 'nature',
    footprint: { w: 2, h: 2 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🔥',
    desc: 'Warm crackling hearth for roasting golden marshmallows.'
  },

  // --- 3. STREET PROPS & FURNISHINGS ---
  {
    type: 'pretzel_bench',
    model: 'pretzel-bench.glb',
    name: 'Sugar Pretzel Bench',
    category: 'props',
    footprint: { w: 2, h: 1 },
    scale: 1.2,
    yOffset: 0.0,
    icon: '🥨',
    desc: 'A comfortable bench hand-baked from golden pretzel dough.'
  },
  {
    type: 'honey_lantern',
    model: 'honey-lantern.glb',
    name: 'Honey Jar Street Lamp',
    category: 'props',
    footprint: { w: 1, h: 1 },
    scale: 1.15,
    yOffset: 0.0,
    icon: '🏮',
    desc: 'Classic BwedTown lamppost casting warm amber light.'
  },
  {
    type: 'snack_cart',
    model: 'snack-cart.glb',
    name: 'Street Pastry Cart',
    category: 'props',
    footprint: { w: 2, h: 1 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🛒',
    desc: 'Mobile vendor cart laden with fresh treats.'
  },
  {
    type: 'bread_cubes',
    model: 'bread-cubes.glb',
    name: 'Flour Bread Crates',
    category: 'props',
    footprint: { w: 1, h: 1 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '📦',
    desc: 'Rustic wooden crates packed with oven-fresh loaves.'
  },
  {
    type: 'treasure_chest',
    model: 'treasure-chest.glb',
    name: 'Secret Brass Chest',
    category: 'props',
    footprint: { w: 1, h: 1 },
    scale: 1.0,
    yOffset: 0.0,
    icon: '🎁',
    desc: 'Mysterious antique chest bound in polished brass.'
  },
  {
    type: 'bwed_dice',
    model: 'bwed-dice.glb',
    name: 'Giant Bwed D6 Dice',
    category: 'props',
    footprint: { w: 1, h: 1 },
    scale: 1.8,
    yOffset: 0.0,
    icon: '🎲',
    desc: 'Lucky carved cube for tavern games and street bets.'
  },
  {
    type: 'golden_croissant',
    model: 'golden-croissant.glb',
    name: 'Giant Croissant Monument',
    category: 'props',
    footprint: { w: 2, h: 2 },
    scale: 1.0,
    yOffset: 0.0,
    icon: '🥐',
    desc: 'Golden monumental pastry honoring the bakers of BwedTown.'
  },
  {
    type: 'pastry_dessert',
    model: 'pastry-dessert.glb',
    name: 'Giant Strawberry Tart',
    category: 'props',
    footprint: { w: 1, h: 1 },
    scale: 1.0,
    yOffset: 0.0,
    icon: '🍰',
    desc: 'Artisanal decorative cake topped with sugar glaze.'
  },
  {
    type: 'hazelnut_cup',
    model: 'hazelnut-cup.glb',
    name: 'Steaming Hazelnut Mug',
    category: 'props',
    footprint: { w: 1, h: 1 },
    scale: 0.8,
    yOffset: 0.0,
    icon: '🍵',
    desc: 'Giant mug of spiced hazelnut hot chocolate.'
  },
  {
    type: 'cosmic_blocks',
    model: 'cosmic-blocks.glb',
    name: 'Cosmic Sugar Blocks',
    category: 'props',
    footprint: { w: 1, h: 1 },
    scale: 1.1,
    yOffset: 0.0,
    icon: '🧱',
    desc: 'Gleaming crystallized sugar cubes with cosmic sheen.'
  },

  // --- 4. NOTICE BOARDS & CHRONICLES ---
  {
    type: 'billboard_roadmap',
    model: null,
    name: 'Master Roadmap Notice Board',
    category: 'boards',
    boardCategory: 'roadmap',
    footprint: { w: 3, h: 1 },
    scale: 1.0,
    yOffset: 0.0,
    icon: '📜',
    desc: 'Interactive 3D board displaying project roadmap and dev milestones.'
  },
  {
    type: 'billboard_chronicle',
    model: null,
    name: 'Official Chronicle Board',
    category: 'boards',
    boardCategory: 'news',
    footprint: { w: 3, h: 1 },
    scale: 1.0,
    yOffset: 0.0,
    icon: '📰',
    desc: 'Village gazette, patch notes, and mayoral announcements.'
  },
  {
    type: 'billboard_artworks',
    model: null,
    name: 'Fine Arts & Concepts Gallery Board',
    category: 'boards',
    boardCategory: 'artworks',
    footprint: { w: 3, h: 1 },
    scale: 1.0,
    yOffset: 0.0,
    icon: '🎨',
    desc: 'Exhibits official high-resolution game artworks and 3D renders.'
  }
];

export class TownEditor {
  constructor(app) {
    this.app = app;
    this.engine = app.engine;
    this.scene = app.engine.scene;
    this.camera = app.engine.camera;
    this.renderer = app.renderer;
    this.audio = app.audio;

    this.isOpen = false;
    this.currentTool = 'select'; // 'select' or 'place'
    this.selectedBuilding = null; // Reference to building in this.buildingsList
    this.selectedCatalogItem = null;
    this.selectedCategory = 'all';
    this.searchQuery = '';

    // Local working copy of placed buildings
    this.buildingsList = [];
    this.loadWorkingBuildings();

    // Raycasting & cursor
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoverGx = 15;
    this.hoverGz = 15;
    this.placementRotY = 0;

    // 3D Visual Feedback Helpers
    this.ghostGroup = new THREE.Group();
    this.ghostGroup.name = 'Editor_GhostGroup';
    this.ghostGroup.visible = false;
    this.scene.add(this.ghostGroup);

    this.selectionHelper = null;

    this.buildGhostVisuals();
    this.initDOM();
    this.initEvents();
  }

  loadWorkingBuildings() {
    try {
      const custom = localStorage.getItem('bwedtown_custom_buildings');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.buildingsList = JSON.parse(JSON.stringify(parsed));
          return;
        }
      }
    } catch (e) {}
    this.buildingsList = JSON.parse(JSON.stringify(BWEDTOWN_BUILDINGS));
  }

  buildGhostVisuals() {
    // 1. Grid footprint rectangle
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.ghostPlane = new THREE.Mesh(geo, mat);
    this.ghostPlane.rotation.x = -Math.PI / 2;
    this.ghostPlane.position.y = 0.08;
    this.ghostGroup.add(this.ghostPlane);

    // 2. Wireframe border
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 });
    this.ghostBorder = new THREE.LineSegments(edgeGeo, edgeMat);
    this.ghostBorder.rotation.x = -Math.PI / 2;
    this.ghostBorder.position.y = 0.09;
    this.ghostGroup.add(this.ghostBorder);
  }

  updateGhostSize(w, h) {
    const { tileSize } = BWEDTOWN_CONFIG;
    const realW = w * tileSize;
    const realH = h * tileSize;

    this.ghostPlane.scale.set(realW, realH, 1);
    this.ghostBorder.scale.set(realW, realH, 1);
  }

  initDOM() {
    // Main editor container overlay
    this.editorOverlay = document.createElement('div');
    this.editorOverlay.id = 'townEditorOverlay';
    this.editorOverlay.className = 'town-editor-container';
    this.editorOverlay.style.display = 'none';

    this.editorOverlay.innerHTML = `
      <!-- TOP CONTROL BAR -->
      <div class="town-editor-top-bar">
        <div class="editor-title-block">
          <span class="editor-pill-badge">🛠️ TOWN BUILDER 3D</span>
          <h2 class="editor-main-title">BwedTown Map &amp; Architecture Editor</h2>
          <span class="editor-grid-tag">32&times;32 Isometric Diorama Grid</span>
        </div>

        <div class="editor-top-actions">
          <button class="editor-btn success" id="editorApplyBtn" type="button" title="Save layout and play immediately">
            <span>💾 Apply &amp; Play</span>
          </button>
          <button class="editor-btn primary" id="editorExportBtn" type="button" title="Export clean JavaScript code">
            <span>📋 Export JS Code</span>
          </button>
          <button class="editor-btn danger" id="editorResetBtn" type="button" title="Reset map to default canonical BwedTown">
            <span>↺ Reset Default</span>
          </button>
          <button class="editor-btn close-btn" id="editorCloseBtn" type="button" title="Exit Editor [F2 / Esc]">
            <span>✕ Close</span>
          </button>
        </div>
      </div>

      <!-- LEFT ASSET DRAWER -->
      <div class="town-editor-sidebar">
        <div class="sidebar-header">
          <h3 class="sidebar-title">Asset Palette</h3>
          <div class="sidebar-search-box">
            <input type="text" id="editorSearchInput" placeholder="Filter assets (e.g. bakery, tree, lamp)..." />
          </div>
        </div>

        <!-- Category Tabs -->
        <div class="editor-cat-tabs">
          <button class="ed-cat-tab active" data-cat="all" type="button">✨ All</button>
          <button class="ed-cat-tab" data-cat="buildings" type="button">🏛️ Buildings</button>
          <button class="ed-cat-tab" data-cat="nature" type="button">🌳 Nature</button>
          <button class="ed-cat-tab" data-cat="props" type="button">🪑 Props</button>
          <button class="ed-cat-tab" data-cat="boards" type="button">📢 Boards</button>
        </div>

        <!-- Asset Cards Tray -->
        <div class="editor-asset-grid" id="editorAssetGrid"></div>
      </div>

      <!-- FLOATING INSPECTOR CARD FOR SELECTED OBJECT -->
      <div class="town-editor-inspector" id="editorInspectorCard" hidden>
        <div class="inspector-header">
          <div class="inspector-icon" id="edInspIcon">🏛️</div>
          <div class="inspector-info">
            <span class="inspector-tag" id="edInspCategory">Building</span>
            <strong class="inspector-name" id="edInspName">The Golden Bakery</strong>
          </div>
          <button class="inspector-close" id="edInspCloseBtn" type="button" title="Deselect [Esc]">&times;</button>
        </div>

        <div class="inspector-details-row">
          <div class="detail-badge">Grid: <strong id="edInspCoords">X: 14, Z: 14</strong></div>
          <div class="detail-badge">Size: <strong id="edInspSize">3 &times; 3</strong></div>
          <div class="detail-badge">Rot: <strong id="edInspRot">0&deg;</strong></div>
        </div>

        <div class="inspector-actions">
          <button class="insp-tool-btn" id="edRotateBtn" type="button" title="Rotate 90 degrees [R]">
            <span>🔄 Rotate 90&deg; [R]</span>
          </button>
          <button class="insp-tool-btn" id="edMoveBtn" type="button" title="Pick up and move to new spot">
            <span>✋ Move</span>
          </button>
          <button class="insp-tool-btn danger" id="edDeleteBtn" type="button" title="Delete object [Del]">
            <span>🗑️ Delete [Del]</span>
          </button>
        </div>
      </div>

      <!-- BOTTOM SHORTCUT GUIDE -->
      <div class="editor-hint-banner">
        <span>💡 <strong>Controls:</strong> Click any building in town to select &middot; [R] Rotate 90&deg; &middot; [Del] Remove &middot; [Esc] Deselect / Cancel &middot; [F2] Toggle Editor</span>
      </div>

      <!-- CODE EXPORT MODAL -->
      <div class="editor-code-modal-overlay" id="editorCodeModal" hidden>
        <div class="editor-code-modal-card">
          <div class="code-modal-header">
            <div>
              <span class="code-modal-kicker">PROCEDURAL JAVASCRIPT CODE</span>
              <h3 class="code-modal-title">Export BwedTown Buildings Array</h3>
            </div>
            <button class="code-modal-close" id="closeCodeModalBtn" type="button">&times;</button>
          </div>
          <p class="code-modal-desc">
            Copy this procedural array and paste it into <code>BwedTownMapData.js</code> to permanently bake your layout into the repository!
          </p>
          <div class="code-modal-pre-wrap">
            <pre><code id="exportedCodeContent"></code></pre>
          </div>
          <div class="code-modal-actions">
            <button class="editor-btn success" id="copyCodeBtn" type="button">
              <span>📋 Copy to Clipboard</span>
            </button>
            <button class="editor-btn" id="dismissCodeModalBtn" type="button">
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.editorOverlay);
  }

  initEvents() {
    // 1. Top bar actions
    document.getElementById('editorApplyBtn')?.addEventListener('click', () => {
      this.applyAndPlay();
    });

    document.getElementById('editorExportBtn')?.addEventListener('click', () => {
      this.showCodeExportModal();
    });

    document.getElementById('editorResetBtn')?.addEventListener('click', () => {
      this.resetDefaultTown();
    });

    document.getElementById('editorCloseBtn')?.addEventListener('click', () => {
      this.close();
    });

    // 2. HUD toggle button
    document.getElementById('openTownEditorBtn')?.addEventListener('click', () => {
      this.toggle();
    });

    // 3. Category tabs
    this.editorOverlay.querySelectorAll('.ed-cat-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.editorOverlay.querySelectorAll('.ed-cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.selectedCategory = tab.getAttribute('data-cat') || 'all';
        this.renderAssetCards();
      });
    });

    // 4. Search input
    document.getElementById('editorSearchInput')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderAssetCards();
    });

    // 5. Inspector actions
    document.getElementById('edInspCloseBtn')?.addEventListener('click', () => {
      this.deselectBuilding();
    });

    document.getElementById('edRotateBtn')?.addEventListener('click', () => {
      this.rotateActiveBuilding();
    });

    document.getElementById('edMoveBtn')?.addEventListener('click', () => {
      this.startMovingActiveBuilding();
    });

    document.getElementById('edDeleteBtn')?.addEventListener('click', () => {
      this.deleteActiveBuilding();
    });

    // 6. Code modal actions
    document.getElementById('closeCodeModalBtn')?.addEventListener('click', () => {
      this.hideCodeExportModal();
    });

    document.getElementById('dismissCodeModalBtn')?.addEventListener('click', () => {
      this.hideCodeExportModal();
    });

    document.getElementById('copyCodeBtn')?.addEventListener('click', () => {
      this.copyExportedCode();
    });

    // 7. Mouse & Raycasting on Canvas
    window.addEventListener('mousemove', (e) => {
      if (!this.isOpen) return;
      this.handlePointerMove(e);
    });

    window.addEventListener('click', (e) => {
      if (!this.isOpen) return;
      // Ignore clicks inside UI panels
      if (e.target.closest('.town-editor-sidebar') ||
          e.target.closest('.town-editor-top-bar') ||
          e.target.closest('.town-editor-inspector') ||
          e.target.closest('.editor-code-modal-card')) {
        return;
      }
      this.handlePointerClick(e);
    });

    // 8. Global Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        this.toggle();
        return;
      }

      if (!this.isOpen) return;

      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        if (this.currentTool === 'place') {
          this.cancelPlacement();
        } else if (this.selectedBuilding) {
          this.deselectBuilding();
        } else {
          this.close();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        this.rotateActiveBuilding();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.deleteActiveBuilding();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.loadWorkingBuildings();
    this.editorOverlay.style.display = 'block';

    // Lift camera higher for wide tactical view
    this.savedCameraDist = this.app.baseCamDist;
    this.app.baseCamDist = 28.0;

    this.renderAssetCards();
    this.audio?.playCoinCollect?.();
  }

  close() {
    this.isOpen = false;
    this.editorOverlay.style.display = 'none';
    this.ghostGroup.visible = false;
    this.deselectBuilding();
    this.cancelPlacement();

    // Restore camera
    if (this.savedCameraDist) {
      this.app.baseCamDist = this.savedCameraDist;
    }
  }

  renderAssetCards() {
    const grid = document.getElementById('editorAssetGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const filtered = EDITOR_CATALOG.filter((item) => {
      const matchCat = this.selectedCategory === 'all' || item.category === this.selectedCategory;
      const matchSearch = !this.searchQuery || item.name.toLowerCase().includes(this.searchQuery) || item.desc.toLowerCase().includes(this.searchQuery);
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="editor-empty-hint">No assets match your filter.</div>`;
      return;
    }

    for (const item of filtered) {
      const isSelected = this.selectedCatalogItem?.type === item.type;
      const card = document.createElement('div');
      card.className = `editor-asset-card ${isSelected ? 'active' : ''}`;
      card.innerHTML = `
        <div class="card-icon-wrap">${item.icon}</div>
        <div class="card-info">
          <div class="card-name">${item.name}</div>
          <div class="card-meta">
            <span class="card-size-badge">${item.footprint.w}&times;${item.footprint.h}</span>
            <span class="card-cat-badge">${item.category}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.startPlacingItem(item);
      });

      grid.appendChild(card);
    }
  }

  startPlacingItem(catalogItem) {
    this.deselectBuilding();
    this.selectedCatalogItem = catalogItem;
    this.currentTool = 'place';
    this.placementRotY = 0;

    this.updateGhostSize(catalogItem.footprint.w, catalogItem.footprint.h);
    this.ghostGroup.visible = true;

    // Highlight card
    this.renderAssetCards();
    this.audio?.playStep?.();
  }

  cancelPlacement() {
    this.selectedCatalogItem = null;
    this.currentTool = 'select';
    this.ghostGroup.visible = false;
    this.renderAssetCards();
  }

  handlePointerMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Raycast on infinite ground plane y = 0
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();
    const hit = this.raycaster.ray.intersectPlane(plane, hitPoint);

    if (hit) {
      const { tileSize, totalWidth, totalHeight, width, height } = BWEDTOWN_CONFIG;
      const rawGx = Math.floor((hitPoint.x + totalWidth / 2) / tileSize);
      const rawGz = Math.floor((hitPoint.z + totalHeight / 2) / tileSize);

      const fpW = this.selectedCatalogItem?.footprint.w || 1;
      const fpH = this.selectedCatalogItem?.footprint.h || 1;

      this.hoverGx = Math.max(1, Math.min(width - fpW - 1, rawGx));
      this.hoverGz = Math.max(1, Math.min(height - fpH - 1, rawGz));

      if (this.currentTool === 'place' && this.selectedCatalogItem) {
        const centerWorldX = (this.hoverGx + fpW / 2) * tileSize - totalWidth / 2;
        const centerWorldZ = (this.hoverGz + fpH / 2) * tileSize - totalHeight / 2;
        this.ghostGroup.position.set(centerWorldX, 0.05, centerWorldZ);
      }
    }
  }

  handlePointerClick(e) {
    if (this.currentTool === 'place' && this.selectedCatalogItem) {
      this.placeCurrentItemOnGrid();
      return;
    }

    // Otherwise in select mode: pick building under mouse
    this.pickBuildingUnderMouse();
  }

  placeCurrentItemOnGrid() {
    const item = this.selectedCatalogItem;
    if (!item) return;

    const newBuilding = {
      id: `${item.type}_${Date.now()}`,
      model: item.model,
      name: item.name,
      type: item.category === 'boards' ? 'billboard' : undefined,
      category: item.boardCategory || undefined,
      gridX: this.hoverGx,
      gridZ: this.hoverGz,
      footprint: { w: item.footprint.w, h: item.footprint.h },
      rotationY: this.placementRotY,
      scale: item.scale || 1.0,
      yOffset: item.yOffset || 0.0,
      door: item.door ? {
        triggerX: this.hoverGx + Math.floor(item.footprint.w / 2),
        triggerZ: this.hoverGz + item.footprint.h,
        action: item.door.action,
        dialogue: item.door.dialogue
      } : undefined,
      interaction: item.category === 'boards' ? {
        type: 'dialogue',
        speaker: item.name,
        text: item.desc
      } : undefined
    };

    // Remove undefined keys for clean JSON
    Object.keys(newBuilding).forEach(k => newBuilding[k] === undefined && delete newBuilding[k]);

    this.buildingsList.push(newBuilding);
    this.audio?.playCoinCollect?.();

    // Rebuild live in 3D so player sees it immediately!
    this.refreshLiveWorld();

    // Select the newly placed building
    this.selectBuilding(newBuilding);
    this.cancelPlacement();
  }

  pickBuildingUnderMouse() {
    // Find if click lands inside any building footprint
    const clickedBldg = this.buildingsList.slice().reverse().find(b => {
      const { gridX, gridZ, footprint } = b;
      return this.hoverGx >= gridX && this.hoverGx < gridX + footprint.w &&
             this.hoverGz >= gridZ && this.hoverGz < gridZ + footprint.h;
    });

    if (clickedBldg) {
      this.selectBuilding(clickedBldg);
    } else {
      this.deselectBuilding();
    }
  }

  selectBuilding(bldg) {
    this.selectedBuilding = bldg;
    this.updateSelectionBox();

    const card = document.getElementById('editorInspectorCard');
    const icon = document.getElementById('edInspIcon');
    const name = document.getElementById('edInspName');
    const cat = document.getElementById('edInspCategory');
    const coords = document.getElementById('edInspCoords');
    const size = document.getElementById('edInspSize');
    const rot = document.getElementById('edInspRot');

    if (card) card.hidden = false;
    if (name) name.textContent = bldg.name;
    if (coords) coords.textContent = `X: ${bldg.gridX}, Z: ${bldg.gridZ}`;
    if (size) size.textContent = `${bldg.footprint.w} × ${bldg.footprint.h}`;
    
    const deg = Math.round(((bldg.rotationY || 0) * 180) / Math.PI) % 360;
    if (rot) rot.textContent = `${deg}°`;

    const catDef = EDITOR_CATALOG.find(c => c.model === bldg.model || c.name === bldg.name);
    if (icon) icon.textContent = catDef?.icon || '🏛️';
    if (cat) cat.textContent = catDef?.category || 'Building';

    this.audio?.playStep?.();
  }

  deselectBuilding() {
    this.selectedBuilding = null;
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.geometry.dispose();
      this.selectionHelper = null;
    }
    const card = document.getElementById('editorInspectorCard');
    if (card) card.hidden = true;
  }

  updateSelectionBox() {
    if (this.selectionHelper) {
      this.scene.remove(this.selectionHelper);
      this.selectionHelper.geometry.dispose();
      this.selectionHelper = null;
    }

    if (!this.selectedBuilding) return;

    const { tileSize, totalWidth, totalHeight } = BWEDTOWN_CONFIG;
    const { gridX, gridZ, footprint } = this.selectedBuilding;

    const w = footprint.w * tileSize;
    const d = footprint.h * tileSize;
    const cx = (gridX + footprint.w / 2) * tileSize - totalWidth / 2;
    const cz = (gridZ + footprint.h / 2) * tileSize - totalHeight / 2;

    const boxGeo = new THREE.BoxGeometry(w, 2.5, d);
    const edges = new THREE.EdgesGeometry(boxGeo);
    this.selectionHelper = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 3 })
    );
    this.selectionHelper.position.set(cx, 1.25, cz);
    this.scene.add(this.selectionHelper);
  }

  rotateActiveBuilding() {
    if (this.currentTool === 'place' && this.selectedCatalogItem) {
      this.placementRotY = (this.placementRotY + Math.PI / 2) % (Math.PI * 2);
      this.audio?.playStep?.();
      return;
    }

    if (!this.selectedBuilding) return;

    this.selectedBuilding.rotationY = ((this.selectedBuilding.rotationY || 0) + Math.PI / 2) % (Math.PI * 2);
    const deg = Math.round((this.selectedBuilding.rotationY * 180) / Math.PI) % 360;
    const rotEl = document.getElementById('edInspRot');
    if (rotEl) rotEl.textContent = `${deg}°`;

    this.refreshLiveWorld();
    this.updateSelectionBox();
    this.audio?.playStep?.();
  }

  startMovingActiveBuilding() {
    if (!this.selectedBuilding) return;
    const target = this.selectedBuilding;
    const catItem = EDITOR_CATALOG.find(c => c.model === target.model || c.name === target.name);

    // Remove from placed list temporarily
    const idx = this.buildingsList.indexOf(target);
    if (idx !== -1) {
      this.buildingsList.splice(idx, 1);
    }

    this.refreshLiveWorld();
    this.deselectBuilding();

    if (catItem) {
      this.startPlacingItem(catItem);
    }
  }

  deleteActiveBuilding() {
    if (!this.selectedBuilding) return;
    const idx = this.buildingsList.indexOf(this.selectedBuilding);
    if (idx !== -1) {
      this.buildingsList.splice(idx, 1);
    }
    this.deselectBuilding();
    this.refreshLiveWorld();
    this.audio?.playStep?.();
  }

  refreshLiveWorld() {
    const newMapData = generateBwedTownMap(this.buildingsList);
    this.app.mapData = newMapData;
    this.renderer.rebuildBuildings(newMapData);
  }

  applyAndPlay() {
    // 1. Persist to localStorage
    try {
      localStorage.setItem('bwedtown_custom_buildings', JSON.stringify(this.buildingsList));
    } catch (e) {}

    // 2. Refresh live world
    this.refreshLiveWorld();

    // 3. Close editor and return to player mode
    this.close();

    // 4. Alert user
    if (window.ToastManager) {
      window.ToastManager.show('✨ Town layout saved & applied! Have fun exploring!', 'success');
    } else {
      alert('✨ Custom BwedTown layout saved & applied! You can now explore your custom city in real-time.');
    }
  }

  resetDefaultTown() {
    if (!confirm('Do you want to reset BwedTown back to its default canonical layout?')) return;

    localStorage.removeItem('bwedtown_custom_buildings');
    this.buildingsList = JSON.parse(JSON.stringify(BWEDTOWN_BUILDINGS));
    this.deselectBuilding();
    this.refreshLiveWorld();
    this.audio?.playCoinCollect?.();
  }

  showCodeExportModal() {
    const modal = document.getElementById('editorCodeModal');
    const codeEl = document.getElementById('exportedCodeContent');
    if (!modal || !codeEl) return;

    const formattedCode = `/* ==========================================================================
   BWEDTOWN PROCEDURAL BUILDINGS BLUEPRINT (GENERATED BY TOWN EDITOR)
   Paste this into client/src/world/BwedTownMapData.js to make it permanent!
   ========================================================================== */

export const BWEDTOWN_BUILDINGS = ${JSON.stringify(this.buildingsList, null, 2)};
`;

    codeEl.textContent = formattedCode;
    modal.hidden = false;
  }

  hideCodeExportModal() {
    const modal = document.getElementById('editorCodeModal');
    if (modal) modal.hidden = true;
  }

  copyExportedCode() {
    const codeEl = document.getElementById('exportedCodeContent');
    const copyBtn = document.getElementById('copyCodeBtn');
    if (!codeEl) return;

    navigator.clipboard.writeText(codeEl.textContent).then(() => {
      this.audio?.playCoinCollect?.();
      if (copyBtn) copyBtn.innerHTML = `<span>✅ Copied to Clipboard!</span>`;
      setTimeout(() => {
        if (copyBtn) copyBtn.innerHTML = `<span>📋 Copy to Clipboard</span>`;
      }, 2500);
    });
  }
}
