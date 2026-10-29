/* ==========================================================================
   MINI-JEU LA PLUIE DE BRIOCHES (BWED CATCH) — BWED WORLD (JALON 3)
   Mini-jeu d'arcade kawaii en canvas 2D, 60 secondes de récolte gourmande,
   combos, multiplicateur et tableau des scores synchronisé
   ========================================================================== */

export class BwedCatchGame {
  constructor(canvasEl, onGameOver = null) {
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.onGameOver = onGameOver;

    this.width = canvasEl.width = 640;
    this.height = canvasEl.height = 480;

    this.isRunning = false;
    this.animId = null;

    // État du jeu
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 60.0;
    this.lastTime = 0;

    // Joueur (Panier à pain)
    this.basket = {
      x: this.width / 2,
      y: this.height - 42,
      w: 80,
      h: 24,
      targetX: this.width / 2,
      speed: 520
    };

    // Objets qui tombent
    this.items = [];
    this.nextSpawnTime = 0;

    // Particules & Flotteurs de texte
    this.particles = [];
    this.popups = [];

    // Contrôles
    this.keys = { left: false, right: false };
    this.boundKeydown = this.onKeyDown.bind(this);
    this.boundKeyup = this.onKeyUp.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);

    this.initEvents();
  }

  initEvents() {
    window.addEventListener('keydown', this.boundKeydown);
    window.addEventListener('keyup', this.boundKeyup);
    this.canvas.addEventListener('mousemove', this.boundPointerMove);
    this.canvas.addEventListener('touchmove', this.boundPointerMove, { passive: false });
  }

  destroy() {
    this.stop();
    window.removeEventListener('keydown', this.boundKeydown);
    window.removeEventListener('keyup', this.boundKeyup);
    this.canvas.removeEventListener('mousemove', this.boundPointerMove);
    this.canvas.removeEventListener('touchmove', this.boundPointerMove);
  }

  onKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') {
      this.keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.keys.right = true;
    }
  }

  onKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q' || e.key === 'a' || e.key === 'A') {
      this.keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.keys.right = false;
    }
  }

  onPointerMove(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const canvasX = (clientX - rect.left) * (this.width / rect.width);
    this.basket.targetX = Math.max(this.basket.w / 2, Math.min(this.width - this.basket.w / 2, canvasX));
  }

  start() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeLeft = 60.0;
    this.items = [];
    this.particles = [];
    this.popups = [];
    this.basket.x = this.width / 2;
    this.basket.targetX = this.width / 2;
    this.isRunning = true;
    this.lastTime = performance.now();

    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  loop() {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(delta);
    this.draw();

    if (this.timeLeft <= 0) {
      this.endGame();
      return;
    }

    this.animId = requestAnimationFrame(() => this.loop());
  }

  update(delta) {
    // 1. Décompte du temps
    this.timeLeft = Math.max(0, this.timeLeft - delta);

    // 2. Déplacement du panier
    if (this.keys.left) {
      this.basket.targetX -= this.basket.speed * delta;
    }
    if (this.keys.right) {
      this.basket.targetX += this.basket.speed * delta;
    }
    this.basket.targetX = Math.max(this.basket.w / 2, Math.min(this.width - this.basket.w / 2, this.basket.targetX));
    this.basket.x += (this.basket.targetX - this.basket.x) * Math.min(1.0, 18.0 * delta);

    // 3. Apparition des friandises
    const now = performance.now();
    if (now >= this.nextSpawnTime) {
      this.spawnItem();
      // Fréquence progressive de 600ms au départ jusqu'à 320ms en fin de partie
      const spawnInterval = 320 + (this.timeLeft / 60) * 360;
      this.nextSpawnTime = now + spawnInterval;
    }

    // 4. Mise à jour des objets qui tombent
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.vy * delta;
      it.rot += it.vrot * delta;

      // Collision avec le panier
      const basketTop = this.basket.y - this.basket.h / 2;
      const basketBottom = this.basket.y + this.basket.h / 2;
      const basketLeft = this.basket.x - this.basket.w / 2;
      const basketRight = this.basket.x + this.basket.w / 2;

      if (it.y + it.radius >= basketTop && it.y - it.radius <= basketBottom && it.x >= basketLeft && it.x <= basketRight) {
        this.catchItem(it);
        this.items.splice(i, 1);
        continue;
      }

      // Sortie par le bas
      if (it.y - it.radius > this.height) {
        if (it.type !== 'burnt') {
          // Brioche manquée -> perte du combo
          this.combo = 0;
        }
        this.items.splice(i, 1);
      }
    }

    // 5. Particules
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.life -= delta * 2.2;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 6. Textes flottants (+100, COMBO x2)
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.y -= delta * 38;
      pop.life -= delta * 1.5;
      if (pop.life <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  spawnItem() {
    const r = Math.random();
    let type = 'brioche';
    let pts = 100;
    let radius = 16;
    let color = '#ffd15a';

    if (r < 0.2) {
      type = 'burnt'; // Levain brûlé à éviter
      pts = -120;
      color = '#2d180f';
    } else if (r < 0.45) {
      type = 'croissant';
      pts = 160;
      radius = 18;
      color = '#e59b24';
    } else if (r < 0.6) {
      type = 'star'; // Tartelette dorée rare
      pts = 300;
      radius = 20;
      color = '#fff275';
    }

    this.items.push({
      type,
      pts,
      radius,
      color,
      x: 30 + Math.random() * (this.width - 60),
      y: -25,
      vy: 160 + Math.random() * 90 + (60 - this.timeLeft) * 2.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 4.0
    });
  }

  catchItem(it) {
    if (it.type === 'burnt') {
      this.score = Math.max(0, this.score + it.pts);
      this.combo = 0;
      this.emitParticles(it.x, it.y, '#3d1c0e', 14);
      this.addPopup(it.x, it.y, `${it.pts} (Brûlé)`, '#ff5544');
    } else {
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      const multiplier = this.combo >= 15 ? 4 : this.combo >= 8 ? 3 : this.combo >= 4 ? 2 : 1;
      const gained = it.pts * multiplier;
      this.score += gained;

      this.emitParticles(it.x, it.y, it.color, 12);
      const text = multiplier > 1 ? `+${gained} (x${multiplier})` : `+${gained}`;
      this.addPopup(it.x, it.y, text, it.color);
    }
  }

  emitParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 2.5 + Math.random() * 3,
        color,
        life: 1.0
      });
    }
  }

  addPopup(x, y, text, color) {
    this.popups.push({
      x,
      y,
      text,
      color,
      life: 1.0
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // Fond dégradé cosy nuit gourmande
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, '#1c0f08');
    bgGrad.addColorStop(1, '#2b170c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Ligne de sol biscuit
    ctx.fillStyle = '#6b3e20';
    ctx.fillRect(0, this.height - 18, this.width, 18);
    ctx.fillStyle = '#ffd15a';
    ctx.fillRect(0, this.height - 20, this.width, 2);

    // Objets qui tombent
    this.items.forEach((it) => {
      ctx.save();
      ctx.translate(it.x, it.y);
      ctx.rotate(it.rot);

      if (it.type === 'burnt') {
        ctx.fillStyle = '#1c0903';
        ctx.strokeStyle = '#5a2d18';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, it.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (it.type === 'star') {
        ctx.fillStyle = it.color;
        ctx.shadowColor = '#ffe066';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
          const aIn = a + Math.PI / 5;
          ctx.lineTo(Math.cos(a) * it.radius, Math.sin(a) * it.radius);
          ctx.lineTo(Math.cos(aIn) * (it.radius * 0.45), Math.sin(aIn) * (it.radius * 0.45));
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Brioche ou croissant rond
        ctx.fillStyle = it.color;
        ctx.shadowColor = 'rgba(255, 209, 90, 0.4)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(0, 0, it.radius * 1.1, it.radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff5ea';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, -2, it.radius * 0.5, 0.2, Math.PI - 0.2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // Panier du joueur
    ctx.save();
    ctx.translate(this.basket.x, this.basket.y);
    // Corps du panier en osier caramel
    ctx.fillStyle = '#a86738';
    ctx.strokeStyle = '#ffd15a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(-this.basket.w / 2, -this.basket.h / 2, this.basket.w, this.basket.h, 8);
    } else {
      ctx.rect(-this.basket.w / 2, -this.basket.h / 2, this.basket.w, this.basket.h);
    }
    ctx.fill();
    ctx.stroke();

    // Poignées
    ctx.fillStyle = '#6b381a';
    ctx.fillRect(-this.basket.w / 2 - 4, -4, 4, 8);
    ctx.fillRect(this.basket.w / 2, -4, 4, 8);
    ctx.restore();

    // Particules
    this.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Popups de score
    this.popups.forEach((pop) => {
      ctx.save();
      ctx.font = 'bold 16px Fredoka, sans-serif';
      ctx.fillStyle = pop.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.globalAlpha = pop.life;
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    });

    // Bandeau supérieur HUD du jeu
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Fredoka, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Score : ${this.score}`, 18, 32);

    // Chronomètre
    ctx.textAlign = 'center';
    const s = Math.ceil(this.timeLeft);
    ctx.fillStyle = s <= 10 ? '#ff5544' : '#ffd15a';
    ctx.fillText(`Temps : ${s}s`, this.width / 2, 32);

    // Combo
    ctx.textAlign = 'right';
    if (this.combo > 1) {
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`Combo : x${this.combo}`, this.width - 18, 32);
    } else {
      ctx.fillStyle = '#d4bfab';
      ctx.font = '14px DM Mono, monospace';
      ctx.fillText(`Max combo : ${this.maxCombo}`, this.width - 18, 32);
    }
  }

  endGame() {
    this.stop();
    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        maxCombo: this.maxCombo
      });
    }
  }
}
