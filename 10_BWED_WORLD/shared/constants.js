/* ==========================================================================
   CONSTANTES PARTAGÉES — BWED WORLD
   ========================================================================== */

export const NETWORK = {
  TICK_RATE: 15, // Envoi à 15 Hz
  TICK_INTERVAL_MS: 1000 / 15,
  HEARTBEAT_TIMEOUT_MS: 10000,
  INTERPOLATION_OFFSET_MS: 100, // Tampon de lissage de 100ms
  DEFAULT_ROOM: 'bwed-hub-village'
};

export const PHYSICS = {
  GRAVITY: -22.0,
  PLAYER_RADIUS: 0.45,
  PLAYER_HEIGHT: 1.8,
  MAX_SLOPE: 0.65
};

export const MOVEMENT = {
  WALK_SPEED: 4.8,
  RUN_SPEED: 8.2,
  ROTATION_LERP: 14.0,
  ACCELERATION: 18.0,
  DECELERATION: 22.0
};

export const CAMERA = {
  PITCH_DEG: 50.0, // Angle 3/4 plongeant type Pokémon / Animal Crossing
  YAW_DEG: 45.0,   // Vue isométrique à 45 degrés
  DISTANCE: 14.0,
  FOV: 42,
  FOLLOW_LERP: 0.08
};

export const ZONES = {
  VILLAGE_CENTER: 'village-center',
  CHUNK_SIZE: 80
};
