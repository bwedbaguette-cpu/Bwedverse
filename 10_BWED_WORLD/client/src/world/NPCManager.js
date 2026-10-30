import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ==========================================================================
   GESTIONNAIRE DES PNJ DU VILLAGE (COZY NPCS) — BWED WORLD (JALON 5)
   - Modèles 3D PNJ avec étiquettes de nom flottantes
   - Animation douce de respiration idle
   - Déclencheur de dialogue interactif
   ========================================================================== */

export class NPCManager {
  constructor(scene, physics, onDialogue = null) {
    this.scene = scene;
    this.physics = physics;
    this.onDialogue = onDialogue;

    this.loader = new GLTFLoader();

    this.npcs = [
      {
        id: 'pierre',
        name: 'Pierre the Apprentice',
        role: 'Baker in Training',
        x: -20,
        z: 1.5,
        rotY: Math.PI * 0.6,
        modelUrl: './assets/avatars/tiny-baker.glb',
        dialogue: "Welcome to Golden Crust Bakery! I am Pierre, Chef Emile's apprentice. We bake with 100% slow-fermented sourdough and honey. Have you tried our warm butter brioches yet?",
        group: null
      },
      {
        id: 'barnaby',
        name: 'Barnaby the Conductor',
        role: 'Railway Master',
        x: -12.5,
        z: 82,
        rotY: -Math.PI * 0.35,
        modelUrl: './assets/avatars/toast-bandit.glb',
        dialogue: 'All aboard the Chocolate Express! Line 1 connects the Golden Square with Cocoa Woods. Keep your golden tickets ready for inspection!',
        group: null
      },
      {
        id: 'mallow',
        name: 'Mallow the Campfire Hermit',
        role: 'Marshmallow Sage',
        x: 21,
        z: 92,
        rotY: -Math.PI * 0.7,
        modelUrl: './assets/avatars/cloud-ninja.glb',
        dialogue: 'Greetings, traveler. Sit by the fire and toast a sweet marshmallow. Legend says the ancient portal at the end of the forest opens doors to arcade realms!',
        group: null
      }
    ];

    this.initNPCs();
  }

  initNPCs() {
    this.npcs.forEach((npc) => {
      const group = new THREE.Group();
      group.position.set(npc.x, 0, npc.z);
      group.rotation.y = npc.rotY;
      this.scene.add(group);
      npc.group = group;

      // Obstacle physique pour ne pas traverser le PNJ
      this.physics.addObstacle(npc.x, npc.z, 0.6);

      // Étiquette de nom (billboard sprite)
      const nameplate = this.createNPCNameplate(npc.name, npc.role);
      group.add(nameplate);

      // Chargement du modèle GLB ou fallback procédural
      this.loadNPCModel(npc, group);
    });
  }

  loadNPCModel(npc, group) {
    this.loader.load(
      npc.modelUrl,
      (gltf) => {
        const model = gltf.scene;
        const bbox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        bbox.getSize(size);

        const scale = 1.8 / (size.y || 1.8);
        model.scale.setScalar(scale);
        model.position.y = -bbox.min.y * scale;

        model.traverse((c) => {
          if (c.isMesh) {
            c.castShadow = true;
            c.receiveShadow = true;
          }
        });

        group.add(model);
        npc.visualModel = model;
      },
      undefined,
      () => {
        // Fallback procedural model
        const mat = new THREE.MeshStandardMaterial({ color: 0xffd15a, roughness: 0.5 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.7, 12), mat);
        mesh.position.y = 0.85;
        mesh.castShadow = true;
        group.add(mesh);
        npc.visualModel = mesh;
      }
    );
  }

  createNPCNameplate(name, role) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');

    // Badge sombre avec bordure dorée
    ctx.fillStyle = 'rgba(24, 12, 6, 0.85)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(8, 8, 240, 56, 16);
    else ctx.rect(8, 8, 240, 56);
    ctx.fill();

    ctx.strokeStyle = '#ffd15a';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Rôle en petit
    ctx.fillStyle = '#ffd15a';
    ctx.font = 'bold 16px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`[NPC] ${role}`, 128, 30);

    // Nom en grand
    ctx.fillStyle = '#fff9f0';
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.fillText(name, 128, 54);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(0, 2.35, 0);
    sprite.scale.set(1.9, 0.55, 1);
    return sprite;
  }

  getNearestNPC(playerPos, maxDist = 3.2) {
    if (!playerPos) return null;
    let closest = null;
    let minDist = maxDist;

    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      const dx = playerPos.x - npc.x;
      const dz = playerPos.z - npc.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        closest = npc;
      }
    }
    return closest;
  }

  update(delta) {
    const now = performance.now() * 0.001;

    // Respiration douce des PNJ
    for (let i = 0; i < this.npcs.length; i++) {
      const npc = this.npcs[i];
      if (npc.visualModel) {
        npc.visualModel.position.y = Math.sin(now * 2.5 + i) * 0.03;
      }
    }
  }
}
