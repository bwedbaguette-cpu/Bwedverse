import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { AvatarModel } from '../entities/AvatarModel.js';

/* ==========================================================================
   ESPACE PERSONNEL & SYSTÈME D'AGENCEMENT — HABBO STYLE V2
   - Scène 3D diorama d'appartement privé instancié (Grille 8x8)
   - Déplacement libre et fluide de l'avatar case par case (ZQSD / Flèches)
   - Placer, pivoter (90° ou touche R) et ajuster la taille (0.7x, 1.0x, 1.4x)
   - Modification en direct des meubles déjà placés (pivoter, redimensionner, ranger)
   - Bouton de sortie immédiat vers BwedTown (🚪 Sortir en Ville ou Échap)
   - Sauvegarde persistante de l'agencement dans localStorage
   ========================================================================== */

export class ApartmentManager {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.mainEngine = options.engine;
    this.playerAvatarId = options.avatarId || 'tiny-baker';
    this.audio = options.audio || null;
    this.inventory = options.inventory || null;
    this.profileManager = options.profileManager || null;
    this.onExitCallback = options.onExit || null;

    this.isOpen = false;
    this.isBuildMode = false;
    this.gridSize = 8;
    this.tileSize = 1.3;
    this.halfRoom = (this.gridSize * this.tileSize) / 2;

    this.roomScene = null;
    this.roomCamera = null;
    this.roomRenderer = null;
    this.animFrameId = null;
    this.clock = new THREE.Clock();
    this.loader = new GLTFLoader();

    this.placedFurniture = []; // { id, itemId, gx, gz, rotY, scale, group }
    this.roomCollision = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));

    // Options du mode agencement
    this.selectedItemToPlace = null;
    this.selectedPlacedFurniture = null; // meuble existant sélectionné pour modification
    this.selectionBoxHelper = null;
    this.isMovingSelected = false;
    this.catalogCategory = 'all';
    this.ghostMesh = null;
    this.ghostGx = 3;
    this.ghostGz = 3;
    this.ghostRotY = 0;
    this.ghostScale = 1.0; // 0.7, 1.0, 1.4

    // Contrôleur de déplacement du joueur dans la pièce
    this.roomPlayerAvatar = null;
    this.playerGx = 4;
    this.playerGz = 6;
    this.targetGx = 4;
    this.targetGz = 6;
    this.isMoving = false;
    this.moveTimer = 0;
    this.moveDuration = 0.20;
    this.playerFacing = 'north';
    this.playerWorldPos = new THREE.Vector3();
    this.startWorldPos = new THREE.Vector3();
    this.targetWorldPos = new THREE.Vector3();

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.initDOM();
  }

  initDOM() {
    this.overlayEl = document.createElement('div');
    this.overlayEl.id = 'apartmentOverlay';
    this.overlayEl.className = 'apartment-fullscreen-overlay';
    this.overlayEl.style.display = 'none';
    this.overlayEl.hidden = true;

    this.overlayEl.innerHTML = `
      <!-- Apartment 3D Canvas -->
      <canvas id="apartmentCanvas"></canvas>

      <!-- Apartment Top Toolbar -->
      <div class="apartment-top-bar">
        <div class="apartment-header-card">
          <span class="apartment-kicker">MILK CARTON RESIDENCE &middot; HABBO</span>
          <h2 class="apartment-title">My Private 3D Room</h2>
        </div>

        <div class="apartment-top-actions">
          <button class="apt-btn build-mode-toggle" id="aptBuildModeBtn" type="button">
            <span class="btn-icon">🛠️</span>
            <span id="aptBuildBtnText">Room Layout</span>
          </button>

          <button class="apt-btn" id="aptOpenInvBtn" type="button" title="Open Backpack">
            <span>🎒 Backpack</span>
          </button>

          <button class="apt-btn exit-btn" id="aptExitBtn" type="button" title="Back to BwedTown [Esc]">
            <span>🚪 Back to Town</span>
          </button>
        </div>
      </div>

      <!-- FLOATING INSPECTOR CARD FOR SELECTED FURNITURE -->
      <div class="apartment-inspector-card" id="apartmentInspectorCard" hidden>
        <div class="inspector-header">
          <div class="inspector-title-group">
            <div class="inspector-icon" id="inspectIcon">🛋️</div>
            <div class="inspector-meta">
              <span class="inspector-tag" id="inspectRarity">Habbo Furniture</span>
              <span class="inspector-name" id="inspectName">Brioche Sofa</span>
            </div>
          </div>
          <button class="inspector-close-btn" id="inspectCloseBtn" type="button" title="Deselect (&Eacute;sc)">&times;</button>
        </div>

        <div class="inspector-scale-row">
          <span class="inspector-scale-label">Scale:</span>
          <div class="inspector-scale-chips">
            <button class="scale-chip" data-scale="0.7" id="chipScale07" type="button">0.7x</button>
            <button class="scale-chip active" data-scale="1.0" id="chipScale10" type="button">1.0x</button>
            <button class="scale-chip" data-scale="1.4" id="chipScale14" type="button">1.4x</button>
          </div>
        </div>

        <div class="inspector-actions-grid">
          <button class="inspector-action-btn" id="inspectRotateBtn" type="button">
            <span>🔄</span> <strong>Rotate 90&deg; (R)</strong>
          </button>
          <button class="inspector-action-btn" id="inspectMoveBtn" type="button">
            <span>✋</span> <strong id="inspectMoveBtnText">Move</strong>
          </button>
          <button class="inspector-action-btn danger-full" id="inspectPickupBtn" type="button">
            <span>🗑️</span> <strong>Stash to Backpack (Del)</strong>
          </button>
        </div>
      </div>

      <!-- Bottom Layout Dock with Rotation & Scale Tools -->
      <div class="apartment-build-dock" id="apartmentBuildDock" hidden>
        <div class="build-hint-pill">
          <span>🛠️ <strong>Layout Mode:</strong> Click a furniture piece to edit &middot; [R] rotate &middot; [Del] stash &middot; [Esc] exit</span>
        </div>

        <!-- Catalog Tabs and Global Actions -->
        <div class="apartment-tool-row">
          <div class="build-catalog-tabs">
            <button class="catalog-tab active" data-cat="all" type="button">✨ All</button>
            <button class="catalog-tab" data-cat="furniture" type="button">🛋️ Furniture</button>
            <button class="catalog-tab" data-cat="drops" type="button">🏆 Trophies & Drops</button>
          </div>

          <div class="apt-tool-group">
            <button class="apt-tool-btn danger" id="aptClearAllBtn" type="button" title="Stash all furniture in this room">
              <span>🧹</span> <span>Clear Room</span>
            </button>
          </div>
        </div>

        <!-- Quick furniture tray for the player -->
        <div class="build-quick-furniture-bar" id="buildQuickFurnitureBar"></div>
      </div>
    `;

    this.container.appendChild(this.overlayEl);

    // Événements boutons supérieurs
    document.getElementById('aptBuildModeBtn')?.addEventListener('click', () => {
      this.toggleBuildMode();
    });

    document.getElementById('aptOpenInvBtn')?.addEventListener('click', () => {
      if (this.inventory) this.inventory.open();
    });

    document.getElementById('aptExitBtn')?.addEventListener('click', () => {
      this.close();
    });

    // Événements Inspecteur Flottant
    document.getElementById('inspectCloseBtn')?.addEventListener('click', () => {
      this.deselectFurniture();
    });

    document.getElementById('inspectRotateBtn')?.addEventListener('click', () => {
      this.rotateActive();
    });

    document.getElementById('inspectMoveBtn')?.addEventListener('click', () => {
      this.toggleMoveSelected();
    });

    document.getElementById('inspectPickupBtn')?.addEventListener('click', () => {
      this.pickupSelectedFurniture();
    });

    document.querySelectorAll('.scale-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scale-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sc = parseFloat(btn.getAttribute('data-scale')) || 1.0;
        this.setScaleActive(sc);
      });
    });

    // Bouton Tout Ranger
    document.getElementById('aptClearAllBtn')?.addEventListener('click', () => {
      this.clearAllFurniture();
    });

    // Onglets du catalogue
    this.overlayEl.querySelectorAll('.catalog-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.overlayEl.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.catalogCategory = tab.getAttribute('data-cat') || 'all';
        this.renderQuickFurnitureBar();
      });
    });

    // Gestion du clavier (Déplacement fluide + Raccourcis)
    this.initKeyboardControls();
  }

  initKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      const activeTag = document.activeElement ? document.activeElement.tagName : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') return;

      if (e.key === 'Escape') {
        if (this.selectedPlacedFurniture) {
          this.deselectFurniture();
          return;
        }
        if (this.isBuildMode) {
          this.toggleBuildMode(false);
          return;
        }
        this.close();
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        this.rotateActive();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedPlacedFurniture) {
          this.pickupSelectedFurniture();
          return;
        }
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W':
          this.keys.up = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = true;
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
        case 'a':
        case 'A':
          this.keys.left = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (!this.isOpen) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
        case 'w':
        case 'W':
          this.keys.up = false;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          this.keys.down = false;
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
        case 'a':
        case 'A':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = false;
          break;
      }
    });
  }

  initThreeScene() {
    const canvas = document.getElementById('apartmentCanvas');
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.roomScene = new THREE.Scene();
    this.roomScene.background = new THREE.Color(0x1a0e08);

    // Caméra diorama isométrique
    this.roomCamera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    this.roomCamera.position.set(0, 11.2, 14.5);
    this.roomCamera.lookAt(0, 0.8, 0);

    this.roomRenderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.roomRenderer.setSize(width, height);
    this.roomRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.roomRenderer.shadowMap.enabled = true;
    this.roomRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Éclairage chaleureux
    const ambientLight = new THREE.AmbientLight(0xfff2e0, 1.5);
    this.roomScene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffecd1, 2.2);
    sunLight.position.set(6, 14, 9);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    this.roomScene.add(sunLight);

    const windowLight = new THREE.PointLight(0xffd580, 1.8, 14);
    windowLight.position.set(-this.halfRoom, 3.5, 0);
    this.roomScene.add(windowLight);

    this.buildRoomArchitecture();
    this.loadSavedFurniture();
    this.initInteractionRaycast(canvas);

    window.addEventListener('resize', () => {
      if (!this.isOpen) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.roomCamera.aspect = w / h;
      this.roomCamera.updateProjectionMatrix();
      this.roomRenderer.setSize(w, h);
    });
  }

  buildRoomArchitecture() {
    const totalW = this.gridSize * this.tileSize;

    // Sol en parquet bois beurré
    const floorGeo = new THREE.PlaneGeometry(totalW, totalW);
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const ctx = floorCanvas.getContext('2d');
    const tileSizePx = 512 / this.gridSize;

    for (let gz = 0; gz < this.gridSize; gz++) {
      for (let gx = 0; gx < this.gridSize; gx++) {
        const isLight = (gx + gz) % 2 === 0;
        ctx.fillStyle = isLight ? '#d4a373' : '#bc8a5f';
        ctx.fillRect(gx * tileSizePx, gz * tileSizePx, tileSizePx, tileSizePx);

        ctx.strokeStyle = '#a47148';
        ctx.lineWidth = 2;
        ctx.strokeRect(gx * tileSizePx, gz * tileSizePx, tileSizePx, tileSizePx);
      }
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.magFilter = THREE.NearestFilter;
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.55,
      metalness: 0.05
    });

    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    this.roomScene.add(floorMesh);

    // Grille de sélection pour le Mode Agencement
    this.gridHelper = new THREE.GridHelper(totalW, this.gridSize, 0xf59e0b, 0x5a3418);
    this.gridHelper.position.y = 0.02;
    this.gridHelper.visible = false;
    this.roomScene.add(this.gridHelper);

    // Murs Diorama
    const wallH = 4.2;
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xffeedb,
      roughness: 0.75
    });

    const northWall = new THREE.Mesh(new THREE.BoxGeometry(totalW + 0.4, wallH, 0.4), wallMat);
    northWall.position.set(0, wallH / 2, -this.halfRoom - 0.2);
    northWall.receiveShadow = true;
    this.roomScene.add(northWall);

    const westWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, wallH, totalW), wallMat);
    westWall.position.set(-this.halfRoom - 0.2, wallH / 2, 0);
    westWall.receiveShadow = true;
    this.roomScene.add(westWall);

    // Plinthe
    const skirtMat = new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.6 });
    const skirtN = new THREE.Mesh(new THREE.BoxGeometry(totalW + 0.4, 0.35, 0.45), skirtMat);
    skirtN.position.set(0, 0.175, -this.halfRoom - 0.2);
    this.roomScene.add(skirtN);

    const skirtW = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, totalW), skirtMat);
    skirtW.position.set(-this.halfRoom - 0.2, 0.175, 0);
    this.roomScene.add(skirtW);

    // Fenêtre
    const winGeo = new THREE.PlaneGeometry(2.4, 1.8);
    const winMat = new THREE.MeshBasicMaterial({ color: 0xffecc7 });
    const winMesh = new THREE.Mesh(winGeo, winMat);
    winMesh.position.set(-this.halfRoom - 0.01, 2.4, 0);
    winMesh.rotation.y = Math.PI / 2;
    this.roomScene.add(winMesh);

    // Tapis de porte d'entrée
    const doorMat = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.8 })
    );
    doorMat.rotation.x = -Math.PI / 2;
    doorMat.position.set(0, 0.015, this.halfRoom - 0.5);
    this.roomScene.add(doorMat);
  }

  loadSavedFurniture() {
    const saved = localStorage.getItem('bwed_apartment_furniture');
    let itemsToSpawn = [];

    if (saved) {
      try {
        itemsToSpawn = JSON.parse(saved);
      } catch (e) {
        itemsToSpawn = [];
      }
    }

    if (!saved || itemsToSpawn.length === 0) {
      itemsToSpawn = [
        { id: 'start_sofa', itemId: 'furn_brioche_sofa', gx: 2, gz: 3, rotY: 0, scale: 1.0 },
        { id: 'start_bench', itemId: 'furn_pretzel_bench', gx: 5, gz: 2, rotY: -Math.PI / 2, scale: 1.0 },
        { id: 'start_table', itemId: 'furn_waffle_table', gx: 2, gz: 2, rotY: 0, scale: 1.0 },
        { id: 'start_lamp', itemId: 'furn_honey_lamp', gx: 1, gz: 1, rotY: 0, scale: 1.0 },
        { id: 'start_crates', itemId: 'furn_bread_crates', gx: 6, gz: 6, rotY: 0.3, scale: 1.0 }
      ];
    }

    for (const f of itemsToSpawn) {
      this.spawnFurnitureMesh(f);
    }
  }

  saveFurnitureToStorage() {
    const serializable = this.placedFurniture.map(f => ({
      id: f.id,
      itemId: f.itemId,
      gx: f.gx,
      gz: f.gz,
      rotY: f.rotY,
      scale: f.scale || 1.0
    }));
    try {
      localStorage.setItem('bwed_apartment_furniture', JSON.stringify(serializable));
    } catch (e) {}
  }

  gridToRoomWorld(gx, gz) {
    return {
      x: (gx + 0.5) * this.tileSize - this.halfRoom,
      z: (gz + 0.5) * this.tileSize - this.halfRoom
    };
  }

  spawnFurnitureMesh(data) {
    const { itemId, gx, gz, rotY = 0, scale = 1.0 } = data;
    const pos = this.gridToRoomWorld(gx, gz);

    const group = new THREE.Group();
    group.position.set(pos.x, 0, pos.z);
    group.rotation.y = rotY;

    const record = {
      id: data.id || 'furn_' + Math.random().toString(36).substr(2, 9),
      itemId,
      gx,
      gz,
      rotY,
      scale,
      group
    };
    group.userData.furnitureRecord = record;

    const invItem = this.inventory?.items.find(i => i.id === itemId) || {
      name: 'Meuble',
      model: 'pretzel-bench.glb'
    };

    if (invItem.model && invItem.model.endsWith('.glb')) {
      const path = `./assets/props/${invItem.model}`;
      this.loader.load(path, (gltf) => {
        const mesh = gltf.scene.clone(true);
        mesh.scale.setScalar(0.7 * scale);
        mesh.position.y = 0;
        mesh.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
            c.userData.furnitureRecord = record;
          }
        });
        group.add(mesh);
        if (this.selectedPlacedFurniture?.id === record.id) {
          this.updateSelectionBox();
        }
      });
    } else {
      const boxGeo = new THREE.BoxGeometry(this.tileSize * 0.9 * scale, 0.65 * scale, this.tileSize * 0.9 * scale);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      boxMesh.position.y = (0.65 * scale) / 2;
      boxMesh.castShadow = true;
      boxMesh.userData.furnitureRecord = record;
      group.add(boxMesh);
    }

    this.roomScene.add(group);
    this.placedFurniture.push(record);
    if (gx >= 0 && gx < this.gridSize && gz >= 0 && gz < this.gridSize) {
      this.roomCollision[gz][gx] = true;
    }

    return record;
  }

  initInteractionRaycast(canvas) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updateMouseCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, this.roomCamera);
    };

    const onPointerMove = (e) => {
      if (!this.isOpen || !this.isBuildMode) return;
      updateMouseCoords(e);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      if (intersection) {
        const gx = Math.floor((intersection.x + this.halfRoom) / this.tileSize);
        const gz = Math.floor((intersection.z + this.halfRoom) / this.tileSize);

        if (gx >= 0 && gx < this.gridSize && gz >= 0 && gz < this.gridSize) {
          this.ghostGx = gx;
          this.ghostGz = gz;
          this.updateGhostPosition();
        }
      }
    };

    const onClick = (e) => {
      if (!this.isOpen || !this.isBuildMode) return;
      updateMouseCoords(e);
      this.handlePointerClick(raycaster);
    };

    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('click', onClick);
  }

  handlePointerClick(raycaster) {
    // 1. Raycast direct sur tous les meubles placés dans la pièce
    const furnitureMeshes = [];
    for (const f of this.placedFurniture) {
      f.group.traverse((c) => {
        if (c.isMesh) {
          c.userData.furnitureRecord = f;
          furnitureMeshes.push(c);
        }
      });
    }

    const hits = raycaster.intersectObjects(furnitureMeshes, false);

    // Si on a cliqué sur un meuble et qu'on n'est pas en train d'en déplacer un
    if (hits.length > 0 && !this.isMovingSelected) {
      const hitRecord = hits[0].object.userData.furnitureRecord;
      if (hitRecord) {
        this.selectPlacedFurniture(hitRecord);
        return;
      }
    }

    // 2. Si on est en mode "Déplacer le meuble sélectionné"
    if (this.isMovingSelected && this.selectedPlacedFurniture) {
      const isTargetOccupied = this.roomCollision[this.ghostGz]?.[this.ghostGx];
      const isSameCell = this.ghostGx === this.selectedPlacedFurniture.gx && this.ghostGz === this.selectedPlacedFurniture.gz;

      if (!isTargetOccupied || isSameCell) {
        // Libérer l'ancienne case
        this.roomCollision[this.selectedPlacedFurniture.gz][this.selectedPlacedFurniture.gx] = false;

        // Assigner la nouvelle case
        this.selectedPlacedFurniture.gx = this.ghostGx;
        this.selectedPlacedFurniture.gz = this.ghostGz;
        this.roomCollision[this.ghostGz][this.ghostGx] = true;

        const newPos = this.gridToRoomWorld(this.ghostGx, this.ghostGz);
        this.selectedPlacedFurniture.group.position.set(newPos.x, 0, newPos.z);
        this.updateSelectionBox();
        this.saveFurnitureToStorage();
        this.toggleMoveSelected(); // Fin du déplacement
        this.audio?.playBump?.();
        return;
      } else {
        this.audio?.playStep?.();
        return;
      }
    }

    // 3. Clic sur le sol pour poser un nouvel élément du catalogue
    const isOccupied = this.roomCollision[this.ghostGz]?.[this.ghostGx];
    if (!isOccupied && this.selectedItemToPlace) {
      this.audio?.playBump?.();
      const spawned = this.spawnFurnitureMesh({
        itemId: this.selectedItemToPlace.id,
        gx: this.ghostGx,
        gz: this.ghostGz,
        rotY: this.ghostRotY,
        scale: this.ghostScale || 1.0
      });
      this.saveFurnitureToStorage();
      this.profileManager?.recordFurniturePlaced?.();
      this.selectPlacedFurniture(spawned);
    } else if (!isOccupied && !this.selectedItemToPlace) {
      // Clic dans une case vide : désélectionner le meuble actuel
      this.deselectFurniture();
    }
  }

  selectPlacedFurniture(record) {
    if (!record) return;
    this.selectedPlacedFurniture = record;
    this.selectedItemToPlace = null;
    this.isMovingSelected = false;
    this.ghostRotY = record.rotY || 0;
    this.ghostScale = record.scale || 1.0;

    this.updateSelectionBox();

    // Remplissage de la carte inspecteur flottante
    const invItem = this.inventory?.items.find(i => i.id === record.itemId);
    const inspectCard = document.getElementById('apartmentInspectorCard');
    const inspectIcon = document.getElementById('inspectIcon');
    const inspectName = document.getElementById('inspectName');
    const inspectRarity = document.getElementById('inspectRarity');
    const moveBtnText = document.getElementById('inspectMoveBtnText');
    const moveBtn = document.getElementById('inspectMoveBtn');

    if (inspectCard) inspectCard.hidden = false;
    if (inspectIcon) inspectIcon.textContent = invItem?.icon || '🛋️';
    if (inspectName) inspectName.textContent = invItem?.name || 'Bwed Furniture';
    if (inspectRarity) inspectRarity.textContent = invItem?.teamDrop ? '🏆 Exclusive Team Drop' : '🛋️ Residence Furniture';
    if (moveBtnText) moveBtnText.textContent = 'Move';
    moveBtn?.classList.remove('active');

    // Mise à jour visuelle des puces d'échelle
    document.querySelectorAll('.scale-chip').forEach(b => {
      const sc = parseFloat(b.getAttribute('data-scale')) || 1.0;
      b.classList.toggle('active', Math.abs(sc - this.ghostScale) < 0.05);
    });

    // Désélection des puces du catalogue rapide
    document.querySelectorAll('.quick-furn-chip').forEach(c => c.classList.remove('active'));

    this.removeGhostMesh();
    this.audio?.playCoinCollect?.();
  }

  deselectFurniture() {
    this.selectedPlacedFurniture = null;
    this.isMovingSelected = false;
    if (this.selectionBoxHelper) {
      this.roomScene.remove(this.selectionBoxHelper);
      this.selectionBoxHelper.dispose();
      this.selectionBoxHelper = null;
    }
    const inspectCard = document.getElementById('apartmentInspectorCard');
    if (inspectCard) inspectCard.hidden = true;
    this.removeGhostMesh();
  }

  updateSelectionBox() {
    if (this.selectionBoxHelper) {
      this.roomScene.remove(this.selectionBoxHelper);
      this.selectionBoxHelper.dispose();
      this.selectionBoxHelper = null;
    }

    if (this.selectedPlacedFurniture?.group) {
      this.selectionBoxHelper = new THREE.BoxHelper(this.selectedPlacedFurniture.group, 0xf59e0b);
      this.selectionBoxHelper.material.depthTest = false;
      this.selectionBoxHelper.material.transparent = true;
      this.selectionBoxHelper.material.opacity = 0.95;
      this.roomScene.add(this.selectionBoxHelper);
    }
  }

  toggleMoveSelected() {
    if (!this.selectedPlacedFurniture) return;
    this.isMovingSelected = !this.isMovingSelected;
    const moveBtnText = document.getElementById('inspectMoveBtnText');
    const moveBtn = document.getElementById('inspectMoveBtn');

    if (this.isMovingSelected) {
      if (moveBtnText) moveBtnText.textContent = 'Place Here';
      moveBtn?.classList.add('active');
      this.ghostScale = this.selectedPlacedFurniture.scale || 1.0;
      this.ghostRotY = this.selectedPlacedFurniture.rotY || 0;
      this.createGhostMesh();
      this.updateGhostPosition();
      this.audio?.playStep?.();
    } else {
      if (moveBtnText) moveBtnText.textContent = 'Move';
      moveBtn?.classList.remove('active');
      this.removeGhostMesh();
    }
  }

  toggleBuildMode(forceState) {
    this.isBuildMode = forceState !== undefined ? forceState : !this.isBuildMode;

    const dock = document.getElementById('apartmentBuildDock');
    const btnText = document.getElementById('aptBuildBtnText');
    const btn = document.getElementById('aptBuildModeBtn');

    if (dock) dock.hidden = !this.isBuildMode;
    if (this.gridHelper) this.gridHelper.visible = this.isBuildMode;

    if (btnText) {
      btnText.textContent = this.isBuildMode ? 'Exit Layout' : 'Room Layout';
    }
    if (btn) {
      if (this.isBuildMode) btn.classList.add('active');
      else btn.classList.remove('active');
    }

    if (this.isBuildMode) {
      this.audio?.playCoinCollect?.();
      this.renderQuickFurnitureBar();
    } else {
      this.deselectFurniture();
      this.selectedItemToPlace = null;
      this.saveFurnitureToStorage();
    }
  }

  createGhostMesh() {
    this.removeGhostMesh();

    const s = this.ghostScale || 1.0;
    const geo = new THREE.BoxGeometry(this.tileSize * 0.9 * s, 0.7 * s, this.tileSize * 0.9 * s);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.55,
      wireframe: true
    });
    this.ghostMesh = new THREE.Mesh(geo, mat);
    this.ghostMesh.position.y = (0.7 * s) / 2;
    this.ghostMesh.rotation.y = this.ghostRotY;
    this.roomScene.add(this.ghostMesh);

    this.updateGhostPosition();
  }

  removeGhostMesh() {
    if (this.ghostMesh) {
      this.roomScene.remove(this.ghostMesh);
      this.ghostMesh.geometry.dispose();
      this.ghostMesh.material.dispose();
      this.ghostMesh = null;
    }
  }

  rotateActive() {
    this.ghostRotY += Math.PI / 2;
    if (this.ghostMesh) {
      this.ghostMesh.rotation.y = this.ghostRotY;
    }

    // Si un meuble existant est sélectionné, le pivoter en direct !
    if (this.selectedPlacedFurniture) {
      this.selectedPlacedFurniture.rotY = this.ghostRotY;
      this.selectedPlacedFurniture.group.rotation.y = this.ghostRotY;
      this.updateSelectionBox();
      this.saveFurnitureToStorage();
    }

    this.audio?.playStep?.();
  }

  setScaleActive(newScale) {
    this.ghostScale = newScale;

    // Recréer le fantôme avec la nouvelle taille si actif
    if (this.ghostMesh) {
      this.createGhostMesh();
    }

    // Si un meuble existant est sélectionné, changer sa taille en direct !
    if (this.selectedPlacedFurniture) {
      this.selectedPlacedFurniture.scale = newScale;
      this.selectedPlacedFurniture.group.scale.setScalar(newScale);
      this.updateSelectionBox();
      this.saveFurnitureToStorage();
    }

    this.audio?.playCoinCollect?.();
  }

  updateGhostPosition() {
    if (!this.ghostMesh) return;
    const pos = this.gridToRoomWorld(this.ghostGx, this.ghostGz);
    this.ghostMesh.position.x = pos.x;
    this.ghostMesh.position.z = pos.z;

    const isOccupied = this.roomCollision[this.ghostGz]?.[this.ghostGx];
    const isSelf = this.selectedPlacedFurniture &&
      this.selectedPlacedFurniture.gx === this.ghostGx &&
      this.selectedPlacedFurniture.gz === this.ghostGz;

    this.ghostMesh.material.color.setHex((isOccupied && !isSelf) ? 0xef4444 : 0x10b981);
  }

  pickupSelectedFurniture() {
    if (!this.selectedPlacedFurniture) return;

    const index = this.placedFurniture.findIndex(f => f.id === this.selectedPlacedFurniture.id);
    if (index !== -1) {
      const removed = this.placedFurniture.splice(index, 1)[0];
      this.roomScene.remove(removed.group);
      removed.group.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
      });
      this.roomCollision[removed.gz][removed.gx] = false;
      this.deselectFurniture();
      this.audio?.playStep?.();
      this.saveFurnitureToStorage();
    }
  }

  clearAllFurniture() {
    if (this.placedFurniture.length === 0) return;
    if (!confirm('Do you want to stash all furniture from your apartment back into your backpack?')) return;

    for (const f of this.placedFurniture) {
      this.roomScene.remove(f.group);
      f.group.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
      });
    }

    this.placedFurniture = [];
    this.roomCollision = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(false));
    this.deselectFurniture();
    this.saveFurnitureToStorage();
    this.audio?.playStep?.();
  }

  renderQuickFurnitureBar() {
    const bar = document.getElementById('buildQuickFurnitureBar');
    if (!bar || !this.inventory) return;

    bar.innerHTML = '';
    const allItems = this.inventory.items || [];
    let filtered = [];

    if (this.catalogCategory === 'furniture') {
      filtered = allItems.filter(i => i.category === 'furniture');
    } else if (this.catalogCategory === 'drops') {
      filtered = allItems.filter(i => i.teamDrop || i.category === 'trophy' || i.rarity === 'LEGENDARY');
    } else {
      filtered = allItems.filter(i => i.type === 'furniture' || i.category === 'furniture' || i.teamDrop);
    }

    if (filtered.length === 0) {
      bar.innerHTML = '<div style="color: #fed7aa; font-family: Fredoka, sans-serif; font-size: 13px; padding: 6px;">No furniture found in this category.</div>';
      return;
    }

    for (const item of filtered) {
      const isSelected = this.selectedItemToPlace?.id === item.id;
      const chip = document.createElement('button');
      chip.className = `quick-furn-chip ${isSelected ? 'active' : ''}`;
      chip.type = 'button';
      chip.innerHTML = `<span>${item.icon || '🛋️'}</span> <strong>${item.name}</strong>`;

      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedItemToPlace = item;
        this.deselectFurniture();
        document.querySelectorAll('.quick-furn-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.createGhostMesh();
      });

      bar.appendChild(chip);
    }
  }

  // --- CONTRÔLEUR DE DÉPLACEMENT DU JOUEUR (CONTINU & FLUIDE) ---
  updatePlayerMovement(delta) {
    if (this.isMoving) {
      this.moveTimer += delta;
      const t = Math.min(this.moveTimer / this.moveDuration, 1.0);

      this.playerWorldPos.lerpVectors(this.startWorldPos, this.targetWorldPos, t);
      if (this.roomPlayerAvatar) {
        this.roomPlayerAvatar.rootGroup.position.copy(this.playerWorldPos);
        this.roomPlayerAvatar.updateAnimation(delta, 'walk', 1.0);
      }

      if (t >= 1.0) {
        this.isMoving = false;
        this.playerGx = this.targetGx;
        this.playerGz = this.targetGz;
        this.playerWorldPos.copy(this.targetWorldPos);
      }
      return;
    }

    // Si le joueur ne bouge pas, vérifier les touches pressées
    let dx = 0;
    let dz = 0;

    if (this.keys.up) {
      dz = -1;
      this.playerFacing = 'north';
    } else if (this.keys.down) {
      dz = 1;
      this.playerFacing = 'south';
    } else if (this.keys.left) {
      dx = -1;
      this.playerFacing = 'west';
    } else if (this.keys.right) {
      dx = 1;
      this.playerFacing = 'east';
    }

    if (dx !== 0 || dz !== 0) {
      const nextGx = this.playerGx + dx;
      const nextGz = this.playerGz + dz;

      // Rotation vers la direction
      this.updatePlayerFacing();

      // Vérifier les limites de la pièce et les collisions
      if (nextGx >= 0 && nextGx < this.gridSize && nextGz >= 0 && nextGz < this.gridSize) {
        if (!this.roomCollision[nextGz][nextGx]) {
          this.targetGx = nextGx;
          this.targetGz = nextGz;
          this.isMoving = true;
          this.moveTimer = 0;

          const startP = this.gridToRoomWorld(this.playerGx, this.playerGz);
          const targetP = this.gridToRoomWorld(this.targetGx, this.targetGz);
          this.startWorldPos.set(startP.x, 0, startP.z);
          this.targetWorldPos.set(targetP.x, 0, targetP.z);

          this.audio?.playStep?.();
        } else {
          this.audio?.playBump?.();
        }
      }
    } else {
      if (this.roomPlayerAvatar) {
        this.roomPlayerAvatar.updateAnimation(delta, 'idle', 0);
      }
    }
  }

  updatePlayerFacing() {
    if (!this.roomPlayerAvatar) return;
    const facingAngles = { north: Math.PI, south: 0, east: Math.PI / 2, west: -Math.PI / 2 };
    this.roomPlayerAvatar.rootGroup.rotation.y = facingAngles[this.playerFacing] || 0;
  }

  open(avatarId, itemToPlace = null) {
    if (avatarId) this.playerAvatarId = avatarId;

    // Pause le moteur de la ville pour ne pas calculer 2 scènes 3D en même temps (garde le Mac frais)
    if (this.mainEngine) {
      this.mainEngine.stop();
    }

    if (this.overlayEl) {
      this.overlayEl.style.display = 'flex';
      this.overlayEl.hidden = false;
    }
    this.isOpen = true;
    this.clock.start();

    // Réinitialisation des touches
    this.keys.up = false;
    this.keys.down = false;
    this.keys.left = false;
    this.keys.right = false;

    if (!this.roomScene) {
      this.initThreeScene();
    }

    // Instanciation de l'avatar du joueur dans l'appartement
    if (!this.roomPlayerAvatar || this.roomPlayerAvatar.avatarId !== this.playerAvatarId) {
      if (this.roomPlayerAvatar) {
        this.roomScene.remove(this.roomPlayerAvatar.rootGroup);
      }
      this.roomPlayerAvatar = new AvatarModel(this.playerAvatarId);
      this.roomScene.add(this.roomPlayerAvatar.rootGroup);
    }

    const pos = this.gridToRoomWorld(this.playerGx, this.playerGz);
    this.playerWorldPos.set(pos.x, 0, pos.z);
    this.roomPlayerAvatar.rootGroup.position.copy(this.playerWorldPos);
    this.updatePlayerFacing();

    if (itemToPlace) {
      this.toggleBuildMode(true);
      this.selectedItemToPlace = itemToPlace;
      this.createGhostMesh();
    }

    this.startLoop();
  }

  close() {
    if (this.overlayEl) {
      this.overlayEl.style.display = 'none';
      this.overlayEl.hidden = true;
    }
    this.isOpen = false;
    this.toggleBuildMode(false);

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    // Reprend le rendu de la ville
    if (this.mainEngine) {
      this.mainEngine.start();
    }

    if (this.onExitCallback) {
      this.onExitCallback();
    }
  }

  startLoop() {
    const frameInterval = 1000 / 30; // 30 FPS cap
    let lastTime = performance.now();

    const loop = (now = performance.now()) => {
      if (!this.isOpen) return;
      this.animFrameId = requestAnimationFrame(loop);

      if (document.hidden) return; // Freeze when tab is hidden

      const elapsed = now - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = now - (elapsed % frameInterval);

      const delta = Math.min(this.clock.getDelta(), 0.1);

      // Déplacement fluide de l'avatar dans la pièce
      this.updatePlayerMovement(delta);

      if (this.roomRenderer && this.roomScene && this.roomCamera) {
        this.roomRenderer.render(this.roomScene, this.roomCamera);
      }
    };

    loop();
  }
}
