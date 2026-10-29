import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ==========================================================================
   MODÈLE D'AVATAR & MOTEUR D'ANIMATION PROCÉDURALE — BWED WORLD
   Compatible avec les modèles GLB statiques (bobbing/waddle) et squelettes
   ========================================================================== */

export class AvatarModel {
  constructor(avatarId = 'tiny-baker', filePath = './assets/avatars/tiny-baker.glb') {
    this.avatarId = avatarId;
    this.filePath = filePath;

    this.rootGroup = new THREE.Group();
    this.visualGroup = new THREE.Group();
    this.rootGroup.add(this.visualGroup);

    this.isLoaded = false;
    this.mixer = null;
    this.animTime = 0;

    // Ombre circulaire douce sous les pieds
    this.shadowMesh = null;
    this.buildShadow();

    this.loadGLTF();
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

  loadGLTF() {
    const loader = new GLTFLoader();
    loader.load(
      this.filePath,
      (gltf) => {
        const model = gltf.scene;

        // Calcul des dimensions d'origine pour normaliser la hauteur à 1.8 m
        const bbox = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const targetHeight = 1.8;
        const scaleFactor = targetHeight / (size.y || 1.8);

        model.scale.setScalar(scaleFactor);

        // Recalibrage du pivot pour que les pieds touchent Y = 0
        const minPoint = bbox.min.clone().multiplyScalar(scaleFactor);
        model.position.y = -minPoint.y;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
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
        console.warn('Fallback modèle avatar procédural:', err);
        this.buildFallbackModel();
      }
    );
  }

  buildFallbackModel() {
    // Petit chef pâtissier cubique en secours
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

  // Animation procédurale fluide (waddle en course, respiration au repos)
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
