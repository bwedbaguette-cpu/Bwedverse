/* ==========================================================================
   MINI-MAP & BOUSSOLE ROTATIVE — BWED WORLD
   Radar circulaire temps réel, boussole cardinale dynamique, repères de
   landmarks et visualisation des autres joueurs connectés
   ========================================================================== */

export class MiniMap {
  constructor(canvasEl, onClick = null) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.onClick = onClick;

    this.size = 140;
    this.canvas.width = this.size;
    this.canvas.height = this.size;

    // World landmarks
    this.landmarks = [
      { id: 'fountain', name: 'Fountain', x: 0, z: 0, color: '#ffd15a', symbol: 'F' },
      { id: 'bakery', name: 'Bakery', x: -13, z: -1.5, color: '#e59b24', symbol: 'B' },
      { id: 'cafe', name: 'Cafe', x: 13, z: -1.5, color: '#ffb84d', symbol: 'C' },
      { id: 'mill', name: 'Windmill', x: 11, z: -12.5, color: '#d4a373', symbol: 'M' },
      { id: 'bridge', name: 'Bridge', x: 0, z: 30, color: '#a86738', symbol: 'P' },
      { id: 'station', name: 'Station', x: -10, z: 54, color: '#3d1c06', symbol: 'G' },
      { id: 'campfire', name: 'Campfire', x: 10, z: 56, color: '#ff5533', symbol: 'C' },
      { id: 'portal', name: 'Portal', x: 0, z: 82, color: '#22c55e', symbol: 'O' }
    ];

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('click', () => {
      if (this.onClick) {
        this.onClick();
      }
    });
  }

  update(playerPos, playerRotY, cameraYaw, remotePlayers = []) {
    const ctx = this.ctx;
    const center = this.size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, this.size, this.size);

    // 1. Fond du radar avec masque circulaire
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.clip();

    // Fond bi-zone (matcha doux en haut, chocolat chaud en bas)
    ctx.fillStyle = '#1c0f07';
    ctx.fillRect(0, 0, this.size, this.size);

    // Échelle : 1 mètre dans le monde = 1.3 pixel sur le radar
    const scale = 1.25;

    // Translation centrée sur le joueur
    ctx.save();
    ctx.translate(center, center);

    // Dessin schématique des terrains relatifs
    if (playerPos) {
      const px = playerPos.x;
      const pz = playerPos.z;

      // Zone 1 (Matcha grass) : Z from -32 to 20
      ctx.fillStyle = 'rgba(110, 143, 72, 0.45)';
      ctx.fillRect((-36 - px) * scale, (-32 - pz) * scale, 72 * scale, 52 * scale);

      // Cobblestone plaza
      ctx.fillStyle = 'rgba(230, 207, 184, 0.5)';
      ctx.beginPath();
      ctx.arc((0 - px) * scale, (0 - pz) * scale, 11 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Chocolate Canal : Z from 20 to 40
      ctx.fillStyle = 'rgba(60, 30, 15, 0.85)';
      ctx.fillRect((-40 - px) * scale, (20 - pz) * scale, 80 * scale, 20 * scale);

      // Bridge : X from -3.5 to 3.5, Z from 19 to 41
      ctx.fillStyle = 'rgba(170, 112, 63, 0.9)';
      ctx.fillRect((-3.5 - px) * scale, (19 - pz) * scale, 7 * scale, 22 * scale);

      // Zone 2 (Cocoa soil) : Z from 40 to 92
      ctx.fillStyle = 'rgba(46, 27, 18, 0.65)';
      ctx.fillRect((-36 - px) * scale, (40 - pz) * scale, 72 * scale, 52 * scale);

      // Campfire clearing
      ctx.fillStyle = 'rgba(61, 84, 39, 0.55)';
      ctx.beginPath();
      ctx.arc((10 - px) * scale, (56 - pz) * scale, 8 * scale, 0, Math.PI * 2);
      ctx.fill();

      // 2. Repères des Landmarks
      this.landmarks.forEach((lm) => {
        const lx = (lm.x - px) * scale;
        const lz = (lm.z - pz) * scale;

        // Point de repère
        ctx.fillStyle = lm.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(lx, lz, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // 3. Autres Joueurs distants (points verts fluo)
      if (remotePlayers && remotePlayers.length > 0) {
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;

        remotePlayers.forEach((rp) => {
          if (rp && rp.position) {
            const rx = (rp.position.x - px) * scale;
            const rz = (rp.position.z - pz) * scale;
            ctx.beginPath();
            ctx.arc(rx, rz, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        });
      }
    }

    ctx.restore(); // Fin de la translation centrée sur le joueur

    // Grille radar douce
    ctx.strokeStyle = 'rgba(255, 209, 90, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.8, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Curseur du joueur local (Flèche dorée rotative au centre)
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(-playerRotY);

    ctx.fillStyle = '#ffd15a';
    ctx.strokeStyle = '#1a0802';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore(); // Fin du clip circulaire

    // 5. Cadran doré de boussole avec points cardinaux rotatifs
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(cameraYaw || 0);

    // Bordure en laiton
    ctx.strokeStyle = '#ffd15a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Bordure extérieure décorative
    ctx.strokeStyle = 'rgba(255, 209, 90, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.stroke();

    // Points cardinaux
    ctx.font = 'bold 9px DM Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Nord
    ctx.fillStyle = '#ff5544';
    ctx.fillText('N', 0, -radius + 6);

    // Sud
    ctx.fillStyle = '#ffd15a';
    ctx.fillText('S', 0, radius - 6);

    // Est
    ctx.fillStyle = '#ffd15a';
    ctx.fillText('E', radius - 6, 0);

    // West
    ctx.fillStyle = '#ffd15a';
    ctx.fillText('W', -radius + 6, 0);

    ctx.restore();
  }
}
