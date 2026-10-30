import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONFIG } from '../config.js';

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

    this.gltfLoader = new GLTFLoader();
    this.gltfCache = new Map();

    // Références pour le fondu d'atmosphère
    this.ambientLight = null;
    this.sunLight = null;
    this.hemiLight = null;
    this.currentDistrictKey = null;

    // Objets animés
    this.animatedProps = [];
    this.groundMesh = null;

    // Zones interactives avec le joueur (Jalon 3 & 4)
    this.interactionZones = [
      {
        id: 'bakery',
        title: 'Golden Crust Bakery',
        actionLabel: 'Enter Bakery',
        x: -22,
        z: -2.4,
        radius: 3.6,
        targetOverlay: 'bakeryModal'
      },
      {
        id: 'cafe',
        title: 'The Happy Toast Cafe',
        actionLabel: 'Visit Community Cafe',
        x: 22,
        z: -2,
        radius: 3.6,
        targetOverlay: 'cafeModal'
      },
      {
        id: 'mill',
        title: 'The Sourdough Windmill',
        actionLabel: 'View Lore & Roadmap',
        x: 24,
        z: -20,
        radius: 3.6,
        targetOverlay: 'millModal'
      },
      {
        id: 'train_station',
        title: 'Chocolate Train Station',
        actionLabel: 'Check Train Routes',
        x: -14,
        z: 84,
        radius: 3.8,
        targetOverlay: 'trainModal'
      },
      {
        id: 'portal',
        title: 'Mini-Game Arcade Portal',
        actionLabel: 'Enter Mini-Game Portal',
        x: 0,
        z: 118,
        radius: 3.8,
        targetOverlay: 'minigameModal'
      }
    ];

    this.initAtmosphere();
    this.buildZone1VillageCenter();
    this.buildTransitionPassage();
    this.buildZone2CacaoForest();
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
     1. ÉCLAIRAGE ET ATMOSPHÈRE PROGRESSIVE
     -------------------------------------------------------------------------- */
  initAtmosphere() {
    const z1 = CONFIG.biomes['village-center'];

    // Ciel et brouillard
    this.scene.background = new THREE.Color(z1.skyColor);
    this.scene.fog = new THREE.Fog(z1.fogColor, z1.fogNear, z1.fogFar);

    // Lumière ambiante
    this.ambientLight = new THREE.AmbientLight(z1.ambientColor, z1.ambientIntensity);
    this.worldGroup.add(this.ambientLight);

    // Soleil directionnel doré
    this.sunLight = new THREE.DirectionalLight(z1.sunColor, z1.sunIntensity);
    this.sunLight.position.set(...z1.sunPosition);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 1;
    this.sunLight.shadow.camera.far = 240;
    this.sunLight.shadow.camera.left = -80;
    this.sunLight.shadow.camera.right = 80;
    this.sunLight.shadow.camera.top = 80;
    this.sunLight.shadow.camera.bottom = -80;
    this.sunLight.shadow.bias = -0.0006;
    this.worldGroup.add(this.sunLight);

    // Hémisphère
    this.hemiLight = new THREE.HemisphereLight(0xfff6ea, 0x4a2a16, 0.65);
    this.worldGroup.add(this.hemiLight);
  }

  updateAtmosphere(playerPos) {
    if (!playerPos) return;

    const z1 = CONFIG.biomes['village-center'];
    const z2 = CONFIG.biomes['cacao-forest'];

    // Ratio de transition linéaire le long du pont (Z = 28 -> Z = 54)
    const rawRatio = THREE.MathUtils.clamp((playerPos.z - 28) / 26, 0, 1);
    // Lissage courbe smoothstep
    const t = rawRatio * rawRatio * (3 - 2 * rawRatio);

    // Interpolation ciel & brouillard
    const skyCol = new THREE.Color(z1.skyColor).lerp(new THREE.Color(z2.skyColor), t);
    const fogCol = new THREE.Color(z1.fogColor).lerp(new THREE.Color(z2.fogColor), t);
    this.scene.background.copy(skyCol);
    this.scene.fog.color.copy(fogCol);
    this.scene.fog.near = THREE.MathUtils.lerp(z1.fogNear, z2.fogNear, t);
    this.scene.fog.far = THREE.MathUtils.lerp(z1.fogFar, z2.fogFar, t);

    // Interpolation lumière ambiante
    const ambCol = new THREE.Color(z1.ambientColor).lerp(new THREE.Color(z2.ambientColor), t);
    this.ambientLight.color.copy(ambCol);
    this.ambientLight.intensity = THREE.MathUtils.lerp(z1.ambientIntensity, z2.ambientIntensity, t);

    // Interpolation soleil
    const sunCol = new THREE.Color(z1.sunColor).lerp(new THREE.Color(z2.sunColor), t);
    this.sunLight.color.copy(sunCol);
    this.sunLight.intensity = THREE.MathUtils.lerp(z1.sunIntensity, z2.sunIntensity, t);

    // Détection du quartier pour le badge du HUD
    let newDistrictKey = 'village-center';
    let kicker = 'CENTRAL VILLAGE &middot; HUB';
    let name = 'The Golden Butter Square';

    if (playerPos.z >= 31 && playerPos.z <= 51) {
      newDistrictKey = 'bridge-passage';
      kicker = 'CROSSING &middot; CHOCOLATE CANAL';
      name = 'Almond Butter Bridge';
    } else if (playerPos.z > 51) {
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

    // 1. Terrain en herbe douce (Zone 1 : Z de -50 à 30, X de -50 à 50)
    const groundGeo = new THREE.PlaneGeometry(90, 80, 24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x6e8f48, // Vert matcha doux
      roughness: 0.85,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -10);
    ground.receiveShadow = true;
    z1Group.add(ground);
    this.groundMesh = ground;

    // 2. Grand pavage circulaire de la place
    const plazaGeo = new THREE.CircleGeometry(16, 32);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xe6cfb8,
      roughness: 0.7,
      metalness: 0.08
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.02, 0);
    plaza.receiveShadow = true;
    z1Group.add(plaza);

    // Bordure en pierre caramel
    const curbGeo = new THREE.RingGeometry(15.7, 16.5, 32);
    const curbMat = new THREE.MeshStandardMaterial({ color: 0x9e6a3d, roughness: 0.6 });
    const curb = new THREE.Mesh(curbGeo, curbMat);
    curb.rotation.x = -Math.PI / 2;
    curb.position.set(0, 0.03, 0);
    curb.receiveShadow = true;
    z1Group.add(curb);

    // 3. Allées pavées
    const roadMat = new THREE.MeshStandardMaterial({ color: 0xd9be9b, roughness: 0.75 });

    // Allée Sud vers le pont (Z de 15 à 30)
    const roadSouth = new THREE.Mesh(new THREE.PlaneGeometry(8, 20), roadMat);
    roadSouth.rotation.x = -Math.PI / 2;
    roadSouth.position.set(0, 0.015, 23);
    roadSouth.receiveShadow = true;
    z1Group.add(roadSouth);

    // Allée Nord (Z de -15 à -38)
    const roadNorth = new THREE.Mesh(new THREE.PlaneGeometry(6, 26), roadMat);
    roadNorth.rotation.x = -Math.PI / 2;
    roadNorth.position.set(0, 0.015, -28);
    roadNorth.receiveShadow = true;
    z1Group.add(roadNorth);

    // Allée Ouest (vers la Boulangerie)
    const roadWest = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), roadMat);
    roadWest.rotation.x = -Math.PI / 2;
    roadWest.position.set(-21, 0.015, 0);
    roadWest.receiveShadow = true;
    z1Group.add(roadWest);

    // Allée Est (vers le Café terrasse)
    const roadEast = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), roadMat);
    roadEast.rotation.x = -Math.PI / 2;
    roadEast.position.set(21, 0.015, 0);
    roadEast.receiveShadow = true;
    z1Group.add(roadEast);

    // 4. Fontaine centrale au Beurre Fondant
    this.buildFountain(z1Group, 0, 0);

    // 5. Bâtiment : La Boulangerie du Beurre Doré (Ouest, X: -27, Z: -2)
    this.buildBakeryShop(z1Group, -27, -2);

    // 6. Café Terrasse "Le Toast Joyeux" avec props 3D (Est, X: 27, Z: -2)
    this.buildCafeTerrace(z1Group, 27, -2);

    // 7. Boutique Pâtisserie "L'Atelier Sucré" (Nord-Ouest, X: -24, Z: -24)
    this.buildCuteShop(z1Group, -24, -24, 'L Atelier Sucre', 0x9b5b3a, Math.PI / 4);

    // 8. Moulin du Levain avec ailes animées (Nord-Est, X: 24, Z: -24)
    this.buildWindmill(z1Group, 24, -24);

    // 9. Mobilier urbain & props 3D
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

    // Bassin circulaire
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 0.7, 28), stoneMat);
    basin.position.y = 0.35;
    basin.castShadow = true;
    basin.receiveShadow = true;
    group.add(basin);

    // Miroir d'eau
    const water = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.1, 28), waterMat);
    water.position.y = 0.65;
    group.add(water);

    // Pilier central
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 2.2, 16), stoneMat);
    pillar.position.y = 1.3;
    pillar.castShadow = true;
    group.add(pillar);

    // Vasque haute
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.7, 0.45, 16), stoneMat);
    bowl.position.y = 2.4;
    bowl.castShadow = true;
    group.add(bowl);

    // Orbe brioche dorée
    const briocheOrb = new THREE.Mesh(new THREE.SphereGeometry(0.75, 20, 20), goldMat);
    briocheOrb.position.y = 3.15;
    briocheOrb.castShadow = true;
    group.add(briocheOrb);

    parent.add(group);
    this.physics.addObstacle(x, z, 3.8);
  }

  buildBakeryShop(parent, x, z) {
    const shop = new THREE.Group();
    shop.position.set(x, 0, z);

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff2df, roughness: 0.8 }); // Crème pâtissière
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x96532b, roughness: 0.6 }); // Biscuit cuit
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x5a341b, roughness: 0.7 });
    const awningMat1 = new THREE.MeshStandardMaterial({ color: 0xe59b24, roughness: 0.5 });
    const awningMat2 = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

    // Corps du bâtiment (X: 10, Y: 5.5, Z: 8)
    const walls = new THREE.Mesh(new THREE.BoxGeometry(10, 5.5, 8), wallMat);
    walls.position.y = 2.75;
    walls.castShadow = true;
    walls.receiveShadow = true;
    shop.add(walls);

    // Toiture à deux pans
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7.2, 3.2, 4), roofMat);
    roof.position.y = 6.6;
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.15, 1.0, 0.9);
    roof.castShadow = true;
    shop.add(roof);

    // Vitrine de boulangerie sur la façade Est (+X)
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffeaa7,
      emissive: 0xffbe53,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });
    const shopWindow = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 4.0), windowMat);
    shopWindow.position.set(5.05, 2.2, 0);
    shop.add(shopWindow);

    // Porte d'entrée avec encadrement bois
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.6, 1.6), woodMat);
    door.position.set(5.05, 1.3, -2.4);
    shop.add(door);

    // Auvent rayé gourmand au-dessus de la vitrine
    for (let i = 0; i < 6; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.25, 0.75),
        i % 2 === 0 ? awningMat1 : awningMat2
      );
      stripe.position.set(5.6, 3.6, -1.875 + i * 0.75);
      stripe.rotation.z = 0.25;
      stripe.castShadow = true;
      shop.add(stripe);
    }

    // Cheminée avec petit panache
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 1.0), roofMat);
    chimney.position.set(-2.5, 7.0, -1.8);
    chimney.castShadow = true;
    shop.add(chimney);

    parent.add(shop);
    // Collision pour la boulangerie
    this.physics.addObstacle(x, z, 5.8);
  }

  buildCafeTerrace(parent, x, z) {
    const terrace = new THREE.Group();
    terrace.position.set(x, 0, z);

    // Plancher en bois surélevé
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x8a552e, roughness: 0.75 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(12, 0.25, 10), deckMat);
    deck.position.set(0, 0.12, 0);
    deck.receiveShadow = true;
    terrace.add(deck);

    // Façade arrière du café
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf5ebe1, roughness: 0.8 });
    const wall = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 10), wallMat);
    wall.position.set(4.5, 2.5, 0);
    wall.castShadow = true;
    terrace.add(wall);

    // Toit auvent du café
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3d6b38, roughness: 0.6 });
    const roof = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 10.4), roofMat);
    roof.position.set(1.5, 5.1, 0);
    roof.rotation.z = 0.08;
    roof.castShadow = true;
    terrace.add(roof);

    // Tables rondes sur la terrasse
    const tableMat = new THREE.MeshStandardMaterial({ color: 0xd4ba9e, roughness: 0.5 });
    const tablePositions = [
      { x: -3.2, z: -2.8 },
      { x: -3.2, z: 2.8 }
    ];

    tablePositions.forEach((tp) => {
      const table = new THREE.Group();
      table.position.set(tp.x, 0.25, tp.z);

      const top = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16), tableMat);
      top.position.y = 1.0;
      top.castShadow = true;
      table.add(top);

      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.0, 8), tableMat);
      leg.position.y = 0.5;
      table.add(leg);

      terrace.add(table);
      this.physics.addObstacle(x + tp.x, z + tp.z, 1.4);
    });

    parent.add(terrace);
    this.physics.addObstacle(x + 4.5, z, 3.5);

    // Chargement du prop 3D hazelnut-cup.glb posé sur la table du café !
    this.loadProp('./assets/props/hazelnut-cup.glb', x - 3.2, 1.35, z - 2.8, {
      scale: 0.45,
      rotY: 0.3,
      radius: 0.5,
      fallbackType: 'cup'
    });

    // Chargement de bancs bretzel (pretzel-bench.glb) autour de la terrasse
    this.loadProp('./assets/props/pretzel-bench.glb', x - 5.5, 0.25, z, {
      scale: 1.2,
      rotY: Math.PI / 2,
      radius: 1.3,
      fallbackType: 'bench'
    });
  }

  buildCuteShop(parent, x, z, signText, roofColor, rotY = 0) {
    const shop = new THREE.Group();
    shop.position.set(x, 0, z);
    shop.rotation.y = rotY;

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xffeed6, roughness: 0.75 });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.55 });

    const walls = new THREE.Mesh(new THREE.BoxGeometry(7, 4.5, 7), wallMat);
    walls.position.y = 2.25;
    walls.castShadow = true;
    shop.add(walls);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.6, 2.8, 4), roofMat);
    roof.position.y = 5.8;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    shop.add(roof);

    // Vitrine lumineuse
    const winMat = new THREE.MeshStandardMaterial({
      color: 0xffd175,
      emissive: 0xff9900,
      emissiveIntensity: 0.5
    });
    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 0.2), winMat);
    windowMesh.position.set(0, 1.8, 3.55);
    shop.add(windowMesh);

    parent.add(shop);
    this.physics.addObstacle(x, z, 4.4);
  }

  buildWindmill(parent, x, z) {
    const mill = new THREE.Group();
    mill.position.set(x, 0, z);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xdec6ab, roughness: 0.7 });
    const capMat = new THREE.MeshStandardMaterial({ color: 0x6e3d22, roughness: 0.6 });
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xfff9f0, roughness: 0.4 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x4a2a16, roughness: 0.7 });

    // Tour conique
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 8, 16), stoneMat);
    tower.position.y = 4.0;
    tower.castShadow = true;
    tower.receiveShadow = true;
    mill.add(tower);

    // Dôme supérieur
    const cap = new THREE.Mesh(new THREE.ConeGeometry(3.0, 2.2, 16), capMat);
    cap.position.y = 9.0;
    cap.castShadow = true;
    mill.add(cap);

    // Moyeu des ailes
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 8), woodMat);
    hub.position.set(0, 7.5, 2.4);
    hub.rotation.x = Math.PI / 2;
    mill.add(hub);

    // Ailes rotatives
    const bladesGroup = new THREE.Group();
    bladesGroup.position.set(0, 7.5, 2.9);

    for (let i = 0; i < 4; i++) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 0.08), woodMat);
      arm.position.y = 2.25;
      arm.castShadow = true;

      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 3.6), bladeMat);
      cloth.position.set(0.45, 2.4, 0.05);

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
    this.physics.addObstacle(x, z, 4.2);
  }

  placeZone1Props(parent) {
    // Bancs bretzel (pretzel-bench.glb) autour de la place
    const benchConfigs = [
      { x: -8, z: 0, rotY: Math.PI / 2 },
      { x: 8, z: 0, rotY: -Math.PI / 2 },
      { x: 0, z: -8, rotY: 0 },
      { x: -6, z: 12, rotY: Math.PI * 0.8 },
      { x: 6, z: 12, rotY: -Math.PI * 0.8 }
    ];

    benchConfigs.forEach((b) => {
      this.loadProp('./assets/props/pretzel-bench.glb', b.x, 0, b.z, {
        scale: 1.15,
        rotY: b.rotY,
        radius: 1.2,
        fallbackType: 'bench'
      });
    });

    // Lanternes de miel (honey-lantern.glb)
    const lanternConfigs = [
      { x: -11, z: -11 },
      { x: 11, z: -11 },
      { x: -11, z: 11 },
      { x: 11, z: 11 },
      { x: -4, z: 27 },
      { x: 4, z: 27 }
    ];

    lanternConfigs.forEach((l) => {
      this.loadProp('./assets/props/honey-lantern.glb', l.x, 0, l.z, {
        scale: 1.2,
        radius: 0.6,
        fallbackType: 'lantern'
      });
    });

    // Arbres matcha coniques
    const treePositions = [
      { x: -18, z: -14, scale: 1.2 },
      { x: -28, z: 12, scale: 1.1 },
      { x: 18, z: -16, scale: 1.0 },
      { x: 30, z: 14, scale: 1.3 },
      { x: -12, z: 22, scale: 0.95 },
      { x: 14, z: 22, scale: 1.0 }
    ];

    treePositions.forEach((tp) => {
      this.buildPastryTree(parent, tp.x, tp.z, tp.scale);
    });

    // Pistachio tree (pistachio-tree.glb)
    this.loadProp('./assets/props/pistachio-tree.glb', -16, 0, 8, {
      scale: 1.2,
      radius: 1.5,
      fallbackType: 'tree'
    });
    this.loadProp('./assets/props/pistachio-tree.glb', 16, 0, 8, {
      scale: 1.1,
      radius: 1.4,
      fallbackType: 'tree'
    });
  }

  /* --------------------------------------------------------------------------
     3. TRANSITION : LE PONT DU BEURRE D'AMANDE & LE CANAL CHOCOLATÉ
     -------------------------------------------------------------------------- */
  buildTransitionPassage() {
    const bridgeGroup = new THREE.Group();
    this.worldGroup.add(bridgeGroup);

    // 1. Lit du Canal Chocolaté (Z de 30 à 52, X de -60 à 60, en creux à Y = -0.9)
    const canalBedGeo = new THREE.PlaneGeometry(120, 22);
    const chocolateMat = new THREE.MeshStandardMaterial({
      color: 0x331a0c, // Chocolat noir liquide chaud
      roughness: 0.18,
      metalness: 0.45,
      emissive: 0x140803,
      emissiveIntensity: 0.2
    });
    const canalWater = new THREE.Mesh(canalBedGeo, chocolateMat);
    canalWater.rotation.x = -Math.PI / 2;
    canalWater.position.set(0, -0.6, 41);
    canalWater.receiveShadow = true;
    bridgeGroup.add(canalWater);

    // Berges en pierre le long du canal (Nord : Z = 30, Sud : Z = 52)
    const bankMat = new THREE.MeshStandardMaterial({ color: 0x8a5a35, roughness: 0.7 });
    const bankNorth = new THREE.Mesh(new THREE.BoxGeometry(120, 1.0, 1.2), bankMat);
    bankNorth.position.set(0, -0.2, 30);
    bankNorth.receiveShadow = true;
    bridgeGroup.add(bankNorth);

    const bankSouth = new THREE.Mesh(new THREE.BoxGeometry(120, 1.0, 1.2), bankMat);
    bankSouth.position.set(0, -0.2, 52);
    bankSouth.receiveShadow = true;
    bridgeGroup.add(bankSouth);

    // Collisions le long des berges pour empêcher de tomber dans le chocolat
    // (Laisse une ouverture de -5.5 à +5.5 pour traverser le pont)
    this.physics.addObstacle(-24, 30.5, 18);
    this.physics.addObstacle(24, 30.5, 18);
    this.physics.addObstacle(-24, 51.5, 18);
    this.physics.addObstacle(24, 51.5, 18);

    // 2. Le Pont en bois doré (Largeur 9m : X de -4.5 à +4.5, Longueur 24m : Z de 29 à 53)
    const bridgeDeckMat = new THREE.MeshStandardMaterial({ color: 0xaa703f, roughness: 0.65 });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.4, 24), bridgeDeckMat);
    deck.position.set(0, 0.18, 41);
    deck.castShadow = true;
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Arches de soutien en pierre caramel sous le pont
    const archMat = new THREE.MeshStandardMaterial({ color: 0x7c4927, roughness: 0.8 });
    const arch1 = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 9.2, 16, 1, false, 0, Math.PI), archMat);
    arch1.rotation.z = Math.PI / 2;
    arch1.rotation.y = Math.PI;
    arch1.position.set(0, -0.5, 36);
    bridgeGroup.add(arch1);

    const arch2 = arch1.clone();
    arch2.position.set(0, -0.5, 46);
    bridgeGroup.add(arch2);

    // Rambardes / Garde-corps décorés
    const railMat = new THREE.MeshStandardMaterial({ color: 0x5a2d14, roughness: 0.6 });
    [-4.3, 4.3].forEach((railX) => {
      // Main courante
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 23.6), railMat);
      handrail.position.set(railX, 1.1, 41);
      handrail.castShadow = true;
      bridgeGroup.add(handrail);

      // Potelets le long de la rambarde
      for (let pz = 30; pz <= 52; pz += 3.6) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.3), railMat);
        post.position.set(railX, 0.65, pz);
        post.castShadow = true;
        bridgeGroup.add(post);
      }
    });

    // Piliers d'entrée avec lanternes de miel
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x6e391b, roughness: 0.7 });
    const bridgeCorners = [
      { x: -4.3, z: 30 },
      { x: 4.3, z: 30 },
      { x: -4.3, z: 52 },
      { x: 4.3, z: 52 }
    ];

    bridgeCorners.forEach((c) => {
      const stonePillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.85), pillarMat);
      stonePillar.position.set(c.x, 0.9, c.z);
      stonePillar.castShadow = true;
      bridgeGroup.add(stonePillar);

      this.loadProp('./assets/props/honey-lantern.glb', c.x, 1.8, c.z, {
        scale: 0.85,
        radius: 0.4,
        fallbackType: 'lantern'
      });
    });

    // Animation du miroir de chocolat (scintillement subtil)
    this.animatedProps.push({
      mesh: canalWater,
      update: (delta, elapsed) => {
        canalWater.position.y = -0.6 + Math.sin(elapsed * 1.5) * 0.03;
      }
    });
  }

  /* --------------------------------------------------------------------------
     4. ZONE 2 : LE QUARTIER CACAO & BOIS DE MATCHA
     -------------------------------------------------------------------------- */
  buildZone2CacaoForest() {
    const z2Group = new THREE.Group();
    this.worldGroup.add(z2Group);

    // 1. Terrain en terre chocolatée & mousse matcha (Z de 52 à 135, X de -50 à 50)
    const groundGeo = new THREE.PlaneGeometry(90, 84, 24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x2e1b12, // Terre cacao riche
      roughness: 0.92,
      metalness: 0.04
    });
    const groundZ2 = new THREE.Mesh(groundGeo, groundMat);
    groundZ2.rotation.x = -Math.PI / 2;
    groundZ2.position.set(0, 0, 94);
    groundZ2.receiveShadow = true;
    z2Group.add(groundZ2);

    // Patchs de mousse matcha veloutée
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x3d5427, roughness: 0.85 });
    const moss1 = new THREE.Mesh(new THREE.CircleGeometry(14, 24), mossMat);
    moss1.rotation.x = -Math.PI / 2;
    moss1.position.set(16, 0.02, 92);
    moss1.receiveShadow = true;
    z2Group.add(moss1);

    const moss2 = new THREE.Mesh(new THREE.CircleGeometry(12, 24), mossMat);
    moss2.rotation.x = -Math.PI / 2;
    moss2.position.set(-16, 0.02, 85);
    moss2.receiveShadow = true;
    z2Group.add(moss2);

    // Chemin sinueux en pierre chocolatée (Z de 52 vers la clairière et la gare)
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2e, roughness: 0.8 });
    const pathMain = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 36), pathMat);
    pathMain.rotation.x = -Math.PI / 2;
    pathMain.position.set(0, 0.015, 70);
    pathMain.receiveShadow = true;
    z2Group.add(pathMain);

    // Branche gauche vers la gare
    const pathLeft = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), pathMat);
    pathLeft.rotation.x = -Math.PI / 2;
    pathLeft.position.set(-8, 0.015, 84);
    pathLeft.receiveShadow = true;
    z2Group.add(pathLeft);

    // Branche droite vers le feu de camp
    const pathRight = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), pathMat);
    pathRight.rotation.x = -Math.PI / 2;
    pathRight.position.set(8, 0.015, 92);
    pathRight.receiveShadow = true;
    z2Group.add(pathRight);

    // 2. Landmark 1 : La Gare du Train Chocolat (X: -18, Z: 84)
    this.buildChocolateTrainStation(z2Group, -18, 84);

    // 3. Landmark 2 : La Clairière des Chamallows (X: 18, Z: 92)
    this.buildMarshmallowCampfireClearing(z2Group, 18, 92);

    // 4. Forêt dense de Pistachio Trees (pistachio-tree.glb) & sapins matcha
    this.placeZone2ForestProps(z2Group);

    // 5. Portail des Mini-Jeux du Bwedverse (Prêt pour Jalon 3 au fond de la clairière, Z = 118)
    this.buildMiniGamePortalGate(z2Group, 0, 118);
  }

  buildChocolateTrainStation(parent, x, z) {
    const station = new THREE.Group();
    station.position.set(x, 0, z);

    // Voies ferrées (rails métalliques + traverses en chocolat)
    const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x4a2810, roughness: 0.7 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0xc8b49e, metalness: 0.7, roughness: 0.3 });

    // Traverses
    for (let tz = -14; tz <= 14; tz += 1.8) {
      const sleeper = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.15, 0.6), sleeperMat);
      sleeper.position.set(-2.0, 0.08, tz);
      sleeper.receiveShadow = true;
      station.add(sleeper);
    }

    // 2 rails continus
    [-3.2, -0.8].forEach((rx) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 30), railMat);
      rail.position.set(rx, 0.24, 0);
      rail.castShadow = true;
      station.add(rail);
    });

    // Quai de gare surélevé en planches
    const platformMat = new THREE.MeshStandardMaterial({ color: 0x7a4b27, roughness: 0.65 });
    const platform = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 24), platformMat);
    platform.position.set(2.4, 0.25, 0);
    platform.castShadow = true;
    platform.receiveShadow = true;
    station.add(platform);

    // Abris de quai en bois
    const shelter = new THREE.Group();
    shelter.position.set(3.2, 0, 0);

    const postMat = new THREE.MeshStandardMaterial({ color: 0x422410, roughness: 0.7 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x24422b, roughness: 0.5 });

    // Poteaux de l'abris
    [-8, 0, 8].forEach((pz) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.2, 8), postMat);
      post.position.set(0, 2.1, pz);
      post.castShadow = true;
      shelter.add(post);
    });

    // Toiture de l'abris
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.25, 20), roofMat);
    canopy.position.set(-0.8, 4.3, 0);
    canopy.rotation.z = 0.1;
    canopy.castShadow = true;
    shelter.add(canopy);

    station.add(shelter);
    parent.add(station);

    // Collision pour la gare
    this.physics.addObstacle(x + 2.5, z, 3.2);

    // Chargement du prop 3D : chocolate-train.glb sur les rails !
    this.loadProp('./assets/props/chocolate-train.glb', x - 2.0, 0.3, z, {
      scale: 1.6,
      rotY: 0,
      radius: 2.8,
      fallbackType: 'train'
    });
  }

  buildMarshmallowCampfireClearing(parent, x, z) {
    const clearing = new THREE.Group();
    clearing.position.set(x, 0, z);

    // Cercle de pierres autour du feu
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a463a, roughness: 0.8 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.8, 2.3, 16), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.03;
    ring.receiveShadow = true;
    clearing.add(ring);

    // Bûches d'assise autour du feu
    const logMat = new THREE.MeshStandardMaterial({ color: 0x543219, roughness: 0.7 });
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + 0.3;
      const lx = Math.cos(angle) * 4.2;
      const lz = Math.sin(angle) * 4.2;

      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 2.4, 12), logMat);
      log.rotation.z = Math.PI / 2;
      log.rotation.y = angle + Math.PI / 2;
      log.position.set(lx, 0.35, lz);
      log.castShadow = true;
      clearing.add(log);

      this.physics.addObstacle(x + lx, z + lz, 1.2);
    }

    // Lueur chaleureuse du feu de camp
    const fireLight = new THREE.PointLight(0xff7722, 2.2, 14);
    fireLight.position.set(0, 1.2, 0);
    clearing.add(fireLight);

    // Scintillement du feu
    this.animatedProps.push({
      mesh: fireLight,
      update: (delta, elapsed) => {
        fireLight.intensity = 2.0 + Math.sin(elapsed * 9) * 0.4 + Math.cos(elapsed * 15) * 0.2;
      }
    });

    parent.add(clearing);
    this.physics.addObstacle(x, z, 1.6);

    // Chargement du prop 3D : marshmallow-campfire.glb
    this.loadProp('./assets/props/marshmallow-campfire.glb', x, 0.05, z, {
      scale: 1.1,
      radius: 1.4,
      fallbackType: 'campfire'
    });
  }

  placeZone2ForestProps(parent) {
    // Pistachio trees (pistachio-tree.glb) majestueux
    const pistachioPositions = [
      { x: -14, z: 62, scale: 1.25 },
      { x: 16, z: 64, scale: 1.2 },
      { x: -28, z: 88, scale: 1.4 },
      { x: 30, z: 84, scale: 1.35 },
      { x: 26, z: 106, scale: 1.2 },
      { x: -22, z: 110, scale: 1.3 }
    ];

    pistachioPositions.forEach((pt) => {
      this.loadProp('./assets/props/pistachio-tree.glb', pt.x, 0, pt.z, {
        scale: pt.scale,
        radius: 1.6 * pt.scale,
        fallbackType: 'tree'
      });
    });

    // Sapins matcha et rochers chocolat
    const forestProps = [
      { x: -8, z: 66, type: 'tree', scale: 1.0 },
      { x: 8, z: 68, type: 'tree', scale: 1.1 },
      { x: -6, z: 96, type: 'tree', scale: 0.9 },
      { x: 6, z: 104, type: 'tree', scale: 1.15 },
      { x: -12, z: 108, type: 'boulder', scale: 1.5 },
      { x: 14, z: 112, type: 'boulder', scale: 1.3 }
    ];

    forestProps.forEach((p) => {
      if (p.type === 'tree') {
        this.buildPastryTree(parent, p.x, p.z, p.scale, 0x3d5a2b);
      } else {
        this.buildChocolateBoulder(parent, p.x, p.z, p.scale);
      }
    });

    // Lanternes de miel le long du chemin de forêt
    const forestLanterns = [
      { x: -4, z: 68 },
      { x: 4, z: 78 },
      { x: -4, z: 90 },
      { x: 4, z: 102 }
    ];

    forestLanterns.forEach((fl) => {
      this.loadProp('./assets/props/honey-lantern.glb', fl.x, 0, fl.z, {
        scale: 1.1,
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

    // Piliers de l'arche
    const pillarL = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.0, 1.0), woodMat);
    pillarL.position.set(-4.0, 3.0, 0);
    pillarL.castShadow = true;
    portal.add(pillarL);

    const pillarR = new THREE.Mesh(new THREE.BoxGeometry(1.0, 6.0, 1.0), woodMat);
    pillarR.position.set(4.0, 3.0, 0);
    pillarR.castShadow = true;
    portal.add(pillarR);

    // Poutre supérieure
    const beam = new THREE.Mesh(new THREE.BoxGeometry(10.0, 1.1, 1.2), woodMat);
    beam.position.set(0, 6.2, 0);
    beam.castShadow = true;
    portal.add(beam);

    // Panneau doré du portail
    const sign = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.0, 0.2), goldMat);
    sign.position.set(0, 5.0, 0);
    portal.add(sign);

    // Disque vortex scintillant (inactif pour l'instant)
    const portalDiscMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.2
    });
    const portalDisc = new THREE.Mesh(new THREE.CircleGeometry(3.0, 24), portalDiscMat);
    portalDisc.position.set(0, 3.0, 0);
    portal.add(portalDisc);

    this.animatedProps.push({
      mesh: portalDisc,
      update: (delta, elapsed) => {
        portalDisc.rotation.z += delta * 0.6;
        portalDiscMat.emissiveIntensity = 0.6 + Math.sin(elapsed * 3) * 0.25;
      }
    });

    parent.add(portal);
    this.physics.addObstacle(x - 4, z, 1.0);
    this.physics.addObstacle(x + 4, z, 1.0);
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

    model.traverse((child) => {
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

    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6e4325, roughness: 0.8 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.5 });

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 8), trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = true;
    tree.add(trunk);

    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2 - i * 0.45, 1.8, 8), foliageMat);
      cone.position.y = 2.4 + i * 1.1;
      cone.castShadow = true;
      tree.add(cone);
    }

    parent.add(tree);
    this.physics.addObstacle(x, z, 1.2 * scale);
  }

  buildChocolateBoulder(parent, x, z, scale = 1.0) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x3d2417, roughness: 0.75, metalness: 0.1 });
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 * scale), mat);
    rock.position.set(x, 0.8 * scale, z);
    rock.scale.set(1.2, 0.85, 1.1);
    rock.rotation.set(0.4, 0.6, 0.2);
    rock.castShadow = true;
    parent.add(rock);
    this.physics.addObstacle(x, z, 1.3 * scale);
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
