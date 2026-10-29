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

    // Définition des repères du monde (Landmarks)
    this.landmarks = [
      { id: 'fountain', name: 'Fontaine', x: 0, z: 0, color: '#ffd15a', symbol: 'F' },
      { id: 'bakery', name: 'Boulangerie', x: -27, z: -2, color: '#e59b24', symbol: 'B' },
      { id: 'cafe', name: 'Café', x: 27, z: -2, color: '#ffb84d', symbol: 'C' },
      { id: 'mill', name: 'Moulin', x: 24, z: -24, color: '#d4a373', symbol: 'M' },
      { id: 'bridge', name: 'Pont', x: 0, z: 41, color: '#a86738', symbol: 'P' },
      { id: 'station', name: 'Gare', x: -18, z: 84, color: '#3d1c06', symbol: 'G' },
      { id: 'campfire', name: 'Feu de camp', x: 18, z: 92, color: '#ff5533', symbol: 'C' },
      { id: 'portal', name: 'Portail', x: 0, z: 118, color: '#22c55e', symbol: 'O' }
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

      // Zone 1 (Herbe matcha) : Z de -50 à 30
      ctx.fillStyle = 'rgba(110, 143, 72, 0.45)';
      ctx.fillRect((-45 - px) * scale, (-50 - pz) * scale, 90 * scale, 80 * scale);

      // Grand-place pavée
      ctx.fillStyle = 'rgba(230, 207, 184, 0.5)';
      ctx.beginPath();
      ctx.arc((0 - px) * scale, (0 - pz) * scale, 16 * scale, 0, Math.PI * 2);
      ctx.fill();

      // Canal Chocolaté : Z de 30 à 52
      ctx.fillStyle = 'rgba(60, 30, 15, 0.85)';
      ctx.fillRect((-50 - px) * scale, (30 - pz) * scale, 100 * scale, 22 * scale);

      // Le Pont : X de -4.5 à 4.5, Z de 29 à 53
      ctx.fillStyle = 'rgba(170, 112, 63, 0.9)';
      ctx.fillRect((-4.5 - px) * scale, (29 - pz) * scale, 9 * scale, 24 * scale);

      // Zone 2 (Terre cacao) : Z de 52 à 135
      ctx.fillStyle = 'rgba(46, 27, 18, 0.65)';
      ctx.fillRect((-45 - px) * scale, (52 - pz) * scale, 90 * scale, 83 * scale);

      // Clairière matcha
      ctx.fillStyle = 'rgba(61, 84, 39, 0.55)';
      ctx.beginPath();
      ctx.arc((18 - px) * scale, (92 - pz) * scale, 12 * scale, 0, Math.PI * 2);
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

    // Ouest
    ctx.fillStyle = '#ffd15a';
    ctx.fillText('O', -radius + 6, 0);

    ctx.restore();
  }
}
