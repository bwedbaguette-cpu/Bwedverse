/* ==========================================================================
   CONFIGURATION CLIENT — BWED WORLD
   ========================================================================== */

export const CONFIG = {
  version: '1.0.0',
  spawnPoint: { x: 0, y: 0.1, z: 0, rot: 0 },
  defaultAvatar: 'tiny-baker',
  avatars: {
    'tiny-baker': {
      name: 'Chef Émile',
      file: './assets/avatars/tiny-baker.glb',
      scale: 1.15,
      yOffset: 0.0
    }
  },
  biome: {
    name: 'La Grand-Place du Beurre Doré',
    kicker: 'VILLAGE CENTRAL',
    skyColor: 0xfff4e6,
    fogColor: 0xf5dfc6,
    fogNear: 25,
    fogFar: 85,
    ambientColor: 0xffecd1,
    ambientIntensity: 1.4,
    sunColor: 0xffeed6,
    sunIntensity: 2.2,
    sunPosition: [28, 38, 24]
  }
};
