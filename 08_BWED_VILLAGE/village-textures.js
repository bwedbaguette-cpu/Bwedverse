// ============================================================================
// BWED VILLAGE 3D — PROCEDURAL CANVAS TEXTURES
// Tactile Gourmet Handcrafted Stylized Materials (0 KB Download, Pure Canvas)
// ============================================================================

import * as THREE from 'three';

// 1. Waffle Plaza Texture (Crisp Golden Waffle Grid)
export function createWaffleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Golden batter base
  ctx.fillStyle = '#df9b43';
  ctx.fillRect(0, 0, 256, 256);

  const cells = 4;
  const cellSize = 256 / cells;
  const innerMargin = 8;

  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      const cx = x * cellSize;
      const cy = y * cellSize;

      // Ridge highlight
      ctx.fillStyle = '#fbd47c';
      ctx.fillRect(cx + 2, cy + 2, cellSize - 4, cellSize - 4);

      // Deep caramelized waffle pocket
      ctx.fillStyle = '#9b4d1b';
      ctx.fillRect(cx + innerMargin, cy + innerMargin, cellSize - innerMargin * 2, cellSize - innerMargin * 2);

      // Warm pocket floor
      ctx.fillStyle = '#bf6a28';
      ctx.fillRect(cx + innerMargin + 3, cy + innerMargin + 3, cellSize - (innerMargin + 3) * 2, cellSize - (innerMargin + 3) * 2);

      // Glossy syrup highlight
      ctx.fillStyle = 'rgba(255, 230, 160, 0.45)';
      ctx.fillRect(cx + innerMargin + 4, cy + innerMargin + 4, 6, 6);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 2. Butter Sablé Cobblestones (Rounded Golden Biscuit Pavement)
export function createCobbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Cinnamon mortar base
  ctx.fillStyle = '#562f1a';
  ctx.fillRect(0, 0, 256, 256);

  // Staggered rounded stones
  const rows = 4;
  const cols = 4;
  const w = 256 / cols;
  const h = 256 / rows;

  for (let r = 0; r < rows; r++) {
    const offsetX = (r % 2) * (w / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * w + offsetX;
      const y = r * h;

      // Biscuit body
      ctx.fillStyle = (r + c) % 2 === 0 ? '#d49b64' : '#caa16a';
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 8);
      ctx.fill();

      // Top toasted rim
      ctx.fillStyle = '#ebba84';
      ctx.beginPath();
      ctx.roundRect(x + 7, y + 7, w - 14, 6, 3);
      ctx.fill();

      // Biscuit prick marks (dots)
      ctx.fillStyle = '#aa6a36';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + w * 0.3 + i * (w * 0.2), y + h * 0.55, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 3. Matcha Meadow with Sugar Daisies (Fresh Pistachio Green + Tiny Sugar Flowers)
export function createGrassTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Matcha sponge green
  ctx.fillStyle = '#61843b';
  ctx.fillRect(0, 0, 256, 256);

  // Soft sponge mottling
  for (let i = 0; i < 180; i++) {
    const rx = (Math.sin(i * 12.3) * 0.5 + 0.5) * 256;
    const ry = (Math.cos(i * 34.5) * 0.5 + 0.5) * 256;
    ctx.fillStyle = i % 2 === 0 ? '#749d47' : '#527230';
    ctx.beginPath();
    ctx.arc(rx, ry, 3 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }

  // Cute sugar daisies (white petals, yellow sugar heart)
  const flowers = [
    { x: 45, y: 55 }, { x: 190, y: 70 }, { x: 90, y: 180 },
    { x: 210, y: 200 }, { x: 140, y: 120 }
  ];

  flowers.forEach(f => {
    // 5 White Petals
    ctx.fillStyle = '#ffffff';
    for (let p = 0; p < 5; p++) {
      const angle = (p * Math.PI * 2) / 5;
      const px = f.x + Math.cos(angle) * 5;
      const py = f.y + Math.sin(angle) * 5;
      ctx.beginPath();
      ctx.arc(px, py, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Yellow sugar heart
    ctx.fillStyle = '#ffd15a';
    ctx.beginPath();
    ctx.arc(f.x, f.y, 2.8, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 4. Strawberry Vichy Gingham (Classic French Bistro & Picnic Pattern)
export function createVichyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Cream base
  ctx.fillStyle = '#fff6ea';
  ctx.fillRect(0, 0, 128, 128);

  const size = 32;

  // Horizontal strawberry stripes
  ctx.fillStyle = 'rgba(235, 78, 98, 0.45)';
  for (let y = 0; y < 128; y += size * 2) {
    ctx.fillRect(0, y, 128, size);
  }

  // Vertical strawberry stripes
  for (let x = 0; x < 128; x += size * 2) {
    ctx.fillRect(x, 0, size, 128);
  }

  // Dark strawberry intersection squares
  ctx.fillStyle = '#c72c41';
  for (let y = 0; y < 128; y += size * 2) {
    for (let x = 0; x < 128; x += size * 2) {
      ctx.fillRect(x, y, size, size);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 5. Vanilla & Chocolate Checkerboard (Pastry Shop Floor)
export function createCheckerTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const size = 32;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#fdf5e6' : '#2a140b';
      ctx.fillRect(x * size, y * size, size, size);

      // Beveled tile edge
      ctx.strokeStyle = (x + y) % 2 === 0 ? '#e0cdb2' : '#452213';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x * size + 1, y * size + 1, size - 2, size - 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 6. Beech Pier Wood Planks (Harbor & Bridge Boardwalk)
export function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#7a492b';
  ctx.fillRect(0, 0, 256, 256);

  const planks = 4;
  const plankH = 256 / planks;

  for (let i = 0; i < planks; i++) {
    const y = i * plankH;

    // Plank color variation
    ctx.fillStyle = i % 2 === 0 ? '#8a5332' : '#764527';
    ctx.fillRect(0, y + 2, 256, plankH - 4);

    // Grain lines
    ctx.strokeStyle = 'rgba(60, 30, 15, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y + plankH * 0.4);
    ctx.bezierCurveTo(80, y + plankH * 0.35, 160, y + plankH * 0.45, 256, y + plankH * 0.4);
    ctx.stroke();

    // Brass nail heads
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(16, y + plankH * 0.5, 3, 0, Math.PI * 2);
    ctx.arc(240, y + plankH * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Dark seam
    ctx.fillStyle = '#3a1b0b';
    ctx.fillRect(0, y, 256, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 7. Cinnamon Forest Dirt Trail (Woodland Path)
export function createDirtTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#6b3e24';
  ctx.fillRect(0, 0, 256, 256);

  // Cinnamon bark flakes
  for (let i = 0; i < 220; i++) {
    const rx = (Math.sin(i * 18.7) * 0.5 + 0.5) * 256;
    const ry = (Math.cos(i * 29.3) * 0.5 + 0.5) * 256;
    ctx.fillStyle = i % 2 === 0 ? '#875130' : '#4e2815';
    ctx.beginPath();
    ctx.ellipse(rx, ry, 4 + (i % 4), 2 + (i % 2), i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
