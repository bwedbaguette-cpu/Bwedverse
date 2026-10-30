import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ==========================================================================
   IN-BROWSER 3D WORLD BUILDER & PROPS PALETTE — BWED WORLD
   - Visual prop category tray with cards and active states
   - Real-time raycast placement with ghost cursor on terrain
   - Precision inspector: XYZ nudge, 45/90 deg rotation, scale & clone
   - Automatic browser storage persistence and JSON file export
   ========================================================================== */

export class WorldEditor {
  static gltfCache = new Map();

  constructor(options = {}) {
    this.scene = options.scene;
    this.camera = options.camera;
    this.world = options.world;
    this.physics = options.physics;

    this.loader = new GLTFLoader();
    this.isEnabled = false;
    this.selectedObject = null;
    this.currentTool = 'select'; // 'select', 'place', 'delete'
    this.selectedPropId = 'pistachio-tree';
    this.activeCategory = 'all';

    // Throttled pointermove variables
    this.pointerMoveEvent = null;
    this.pointerMoveRafPending = false;

    // Prop definitions catalog with GLB and ultra-light procedural assets
    this.catalog = [
      { id: 'bakery-house', name: 'Bakery House', category: 'buildings', tag: 'GLB', scale: 1.25, rotY: 0, radius: 5.2 },
      { id: 'honey-cafe', name: 'Honey Cafe', category: 'buildings', tag: 'GLB', scale: 1.25, rotY: 0, radius: 5.2 },
      { id: 'teacup-gazebo', name: 'Teacup Gazebo', category: 'buildings', tag: 'GLB', scale: 1.15, rotY: 0, radius: 3.2 },
      { id: 'waffle-tower', name: 'Waffle Tower', category: 'buildings', tag: 'GLB', scale: 1.1, rotY: 0, radius: 2.6 },
      { id: 'arcade-duel', name: 'Arcade Duel', category: 'buildings', tag: 'GLB', scale: 1.15, rotY: 0, radius: 1.5 },
      { id: 'pistachio-tree', name: 'Pistachio Tree', category: 'nature', tag: 'GLB', scale: 1.1, rotY: 0, radius: 1.4 },
      { id: 'pastry-tree', name: 'Matcha Pine', category: 'nature', tag: 'Procedural', scale: 1.1, rotY: 0, radius: 1.2 },
      { id: 'butter-bush', name: 'Butter Bush', category: 'nature', tag: 'Procedural', scale: 1.0, rotY: 0, radius: 0.8 },
      { id: 'chocolate-boulder', name: 'Cocoa Boulder', category: 'nature', tag: 'Procedural', scale: 1.2, rotY: 0, radius: 1.3 },
      { id: 'sugar-crystal', name: 'Sugar Crystal', category: 'nature', tag: 'Procedural', scale: 1.1, rotY: 0, radius: 0.8 },
      { id: 'pretzel-bench', name: 'Pretzel Bench', category: 'props', tag: 'GLB', scale: 1.2, rotY: 0, radius: 1.2 },
      { id: 'macaron-stool', name: 'Macaron Stool', category: 'props', tag: 'Procedural', scale: 1.1, rotY: 0, radius: 0.9 },
      { id: 'procedural-lantern', name: 'Pastry Lantern', category: 'props', tag: 'Procedural', scale: 1.1, rotY: 0, radius: 0.6 },
      { id: 'honey-lantern', name: 'Honey Lantern', category: 'props', tag: 'GLB', scale: 1.15, rotY: 0, radius: 0.6 },
      { id: 'marshmallow-campfire', name: 'Campfire', category: 'props', tag: 'GLB', scale: 1.1, rotY: 0, radius: 1.4 },
      { id: 'hazelnut-cup', name: 'Hazelnut Cup', category: 'props', tag: 'GLB', scale: 0.65, rotY: 0, radius: 0.5 },
      { id: 'golden-croissant', name: 'Golden Croissant', category: 'props', tag: 'GLB', scale: 0.9, rotY: 0, radius: 1.6 },
      { id: 'golden-bloom', name: 'Golden Bloom', category: 'props', tag: 'GLB', scale: 0.8, rotY: 0, radius: 1.2 },
      { id: 'bwed-dice', name: 'Bwed Dice', category: 'props', tag: 'GLB', scale: 1.8, rotY: 0, radius: 1.1 },
      { id: 'churro-coaster', name: 'Churro Coaster', category: 'buildings', tag: 'Ride', scale: 1.1, rotY: 0, radius: 4.5 },
      { id: 'snack-cart', name: 'Snack Cart', category: 'props', tag: 'GLB', scale: 1.1, rotY: 0, radius: 1.6 },
      { id: 'waffle-submarine', name: 'Waffle Submarine', category: 'props', tag: 'Vehicle', scale: 1.1, rotY: 0, radius: 2.2 },
      { id: 'croissant-ram', name: 'Croissant Ram', category: 'nature', tag: 'Creature', scale: 1.1, rotY: 0, radius: 1.8 },
      { id: 'pistachio-glow', name: 'Pistachio Glow', category: 'nature', tag: 'GLB', scale: 1.1, rotY: 0, radius: 1.2 },
      { id: 'bread-cubes', name: 'Bread Cubes', category: 'props', tag: 'GLB', scale: 1.1, rotY: 0, radius: 1.4 },
      { id: 'crimson-tree', name: 'Crimson Tree', category: 'nature', tag: 'GLB', scale: 1.1, rotY: 0, radius: 1.4 },
      { id: 'cosmic-blocks', name: 'Cosmic Blocks', category: 'props', tag: 'GLB', scale: 1.1, rotY: 0, radius: 1.5 },
      { id: 'treasure-chest', name: 'Treasure Chest', category: 'props', tag: 'GLB', scale: 1.0, rotY: 0, radius: 1.2 },
      { id: 'pastry-dessert', name: 'Pastry Dessert', category: 'props', tag: 'GLB', scale: 1.0, rotY: 0, radius: 1.2 }
    ];

    // Placed objects registry
    this.placedProps = [];

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 3D visual selection ring
    this.selectionRing = null;
    this.buildSelectionRing();

    // 3D placement ghost cursor
    this.ghostCursor = null;
    this.buildGhostCursor();

    // DOM UI elements
    this.dom = {
      editorBtn: document.getElementById('toggleEditorBtn'),
      editorBar: document.getElementById('worldEditorBar'),
      closeEditorBtn: document.getElementById('closeEditorBtn'),
      propTray: document.getElementById('editorPropTray'),

      toolSelectBtn: document.getElementById('toolSelectBtn'),
      toolPlaceBtn: document.getElementById('toolPlaceBtn'),
      toolDeleteBtn: document.getElementById('toolDeleteBtn'),

      exportJsonBtn: document.getElementById('exportLayoutBtn'),
      saveLocalBtn: document.getElementById('saveLayoutBtn'),
      resetLayoutBtn: document.getElementById('resetLayoutBtn'),

      // Inspector
      inspector: document.getElementById('editorInspector'),
      inspectorTitle: document.getElementById('inspectorPropTitle'),
      inspectorCoords: document.getElementById('inspectorCoords'),
      inspectorRot: document.getElementById('inspectorRot'),
      inspectorScale: document.getElementById('inspectorScale'),
      btnMoveLeft: document.getElementById('inspBtnMoveLeft'),
      btnMoveRight: document.getElementById('inspBtnMoveRight'),
      btnMoveUp: document.getElementById('inspBtnMoveUp'),
      btnMoveDown: document.getElementById('inspBtnMoveDown'),
      btnRotate: document.getElementById('inspBtnRotate'),
      btnRotate90: document.getElementById('inspBtnRotate90'),
      btnScaleUp: document.getElementById('inspBtnScaleUp'),
      btnScaleReset: document.getElementById('inspBtnScaleReset'),
      btnScaleDown: document.getElementById('inspBtnScaleDown'),
      btnClone: document.getElementById('inspBtnClone'),
      btnDeleteSelected: document.getElementById('inspBtnDelete')
    };

    this.initEvents();
    this.buildPropTray();
    this.loadSavedLayout();
  }

  buildSelectionRing() {
    const geo = new THREE.RingGeometry(1.4, 1.7, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffd15a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthTest: false
    });
    this.selectionRing = new THREE.Mesh(geo, mat);
    this.selectionRing.rotation.x = -Math.PI / 2;
    this.selectionRing.position.y = 0.08;
    this.selectionRing.visible = false;
    this.scene.add(this.selectionRing);
  }

  buildGhostCursor() {
    const geo = new THREE.RingGeometry(0.8, 1.1, 28);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
      depthTest: false
    });
    this.ghostCursor = new THREE.Mesh(geo, mat);
    this.ghostCursor.rotation.x = -Math.PI / 2;
    this.ghostCursor.position.y = 0.06;
    this.ghostCursor.visible = false;
    this.scene.add(this.ghostCursor);
  }

  initEvents() {
    this.dom.editorBtn?.addEventListener('click', () => {
      this.toggleEditor();
    });

    this.dom.closeEditorBtn?.addEventListener('click', () => {
      this.toggleEditor(false);
    });

    this.dom.toolSelectBtn?.addEventListener('click', () => this.setTool('select'));
    this.dom.toolPlaceBtn?.addEventListener('click', () => this.setTool('place'));
    this.dom.toolDeleteBtn?.addEventListener('click', () => this.setTool('delete'));

    // Category filter tabs
    document.querySelectorAll('.editor-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.editor-cat-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-cat') || 'all';
        this.buildPropTray();
      });
    });

    this.dom.exportJsonBtn?.addEventListener('click', () => this.exportLayoutJSON());
    this.dom.saveLocalBtn?.addEventListener('click', () => this.saveToLocalStorage());
    this.dom.resetLayoutBtn?.addEventListener('click', () => this.resetToDefaultLayout());

    // Inspector controls
    this.dom.btnMoveLeft?.addEventListener('click', () => this.nudgeSelected(-0.5, 0));
    this.dom.btnMoveRight?.addEventListener('click', () => this.nudgeSelected(0.5, 0));
    this.dom.btnMoveUp?.addEventListener('click', () => this.nudgeSelected(0, -0.5));
    this.dom.btnMoveDown?.addEventListener('click', () => this.nudgeSelected(0, 0.5));

    this.dom.btnRotate?.addEventListener('click', () => this.rotateSelected(Math.PI / 4));
    this.dom.btnRotate90?.addEventListener('click', () => this.rotateSelected(Math.PI / 2));

    this.dom.btnScaleUp?.addEventListener('click', () => this.scaleSelected(0.1));
    this.dom.btnScaleReset?.addEventListener('click', () => this.resetSelectedScale());
    this.dom.btnScaleDown?.addEventListener('click', () => this.scaleSelected(-0.1));

    this.dom.btnClone?.addEventListener('click', () => this.cloneSelected());
    this.dom.btnDeleteSelected?.addEventListener('click', () => this.deleteSelected());

    // Viewport pointer events with requestAnimationFrame throttling
    window.addEventListener('pointermove', (e) => {
      if (!this.isEnabled || this.currentTool !== 'place') return;
      this.pointerMoveEvent = e;
      if (!this.pointerMoveRafPending) {
        this.pointerMoveRafPending = true;
        requestAnimationFrame(() => {
          this.pointerMoveRafPending = false;
          if (this.pointerMoveEvent && this.isEnabled && this.currentTool === 'place') {
            this.handlePointerMove(this.pointerMoveEvent);
          }
        });
      }
    });

    window.addEventListener('pointerdown', (e) => {
      if (!this.isEnabled) return;

      const target = e.target;
      if (
        target.closest('.hud-layer') ||
        target.closest('.modal-overlay') ||
        target.closest('.world-editor-dock') ||
        target.closest('.chat-container')
      ) {
        return;
      }

      this.handlePointerDown(e);
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'v' || e.key === 'V') {
        this.setTool('select');
      } else if (e.key === 'b' || e.key === 'B') {
        this.setTool('place');
      } else if (e.key === 'x' || e.key === 'X') {
        this.setTool('delete');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.selectedObject) {
          e.preventDefault();
          this.deleteSelected();
        }
      } else if (e.key === 'ArrowLeft') {
        if (this.selectedObject) {
          e.preventDefault();
          this.nudgeSelected(-0.5, 0);
        }
      } else if (e.key === 'ArrowRight') {
        if (this.selectedObject) {
          e.preventDefault();
          this.nudgeSelected(0.5, 0);
        }
      } else if (e.key === 'ArrowUp') {
        if (this.selectedObject) {
          e.preventDefault();
          this.nudgeSelected(0, -0.5);
        }
      } else if (e.key === 'ArrowDown') {
        if (this.selectedObject) {
          e.preventDefault();
          this.nudgeSelected(0, 0.5);
        }
      }
    });
  }

  toggleEditor(forceState = null) {
    this.isEnabled = forceState !== null ? forceState : !this.isEnabled;

    if (this.dom.editorBar) {
      this.dom.editorBar.hidden = !this.isEnabled;
    }
    if (this.dom.editorBtn) {
      this.dom.editorBtn.classList.toggle('active', this.isEnabled);
      this.dom.editorBtn.innerHTML = this.isEnabled ? '<span>Exit Editor</span>' : '<span>World Editor</span>';
    }

    if (!this.isEnabled) {
      this.deselect();
      if (this.ghostCursor) this.ghostCursor.visible = false;
    } else {
      if (this.currentTool === 'place' && this.ghostCursor) {
        this.ghostCursor.visible = true;
      }
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    this.dom.toolSelectBtn?.classList.toggle('active', tool === 'select');
    this.dom.toolPlaceBtn?.classList.toggle('active', tool === 'place');
    this.dom.toolDeleteBtn?.classList.toggle('active', tool === 'delete');

    if (this.ghostCursor) {
      this.ghostCursor.visible = this.isEnabled && tool === 'place';
    }

    if (tool !== 'select') {
      this.deselect();
    }
  }

  buildPropTray() {
    if (!this.dom.propTray) return;
    this.dom.propTray.innerHTML = '';

    const filtered = this.catalog.filter((p) => {
      if (this.activeCategory === 'all') return true;
      return p.category === this.activeCategory;
    });

    filtered.forEach((prop) => {
      const card = document.createElement('button');
      card.className = `editor-prop-card ${prop.id === this.selectedPropId ? 'active' : ''}`;
      card.type = 'button';
      card.title = `${prop.name} (${prop.tag})`;

      card.innerHTML = `
        <span class="prop-card-badge">${prop.tag}</span>
        <span class="prop-card-name">${prop.name}</span>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.editor-prop-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedPropId = prop.id;
        this.setTool('place');

        if (this.ghostCursor) {
          const r = prop.radius || 1.2;
          this.ghostCursor.scale.set(r, r, 1);
        }
      });

      this.dom.propTray.appendChild(card);
    });
  }

  handlePointerMove(e) {
    if (this.currentTool !== 'place' || !this.ghostCursor) return;

    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const groundMesh = this.world?.groundMesh;
    if (!groundMesh) return;

    const intersects = this.raycaster.intersectObject(groundMesh, false);
    if (intersects.length > 0) {
      const pt = intersects[0].point;
      this.ghostCursor.position.set(pt.x, 0.06, pt.z);
      this.ghostCursor.visible = true;
    } else {
      this.ghostCursor.visible = false;
    }
  }

  handlePointerDown(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.currentTool === 'place') {
      const groundMesh = this.world?.groundMesh;
      if (!groundMesh) return;

      const intersects = this.raycaster.intersectObject(groundMesh, false);
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        const propDef = this.catalog.find((p) => p.id === this.selectedPropId);
        const scale = propDef?.scale || 1.0;
        this.spawnProp(this.selectedPropId, pt.x, pt.z, 0, scale);
      }
      return;
    }

    // Raycast on placed props
    const propGroups = this.placedProps.map((p) => p.group).filter(Boolean);
    const intersects = this.raycaster.intersectObjects(propGroups, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      const propEntry = this.findPropEntryByChild(hitObj);

      if (propEntry) {
        if (this.currentTool === 'delete') {
          this.deleteProp(propEntry);
        } else {
          this.selectProp(propEntry);
        }
      }
    } else {
      if (this.currentTool === 'select') {
        this.deselect();
      }
    }
  }

  findPropEntryByChild(child) {
    let curr = child;
    while (curr) {
      const found = this.placedProps.find((p) => p.group === curr);
      if (found) return found;
      curr = curr.parent;
    }
    return null;
  }

  selectProp(entry) {
    this.selectedObject = entry;

    if (this.selectionRing) {
      this.selectionRing.visible = true;
      this.selectionRing.position.set(entry.x, 0.08, entry.z);
      this.selectionRing.scale.setScalar(entry.radius || 1.4);
    }

    if (this.dom.inspector) {
      this.dom.inspector.hidden = false;
      this.updateInspectorUI();
    }
  }

  deselect() {
    this.selectedObject = null;
    if (this.selectionRing) this.selectionRing.visible = false;
    if (this.dom.inspector) this.dom.inspector.hidden = true;
  }

  updateInspectorUI() {
    const p = this.selectedObject;
    if (!p) return;

    const def = this.catalog.find((c) => c.id === p.type);
    const title = def?.name || p.type;

    if (this.dom.inspectorTitle) this.dom.inspectorTitle.textContent = title;
    if (this.dom.inspectorCoords) {
      this.dom.inspectorCoords.textContent = `X: ${p.x.toFixed(1)} &middot; Z: ${p.z.toFixed(1)}`;
    }
    if (this.dom.inspectorRot) {
      const deg = Math.round((p.rotY * 180) / Math.PI) % 360;
      this.dom.inspectorRot.textContent = `Rot: ${deg}°`;
    }
    if (this.dom.inspectorScale) {
      this.dom.inspectorScale.textContent = `Scale: ${p.scale.toFixed(2)}x`;
    }
  }

  nudgeSelected(dx, dz) {
    if (!this.selectedObject) return;
    this.selectedObject.x = Number((this.selectedObject.x + dx).toFixed(2));
    this.selectedObject.z = Number((this.selectedObject.z + dz).toFixed(2));
    this.selectedObject.group.position.set(this.selectedObject.x, 0, this.selectedObject.z);
    this.selectionRing.position.set(this.selectedObject.x, 0.08, this.selectedObject.z);
    this.updateInspectorUI();
  }

  rotateSelected(dRot) {
    if (!this.selectedObject) return;
    this.selectedObject.rotY = (this.selectedObject.rotY + dRot) % (Math.PI * 2);
    this.selectedObject.group.rotation.y = this.selectedObject.rotY;
    this.updateInspectorUI();
  }

  scaleSelected(dScale) {
    if (!this.selectedObject) return;
    const newScale = Math.max(0.3, Math.min(3.5, this.selectedObject.scale + dScale));
    this.selectedObject.scale = Number(newScale.toFixed(2));
    this.selectedObject.group.scale.setScalar(this.selectedObject.scale);
    this.selectionRing.scale.setScalar(this.selectedObject.radius * this.selectedObject.scale);
    this.updateInspectorUI();
  }

  resetSelectedScale() {
    if (!this.selectedObject) return;
    const def = this.catalog.find((c) => c.id === this.selectedObject.type);
    const defaultScale = def?.scale || 1.0;
    this.selectedObject.scale = defaultScale;
    this.selectedObject.group.scale.setScalar(defaultScale);
    this.selectionRing.scale.setScalar(this.selectedObject.radius * defaultScale);
    this.updateInspectorUI();
  }

  cloneSelected() {
    if (!this.selectedObject) return;
    const p = this.selectedObject;
    this.spawnProp(p.type, p.x + 1.2, p.z + 1.2, p.rotY, p.scale);
  }

  deleteSelected() {
    if (!this.selectedObject) return;
    this.deleteProp(this.selectedObject);
  }

  deleteProp(entry) {
    const idx = this.placedProps.indexOf(entry);
    if (idx !== -1) {
      this.scene.remove(entry.group);
      entry.group.traverse((c) => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          if (Array.isArray(c.material)) c.material.forEach((m) => m.dispose());
          else c.material.dispose();
        }
      });
      this.placedProps.splice(idx, 1);
    }
    this.deselect();
  }

  spawnProp(type, x, z, rotY = 0, scale = 1.0) {
    const id = 'prop_' + Math.random().toString(36).substr(2, 9);
    const container = new THREE.Group();
    container.position.set(x, 0, z);
    container.rotation.y = rotY;
    container.scale.setScalar(scale);
    this.scene.add(container);

    const def = this.catalog.find((p) => p.id === type);
    const radius = (def?.radius || 1.2) * scale;

    const propEntry = {
      id,
      type,
      x: Number(x.toFixed(2)),
      y: 0,
      z: Number(z.toFixed(2)),
      rotY: Number(rotY.toFixed(2)),
      scale: Number(scale.toFixed(2)),
      radius,
      group: container
    };

    this.loadPropVisual(type, container);
    this.placedProps.push(propEntry);

    if (this.physics && radius > 0) {
      this.physics.addObstacle(x, z, radius);
    }

    this.selectProp(propEntry);
    return propEntry;
  }

  loadPropVisual(type, container) {
    const glbMap = {
      'bakery-house': { url: './assets/props/bakery-house.glb', scale: 1.0 },
      'honey-cafe': { url: './assets/props/honey-cafe.glb', scale: 1.0 },
      'teacup-gazebo': { url: './assets/props/teacup-gazebo.glb', scale: 1.0 },
      'waffle-tower': { url: './assets/props/waffle-tower.glb', scale: 1.0 },
      'arcade-duel': { url: './assets/props/arcade-duel.glb', scale: 1.0 },
      'pistachio-tree': { url: './assets/props/pistachio-tree.glb', scale: 1.0 },
      'pretzel-bench': { url: './assets/props/pretzel-bench.glb', scale: 1.0 },
      'honey-lantern': { url: './assets/props/honey-lantern.glb', scale: 1.0 },
      'marshmallow-campfire': { url: './assets/props/marshmallow-campfire.glb', scale: 1.0 },
      'hazelnut-cup': { url: './assets/props/hazelnut-cup.glb', scale: 0.8 },
      'golden-croissant': { url: './assets/props/golden-croissant.glb', scale: 0.9 },
      'golden-bloom': { url: './assets/props/golden-bloom.glb', scale: 0.8 },
      'bwed-dice': { url: './assets/props/bwed-dice.glb', scale: 1.5 },
      'churro-coaster': { url: './assets/props/churro-coaster.glb', scale: 1.1 },
      'snack-cart': { url: './assets/props/snack-cart.glb', scale: 1.1 },
      'waffle-submarine': { url: './assets/props/waffle-submarine.glb', scale: 1.1 },
      'croissant-ram': { url: './assets/props/croissant-ram.glb', scale: 1.1 },
      'pistachio-glow': { url: './assets/props/pistachio-glow.glb', scale: 1.1 },
      'bread-cubes': { url: './assets/props/bread-cubes.glb', scale: 1.1 },
      'crimson-tree': { url: './assets/props/crimson-tree.glb', scale: 1.1 },
      'cosmic-blocks': { url: './assets/props/cosmic-blocks.glb', scale: 1.1 },
      'treasure-chest': { url: './assets/props/treasure-chest.glb', scale: 1.0 },
      'pastry-dessert': { url: './assets/props/pastry-dessert.glb', scale: 1.0 }
    };

    if (glbMap[type]) {
      const cfg = glbMap[type];

      const applyModel = (sourceScene) => {
        const m = sourceScene.clone(true);
        m.scale.setScalar(cfg.scale);
        m.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });
        container.add(m);
      };

      // Memory optimization: reuse cached GLTF hierarchy to avoid re-fetching and parsing heavy assets
      if (WorldEditor.gltfCache.has(cfg.url)) {
        applyModel(WorldEditor.gltfCache.get(cfg.url));
        return;
      }

      this.loader.load(
        cfg.url,
        (gltf) => {
          WorldEditor.gltfCache.set(cfg.url, gltf.scene);
          applyModel(gltf.scene);
        },
        undefined,
        () => {
          const mat = new THREE.MeshStandardMaterial({ color: 0xffd15a, roughness: 0.5 });
          const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12), mat);
          mesh.position.y = 0.6;
          container.add(mesh);
        }
      );
      return;
    }

    // Lightweight procedural assets (shared geometries & materials for near-zero GPU overhead)
    if (type === 'pastry-tree') {
      this.world?.buildPastryTree(container, 0, 0, 1.0, 0x4a7c35);
    } else if (type === 'chocolate-boulder') {
      this.world?.buildChocolateBoulder(container, 0, 0, 1.0);
    } else if (type === 'macaron-stool') {
      this.world?.buildMacaronStool(container, 0, 0, 1.0);
    } else if (type === 'procedural-lantern') {
      this.world?.buildProceduralLantern(container, 0, 0, 1.0);
    } else if (type === 'butter-bush') {
      this.world?.buildButterBush(container, 0, 0, 1.0);
    } else if (type === 'sugar-crystal') {
      this.world?.buildSugarCrystal(container, 0, 0, 1.0);
    } else {
      const mat = new THREE.MeshStandardMaterial({ color: 0xffd15a, roughness: 0.5 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), mat);
      mesh.position.y = 0.6;
      container.add(mesh);
    }
  }

  loadSavedLayout() {
    try {
      const saved = localStorage.getItem('bwed_custom_world_layout');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          list.forEach((p) => {
            this.spawnProp(p.type, p.x, p.z, p.rotY || 0, p.scale || 1.0);
          });
          this.deselect();
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved world layout', e);
    }
  }

  exportLayoutJSON() {
    const data = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      propsCount: this.placedProps.length,
      props: this.placedProps.map((p) => ({
        type: p.type,
        x: p.x,
        y: p.y,
        z: p.z,
        rotY: p.rotY,
        scale: p.scale,
        radius: p.radius
      }))
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bwed-world-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  saveToLocalStorage() {
    const layout = this.placedProps.map((p) => ({
      type: p.type,
      x: p.x,
      y: p.y,
      z: p.z,
      rotY: p.rotY,
      scale: p.scale
    }));
    localStorage.setItem('bwed_custom_world_layout', JSON.stringify(layout));
    alert('World layout saved successfully!');
  }

  resetToDefaultLayout() {
    if (confirm('Reset all custom props and restore default layout?')) {
      localStorage.removeItem('bwed_custom_world_layout');
      window.location.reload();
    }
  }
}
