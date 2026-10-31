# BWED BUTTER ESCAPE — 3D STREET RUNNER (V4 PRO)

Un jeu d'arcade 3D complet, nerveux et immersif dans le navigateur, développé avec **Three.js** dans l'univers de BWED.

---

## 🌟 NOUVEAUTÉS DE LA VERSION 4

1. **Orientation du Héros Corrigée (Course vers l'Avant)** :
   - Le personnage court désormais dans le sens naturel de la piste (dos à la caméra, regard fixé vers l'avant sur les obstacles à venir).
   - Dans le showroom d'accueil, le personnage danse sur le piédestal tournant et salue la caméra.

2. **Échelle du Cozy Shiba Équilibrée** :
   - Facteur d'échelle recalibré (`scaleMultiplier: 1.45`) pour que la posture de course à quatre pattes atteigne exactement la même hauteur (1,65 m) et la même présence visuelle que tous les autres héros humanisés (Chef Émile, Toast Bandit, etc.).

3. **100% des Bâtiments Remplacés par nos Vrais Modèles GLB** :
   - Fini les blocs procéduraux : les deux côtés du boulevard sont maintenant exclusivement bordés par nos véritables boutiques et immeubles 3D issus de `07_3D_MODEL/buildings/` :
     - `patisserie-coin.glb` (Boulangerie d'angle)
     - `milk-carton-apartments.glb` (Résidences briques de lait)
     - `galeries-boutique.glb` (Boutique de mode)
     - `honey-pot-tavern.glb` (Taverne pot de miel)
     - `shop-barber-chantilly.glb` (Salon barbier chantilly)
     - `jam-jar-apothecary.glb` (Apothicaire pots de confiture)
     - `arcade-duel.glb` (Salle d'arcade)
     - `teacup-gazebo-park.glb` (Pavillon tasse de thé)
     - `arcade-podium-tiered-cake.glb` (Tour gâteau)
   - Tous les bâtiments sont centrés, ancrés au sol à $Y = 0$, et orientés vers la rue !

4. **Système de Classement Mondial (Leaderboard)** :
   - Bouton **🏆 Classement** disponible sur l'écran d'accueil, dans le HUD en jeu et sur l'écran de Game Over.
   - Champ de saisie pour définir et sauvegarder votre **Pseudo Bwed** (sauvegardé en `localStorage`).
   - Tableau complet du Top 10 avec médailles (🥇, 🥈, 🥉), scores, distances et zones atteintes.
   - Pré-équipé d'un hook asynchrone (`syncOnlineAsync`) prêt à être relié à l'API backend du Bwedverse lors de la mise en ligne mondiale !

---

## 🎮 COMMANDES

| Action | Clavier (PC / Mac) | Mobile / Tactile |
| :--- | :--- | :--- |
| **Changer de voie** | `Q` / `D` ou `Flèches Gauche / Droite` | Swipe Gauche / Droite ou boutons `⬅️` / `➡️` |
| **Sauter** | `Espace` ou `Z` / `Flèche Haut` | Swipe Haut ou bouton `⬆️ SAUTER` |
| **Glisser / Annuler saut** | `S` / `Flèche Bas` | Swipe Bas ou bouton `⬇️ GLISSER` |
| **Activer le Turbo** | `Shift` (dès 100% Sugar Rush) | Bouton `🔥 ACTIVER TURBO` |
| **Classement** | Bouton `🏆 Classement` | Bouton `🏆` dans le HUD |
| **Pause** | `Échap` ou `P` | Bouton `⏸️ Pause` |

---

## 🚀 TESTER EN LOCAL

👉 **[http://localhost:4173/12_BWED_RUNNER/](http://localhost:4173/12_BWED_RUNNER/)**
