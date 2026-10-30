import * as THREE from 'three';

/* ==========================================================================
   DAY / NIGHT CYCLE & ATMOSPHERIC LIGHTING — BWED WORLD
   - Dynamic celestial sun & moon arc
   - Atmospheric sky and fog color gradients
   - Twinkling starfield at dusk and night
   - Floating firefly particle swarm over the meadows
   - Automatic lantern and window luminescence
   ========================================================================== */

export class DayNightCycle {
  constructor(scene, sunLight, ambientLight) {
    this.scene = scene;
    this.sunLight = sunLight;
    this.ambientLight = ambientLight;

    // Cycle duration in seconds (240s = 4 minutes full day-night cycle)
    this.cycleDuration = 240.0;
    this.time = 0.28; // Start at late morning / afternoon (0.0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset)
    this.mode = 'auto'; // 'auto', 'day', 'sunset', 'night'
    this.timeSpeed = 1.0;

    // Starfield
    this.starsMesh = null;
    this.buildStarfield();

    // Fireflies swarm
    this.firefliesGroup = null;
    this.firefliesData = [];
    this.buildFireflies();

    // Night emissive materials / lights registry
    this.nightLights = [];
  }

  registerNightLight(light) {
    if (light) {
      this.nightLights.push(light);
    }
  }

  setMode(mode) {
    this.mode = mode;
    if (mode === 'day') this.time = 0.45;
    else if (mode === 'sunset') this.time = 0.72;
    else if (mode === 'night') this.time = 0.95;
    this.applyAtmosphere(0);
  }

  buildStarfield() {
    const count = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 160.0 + Math.random() * 20.0;

      // Half sphere (only above horizon Y > 5)
      const y = Math.abs(r * Math.cos(phi)) + 10;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const z = r * Math.sin(phi) * Math.sin(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    });

    this.starsMesh = new THREE.Points(geometry, material);
    this.scene.add(this.starsMesh);
  }

  buildFireflies() {
    this.firefliesGroup = new THREE.Group();
    const count = 35;
    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x9be882,
      transparent: true,
      opacity: 0.0
    });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      const x = (Math.random() - 0.5) * 60;
      const z = Math.random() * 80 - 10;
      const y = 0.4 + Math.random() * 1.8;
      mesh.position.set(x, y, z);
      this.firefliesGroup.add(mesh);

      this.firefliesData.push({
        mesh,
        baseX: x,
        baseY: y,
        baseZ: z,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 1.2
      });
    }

    this.scene.add(this.firefliesGroup);
  }

  update(delta) {
    if (this.mode === 'auto') {
      this.time = (this.time + (delta * this.timeSpeed) / this.cycleDuration) % 1.0;
    }

    this.applyAtmosphere(delta);
    this.updateFireflies(delta);
  }

  applyAtmosphere(delta) {
    const t = this.time; // 0.0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset

    // Sun angle around X/Z
    const sunAngle = (t - 0.25) * Math.PI * 2;
    const sunDist = 95.0;
    const sunY = Math.sin(sunAngle) * sunDist;
    const sunX = Math.cos(sunAngle) * sunDist * 0.7;
    const sunZ = 30.0 + Math.sin(sunAngle * 0.5) * 25.0;

    this.sunLight.position.set(sunX, Math.max(sunY, -20), sunZ);

    // Compute day factor: 1.0 at noon, 0.0 at deep night
    const dayFactor = THREE.MathUtils.clamp((sunY + 15) / 55, 0, 1);
    const isSunset = t >= 0.65 && t <= 0.85;

    // Sky and fog color definitions
    const daySky = new THREE.Color(0xfff4e6);
    const sunsetSky = new THREE.Color(0xe07a48);
    const nightSky = new THREE.Color(0x0e1422);

    const dayFog = new THREE.Color(0xf5dfc6);
    const sunsetFog = new THREE.Color(0xb85c38);
    const nightFog = new THREE.Color(0x121828);

    // Color blending
    let currentSky = new THREE.Color();
    let currentFog = new THREE.Color();

    if (t < 0.25) {
      // Midnight to sunrise
      const blend = t / 0.25;
      currentSky.copy(nightSky).lerp(sunsetSky, blend * 0.7);
      currentFog.copy(nightFog).lerp(sunsetFog, blend * 0.7);
    } else if (t < 0.65) {
      // Sunrise to afternoon
      const blend = (t - 0.25) / 0.4;
      currentSky.copy(sunsetSky).lerp(daySky, Math.min(1, blend * 2));
      currentFog.copy(sunsetFog).lerp(dayFog, Math.min(1, blend * 2));
    } else if (t < 0.82) {
      // Golden hour & sunset
      const blend = (t - 0.65) / 0.17;
      currentSky.copy(daySky).lerp(sunsetSky, blend);
      currentFog.copy(dayFog).lerp(sunsetFog, blend);
    } else {
      // Twilight to night
      const blend = (t - 0.82) / 0.18;
      currentSky.copy(sunsetSky).lerp(nightSky, blend);
      currentFog.copy(sunsetFog).lerp(nightFog, blend);
    }

    this.scene.background.copy(currentSky);
    this.scene.fog.color.copy(currentFog);

    // Ambient light
    const dayAmb = new THREE.Color(0xffecd1);
    const nightAmb = new THREE.Color(0x283852);
    this.ambientLight.color.copy(nightAmb).lerp(dayAmb, dayFactor);
    this.ambientLight.intensity = THREE.MathUtils.lerp(0.55, 1.45, dayFactor);

    // Sun light intensity
    this.sunLight.intensity = Math.max(0.2, dayFactor * 2.3);

    // Stars opacity: visible only when night/twilight
    if (this.starsMesh) {
      const starOpacity = THREE.MathUtils.clamp((0.4 - dayFactor) * 2.5, 0, 0.95);
      this.starsMesh.material.opacity = starOpacity;
    }

    // Night lanterns intensity & fireflies opacity
    const nightLightsIntensity = THREE.MathUtils.clamp((0.45 - dayFactor) * 2.0, 0, 1);
    for (let i = 0; i < this.nightLights.length; i++) {
      const light = this.nightLights[i];
      if (light.isPointLight) {
        light.intensity = THREE.MathUtils.lerp(0.3, 1.8, nightLightsIntensity);
      }
    }

    if (this.firefliesGroup) {
      const fireflyAlpha = nightLightsIntensity * 0.85;
      for (let i = 0; i < this.firefliesData.length; i++) {
        this.firefliesData[i].mesh.material.opacity = fireflyAlpha;
      }
    }
  }

  updateFireflies(delta) {
    const now = performance.now() * 0.001;
    for (let i = 0; i < this.firefliesData.length; i++) {
      const f = this.firefliesData[i];
      f.mesh.position.x = f.baseX + Math.sin(now * f.speed + f.phase) * 1.4;
      f.mesh.position.y = f.baseY + Math.cos(now * 1.5 + f.phase) * 0.5;
      f.mesh.position.z = f.baseZ + Math.cos(now * f.speed + f.phase) * 1.4;
    }
  }

  getTimeFormatted() {
    // 0.0 = 00:00, 0.5 = 12:00
    const totalMinutes = Math.floor(this.time * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
