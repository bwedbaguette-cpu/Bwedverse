import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { CONFIG } from '../config.js';

/* ==========================================================================
   MODÈLE D'AVATAR & MOTEUR D'ANIMATION — BWED WORLD
   - Support complet des modèles riggés avec squelette (SkeletonUtils)
   - Chargement dynamique robuste des 23 avatars GLB
   - Normalisation automatique de la hauteur (1.8m)
   - Recentrage strict X, Y, Z du pivot au sol (évite les décalages de case)
   - Animations procédurales waddle/respiration et support mixer GLTF avec crossfade
   - Support des animations spéciales (dances, attaques, emotes)
   ========================================================================== */

export class AvatarModel {
  static avatarCache = new Map();
  static loader = new GLTFLoader();

  constructor(avatarId = 'tiny-baker') {
    this.avatarId = avatarId;

    this.rootGroup = new THREE.Group();
    this.visualGroup = new THREE.Group();
    this.rootGroup.add(this.visualGroup);

    this.isLoaded = false;
    this.mixer = null;
    this.animTime = 0;
    this.targetHeight = 1.8;
    this.targetScaleModifier = 1.15;
    this.clips = [];
    this.isPlayingSpecial = false;
    this.specialTimer = null;

    // Ombre circulaire douce sous les pieds
    this.shadowMesh = null;
    this.buildShadow();

    this.loadAvatar(avatarId);
  }

  buildShadow() {
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x1f1208,
      transparent: true,
      opacity: 0.38,
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
    this.clips = [];
    this.isPlayingSpecial = false;
    if (this.specialTimer) clearTimeout(this.specialTimer);

    const setupModel = (sourceScene, animations = []) => {
      if (this.avatarId !== avatarId) return;

      // Utilisation obligatoire de SkeletonUtils.clone pour cloner proprement les armatures et SkinnedMeshes
      let model;
      try {
        model = SkeletonUtils.clone(sourceScene);
      } catch (err) {
        console.warn(`[AvatarModel] SkeletonUtils.clone a échoué pour ${avatarId}, fallback sur clone classique:`, err);
        model = sourceScene.clone(true);
      }

      // 1. Calcul de la Bounding Box brute
      const bbox = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      bbox.getSize(size);

      // 2. Mise à l'échelle normalisée
      const currentHeight = size.y > 0.05 ? size.y : 1.8;
      const scaleFactor = (this.targetHeight / currentHeight) * this.targetScaleModifier;
      model.scale.setScalar(scaleFactor);

      // 3. Recalcul après échelle pour recentrage X, Y, Z parfait au sol
      const scaledBbox = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      scaledBbox.getCenter(center);

      // Ancrage au sol et centrage horizontal strict
      model.position.x = -center.x;
      model.position.z = -center.z;
      model.position.y = -scaledBbox.min.y;

      // 4. Ombres et matériaux cel-shading doux + désactivation du frustum culling pour SkinnedMesh
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.isSkinnedMesh) {
            child.frustumCulled = false;
          }
          if (child.material) {
            child.material.roughness = Math.max(0.4, child.material.roughness ?? 0.55);
            child.material.metalness = Math.min(0.15, child.material.metalness ?? 0.05);
          }
        }
      });

      this.visualGroup.add(model);
      this.isLoaded = true;

      if (animations && animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(model);
        this.animationActions = new Map();
        this.clips = animations;

        for (const clip of animations) {
          const action = this.mixer.clipAction(clip);
          this.animationActions.set(clip.name.toLowerCase(), action);
        }

        // Recherche des clips clés
        this.walkClip = animations.find(c => {
          const n = c.name.toLowerCase();
          return n.includes('walking') || (n.includes('walk') && !n.includes('woman'));
        }) || animations.find(c => c.name.toLowerCase().includes('walk'));

        this.runClip = animations.find(c => {
          const n = c.name.toLowerCase();
          return n.includes('running') || n.includes('run');
        });

        this.idleClip = animations.find(c => {
          const n = c.name.toLowerCase();
          return n.includes('alert') || n.includes('idle') || n.includes('agree');
        }) || animations[0];

        this.danceClip = animations.find(c => {
          const n = c.name.toLowerCase();
          return n.includes('all_night_dance') || n.includes('boom_dance') || n.includes('dance');
        });

        this.attackClip = animations.find(c => {
          const n = c.name.toLowerCase();
          return n.includes('triple_combo') || n.includes('attack') || n.includes('skill');
        });

        // Action par défaut : idle
        const defaultAction = this.idleClip ? this.mixer.clipAction(this.idleClip) : this.mixer.clipAction(animations[0]);
        defaultAction.reset().play();
        this.currentAction = defaultAction;
      }
    };

    // Cache mémoire pour chargement instantané lors des changements fréquents
    if (AvatarModel.avatarCache.has(filePath)) {
      const cached = AvatarModel.avatarCache.get(filePath);
      setupModel(cached.scene, cached.animations);
      return;
    }

    // Affichage d'un modèle temporaire pendant le téléchargement des gros GLB (10MB+)
    this.buildLoadingPlaceholder();

    AvatarModel.loader.load(
      filePath,
      (gltf) => {
        AvatarModel.avatarCache.set(filePath, { scene: gltf.scene, animations: gltf.animations || [] });
        this.clearVisualGroup();
        setupModel(gltf.scene, gltf.animations);
      },
      undefined,
      (err) => {
        console.warn(`[AvatarModel] Fallback de secours pour ${avatarId}:`, err);
        if (this.avatarId === avatarId) {
          this.clearVisualGroup();
          this.buildFallbackModel();
        }
      }
    );
  }

  playSpecialAction(clipKeyword, duration = 3.0) {
    if (!this.mixer || !this.clips || this.clips.length === 0) return false;
    const clip = this.clips.find(c => c.name.toLowerCase().includes(clipKeyword.toLowerCase()));
    if (!clip) return false;

    this.isPlayingSpecial = true;
    const action = this.mixer.clipAction(clip);
    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(0.2);
    }
    action.reset().fadeIn(0.2).play();
    this.currentAction = action;

    if (this.specialTimer) clearTimeout(this.specialTimer);
    this.specialTimer = setTimeout(() => {
      this.isPlayingSpecial = false;
      if (this.idleClip) {
        const idleAction = this.mixer.clipAction(this.idleClip);
        action.fadeOut(0.25);
        idleAction.reset().fadeIn(0.25).play();
        this.currentAction = idleAction;
      }
    }, duration * 1000);

    return true;
  }

  buildLoadingPlaceholder() {
    const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.4, 12), mat);
    mesh.position.y = 0.7;
    this.visualGroup.add(mesh);
  }

  clearVisualGroup() {
    if (this.specialTimer) clearTimeout(this.specialTimer);
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
    const apronMat = new THREE.MeshStandardMaterial({ color: 0xe59b24, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 1.3, 16), apronMat);
    body.position.y = 0.65;
    body.castShadow = true;
    this.visualGroup.add(body);
    this.isLoaded = true;
  }

  updateAnimation(delta, state, speed) {
    this.animTime += delta * 7.5;

    if (this.mixer) {
      if (!this.isPlayingSpecial) {
        let targetClip = this.idleClip;
        if (state === 'run' && this.runClip) {
          targetClip = this.runClip;
        } else if (state === 'walk' && this.walkClip) {
          targetClip = this.walkClip;
        } else if (state === 'dance' && this.danceClip) {
          targetClip = this.danceClip;
        } else if ((state === 'attack' || state === 'combo') && this.attackClip) {
          targetClip = this.attackClip;
        }

        if (targetClip) {
          const nextAction = this.mixer.clipAction(targetClip);
          if (this.currentAction !== nextAction) {
            if (this.currentAction) {
              this.currentAction.fadeOut(0.18);
            }
            nextAction.reset().fadeIn(0.18).play();
            this.currentAction = nextAction;
          }
        }
      }

      this.mixer.update(delta);
      return;
    }

    if (!this.isLoaded) return;

    if (state === 'walk' || state === 'run' || state === 'dance' || state === 'combo') {
      const freq = (state === 'run' || state === 'combo') ? 14.0 : (state === 'dance' ? 12.0 : 9.5);
      const waddle = Math.sin(this.animTime * freq) * (state === 'dance' ? 0.22 : 0.12);
      const bounce = Math.abs(Math.sin(this.animTime * freq)) * (state === 'dance' ? 0.25 : 0.12);

      this.visualGroup.rotation.z = waddle;
      this.visualGroup.position.y = bounce;
      if (state === 'dance') {
        this.visualGroup.rotation.y = Math.sin(this.animTime * 3.5) * 0.35;
      } else {
        this.visualGroup.rotation.y = 0;
      }
    } else {
      // Respiration idle douce
      const breathe = Math.sin(this.animTime * 1.8) * 0.035;
      this.visualGroup.position.y = Math.max(0, breathe);
      this.visualGroup.rotation.z = 0;
      this.visualGroup.rotation.y = 0;
    }
  }
}
