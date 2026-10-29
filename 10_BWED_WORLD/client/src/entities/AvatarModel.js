import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from '../config.js';

/* ==========================================================================
   MODÈLE D'AVATAR & MOTEUR D'ANIMATION PROCÉDURALE — BWED WORLD
   Prend en charge les 18 pions GLB avec changement dynamique à la volée,
   recalibrage d'échelle, pivot au sol et animation procédurale kawaii
   ========================================================================== */

export class AvatarModel {
  constructor(avatarId = 'tiny-baker') {
    this.avatarId = avatarId;

    this.rootGroup = new THREE.Group();
    this.visualGroup = new THREE.Group();
    this.rootGroup.add(this.visualGroup);

    this.isLoaded = false;
    this.mixer = null;
    this.animTime = 0;
    this.targetHeight = 1.8;
    this.targetScaleModifier = 1.0;

    // Ombre circulaire douce sous les pieds
    this.shadowMesh = null;
    this.buildShadow();

    this.loadAvatar(avatarId);
  }

  buildShadow() {
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x221108,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.y = 0.03;
    this.rootGroup.add(this.shadowMesh);
  }

  loadAvatar(avatarId) {
    this.avatarId = avatarId;
    const def = CONFIG.avatars[avatarId] || CONFIG.avatars['tiny-baker'];
    const filePath = def?.file || `./assets/avatars/${avatarId}.glb`;
    this.targetScaleModifier = def?.scale || 1.15;

    // Nettoyage de l'ancien modèle si existant
    this.clearVisualGroup();
    this.isLoaded = false;
    this.mixer = null;

    const loader = new GLTFLoader();
    loader.load(
      filePath,
      (gltf) => {
        // Sécurité si l'avatar a changé entre-temps
        if (this.avatarId !== avatarId) return;

        const model = gltf.scene;

        // Calcul de la boîte englobante pour normaliser la hauteur à 1.8m
        const bbox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        bbox.getSize(size);

        const currentHeight = size.y > 0.01 ? size.y : 1.8;
        const scaleFactor = (this.targetHeight / currentHeight) * this.targetScaleModifier;
        model.scale.setScalar(scaleFactor);

        // Recalcul après mise à l'échelle pour aligner la base des pieds à Y = 0
        const scaledBbox = new THREE.Box3().setFromObject(model);
        model.position.y = -scaledBbox.min.y;

        // Activation des ombres portées et reçues
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.roughness = Math.max(0.35, child.material.roughness ?? 0.5);
            }
          }
        });

        this.visualGroup.add(model);
        this.isLoaded = true;

        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(model);
        }
      },
      undefined,
      (err) => {
        console.warn(`Fallback pour avatar ${avatarId}:`, err);
        if (this.avatarId === avatarId) {
          this.buildFallbackModel();
        }
      }
    );
  }

  clearVisualGroup() {
    while (this.visualGroup.children.length > 0) {
      const child = this.visualGroup.children[0];
      this.visualGroup.remove(child);
      child.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
    }
  }

  buildFallbackModel() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffeed6, roughness: 0.4 });
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xe59b24, roughness: 0.5 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 1.1, 16), apronMat);
    body.position.y = 0.65;
    body.castShadow = true;
    this.visualGroup.add(body);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), bodyMat);
    head.position.y = 1.35;
    head.castShadow = true;
    this.visualGroup.add(head);

    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.35, 0.55, 16), hatMat);
    hat.position.y = 1.75;
    hat.castShadow = true;
    this.visualGroup.add(hat);

    this.isLoaded = true;
  }

  // Animation procédurale fluide (waddle en course, respiration douce au repos)
  updateAnimation(delta, state = 'idle', speed = 0) {
    if (this.mixer) {
      this.mixer.update(delta);
      return;
    }

    this.animTime += delta;

    if (state === 'run' || state === 'walk') {
      const freq = state === 'run' ? 14.0 : 9.0;
      const bobAmount = state === 'run' ? 0.12 : 0.06;
      const tiltAmount = state === 'run' ? 0.14 : 0.08;

      // Rebond vertical rythmé
      this.visualGroup.position.y = Math.abs(Math.sin(this.animTime * freq)) * bobAmount;

      // Dandinement latéral (waddle) mignon
      this.visualGroup.rotation.z = Math.sin(this.animTime * freq * 0.5) * tiltAmount;
      this.visualGroup.rotation.x = Math.sin(this.animTime * freq) * 0.06;

      // Légère compression/étirement à l'impact
      const stretch = 1.0 + Math.sin(this.animTime * freq) * 0.05;
      this.visualGroup.scale.set(1.0 / Math.sqrt(stretch), stretch, 1.0 / Math.sqrt(stretch));
    } else {
      // Repos (idle) : respiration douce
      this.visualGroup.position.y = Math.sin(this.animTime * 2.8) * 0.03;
      this.visualGroup.rotation.z = Math.sin(this.animTime * 1.4) * 0.02;
      this.visualGroup.rotation.x = 0;
      this.visualGroup.scale.set(1, 1, 1);
    }
  }
}
