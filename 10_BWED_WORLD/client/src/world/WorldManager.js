import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from '../config.js';
import { TextureGenerator } from './TextureGenerator.js';

/* ==========================================================================
   GESTIONNAIRE DU MONDE & DES BIOMES MULTIPLES — BWED WORLD (JALON 2)
   - Zone 1 : La Grand-Place du Beurre Doré (Bâtiments, boutiques, café terrasse)
   - Transition : Le Pont du Beurre d'Amande sur le Canal Chocolaté
   - Zone 2 : Le Quartier Cacao & Bois de Matcha (Gare du Train, Clairière Chamallow)
   - Fondu progressif d'ambiance (ciel, brouillard, éclairage)
   ========================================================================== */

export class WorldManager {
  constructor(scene, physics, onDistrictChange = null) {
    this.scene = scene;
    this.physics = physics;
    this.onDistrictChange = onDistrictChange;

    this.worldGroup = new THREE.Group();
    this.scene.add(this.worldGroup);

    this.textures = new TextureGenerator();
    this.gltfLoader = new GLTFLoader();
    this.gltfCache = new Map();

    // Shared procedural geometries & materials to minimize draw calls and GPU memory allocations
    this.sharedGeos = {
      trunk: new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8),
      cone0: new THREE.ConeGeometry(2.2, 1.8, 8),
      cone1: new THREE.ConeGeometry(1.75, 1.8, 8),
      cone2: new THREE.ConeGeometry(1.3, 1.8, 8),
      boulder: new THREE.DodecahedronGeometry(1.0),
      lanternPole: new THREE.CylinderGeometry(0.12, 0.16, 2.6, 8),
      lanternHead: new THREE.BoxGeometry(0.7, 0.8, 0.7),
      macaronShell: new THREE.CylinderGeometry(0.9, 0.9, 0.28, 16),
      macaronCream: new THREE.CylinderGeometry(0.82, 0.82, 0.16, 16),
      bushCluster: new THREE.DodecahedronGeometry(0.7),
      sugarSpire: new THREE.ConeGeometry(0.5, 2.4, 6)
    };

    this.sharedMats = {
      woodTrunk: new THREE.MeshStandardMaterial({ color: 0x6e4325, roughness: 0.8 }),
      matchaFoliage: new THREE.MeshStandardMaterial({ color: 0x558a38, roughness: 0.5 }),
      forestFoliage: new THREE.MeshStandardMaterial({ color: 0x3d5a2b, roughness: 0.5 }),
      cocoaRock: new THREE.MeshStandardMaterial({ color: 0x3d2417, roughness: 0.75, metalness: 0.1 }),
      lanternWood: new THREE.MeshStandardMaterial({ color: 0x4a2a16, roughness: 0.7 }),
      lanternGlow: new THREE.MeshStandardMaterial({ color: 0xffd175, emissive: 0xff9900, emissiveIntensity: 0.9 }),
      macaronPink: new THREE.MeshStandardMaterial({ color: 0xf49fb6, roughness: 0.4 }),
      macaronCream: new THREE.MeshStandardMaterial({ color: 0xfff3db, roughness: 0.35 }),
      butterFlower: new THREE.MeshStandardMaterial({ color: 0xffe279, roughness: 0.4 }),
      sugarCrystal: new THREE.MeshStandardMaterial({ color: 0x6ee7b7, emissive: 0x059669, emissiveIntensity: 0.35, roughness: 0.2 })
    };

    // Atmosphere caching & references
    this.ambientLight = null;
    this.sunLight = null;
    this.hemiLight = null;
    this.currentDistrictKey = null;
    this.lastAtmospherePos = null;

    // Animated objects
    this.animatedProps = [];
    this.groundMesh = null;

    // Zones interactives avec le joueur (Jalon 3 & 4)
    this.interactionZones = [
      {
        id: 'bakery',
        title: 'Golden Crust Bakery',
        actionLabel: 'Enter Bakery',
        x: -10.5,
        z: -1.5,
        radius: 3.2,
        targetOverlay: 'bakeryModal'
      },
      {
        id: 'cafe',
        title: 'The Happy Toast Cafe',
        actionLabel: 'Visit Community Cafe',
        x: 10.5,
        z: -1.5,
        radius: 3.2,
        targetOverlay: 'cafeModal'
      },
      {
        id: 'mill',
        title: 'The Sourdough Windmill',
        actionLabel: 'View Lore & Roadmap',
        x: 9.5,
        z: -11.0,
        radius: 3.2,
        targetOverlay: 'millModal'
      },
      {
        id: 'train_station',
        title: 'Chocolate Train Station',
        actionLabel: 'Check Train Routes',
        x: -7.5,
        z: 54.0,
        radius: 3.5,
        targetOverlay: 'trainModal'
      },
      {
        id: 'portal',
        title: 'Mini-Game Arcade Portal',
        actionLabel: 'Enter Mini-Game Portal',
        x: 0,
        z: 80.0,
        radius: 3.5,
        targetOverlay: 'minigameModal'
      }
    ];

    this.initAtmosphere();
    this.buildZone1VillageCenter();
    this.buildTransitionPassage();
    this.buildZone2CacaoForest();
    this.buildSweetPollenParticles();
  }

  buildSweetPollenParticles() {
    const count = 75;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = 0.5 + Math.random() * 6.0;
      positions[i * 3 + 2] = -25 + Math.random() * 115;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffe8b0,
      size: 1.6,
      transparent: true,
      opacity: 0.5,
      depthWrite: false
    });

    const particles = new THREE.Points(geo, mat);
    this.worldGroup.add(particles);

    // Optimized transform-level animation: zero CPU vertex iteration, zero GPU buffer re-upload
    this.animatedProps.push({
      mesh: particles,
      update: (delta, elapsed) => {
        particles.rotation.y = elapsed * 0.025;
        particles.position.y = Math.sin(elapsed * 0.45) * 0.35;
      }
    });
  }

  getNearestInteraction(playerPos) {
    if (!playerPos) return null;
    let closest = null;
    let minDistance = Infinity;

    for (let i = 0; i < this.interactionZones.length; i++) {
      const zone = this.interactionZones[i];
      const dx = playerPos.x - zone.x;
      const dz = playerPos.z - zone.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist <= zone.radius && dist < minDistance) {
        minDistance = dist;
        closest = zone;
      }
    }
    return closest;
  }

  /* --------------------------------------------------------------------------
     1. ATMOSPHERIC LIGHTING & BIOME PROGRESSION
     -------------------------------------------------------------------------- */
  initAtmosphere() {
    const z1 = CONFIG.biomes['village-center'];

    // Sky and fog
    this.scene.background = new THREE.Color(z1.skyColor);
    this.scene.fog = new THREE.Fog(z1.fogColor, z1.fogNear, z1.fogFar);

    // Ambient light
    this.ambientLight = new THREE.AmbientLight(z1.ambientColor, z1.ambientIntensity);
    this.worldGroup.add(this.ambientLight);

    // Directional golden sun with optimized 1024x1024 shadow map
    this.sunLight = new THREE.DirectionalLight(z1.sunColor, z1.sunIntensity);
    this.sunLight.position.set(...z1.sunPosition);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 240;
    this.sunLight.shadow.camera.left = -80;
    this.sunLight.shadow.camera.right = 80;
    this.sunLight.shadow.camera.top = 80;
    this.sunLight.shadow.camera.bottom = -80;
    this.sunLight.shadow.bias = -0.0006;
    this.worldGroup.add(this.sunLight);

    // Hemisphere light
    this.hemiLight = new THREE.HemisphereLight(0xfff6ea, 0x4a2a16, 0.65);
    this.worldGroup.add(this.hemiLight);
  }

  updateAtmosphere(playerPos) {
    if (!playerPos) return;

    // Throttle calculation when player is standing still
    if (!this.lastAtmospherePos) {
      this.lastAtmospherePos = new THREE.Vector3();
    }
    const distSq = this.lastAtmospherePos.distanceToSquared(playerPos);
    if (distSq < 0.04) {
      return;
    }
    this.lastAtmospherePos.copy(playerPos);

    const z1 = CONFIG.biomes['village-center'];
    const z2 = CONFIG.biomes['cacao-forest'];

    // Linear transition along bridge (Z = 20 -> Z = 40)
    const rawRatio = THREE.MathUtils.clamp((playerPos.z - 20) / 20, 0, 1);
    const t = rawRatio * rawRatio * (3 - 2 * rawRatio);

    // Color blending
    const skyCol = new THREE.Color(z1.skyColor).lerp(new THREE.Color(z2.skyColor), t);
    const fogCol = new THREE.Color(z1.fogColor).lerp(new THREE.Color(z2.fogColor), t);
    this.scene.background.copy(skyCol);
    this.scene.fog.color.copy(fogCol);
    this.scene.fog.near = THREE.MathUtils.lerp(z1.fogNear, z2.fogNear, t);
    this.scene.fog.far = THREE.MathUtils.lerp(z1.fogFar, z2.fogFar, t);

    // Ambient light interpolation
    const ambCol = new THREE.Color(z1.ambientColor).lerp(new THREE.Color(z2.ambientColor), t);
    this.ambientLight.color.copy(ambCol);
    this.ambientLight.intensity = THREE.MathUtils.lerp(z1.ambientIntensity, z2.ambientIntensity, t);

    // Sun light interpolation
    const sunCol = new THREE.Color(z1.sunColor).lerp(new THREE.Color(z2.sunColor), t);
    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = THREE.MathUtils.lerp(z1.sunIntensity, z2.sunIntensity, t);

    // District badge detection for HUD
    let newDistrictKey = 'village-center';
    let kicker = 'CENTRAL VILLAGE &middot; HUB';
    let name = 'The Golden Butter Square';

    if (playerPos.z >= 20 && playerPos.z <= 40) {
      newDistrictKey = 'bridge-passage';
      kicker = 'CROSSING &middot; CHOCOLATE CANAL';
      name = 'Almond Butter Bridge';
    } else if (playerPos.z > 40) {
      newDistrictKey = 'cacao-forest';
      kicker = 'COCOA DISTRICT &middot; NATURE';
      name = 'Cocoa Woods & Matcha Clearing';
    }

    if (newDistrictKey !== this.currentDistrictKey) {
      this.currentDistrictKey = newDistrictKey;
      if (this.onDistrictChange) {
        this.onDistrictChange({ key: newDistrictKey, kicker, name });
      }
    }
  }

  /* --------------------------------------------------------------------------
     2. ZONE 1 : LA GRAND-PLACE DU BEURRE DORÉ
     -------------------------------------------------------------------------- */
  buildZone1VillageCenter() {
    const z1Group = new THREE.Group();
    this.worldGroup.add(z1Group);

    // 1. Soft Matcha grass ground (Zone 1: Z from -32 to 22, X from -36 to 36)
    const groundGeo = new THREE.PlaneGeometry(72, 54, 20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.textures.getMatchaGrassTexture(),
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -5);
    ground.receiveShadow = true;
    z1Group.add(ground);
    this.groundMesh = ground;

    // 2. Compact circular plaza cobblestone (radius 11m, diameter 22m)
    const plazaGeo = new THREE.CircleGeometry(11, 32);
    const plazaMat = new THREE.MeshStandardMaterial({
      map: this.textures.getCobblestoneTexture(),
      roughness: 0.7,
      metalness: 0.08
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.02, 0);
    plaza.receiveShadow = true;
    z1Group.add(plaza);

    // Caramel stone curb
    const curbGeo = new THREE.RingGeometry(10.7, 11.4, 32);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x9e6a3d, roughness: 0.6 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.rotation.x = -Math.PI / 2;
    curb.position.set(0, 0.03, 0);
    curb.receiveShadow = true;
    z1Group.add(curb);

    // 3. Cobblestone walkways connecting the plaza
    const roadMat = new THREE.MeshStandardMaterial({
      map: this.textures.getCobblestoneTexture(),
      roughness: 0.75
    });

    // South Avenue towards the bridge (Z from 9 to 22, width 6m)
    const roadSouth = new THREE.Mesh(new THREE.PlaneGeometry(6, 13), roadMat);
    roadSouth.rotation.x = -Math.PI / 2;
    roadSouth.position.set(0, 0.015, 15.5);
    roadSouth.receiveShadow = true;
    z1Group.add(roadSouth);

    // North Promenade towards the overlook (Z from -9 to -22, width 5m)
    const roadNorth = new THREE.Mesh(new THREE.PlaneGeometry(5, 13), roadMat);
    roadNorth.rotation.x = -Math.PI / 2;
    roadNorth.position.set(0, 0.015, -15.5);
    roadNorth.receiveShadow = true;
    z1Group.add(roadNorth);

    // West Alley towards the Bakery entrance (X from -8 to -14, width 5m)
    const roadWest = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), roadMat);
    roadWest.rotation.x = -Math.PI / 2;
    roadWest.position.set(-10.5, 0.015, -1.5);
    roadWest.receiveShadow = true;
    z1Group.add(roadWest);

    // East Alley towards the Honey Cafe terrace (X from 8 to 14, width 5m)
    const roadEast = new THREE.Mesh(new THREE.PlaneGeometry(7, 5), roadMat);
    roadEast.rotation.x = -Math.PI / 2;
    roadEast.position.set(10.5, 0.015, -1.5);
    roadEast.receiveShadow = true;
    z1Group.add(roadEast);

    // 4. Central Golden Fountain
    this.buildFountain(z1Group, 0, 0);

    // 5. West Landmark: Golden Crust Bakery (X: -13.0, Z: -1.5)
    this.buildBakeryShop(z1Group, -13.0, -1.5);

    // 6. East Landmark: The Happy Toast Cafe (X: 13.0, Z: -1.5)
    this.buildCafeTerrace(z1Group, 13.0, -1.5);

    // 7. North-West Landmark: Sweet Boutique Atelier (X: -10.5, Z: -12.5)
    this.buildCuteShop(z1Group, -10.5, -12.5, 'L Atelier Sucre', 0x9b5b3a, Math.PI / 4);

    // 8. North-East Landmark: Sourdough Windmill (X: 11.0, Z: -12.5)
    this.buildWindmill(z1Group, 11.0, -12.5);

    // 9. Street furniture, lighting & botanical props
    this.placeZone1Props(z1Group);
  }

  buildFountain(parent, x, z) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4ba9e, roughness: 0.6, metalness: 0.1 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x4fa8c8,
      roughness: 0.1,
      metalness: 0.35,
      transparent: true,
      opacity: 0.88
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd15a,
      roughness: 0.25,
      metalness: 0.65,
      emissive: 0xe59b24,
      emissiveIntensity: 0.25
    });

    // Circular basin
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.0, 0.6, 24), stoneMat);
    basin.position.y = 0.3;
    basin.castShadow = true;
    basin.receiveShadow = true;
    group.add(basin);

    // Water surface
    const water = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.1, 24), waterMat);
    water.position.y = 0.55;
    group.add(water);

    // Center pedestal
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.9, 1.8, 16), stoneMat);
    pillar.position.y = 1.1;
    pillar.castShadow = true;
    group.add(pillar);

    // Upper bowl
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.6, 0.38, 16), stoneMat);
    bowl.position.y = 2.0;
    bowl.castShadow = true;
    group.add(bowl);

    // Golden Brioche orb
    const briocheOrb = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), goldMat);
    briocheOrb.position.y = 2.6;
    briocheOrb.castShadow = true;
    group.add(briocheOrb);

    parent.add(group);
    this.physics.addObstacle(x, z, 3.0);

    // Golden bloom floral sculpture on the fountain
    this.loadProp('./assets/props/golden-bloom.glb', x, 0.6, z, {
      scale: 0.7,
      radius: 0
    });
  }

  buildBakeryShop(parent, x, z) {
    this.loadProp('./assets/props/bakery-house.glb', x, 0, z, {
      scale: 1.0,
      rotY: Math.PI / 2,
      radius: 4.5,
      fallbackType: 'box'
    });

    // Outside bakery decor: Bread cubes crate
    this.loadProp('./assets/props/bread-cubes.glb', x + 2.0, 0, z - 3.2, {
      scale: 0.85,
      rotY: 0.2,
      radius: 0.8
    });

    // Macaron stool near doorway
    this.buildMacaronStool(parent, x + 2.2, z + 2.8, 0.85);
  }

  buildCafeTerrace(parent, x, z) {
    this.loadProp('./assets/props/honey-cafe.glb', x, 0, z, {
      scale: 1.0,
      rotY: -Math.PI / 2,
      radius: 4.5,
      fallbackType: 'box'
    });

    // Hazelnut cup on cafe terrace table
    this.loadProp('./assets/props/hazelnut-cup.glb', x - 2.5, 0.25, z - 2.0, {
      scale: 0.5,
      rotY: 0.3,
      radius: 0.4,
      fallbackType: 'cup'
    });

    // Pretzel bench facing the plaza
    this.loadProp('./assets/props/pretzel-bench.glb', x - 2.5, 0.2, z + 2.0, {
      scale: 1.0,
      rotY: -Math.PI / 2,
      radius: 1.1,
      fallbackType: 'bench'
    });

    // Pastry dessert prop on terrace table
    this.loadProp('./assets/props/pastry-dessert.glb', x - 2.5, 0.25, z - 2.8, {
      scale: 0.8,
      rotY: 0.1,
      radius: 0.5
    });
  }

  buildCuteShop(parent, x, z, signText, roofColor, rotY = 0) {
    const shop = new THREE.Group();
    shop.position.set(x, 0, z);
    shop.rotation.y = rotY;

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffeed6, roughness: 0.75 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.55 });

    const walls = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.8, 5.5), wallMat);
    walls.position.y = 1.9;
    walls.castShadow = true;
    shop.add(walls);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.4, 2.4, 4), roofMat);
    roof.position.y = 4.8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    shop.add(roof);

    // Glowing storefront window
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xffd175,
      emissive: 0xff9900,
      emissiveIntensity: 0.5
    });
    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 0.2), winMat);
    windowMesh.position.set(0, 1.6, 2.8);
    shop.add(windowMesh);

    parent.add(shop);
    this.physics.addObstacle(x, z, 3.5);

    // Treasure chest tucked beside the boutique
    this.loadProp('./assets/props/treasure-chest.glb', x - 2.6, 0, z + 2.0, {
      scale: 0.85,
      rotY: 0.4,
      radius: 1.0
    });
  }

  buildWindmill(parent, x, z) {
    const mill = new THREE.Group();
    mill.position.set(x, 0, z);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xdec6ab, roughness: 0.7 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x6e3d22, roughness: 0.6 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xfff9f0, roughness: 0.4 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a16, roughness: 0.7 });

    // Conical tower
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.8, 7.0, 16), stoneMat);
    tower.position.y = 3.5;
    tower.castShadow = true;
    tower.receiveShadow = true;
    mill.add(tower);

    // Upper dome cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.8, 16), capMat);
    cap.position.y = 7.8;
    cap.castShadow = true;
    mill.add(cap);

    // Blade hub
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.7, 8), woodMat);
    hub.position.set(0, 6.5, 2.0);
    hub.rotation.x = Math.PI / 2;
    mill.add(hub);

    // Rotating windmill blades
    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 6.5, 2.4);

    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.8, 0.08), woodMat);
      arm.position.y = 1.9;
      arm.castShadow = true;

      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 3.0), bladeMat);
      cloth.position.set(0.38, 2.0, 0.04);

      const blade = new THREE.Group();
      blade.rotation.z = (i * Math.PI) / 2;
      blade.add(arm);
      blade.add(cloth);
      bladesGroup.add(blade);
    }

    mill.add(bladesGroup);
    this.animatedProps.push({
      mesh: bladesGroup,
      update: (delta) => {
        bladesGroup.rotation.z -= delta * 0.9;
      }
    });

    parent.add(mill);
    this.physics.addObstacle(x, z, 3.4);
  }

  placeZone1Props(parent) {
    // Pretzel benches around the central plaza
    const benchConfigs = [
      { x: -4.5, z: 4.5, rotY: Math.PI * 0.25 },
      { x: 4.5, z: 4.5, rotY: -Math.PI * 0.25 },
      { x: -4.5, z: -4.5, rotY: Math.PI * 0.75 },
      { x: 4.5, z: -4.5, rotY: -Math.PI * 0.75 }
    ];

    benchConfigs.forEach((b) => {
      this.loadProp('./assets/props/pretzel-bench.glb', b.x, 0, b.z, {
        scale: 1.0,
        rotY: b.rotY,
        radius: 1.1,
        fallbackType: 'bench'
      });
    });

    // Honey lanterns around the plaza and south avenue entrance
    const lanternConfigs = [
      { x: -7.5, z: -7.5 },
      { x: 7.5, z: -7.5 },
      { x: -7.5, z: 7.5 },
      { x: 7.5, z: 7.5 },
      { x: -3.2, z: 19.0 },
      { x: 3.2, z: 19.0 }
    ];

    lanternConfigs.forEach((l) => {
      this.loadProp('./assets/props/honey-lantern.glb', l.x, 0, l.z, {
        scale: 1.0,
        radius: 0.5,
        fallbackType: 'lantern'
      });
    });

    // Conical matcha pastry trees
    const treePositions = [
      { x: -13.5, z: -9.0, scale: 1.05 },
      { x: 13.5, z: -9.0, scale: 1.05 },
      { x: -10.0, z: 15.0, scale: 0.95 },
      { x: 10.0, z: 15.0, scale: 0.95 }
    ];

    treePositions.forEach((tp) => {
      this.buildPastryTree(parent, tp.x, tp.z, tp.scale);
    });

    // Majestic Pistachio trees framing the village south entrance
    this.loadProp('./assets/props/pistachio-tree.glb', -11.0, 0, 6.5, {
      scale: 1.05,
      radius: 1.4,
      fallbackType: 'tree'
    });
    this.loadProp('./assets/props/pistachio-tree.glb', 11.0, 0, 6.5, {
      scale: 1.05,
      radius: 1.4,
      fallbackType: 'tree'
    });

    // Golden Croissant monument in the north promenade
    this.loadProp('./assets/props/golden-croissant.glb', 0, 0, -8.5, {
      scale: 0.85,
      rotY: 0,
      radius: 1.4
    });

    // Butter bushes and sugar crystals along the walkways
    this.buildButterBush(parent, -7.0, 2.5, 0.85);
    this.buildButterBush(parent, 7.0, 2.5, 0.85);
    this.buildSugarCrystal(parent, -5.5, -8.0, 0.85);
    this.buildSugarCrystal(parent, 5.5, -8.0, 0.85);
  }

  /* --------------------------------------------------------------------------
     3. TRANSITION : LE PONT DU BEURRE D'AMANDE & LE CANAL CHOCOLATÉ
     -------------------------------------------------------------------------- */
  buildTransitionPassage() {
    const bridgeGroup = new THREE.Group();
    this.worldGroup.add(bridgeGroup);

    // 1. Chocolate Canal Bed (Z: 20 to 40, X: -50 to 50, depth at Y = -0.6)
    const canalBedGeo = new THREE.PlaneGeometry(100, 20);
    const chocolateMat = new THREE.MeshStandardMaterial({
      map: this.textures.getChocolateWaterTexture(),
      roughness: 0.22,
      metalness: 0.38,
      emissive: 0x140803,
      emissiveIntensity: 0.25
    });
    const canalWater = new THREE.Mesh(canalBedGeo, chocolateMat);
    canalWater.rotation.x = -Math.PI / 2;
    canalWater.position.set(0, -0.55, 30);
    canalWater.receiveShadow = true;
    bridgeGroup.add(canalWater);

    // Stone riverbanks along the canal (North: Z = 20, South: Z = 40)
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x8a5a35, roughness: 0.7 });
    const bankNorth = new THREE.Mesh(new THREE.BoxGeometry(100, 1.0, 1.2), bankMat);
    bankNorth.position.set(0, -0.15, 20);
    bankNorth.receiveShadow = true;
    bridgeGroup.add(bankNorth);

    const bankSouth = new THREE.Mesh(new THREE.BoxGeometry(100, 1.0, 1.2), bankMat);
    bankSouth.position.set(0, -0.15, 40);
    bankSouth.receiveShadow = true;
    bridgeGroup.add(bankSouth);

    // Physical obstacles along the canal banks to prevent walking into the canal
    // (Leaves an opening from X: -4.0 to +4.0 for bridge crossing)
    this.physics.addObstacle(-18, 20.5, 14);
    this.physics.addObstacle(18, 20.5, 14);
    this.physics.addObstacle(-18, 39.5, 14);
    this.physics.addObstacle(18, 39.5, 14);

    // 2. The Almond Butter Bridge (Width 7.0m: X: -3.5 to +3.5, Length 22m: Z: 19 to 41)
    const bridgeDeckMat = new THREE.MeshStandardMaterial({
      map: this.textures.getWafflePlanksTexture(),
      roughness: 0.6
    });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.4, 22), bridgeDeckMat);
    deck.position.set(0, 0.18, 30);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Caramel stone support arches under the bridge
    const archMat = new THREE.MeshStandardMaterial({ color: 0x7c4927, roughness: 0.8 });
    const arch1 = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 7.2, 16, 1, false, 0, Math.PI), archMat);
    arch1.rotation.z = Math.PI / 2;
    arch1.rotation.y = Math.PI;
    arch1.position.set(0, -0.5, 25);
    bridgeGroup.add(arch1);

    const arch2 = arch1.clone();
    arch2.position.set(0, -0.5, 35);
    bridgeGroup.add(arch2);

    // Decorated bridge railings along both sides
    const railMat = new THREE.MeshStandardMaterial({ color: 0x5a2d14, roughness: 0.6 });
    [-3.3, 3.3].forEach((railX) => {
      // Handrail
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 21.6), railMat);
      handrail.position.set(railX, 1.05, 30);
      handrail.castShadow = true;
      bridgeGroup.add(handrail);

      // Posts along railing
      for (let pz = 20; pz <= 40; pz += 3.3) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), railMat);
        post.position.set(railX, 0.6, pz);
        post.castShadow = true;
        bridgeGroup.add(post);
      }
    });

    // Four corner stone pillars with glowing honey lanterns
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x6e391b, roughness: 0.7 });
    const bridgeCorners = [
      { x: -3.3, z: 20 },
      { x: 3.3, z: 20 },
      { x: -3.3, z: 40 },
      { x: 3.3, z: 40 }
    ];

    bridgeCorners.forEach((c) => {
      const stonePillar = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.7, 0.75), pillarMat);
      stonePillar.position.set(c.x, 0.85, c.z);
      stonePillar.castShadow = true;
      bridgeGroup.add(stonePillar);

      this.loadProp('./assets/props/honey-lantern.glb', c.x, 1.7, c.z, {
        scale: 0.85,
        radius: 0.4,
        fallbackType: 'lantern'
      });
    });

    // Submarine vehicle prop floating in the chocolate canal
    this.loadProp('./assets/props/waffle-submarine.glb', 12.0, -0.4, 30.0, {
      scale: 0.9,
      rotY: 0.4,
      radius: 1.8
    });

    // Subtle water shimmer animation
    this.animatedProps.push({
      mesh: canalWater,
      update: (delta, elapsed) => {
        canalWater.position.y = -0.55 + Math.sin(elapsed * 1.5) * 0.025;
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. ZONE 2 : LE QUARTIER CACAO & BOIS DE MATCHA
     -------------------------------------------------------------------------- */
  buildZone2CacaoForest() {
    const z2Group = new THREE.Group();
    this.worldGroup.add(z2Group);

    // 1. Cocoa soil terrain (Z from 40 to 92, X from -36 to 36)
    const groundGeo = new THREE.PlaneGeometry(72, 52, 20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      map: this.textures.getCocoaSoilTexture(),
      roughness: 0.92,
      metalness: 0.04
    });
    const groundZ2 = new THREE.Mesh(groundGeo, groundMat);
    groundZ2.rotation.x = -Math.PI / 2;
    groundZ2.position.set(0, 0, 66);
    groundZ2.receiveShadow = true;
    z2Group.add(groundZ2);

    // Matcha moss patches
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3d5427, roughness: 0.85 });
    const moss1 = new THREE.Mesh(new THREE.CircleGeometry(9.0, 20), mossMat);
    moss1.rotation.x = -Math.PI / 2;
    moss1.position.set(9, 0.02, 60);
    moss1.receiveShadow = true;
    z2Group.add(moss1);

    const moss2 = new THREE.Mesh(new THREE.CircleGeometry(8.0, 20), mossMat);
    moss2.rotation.x = -Math.PI / 2;
    moss2.position.set(-9, 0.02, 56);
    moss2.receiveShadow = true;
    z2Group.add(moss2);

    // Main Cocoa Path from the bridge (Z from 40 to 78, width 5.5m)
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2e, roughness: 0.8 });
    const pathMain = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 38), pathMat);
    pathMain.rotation.x = -Math.PI / 2;
    pathMain.position.set(0, 0.015, 59);
    pathMain.receiveShadow = true;
    z2Group.add(pathMain);

    // Left branch to Chocolate Train Station
    const pathLeft = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.5), pathMat);
    pathLeft.rotation.x = -Math.PI / 2;
    pathLeft.position.set(-6, 0.015, 54);
    pathLeft.receiveShadow = true;
    z2Group.add(pathLeft);

    // Right branch to Marshmallow Campfire Clearing
    const pathRight = new THREE.Mesh(new THREE.PlaneGeometry(12, 4.5), pathMat);
    pathRight.rotation.x = -Math.PI / 2;
    pathRight.position.set(6, 0.015, 56);
    pathRight.receiveShadow = true;
    z2Group.add(pathRight);

    // 2. Landmark 1: Chocolate Train Station (X: -10.0, Z: 54.0)
    this.buildChocolateTrainStation(z2Group, -10.0, 54.0);

    // 3. Landmark 2: Marshmallow Campfire Clearing (X: 10.0, Z: 56.0)
    this.buildMarshmallowCampfireClearing(z2Group, 10.0, 56.0);

    // 4. Attractions, botanical props & dense forest
    this.placeZone2ForestProps(z2Group);

    // 5. Arcade Portal Gate (X: 0, Z: 82.0)
    this.buildMiniGamePortalGate(z2Group, 0, 82.0);
  }

  buildChocolateTrainStation(parent, x, z) {
    const station = new THREE.Group();
    station.position.set(x, 0, z);

    // Railroad tracks (chocolate ties and steel rails)
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.7 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0xc8b49e, metalness: 0.7, roughness: 0.3 });

    // Ties
    for (let tz = -11; tz <= 11; tz += 1.6) {
      const sleeper = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.14, 0.5), sleeperMat);
      sleeper.position.set(-2.0, 0.07, tz);
      sleeper.receiveShadow = true;
      station.add(sleeper);
    }

    // 2 parallel rails
    [-2.9, -1.1].forEach((rx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 24), railMat);
      rail.position.set(rx, 0.22, 0);
      rail.castShadow = true;
      station.add(rail);
    });

    // Elevated wooden platform
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x7a4b27, roughness: 0.65 });
    const platform = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.4, 18), platformMat);
    platform.position.set(2.2, 0.2, 0);
    platform.castShadow = true;
    platform.receiveShadow = true;
    station.add(platform);

    // Station wooden canopy shelter
    const shelter = new THREE.Group();
    shelter.position.set(2.8, 0, 0);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x422410, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x24422b, roughness: 0.5 });

    // Shelter posts
    [-6, 0, 6].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.6, 8), postMat);
      post.position.set(0, 1.8, pz);
      post.castShadow = true;
      shelter.add(post);
    });

    // Canopy roof
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.22, 16), roofMat);
    canopy.position.set(-0.6, 3.7, 0);
    canopy.rotation.z = 0.08;
    canopy.castShadow = true;
    shelter.add(canopy);

    station.add(shelter);
    parent.add(station);

    // Collision for platform & shelter
    this.physics.addObstacle(x + 2.2, z, 2.6);

    // Chocolate train on the tracks!
    this.loadProp('./assets/props/chocolate-train.glb', x - 2.0, 0.3, z, {
      scale: 1.3,
      rotY: 0,
      radius: 2.4,
      fallbackType: 'train'
    });

    // Snack Cart on the station platform
    this.loadProp('./assets/props/snack-cart.glb', x + 2.2, 0.4, z - 5.0, {
      scale: 0.95,
      rotY: Math.PI / 2,
      radius: 1.1
    });
  }

  buildMarshmallowCampfireClearing(parent, x, z) {
    const clearing = new THREE.Group();
    clearing.position.set(x, 0, z);

    // Ring of stones around campfire
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a463a, roughness: 0.8 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.9, 16), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    ring.receiveShadow = true;
    clearing.add(ring);

    // Sitting logs around the fire
    const logMat = new THREE.MeshStandardMaterial({ color: 0x543219, roughness: 0.7 });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + 0.3;
      const lx = Math.cos(angle) * 3.2;
      const lz = Math.sin(angle) * 3.2;

      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.0, 12), logMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = angle + Math.PI / 2;
      log.position.set(lx, 0.3, lz);
      log.castShadow = true;
      clearing.add(log);

      this.physics.addObstacle(x + lx, z + lz, 1.0);
    }

    // Warm campfire light
    const fireLight = new THREE.PointLight(0xff7722, 2.2, 12);
    fireLight.position.set(0, 1.0, 0);
    clearing.add(fireLight);

    this.animatedProps.push({
      mesh: fireLight,
      update: (delta, elapsed) => {
        fireLight.intensity = 2.0 + Math.sin(elapsed * 9) * 0.35 + Math.cos(elapsed * 15) * 0.2;
      }
    });

    parent.add(clearing);
    this.physics.addObstacle(x, z, 1.4);

    // Marshmallow campfire 3D prop
    this.loadProp('./assets/props/marshmallow-campfire.glb', x, 0.05, z, {
      scale: 1.0,
      radius: 1.2,
      fallbackType: 'campfire'
    });
  }

  placeZone2ForestProps(parent) {
    // Churro Coaster ride attraction (West of path)
    this.loadProp('./assets/props/churro-coaster.glb', -11.0, 0, 69.0, {
      scale: 0.85,
      rotY: 0.3,
      radius: 3.6
    });

    // Waffle Tower landmark (East of path)
    this.loadProp('./assets/props/waffle-tower.glb', 11.0, 0, 69.0, {
      scale: 0.95,
      rotY: -0.2,
      radius: 2.2,
      fallbackType: 'box'
    });

    // Teacup Gazebo in the woods
    this.loadProp('./assets/props/teacup-gazebo.glb', -10.5, 0, 44.0, {
      scale: 0.95,
      rotY: 0.3,
      radius: 2.6,
      fallbackType: 'box'
    });

    // Crimson Tree landmark
    this.loadProp('./assets/props/crimson-tree.glb', 10.5, 0, 44.0, {
      scale: 1.05,
      radius: 1.4
    });

    // Glowing Pistachio tree and Cosmic Blocks along the woods trail
    this.loadProp('./assets/props/pistachio-glow.glb', -6.5, 0, 62.0, {
      scale: 0.9,
      radius: 1.1
    });

    this.loadProp('./assets/props/cosmic-blocks.glb', 6.5, 0, 64.0, {
      scale: 0.9,
      radius: 1.2
    });

    // Pistachio trees in the Cocoa Forest
    const pistachioPositions = [
      { x: -14.0, z: 48.0, scale: 1.15 },
      { x: 14.0, z: 48.0, scale: 1.15 },
      { x: -15.0, z: 62.0, scale: 1.25 },
      { x: 15.0, z: 62.0, scale: 1.25 },
      { x: -13.0, z: 76.0, scale: 1.2 },
      { x: 13.0, z: 76.0, scale: 1.2 }
    ];

    pistachioPositions.forEach((pt) => {
      this.loadProp('./assets/props/pistachio-tree.glb', pt.x, 0, pt.z, {
        scale: pt.scale,
        radius: 1.5 * pt.scale,
        fallbackType: 'tree'
      });
    });

    // Dark matcha pines and cocoa boulders
    this.buildPastryTree(parent, -6.5, 47.0, 0.95, 0x3d5a2b);
    this.buildPastryTree(parent, 6.5, 49.0, 1.0, 0x3d5a2b);
    this.buildChocolateBoulder(parent, -7.5, 74.0, 1.1);
    this.buildChocolateBoulder(parent, 7.5, 74.0, 1.1);

    // Honey lanterns guiding the cocoa forest trail
    const forestLanterns = [
      { x: -3.2, z: 46.0 },
      { x: 3.2, z: 54.0 },
      { x: -3.2, z: 64.0 },
      { x: 3.2, z: 74.0 }
    ];

    forestLanterns.forEach((fl) => {
      this.loadProp('./assets/props/honey-lantern.glb', fl.x, 0, fl.z, {
        scale: 1.0,
        radius: 0.5,
        fallbackType: 'lantern'
      });
    });
  }

  buildMiniGamePortalGate(parent, x, z) {
    const portal = new THREE.Group();
    portal.position.set(x, 0, z);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a341b, roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd15a,
      roughness: 0.3,
      metalness: 0.6,
      emissive: 0xff9900,
      emissiveIntensity: 0.35
    });

    // Arch pillars
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(0.9, 5.2, 0.9), woodMat);
    pillarL.position.set(-3.2, 2.6, 0);
    pillarL.castShadow = true;
    portal.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(0.9, 5.2, 0.9), woodMat);
    pillarR.position.set(3.2, 2.6, 0);
    pillarR.castShadow = true;
    portal.add(pillarR);

    // Top beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.2, 1.0, 1.1), woodMat);
    beam.position.set(0, 5.4, 0);
    beam.castShadow = true;
    portal.add(beam);

    // Golden portal sign
    const sign = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.9, 0.2), goldMat);
    sign.position.set(0, 4.4, 0);
    portal.add(sign);

    // Sparkling emerald vortex disc
    const portalDiscMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2
    });
    const portalDisc = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), portalDiscMat);
    portalDisc.position.set(0, 2.6, 0);
    portal.add(portalDisc);

    this.animatedProps.push({
      mesh: portalDisc,
      update: (delta, elapsed) => {
        portalDisc.rotation.z += delta * 0.6;
        portalDiscMat.emissiveIntensity = 0.6 + Math.sin(elapsed * 3) * 0.25;
      }
    });

    parent.add(portal);
    this.physics.addObstacle(x - 3.2, z, 0.9);
    this.physics.addObstacle(x + 3.2, z, 0.9);

    // 3D Arcade Duel cabinet near portal
    this.loadProp('./assets/props/arcade-duel.glb', x - 3.8, 0, z + 1.2, {
      scale: 1.0,
      rotY: 0.3,
      radius: 1.3,
      fallbackType: 'box'
    });

    // Lucky Bwed giant 3D dice monument near portal
    this.loadProp('./assets/props/bwed-dice.glb', x + 3.8, 0.3, z + 1.2, {
      scale: 1.4,
      rotY: 0.5,
      radius: 1.1,
      fallbackType: 'box'
    });
  }

  /* --------------------------------------------------------------------------
     5. OUTILS D'ASSETS : CHARGEMENT GLB AVEC CACHE ET SECOURS PROCÉDURAL
     -------------------------------------------------------------------------- */
  loadProp(url, x, y, z, options = {}) {
    const scale = options.scale || 1.0;
    const rotY = options.rotY || 0;
    const radius = options.radius || 1.0;
    const fallbackType = options.fallbackType || 'box';

    // Création d'un conteneur immédiat
    const container = new THREE.Group();
    container.position.set(x, y, z);
    container.rotation.y = rotY;
    this.worldGroup.add(container);

    // Enregistrement immédiat de l'obstacle physique
    if (radius > 0) {
      this.physics.addObstacle(x, z, radius);
    }

    // Affichage d'un modèle de secours propre le temps du chargement
    const fallbackMesh = this.createFallbackProp(fallbackType);
    if (fallbackMesh) {
      fallbackMesh.scale.setScalar(scale);
      container.add(fallbackMesh);
    }

    // Chargement asynchrone du GLB réel
    if (this.gltfCache.has(url)) {
      const cached = this.gltfCache.get(url).clone();
      this.applyPropToContainer(container, cached, fallbackMesh, scale);
      return;
    }

    this.gltfLoader.load(
      url,
      (gltf) => {
        this.gltfCache.set(url, gltf.scene);
        const clone = gltf.scene.clone();
        this.applyPropToContainer(container, clone, fallbackMesh, scale);
      },
      undefined,
      (err) => {
        console.warn(`Fallback conserve pour le prop ${url}:`, err.message);
      }
    );
  }

  applyPropToContainer(container, model, fallbackMesh, scale) {
    if (fallbackMesh) {
      container.remove(fallbackMesh);
      if (fallbackMesh.geometry) fallbackMesh.geometry.dispose();
      if (fallbackMesh.material) fallbackMesh.material.dispose();
    }

    // Normalisation de la taille et centrage au sol
    const bbox = new THREE.Box3().setFromObject(model);
    model.position.y = -bbox.min.y * scale;
    model.scale.setScalar(scale);

    // Automated Blender collision proxies (COL_, COLLIDER_, UCX_)
    model.traverse((child) => {
      const isColliderProxy = child.name && (
        child.name.startsWith('COL_') ||
        child.name.startsWith('COLLIDER_') ||
        child.name.startsWith('UCX_')
      );

      if (isColliderProxy) {
        child.visible = false;
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          const colBox = new THREE.Box3().setFromObject(child);
          const center = new THREE.Vector3();
          const size = new THREE.Vector3();
          colBox.getCenter(center);
          colBox.getSize(size);
          const colRadius = Math.max(size.x, size.z) * 0.5 * scale;
          this.physics.addObstacle(container.position.x + center.x, container.position.z + center.z, colRadius);
        }
        return;
      }

      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    container.add(model);
  }

  createFallbackProp(type) {
    switch (type) {
      case 'cup': {
        const mat = new THREE.MeshStandardMaterial({ color: 0x7c4927, roughness: 0.4 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 0.6, 12), mat);
        mesh.position.y = 0.3;
        mesh.castShadow = true;
        return mesh;
      }
      case 'bench': {
        const mat = new THREE.MeshStandardMaterial({ color: 0x9e6a3d, roughness: 0.6 });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.8), mat);
        mesh.position.y = 0.22;
        mesh.castShadow = true;
        return mesh;
      }
      case 'lantern': {
        const mat = new THREE.MeshStandardMaterial({ color: 0xffb84d, emissive: 0xff9900, emissiveIntensity: 0.8 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 2.8, 8), mat);
        mesh.position.y = 1.4;
        mesh.castShadow = true;
        return mesh;
      }
      case 'train': {
        const mat = new THREE.MeshStandardMaterial({ color: 0x3d1c06, roughness: 0.5 });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 7.0), mat);
        mesh.position.y = 1.1;
        mesh.castShadow = true;
        return mesh;
      }
      case 'campfire': {
        const mat = new THREE.MeshStandardMaterial({ color: 0xffeed6, roughness: 0.5 });
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.6, 12), mat);
        mesh.position.y = 0.3;
        mesh.castShadow = true;
        return mesh;
      }
      default:
        return null;
    }
  }

  buildPastryTree(parent, x, z, scale = 1.0, foliageColor = 0x558a38) {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.scale.setScalar(scale);

    // Reuse shared geometries & materials to avoid heap allocations and draw call bloat
    const trunk = new THREE.Mesh(this.sharedGeos.trunk, this.sharedMats.woodTrunk);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);

    const mat = foliageColor === 0x3d5a2b ? this.sharedMats.forestFoliage : this.sharedMats.matchaFoliage;
    const coneGeos = [this.sharedGeos.cone0, this.sharedGeos.cone1, this.sharedGeos.cone2];

    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(coneGeos[i], mat);
      cone.position.y = 2.4 + i * 1.1;
      cone.castShadow = true;
      tree.add(cone);
    }

    parent.add(tree);
    this.physics.addObstacle(x, z, 1.2 * scale);
    return tree;
  }

  buildChocolateBoulder(parent, x, z, scale = 1.0) {
    // Reuse shared dodecahedron geometry and shared cocoa material
    const rock = new THREE.Mesh(this.sharedGeos.boulder, this.sharedMats.cocoaRock);
    rock.position.set(x, 0.8 * scale, z);
    rock.scale.set(1.2 * scale, 0.85 * scale, 1.1 * scale);
    rock.rotation.set(0.4, 0.6, 0.2);
    rock.castShadow = true;
    parent.add(rock);
    this.physics.addObstacle(x, z, 1.3 * scale);
    return rock;
  }

  buildMacaronStool(parent, x, z, scale = 1.0) {
    const stool = new THREE.Group();
    stool.position.set(x, 0, z);
    stool.scale.setScalar(scale);

    const bottomShell = new THREE.Mesh(this.sharedGeos.macaronShell, this.sharedMats.macaronPink);
    bottomShell.position.y = 0.16;
    bottomShell.castShadow = true;
    stool.add(bottomShell);

    const cream = new THREE.Mesh(this.sharedGeos.macaronCream, this.sharedMats.macaronCream);
    cream.position.y = 0.34;
    stool.add(cream);

    const topShell = new THREE.Mesh(this.sharedGeos.macaronShell, this.sharedMats.macaronPink);
    topShell.position.y = 0.52;
    topShell.castShadow = true;
    stool.add(topShell);

    parent.add(stool);
    this.physics.addObstacle(x, z, 0.9 * scale);
    return stool;
  }

  buildProceduralLantern(parent, x, z, scale = 1.0) {
    const lantern = new THREE.Group();
    lantern.position.set(x, 0, z);
    lantern.scale.setScalar(scale);

    const pole = new THREE.Mesh(this.sharedGeos.lanternPole, this.sharedMats.lanternWood);
    pole.position.y = 1.3;
    pole.castShadow = true;
    lantern.add(pole);

    const head = new THREE.Mesh(this.sharedGeos.lanternHead, this.sharedMats.lanternGlow);
    head.position.y = 2.7;
    lantern.add(head);

    parent.add(lantern);
    this.physics.addObstacle(x, z, 0.5 * scale);
    return lantern;
  }

  buildButterBush(parent, x, z, scale = 1.0) {
    const bush = new THREE.Group();
    bush.position.set(x, 0, z);
    bush.scale.setScalar(scale);

    const core = new THREE.Mesh(this.sharedGeos.bushCluster, this.sharedMats.matchaFoliage);
    core.position.y = 0.5;
    core.castShadow = true;
    bush.add(core);

    const flower = new THREE.Mesh(this.sharedGeos.bushCluster, this.sharedMats.butterFlower);
    flower.position.set(0.3, 0.7, 0.2);
    flower.scale.setScalar(0.45);
    bush.add(flower);

    parent.add(bush);
    this.physics.addObstacle(x, z, 0.7 * scale);
    return bush;
  }

  buildSugarCrystal(parent, x, z, scale = 1.0) {
    const crystal = new THREE.Group();
    crystal.position.set(x, 0, z);
    crystal.scale.setScalar(scale);

    const spire = new THREE.Mesh(this.sharedGeos.sugarSpire, this.sharedMats.sugarCrystal);
    spire.position.y = 1.2;
    spire.castShadow = true;
    crystal.add(spire);

    parent.add(crystal);
    this.physics.addObstacle(x, z, 0.6 * scale);
    return crystal;
  }

  /* --------------------------------------------------------------------------
     6. BOUCLE D'ANIMATION DES ÉLÉMENTS DU MONDE
     -------------------------------------------------------------------------- */
  update(delta, elapsed) {
    for (let i = 0; i < this.animatedProps.length; i++) {
      this.animatedProps[i].update(delta, elapsed);
    }
  }
}
