import * as THREE from 'three';

/* ==========================================================================
   PROCEDURAL TEXTURE GENERATOR — BWED WORLD
   - Cobblestone pastry plaza & street pavers
   - Soft matcha meadow grass with butter flower flecks
   - Roasted cocoa forest soil with biscuit crumbs
   - Crispy wafer waffle wood planks for bridges & docks
   - Molten chocolate river waves
   All textures generated via HTML Canvas with zero HTTP latency
   ========================================================================== */

export class TextureGenerator {
  constructor() {
    this.cache = new Map();
  }

  // 1. Cobblestone pastry plaza & streets
  getCobblestoneTexture() {
    if (this.cache.has('cobblestone')) return this.cache.get('cobblestone');

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base mortar
    ctx.fillStyle = '#bda082';
    ctx.fillRect(0, 0, size, size);

    // Stone grid with rounded pavers
    const rows = 12;
    const cols = 12;
    const cellW = size / cols;
    const cellH = size / rows;

    const stoneColors = ['#f0ddc8', '#e5cdb0', '#dabda0', '#f5e4d2', '#caa988'];

    for (let r = 0; r < rows; r++) {
      const offsetX = (r % 2) * (cellW * 0.5);
      for (let c = -1; c <= cols; c++) {
        const x = c * cellW + offsetX + 2;
        const y = r * cellH + 2;
        const w = cellW - 4;
        const h = cellH - 4;

        const color = stoneColors[(r * 7 + c * 13 + 999) % stoneColors.length];
        ctx.fillStyle = color;

        // Rounded paver
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, w, h, 6);
        } else {
          ctx.rect(x, y, w, h);
        }
        ctx.fill();

        // Top highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + 2);
        ctx.lineTo(x + w - 4, y + 2);
        ctx.stroke();

        // Bottom shadow
        ctx.strokeStyle = 'rgba(70, 45, 25, 0.28)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 4, y + h - 2);
        ctx.lineTo(x + w - 4, y + h - 2);
        ctx.stroke();
      }
    }

    // Flour / noise dusting
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 16;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(6, 6);

    this.cache.set('cobblestone', texture);
    return texture;
  }

  // 2. Matcha meadow grass with pastry specks
  getMatchaGrassTexture() {
    if (this.cache.has('matchaGrass')) return this.cache.get('matchaGrass');

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base matcha green
    ctx.fillStyle = '#65883d';
    ctx.fillRect(0, 0, size, size);

    // Soft organic grass clumps
    for (let i = 0; i < 280; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const rad = 12 + Math.random() * 24;
      const alpha = 0.12 + Math.random() * 0.18;
      const isLighter = Math.random() > 0.45;

      ctx.fillStyle = isLighter ? `rgba(122, 168, 72, ${alpha})` : `rgba(74, 102, 42, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tiny pastry flowers (golden butter and cream flecks)
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const isGold = Math.random() > 0.35;
      ctx.fillStyle = isGold ? '#ffd15a' : '#fff9f0';
      ctx.beginPath();
      ctx.arc(x, y, 2.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine texture noise
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(12, 12);

    this.cache.set('matchaGrass', texture);
    return texture;
  }

  // 3. Roasted cocoa forest soil with biscuit crumbs
  getCocoaSoilTexture() {
    if (this.cache.has('cocoaSoil')) return this.cache.get('cocoaSoil');

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Deep roasted chocolate soil
    ctx.fillStyle = '#3a1f12';
    ctx.fillRect(0, 0, size, size);

    // Warm cocoa patches
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const rad = 14 + Math.random() * 26;
      const isLighter = Math.random() > 0.5;

      ctx.fillStyle = isLighter ? 'rgba(82, 45, 26, 0.22)' : 'rgba(38, 18, 9, 0.35)';
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Biscuit crumbs & matcha moss flecks
    for (let i = 0; i < 110; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const isMoss = Math.random() > 0.6;
      ctx.fillStyle = isMoss ? 'rgba(74, 98, 45, 0.65)' : 'rgba(195, 138, 85, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(10, 10);

    this.cache.set('cocoaSoil', texture);
    return texture;
  }

  // 4. Crispy waffle / wafer wood planks
  getWafflePlanksTexture() {
    if (this.cache.has('wafflePlanks')) return this.cache.get('wafflePlanks');

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#caa068';
    ctx.fillRect(0, 0, size, size);

    const rows = 8;
    const plankH = size / rows;

    for (let r = 0; r < rows; r++) {
      const y = r * plankH;
      const plankColor = r % 2 === 0 ? '#d4ad76' : '#c49962';
      ctx.fillStyle = plankColor;
      ctx.fillRect(2, y + 2, size - 4, plankH - 4);

      // Wood grain lines
      ctx.strokeStyle = 'rgba(92, 54, 22, 0.22)';
      ctx.lineWidth = 1;
      for (let j = 0; j < 3; j++) {
        const lineY = y + 8 + j * 16 + (Math.random() - 0.5) * 4;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.bezierCurveTo(size * 0.3, lineY + 4, size * 0.7, lineY - 4, size, lineY);
        ctx.stroke();
      }

      // Plank seam shadow
      ctx.strokeStyle = '#5a3419';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();

      // Top highlight
      ctx.strokeStyle = 'rgba(255, 235, 195, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, y + 3);
      ctx.lineTo(size, y + 3);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(2, 6);

    this.cache.set('wafflePlanks', texture);
    return texture;
  }

  // 5. Molten chocolate river waves
  getChocolateWaterTexture() {
    if (this.cache.has('chocolateWater')) return this.cache.get('chocolateWater');

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rich molten dark chocolate
    ctx.fillStyle = '#2a1408';
    ctx.fillRect(0, 0, size, size);

    // Warm caramel swirl waves
    for (let i = 0; i < 16; i++) {
      const y = (i * size) / 16;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(95, 48, 18, 0.45)' : 'rgba(145, 82, 38, 0.35)';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.25, y + 25, size * 0.75, y - 25, size, y);
      ctx.stroke();
    }

    // Cream swirl streaks
    ctx.strokeStyle = 'rgba(235, 185, 130, 0.25)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      const y = (i * size) / 6 + 18;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(size * 0.3, y - 18, size * 0.65, y + 18, size, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(4, 2);

    this.cache.set('chocolateWater', texture);
    return texture;
  }
}
