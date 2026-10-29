# BWED WORLD — HUB MULTIJOUEUR 3D COSY

Un monde 3D dans le navigateur, mobile-first, inspiré de l'esprit de Pudgy World et Animal Crossing : un village communautaire chaleureux servant de porte d'entrée aux mini-jeux du Bwedverse (BwedTris 3D, Crumb Run, etc.) et aux sections du site.

---

## JALON 1 — ÉTAT D'AVANCEMENT
- **Zone 1** : La Grand-Place du Beurre Doré (pavage circulaire, fontaine monumentale avec orbe de pain sacré, lanternes en bois sombre, bancs et arbres matcha).
- **Avatar GLB** : Chef Émile (`tiny-baker.glb`), pivot ajusté au sol, animations procédurales fluides (respiration au repos, dandinement *waddle* en course, nuages de poussière de pas).
- **Caméra** : Vue 3/4 isométrique type Pokémon / Animal Crossing (inclinaison 50 degrés, amortissement *lerp*).
- **Contrôles** : Clavier (Flèches / ZQSD), Joystick virtuel tactile mobile sous le pouce, clic au sol.
- **Multijoueur 2 Onglets** : Synchronisation temps réel à 15 Hz via `NetworkAdapter` (BroadcastChannel instantané sans serveur requis + connecteur serveur prêt).

---

## COMMENT TESTER LE JALON 1

### 1. Lancement du client web
Le client est servi directement par le serveur web local :
URL d'accès : `http://localhost:4173/10_BWED_WORLD/client/`

### 2. Test multijoueur à deux onglets
1. Ouvrez l'URL dans un premier onglet : votre avatar apparaît sur la place.
2. Ouvrez la même URL dans un second onglet (ou une fenêtre côte à côte).
3. Les deux onglets se détectent instantanément :
   - Le badge affiche "2 joueurs dans le village".
   - Vous voyez l'autre joueur se déplacer, s'orienter et courir en temps réel avec son étiquette de pseudo au-dessus de la tête.
   - Les mouvements sont lissés à 60 FPS sans saccade grâce au tampon d'interpolation.

---

## COMMENT AJOUTER DU CONTENU

### 1. Ajouter un nouvel avatar GLB
1. Déposez votre fichier `.glb` dans `client/assets/avatars/`.
2. Déclarez-le dans `client/src/config.js` sous l'objet `CONFIG.avatars` :
```javascript
'mon-avatar': {
  name: 'Nom Affiché',
  file: './assets/avatars/mon-avatar.glb',
  scale: 1.0,
  yOffset: 0.0
}
```

### 2. Ajouter un obstacle ou un prop dans la zone
Dans `client/src/world/WorldManager.js`, utilisez :
```javascript
this.physics.addObstacle(x, z, rayon);
```
Pour rendre un élément infranchissable par les joueurs.
