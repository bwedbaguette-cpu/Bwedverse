# 🥐 Bwed Village 3D — Master Prompt System & Architecture de Génération

Ce document définit le **Master Prompt universel et modulaire** conçu spécifiquement pour produire la collection complète d'assets 3D du futur **Bwed Village** (bâtiments, mobilier urbain, végétation gourmande, infrastructures et PNJ).

Il est optimisé pour les générateurs d'images (Midjourney v6.1, Flux.1, Gemini Imagen 3) et calibré pour une conversion 3D directe sans défauts via **Meshy 3D, Tripo 3D, Rodin, Trellis** ou modélisation manuelle sous Blender.

---

## 🎯 1. La Formule Maître Universelle (Template Modulaire)

Voici la structure de base. Pour générer n'importe quel asset, il suffit de remplir les blocs entre crochets `[...]` :

```text
A cute 3D stylized miniature [OBJECT_TYPE] in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a [KITCHEN_OR_EVERYDAY_OBJECT]. The asset is a chubby, puffed [DESCRIPTION] with zero sharp edges, soft beveled curves, and welcoming organic proportions. Edible and warm tactile materials: [MATERIALS_DESCRIPTION], featuring [SPECIAL_FEATURE_OR_ROOF_PROP]. Soft warm bakery studio lighting with gentle ambient occlusion, golden highlights, and subtle warm amber glow. Mounted on a small, thick, rounded biscuit-and-cobblestone pedestal base. Isometric 3/4 front hero view, closed watertight compact 3D volume, everything physically connected with zero detached floating parts, centered in frame, pure solid black background (#000000), strictly no text, no letters, no words, no numbers, no floating detached parts, clean render.
```

---

## 📐 2. Les 4 Règles d'Or Techniques pour l'Export 3D

Pour qu'une IA de conversion 3D (Meshy, Tripo, etc.) sorte un fichier `.glb` propre sans trous, sans faces inversées et sans artefacts :

1. **Volume 100% Fermé et Étanche (*Watertight*)** :
   * Toujours préciser `closed watertight compact 3D volume`.
   * Tout doit être physiquement soudé : pas de nuages de fumée flottants, pas d'enseignes volantes déconnectées, pas de miettes en lévitation.
2. **Vue Héroïque Isométrique 3/4** :
   * L'angle 3/4 plongeant montre à la fois la façade, le toit et les côtés, ce qui permet à l'algorithme 3D de déduire le volume arrière sans distorsion.
3. **Fond Noir Pur (`#000000`) ou Fond Studio Neutre** :
   * Permet un détourage alpha automatique parfait lors de la génération du maillage 3D, sans "frange" ni déformation de la géométrie de base.
4. **Zéro Texte, Zéro Lettres, Zéro Chiffres** :
   * Les IA d'images génèrent souvent du faux texte baveux qui crée des bosses hideuses sur le mesh 3D. Remplacer les textes par des emblèmes sculptés (croissant en or, bretzel, flamme, fève).

---

## 🏛️ 3. Bibliothèque de Prompts Prêts à l'Emploi par Catégorie

### Catégorie A — Bâtiments & Boutiques du Village

#### A1. Maison des Villageois (Cottage Toast & Confiture)
```text
A cute 3D stylized miniature village cottage in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a cozy country house. The house is a chubby, puffed two-story cottage shaped like a plump toasted sandwich loaf, with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: golden-brown toasted bread crust roof with butter glaze, soft cream brioche walls, a round arched wooden door with a strawberry jam round window, butter-pat chimney with a solid puffy clay smoke curl attached, and tiny wafer-cookie window shutters. Mounted on a small, thick, rounded biscuit-and-cobblestone pedestal base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### A2. Moulin à Farine & Sucre (Moulin à Poivre & Pales Croissant)
```text
A cute 3D stylized miniature village windmill in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a vintage wooden pepper mill. The building is a chubby, round, puffed conical tower with zero sharp edges and soft rounded proportions. Edible and warm tactile materials: honey-toned polished wood grain, powdered-sugar dusting, four chunky rotating blades shaped like golden curved croissants physically attached to a brass central hub, a cozy arched front entrance with a warm amber light, and a small balcony with pretzel railings. Mounted on a small, thick, rounded biscuit-and-cobblestone pedestal base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### A3. Taverne & Auberge (Chaudron & Cruche à Lait)
```text
A cute 3D stylized miniature village tavern in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with an old ceramic milk jug and waffle pub. The building is a chubby, wide, puffed tavern with zero sharp edges. Edible and warm tactile materials: golden grid-waffle facade with melted butter mortar, a roof made of overlapping dark-chocolate cookie shingles, a warm glowing round tavern door, and a giant sculpted golden beer-mug shaped like a foamy milk glass attached to the front awning. Mounted on a small, thick, rounded biscuit-and-cobblestone pedestal base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### A4. Forge & Atelier Mécanique (Gaufrier en Fonte & Grille-Pain)
```text
A cute 3D stylized miniature village blacksmith forge in the style of PopMart vinyl toys and Zelda Link's Awakening Switch, combining chibi food-architecture with a retro cast-iron waffle press and copper toaster. The building is a chubby, puffed forge with zero sharp edges. Edible and warm tactile materials: dark seasoned cast-iron exterior with copper rivets, glowing orange-hot furnace fireplace entrance shaped like an open toaster slot, two stubby iron chimneys, and an oversized shiny anvil shaped like a loaf of rye bread on the doorstep. Mounted on a small, thick, rounded biscuit-and-cobblestone pedestal base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

---

### Catégorie B — Mobilier Urbain & Props de Village

#### B1. Lampadaire de Rue (Cuillère en Laiton & Perle de Sucre Lumineuse)
```text
A cute 3D stylized miniature village streetlamp in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A plump, charming street lantern made of an elegant curved vintage brass teaspoon stem holding a glowing, warm amber-yellow translucent sugar-pearl orb lantern inside a protective pastry-crust cage, with zero sharp edges and soft rounded proportions. The post is wrapped with a tiny green marzipan ivy vine. Grounded on a small circular biscuit-cobblestone footing. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### B2. Banc Public de Village (Gaufrette Chocolat & Caramel)
```text
A cute 3D stylized miniature village park bench in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A chubby, adorable public park bench made of two crispy golden wafer cookies for the seat and backrest, supported by two chunky, glossy dark-chocolate legs and armrests, with zero sharp edges and soft rounded curves. Sitting on top of the seat is a tiny red-and-white checkered picnic cushion. Grounded on a small oval biscuit-cobblestone footing. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### B3. Puits du Village (Tasse à Expresso & Fontaine Chocolat)
```text
A cute 3D stylized miniature village water well in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A chubby round town well built from shortbread biscuit stones with sugar-glaze mortar, featuring a small puffed gable roof covered in butter-croissant shingles supported by two rounded cinnamon-stick posts, and an interior filled with glossy melted chocolate liquid relief. A tiny brass bucket hangs from a solid sugar-rope. Mounted on a round biscuit-cobblestone base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### B4. Panneau Indicateur / Poteau Directionnel (Bretzel & Biscuits Fléchés)
```text
A cute 3D stylized miniature village signpost in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A charming direction post made of a chubby twisted salted pretzel post with three pointing direction arrows shaped like crisp butter cookies pointing in different directions, topped with a golden croissant finial. Zero sharp edges, soft beveled curves. Grounded on a small rounded biscuit-cobblestone footing. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### B5. Boîte aux Lettres de Quartier (Boîte à Pain & Timbre Sucre)
```text
A cute 3D stylized miniature village mailbox in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A plump, rounded retro bread-box mailbox painted in pastel mint-green enamel with shiny brass trim, a flip-top lid, and a little golden bread-slice flag raised on the side, mounted on a sturdy golden-cookie post. Zero sharp edges and soft tactile materials. Grounded on a small rounded biscuit footing. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

---

### Catégorie C — Végétation & Nature du Bwedverse

#### C1. Arbre Fruitier Brioché (Trunk Cannelle & Feuilles Brioche Pistache)
```text
A cute 3D stylized miniature fantasy tree in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A plump, chubby fantasy tree with a twisted cinnamon-stick trunk and a round, cloud-like puffy canopy made of golden-baked matcha and pistachio brioche buns, decorated with small glossy candied red cherries embedded in the foliage, with zero sharp edges and soft rounded proportions. Grounded on a small rounded green matcha-moss mound base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### C2. Buisson Champignon Gourmand (Meringue & Fraise des Bois)
```text
A cute 3D stylized miniature garden shrub in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A charming cluster of three chubby, puffy meringue-capped mushrooms and rounded flaky croissant leaf shrubs, accented with glossy sugar-coated red berries, with zero sharp edges and soft tactile clay-like surfaces. Grounded on a small rounded crumbly cookie base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

---

### Catégorie D — Infrastructures & Terrains

#### D1. Pont de Rivière Chocolat (Rouleau à Pâtisserie & Dalles Sablées)
```text
A cute 3D stylized miniature arched bridge in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A chubby, puffed arched pedestrian bridge spanning a small canal, made of two giant polished honey-wood rolling pins acting as the side rails with butter-knife balusters, and a curved deck paved with golden shortbread biscuit cobblestones. Zero sharp edges, solid closed volume. Grounded on thick cookie-crust embankment supports. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

#### D2. Porte / Arche d'Entrée du Village (Grande Arche Baguette & Gaufre)
```text
A cute 3D stylized miniature monumental village entrance archway in the style of PopMart vinyl toys and Zelda Link's Awakening Switch. A majestic, chubby welcome arch formed by two giant golden crusty French baguettes leaning together to create an arched gate, reinforced with toasted waffle pillars, and topped with a giant smiling Bwed bread-slice crest. Warm glowing lantern lights hang from the arch. Mounted on a wide, thick biscuit-and-cobblestone base. Isometric 3/4 front hero view, closed watertight compact 3D volume, soft warm bakery studio lighting, pure solid black background (#000000), strictly no text, no letters, no numbers, no floating detached parts.
```

---

### Catégorie E — PNJ & Habitants du Village (Bwed Villagers)

#### E1. Le Boulanger en Chef du Village (Bwed Baker NPC)
```text
A cute 3D stylized vinyl collectible toy character in the style of PopMart and Zelda Link's Awakening Switch. An adorable anthropomorphic bread-slice character (Bwed canon design) with rounded golden crust edges, soft pale cream bread crumb face, two large shiny black oval eyes, and a cheerful tiny open smile. Wearing a puffy oversized white cloth baker's chef toque hat and a miniature brown canvas apron, with iconic chubby red sneakers on tiny legs. Holding a wooden baker's peel bread paddle with both hands close to the body. Solid compact closed 3D volume with no thin detached parts, standing on a small round biscuit pedestal base. Front 3/4 hero view, soft studio lighting, pure solid black background (#000000), strictly no text, no letters.
```

#### E2. Le Jardinier / Cueilleur de Baies (Bwed Gardener NPC)
```text
A cute 3D stylized vinyl collectible toy character in the style of PopMart and Zelda Link's Awakening Switch. An adorable anthropomorphic bread-slice character (Bwed canon design) with rounded golden crust edges, soft cream crumb face, and large shiny black eyes. Wearing a tiny straw sunhat decorated with a strawberry blossom, a pair of denim overalls, and iconic red sneakers. Holding a small wicker basket full of glossy red berry sweets close to the chest. Solid compact closed 3D volume, standing on a small round biscuit pedestal base. Front 3/4 hero view, soft studio lighting, pure solid black background (#000000), strictly no text, no letters.
```

---

## 🎨 4. Lexique de Mots-Clés Poudre Magique (Cheat Sheet)

À combiner selon vos besoins pour enrichir vos variations :

| Catégorie | Termes recommandés en anglais |
| :--- | :--- |
| **Matières de pain** | `golden toasted bread crust`, `soft brioche crumb`, `flaky butter croissant layers`, `sablé shortbread cookie`, `crisp waffle grid` |
| **Glaçages & Sucres** | `glossy melted chocolate glaze`, `powdered sugar snow dusting`, `translucent strawberry jam jelly`, `shiny amber caramel drip` |
| **Ustensiles & Cuisine** | `polished brass knobs`, `copper rivets`, `porcelain enamel`, `vintage kitchen appliance hybrid`, `honey-toned beech wood` |
| **Éclairage & Rendu** | `warm bakery studio lighting`, `gentle ambient occlusion`, `soft contact shadows`, `subtle subsurface scattering on crumb`, `warm amber window glow` |
| **Forme & Style 3D** | `PopMart vinyl art toy style`, `Zelda Link's Awakening Switch diorama`, `chubby puffed proportions`, `zero sharp edges`, `closed watertight compact 3D volume` |
| **Exclusions (Negative)** | `strictly no text, no letters, no numbers, no floating detached parts, no thin wireframe, no flat 2D planes, no sharp polygon edges, no human faces` |
