/* ==========================================================================
   BWED BUTTER ESCAPE — PLAYER CONTROLLER (V4 PERFECT SCALE & ORIENTATION)
   Fixes:
   - Hero runs facing FORWARD (back to camera, looking down the track towards -Z).
   - Cozy Shiba Buddy scale calibrated to match exact height & volume of all avatars.
   - Grounding anchored strictly to floor level.
   - Smooth banking tilt in turns and air-cancel slide.
   ========================================================================== */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const LANES = [-2.6, 0, 2.6];

export const ALL_AVATARS = [
  {
    id: 'cozy-shiba',
    name: 'Cozy Shiba Buddy',
    file: './assets/all_avatars/cozy-shiba-animated.glb',
    thumb: './assets/shiba/cozy-shiba-pfp.jpg',
    rarity: 'LEGENDARY',
    tagline: 'The loyal four-legged companion of the Bwedverse.',
    isRigged: true,
    scaleMultiplier: 0.68,
    groundOffset: 0.0,
  },
  {
    id: 'tiny-baker',
    name: 'Chef Emile',
    file: './assets/all_avatars/tiny-baker.glb',
    thumb: './assets/thumbs/tiny-baker.png',
    rarity: 'EPIC',
    tagline: 'Master kneader of the sacred golden brioche.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'toast-bandit',
    name: 'Toast Bandit',
    file: './assets/all_avatars/toast-bandit.glb',
    thumb: './assets/thumbs/toast-bandit.png',
    rarity: 'RARE',
    tagline: 'The nimblest jam thief across the grand square.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'crumb-burglar',
    name: 'Crumb Burglar',
    file: './assets/all_avatars/crumb-burglar.glb',
    thumb: './assets/thumbs/crumb-burglar.png',
    rarity: 'RARE',
    tagline: 'Specialist in covert golden crumb collection.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'super-hero-bwed',
    name: 'Super Bwed',
    file: './assets/all_avatars/super-hero-bwed.glb',
    thumb: './assets/thumbs/super-hero-bwed.png',
    rarity: 'EPIC',
    tagline: 'Masked defender against rogue giant butter knives.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'hero-of-toast',
    name: 'Hero of Toast',
    file: './assets/all_avatars/hero-of-toast.glb',
    thumb: './assets/thumbs/hero-of-toast.png',
    rarity: 'LEGENDARY',
    tagline: 'The chosen paladin of the Crispy Crust Brotherhood.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'honey-knight',
    name: 'Honey Knight',
    file: './assets/all_avatars/honey-knight.glb',
    thumb: './assets/thumbs/honey-knight.png',
    rarity: 'EPIC',
    tagline: 'Golden armor dipped in the purest royal honey.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'toast-wizard',
    name: 'Toast Wizard',
    file: './assets/all_avatars/toast-wizard.glb',
    thumb: './assets/thumbs/toast-wizard.png',
    rarity: 'EPIC',
    tagline: 'Master of yeast sorcery and melted butter enchantments.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'reggae-toast',
    name: 'Reggae Toast',
    file: './assets/all_avatars/reggae-toast.glb',
    thumb: './assets/thumbs/reggae-toast.png',
    rarity: 'RARE',
    tagline: 'Ultra-smooth strides and chill vibes on the track.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'brave-firefighter',
    name: 'Brave Firefighter',
    file: './assets/all_avatars/brave-firefighter.glb',
    thumb: './assets/thumbs/brave-firefighter.png',
    rarity: 'RARE',
    tagline: 'Always ready to cool down overheating toaster slots.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'choco-drip',
    name: 'Choco Drip',
    file: './assets/all_avatars/choco-drip.glb',
    thumb: './assets/thumbs/choco-drip.png',
    rarity: 'RARE',
    tagline: 'Melt-in-your-mouth coating and unmatched glide.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'cloud-ninja',
    name: 'Cloud Ninja',
    file: './assets/all_avatars/cloud-ninja.glb',
    thumb: './assets/thumbs/cloud-ninja.png',
    rarity: 'EPIC',
    tagline: 'Stealthy as powdered flour in the morning breeze.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'crimson-samurai',
    name: 'Crimson Samurai',
    file: './assets/all_avatars/crimson-samurai.glb',
    thumb: './assets/thumbs/crimson-samurai.png',
    rarity: 'EPIC',
    tagline: 'A razor-sharp blade in honor of the perfect crust.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'frankenbwed',
    name: 'Frankenbwed',
    file: './assets/all_avatars/frankenbwed.glb',
    thumb: './assets/thumbs/frankenbwed.png',
    rarity: 'RARE',
    tagline: 'Stitched together from the greatest forgotten recipes.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'glow-toast',
    name: 'Glow Toast',
    file: './assets/all_avatars/glow-toast.glb',
    thumb: './assets/thumbs/glow-toast.png',
    rarity: 'RARE',
    tagline: 'Warm golden luminescence from early-morning ovens.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'nerdy-buddy',
    name: 'Nerdy Buddy',
    file: './assets/all_avatars/nerdy-buddy.glb',
    thumb: './assets/thumbs/nerdy-buddy.png',
    rarity: 'COMMON',
    tagline: 'Calculates the optimal running lane to the millimeter.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'saiyan-toast',
    name: 'Saiyan Toast',
    file: './assets/all_avatars/saiyan-toast.glb',
    thumb: './assets/thumbs/saiyan-toast.png',
    rarity: 'LEGENDARY',
    tagline: 'His crunchiness power level is over 9000!',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'toast-tycoon',
    name: 'Toast Tycoon',
    file: './assets/all_avatars/toast-tycoon.glb',
    thumb: './assets/thumbs/toast-tycoon.png',
    rarity: 'EPIC',
    tagline: 'Owns every high-rise bakery on the boulevard.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
  {
    id: 'whale-buddy',
    name: 'Whale Buddy',
    file: './assets/all_avatars/whale-buddy.glb',
    thumb: './assets/thumbs/whale-buddy.png',
    rarity: 'LEGENDARY',
    tagline: 'Swimming gracefully across an infinite sea of butter.',
    scaleMultiplier: 1.0,
    groundOffset: 0.0,
  },
];

export class Player {
  constructor(scene, audioManager) {
    this.scene = scene;
    this.audio = audioManager;

    this.group = new THREE.Group();
    this.group.name = 'playerRoot';

    // Health
    this.maxLives = 3;
    this.lives = this.maxLives;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;
    this.invulnerableDuration = 1.6;

    // Powerups
    this.hasShield = false;
    this.hasMagnet = false;
    this.magnetTimer = 0;
    this.magnetDuration = 10.0;

    // Movement
    this.currentLaneIndex = 1;
    this.targetX = LANES[this.currentLaneIndex];
    this.currentX = this.targetX;
    this.laneChangeSpeed = 19.0;

    // Jump Physics
    this.isJumping = false;
    this.jumpY = 0;
    this.jumpVelocity = 0;
    this.gravity = 42.0;
    this.jumpForce = 14.5;

    // Slide Physics
    this.isSliding = false;
    this.slideDuration = 0.65;
    this.slideTimer = 0;

    // Animation & Mixer
    this.mixer = null;
    this.clips = {};
    this.activeAction = null;
    this.runCycle = 0;
    this.isStumbling = false;
    this.stumbleTimer = 0;

    // Bounding Box
    this.boundingBox = new THREE.Box3();

    // Crumb Trail
    this.crumbs = [];
    this.createCrumbTrail();

    // Shadow
    const shadowGeo = new THREE.CircleGeometry(0.7, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
    });
    this.shadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.y = 0.02;
    this.group.add(this.shadow);

    // Bubble Shield
    this.buildShieldMesh();

    // Avatar Container
    this.avatarContainer = new THREE.Group();
    this.group.add(this.avatarContainer);
    this.buildFallbackToast();

    // Loader
    this.gltfLoader = new GLTFLoader();
    this.currentAvatarId = 'cozy-shiba';
    this.loadAvatar(this.currentAvatarId);

    this.scene.add(this.group);
  }

  buildShieldMesh() {
    const shieldGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: 0x48dbfb,
      emissive: 0x0abde3,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.0;
    this.shieldMesh.visible = false;
    this.group.add(this.shieldMesh);
  }

  buildFallbackToast() {
    this.fallbackMesh = new THREE.Group();

    const toastGeo = new THREE.BoxGeometry(0.9, 1.1, 0.4);
    const toastMat = new THREE.MeshStandardMaterial({ color: 0xe6a15c, roughness: 0.8 });
    const toast = new THREE.Mesh(toastGeo, toastMat);
    toast.position.y = 0.7;
    toast.castShadow = true;
    this.fallbackMesh.add(toast);

    const butterGeo = new THREE.BoxGeometry(0.4, 0.2, 0.3);
    const butterMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.3 });
    const butter = new THREE.Mesh(butterGeo, butterMat);
    butter.position.set(0, 1.35, 0);
    this.fallbackMesh.add(butter);

    this.avatarContainer.add(this.fallbackMesh);
  }

  // ---------------------------------------------------------------------------
  // Load Avatar with Accurate Scale & Grounding
  // ---------------------------------------------------------------------------
  loadAvatar(avatarId) {
    const config = ALL_AVATARS.find((a) => a.id === avatarId) || ALL_AVATARS[0];
    this.currentAvatarId = config.id;
    this.currentConfig = config;

    this.gltfLoader.load(
      config.file,
      (gltf) => {
        while (this.avatarContainer.children.length > 0) {
          this.avatarContainer.remove(this.avatarContainer.children[0]);
        }

        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.isSkinnedMesh) {
              child.frustumCulled = false;
            }
            if (child.material) {
              child.material.roughness = Math.min(child.material.roughness || 0.6, 0.7);
            }
          }
        });

        // Compute raw bounding box for height normalization
        const rawBox = new THREE.Box3().setFromObject(model);
        const rawSize = rawBox.getSize(new THREE.Vector3());

        // Target height ~1.65m normalized across all avatars
        const baseHeight = 1.65;
        const currentHeight = rawSize.y > 0.05 ? rawSize.y : 1.7;
        const scale = (baseHeight / currentHeight) * (config.scaleMultiplier || 1.0);
        model.scale.setScalar(scale);

        // Recalculate accurately after scale applied to ensure paws/feet sit strictly at Y = 0
        model.updateMatrixWorld(true);
        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = scaledBox.getCenter(new THREE.Vector3());

        // Ground and center model
        model.position.x = -center.x;
        model.position.y = -scaledBox.min.y + (config.groundOffset || 0);
        model.position.z = -center.z;

        // Model naturally faces +Z inside avatarContainer
        model.rotation.y = 0;

        this.loadedModel = model;
        this.avatarContainer.add(model);

        // AnimationMixer for rigged models
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(model);
          this.clips = {};

          gltf.animations.forEach((clip) => {
            this.clips[clip.name] = this.mixer.clipAction(clip);
          });

          this.runClipName = Object.keys(this.clips).find((n) => n.includes('Running') || n.includes('Run'));
          this.danceClipName = Object.keys(this.clips).find((n) => n.includes('Boom_Dance') || n.includes('Dance') || n.includes('Agree'));

          this.playRunAnimation();
        } else {
          this.mixer = null;
          this.clips = {};
        }
      },
      undefined,
      (err) => {
        console.warn('Failed to load avatar:', err);
      }
    );
  }

  playRunAnimation() {
    if (!this.mixer || !this.runClipName) return;
    if (this.activeAction) this.activeAction.stop();

    const action = this.clips[this.runClipName];
    if (action) {
      action.reset().play();
      this.activeAction = action;
    }
  }

  playDanceAnimation() {
    if (!this.mixer || !this.danceClipName) return;
    if (this.activeAction) this.activeAction.stop();

    const action = this.clips[this.danceClipName];
    if (action) {
      action.reset().play();
      this.activeAction = action;
    }
  }

  takeDamage() {
    if (this.isInvulnerable) return false;

    if (this.hasShield) {
      this.hasShield = false;
      this.shieldMesh.visible = false;
      this.isInvulnerable = true;
      this.invulnerableTimer = 0.8;
      this.audio.playShieldBreak();
      return 'shield_break';
    }

    this.lives = Math.max(0, this.lives - 1);
    this.isInvulnerable = true;
    this.invulnerableTimer = this.invulnerableDuration;
    this.isStumbling = true;
    this.stumbleTimer = 0.6;
    this.audio.playStumble();

    return 'damage_taken';
  }

  heal(amount = 1) {
    if (this.lives < this.maxLives) {
      this.lives = Math.min(this.maxLives, this.lives + amount);
      this.audio.playHeal();
      return true;
    }
    return false;
  }

  activateShield() {
    this.hasShield = true;
    this.shieldMesh.visible = true;
    this.audio.playShieldPickup();
  }

  activateMagnet(duration = 10.0) {
    this.hasMagnet = true;
    this.magnetDuration = duration;
    this.magnetTimer = duration;
    this.audio.playMagnetPickup();
  }

  moveLeft() {
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
      this.targetX = LANES[this.currentLaneIndex];
      this.audio.playSlide();
    }
  }

  moveRight() {
    if (this.currentLaneIndex < LANES.length - 1) {
      this.currentLaneIndex++;
      this.targetX = LANES[this.currentLaneIndex];
      this.audio.playSlide();
    }
  }

  jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.jumpVelocity = this.jumpForce;
      this.isSliding = false;
      this.audio.playJump();
    }
  }

  slide() {
    if (this.isJumping) {
      this.jumpVelocity = -this.gravity * 0.8; // Air-cancel ground pound!
    }

    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = this.slideDuration;
      this.audio.playSlide();
    }
  }

  createCrumbTrail() {
    const crumbGeo = new THREE.DodecahedronGeometry(0.08);
    const crumbMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.9 });

    for (let i = 0; i < 25; i++) {
      const crumb = new THREE.Mesh(crumbGeo, crumbMat);
      crumb.visible = false;
      this.scene.add(crumb);
      this.crumbs.push({
        mesh: crumb,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.45,
      });
    }
  }

  emitCrumb() {
    const c = this.crumbs.find((item) => !item.mesh.visible);
    if (!c) return;
    c.mesh.position.set(this.group.position.x + (Math.random() - 0.5) * 0.4, 0.1, this.group.position.z + 0.3);
    c.mesh.visible = true;
    c.vel.set((Math.random() - 0.5) * 1.5, Math.random() * 2 + 1, Math.random() * 2 + 2);
    c.life = 0;
    c.maxLife = 0.35 + Math.random() * 0.2;
  }

  updateCrumbs(delta) {
    for (const c of this.crumbs) {
      if (!c.mesh.visible) continue;
      c.life += delta;
      if (c.life >= c.maxLife) {
        c.mesh.visible = false;
        continue;
      }
      c.vel.y -= 15 * delta;
      c.mesh.position.addScaledVector(c.vel, delta);
      const s = 1 - c.life / c.maxLife;
      c.mesh.scale.setScalar(s);
    }
  }

  update(delta, currentSpeed, isPlaying = true) {
    if (this.mixer) {
      if (this.activeAction && isPlaying) {
        this.mixer.timeScale = Math.max(0.85, currentSpeed / 15.0);
      } else {
        this.mixer.timeScale = 1.0;
      }
      this.mixer.update(delta);
    }

    if (!isPlaying) {
      this.avatarContainer.visible = true;
      // In showroom / menu: face camera (+Z) so the player sees the hero's face and emotes
      this.avatarContainer.rotation.y = 0;
      return;
    }

    // 1. Lane Lerp
    this.currentX = THREE.MathUtils.lerp(this.currentX, this.targetX, delta * this.laneChangeSpeed);
    this.group.position.x = this.currentX;

    // 2. Jump Physics
    if (this.isJumping) {
      this.jumpY += this.jumpVelocity * delta;
      this.jumpVelocity -= this.gravity * delta;
      if (this.jumpY <= 0) {
        this.jumpY = 0;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }
    this.avatarContainer.position.y = this.jumpY;

    // 3. Slide Timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
      }
    }

    // 4. Invulnerability
    if (this.isInvulnerable) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
        this.avatarContainer.visible = true;
      } else {
        this.avatarContainer.visible = Math.floor(Date.now() / 75) % 2 === 0;
      }
    } else {
      this.avatarContainer.visible = true;
    }

    if (this.isStumbling) {
      this.stumbleTimer -= delta;
      if (this.stumbleTimer <= 0) {
        this.isStumbling = false;
      }
    }

    // 5. Magnet
    if (this.hasMagnet) {
      this.magnetTimer -= delta;
      if (this.magnetTimer <= 0) {
        this.hasMagnet = false;
      }
    }

    // 6. Shield Pulse
    if (this.hasShield) {
      const pulse = 1.0 + Math.sin(Date.now() * 0.008) * 0.08;
      this.shieldMesh.scale.setScalar(pulse);
      this.shieldMesh.position.y = 1.0 + this.jumpY;
      this.shieldMesh.rotation.y += delta * 1.5;
    }

    // 7. Postures: Slide / Jump / Running
    // ORIENTATION: Hero runs forward down the track (-Z), back toward the camera!
    const laneDiff = (this.targetX - this.currentX);
    const bankAngle = -laneDiff * 0.22;

    // rotation.y = Math.PI points character down the track (-Z), back to camera
    this.avatarContainer.rotation.y = Math.PI - laneDiff * 0.15;

    if (this.isSliding) {
      this.avatarContainer.scale.set(1.2, 0.45, 1.2);
      this.avatarContainer.rotation.x = -Math.PI * 0.25;
      this.avatarContainer.rotation.z = bankAngle;
    } else if (this.isJumping) {
      this.avatarContainer.scale.set(0.9, 1.15, 0.9);
      this.avatarContainer.rotation.x = Math.PI * 0.08;
      this.avatarContainer.rotation.z = bankAngle;
    } else {
      this.avatarContainer.scale.set(1.0, 1.0, 1.0);
      this.avatarContainer.rotation.x = 0.04;
      this.avatarContainer.rotation.z = bankAngle;

      if (!this.mixer) {
        this.runCycle += delta * (currentSpeed * 0.9);
        const bounce = Math.abs(Math.sin(this.runCycle * 4)) * 0.14;
        const waddle = Math.sin(this.runCycle * 2) * 0.12;
        this.avatarContainer.position.y = this.jumpY + bounce;
        this.avatarContainer.rotation.z = waddle + bankAngle;
      }

      if (Math.random() < 0.25) {
        this.emitCrumb();
      }
    }

    if (this.isStumbling) {
      this.avatarContainer.position.x = (Math.random() - 0.5) * 0.22;
    } else {
      this.avatarContainer.position.x = 0;
    }

    // 8. Shadow
    const shadowScale = Math.max(0.2, 1 - this.jumpY * 0.25);
    this.shadow.scale.setScalar(shadowScale);
    this.shadow.material.opacity = 0.35 * shadowScale;

    // 9. Crumbs
    this.updateCrumbs(delta);

    // 10. Bounding Box
    this.updateBoundingBox();
  }

  updateBoundingBox() {
    const posX = this.group.position.x;
    const posY = this.jumpY;
    const posZ = this.group.position.z;

    const halfWidth = 0.45;
    const halfDepth = 0.5;
    let height = 1.5;

    if (this.isSliding) {
      height = 0.55;
    }

    this.boundingBox.min.set(posX - halfWidth, posY, posZ - halfDepth);
    this.boundingBox.max.set(posX + halfWidth, posY + height, posZ + halfDepth);
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  reset() {
    this.lives = this.maxLives;
    this.isInvulnerable = false;
    this.hasShield = false;
    this.shieldMesh.visible = false;
    this.hasMagnet = false;
    this.magnetTimer = 0;

    this.currentLaneIndex = 1;
    this.targetX = LANES[1];
    this.currentX = this.targetX;
    this.group.position.set(0, 0, 0);
    this.jumpY = 0;
    this.jumpVelocity = 0;
    this.isJumping = false;
    this.isSliding = false;
    this.isStumbling = false;
    this.runCycle = 0;
    this.avatarContainer.visible = true;
    this.avatarContainer.rotation.y = Math.PI; // Face forward down the track (-Z)

    this.playRunAnimation();
    this.updateBoundingBox();
  }
}
