/* ==========================================================================
   BWED BUTTER ESCAPE — THE GIANT BUTTER KNIFE (V2 PRO)
   Menacing background pursuer with polished chrome materials, proper
   proportions (scaled down & oriented forward along -Z), dynamic feint attacks
   when player loses hearts, and dramatic final slice.
   ========================================================================== */

import * as THREE from 'three';

export class GiantKnife {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();

    // Distance control (hovers comfortably behind player)
    this.baseDistance = 16.0;
    this.distance = this.baseDistance;
    this.targetDistance = this.baseDistance;

    // Kinematics & visual state
    this.currentX = 0;
    this.bobTime = 0;
    this.isFeinting = false;
    this.feintTimer = 0;
    this.isSlicing = false;
    this.sliceProgress = 0;

    this.sparks = [];

    this.buildKnifeMesh();
    this.scene.add(this.group);
  }

  buildKnifeMesh() {
    this.bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xecf0f1,
      metalness: 0.98,
      roughness: 0.12,
      envMapIntensity: 1.8,
    });

    this.brassMaterial = new THREE.MeshStandardMaterial({
      color: 0xe67e22,
      metalness: 0.9,
      roughness: 0.25,
    });

    this.woodMaterial = new THREE.MeshStandardMaterial({
      color: 0x3d2010,
      metalness: 0.1,
      roughness: 0.7,
    });

    this.butterMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      emissive: 0x996515,
      emissiveIntensity: 0.4,
      metalness: 0.2,
      roughness: 0.25,
    });

    const knifeRoot = new THREE.Group();
    knifeRoot.name = 'knifeGeometry';

    // 1. Blade: Sculpted rounded butter knife profile
    const shape = new THREE.Shape();
    shape.moveTo(-0.08, 0);
    shape.lineTo(0.08, 0);
    shape.lineTo(0.1, 3.6);
    shape.quadraticCurveTo(0.12, 4.4, 0, 4.6);
    shape.quadraticCurveTo(-0.12, 4.4, -0.1, 3.6);
    shape.lineTo(-0.08, 0);

    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.025,
      bevelThickness: 0.025,
    };

    const bladeGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bladeGeo.center();
    const bladeMesh = new THREE.Mesh(bladeGeo, this.bladeMaterial);
    bladeMesh.castShadow = true;
    bladeMesh.receiveShadow = true;
    bladeMesh.position.y = 1.4;
    knifeRoot.add(bladeMesh);

    // 2. Brass collar
    const collarGeo = new THREE.CylinderGeometry(0.2, 0.18, 0.3, 16);
    const collarMesh = new THREE.Mesh(collarGeo, this.brassMaterial);
    collarMesh.position.y = -0.7;
    collarMesh.castShadow = true;
    knifeRoot.add(collarMesh);

    // 3. Ergonomic Handle
    const handleGeo = new THREE.CylinderGeometry(0.22, 0.25, 2.2, 16);
    const handleMesh = new THREE.Mesh(handleGeo, this.woodMaterial);
    handleMesh.position.y = -1.8;
    handleMesh.castShadow = true;
    knifeRoot.add(handleMesh);

    // Brass rivets
    for (let r = 0; r < 3; r++) {
      const rivetGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12);
      rivetGeo.rotateZ(Math.PI / 2);
      const rivetMesh = new THREE.Mesh(rivetGeo, this.brassMaterial);
      rivetMesh.position.set(0, -1.2 - r * 0.5, 0);
      knifeRoot.add(rivetMesh);
    }

    // Pommel
    const pommelGeo = new THREE.SphereGeometry(0.25, 16, 16);
    pommelGeo.scale(1, 0.7, 1);
    const pommelMesh = new THREE.Mesh(pommelGeo, this.brassMaterial);
    pommelMesh.position.y = -3.0;
    knifeRoot.add(pommelMesh);

    // 4. Melted Butter Glob on tip of blade
    const butterGeo = new THREE.SphereGeometry(0.2, 16, 16);
    butterGeo.scale(1.2, 1.6, 0.7);
    const butterMesh = new THREE.Mesh(butterGeo, this.butterMaterial);
    butterMesh.position.set(0, 3.6, 0.03);
    knifeRoot.add(butterMesh);

    // PROPER PROPORTIONS & ORIENTATION:
    // Scale down from 1.4 to 0.78 for balanced proportions
    knifeRoot.scale.set(0.78, 0.78, 0.78);

    // Orient blade pointing forward along -Z (chasing the player in front of it)
    // Blade lies almost flat pointing forward, tip pointed toward the player
    knifeRoot.rotation.x = -Math.PI * 0.42; // pointing forward down
    knifeRoot.rotation.y = 0;
    knifeRoot.rotation.z = Math.PI * 0.05; // slight cant

    this.knifeMesh = knifeRoot;
    this.group.add(knifeRoot);

    // Soft ground shadow
    const shadowGeo = new THREE.PlaneGeometry(1.8, 3.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
    });
    this.floorShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.floorShadow.rotation.x = -Math.PI / 2;
    this.floorShadow.position.y = 0.02;
    this.group.add(this.floorShadow);

    this.createButterSparksPool();
  }

  createButterSparksPool() {
    this.sparkPool = [];
    const sparkGeo = new THREE.DodecahedronGeometry(0.08);
    for (let i = 0; i < 20; i++) {
      const spark = new THREE.Mesh(sparkGeo, this.butterMaterial);
      spark.visible = false;
      this.scene.add(spark);
      this.sparkPool.push({
        mesh: spark,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.4,
      });
    }
  }

  emitSparks(origin) {
    for (let i = 0; i < 3; i++) {
      const spark = this.sparkPool.find((s) => !s.mesh.visible);
      if (!spark) break;

      spark.mesh.position.copy(origin);
      spark.mesh.visible = true;
      spark.vel.set(
        (Math.random() - 0.5) * 5,
        Math.random() * 4 + 2,
        Math.random() * 4 + 2
      );
      spark.life = 0;
      spark.maxLife = 0.25 + Math.random() * 0.2;
    }
  }

  updateSparks(delta) {
    for (const spark of this.sparkPool) {
      if (!spark.mesh.visible) continue;
      spark.life += delta;
      if (spark.life >= spark.maxLife) {
        spark.mesh.visible = false;
        continue;
      }
      spark.vel.y -= 14 * delta;
      spark.mesh.position.addScaledVector(spark.vel, delta);
      const scale = 1 - spark.life / spark.maxLife;
      spark.mesh.scale.setScalar(scale);
    }
  }

  // Called when player takes damage: knife feints / swoops forward menacingly!
  triggerFeint() {
    this.isFeinting = true;
    this.feintTimer = 0.75;
  }

  // ---------------------------------------------------------------------------
  // Knife Dynamics
  // ---------------------------------------------------------------------------
  update(delta, playerPos, playerSpeed, isBoosting) {
    this.bobTime += delta * 5;
    this.updateSparks(delta);

    // Final slice on game over
    if (this.isSlicing) {
      this.sliceProgress += delta * 3.5;
      this.knifeMesh.rotation.x = -Math.PI * 0.42 + Math.sin(this.sliceProgress * Math.PI) * 1.2;
      this.knifeMesh.position.y = 1.6 - Math.min(this.sliceProgress * 2.2, 1.4);
      this.group.position.z = THREE.MathUtils.lerp(this.group.position.z, playerPos.z + 1.2, 0.15);
      return;
    }

    // Feint swoop attack when player loses a heart
    let currentTargetDist = this.baseDistance;
    if (this.isFeinting) {
      this.feintTimer -= delta;
      if (this.feintTimer <= 0) {
        this.isFeinting = false;
      } else {
        // Lunges up to 7m behind player during feint
        currentTargetDist = 7.5;
        this.knifeMesh.rotation.z = Math.PI * 0.05 + Math.sin(this.feintTimer * 10) * 0.3;
      }
    } else if (isBoosting) {
      currentTargetDist = this.baseDistance + 6.0;
    }

    this.distance = THREE.MathUtils.lerp(this.distance, currentTargetDist, delta * 3.5);

    // Follow player in Z
    this.group.position.z = playerPos.z + this.distance;

    // Track player's X lane with gentle inertia
    this.currentX = THREE.MathUtils.lerp(this.currentX, playerPos.x, delta * 4.0);
    this.group.position.x = this.currentX;

    // Menacing floating bob
    const bobHeight = Math.sin(this.bobTime) * 0.18;
    this.knifeMesh.position.y = 2.4 + bobHeight;

    // Tilting sway
    const xDiff = playerPos.x - this.currentX;
    this.knifeMesh.rotation.z = Math.PI * 0.05 + xDiff * 0.12;

    this.floorShadow.material.opacity = 0.28;
  }

  triggerSlice() {
    this.isSlicing = true;
    this.sliceProgress = 0;
  }

  reset() {
    this.distance = this.baseDistance;
    this.targetDistance = this.baseDistance;
    this.isFeinting = false;
    this.feintTimer = 0;
    this.isSlicing = false;
    this.sliceProgress = 0;
    this.currentX = 0;
  }
}
