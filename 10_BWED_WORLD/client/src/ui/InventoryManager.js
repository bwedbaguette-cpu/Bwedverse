/* ==========================================================================
   GESTIONNAIRE D'INVENTAIRE & OBJETS D'ÉVÉNEMENTS — BWEDTOWN
   - Système complet d'inventaire persistant (localStorage)
   - Objets de mobilier pour l'appartement personnel (Habbo Style)
   - Drops exclusifs distribués par la team lors des événements du serveur
   - Badges, trophées, consommables et raretés (Commun, Rare, Épique, Légendaire)
   ========================================================================== */

export const ITEM_RARITY = {
  COMMON: { label: 'Common', color: '#94a3b8', border: '#475569' },
  RARE: { label: 'Rare', color: '#38bdf8', border: '#0284c7' },
  EPIC: { label: 'Epic', color: '#c084fc', border: '#9333ea' },
  LEGENDARY: { label: 'Legendary Bwed', color: '#fbbf24', border: '#d97706' }
};

export const DEFAULT_INVENTORY_ITEMS = [
  // --- HABBO FURNITURE FOR APARTMENT ---
  {
    id: 'furn_brioche_sofa',
    name: 'Velvet Brioche Sofa',
    category: 'furniture',
    type: 'furniture',
    icon: '🛋️',
    rarity: 'RARE',
    model: 'brioche-sofa',
    footprint: { w: 2, h: 1 },
    desc: 'A plush sofa with warm buttery padding. Perfect for lounging with friends in your private room.',
    teamDrop: false,
    quantity: 1
  },
  {
    id: 'furn_pretzel_bench',
    name: 'Sugar Pretzel Bench',
    category: 'furniture',
    type: 'furniture',
    icon: '🥨',
    rarity: 'RARE',
    model: 'pretzel-bench.glb',
    footprint: { w: 2, h: 1 },
    desc: 'Artisan bench hand-sculpted from oven-golden pretzel dough. Classic BwedTown style.',
    teamDrop: false,
    quantity: 2
  },
  {
    id: 'furn_waffle_table',
    name: 'Crispy Waffle Coffee Table',
    category: 'furniture',
    type: 'furniture',
    icon: '🧇',
    rarity: 'COMMON',
    model: 'waffle-table',
    footprint: { w: 1, h: 1 },
    desc: 'Compact geometric coffee table with crisp grid indents to place steaming cups.',
    teamDrop: false,
    quantity: 1
  },
  {
    id: 'furn_honey_lamp',
    name: 'Amber Honey Jar Lantern',
    category: 'furniture',
    type: 'furniture',
    icon: '🍯',
    rarity: 'RARE',
    model: 'honey-lantern.glb',
    footprint: { w: 1, h: 1 },
    desc: 'Casts a warm and relaxing golden glow across your entire living space.',
    teamDrop: false,
    quantity: 2
  },
  {
    id: 'furn_milk_fridge',
    name: 'Milk Carton Mini-Fridge',
    category: 'furniture',
    type: 'furniture',
    icon: '🥛',
    rarity: 'EPIC',
    model: 'milk-carton-apartments.glb',
    footprint: { w: 1, h: 1 },
    desc: 'Miniature diorama replica of the Milk Carton Residence. Keeps butter fresh.',
    teamDrop: false,
    quantity: 1
  },
  {
    id: 'furn_bread_crates',
    name: 'Golden Bread Crates',
    category: 'furniture',
    type: 'furniture',
    icon: '🍞',
    rarity: 'COMMON',
    model: 'bread-cubes.glb',
    footprint: { w: 1, h: 1 },
    desc: 'Rustic wooden storage crates lightly dusted with organic bakery flour.',
    teamDrop: false,
    quantity: 2
  },
  {
    id: 'furn_treasure_box',
    name: 'Varnished Secret Chest',
    category: 'furniture',
    type: 'furniture',
    icon: '📦',
    rarity: 'EPIC',
    model: 'treasure-chest.glb',
    footprint: { w: 1, h: 1 },
    desc: 'Historic pioneer chest with gleaming brass hinges and deep wood tones.',
    teamDrop: false,
    quantity: 1
  },
  {
    id: 'furn_marshmallow_hearth',
    name: 'Indoor Marshmallow Hearth',
    category: 'furniture',
    type: 'furniture',
    icon: '🔥',
    rarity: 'LEGENDARY',
    model: 'marshmallow-campfire.glb',
    footprint: { w: 2, h: 2 },
    desc: 'A cozy, safe indoor hearth for roasting golden marshmallows with fellow citizens.',
    teamDrop: false,
    quantity: 1
  },

  // --- EVENT DROPS & TEAM GIFTS ---
  {
    id: 'drop_shiba_golden_statue',
    name: 'Golden Cozy Shiba Figurine',
    category: 'event',
    type: 'event',
    icon: '🐕',
    rarity: 'LEGENDARY',
    model: 'cozy-shiba.glb',
    footprint: { w: 1, h: 1 },
    desc: '🎁 Exclusive gift dropped by the Bwed Team at the grand launch of BwedTown! Lucky charm figurine.',
    teamDrop: true,
    donor: 'Team Bwed Studio',
    quantity: 1
  },
  {
    id: 'drop_founder_badge',
    name: 'BwedTown Founder Badge',
    category: 'event',
    type: 'badge',
    icon: '🎫',
    rarity: 'EPIC',
    desc: 'Commemorative gold plaque certifying your presence among the founding pioneers of the city.',
    teamDrop: true,
    donor: 'Central Server',
    quantity: 1
  },
  {
    id: 'drop_golden_master_baker',
    name: 'Grand Master Baker Trophy',
    category: 'event',
    type: 'trophy',
    icon: '🏆',
    rarity: 'LEGENDARY',
    desc: 'Supreme honorary trophy awarded to explorers who discover all 10 hidden Golden Croissants.',
    teamDrop: true,
    donor: 'Council of BwedTown',
    quantity: 1
  },

  // --- CONSUMABLES & SPECIAL ITEMS ---
  {
    id: 'item_golden_croissant',
    name: 'Sacred Golden Croissant',
    category: 'consumable',
    type: 'consumable',
    icon: '🥐',
    rarity: 'EPIC',
    desc: 'Legendary pastry sprinkled with cosmic sugar flakes. Fully restores energy.',
    teamDrop: false,
    quantity: 3
  },
  {
    id: 'item_matcha_tea',
    name: 'Ceremonial Matcha Tea',
    category: 'consumable',
    type: 'consumable',
    icon: '🍵',
    rarity: 'COMMON',
    desc: 'Relaxing hot herbal brew picked from the Botanical Park.',
    teamDrop: false,
    quantity: 5
  }
];

export class InventoryManager {
  constructor(options = {}) {
    this.modalEl = document.getElementById(options.modalId || 'inventoryModal');
    this.audio = options.audio || null;
    this.onPlaceFurniture = options.onPlaceFurniture || null;
    this.onEnterApartment = options.onEnterApartment || null;

    this.items = [];
    this.activeCategory = 'all'; // 'all', 'furniture', 'event', 'consumable'
    this.selectedItemId = null;

    this.loadFromStorage();
    this.initDOM();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('bwed_player_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Refresh item titles and descriptions to English while preserving quantities
        this.items = parsed.map(item => {
          const def = DEFAULT_INVENTORY_ITEMS.find(d => d.id === item.id);
          if (def) {
            return { ...def, quantity: item.quantity !== undefined ? item.quantity : def.quantity };
          }
          return item;
        });
      } else {
        this.items = JSON.parse(JSON.stringify(DEFAULT_INVENTORY_ITEMS));
        this.saveToStorage();
      }
    } catch (e) {
      this.items = JSON.parse(JSON.stringify(DEFAULT_INVENTORY_ITEMS));
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('bwed_player_inventory', JSON.stringify(this.items));
    } catch (e) {}
  }

  addItem(newItem) {
    const existing = this.items.find(i => i.id === newItem.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (newItem.quantity || 1);
    } else {
      this.items.push(newItem);
    }
    this.saveToStorage();
    this.renderItemsList();
  }

  removeItem(itemId, count = 1) {
    const index = this.items.findIndex(i => i.id === itemId);
    if (index === -1) return false;

    this.items[index].quantity = (this.items[index].quantity || 1) - count;
    if (this.items[index].quantity <= 0) {
      this.items.splice(index, 1);
    }
    this.saveToStorage();
    this.renderItemsList();
    return true;
  }

  initDOM() {
    if (!this.modalEl) return;

    this.modalEl.innerHTML = `
      <div class="modal-card inventory-card">
        <div class="modal-header">
          <div>
            <span class="overlay-kicker">BACKPACK &middot; BWEDTOWN</span>
            <h2 class="modal-title">Inventory &amp; Event Drops</h2>
          </div>
          <button class="modal-close-btn" id="closeInventoryBtn" type="button" title="Close inventory">&times;</button>
        </div>

        <div class="inventory-body">
          <!-- Left Column: Filters and Grid of Items -->
          <div class="inventory-main-col">
            <div class="inventory-category-tabs">
              <button class="inv-tab active" data-cat="all" type="button">All (<span id="countAll">0</span>)</button>
              <button class="inv-tab" data-cat="furniture" type="button">🛋️ Habbo Furniture</button>
              <button class="inv-tab" data-cat="event" type="button">🎁 Team Drops &amp; Events</button>
              <button class="inv-tab" data-cat="consumable" type="button">🥐 Consumables</button>
            </div>

            <div class="inventory-items-grid" id="inventoryItemsGrid"></div>
          </div>

          <!-- Right Column: Selected Item Detail Card -->
          <div class="inventory-details-col" id="inventoryDetailsCol">
            <div class="inv-detail-empty" id="invDetailEmpty">
              <span>Select an item to view its details</span>
            </div>

            <div class="inv-detail-content" id="invDetailContent" hidden>
              <div class="inv-detail-header">
                <div class="inv-detail-icon-wrap" id="invDetailIconWrap">
                  <span id="invDetailIcon">🛋️</span>
                </div>
                <div>
                  <h3 class="inv-detail-title" id="invDetailTitle">Item Name</h3>
                  <span class="inv-rarity-pill" id="invDetailRarity">Rare</span>
                </div>
              </div>

              <div class="inv-meta-box" id="invDonorBox" hidden>
                <span class="donor-label">Distributed by:</span>
                <strong class="donor-name" id="invDonorName">Team Bwed</strong>
              </div>

              <p class="inv-detail-desc" id="invDetailDesc">Item description...</p>

              <div class="inv-actions-box">
                <button class="modal-btn primary" id="invActionPrimaryBtn" type="button">
                  <span>🛋️ Place in My Apartment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('closeInventoryBtn')?.addEventListener('click', () => {
      this.close();
    });

    this.modalEl.querySelectorAll('.inv-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.modalEl.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.getAttribute('data-cat') || 'all';
        this.renderItemsList();
      });
    });

    document.getElementById('invActionPrimaryBtn')?.addEventListener('click', () => {
      this.handlePrimaryAction();
    });
  }

  open() {
    if (this.modalEl) {
      this.modalEl.hidden = false;
    }
    this.renderItemsList();
    if (this.items.length > 0 && !this.selectedItemId) {
      this.selectItem(this.items[0].id);
    }
  }

  close() {
    if (this.modalEl) {
      this.modalEl.hidden = true;
    }
  }

  getFilteredItems() {
    if (this.activeCategory === 'all') return this.items;
    return this.items.filter(i => i.category === this.activeCategory);
  }

  renderItemsList() {
    const grid = document.getElementById('inventoryItemsGrid');
    const countAll = document.getElementById('countAll');
    if (!grid) return;

    if (countAll) countAll.textContent = this.items.length;
    grid.innerHTML = '';

    const list = this.getFilteredItems();

    if (list.length === 0) {
      grid.innerHTML = `<div class="inv-empty-state">No items found in this category.</div>`;
      return;
    }

    for (const item of list) {
      const isSelected = item.id === this.selectedItemId;
      const card = document.createElement('div');
      card.className = `inv-item-card ${isSelected ? 'active' : ''} rarity-${item.rarity.toLowerCase()}`;
      card.innerHTML = `
        <div class="inv-card-badge">${item.quantity > 1 ? 'x' + item.quantity : ''}</div>
        <div class="inv-card-icon">${item.icon || '📦'}</div>
        <span class="inv-card-name">${item.name}</span>
      `;

      card.addEventListener('click', () => {
        this.selectItem(item.id);
      });

      grid.appendChild(card);
    }
  }

  selectItem(itemId) {
    this.selectedItemId = itemId;
    const item = this.items.find(i => i.id === itemId);
    if (!item) return;

    this.audio?.playStep?.();

    document.querySelectorAll('.inv-item-card').forEach(c => c.classList.remove('active'));
    this.renderItemsList();

    const emptyBox = document.getElementById('invDetailEmpty');
    const contentBox = document.getElementById('invDetailContent');
    const iconEl = document.getElementById('invDetailIcon');
    const titleEl = document.getElementById('invDetailTitle');
    const rarityEl = document.getElementById('invDetailRarity');
    const donorBox = document.getElementById('invDonorBox');
    const donorName = document.getElementById('invDonorName');
    const descEl = document.getElementById('invDetailDesc');
    const btn = document.getElementById('invActionPrimaryBtn');

    if (emptyBox) emptyBox.hidden = true;
    if (contentBox) contentBox.hidden = false;

    if (iconEl) iconEl.textContent = item.icon || '📦';
    if (titleEl) titleEl.textContent = item.name;
    if (descEl) descEl.textContent = item.desc;

    const rarityInfo = ITEM_RARITY[item.rarity] || ITEM_RARITY.COMMON;
    if (rarityEl) {
      rarityEl.textContent = rarityInfo.label;
      rarityEl.style.color = rarityInfo.color;
      rarityEl.style.borderColor = rarityInfo.border;
    }

    if (donorBox && donorName) {
      if (item.teamDrop && item.donor) {
        donorBox.hidden = false;
        donorName.textContent = item.donor;
      } else {
        donorBox.hidden = true;
      }
    }

    if (btn) {
      if (item.category === 'furniture') {
        btn.innerHTML = `<span>🛋️ Place in My Apartment</span>`;
      } else if (item.category === 'consumable') {
        btn.innerHTML = `<span>✨ Savor / Consume</span>`;
      } else {
        btn.innerHTML = `<span>⭐ Inspect Trophy</span>`;
      }
    }
  }

  handlePrimaryAction() {
    const item = this.items.find(i => i.id === this.selectedItemId);
    if (!item) return;

    if (item.category === 'furniture') {
      this.close();
      if (this.onPlaceFurniture) {
        this.onPlaceFurniture(item);
      } else if (this.onEnterApartment) {
        this.onEnterApartment(item);
      }
    } else if (item.category === 'consumable') {
      this.audio?.playCoinCollect?.();
      alert(`✨ You savor: ${item.name}! Delicious and energizing.`);
    } else {
      this.audio?.playCoinCollect?.();
      alert(`🏆 ${item.name}: ${item.desc}`);
    }
  }
}
