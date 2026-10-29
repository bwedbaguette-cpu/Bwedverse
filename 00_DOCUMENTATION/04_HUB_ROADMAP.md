# BWEDVERSE — Master Roadmap & Boîte à Idées

Ce document centralise la vision produit, l'état d'avancement et toutes les idées de développement pour le **WebHub**, les **Jeux** (*Crumb Run*, *Tetris Bwed Edition*, *BwedWare*), le **Village 3D Multijoueur sur navigateur**, ainsi que la production des **Assets & Pions 3D (`.glb`)**.

---

## 1. Le WebHub Bwedverse (`06_BRAND_AND_HUB/03_HUB_SITE/`)

### Ce qui est déjà en place
- Landing page interactive ([`index.html`](file:///Users/eutelion/Desktop/bwed/06_BRAND_AND_HUB/03_HUB_SITE/index.html)) avec Hero animé, explorateur d'univers (Monde, Histoires, Jeux, Memes), présentation du Canon, Timeline des 2 ans et micro-jeu 2D *Bwed Up*.
- Déploiement statique prêt pour Vercel ([`vercel.json`](file:///Users/eutelion/Desktop/bwed/06_BRAND_AND_HUB/03_HUB_SITE/vercel.json), [`DEPLOY.md`](file:///Users/eutelion/Desktop/bwed/06_BRAND_AND_HUB/03_HUB_SITE/DEPLOY.md)).

### Idées & Évolutions prévues pour le Hub
- **Portail "Arcade Center"** : Accès direct depuis le Hub à tous les jeux Bwed (*Crumb Run 3D*, *BwedWare Rush*, *Tetris Bwed Edition*, *Bwed Village*).
- **Profil Joueur Universel (Local + Cloud léger)** :
  - Choix de son pseudo et de son **Avatar Bwed 3D favori**.
  - Portefeuille de **Miettes Dorées (*Crumbs* / `★`)** gagnées dans les mini-jeux pour débloquer des titres, emotes ou skins dans le Village.
- **Galerie 3D Interactive ("The Bakery Showcase")** : Un carrousel 3D permettant d'inspecter tous les pions `.glb` sous tous les angles avec leur fiche de lore et leur talent.
- **Mur Communautaire & Memes filtrables** : Connecté à `asset_manifest.csv` pour parcourir toute l'histoire de Bwed par époque.

---

## 2. Jeu #1 : *Crumb Run — BWED Party & BwedWare* (`party-board.html`)

### Ce qui est déjà fonctionnel
- **17 personnages `.glb` texturés jouables** ([`assets/pawns/`](file:///Users/eutelion/Desktop/bwed/06_BRAND_AND_HUB/03_HUB_SITE/assets/pawns)) avec chacun un rôle et un **Talent Unique**.
- **Mode Solo vs Bots IA & Multijoueur Local (2 à 6 joueurs)** avec bouton *Randomize*.
- **Plateau 3D *Bakery Grand Prix*** : Grille-pain géant animé au centre, dé 3D physique, 6 types de cases (`START`, `+2c`, `SHOP`, `? Portal`, `VS Duel`, `🔥 Risk`), chasse au *Golden Crumb* (`★`) et **Bonus Stars** de fin de partie.
- **6 Mini-Jeux rapides façon *WarioWare* (*BwedWare*)** :
  1. `TOASTER REFLEX` (*Pop in Green!*)
  2. `CRUMB FRENZY` (*Catch Crumbs!*)
  3. `SOLANA ROCKET` (*Mash Space / Click!*)
  4. `WHACK-A-BWED` (*Tap the Bweds!*)
  5. `BUTTER SPREAD` (*Butter the Slice!*)
  6. `BWED DETECTIVE` (*Find the Target!*)

### Idées & Prochaines Étapes pour *Crumb Run*
- [ ] **Nouveaux Plateaux 3D thématiques** :
  - *Bwedbank Vault* : Tapis roulants de billets, coffres-forts et taxes du Juge Gaveltoes.
  - *Moon Crust Station* : Plateau spatial en gravité réduite avec portails de téléportation.
  - *Kitchen Chaos* : Parcours géant sur un plan de travail de cuisine entre plaques chauffantes et pots de Nutella.
- [x] **6 Bâtiments 3D `.glb` intégrés au plateau** : `patisserie-coin.glb`, `galeries-boutique.glb`, `arcade-duel.glb` (et Monument Central Géant), `portal-observatory.glb`, `milk-carton-apartments.glb`, `jam-jar-apothecary.glb`.
- [x] **Foule 3D « Hors Map » (Tribunes de Spectateurs)** : Les 17 personnages `.glb` s'affichent simultanément (joueurs sur le trottoir + foule complète dans les tribunes Nord/Est/Ouest/Sud qui fait la ola).
- [ ] **Dé 3D `.glb` Bwed Party (`bwed-dice.glb`)** : Générer l'image concept via le Prompt `#101` ci-dessous, la convertir en `.glb` (Meshy/Tripo) et la déposer dans `06_BRAND_AND_HUB/03_HUB_SITE/assets/buildings/bwed-dice.glb` (le moteur `party-board.js` le charge automatiquement pour l'animation au-dessus de la tête des joueurs !).
- [ ] **Assets 3D `.glb` de décor supplémentaires pour le plateau** : Remplacer les formes géométriques restantes par des props 3D dédiés (arche de départ en four à pain, ponts en gaufres, lampadaires cuillères).
- [ ] **Nouveaux Mini-Jeux *BwedWare* & Mini-Jeux 4 Joueurs** :
  - *Bumper Toasts* : Arène circulaire sur une poêle beurrée où les 4 pions se foncent dedans pour éjecter les autres.
  - *Hot Potato Bomb* : Se passer un grille-pain explosif avant qu'il ne saute.
  - *Memory Loaf* : Retenir l'ordre des ingrédients sur un sandwich géant.
  - *Knife Dodge* : Sauter par-dessus un couteau à beurre géant qui balaie l'écran de plus en plus vite.
- [ ] **Mode Multijoueur en Ligne (Room Code)** : Permettre de créer une partie avec un code à 4 lettres pour que les potes rejoignent depuis leur propre navigateur.

---

## 3. Jeu #2 : *Tetris — BWED Edition* (*Loaf Stack / Bwedomino*)

### Concept & Direction Artistique
- Un **Tetris / Puzzle-game ultra-dynamique et juteux** entièrement dans l'univers de la boulangerie Bwed.
- **La Grille** : L'intérieur d'un grille-pain géant en métal chromé.
- **Les Pièces (Tetrominos)** : Composées de petites tranches de Bwed, croissants, brioches, carrés de chocolat et plaquettes de beurre avec des petits yeux expressifs.
- **Feedback visuel ("Juice")** :
  - Quand une ligne est complétée, les résistances du grille-pain s'allument sur les côtés, la ligne **dore à point** et saute avec une pluie de miettes croustillantes !
  - Un *Tetris* (4 lignes d'un coup) déclenche le mode **GOLDEN FEAST** avec musique accélérée et multiplicateur ×2.
- **Système de Héros (Pions GLB en 3D à côté de la grille)** :
  - Ton pion 3D s'anime à côté du puits Tetris et possède une capacité spéciale quand ta jauge de miettes est pleine :
    - *Blaze Bwed (Pompier)* : Éteint et détruit les 3 lignes du bas.
    - *Toastie Baker* : Transforme les trous vides en blocs de mie.
    - *Judge Gaveltoes* : Frappe du maillet pour tasser tous les blocs flottants.
    - *Crumb Burglar* : Vole la prochaine pièce idéale.

---

## 4. Projet #3 : *Bwed Village 3D* — Monde Social Multijoueur sur Navigateur

### Vision
Un **petit village Bwed en 3D dans le navigateur** où les potes peuvent se connecter instantanément, choisir leur avatar parmi tous les modèles `.glb`, se balader au clavier/souris ou manette, discuter et lancer les mini-jeux ensemble.

### Conception 3D des Assets de la Map (*Bwed Village*)
Pour garder un rendu fluide sur navigateur tout en ayant une direction artistique adorable, la map sera assemblée à partir de **modules 3D `.glb`** :
1. **La Place Centrale (*La Mie Place*)** :
   - Fontaine centrale de chocolat chaud ou de beurre fondu.
   - Statue dorée du *Bwed Naked* aux chaussures rouges.
   - Bancs en biscuits, lampadaires en cuillères de bois, pavés en tranches de pain grillé.
2. **La Boulangerie Natale (*The Grand Oven* — Point de Spawn)** :
   - Quand un joueur rejoint le serveur, son avatar Bwed est éjecté d'un grand four en brique avec une petite fumée chaude !
3. **La Salle d'Arcade (*BwedWare Arcade*)** :
   - Bâtiment rétro-futuriste avec néons. S'approcher d'une borne ouvre directement *Crumb Run*, *Tetris Bwed Edition* ou *BwedWare Rush* avec les joueurs qui sont autour de la borne.
4. **La *Bwedbank* & Le Musée du Lore** :
   - Bâtiment à colonnes où sont exposés les memes historiques, le classement des joueurs les plus riches en *Crumbs* et les trophées.
5. **Le *Crust Closet* (Cabine de Cosplay)** :
   - Permet de changer de personnage `.glb` en direct au milieu du village avec un effet de fumée / étincelles.
6. **Le Quai & Le *Whale Boat*** :
   - Petit port au bord d'une mer de lait/café avec *Whale Buddy* et le bateau de *Pirate Bwed*.

### Stack Technique Recommandée pour le Village
- **Rendu 3D** : Three.js (réutilisation directe des 17+ `.glb` de `assets/pawns/`).
- **Physique / Collisions légères** : Raycasting simple ou capsule collider sur le sol du village.
- **Multijoueur Temps Réel** : WebSockets légers (ex. PartyKit, Supabase Realtime ou serveur Node/WS) synchronisant `{ position, rotation, avatarId, emote, chatMessage }` de chaque joueur + bulles de texte en HTML/CSS au-dessus des têtes.

---

## 5. Catalogue & Pipeline des Pions 3D (`.glb`)

### A. Les 17 Pions `.glb` déjà intégrés dans `assets/pawns/`
1. `glow-toast.glb` — **Glow Toast** (Original doré)
2. `toast-bandit.glb` — **Toast Bandit** (Cowboy Hors-la-loi)
3. `crimson-mage.glb` — **Crimson Mage** (Mage mystique)
4. `crimson-samurai.glb` — **Crimson Samurai** (Samouraï écarlate)
5. `frankenbwed.glb` — **FrankenBwed** (Créature électrique)
6. `brave-firefighter.glb` — **Blaze Bwed** (Pompier)
7. `choco-drip.glb` — **Choco Drip** (Nappage chocolat)
8. `judge-gaveltoes.glb` — **Judge Gaveltoes** (Juge suprême)
9. `rusty-buttonbot.glb` — **Rusty Buttonbot** (Robot grille-pain)
10. `saiyan-toast.glb` — **Saiyan Toast** (Guerrier aura dorée)
11. `cloud-ninja.glb` — **Cloud Shinobi** (Ninja nuage rouge)
12. `whale-buddy.glb` — **Whale Buddy** (Costume de baleine)
13. `nerdy-buddy.glb` — **Nerdy Gadget** (Geek à lunettes & GameBoy)
14. `shadow-ninja.glb` — **Shadow Ninja** (Ninja furtif noir)
15. `crumb-burglar.glb` — **Crumb Burglar** (Cambrioleur rayé & sac d'or)
16. `tiny-baker.glb` — **Toastie Baker** (Maître boulanger au rouleau & croissant)
17. `toast-tycoon.glb` — **Toast Tycoon** (Banquier chapeau melon & mallette de billets)

### B. Concepts 2D prêts dans `01_CANON_BWED/02_CAST_AND_VARIANTS/` à convertir en `.glb`
- [ ] **Pirate Bwed** (`Gemini_Generated_Image_hinv9lhinv9lhinv.jpg`) — Tricorne, cache-œil, crochet, sabre et jambe de bois.
- [ ] **Sherlock Bwed** (`Gemini_Generated_Image_vvjxu9vvjxu9vvjx.jpg` & `og9wbj...jpg`) — Casquette deerstalker, cape/imper, pipe et loupe.
- [ ] **Astro Bwed** (`Gemini_Generated_Image_vwl33lvwl33lvwl3.jpg`) — Combinaison spatiale blanche et casque bulle.
- [ ] **Officer Bwed** (`Gemini_Generated_Image_wez3lpwez3lpwez3.jpg`) — Uniforme de police, képi et menottes.
- [ ] **Sir Bwed / Knight** (`Gemini_Generated_Image_ywawm1ywawm1ywaw.jpg` & `ici48c...jpg`) — Armure de chevalier, épée et bouclier blason blé.
- [ ] **Rasta Bwed** (`Gemini_Generated_Image_ubzp2wubzp2wubzp.jpg`) — Bonnet rasta, dreadlocks et petites lunettes.
- [ ] **Pastry Chef Bwed** (`Gemini_Generated_Image_qapktkqapktkqapk.jpg`) — Toque, veste de chef, fouet et cuillère en bois.
- [ ] **Tabletop RPG Bwed** (`Gemini_Generated_Image_y7fv1wy7fv1wy7fv.jpg`) — Armure de cuir, casque et bouclier D&D.

### C. Idées de futurs Pions & Cosplays à concevoir
- [ ] **Bwed Naked Canon (Chaussures Rouges)** : Version `.glb` fidèle à 100% à la planche de référence canonique.
- [ ] **King Bwed** : Couronne dorée, manteau d'hermine et sceptre-baguette.
- [ ] **DJ / Boombox Bwed** : Casque audio, lunettes néon et platines.
- [ ] **Skater Bwed** : Casquette à l'envers, hoodie large et skateboard en tartine beurrée.
- [ ] **Pharaoh / Mummy Bwed** : Coiffe égyptienne ou bandelettes de pâte feuilletée.
- [ ] **Viking Bwed** : Casque à cornes en croissants et barbe tressée.

---

## 6. Kit de Bâtiments 3D `.glb` (« Bwedville Toy-Diorama Kit »)

Pour que le plateau de **Crumb Run** et le futur **Bwed Village 3D** aient exactement le même niveau de finition que les 17 pions `.glb`, il faut remplacer les primitives géométriques Three.js par **7 à 8 vrais bâtiments `.glb`** générés avec le même pipeline (**Gemini Image sur fond noir → Meshy / Tripo → `.glb`**).

### Direction Artistique (« Chibi Bakery Vinyl-Toy / PopMart / Link's Awakening »)
1. **Architecture « Comestible & Potelée » (Chunky Food-Architecture)** :
   - Les murs ont la texture de **croûte dorée, pâte sablée, gaufre, brique de sucre roux ou céramique vernie**.
   - Les toits sont des **chapeaux de brioche vernie, croissants géants, glaçage chocolat fondu ou stores parisiens bien rebondis** (zéro angle pointu/low-poly).
2. **Proportions « Toy-Box / Monopoly 3D »** :
   - Format compact, légèrement trapu (plus large en haut ou bien arrondi), posé sur un petit **socle de pavés/biscuit** intégré, avec une **devanture ultra lisible** (grande porte + vitrine chaude + enseigne sculptée sur le toit).
3. **Double Réutilisation** :
   - Chaque bâtiment `.glb` déposé dans `assets/buildings/` servira **à la fois** sur les cases du plateau de *Crumb Run* et comme bâtiment visitable dans le *Bwed Village 3D*.

### Les 7 Prompts Complets « Tout-en-Un » (prêts à copier-coller dans Gemini)

- [ ] **1. `grand-oven-hq.glb` (Case START — Le Grand Four / Mairie Boulangerie)**
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a vintage kitchen appliance. The building is a chubby, puffed bakery town hall hybrid of a retro red-brick bread oven and a plump golden toasted brioche loaf, with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: matte baked bread-crust roof, brown-sugar brick walls, shiny brass oven dials on the facade, and a warm glowing fireplace oven archway as the front door. On the roof sits a giant sculpted golden bread loaf crown crest and a stubby brick chimney with a solid, smooth, puffy white clay steam cloud attached to it. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **2. `patisserie-coin.glb` (Cases +2c #1 — La Pâtisserie Croissant)** *(Intégré en `.glb` dans `assets/buildings/`)*
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a cozy Parisian bakery box. The building is a chubby, puffed patisserie shopfront with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: walls made of matte shortbread biscuit and warm cream stucco, warm honey-wood trim, a thick puffy red-and-cream striped awning over the entrance, and a warm glowing amber display window showing tiny round pastries inside. On top of the roof sits a giant, glossy, buttery golden croissant next to a thick embossed golden coin symbol. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **3. `bwedbank-vault.glb` (Cases +2c #2 — La Banque aux Miettes / BwedBank)**
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a cartoon butter-dish bank vault. The building is a chubby, puffed miniature bank with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: walls made of golden waffle-biscuit stone and glazed ceramic, two chubby rounded brioche columns flanking a big circular shiny brass vault door on the front facade, and a roof shaped like a thick golden butter ingot. On top of the roof sits a giant melting pat of glossy yellow butter with a chunky embossed gold coin symbol pressed into it. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **4. `galeries-boutique.glb` (Cases SHOP — La Grande Boutique Power-Ups)** *(Intégré en `.glb` dans `assets/buildings/`)*
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a luxury pastry gift-box store. The building is a chubby, puffed two-story boutique with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: pastel turquoise glazed-icing walls, warm toasted-crust and shiny gold trim, a puffy striped bistro canopy, and two warm glowing arched display windows. The roof is shaped like a plump cupcake brioche dome covered in glossy icing and wrapped with a thick sculpted golden ribbon bow on top. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **5. `arcade-duel.glb` (Cases DUEL — La Borne-Bâtiment BwedWare Arcade)** *(Converti d'FBX & intégré en `.glb` dans `assets/buildings/`)*
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a retro kitchen appliance and Japanese arcade cabinet. The building is a chubby, puffed hybrid of a vintage glossy red-and-chrome toaster and a miniature arcade hall, with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: glossy red enamel body, toasted-bread side panels, chrome trim, a warm glowing yellow CRT arcade screen above the front door, and two bread-slice slots on top. Planted directly on the roof are a giant chunky red ball-top arcade joystick and two oversized glossy candy-like arcade buttons. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **6. `portal-observatory.glb` (Cases EVENT — La Tour Mystère / Mage Boulanger)** *(Intégré en `.glb` dans `assets/buildings/`)*
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a mystic wizard bakery tower. The building is a chubby, round, slightly crooked tower with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: walls made of golden cookie-dough stone and warm toasted crust, a crooked roof shaped like a puffy purple-glazed pastry wizard hat decorated with sculpted golden star cookies, and a round arched doorway filled with a solid glowing purple magic swirl relief. Perched directly on the tip of the roof is a chunky, glossy purple-and-gold mystery cube. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **7. `inferno-furnace.glb` (Cases RISK — La Forge Poêle en Fonte)**
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a heavy kitchen cast-iron skillet and industrial smoker oven. The building is a chubby, puffed forge built inside an upside-down matte black cast-iron frying pan and dark copper toaster, with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: dark seasoned cast-iron walls, shiny copper rivets, charred toast-crust trim, a glowing bright-orange fiery furnace mouth as the front entrance, and two stubby iron smokestacks. Sitting directly on top of the roof is a giant, chunky, glossy cartoon orange-and-yellow flame sculpture. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

### Vague 2 — Objets du Quotidien Revisités en Bâtiments & Places de Village (`08` à `15`)

- [ ] **8. `espresso-fountain-plaza.glb` (Grand-Place de la Cafetière Moka)** — Image : [`08-espresso-fountain-plaza.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/08-espresso-fountain-plaza.jpg)
  ```text
  A cute 3D stylized miniature village plaza fountain in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday vintage copper and chrome Italian Moka espresso maker as a monumental town square fountain. Chubby, puffed proportions with zero sharp edges. At the center of a round biscuit-and-cobblestone plaza stands a chunky retro espresso pot tower pouring thick, glossy melted dark chocolate into a wide porcelain teacup basin, surrounded by four tiny sugar-cube benches and warm glowing streetlamp lanterns shaped like golden teaspoons. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **9. `milk-carton-apartments.glb` (Résidence Brique de Lait & Cookies)** *(Intégré en `.glb` dans `assets/buildings/`)* — Image : [`09-milk-carton-apartments.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/09-milk-carton-apartments.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday pastel-blue and cream milk carton as a cozy two-story village apartment house. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: matte coated milk-carton walls with pastel blue and cream bands, a gable roof topped with a chunky screw-cap chimney, warm glowing round porthole windows with wafer-cookie flower boxes, and a chocolate-chip cookie arch front door. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **10. `butter-dish-station.glb` (Gare du Beurrier Express)** — Image : [`10-butter-dish-train-station.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/10-butter-dish-train-station.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday porcelain and brass dome butter dish as a charming vintage village train station. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: a glossy cream porcelain station body, a curved shiny golden brass butter-cover roof with a round handle finial on top, a big round golden biscuit station clock on the front (with simple clock hands and no numbers), warm glowing ticket windows, and a toasted brioche platform awning. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **11. `jam-jar-apothecary.glb` (Apothicaire Pot de Confiture)** *(Converti d'FBX & intégré en `.glb` dans `assets/buildings/`)* — Image : [`11-jam-jar-apothecary.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/11-jam-jar-apothecary.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday glass jam jar with a checkered cloth lid as a cozy village apothecary and jam shop. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: thick translucent glowing ruby-strawberry glass walls framed by warm toasted-bread pillars, a rounded wooden cottage door, and a puffy red-and-white gingham fabric lid roof tied with a thick twine rope and topped with a giant glossy red strawberry sculpture. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **12. `cookie-tin-music-club.glb` (Club Vinyle Boîte à Biscuits Danois)** — Image : [`12-cookie-tin-music-club.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/12-cookie-tin-music-club.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday round royal-blue metallic Danish butter-cookie tin and vintage vinyl record player as a village music club and cinema. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: glossy royal-blue and gold embossed cookie-tin cylindrical body, warm glowing marquee lights around a red velvet curtain entrance, and a roof shaped like a shiny black-and-gold vinyl record with a chunky retro tonearm and a giant golden brioche headphone sculpture on top. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **13. `teacup-gazebo-park.glb` (Kiosque de Parc Tasse de Thé & Macarons)** *(Intégré en `.glb` dans `assets/buildings/`)* — Image : [`13-teacup-gazebo-park.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/13-teacup-gazebo-park.jpg)
  ```text
  A cute 3D stylized miniature village park gazebo in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday upside-down porcelain teacup and pastel macarons as a charming village bandstand pavilion. Chubby, puffed proportions with zero sharp edges. Four chunky rolled-wafer cinnamon stick columns support a dome roof made of an inverted cream-and-gold porcelain teacup with its curved handle on the side, topped with a stack of two plump pastel pink and pistachio macarons. On the small rounded cobblestone plaza base sit two tiny brioche bushes and a warm glowing lantern. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **14. `pepper-mill-windmill.glb` (Moulin à Vent Moulin à Poivre & Croissants)** — Image : [`14-pepper-mill-windmill.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/14-pepper-mill-windmill.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday turned-wood pepper mill as a charming village windmill tower. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: warm honey-toned turned wood and toasted bread-crust tower body, a shiny brass grinding knob on top of the domed roof, warm glowing round bakery windows, and four giant chunky golden-baked croissants arranged in a cross as the windmill blades on the front facade. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **15. `honey-pot-tavern.glb` (Taverne du Pot de Miel & Gaufre)** — Image : [`15-honey-pot-tavern.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/15-honey-pot-tavern.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday ceramic honey pot and Belgian waffle as a cozy village tavern. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: plump golden-yellow glazed ceramic honey-pot walls, a thick crispy Belgian waffle roof with glossy amber honey dripping over the eaves, a warm glowing arched tavern doorway flanked by two tiny wooden syrup barrels, and a giant wooden honey dipper wand planted on the roof. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

### Vague 3 — Nouveaux Objets du Quotidien pour BwedWorld (`16` à `21`)

- [x] **16. `egg-carton-market.glb` (Halle de Marché Boîte à Œufs & Brioches)** — Image : [`16-egg-carton-market.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/16-egg-carton-market.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday pastel molded-pulp egg carton as a charming covered village market hall. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: bumpy scalloped egg-carton roof in soft cream and pistachio, warm toasted-bread support pillars, wooden market counters overflowing with tiny glossy golden brioches and jam jars, and a giant golden cracked eggshell emblem on the roof. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **17. `sugar-shaker-lighthouse.glb` (Phare Saupoudreuse à Sucre Glace)** — Image : [`17-sugar-shaker-lighthouse.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/17-sugar-shaker-lighthouse.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday fluted glass powdered-sugar shaker with a perforated chrome dome top as a cozy coastal village lighthouse. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: thick fluted glass tower body glowing warmly from within, red-and-cream candy-stripe bands, a shiny perforated silver shaker dome roof, and a little wooden bakery keeper cottage attached at the base. Mounted on a small, thick, rounded biscuit-and-cobblestone base dusted with white icing sugar. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **18. `waffle-iron-dojo.glb` (Dojo / Arène Gaufrier en Fonte)** — Image : [`18-waffle-iron-dojo.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/18-waffle-iron-dojo.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday cast-iron waffle maker as a village martial-arts dojo and training gym. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: heavy matte cast-iron base, a slightly raised gridded waffle-iron roof revealing a glowing golden crispy waffle interior, a traditional wooden dojo entrance with red fabric curtains, and a giant glossy golden pretzel dumbbell sculpture on the roof. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **19. `matchbox-kiosk.glb` (Kiosque de Rue Boîte d'Allumettes Rétro)** — Image : [`19-matchbox-kiosk.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/19-matchbox-kiosk.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday vintage sliding matchbox as a cozy street-corner newsstand and snack kiosk. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: warm cream-and-terracotta cardboard box body with a dark brown striker-strip side panel, the inner drawer pulled out slightly to form a wooden counter canopy, warm glowing interior window, and two giant crossed wooden matchsticks with glossy red tips on the roof. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **20. `teapot-bathhouse.glb` (Onsen / Salon de Détente Théière en Fonte & Camomille)** — Image : [`20-teapot-bathhouse.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/20-teapot-bathhouse.jpg)
  ```text
  A cute 3D stylized miniature toy building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an everyday round cast-iron Japanese tetsubin teapot as a cozy village spa and tea bathhouse. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: textured dark-jade cast-iron teapot body, a curved black iron handle arching over a wooden lid roof with a solid puffy white steam cloud, a warm glowing wooden bathhouse entrance, and a small porcelain teacup hot-tub on the front terrace. Mounted on a small, thick, rounded biscuit-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **21. `rolling-pin-bridge.glb` (Pont du Village Rouleau à Pâtisserie & Biscuit)** — Image : [`21-rolling-pin-bridge.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/21-rolling-pin-bridge.jpg)
  ```text
  A cute 3D stylized miniature village bridge in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining everyday wooden rolling pins and wafer cookies as an arched cobblestone footbridge over a melted chocolate stream. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: an arched bridge deck made of golden shortbread biscuit blocks, two chunky turned-wood rolling pins with red handles forming the side railings, and two warm glowing butter-drop lanterns at the ends. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 4 — Kit de Worldbuilding : Sols 3D, Pavés, Mobilier Urbain & Textures Seamless (`22` à `32`)

#### A. Dalles de Sol, Trottoirs & Pavés 3D Modulaires (à convertir en `.glb`)

- [x] **22. `tile-sidewalk-brioche.glb` (Dalle de Trottoir / Case de Jeu en Brioche & Biscuit)** — Image : [`22-tile-sidewalk-brioche.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/22-tile-sidewalk-brioche.jpg)
  ```text
  A cute 3D stylized miniature square board-game sidewalk tile in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A thick square foundation made of interlocking golden shortbread biscuit cobblestones, topped with a soft, plump cream-colored brioche cushion pad framed by a crispy wafer curb and four shiny golden chocolate-drop corner studs. Isometric 3/4 front-top view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **23. `road-cobble-biscuit.glb` (Portion de Rue Pavée en Biscuits, Croûte & Sucre Roux)** — Image : [`23-road-cobble-biscuit.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/23-road-cobble-biscuit.jpg)
  ```text
  A cute 3D stylized miniature modular street road slab in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A rectangular cobblestone street section made of rounded golden baked-crust stones, mini butter cookies, and brown-sugar mortar joints, bordered on both sides by thick toasted-wafer sidewalk curbs. Isometric 3/4 front-top view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **24. `plaza-waffle-medallion.glb` (Dalle de Grand-Place Ronde en Gaufre & Rosace d'Or)** — Image : [`24-plaza-waffle-medallion.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/24-plaza-waffle-medallion.jpg)
  ```text
  A cute 3D stylized miniature circular town-plaza ground medallion in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A thick round platform crafted from a golden caramelized Belgian waffle ring and smooth shortbread stone, featuring an embossed shiny brass croissant-star compass rose inlaid at the center. Isometric 3/4 front-top view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

#### B. Mobilier Urbain, Végétation & Clôtures BwedWorld (en `.glb`)

- [x] **25. `lamp-teaspoon-lantern.glb` (Lampadaire Cuillère Dorée & Lanterne Pot de Miel)** — Image : [`25-lamp-teaspoon-lantern.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/25-lamp-teaspoon-lantern.jpg)
  ```text
  A cute 3D stylized miniature village streetlamp in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a curved golden brass teaspoon and a glowing honey jar as a cozy lamppost. Chubby, puffed proportions with zero sharp edges. A thick biscuit-and-iron base supports a sturdy curved brass spoon post holding a warm glowing amber honey-pot lantern at its tip. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **26. `bench-chocolate-wafer.glb` (Banc de Parc en Barre de Chocolat & Bretzels)** — Images : [`26-bench-chocolate-wafer.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/26-bench-chocolate-wafer.jpg) / [`26b-bench-chocolate-wafer-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/26b-bench-chocolate-wafer-v2.jpg)
  ```text
  A cute 3D stylized miniature park bench in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining chunky milk-chocolate bars, crispy wafer sticks, and salted pretzels as a cozy street bench. Chubby, puffed proportions with zero sharp edges. Glossy molded dark-chocolate seat and backrest slabs, golden pretzel-loop armrests, resting on a small rounded biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **27. `tree-brioche-pistachio.glb` (Arbre Topiaire Choux à la Crème & Pistache)** — Image : [`27-tree-brioche-pistachio.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/27-tree-brioche-pistachio.jpg)
  ```text
  A cute 3D stylized miniature village tree in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a cinnamon-roll trunk and pistachio cream puffs as a lush topiary tree. Chubby, puffed proportions with zero sharp edges. Planted in a chunky honey-wood barrel with brass rings, a twisted cinnamon-stick trunk supports a round, billowy canopy of matte-and-glossy pistachio green glazed choux puffs sprinkled with crushed hazelnuts. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **28. `fence-pretzel-hedge.glb` (Muret & Haie en Briques de Sucre, Bretzels & Matcha)** — Images : [`28-fence-pretzel-hedge.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/28-fence-pretzel-hedge.jpg) / [`28b-fence-pretzel-hedge-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/28b-fence-pretzel-hedge-v2.jpg)
  ```text
  A cute 3D stylized miniature modular village fence and hedge in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A low wall of warm brown-sugar bricks topped with a plump, rounded matcha-green sponge-cake hedge and two interlocking glossy golden pretzel railings. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

#### C. Textures Seamless 2D (Vue 90° Top-Down à plat pour placage Three.js `RepeatWrapping`)

- [x] **29. `tex-cobble-biscuit.jpg` (Texture Seamless : Pavés de Biscuits Sablés & Croûte Dorée)** — Images : [`29-tex-cobble-biscuit-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/29-tex-cobble-biscuit-hd.jpg) / [`29-tex-cobble-biscuit.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/29-tex-cobble-biscuit.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D bakery village cobblestones, in the style of Zelda Link's Awakening Switch and PopMart vinyl toys. Rounded golden shortbread biscuit stones, warm toasted bread-crust pebbles, and dark cocoa-sugar mortar joints, soft ambient occlusion, warm matte tactile finish, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **30. `tex-brioche-crumb.jpg` (Texture Seamless : Dalles de Trottoir en Mie de Brioche & Gaufrette)** — Image : [`30-tex-brioche-crumb.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/30-tex-brioche-crumb.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D bakery sidewalk tiles, in the style of Zelda Link's Awakening Switch. Soft cream-colored spongy brioche crumb squares framed by golden crispy wafer borders, subtle air pockets and warm golden-brown baked edges, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **31. `tex-waffle-caramel.jpg` (Texture Seamless : Sol de Grand-Place en Gaufre Dorée)** — Images : [`31-tex-waffle-caramel-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/31-tex-waffle-caramel-hd.jpg) / [`31-tex-waffle-caramel.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/31-tex-waffle-caramel.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of a stylized 3D crispy golden Belgian waffle plaza floor, in the style of Zelda Link's Awakening Switch. Deep rounded waffle grid pockets with warm caramelized golden crust and subtle glossy honey glaze in the recesses, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **32. `tex-melted-choco.jpg` (Texture Seamless : Rivière de Chocolat Chaud & Tourbillons Crème)** — Images : [`32-tex-melted-choco-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/32-tex-melted-choco-hd.jpg) / [`32-tex-melted-choco.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/32-tex-melted-choco.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D melted dark chocolate and warm espresso swirls, in the style of Zelda Link's Awakening Switch. Smooth, thick, glossy hazelnut-chocolate waves with creamy latte-art ribbons, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

---

### Vague 5 — Véhicules, Transports & Montures Urbaines BwedWorld (`33` à `38`)

Ces assets permettent d'animer le boulevard de **Crumb Run**, la **Gare du Beurrier Express (`#10`)**, les douves de chocolat chaud et le ciel du **Bwed Village 3D**.

- [x] **33. `train-eclair-locomotive.glb` (Locomotive « Beurrier Express » Éclair au Chocolat & Cuivre)** — Image : [`33-train-eclair-locomotive.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/33-train-eclair-locomotive.jpg)
  ```text
  A cute 3D stylized miniature toy steam locomotive in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining a plump chocolate-glazed pastry eclair with a vintage brass espresso boiler. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: golden choux-pastry train body topped with glossy dark chocolate icing, a shiny copper front boiler plate, round shortbread-cookie wheels with brass rims, a warm glowing amber cab window, and a stubby brass smokestack puffing a solid smooth white meringue cloud. Mounted on a short biscuit-and-brass rail track base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **34. `tramway-toast-rack.glb` (Tramway Urbain Porte-Toast Chromé & Brioche Dorée)** — Image : [`34-tramway-toast-rack.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/34-tramway-toast-rack.jpg)
  ```text
  A cute 3D stylized miniature village streetcar tram in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage chrome breakfast toast-rack and two thick golden brioche slices as a cozy city trolley. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: a plump toasted-brioche tram cabin held inside shiny curved chrome toast-rack arches, warm glowing rounded passenger windows, a butter-pat headlight on the front, and a tiny kitchen-whisk pantograph on the roof. Mounted on a small rounded cobblestone-and-rail base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **35. `delivery-scooter-butter.glb` (Scooter de Livraison Beurrier & Guidon Croissant)** — Image : [`35-delivery-scooter-butter.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/35-delivery-scooter-butter.jpg)
  ```text
  A cute 3D stylized miniature delivery moped scooter in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a glossy cream porcelain butter dish and a golden croissant as a retro Italian delivery scooter. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: glossy butter-cream ceramic scooter body, a plump dark-chocolate leather seat, a curved golden croissant handlebar with a glowing honey-drop headlight, thick cookie tires, and a tiny red toaster delivery box mounted on the back rack. Mounted on a small rounded biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **36. `airship-souffle-balloon.glb` (Montgolfière Brioche Mousseline & Nacelle Moule à Cupcake)** — Image : [`36-airship-souffle-balloon.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/36-airship-souffle-balloon.jpg)
  ```text
  A cute 3D stylized miniature hot-air balloon airship in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a giant fluted golden brioche-a-tete and a copper muffin tin as a whimsical sky vessel. Chubby, puffed proportions with zero sharp edges. A huge plump golden-baked brioche balloon dome with glossy sugar-glaze stripes, connected by thick sturdy pretzel-twist struts (no thin wires) directly to a cozy copper cupcake-mold gondola with a warm glowing caramel burner flame inside. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **37. `boat-tartlet-gondola.glb` (Gondole des Douves en Barquette Sablée & Guimauve)** — Image : [`37-boat-tartlet-gondola.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/37-boat-tartlet-gondola.jpg)
  ```text
  A cute 3D stylized miniature canal gondola boat in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a fluted golden shortbread tartlet shell as a cozy boat floating on melted chocolate. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: crispy fluted butter-tartlet hull, plump toasted-marshmallow passenger cushions inside, a wooden honey-dipper oar attached to the side, and a warm glowing strawberry-jam lantern at the bow, resting on a glossy dark-chocolate wave base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **38. `cart-popcorn-roaster.glb` (Chariot Ambulant Brioches Grillées & Tambour en Cuivre)** — Image : [`38-cart-popcorn-roaster.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/38-cart-popcorn-roaster.jpg)
  ```text
  A cute 3D stylized miniature street-vendor cart in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage brass chestnut roaster and a glass pastry dome as a wheeled bakery cart. Chubby, puffed proportions with zero sharp edges. Warm honey-wood cart body with two big wafer-cookie spoked wheels, a glowing orange charcoal brazier, a shiny copper roasting drum, and a puffy red-and-cream striped canopy on top. Mounted on a small rounded biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 6 — Objets de Gameplay, Collectibles, Coffres & Power-Ups (`39` à `46`)

Ces assets remplacent les objets d'interface/plateau par de vraies figurines 3D « PopMart » à collectionner ou ramasser sur le plateau de **Crumb Run**.

- [x] **39. `trophy-golden-crumb.glb` (La Grande Miette d'Or — Trophée Suprême sur Coussin Royal)** — Image : [`39-trophy-golden-crumb.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/39-trophy-golden-crumb.jpg)
  ```text
  A cute 3D stylized miniature grand trophy collectible in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A thick, radiant solid-gold toasted bread slice wearing a tiny jeweled butter-crown, resting on a plump royal-red velvet brioche cushion atop a fluted shortbread-and-brass pedestal. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **40. `chest-lunchbox-treasure.glb` (Coffre au Trésor « Boîte à Goûter Rétro » & Pièces d'Or)** — Image : [`40-chest-lunchbox-treasure.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/40-chest-lunchbox-treasure.jpg)
  ```text
  A cute 3D stylized miniature treasure chest in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage domed metal lunchbox and a waffle vault as a loot chest. Chubby, puffed proportions with zero sharp edges. Glossy red-and-cream enameled metal lunchbox body with chunky brass clasps, slightly propped open to reveal a solid mound of glowing golden butter-coins and sugar gems tucked inside, resting on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **41. `dice-sugar-brass.glb` (Le Dé Officiel Bwed : Cube de Sucre Doré & Coins en Laiton)** — Image : [`41-dice-sugar-brass.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/41-dice-sugar-brass.jpg)
  ```text
  A cute 3D stylized miniature board-game die in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a chubby caramelized brown-sugar cube reinforced with shiny golden brass corner bumpers. Soft rounded edges and plump toy proportions. The pips on the three visible faces are deeply embossed glossy dark-chocolate drops and a golden bread-slice crest on the top face. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **42. `coin-butter-medallion.glb` (Jeton BwedCoin en Chocolat Doré & Empreinte Tartine)** — Image : [`42-coin-butter-medallion.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/42-coin-butter-medallion.jpg)
  ```text
  A cute 3D stylized miniature game coin token in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, extra-thick rounded medallion crafted from shiny gold-foil wrapped chocolate with a scalloped butter-cookie rim and a chunky embossed bread-slice icon in the center, standing upright on a small melted-butter pedestal. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **43. `item-espresso-turbo.glb` (Objet Boutique : « Double Espresso Turbo » Ailé)** — Image : [`43-item-espresso-turbo.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/43-item-espresso-turbo.jpg)
  ```text
  A cute 3D stylized miniature power-up item in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A chunky white-and-gold espresso demitasse cup overflowing with glossy crema and a solid swirl of golden energy steam, flanked by two cute chubby golden croissant wings attached to the sides of the cup on a saucer base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **44. `item-oven-mitt-shield.glb` (Objet Boutique : « Bouclier Gant de Four » Matelassé)** — Image : [`44-item-oven-mitt-shield.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/44-item-oven-mitt-shield.jpg)
  ```text
  A cute 3D stylized miniature defensive power-up item in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining a puffy red-and-white gingham quilted oven mitt with a shiny brass heraldic knight shield. Chubby, puffed proportions with zero sharp edges. Soft quilted fabric texture, a thick golden bread-crest badge riveted to the palm, mounted upright on a small toasted-crust base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **45. `trap-burnt-toaster.glb` (Piège de Case : « Trappe Grille-Pain Éjecteur »)** — Image : [`45-trap-burnt-toaster.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/45-trap-burnt-toaster.jpg)
  ```text
  A cute 3D stylized miniature board-game floor trap in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A heavy cast-iron and copper spring-loaded toaster pad embedded in a round biscuit cobblestone tile, with glowing orange heating coils, a chunky red trigger lever on the side, and hazard stripes painted in yellow butter and dark chocolate. Isometric 3/4 front-top view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **46. `portal-cookbook-arch.glb` (Portail Magique : « Arche du Grand Livre de Recettes »)** — Image : [`46-portal-cookbook-arch.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/46-portal-cookbook-arch.jpg)
  ```text
  A cute 3D stylized miniature magical archway portal in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a giant thick leather-bound bakery recipe book standing upright as a mystic gateway. Chubby, puffed proportions with zero sharp edges. Warm toasted-leather cover with brass clasps, thick puff-pastry pages, and a solid glowing purple-and-gold magical icing swirl filling the archway doorway, mounted on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 7 — Props de Quartiers, Mobilier de Rue & Monuments (`47` à `54`)

Pour habiller les trottoirs, les carrefours et les places du village avec des clins d'œil visuels constants à l'univers culinaire/quotidien de **Bwed**.

- [x] **47. `prop-mailbox-breadbox.glb` (Boîte aux Lettres « Boîte à Pain Émaillée »)** — Image : [`47-prop-mailbox-breadbox.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/47-prop-mailbox-breadbox.jpg)
  ```text
  A cute 3D stylized miniature village mailbox in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage roll-top enameled breadbox on a wooden post as a cozy street postbox. Chubby, puffed proportions with zero sharp edges. Glossy cherry-red and cream enamel body, a brass letter slot swallowing a tiny wafer-cookie envelope, and a raised golden croissant flag on the side, mounted on a small cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **48. `prop-hydrant-syrup.glb` (Borne de Rue « Distributeur de Sirop d'Érable & Laiton »)** — Image : [`48-prop-hydrant-syrup.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/48-prop-hydrant-syrup.jpg)
  ```text
  A cute 3D stylized miniature street fire hydrant in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a chubby glass maple-syrup jug and brass kitchen faucets as a cute corner hydrant. Chubby, puffed proportions with zero sharp edges. Glossy amber-and-red body, chunky butter-cookie valve wheels on the sides, and a domed brass cap on top, resting on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **49. `prop-phonebooth-jamjar.glb` (Cabine Téléphonique « Bocal de Fraise & Couronne Brioche »)** — Image : [`49-prop-phonebooth-jamjar.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/49-prop-phonebooth-jamjar.jpg)
  ```text
  A cute 3D stylized miniature street telephone booth in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining a classic red British phone box with a square strawberry-jam jar and toasted brioche trim. Chubby, puffed proportions with zero sharp edges. Glossy red timber-and-crust frame, warm glowing amber glass panels, and a domed golden brioche crown roof, mounted on a small cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **50. `prop-signpost-spatula.glb` (Panneau Directionnel de Carrefour « Fouet & Spatules »)**
  ```text
  A cute 3D stylized miniature village crossroads signpost in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A sturdy turned-wood post topped with a brass whisk finial, with three chunky arrow-shaped wooden spatulas and shortbread biscuit plaques pointing in different directions (decorated with simple embossed croissant, coin, and star icons, strictly no text), planted in a small cobblestone mound with tiny sugar mushrooms. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **51. `prop-barrel-flour-sack.glb` (Cluster Décor : Sac de Farine Douillet, Tonneau de Miel & Beurre)** — Image : [`51-prop-barrel-flour-sack.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/51-prop-barrel-flour-sack.jpg)
  ```text
  A cute 3D stylized miniature bakery street-corner prop cluster in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A plump cream-burlap flour sack tied with thick twine, leaning against a chubby honey-wood barrel with brass hoops and a wooden crate stacked with glossy golden butter bricks, all resting together on a single compact biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **52. `prop-fountain-butter-churn.glb` (Puits du Village « Baratte à Beurre & Cloche Cuivrée »)** — Image : [`52-prop-fountain-butter-churn.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/52-prop-fountain-butter-churn.jpg)
  ```text
  A cute 3D stylized miniature village wishing well in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a traditional wooden butter churn and shortbread stones as a cozy town well. Chubby, puffed proportions with zero sharp edges. Round golden biscuit-stone well wall filled with glossy melted honey, two thick cinnamon-roll support posts, a pitched waffle shingle roof, and a tiny copper milk-can bucket resting on the rim. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **53. `prop-statue-golden-baker.glb` (Monument « Statue Dorée du Fondateur Bwed »)** — Image : [`53-prop-statue-golden-baker.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/53-prop-statue-golden-baker.jpg)
  ```text
  A cute 3D stylized miniature town-square monument statue in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. On a tiered shortbread-and-marble pedestal stands a shiny golden bronze sculpture of a cute chibi bread-loaf knight wearing a puffy chef hat and holding a giant spatula like a royal sword. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **54. `prop-picnic-gingham-table.glb` (Table de Bistro / Pique-Nique Biscuit, Vichy & Parasol Macaron)** — Image : [`54-prop-picnic-gingham-table.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/54-prop-picnic-gingham-table.jpg)
  ```text
  A cute 3D stylized miniature outdoor bistro table set in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A round table draped in a thick puffy red-and-white gingham cloth with a teapot on top, flanked by two chubby sugar-cube stools and shaded by a giant pastel-pink macaron umbrella on a thick brass pole, all merged onto a compact cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 8 — Textures Seamless 2D Additionnelles : Biomes, Parcs, Forge & Toitures (`55` à `60`)

Vue **90° Top-Down orthographique sans couture (`RepeatWrapping`)** pour différencier visuellement chaque quartier de Bwedville.

- [x] **55. `tex-matcha-moss.jpg` (Texture Seamless : Pelouse de Parc en Génoise Matcha & Pistache)** — Images : [`55-tex-matcha-moss-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/55-tex-matcha-moss-hd.jpg) / [`55-tex-matcha-moss.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/55-tex-matcha-moss.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D bakery village grass and moss, in the style of Zelda Link's Awakening Switch and PopMart vinyl toys. Soft, plush matcha-green sponge-cake turf dotted with tiny crushed pistachio crumbs and miniature white sugar-drop clover buds, warm tactile matte finish, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **56. `tex-brown-sugar-sand.jpg` (Texture Seamless : Chemin de Terre & Plage en Cassonade Ambrée)** — Images : [`56-tex-brown-sugar-sand-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/56-tex-brown-sugar-sand-hd.jpg) / [`56-tex-brown-sugar-sand.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/56-tex-brown-sugar-sand.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D golden brown-sugar sand and crumbled biscuit earth, in the style of Zelda Link's Awakening Switch. Soft wavy ripples of warm caramelized cane sugar crystals, tiny shortbread pebbles, and subtle amber sparkle, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **57. `tex-cast-iron-lava.jpg` (Texture Seamless : Sol de la Forge en Fonte Rivetée & Caramel Brûlant)** — Images : [`57-tex-cast-iron-lava-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/57-tex-cast-iron-lava-hd.jpg) / [`57-tex-cast-iron-lava.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/57-tex-cast-iron-lava.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D dark seasoned cast-iron floor plates with glowing molten caramel cracks, in the style of Zelda Link's Awakening Switch. Rounded matte-black skillet metal tiles with copper corner rivets and warm glowing orange-amber toasted fissures between the plates, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **58. `tex-pastel-macaron-tiles.jpg` (Texture Seamless : Parvis Royal en Mosaïque de Glaçage Pastel & Or)** — Images : [`58-tex-pastel-macaron-tiles-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/58-tex-pastel-macaron-tiles-hd.jpg) / [`58-tex-pastel-macaron-tiles.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/58-tex-pastel-macaron-tiles.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D luxury patisserie floor tiles, in the style of Zelda Link's Awakening Switch. Smooth rounded diamond tiles made of glossy pastel turquoise, cream, and rose sugar-glaze separated by thin shiny golden brass grout lines, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **59. `tex-flaky-croissant-roof.jpg` (Texture Seamless : Tuiles de Toiture en Pâte Feuilletée Beurrée)** — Images : [`59-tex-flaky-croissant-roof-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/59-tex-flaky-croissant-roof-hd.jpg) / [`59-tex-flaky-croissant-roof.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/59-tex-flaky-croissant-roof.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D overlapping flaky golden croissant pastry roof shingles, in the style of Zelda Link's Awakening Switch. Warm layered buttery baked-crust scales with glossy egg-wash highlights and soft ambient occlusion between rows, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [x] **60. `tex-wood-cutting-board.jpg` (Texture Seamless : Parquet & Ponton en Planche à Découper de Hêtre)** — Images : [`60-tex-wood-cutting-board-hd.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/60-tex-wood-cutting-board-hd.jpg) / [`60-tex-wood-cutting-board.png`](../06_BRAND_AND_HUB/03_HUB_SITE/assets/textures/60-tex-wood-cutting-board.png)
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D warm butcher-block wood planks, in the style of Zelda Link's Awakening Switch. Smooth rounded honey-oak and beechwood cutting-board planks with soft wood-grain swirls, brass dowel pins, and a light dusting of white bakery flour in the grooves, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

---

### Vague 9 — Grands Monuments, Merveilles & Lieux Iconiques BwedWorld (`61` à `68`)

Ces monuments servent de pièces maîtresses pour les quartiers du **Bwed Village 3D** ou les plateaux spéciaux de **Crumb Run**.

- [x] **61. `monument-colosseum-bundt.glb` (Le Colisée « Moule à Kouglof & Arches Biscuits »)** — Image : [`61-monument-colosseum-bundt.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/61-monument-colosseum-bundt.jpg)
  ```text
  A cute 3D stylized miniature monumental amphitheater in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a giant fluted copper Bundt cake pan and golden sponge cake as the Roman Colosseum. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: tiered circular walls of golden baked kouglof cake and shiny copper ribs, rounded archway windows framed by ladyfinger biscuits, and thick white royal-icing snow drizzled along the upper rim. Mounted on a round biscuit cobblestone plaza base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **62. `monument-clocktower-grater.glb` (Le Beffroi « Râpe à Fromage Cuivrée & Horloge Sablée »)** — Image : [`62-monument-clocktower-grater.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/62-monument-clocktower-grater.jpg)
  ```text
  A cute 3D stylized miniature clocktower monument in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage four-sided brass box grater and gingerbread bricks as a grand town belfry. Chubby, puffed proportions with zero sharp edges. Edible and warm tactile materials: warm gingerbread-brick lower tower, a shiny brushed-brass grater upper belfry with rounded slots, a giant glowing butter-biscuit clock face with chunky pretzel clock hands (strictly no numbers), and a domed copper roof with a ring handle finial. Mounted on a small biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **63. `monument-ferris-wheel-plate.glb` (Grande Roue « Assiette en Porcelaine & Tasses Expresso »)** — Image : [`63-monument-ferris-wheel-plate.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/63-monument-ferris-wheel-plate.jpg)
  ```text
  A cute 3D stylized miniature theme-park Ferris wheel in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vertical gold-rimmed porcelain dessert plate and six colorful espresso cups as a compact toy Ferris wheel. Chubby, puffed proportions with zero sharp edges. Two sturdy upside-down brass forks form the A-frame support pillars holding a thick scalloped porcelain wheel rim, with six chubby pastel teacup gondolas firmly attached around the wheel and a golden croissant star hub at the center. Mounted on a rounded waffle-and-cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **64. `monument-carousel-cake-stand.glb` (Manège Carrousel « Présentoir à Gâteaux & Croissants Dorés »)**
  ```text
  A cute 3D stylized miniature village carousel in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a tiered porcelain cake stand and an inverted fluted tart tin as a charming merry-go-round. Chubby, puffed proportions with zero sharp edges. Glossy cream porcelain pedestal base, a thick central cinnamon-roll column, three chubby golden croissant mounts on thick brass poles, and a puffy red-and-cream striped icing canopy topped with a golden sugar star. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **65. `monument-cathedral-organ.glb` (La Grande Cathédrale des Pâtissiers : Orgues Cannelle & Rosace Agrume)** — Image : [`65-monument-cathedral-organ.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/65-monument-cathedral-organ.jpg)
  ```text
  A cute 3D stylized miniature cathedral building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi bakery architecture with cinnamon-stick pipe organs. Chubby, puffed proportions with zero sharp edges. Warm toasted-brioche stone walls, twin stubby bell towers topped with golden chef-hat domes, vertical cinnamon-roll organ pipes on the facade, and a glowing stained-glass rose window shaped like a translucent candied orange slice. Mounted on a rounded biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **66. `monument-harbor-sardine-dock.glb` (Capitainerie du Port « Boîte à Conserve Dorée à Clé »)** — Image : [`66-monument-harbor-sardine-dock.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/66-monument-harbor-sardine-dock.jpg)
  ```text
  A cute 3D stylized miniature harbor-master building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage golden roll-key tin can and salted-butter bricks as a cozy port office. Chubby, puffed proportions with zero sharp edges. Brushed golden tin body with its lid rolled back around a chunky brass winding key to form a curved roof awning, warm glowing porthole windows, a pink-iced donut lifebuoy mounted on the front wall, and a wooden cutting-board pier base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **67. `monument-observatory-colander.glb` (Observatoire « Coupole Passoire en Cuivre & Lunette Gaufrette »)** — Image : [`67-monument-observatory-colander.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/67-monument-observatory-colander.jpg)
  ```text
  A cute 3D stylized miniature astronomy observatory in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an inverted hammered-copper kitchen colander and a rolled wafer tube as a stargazing dome. Chubby, puffed proportions with zero sharp edges. Round shortbread-stone tower base, a shiny copper colander dome roof with two side handles, and a chunky rolled-wafer and brass telescope barrel poking out of the dome slot. Mounted on a small biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **68. `monument-volcano-fondant.glb` (Le Mont Fondant — Volcan Moelleux au Chocolat & Lave Caramel)** — Images : [`68-monument-volcano-fondant.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/68-monument-volcano-fondant.jpg) / [`68b-monument-volcano-fondant-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/68b-monument-volcano-fondant-v2.jpg)
  ```text
  A cute 3D stylized miniature volcano landmark in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a hot molten chocolate lava cake (fondant au chocolat) as a dramatic dungeon mountain. Chubby, puffed proportions with zero sharp edges. Rich matte dark-chocolate sponge-cake slopes dusted with cocoa powder, a bubbling crater overflowing with thick glossy glowing golden caramel and melted chocolate rivers, and a cute skull-shaped toasted brioche cave entrance at the foot. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 10 — Échoppes des Métiers, Ateliers d'Artisans & Boutiques de Skins (`69` à `75`)

Chaque bâtiment correspond aux classes/métiers des **17 pions `.glb`** (Couturier, Alchimiste, Forgeron, Barbier, Érudit, Botaniste, Facteur).

- [x] **69. `shop-tailor-pincushion.glb` (Atelier du Couturier « Coussin à Épingles Tomate & Dé à Coudre »)** — Images : [`69-shop-tailor-pincushion.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/69-shop-tailor-pincushion.jpg) / [`69b-shop-tailor-pincushion-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/69b-shop-tailor-pincushion-v2.jpg)
  ```text
  A cute 3D stylized miniature tailor shop building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a classic plush red tomato pincushion and a golden brass thimble as a cozy costume boutique. Chubby, puffed proportions with zero sharp edges. Plump quilted red velvet pincushion dome body with three oversized pearl-headed pins stuck into the roof, a shiny brass thimble side-turret, warm glowing display windows, and a wooden spool-of-thread porch step on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **70. `shop-alchemist-siphon.glb` (Laboratoire de l'Alchimiste « Siphon à Café & Fioles de Sirop »)** — Image : [`70-shop-alchemist-siphon.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/70-shop-alchemist-siphon.jpg)
  ```text
  A cute 3D stylized miniature alchemist potion shop in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage glass-and-copper vacuum coffee siphon and syrup bottles as a magical brewery. Chubby, puffed proportions with zero sharp edges. Warm toasted-crust cottage base topped with a giant glowing amber-and-violet glass coffee globe held in a shiny copper frame, candy-cane copper pipes along the wall, and a bubbling sugar-pot cauldron beside the arched front door. Mounted on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **71. `shop-blacksmith-anvil-toast.glb` (Armurerie du Forgeron « Enclume en Fonte & Soufflet Gaufrier »)**
  ```text
  A cute 3D stylized miniature blacksmith armory building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining a heavy matte-black cast-iron anvil, a brick bread oven, and golden spatula-swords. Chubby, puffed proportions with zero sharp edges. Red-brick and dark cast-iron workshop with a giant anvil roof crest, a glowing orange hearth archway, a wooden barrel rack holding chunky golden spatula-swords, and a waffle-patterned bellows on the side. Mounted on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **72. `shop-barber-chantilly.glb` (Salon de Coiffure « Dôme Chantilly, Cerise & Sucre d'Orge »)** — Image : [`72-shop-barber-chantilly.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/72-shop-barber-chantilly.jpg)
  ```text
  A cute 3D stylized miniature barbershop building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a swirled whipped-cream cup and a candy-cane barber pole as a cozy avatar customization salon. Chubby, puffed proportions with zero sharp edges. Pastel mint-and-cream glazed walls, a giant puffy swirled white meringue roof topped with a glossy red maraschino cherry, a chunky red-and-white striped candy-cane pillar beside the door, and a round brass mirror window. Mounted on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **73. `shop-library-toast-tomes.glb` (Grande Bibliothèque « Miche de Pain Tranchée en Grimoires »)** — Images : [`73-shop-library-toast-tomes.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/73-shop-library-toast-tomes.jpg) / [`73b-shop-library-toast-tomes-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/73b-shop-library-toast-tomes-v2.jpg)
  ```text
  A cute 3D stylized miniature village library building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a row of thick golden toasted bread slices bound in leather and brass as a grand book-shaped hall. Chubby, puffed proportions with zero sharp edges. The building is formed by five thick upright slices of golden brioche-toast pressed together like giant ancient spellbooks with gold-foil spine bands, a pair of cute round brass spectacles mounted above the arched wooden entrance, and a warm glowing reading window. Mounted on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **74. `shop-florist-measuring-cup.glb` (Serre du Botaniste « Verre Doseur & Fleurs en Pâte d'Amande »)**
  ```text
  A cute 3D stylized miniature greenhouse florist shop in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining an inverted glass kitchen measuring pitcher and copper framing as a sunny botanical conservatory. Chubby, puffed proportions with zero sharp edges. Thick translucent warm-tinted glass dome with a curved glass handle on the side and a pouring-spout roof gable (strictly no numbers or text on the glass), filled inside and around the door with plump pastel marzipan tulips and pistachio sponge-cake bushes. Mounted on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **75. `shop-postoffice-scale.glb` (Bureau de Poste « Balance de Cuisine Rétro & Colis Briochés »)** — Image : [`75-shop-postoffice-scale.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/75-shop-postoffice-scale.jpg)
  ```text
  A cute 3D stylized miniature post-office building in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a vintage enameled kitchen weighing scale as a village mail depot. Chubby, puffed proportions with zero sharp edges. Glossy cream-and-red scale body with a big round brass dial window on the front (with a single pointer needle and strictly no numbers), topped with a wide brass weighing pan roof piled with twine-wrapped brioche parcels. Mounted on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 11 — Reliefs Naturels, Falaises, Cascades, Escalier & Pontons Modulaires (`76` à `82`)

Indispensables pour sculpter le relief autour du plateau et construire des niveaux à plusieurs étages dans le **Bwed Village 3D**.

- [x] **76. `terrain-cliff-millefeuille.glb` (Bloc de Falaise Modulaire en Pâte Feuilletée, Crème & Matcha)** — Image : [`76-terrain-cliff-millefeuille.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/76-terrain-cliff-millefeuille.jpg)
  ```text
  A cute 3D stylized miniature modular cliff rock block in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a layered French mille-feuille pastry as a steep terrain cliff. Chubby, puffed proportions with zero sharp edges. Horizontal strata of crispy golden flaky puff-pastry rock and thick vanilla-cream seams, capped on top with a plush overhang of matcha-green sponge-cake grass and tiny pistachio pebbles. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **77. `terrain-rock-sourdough-crystals.glb` (Rochers en Croûte de Pain au Levain & Cristaux de Sucre Ambré)** — Image : [`77-terrain-rock-sourdough-crystals.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/77-terrain-rock-sourdough-crystals.jpg)
  ```text
  A cute 3D stylized miniature boulder cluster in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Three rounded boulders made of flour-dusted rustic sourdough bread crust, sprouting chunky glowing translucent amber rock-candy sugar crystals from their crevices, resting on a small biscuit earth base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **78. `terrain-waterfall-honey-cliff.glb` (Cascade de Miel Doré sur Falaise de Gaufre & Bassin)** — Image : [`78-terrain-waterfall-honey-cliff.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/78-terrain-waterfall-honey-cliff.jpg)
  ```text
  A cute 3D stylized miniature waterfall terrain piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A stacked Belgian-waffle and biscuit cliff face with a thick, smooth, glossy ribbon of golden amber honey cascading down into a round shortbread basin surrounded by puffy white cream foam dollops. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **79. `terrain-stairs-wafer-ramp.glb` (Grand Escalier de Village en Gaufrettes & Rampes Cannelle)** — Image : [`79-terrain-stairs-wafer-ramp.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/79-terrain-stairs-wafer-ramp.jpg)
  ```text
  A cute 3D stylized miniature modular stone staircase in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Five wide, chunky steps made of layered hazelnut-wafer bars and golden shortbread stone, flanked on both sides by thick rolled cinnamon-stick handrails and brass ball posts. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **80. `terrain-pier-popsicle-dock.glb` (Ponton Portuaire en Bâtonnets de Glace & Bouchon d'Amarrage)** — Image : [`80-terrain-pier-popsicle-dock.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/80-terrain-pier-popsicle-dock.jpg)
  ```text
  A cute 3D stylized miniature wooden harbor pier in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining rounded beechwood popsicle sticks and wine corks as a cozy dock over melted chocolate water. Chubby, puffed proportions with zero sharp edges. Smooth rounded wooden planks, stubby cinnamon-log pilings, a chunky champagne-cork mooring bollard wrapped in thick twine, and a warm glowing honey-jar lantern at the end. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **81. `terrain-island-tart-cloud.glb` (Îlot Flottant « Tartelette Dorée sur Nuage de Meringue »)** — Image : [`81-terrain-island-tart-cloud.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/81-terrain-island-tart-cloud.jpg)
  ```text
  A cute 3D stylized miniature floating sky-island platform in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A thick billowy toasted-meringue cloud base supporting a round fluted butter-tartlet shell filled with lush matcha-green sponge-cake turf and a tiny golden butter-pat stepping stone. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **82. `terrain-tunnel-cannoli-arch.glb` (Entrée de Tunnel / Grotte en Cannoli Géant & Pépites)** — Image : [`82-terrain-tunnel-cannoli-arch.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/82-terrain-tunnel-cannoli-arch.jpg)
  ```text
  A cute 3D stylized miniature cave and train-tunnel entrance in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a half-buried giant crispy Sicilian cannoli shell and biscuit stones as a mountain tunnel archway. Chubby, puffed proportions with zero sharp edges. Fried golden pastry-tube arch dusted with powdered sugar, studded with chunky dark-chocolate chips and pistachio crumbs around the dark recessed tunnel mouth, resting on a cobblestone base with brass rails. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 12 — Kit Spécial « Tetris Bwed Edition » & Arènes « BwedWare » (`83` à `90`)

Pour donner à **Tetris Bwed Edition** et aux arènes de mini-jeux un rendu 3D « Toy-Box » digne de *Tetris Effect* croisé avec *Link's Awakening* Switch.

- [x] **83. `tetris-frame-bakery-oven.glb` (Cadre de Grille Tetris « Grand Fourneau en Cuivre, Fonte & Briques »)** — Image : [`83-tetris-frame-bakery-oven.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/83-tetris-frame-bakery-oven.jpg)
  ```text
  A cute 3D stylized miniature arcade puzzle-board frame in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. An upright rectangularU-shaped frame crafted from warm brown-sugar bricks, shiny copper steam pipes, brass pressure gauges (with simple needles and no numbers), and a glowing hearth base designed to hold falling pastry blocks. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **84. `tetromino-i-baguette.glb` (Pièce Tetris « Barre I » en Baguette Croustillante — 4 Cubes Soudés)** — Images : [`84-tetromino-i-baguette.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/84-tetromino-i-baguette.jpg) / [`84b-tetromino-i-baguette-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/84b-tetromino-i-baguette-v2.jpg)
  ```text
  A cute 3D stylized miniature 4-block straight I-tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused square-rounded segments of golden-baked French baguette with diagonal crispy crust slashes and a warm buttery sheen. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **85. `tetromino-o-butter-brioche.glb` (Pièce Tetris « Carré O » 2x2 en Brioche & Glaçage Beurre)** — Image : [`85-tetromino-o-butter-brioche.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/85-tetromino-o-butter-brioche.jpg)
  ```text
  A cute 3D stylized miniature 2x2 square O-tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused plump golden brioche cubes topped with glossy melted yellow butter glaze and a tiny embossed bread-crest in each quadrant. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **86. `tetromino-t-berry-waffle.glb` (Pièce Tetris « T » en Gaufre Belge & Glaçage Framboise)** — Images : [`86-tetromino-t-berry-waffle.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/86-tetromino-t-berry-waffle.jpg) / [`86b-tetromino-t-berry-waffle-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/86b-tetromino-t-berry-waffle-v2.jpg)
  ```text
  A cute 3D stylized miniature T-shaped tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused crispy Belgian waffle cubes coated in thick glossy raspberry-pink sugar icing with tiny golden sugar pearls. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **87. `tetromino-l-choco-brownie.glb` (Pièce Tetris « L » en Brownie Chocolat Noir & Noisettes)** — Images : [`87-tetromino-l-choco-brownie.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/87-tetromino-l-choco-brownie.jpg) / [`87b-tetromino-l-choco-brownie-v2.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/87b-tetromino-l-choco-brownie-v2.jpg)
  ```text
  A cute 3D stylized miniature L-shaped tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused rich matte dark-chocolate brownie cubes topped with glossy fudge glaze and chunky roasted hazelnut pieces. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **87z. `tetromino-z-gingerbread-cherry.glb` (Pièce Tetris « Z » en Pain d'Épices Glacé & Gelée Cerise)** — Image : [`87z-tetromino-z-gingerbread-cherry.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/87z-tetromino-z-gingerbread-cherry.jpg)
  ```text
  A cute 3D stylized miniature Z-shaped tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused spicy gingerbread biscuit cubes arranged in a classic stepped Z shape, coated with glossy red cherry glaze and tiny white royal-icing snowflakes. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **87s. `tetromino-s-matcha-sponge.glb` (Pièce Tetris « S » en Génoise Matcha & Glaçage Pistache)** — Image : [`87s-tetromino-s-matcha-sponge.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/87s-tetromino-s-matcha-sponge.jpg)
  ```text
  A cute 3D stylized miniature S-shaped tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused fluffy sponge-cake cubes arranged in a classic stepped S shape, coated in smooth pastel-green matcha pistachio glaze with crushed pistachio sprinkles. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **87j. `tetromino-j-blueberry-eclair.glb` (Pièce Tetris « J » en Éclair Pâte à Choux & Glaçage Myrtille)** — Image : [`87j-tetromino-j-blueberry-eclair.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/87j-tetromino-j-blueberry-eclair.jpg)
  ```text
  A cute 3D stylized miniature J-shaped reverse-L tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused choux-pastry eclair cubes arranged in a classic J shape (mirrored L), coated in deep glossy blueberry-violet sugar glaze with tiny golden sugar pearls. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```
  ```text
  A cute 3D stylized miniature J-shaped reverse-L tetromino puzzle piece in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Four fused choux-pastry eclair cubes arranged in a classic J shape (mirrored L), coated in deep glossy blueberry-violet sugar glaze with tiny golden sugar pearls. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **88. `arcade-bumper-macaron.glb` (Obstacle d'Arène « Bumper Macaron & Anneau Ressort Doré »)** — Image : [`88-arcade-bumper-macaron.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/88-arcade-bumper-macaron.jpg)
  ```text
  A cute 3D stylized miniature pinball and arena bumper prop in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A plump pastel-turquoise and raspberry macaron mounted on a thick shiny brass spring-ring base with a glowing golden star button on top. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **89. `arcade-cannon-pastry-bag.glb` (Canon de Mini-Jeu « Poche à Douille & Embout Étoile en Laiton »)** — Image : [`89-arcade-cannon-pastry-bag.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/89-arcade-cannon-pastry-bag.jpg)
  ```text
  A cute 3D stylized miniature toy cannon in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a quilted cream pastry piping bag with a fluted brass star nozzle as a wheeled arena cannon. Chubby, puffed proportions with zero sharp edges. Plump canvas piping-bag barrel tied at the back with a golden ribbon, a shiny fluted brass tip at the front, mounted on a sturdy honey-wood carriage with four thick shortbread-cookie wheels. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **90. `arcade-podium-tiered-cake.glb` (Podium des Vainqueurs « Pièce Montée Royale Or / Argent / Bronze »)** — Image : [`90-arcade-podium-tiered-cake.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/90-arcade-podium-tiered-cake.jpg)
  ```text
  A cute 3D stylized miniature 3-step winner podium in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reimagining a three-tiered celebration cake as a championship stage. Chubby, puffed proportions with zero sharp edges. Center tallest block coated in radiant gold icing with a crown crest, left medium block in pearl-white vanilla glaze with a silver star crest, and right lower block in warm caramel-bronze glaze with a croissant crest (strictly no numbers or text). Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 13 — Familiers, Petites Créatures & PNJ Marchands BwedWorld (`91` à `95`)

Pour peupler les places de village, accompagner les pions ou tenir le comptoir des boutiques.

- [x] **91. `pet-butter-slime-pup.glb` (Familier « Chiot Motte de Beurre Fondant & Oreilles Croissant »)** — Image : [`91-pet-butter-slime-pup.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/91-pet-butter-slime-pup.jpg)
  ```text
  A cute 3D stylized miniature creature figure in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. An adorable round puppy-slime made of glossy melting golden yellow butter, with two floppy golden-baked croissant ears, shiny black bead eyes, and a tiny toasted-brioche tail, sitting on a small round pancake base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **92. `pet-sugar-cube-golem.glb` (PNJ Gardien « Petit Golem en Cubes de Sucre & Casque Dé à Coudre »)** — Image : [`92-pet-sugar-cube-golem.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/92-pet-sugar-cube-golem.jpg)
  ```text
  A cute 3D stylized miniature toy golem character in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A stocky, adorable little guardian built from stacked rounded white and brown sugar cubes held together by golden honey joints, wearing a shiny brass thimble helmet on its head and holding a tiny wooden honey-dipper club, standing on a biscuit base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **93. `pet-pigeon-chouquette.glb` (Oiseau du Village « Pigeon-Chouquette Rondouillard »)** — Image : [`93-pet-pigeon-chouquette.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/93-pet-pigeon-chouquette.jpg)
  ```text
  A cute 3D stylized miniature village bird figure in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, spherical proportions with zero sharp edges. A plump little pigeon shaped like a golden choux-pastry chouquette puff sprinkled with chunky white pearl-sugar grains, with tiny flaky croissant-tip wings, a roasted almond beak, and stubby pretzel feet on a small cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **94. `pet-teapot-turtle.glb` (Créature « Tortue-Théière en Porcelaine & Pattes Sablées »)** — Image : [`94-pet-teapot-turtle.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/94-pet-teapot-turtle.jpg)
  ```text
  A cute 3D stylized miniature creature figure in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A cozy little turtle whose shell is a glossy cream-and-gold porcelain teapot complete with a stubby spout tail, a round lid on its back, and a cute head and cuatro chubby legs made of warm golden brioche dough, resting on a biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **95. `npc-shopkeeper-toaster-bot.glb` (PNJ Marchand « Automate Grille-Pain à Moustache Laiton »)** — Image : [`95-npc-shopkeeper-toaster-bot.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/95-npc-shopkeeper-toaster-bot.jpg)
  ```text
  A cute 3D stylized miniature shopkeeper robot character in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A friendly retro turquoise-enamel and chrome toaster automaton wearing a golden farfalle-pasta bowtie, a handlebar mustache made of polished brass, warm glowing amber eyes, and two slices of golden toast popping out of its head like a crown, mounted on a small biscuit base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 14 — 5 Textures Seamless 2D Supplémentaires : Confiture, Vichy, Cuivre, Sucre Glace & Pain d'Épices (`96` à `100`)

- [ ] **96. `tex-strawberry-jam-jelly.jpg` (Texture Seamless : Gelée de Confiture de Fraise Rubis & Grains Dorés)**
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D glossy ruby-red strawberry jam glaze, in the style of Zelda Link's Awakening Switch. Thick translucent berry jelly waves dotted with tiny golden strawberry seeds and soft glossy light reflections, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [ ] **97. `tex-gingham-picnic-cloth.jpg` (Texture Seamless : Nappe de Bistro Tissée Vichy Rouge & Crème)**
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D woven red-and-cream gingham picnic fabric, in the style of Zelda Link's Awakening Switch. Soft tactile checkered cotton threads with warm cozy quilting dimples, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [ ] **98. `tex-brushed-brass-copper.jpg` (Texture Seamless : Plaques de Cuivre & Laiton Martelé de Pâtisserie)**
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D hammered warm copper and golden brass kitchen metal sheets, in the style of Zelda Link's Awakening Switch. Soft rounded dimples, warm metallic sheen, and subtle riveted seams, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [ ] **99. `tex-sugar-frosting-snow.jpg` (Texture Seamless : Neige de Sucre Glace & Sucre Perlé)**
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D fluffy white powdered-sugar snow and whipped frosting drifts, in the style of Zelda Link's Awakening Switch. Soft creamy waves sprinkled with chunky white pearl-sugar crystals and tiny pastel sugar confetti, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

- [ ] **100. `tex-gingerbread-brick-wall.jpg` (Texture Seamless : Mur en Briques de Pain d'Épices & Joints Glaçage Royal)**
  ```text
  Seamless tileable top-down 90-degree orthographic texture of stylized 3D spiced gingerbread bricks with thick piped white royal-icing mortar lines, in the style of Zelda Link's Awakening Switch. Warm cinnamon-brown rounded biscuit bricks and puffy glossy white icing joints, edge-to-edge repeating pattern, flat even lighting, no perspective distortion.
  ```

---

### Vague 15 — Le Dé 3D Officiel *Bwed Party* (`bwed-dice.glb` — Animation au-dessus des joueurs)

> **Note d'intégration 3D** : Une fois converti en `.glb`, nomme le fichier **`bwed-dice.glb`** et dépose-le dans `06_BRAND_AND_HUB/03_HUB_SITE/assets/buildings/bwed-dice.glb`. Le jeu [`party-board.js`](file:///Users/eutelion/Desktop/bwed/06_BRAND_AND_HUB/03_HUB_SITE/party-board.js) le détectera et remplacera automatiquement le cube du dé au-dessus de la tête des joueurs !

- [x] **101. `bwed-dice.glb` (Le Dé Brioché Royal à Coins de Laiton & Pépites de Chocolat Dorées — Mario Party Style)** — Image : [`101-bwed-dice.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/101-bwed-dice.jpg) / Modèle 3D : [`bwed-dice.glb`](../07_3D_MODEL/buildings/bwed-dice.glb)
  ```text
  A cute 3D stylized miniature game dice block in the style of PopMart vinyl toys, Mario Party dice blocks, and Zelda Link's Awakening Switch, combining chibi bakery food-craft with a luxury golden toy cube. The dice is a chubby, puffed, pillowy cube made of golden toasted brioche bread crust and warm cream shortbread biscuit, with zero sharp edges and soft rounded proportions. Each corner of the cube is reinforced with a shiny rounded golden brass bumper cap and tiny rivets. On the three visible recessed cream-crumb faces of the cube, the dice pips are sculpted as big, chunky, glossy dark-chocolate drops and a glowing golden bread-loaf star crest in the center face. Isometric 3/4 view showing three faces clearly, single standalone floating cube with no pedestal base, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no Arabic numerals, no floating detached parts.
  ```

---

### Vague 16 — Attractions & Fête Foraine de Bwedville (`102` à `106`)

Pour transformer le centre de Bwedville ou un quartier dédié en parc d'attractions féerique et festif.

- [x] **102. `ride-teacups-macaron.glb` (Manège des Tasses Tournantes en Porcelaine & Plateaux Macarons)** — Image : [`102-ride-teacups-macaron.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/102-ride-teacups-macaron.jpg)
  ```text
  A cute 3D stylized miniature spinning teacups amusement ride in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A circular fluted shortbread turntable base holding three oversized glossy pastel porcelain teacups (mint, strawberry pink, and lemon cream) with chubby golden handles and marshmallow interior seats, revolving around a central tiered macaron centerpiece topped with a golden sugar swirl. Mounted on a round biscuit cobblestone platform. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **103. `ride-roller-coaster-churro.glb` (Grand Huit : Rails de Churros & Wagons Moules à Cake)** — Image : [`103-ride-roller-coaster-churro.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/103-ride-roller-coaster-churro.jpg)
  ```text
  A cute 3D stylized miniature rollercoaster loop ride in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Deep-fried golden fluted churro tracks dusted with cinnamon-sugar forming a cute twisting spiral loop supported by thick pretzel-log pillars, with a chubby red-enameled cake-pan coaster train packed with cute marshmallow headrests climbing the rail crest. Mounted on a cobblestone-and-waffle base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **104. `ride-drop-tower-whisk.glb` (Tour de Chute Libre en Fouet Pâtissier Chromé & Sièges Brioche)** — Image : [`104-ride-drop-tower-whisk.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/104-ride-drop-tower-whisk.jpg)
  ```text
  A cute 3D stylized miniature amusement drop-tower ride in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A tall, sturdy polished-chrome kitchen balloon whisk acting as the central vertical launch tower, with a circular ring carriage of plump golden brioche passenger seats and waffle safety bars suspended midway along the balloon wires, topped with a shiny brass handle finial, resting on a thick biscuit plaza base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **105. `ride-swing-carousel-pretzel.glb` (Chaises Volantes en Bretzels Dorés & Parasol Tartelette)** — Image : [`105-ride-swing-carousel-pretzel.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/105-ride-swing-carousel-pretzel.jpg)
  ```text
  A cute 3D stylized miniature flying swing carousel ride in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A fluted golden butter-tartlet roof canopy with scalloped strawberry-icing fringes, supported by a thick cinnamon-swirl center pillar, holding eight chubby golden pretzel swings suspended by chunky rigid brass rods (no thin loose chains) fanned out gracefully, all mounted on a rounded cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **106. `ride-bumper-cars-donut.glb` (Autotamponneuses Donuts Colorés & Perche Électrique Cuillère)** — Image : [`106-ride-bumper-cars-donut.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/106-ride-bumper-cars-donut.jpg)
  ```text
  A cute 3D stylized miniature bumper car arena in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A compact rounded arena floor made of shiny dark-chocolate tile surrounded by puffy vanilla marshmallow bumper rails, featuring two chubby donut bumper cars (one with strawberry-sprinkle glaze, one with blueberry-cream glaze) with golden spoon steering wheels and thick brass overhead power poles, merged into a single watertight base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 17 — Véhicules Spéciaux & Flotte Bwed Air/Sea (`107` à `110`)

Pour peupler le ciel, les canaux de chocolat et les routes de l'univers BwedWorld.

- [x] **107. `vehicle-croissant-glider.glb` (Planeur Léger : Ailes en Croissant Feuilleté Doré & Cockpit Noisette)** — Image : [`107-vehicle-croissant-glider.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/107-vehicle-croissant-glider.jpg)
  ```text
  A cute 3D stylized miniature fantasy glider aircraft in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A curved golden-baked French croissant forms the sweeping main wings and fuselage with delicate buttery flaky layers, a cozy hollowed-out roasted hazelnut cockpit with a tiny brass flight stick, and two cute cinnamon-stick tail fins, resting on a tiny sculpted cloud stand. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **108. `vehicle-submarine-viennois.glb` (Sous-Marin d'Exploration : Pain Viennois & Hublots Laiton)** — Image : [`108-vehicle-submarine-viennois.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/108-vehicle-submarine-viennois.jpg)
  ```text
  A cute 3D stylized miniature exploration submarine in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A glossy, golden-brown glazed pain viennois bun body with diagonal score marks, fitted with three chunky round brass portholes glowing with warm amber light, a polished copper periscope conning tower, a butter-cookie propeller at the stern, and two sturdy waffle ballast skids underneath, resting on a small melted-chocolate wave base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **109. `vehicle-donut-hovercraft.glb` (Aéroglisseur : Donut Glaçage Fraise & Hélice Cuillère en Laiton)** — Image : [`109-vehicle-donut-hovercraft.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/109-vehicle-donut-hovercraft.jpg)
  ```text
  A cute 3D stylized miniature hovercraft vehicle in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A plump, buoyant ring donut hull coated in glossy strawberry glaze and rainbow sugar sprinkles acting as the hover cushion skirt, with a cozy cream-leather driver's cockpit in the center hole, and a giant vertical brass soup-spoon fan propeller mounted in a shortbread shroud at the back. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **110. `vehicle-baguette-rocket.glb` (Fusée Spatiale : Baguette de Tradition & Tuyère Moka)** — Image : [`110-vehicle-baguette-rocket.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/110-vehicle-baguette-rocket.jpg)
  ```text
  A cute 3D stylized miniature retro space rocket in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A vertical stubby golden French baguette rocket fuselage with crispy crust score cuts, three chunky pretzel tail fins, a domed brass cockpit porthole near the nosecone, and a solid sculpted flame exhaust plume made of glossy swirled coffee-moka caramel that serves as the stable ground stand. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 18 — Mécaniques de Plateau & Événements Crumb Run (`111` à `115`)

Des cases interactives 3D spectaculaires pour renouveler le gameplay du jeu de société **Crumb Run / Bwed Party**.

- [x] **111. `board-roulette-fruit-tart.glb` (Roue de la Fortune : Tarte aux Fruits Rôtie & Aiguille Cuillère)** — Image : [`111-board-roulette-fruit-tart.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/111-board-roulette-fruit-tart.jpg)
  ```text
  A cute 3D stylized miniature fortune-wheel game board tile in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A fluted golden shortbread tartlet divided into six colorful fruit segments (glossy strawberry, kiwi lime, apricot orange, blackberry purple, lemon curd, and dark chocolate), with a chunky golden brass teaspoon spinner needle pivoted at the center, resting on a round biscuit cobblestone tile. Isometric 3/4 front-top view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **112. `board-mystery-box-cookie.glb` (Boîte Mystère Surprise : Biscuit Doré & Nœud Ruban en Sucre)** — Image : [`112-board-mystery-box-cookie.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/112-board-mystery-box-cookie.jpg)
  ```text
  A cute 3D stylized miniature mystery gift box prop in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A cubic baked shortbread biscuit gift box with rounded butter edges and stamped question mark swirls (subtle embossed icons, no text), tied with an oversized puffy pastel-pink sugar fondant ribbon bow on top, resting on a small party confetti biscuit tile. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **113. `board-vault-chocolate-safe.glb` (Coffre-Fort Bancaire : Bloc de Chocolat Blindé & Volant Laiton)** — Image : [`113-board-vault-chocolate-safe.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/113-board-vault-chocolate-safe.jpg)
  ```text
  A cute 3D stylized miniature bank vault safe in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A heavy, monolithic cube sculpted from a giant block of dark chocolate with rounded beveled edges, reinforced with thick golden brass rivets and corner plates, featuring a massive pretzel-wheel vault handle on the front door and a chunky keyhole, sitting on a biscuit stone foundation. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **114. `board-springboard-waffle.glb` (Tremplin Éjecteur : Gaufre Croustillante & Ressort Laiton)** — Image : [`114-board-springboard-waffle.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/114-board-springboard-waffle.jpg)
  ```text
  A cute 3D stylized miniature springboard tile prop in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. An angled, crispy golden Belgian waffle jumping plate with buttery syrup gloss, mounted on top of a giant heavy coiled brass spring that rests firmly in a circular biscuit cobblestone base tile. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [x] **115. `board-cannon-sugar-blast.glb` (Super Canon à Pions : Mortier Cuivre & Poudre de Sucre)** — Image : [`115-board-cannon-sugar-blast.jpg`](../01_CANON_BWED/05_BUILDINGS_CONCEPTS/115-board-cannon-sugar-blast.jpg) — Modèle 3D : [`board-cannon-sugar-blast.glb`](../07_3D_MODEL/buildings/board-cannon-sugar-blast.glb)
  ```text
  A cute 3D stylized miniature player-launching cannon in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A wide, stubby hammered-copper mortar cannon barrel shaped like a cake-decorating nozzle, mounted on a curved gingerbread carriage with four chunky shortbread wheels, angled upward ready to blast tokens across the board, resting on a cobblestone tile. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 19 — Édifices Sacrés & Sanctuaires de l'Ordre du Levain (`116` à `118`)

Pour les biomes mystiques, les quêtes de la « Levure Ancienne » et les donjons de BwedWorld.

- [ ] **116. `temple-sourdough-monastery.glb` (Monastère Zen du Levain Ancien & Clocher Kouglof)**
  ```text
  A cute 3D stylized miniature ancient monastery shrine in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. Multi-tiered pagoda-style roofs made of fluted golden kouglof cake tiers with powdered sugar ridges, walls built of rustic flour-dusted sourdough crust stones, a glowing orange hearth entrance gate, and a serene raked brown-sugar gravel zen garden in front. Mounted on a solid biscuit stone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **117. `monument-ancient-stone-croissant.glb` (Mégalithe Druidique en Croissant de Pierre Sablée)**
  ```text
  A cute 3D stylized miniature ancient megalith monument in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, reminiscent of Stonehenge made of bakery relics. Chubby, puffed proportions with zero sharp edges. A giant weathered golden-brown shortbread croissant standing upright like a mystical dolmen arch, carved with glowing golden honey runes and mystical spiral markings, surrounded by smaller toasted-brioche standing stones on a matcha-moss sponge-cake knoll. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **118. `dungeon-spatula-crypt.glb` (Crypte des Chevaliers Spatules & Tombeau Brioché)**
  ```text
  A cute 3D stylized miniature dungeon crypt entrance in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A subterranean archway built from dark spiced gingerbread blocks and molten caramel mortar, flanked by two stone statues of knight-breads holding golden spatula polearms, with twin glowing butter-torch sconces flanking a heavy chocolate slab crypt door. Mounted on a rocky biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 20 — Boss de Fin de Plateau & Mascottes Légendaires (`119` à `122`)

Les créatures emblématiques qui donnent vie au monde et servent de défis épiques aux aventuriers.

- [ ] **119. `boss-dough-golem-colossus.glb` (Colosse Titan : Golem de Pâte Briochée Levée & Yeux Braise)**
  ```text
  A cute 3D stylized miniature giant boss creature figure in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A massive, friendly-yet-imposing titan golem sculpted entirely from billowing plump golden-baked brioche dough, with crackled crust armor plates on its shoulders, glowing warm orange charcoal embers for eyes, a thick rolling-pin weapon held in one hand, and a chef-hat shaped dome head, standing stoutly on a shattered shortbread stone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **120. `boss-oven-fire-dragon.glb` (Dragon Fourneau : Briques Réfractaires & Flammes Caramel)**
  ```text
  A cute 3D stylized miniature dragon boss figurine in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. An adorable, stocky dragon whose body is built of warm red oven bricks and dark cast-iron scales, with glowing magma-orange seams, two chunky golden waffle wings, glowing ember eyes, and a puffed snout puffing a solid sculpted swirl of glowing golden caramel fire, standing on a charred biscuit rock base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **121. `pet-croissant-cat.glb` (Familier Légendaire : Chat-Croissant Doré Assoupi)**
  ```text
  A cute 3D stylized miniature animal companion figure in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. An adorable round cat curled up peacefully whose curved body and back are a golden flaky French croissant with shiny butter glaze, complete with two cute pointy croissant-ear tips, sleeping closed curved eyes, a tiny pink nose, and a curled cinnamon-twist tail, resting on a soft cream marshmallow cushion base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **122. `pet-baguette-dachshund.glb` (Familier Loyal : Chien Teckel-Baguette Croustillant)**
  ```text
  A cute 3D stylized miniature pet dog figure in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. An adorable elongated dachshund puppy whose long sausage body is a crispy golden French baguette with diagonal score marks, four stubby shortbread paws, two floppy soft brioche ears, shiny black bead eyes, and a wagging pretzel tail, standing proudly on a small biscuit cobblestone base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

---

### Vague 21 — Mobilier Urbain & Détails d'Immersion (`123` à `125`)

Pour enrichir les promenades piétonnes et places publiques du village 3D.

- [ ] **123. `prop-streetlamp-spun-sugar.glb` (Lampadaire de Rue : Lanterne Sucre d'Orge & Miel Brillant)**
  ```text
  A cute 3D stylized miniature village street lamp in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A curved lamppost pole made of a red-and-cream striped candy-cane with brass ornamental fittings, holding an ornate hexagonal brass lantern containing a warm glowing drop of amber honey that radiates soft light, planted in a round biscuit cobblestone curb base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **124. `prop-fountain-hot-chocolate.glb` (Grande Fontaine de Place : Vasques Chocolat Chaud Fumant)**
  ```text
  A cute 3D stylized miniature public fountain monument in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. A three-tiered circular fountain crafted from fluted cream porcelain and golden brass trims, overflowing with thick glossy cascades of warm melted milk chocolate flowing into a wide shortbread stone basin decorated with marshmallow water-lilies, resting on a cobblestone plaza base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```

- [ ] **125. `prop-bench-chocolate-bar.glb` (Banc Public : Tablette de Chocolat Craquant & Pieds Laiton)**
  ```text
  A cute 3D stylized miniature village park bench in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. Chubby, puffed proportions with zero sharp edges. The seat and backrest are made of thick glossy dark-chocolate bar squares with rounded beveled edges, supported by two chunky ornamental brass scrollwork armrests and legs, resting on a small rectangular biscuit cobblestone pavement base. Isometric 3/4 front view, closed watertight compact 3D volume, soft studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
  ```







