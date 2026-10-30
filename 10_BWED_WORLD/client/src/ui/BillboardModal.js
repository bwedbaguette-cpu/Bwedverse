/* ==========================================================================
   VILLAGE NOTICE BOARD & OFFICIAL CHRONICLE — BWEDTOWN
   Interactive Billboards: 2026-2027 Roadmap, Gazette, HD Gallery & Guestbook
   ========================================================================== */

export class BillboardModal {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.audio = options.audio || null;
    this.profileManager = options.profileManager || null;
    this.onUpdateCallback = options.onUpdate || null;

    this.isOpen = false;
    this.activeTab = 'roadmap'; // 'roadmap', 'gazette', 'gallery', 'events', 'guestbook'
    this.selectedArtworkIndex = 0;

    // Official Canon Artworks & Concept Gallery
    this.artworks = [
      {
        id: 'fountain',
        title: 'The Golden Butter Fountain',
        subtitle: 'Heart of the Grand Plaza & Sacred Espresso Moka',
        file: './assets/gallery/08-espresso-fountain-plaza.jpg',
        author: 'Bwed Art Direction',
        desc: 'The iconic fountain where rich hot chocolate flows endlessly. It is the gathering heart for citizens to chat, relax, and watch golden sparks dance on the water.'
      },
      {
        id: 'apartments',
        title: 'Milk Carton Apartments',
        subtitle: 'Art Deco Lofts & Private Habbo Suites',
        file: './assets/gallery/09-milk-carton-apartments.jpg',
        author: 'Bwed Urban Architecture',
        desc: 'A colossal antique milk carton redesigned into luxury residential lofts. Every resident owns an instanced personal room to decorate and showcase to neighbors.'
      },
      {
        id: 'tavern',
        title: 'Honey Pot Tavern',
        subtitle: 'Cozy Hearth & Tasting Counter',
        file: './assets/gallery/15-honey-pot-tavern.jpg',
        author: 'Environment Design',
        desc: 'A centuries-old honey jar transformed into a warm tavern. Travelers savor warm brioches and gather around the marshmallow campfire for chiptune listening sessions.'
      },
      {
        id: 'arcade',
        title: 'Arcade Duel BwedTris 3D',
        subtitle: 'Competitive Arena & Retro Duels',
        file: './assets/gallery/05-arcade-duel.jpg',
        author: 'Mini-Game Studio',
        desc: 'The towering arcade cabinet ruling over the celebration district. The finest cake-stackers battle in head-to-head 1v1 duels under the roar of the crowd.'
      },
      {
        id: 'station',
        title: 'Butter Dish Station & Eclair Express',
        subtitle: 'Grand Railway Terminus for Travelers',
        file: './assets/gallery/10-butter-dish-train-station.jpg',
        author: 'Transport & Infrastructure',
        desc: 'The lightning-fast choux-pastry locomotive connecting BwedTown to the outer pastry archipelago. Newcomers get their first panoramic view of the diorama here.'
      },
      {
        id: 'gazebo',
        title: 'Matcha Teacup Gazebo',
        subtitle: 'Botanical Park & Zen Promenade',
        file: './assets/gallery/13-teacup-gazebo-park.jpg',
        author: 'Parks & Recreation',
        desc: 'A porcelain teacup sheltering a warm caramel wood bench. The perfect spot to listen to chouquette bird chirps and meditate under Crimson Maple leaves.'
      },
      {
        id: 'observatory',
        title: 'Celestial Observatory & Starlight Portal',
        subtitle: 'Cosmic Research & Inter-Island Teleportation',
        file: './assets/gallery/06-portal-observatory.jpg',
        author: 'Celestial Sciences',
        desc: 'The grand colander telescope studying the Brioche Constellation. Its swirling gateway will soon bridge players to community event islands.'
      },
      {
        id: 'lantern',
        title: 'Teaspoon Lamp & Honey Lantern',
        subtitle: 'Warm Amber Illumination for the Boulevards',
        file: './assets/gallery/25-lamp-teaspoon-lantern.jpg',
        author: 'Street Furniture Guild',
        desc: 'Handcrafted glass lantern filled with glowing amber honey. Illuminates the cobblestone avenues at dusk, guiding evening strollers with gentle warmth.'
      }
    ];

    // Locally stored Guestbook Notes
    this.guestbookNotes = this.loadGuestbookNotes();

    this.initDOM();
    this.bindEvents();
  }

  loadGuestbookNotes() {
    const key = 'bwedtown_billboard_guestbook';
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Guestbook could not be loaded:', e);
    }

    // Default inaugural resident notes
    return [
      {
        id: 'init_1',
        author: 'Chef Brioche',
        title: 'Town Mayor',
        avatar: '👨‍🍳',
        date: 'Today at 08:30 AM',
        content: 'Welcome to all new residents! BwedTown is expanding day by day. Remember to visit the Honey Pot Tavern for fresh morning croissants!'
      },
      {
        id: 'init_2',
        author: 'Cozy Shiba Buddy',
        title: 'Official Mascot',
        avatar: '🐕',
        date: 'Today at 09:15 AM',
        content: 'Woof! I love dashing around the Golden Butter Fountain! My size has been calibrated to chibi perfection!'
      },
      {
        id: 'init_3',
        author: 'Toast Bandit',
        title: 'Mystery Citizen',
        avatar: '🥷',
        date: 'Yesterday at 10:45 PM',
        content: 'Word on the street is a secret croissant is hidden on a high rooftop or behind a matcha bush... Keep your eyes peeled!'
      },
      {
        id: 'init_4',
        author: 'Queen Chantilly',
        title: 'Interior Architect',
        avatar: '👑',
        date: 'Yesterday at 06:20 PM',
        content: 'The room editor in the private suites is fantastic! Remember to press [R] to rotate your pastries and sofas before placing them!'
      }
    ];
  }

  saveGuestbookNotes() {
    const key = 'bwedtown_billboard_guestbook';
    try {
      localStorage.setItem(key, JSON.stringify(this.guestbookNotes));
    } catch (e) {
      console.warn('Unable to save guestbook notes:', e);
    }
  }

  initDOM() {
    this.overlayEl = document.createElement('div');
    this.overlayEl.id = 'billboardModalOverlay';
    this.overlayEl.className = 'billboard-modal-overlay';
    this.overlayEl.hidden = true;
    this.overlayEl.style.display = 'none';

    this.overlayEl.innerHTML = `
      <div class="billboard-window">
        <!-- Header -->
        <div class="billboard-header">
          <div class="billboard-kicker-group">
            <span class="billboard-emblem">🥖</span>
            <div class="billboard-titles">
              <span class="billboard-subheading">BWEDTOWN VILLAGE &middot; OFFICIAL NOTICE BOARD</span>
              <h1 class="billboard-main-title" id="billboardMainTitle">THE VILLAGE CHRONICLE &amp; ROADMAP</h1>
            </div>
          </div>
          <button class="billboard-close-btn" id="billboardCloseBtn" type="button" title="Close (Escape)">&times;</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="billboard-tabs-bar">
          <button class="billboard-tab-btn active" data-tab="roadmap" type="button">
            <span>🗺️</span>
            <strong>Development Roadmap</strong>
          </button>
          <button class="billboard-tab-btn" data-tab="gazette" type="button">
            <span>📰</span>
            <strong>Village Chronicle &amp; News</strong>
          </button>
          <button class="billboard-tab-btn" data-tab="gallery" type="button">
            <span>🎨</span>
            <strong>HD Artworks &amp; Concepts</strong>
          </button>
          <button class="billboard-tab-btn" data-tab="events" type="button">
            <span>🏆</span>
            <strong>Tournaments &amp; Events</strong>
          </button>
          <button class="billboard-tab-btn" data-tab="guestbook" type="button">
            <span>💬</span>
            <strong>Citizens' Guestbook</strong>
          </button>
        </div>

        <!-- Dynamic Body -->
        <div class="billboard-body" id="billboardBody">
          <!-- Populated by renderActiveTab() -->
        </div>

        <!-- Footer -->
        <div class="billboard-footer">
          <div class="billboard-footer-info">
            <span class="bwed-tag">Croissant Archipelago &middot; Version 2.0 Alpha</span>
            <span class="bwed-quote">« In fine flour and golden butter, greatness is born. »</span>
          </div>
          <div class="billboard-footer-actions">
            <button class="billboard-secondary-btn" id="billboardLeaveNoteBtn" type="button">
              <span>✍️ Leave a Note</span>
            </button>
            <button class="billboard-primary-btn" id="billboardAcknowledgeBtn" type="button">
              <span>Close Notice Board (Escape)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.container.appendChild(this.overlayEl);
  }

  bindEvents() {
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    this.overlayEl.querySelector('#billboardCloseBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });

    this.overlayEl.querySelector('#billboardAcknowledgeBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    });

    this.overlayEl.querySelector('#billboardLeaveNoteBtn')?.addEventListener('click', () => {
      this.switchTab('guestbook');
      setTimeout(() => {
        const input = document.getElementById('newGuestbookInput');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    });

    // Tab buttons
    this.overlayEl.querySelectorAll('.billboard-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // Escape shortcut
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.isOpen || !this.overlayEl.hidden || this.overlayEl.style.display !== 'none') {
          this.close();
        }
      }
    });
  }

  open(context = {}) {
    this.isOpen = true;
    this.overlayEl.hidden = false;
    this.overlayEl.style.display = 'flex';

    if (context.category === 'roadmap') {
      this.activeTab = 'roadmap';
    } else if (context.category === 'community') {
      this.activeTab = 'guestbook';
    } else if (context.category === 'events') {
      this.activeTab = 'events';
    } else {
      this.activeTab = 'roadmap';
    }

    if (context.title) {
      const titleEl = document.getElementById('billboardMainTitle');
      if (titleEl) titleEl.textContent = context.title.toUpperCase();
    }

    this.audio?.playChime?.();
    this.updateTabButtons();
    this.renderActiveTab();
  }

  close() {
    this.isOpen = false;
    this.overlayEl.hidden = true;
    this.overlayEl.style.display = 'none';
    this.audio?.playPop?.();
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  switchTab(tabName) {
    if (this.activeTab === tabName) return;
    this.activeTab = tabName;
    this.audio?.playClick?.();
    this.updateTabButtons();
    this.renderActiveTab();
  }

  updateTabButtons() {
    this.overlayEl.querySelectorAll('.billboard-tab-btn').forEach((btn) => {
      const tab = btn.getAttribute('data-tab');
      btn.classList.toggle('active', tab === this.activeTab);
    });
  }

  renderActiveTab() {
    const body = document.getElementById('billboardBody');
    if (!body) return;

    switch (this.activeTab) {
      case 'roadmap':
        body.innerHTML = this.renderRoadmapHTML();
        break;
      case 'gazette':
        body.innerHTML = this.renderGazetteHTML();
        break;
      case 'gallery':
        body.innerHTML = this.renderGalleryHTML();
        this.bindGalleryControls();
        break;
      case 'events':
        body.innerHTML = this.renderEventsHTML();
        break;
      case 'guestbook':
        body.innerHTML = this.renderGuestbookHTML();
        this.bindGuestbookControls();
        break;
    }
  }

  /* --------------------------------------------------------------------------
     TAB 1: OFFICIAL ROADMAP
     -------------------------------------------------------------------------- */
  renderRoadmapHTML() {
    return `
      <div class="roadmap-tab-wrapper">
        <div class="roadmap-intro-banner">
          <div class="banner-badge">OFFICIAL DEVELOPMENT ROADMAP &middot; BWEDTOWN</div>
          <h2>The Master Village Plan (2026-2027)</h2>
          <p>
            BwedTown fuses the nostalgic charm of <strong>Pokémon Diamond &amp; Pearl</strong> on Nintendo DS
            with the social warmth of <strong>Animal Crossing</strong> and the personal room instancing of <strong>Habbo Hotel</strong>.
            Here is the live progress of the 5 founding pillars!
          </p>
        </div>

        <div class="roadmap-timeline">
          <!-- Phase 1 -->
          <div class="roadmap-card completed">
            <div class="roadmap-card-header">
              <span class="status-pill completed-pill">✅ PHASE 1 &middot; COMPLETED</span>
              <span class="timeline-date">October 2026</span>
            </div>
            <h3 class="roadmap-phase-title">3D Isometric Engine &amp; Pokémon DS Diorama</h3>
            <ul class="roadmap-deliverables">
              <li>Three.js engine optimized for solid 60 FPS with semi-orthographic diorama camera (36&deg; FOV).</li>
              <li>Tactical 32&times;32 grid with buttery cobblestone roads and tender matcha moss lawns.</li>
              <li>Warm 45&deg; sunlight, soft contact shadows, and cozy atmospheric distance fog.</li>
              <li>Smooth hybrid controls (WASD / Arrows / Virtual Touchpad).</li>
            </ul>
          </div>

          <!-- Phase 2 -->
          <div class="roadmap-card completed">
            <div class="roadmap-card-header">
              <span class="status-pill completed-pill">✅ PHASE 2 &middot; COMPLETED</span>
              <span class="timeline-date">October 2026</span>
            </div>
            <h3 class="roadmap-phase-title">Rigged Avatars, Cozy Shiba Mascot &amp; 3D Showroom</h3>
            <ul class="roadmap-deliverables">
              <li>Animated <strong>Cozy Shiba Buddy</strong> GLB model with full skeletal bone rig.</li>
              <li>Chibi scale normalized to perfection alongside all 24 original Bwed hero avatars.</li>
              <li>Interactive 3D Wardrobe showroom with real-time orbital preview.</li>
              <li>Dynamic waddle animations while walking, sprinting particles, and expressive idles.</li>
            </ul>
          </div>

          <!-- Phase 3 -->
          <div class="roadmap-card completed">
            <div class="roadmap-card-header">
              <span class="status-pill completed-pill">✅ PHASE 3 &middot; COMPLETED &amp; EVOLVING</span>
              <span class="timeline-date">October 2026</span>
            </div>
            <h3 class="roadmap-phase-title">Private 3D Apartment, Habbo Decor &amp; Citizen Passport</h3>
            <ul class="roadmap-deliverables">
              <li>Instanced Milk Carton Apartment loft with brioche parquet flooring and customizable walls.</li>
              <li>Room decorating suite: grid snapping, 90&deg; rotation (<kbd>R</kbd>), and deletion (<kbd>Del</kbd>).</li>
              <li>Persistent backpack inventory featuring exclusive drops distributed by the team.</li>
              <li>Citizen Passport with leveling, adventure statistics, unlocked badges, and portable JSON export.</li>
            </ul>
          </div>

          <!-- Phase 4 -->
          <div class="roadmap-card active">
            <div class="roadmap-card-header">
              <span class="status-pill active-pill">🚀 PHASE 4 &middot; IN ACTIVE PROGRESS</span>
              <span class="timeline-date">November 2026</span>
            </div>
            <h3 class="roadmap-phase-title">Real-Time Multiplayer &amp; Habbo Speech Bubbles</h3>
            <ul class="roadmap-deliverables">
              <li>Lightweight room server (WebSockets) synchronizing citizens in real-time.</li>
              <li>Cartoon speech bubbles floating over avatars' heads with pop-in animations.</li>
              <li>Smooth dead-reckoning interpolation for jitter-free 60 FPS network movement.</li>
              <li>Radial emote wheel (heart, golden crumb, wave, laugh, gg) visible to all neighbors.</li>
            </ul>
          </div>

          <!-- Phase 5 -->
          <div class="roadmap-card upcoming">
            <div class="roadmap-card-header">
              <span class="status-pill upcoming-pill">📅 PHASE 5 &middot; NEXT MILESTONE</span>
              <span class="timeline-date">December 2026 &middot; Q1 2027</span>
            </div>
            <h3 class="roadmap-phase-title">Mini-Game Portals, Tournaments &amp; Community Economy</h3>
            <ul class="roadmap-deliverables">
              <li>Interactive Arcade Cabinet launching <strong>BwedTris 3D</strong> in solo or 1v1 duels.</li>
              <li>Donut Bumper Cars racing track in the South-East fairgrounds.</li>
              <li>Galeries Boutique: cosmetic outfits and rare furniture purchases with Golden Croissants.</li>
              <li>Celestial Portal opening gateways to community event servers and special islands.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     TAB 2: VILLAGE CHRONICLE & NEWS
     -------------------------------------------------------------------------- */
  renderGazetteHTML() {
    return `
      <div class="gazette-tab-wrapper">
        <div class="gazette-front-page">
          <div class="gazette-banner">
            <span class="gazette-flag">🥐 ISSUE NO. 1 &middot; AUTUMN 2026</span>
            <h2>THE BWEDTOWN CRUMB</h2>
            <span class="gazette-tagline">The Daily Gazette of the Crispy Archipelago &middot; Unlimited Circulation</span>
          </div>

          <div class="gazette-articles-grid">
            <!-- Article 1 -->
            <article class="gazette-article featured">
              <div class="article-kicker">MAYOR'S EDITORIAL</div>
              <h3>« Welcome to our golden paradise! »</h3>
              <p>
                Citizens of BwedTown, what an honor to welcome you to our grand diorama!
                From the central square paved with sweet butter cobblestone to the zen matcha terraces,
                every corner of this village has been kneaded to offer the coziest retreat. Take time to stroll down
                the boulevards, greet your neighbors, and decorate your apartment suite. Here, every crumb counts!
              </p>
              <div class="article-signature">— <strong>Chef Brioche</strong>, Mayor of BwedTown</div>
            </article>

            <!-- Article 2 -->
            <article class="gazette-article">
              <div class="article-kicker">TREASURE HUNT</div>
              <h3>10 Golden Croissants Scattered in Town</h3>
              <p>
                A royal crate of <strong>Golden Croissants</strong> fell from the Eclair Express!
                They now float and shimmer across the four districts: near the sacred fountain,
                deep inside the botanical park, behind the tavern, and on the residential terrace.
                Collect all 10 to unlock the legendary badge in your <strong>Citizen Passport</strong>!
              </p>
            </article>

            <!-- Article 3 -->
            <article class="gazette-article">
              <div class="article-kicker">INFRASTRUCTURE &amp; LIGHTING</div>
              <h3>New Honey Lantern Streetlamps Installed!</h3>
              <p>
                The Public Works Guild has upgraded our city lighting with genuine 3D <strong>Honey Lanterns</strong>!
                Their amber glass diffuses a comforting warm glow along the avenues, guaranteeing magical
                evening strolls under the stars.
              </p>
            </article>

            <!-- Article 4 -->
            <article class="gazette-article">
              <div class="article-kicker">HOUSING &amp; LOFTS</div>
              <h3>Milk Carton Apartments Open for Citizens</h3>
              <p>
                Ever dreamed of a pied-&agrave;-terre inside an antique milk carton?
                Your suite is waiting! Step through the doorway at <em>x=5, z=6</em> or click the
                <strong>🏠 Apartment</strong> button to design your interior with our collection of 20+ sweet furniture pieces.
              </p>
            </article>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     TAB 3: HD ARTWORKS & CONCEPTS
     -------------------------------------------------------------------------- */
  renderGalleryHTML() {
    const current = this.artworks[this.selectedArtworkIndex] || this.artworks[0];

    return `
      <div class="gallery-tab-wrapper">
        <div class="gallery-showcase">
          <div class="gallery-image-frame">
            <img src="${current.file}" alt="${current.title}" class="gallery-hero-img" id="galleryHeroImg" />
            <div class="gallery-image-badge">${current.author}</div>
          </div>

          <div class="gallery-info-card">
            <div class="gallery-info-header">
              <span class="gallery-category-pill">CANON BWED CONCEPT</span>
              <span class="gallery-counter">${this.selectedArtworkIndex + 1} / ${this.artworks.length}</span>
            </div>
            <h3 class="gallery-artwork-title">${current.title}</h3>
            <h4 class="gallery-artwork-subtitle">${current.subtitle}</h4>
            <p class="gallery-artwork-desc">${current.desc}</p>

            <div class="gallery-nav-buttons">
              <button class="gallery-prev-btn" id="galleryPrevBtn" type="button">◀ Previous Artwork</button>
              <button class="gallery-next-btn" id="galleryNextBtn" type="button">Next Artwork ▶</button>
            </div>
          </div>
        </div>

        <!-- Thumbnail Carousel Strip -->
        <div class="gallery-carousel-strip">
          ${this.artworks.map((art, idx) => `
            <button class="gallery-thumb-btn ${idx === this.selectedArtworkIndex ? 'active' : ''}" data-index="${idx}" type="button" title="${art.title}">
              <img src="${art.file}" alt="${art.title}" class="gallery-thumb-img" />
              <span class="gallery-thumb-label">${art.title.replace('The ', '')}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindGalleryControls() {
    document.getElementById('galleryPrevBtn')?.addEventListener('click', () => {
      this.selectedArtworkIndex = (this.selectedArtworkIndex - 1 + this.artworks.length) % this.artworks.length;
      this.audio?.playClick?.();
      this.renderActiveTab();
    });

    document.getElementById('galleryNextBtn')?.addEventListener('click', () => {
      this.selectedArtworkIndex = (this.selectedArtworkIndex + 1) % this.artworks.length;
      this.audio?.playClick?.();
      this.renderActiveTab();
    });

    this.overlayEl.querySelectorAll('.gallery-thumb-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) {
          this.selectedArtworkIndex = idx;
          this.audio?.playClick?.();
          this.renderActiveTab();
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     TAB 4: TOURNAMENTS & EVENTS
     -------------------------------------------------------------------------- */
  renderEventsHTML() {
    return `
      <div class="events-tab-wrapper">
        <div class="events-header-banner">
          <span class="events-badge">COMMUNITY CALENDAR</span>
          <h2>Tournaments &amp; Village Festivals</h2>
          <p>Join official community competitions and chill gatherings hosted by the Team!</p>
        </div>

        <div class="events-grid">
          <div class="event-card upcoming-event">
            <div class="event-date-badge">
              <span class="event-month">SAT</span>
              <strong class="event-day">15:00</strong>
            </div>
            <div class="event-details">
              <span class="event-category">ARCADE TOURNAMENT</span>
              <h3 class="event-title">The Grand BwedTris 3D Clash</h3>
              <p class="event-desc">
                Meet at the central Arcade Cabinet (East Avenue) for a knockout tournament.
                Golden Croissants and the exclusive <em>Diamond Waffle Trophy</em> up for grabs!
              </p>
              <div class="event-perks">
                <span>🎁 Reward: Gold Trophy &amp; Coins</span>
                <span>📍 Location: Arcade Duel Arena</span>
              </div>
            </div>
          </div>

          <div class="event-card">
            <div class="event-date-badge">
              <span class="event-month">SUN</span>
              <strong class="event-day">18:00</strong>
            </div>
            <div class="event-details">
              <span class="event-category">DECOR CONTEST</span>
              <h3 class="event-title">Coziest Room of the Archipelago</h3>
              <p class="event-desc">
                The Milk Carton judging jury will tour all decorated apartments.
                Judging criteria: sponge cake color harmony, plush pastry seating, and cozy lighting.
              </p>
              <div class="event-perks">
                <span>🎁 Reward: Limited Edition Furniture</span>
                <span>📍 Location: Milk Carton Lofts</span>
              </div>
            </div>
          </div>

          <div class="event-card">
            <div class="event-date-badge">
              <span class="event-month">DAILY</span>
              <strong class="event-day">20:30</strong>
            </div>
            <div class="event-details">
              <span class="event-category">SOCIAL CHILL</span>
              <h3 class="event-title">Hot Cocoa &amp; Jukebox at the Tavern</h3>
              <p class="event-desc">
                Meet neighbors at the counter of the Honey Pot Tavern to chat,
                listen to retro Pokémon DS chiptunes, and play friendly dice games.
              </p>
              <div class="event-perks">
                <span>🎁 Reward: Cozy vibes &amp; friendships</span>
                <span>📍 Location: Honey Pot Tavern</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* --------------------------------------------------------------------------
     TAB 5: CITIZENS' GUESTBOOK
     -------------------------------------------------------------------------- */
  renderGuestbookHTML() {
    const prof = this.profileManager?.profile;
    const myPseudo = prof?.nickname || 'Gourmet Wanderer';

    return `
      <div class="guestbook-tab-wrapper">
        <div class="guestbook-header-banner">
          <span class="guestbook-badge">COMMUNITY BULLETIN BOARD</span>
          <h2>The Citizens' Guestbook</h2>
          <p>
            Every resident can pin a friendly note, announcement, or suggestion on this public board.
            Your notes stay saved in your resident profile!
          </p>
        </div>

        <!-- Composer Form -->
        <div class="guestbook-composer-card">
          <div class="composer-header">
            <span class="composer-avatar-icon">✏️</span>
            <div>
              <strong>Pin a New Note</strong>
              <small>Posting as: <strong>${myPseudo}</strong></small>
            </div>
          </div>

          <form id="guestbookComposerForm" class="guestbook-form">
            <textarea
              id="newGuestbookInput"
              class="guestbook-textarea"
              placeholder="Write your message here... (e.g. Loving the town! Who wants a game of BwedTris?)"
              rows="3"
              maxlength="200"
              required
            ></textarea>
            <div class="composer-actions">
              <span class="char-counter" id="composerCharCounter">0 / 200</span>
              <button class="composer-submit-btn" type="submit">
                <span>📌 Pin to Board</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Pinned Notes List -->
        <div class="guestbook-notes-list" id="guestbookNotesList">
          ${this.guestbookNotes.map((note) => `
            <div class="guestbook-note-card">
              <div class="note-pin">📌</div>
              <div class="note-header">
                <span class="note-avatar">${note.avatar || '🍞'}</span>
                <div class="note-author-info">
                  <strong class="note-author">${note.author}</strong>
                  <span class="note-title">${note.title || 'BwedTown Citizen'}</span>
                </div>
                <span class="note-date">${note.date}</span>
              </div>
              <p class="note-content">${note.content}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindGuestbookControls() {
    const textarea = document.getElementById('newGuestbookInput');
    const counter = document.getElementById('composerCharCounter');
    const form = document.getElementById('guestbookComposerForm');

    textarea?.addEventListener('input', () => {
      if (counter) counter.textContent = `${textarea.value.length} / 200`;
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = textarea?.value?.trim();
      if (!text) return;

      const prof = this.profileManager?.profile;
      const authorName = prof?.nickname || 'Crispy Visitor';
      const authorTitle = prof?.title || 'BwedTown Citizen';

      const newNote = {
        id: 'note_' + Date.now(),
        author: authorName,
        title: authorTitle,
        avatar: '🥐',
        date: 'Just now',
        content: text
      };

      this.guestbookNotes.unshift(newNote);
      this.saveGuestbookNotes();

      this.audio?.playChime?.();
      this.renderActiveTab();
    });
  }
}
