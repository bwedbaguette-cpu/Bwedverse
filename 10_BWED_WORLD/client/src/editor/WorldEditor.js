import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ==========================================================================
   MODE ÉDITEUR DE MONDE 3D DANS LE NAVIGATEUR — BWED WORLD (JALON 4)
   - Sélection, translation, rotation et mise à l'échelle d'objets 3D
   - Catalogue de props à placer au clic sur le sol
   - Exportation et sauvegarde automatique du format JSON de placement
   ========================================================================== */

export class WorldEditor {
  constructor(options = {}) {
    this.scene = options.scene;
    this.camera = options.camera;
    this.world = options.world;
    this.physics = options.physics;

    this.loader = new GLTFLoader();
    this.isEnabled = false;
    this.selectedObject = null;
    this.currentTool = 'select'; // 'select', 'place', 'delete'
    this.selectedPropType = 'pistachio-tree';

    // Registre de tous les props éditables du monde
    // { id, type, x, y, z, rotY, scale, group, radius }
    this.placedProps = [];

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Anneau visuel de sélection
    this.selectionRing = null;
    this.buildSelectionRing();

    // DOM UI
    this.dom = {
      editorBtn: document.getElementById('toggleEditorBtn'),
      editorBar: document.getElementById('worldEditorBar'),
      propSelect: document.getElementById('editorPropSelect'),
      toolSelectBtn: document.getElementById('toolSelectBtn'),
      toolPlaceBtn: document.getElementById('toolPlaceBtn'),
      toolDeleteBtn: document.getElementById('toolDeleteBtn'),
      exportJsonBtn: document.getElementById('exportLayoutBtn'),
      saveLocalBtn: document.getElementById('saveLayoutBtn'),
      resetLayoutBtn: document.getElementById('resetLayoutBtn'),

      // Inspecteur
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
      btnScaleUp: document.getElementById('inspBtnScaleUp'),
      btnScaleDown: document.getElementById('inspBtnScaleDown'),
      btnDeleteSelected: document.getElementById('inspBtnDelete')
    };

    this.initEvents();
    this.loadSavedLayout();
  }

  buildSelectionRing() {
    const geo = new THREE.RingGeometry(1.4, 1.7, 32);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthTest: false
    });
    this.selectionRing = new THREE.Mesh(geo, mat);
    this.selectionRing.rotation.x = -Math.PI / 2;
    this.selectionRing.position.y = 0.08;
    this.selectionRing.visible = false;
    this.scene.add(this.selectionRing);
  }

  initEvents() {
    this.dom.editorBtn?.addEventListener('click', () => {
      this.toggleEditor();
    });

    this.dom.toolSelectBtn?.addEventListener('click', () => this.setTool('select'));
    this.dom.toolPlaceBtn?.addEventListener('click', () => this.setTool('place'));
    this.dom.toolDeleteBtn?.addEventListener('click', () => this.setTool('delete'));

    this.dom.propSelect?.addEventListener('change', (e) => {
      this.selectedPropType = e.target.value;
    });

    this.dom.exportJsonBtn?.addEventListener('click', () => this.exportLayoutJSON());
    this.dom.saveLocalBtn?.addEventListener('click', () => this.saveToLocalStorage());
    this.dom.resetLayoutBtn?.addEventListener('click', () => this.resetToDefaultLayout());

    // Contrôles de l'inspecteur
    this.dom.btnMoveLeft?.addEventListener('click', () => this.nudgeSelected(-1, 0));
    this.dom.btnMoveRight?.addEventListener('click', () => this.nudgeSelected(1, 0));
    this.dom.btnMoveUp?.addEventListener('click', () => this.nudgeSelected(0, -1));
    this.dom.btnMoveDown?.addEventListener('click', () => this.nudgeSelected(0, 1));
    this.dom.btnRotate?.addEventListener('click', () => this.rotateSelected(Math.PI / 4));
    this.dom.btnScaleUp?.addEventListener('click', () => this.scaleSelected(0.15));
    this.dom.btnScaleDown?.addEventListener('click', () => this.scaleSelected(-0.15));
    this.dom.btnDeleteSelected?.addEventListener('click', () => this.deleteSelected());

    // Clics 3D dans le viewport
    window.addEventListener('pointerdown', (e) => {
      if (!this.isEnabled) return;

      // Ignore les clics sur l'UI HTML
      const target = e.target;
      if (target.closest('.hud-layer') || target.closest('.modal-overlay') || target.closest('.world-editor-bar')) {
        return;
      }

      this.handlePointerDown(e);
    });
  }

  toggleEditor() {
    this.isEnabled = !this.isEnabled;

    if (this.dom.editorBar) {
      this.dom.editorBar.hidden = !this.isEnabled;
    }
    if (this.dom.editorBtn) {
      this.dom.editorBtn.classList.toggle('active', this.isEnabled);
      this.dom.editorBtn.textContent = this.isEnabled ? 'Exit Editor' : 'World Editor';
    }

    if (!this.isEnabled) {
      this.deselect();
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    this.dom.toolSelectBtn?.classList.toggle('active', tool === 'select');
    this.dom.toolPlaceBtn?.classList.toggle('active', tool === 'place');
    this.dom.toolDeleteBtn?.classList.toggle('active', tool === 'delete');
  }

  handlePointerDown(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    if (this.currentTool === 'place') {
      // Raycast contre le sol pour poser un nouveau prop
      const groundMesh = this.world.groundMesh;
      if (!groundMesh) return;

      const intersects = this.raycaster.intersectObject(groundMesh, false);
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        this.spawnProp(this.selectedPropType, pt.x, pt.z, 0, 1.0);
      }
      return;
    }

    // Raycast sur les props existants pour sélectionner ou supprimer
    const propGroups = this.placedProps.map((p) => p.group).filter(Boolean);
    const intersects = this.raycaster.intersectObjects(propGroups, true);

    if (intersects.length > 0) {
      const hitObj = intersects[0].object;
      // Remonter jusqu'au groupe racine du prop
      const propEntry = this.findPropEntryByChild(hitObj);

      if (propEntry) {
        if (this.currentTool === 'delete') {
          this.deleteProp(propEntry);
        } else {
          this.selectProp(propEntry);
        }
      }
    } else {
      this.deselect();
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
      this.selectionRing.scale.setScalar(entry.scale || 1.0);
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

    if (this.dom.inspectorTitle) this.dom.inspectorTitle.textContent = p.type;
    if (this.dom.inspectorCoords) {
      this.dom.inspectorCoords.textContent = `X: ${p.x.toFixed(1)} | Z: ${p.z.toFixed(1)}`;
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
    this.selectedObject.x += dx;
    this.selectedObject.z += dz;
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
    this.selectedObject.scale = newScale;
    this.selectedObject.group.scale.setScalar(newScale);
    this.selectionRing.scale.setScalar(newScale);
    this.updateInspectorUI();
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

    // Collision radius estimate
    let radius = 1.2 * scale;

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

    // Load geometry or GLB into container
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
      'pistachio-tree': { url: './assets/props/pistachio-tree.glb', scale: 1.0 },
      'pretzel-bench': { url: './assets/props/pretzel-bench.glb', scale: 1.0 },
      'honey-lantern': { url: './assets/props/honey-lantern.glb', scale: 1.0 },
      'marshmallow-campfire': { url: './assets/props/marshmallow-campfire.glb', scale: 1.0 },
      'hazelnut-cup': { url: './assets/props/hazelnut-cup.glb', scale: 0.8 }
    };

    if (glbMap[type]) {
      const cfg = glbMap[type];
      this.loader.load(
        cfg.url,
        (gltf) => {
          const m = gltf.scene;
          m.scale.setScalar(cfg.scale);
          m.traverse((c) => {
            if (c.isMesh) {
              c.castShadow = true;
              c.receiveShadow = true;
            }
          });
          container.add(m);
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

    if (type === 'pastry-tree') {
      this.world.buildPastryTree(container, 0, 0, 1.0, 0x4a7c35);
    } else if (type === 'chocolate-boulder') {
      this.world.buildChocolateBoulder(container, 0, 0, 1.0);
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
      version: '1.0.0',
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

    // Download file
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
    alert('Layout saved to browser storage successfully!');
  }

  resetToDefaultLayout() {
    if (confirm('Reset custom props and restore default layout?')) {
      localStorage.removeItem('bwed_custom_world_layout');
      window.location.reload();
    }
  }
}
