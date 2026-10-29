import * as THREE from 'three';
import { CONFIG } from '../config.js';

/* ==========================================================================
   GESTIONNAIRE DU MONDE & DU PREMIER CHUNK — BWED WORLD
   La Grand-Place du Beurre Doré : place pavée, fontaine centrale, lanternes
   ========================================================================== */

export class WorldManager {
  constructor(scene, physics) {
    this.scene = scene;
    this.physics = physics;
    this.worldGroup = new THREE.Group();
    this.groundMesh = null;

    this.scene.add(this.worldGroup);
    this.initLighting();
    this.buildVillageCenter();
  }

  initLighting() {
    const biome = CONFIG.biome;

    // Lumière ambiante chaude
    const ambient = new THREE.AmbientLight(biome.ambientColor, biome.ambientIntensity);
    this.worldGroup.add(ambient);

    // Soleil doré en fin d'après-midi
    const sun = new THREE.DirectionalLight(biome.sunColor, biome.sunIntensity);
    sun.position.set(...biome.sunPosition);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;
    sun.shadow.camera.left = -35;
    sun.shadow.camera.right = 35;
    sun.shadow.camera.top = 35;
    sun.shadow.camera.bottom = -35;
    sun.shadow.bias = -0.0006;
    this.worldGroup.add(sun);

    // Ciel chaleureux
    const hemiLight = new THREE.HemisphereLight(0xfff6ea, 0x5a341e, 0.6);
    this.worldGroup.add(hemiLight);
  }

  buildVillageCenter() {
    // 1. Terrain de base en herbe matcha douce
    const groundGeo = new THREE.PlaneGeometry(80, 80, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x6e8f48, // Vert matcha doux
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.worldGroup.add(ground);
    this.groundMesh = ground;

    // 2. Grand pavage circulaire de la place (pierre chaude couleur biscuit)
    const plazaGeo = new THREE.CircleGeometry(16, 32);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xe6cfb8,
      roughness: 0.7,
      metalness: 0.08
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = 0.02;
    plaza.receiveShadow = true;
    this.worldGroup.add(plaza);

    // Bordure en pierre caramel autour de la place
    const curbGeo = new THREE.RingGeometry(15.7, 16.5, 32);
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x9e6a3d,
      roughness: 0.6
    });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.rotation.x = -Math.PI / 2;
    curb.position.y = 0.03;
    curb.receiveShadow = true;
    this.worldGroup.add(curb);

    // 3. Chemins radiaux vers les 4 points cardinaux
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xd9be9b,
      roughness: 0.75
    });

    // Allée Nord-Sud
    const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(6, 60), roadMat);
    roadNS.rotation.x = -Math.PI / 2;
    roadNS.position.y = 0.015;
    roadNS.receiveShadow = true;
    this.worldGroup.add(roadNS);

    // Allée Est-Ouest
    const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(60, 6), roadMat);
    roadEW.rotation.x = -Math.PI / 2;
    roadEW.position.y = 0.015;
    roadEW.receiveShadow = true;
    this.worldGroup.add(roadEW);

    // 4. Landmark central : La Fontaine au Beurre Fondant
    this.buildCenterLandmark();

    // 5. Mobilier urbain cosy : Lanternes et bancs
    this.buildStreetLamps();
    this.buildBenches();
    this.buildPastryTrees();
  }

  buildCenterLandmark() {
    const centerGroup = new THREE.Group();
    centerGroup.position.set(0, 0, 0);

    // Bassin en pierre
    const basinMat = new THREE.MeshStandardMaterial({
      color: 0xd4ba9e,
      roughness: 0.6,
      metalness: 0.1
    });
    const basinBase = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.7, 24), basinMat);
    basinBase.position.y = 0.35;
    basinBase.castShadow = true;
    basinBase.receiveShadow = true;
    centerGroup.add(basinBase);

    // Eau miroitante dorée / miel
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4fa8c8,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.85
    });
    const water = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.1, 24), waterMat);
    water.position.y = 0.65;
    centerGroup.add(water);

    // Colonne centrale de la fontaine
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 2.2, 16), basinMat);
    pillar.position.y = 1.3;
    pillar.castShadow = true;
    centerGroup.add(pillar);

    // Vasque supérieure
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.7, 0.45, 16), basinMat);
    bowl.position.y = 2.4;
    bowl.castShadow = true;
    centerGroup.add(bowl);

    // Orbe doré sommital (Le Pain Doré Sacré)
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xffd15a,
      roughness: 0.25,
      metalness: 0.6,
      emissive: 0xe59b24,
      emissiveIntensity: 0.3
    });
    const goldenBread = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 20), orbMat);
    goldenBread.position.y = 3.1;
    goldenBread.castShadow = true;
    centerGroup.add(goldenBread);

    this.worldGroup.add(centerGroup);

    // Obstacle physique
    this.physics.addObstacle(0, 0, 3.8);
  }

  buildStreetLamps() {
    const lampPositions = [
      { x: -11, z: -11 },
      { x: 11, z: -11 },
      { x: -11, z: 11 },
      { x: 11, z: 11 }
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.5, metalness: 0.4 });
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffe28a,
      emissive: 0xffb84d,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    lampPositions.forEach(pos => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(pos.x, 0, pos.y || pos.z);

      // Poteau en bois sombre
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.4, 8), poleMat);
      pole.position.y = 1.7;
      pole.castShadow = true;
      lampGroup.add(pole);

      // Lanterne
      const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.55), lanternMat);
      lantern.position.y = 3.4;
      lampGroup.add(lantern);

      // Lueur chaude
      const light = new THREE.PointLight(0xffa834, 1.2, 10);
      light.position.y = 3.4;
      lampGroup.add(light);

      this.worldGroup.add(lampGroup);
      this.physics.addObstacle(pos.x, pos.y || pos.z, 0.4);
    });
  }

  buildBenches() {
    const benchPositions = [
      { x: -8, z: 0, rot: Math.PI / 2 },
      { x: 8, z: 0, rot: -Math.PI / 2 },
      { x: 0, z: -8, rot: 0 },
      { x: 0, z: 8, rot: Math.PI }
    ];

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xa8683b, roughness: 0.6 });

    benchPositions.forEach(b => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.8), woodMat);
      bench.position.set(b.x, 0.22, b.z);
      bench.rotation.y = b.rot;
      bench.castShadow = true;
      bench.receiveShadow = true;
      this.worldGroup.add(bench);
      this.physics.addObstacle(b.x, b.z, 1.1);
    });
  }

  buildPastryTrees() {
    const treePositions = [
      { x: -18, z: -16, scale: 1.1 },
      { x: -22, z: -8, scale: 0.9 },
      { x: -16, z: 18, scale: 1.2 },
      { x: 18, z: -18, scale: 1.0 },
      { x: 22, z: 12, scale: 1.15 },
      { x: 14, z: 22, scale: 0.85 }
    ];

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4325, roughness: 0.8 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x558a38, roughness: 0.5 }); // Cône matcha

    treePositions.forEach(t => {
      const tree = new THREE.Group();
      tree.position.set(t.x, 0, t.z);
      tree.scale.set(t.scale, t.scale, t.scale);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8), trunkMat);
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      // 3 étages de cône moelleux
      for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2 - i * 0.45, 1.8, 8), foliageMat);
        cone.position.y = 2.4 + i * 1.1;
        cone.castShadow = true;
        tree.add(cone);
      }

      this.worldGroup.add(tree);
      this.physics.addObstacle(t.x, t.z, 1.2 * t.scale);
    });
  }
}
