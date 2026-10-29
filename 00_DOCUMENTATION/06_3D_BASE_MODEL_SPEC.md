# Bwed — spécification du modèle 3D maître

## Objectif

Créer un modèle 3D de référence du Bwed naked, simple et propre, qui servira de source commune pour :

- mini-jeux web et desktop ;
- animations courtes et cinématiques ;
- cosplays et variantes ;
- rendus promotionnels ;
- export éventuel vers GLB/GLTF, FBX et USDZ.

## Priorité visuelle

La référence primaire n'est pas une interprétation générique d'une tranche de pain : c'est le Bwed 3D fourni dans les assets existants.

Références à verrouiller avant toute production :

- `01_CANON_BWED/01_CORE_IDENTITY/photo_5841698101943536602_y.jpg` : planche de référence avec les trois poses du naked à chaussures rouges ;
- `04_ANIMATION_AND_VIDEO/01_MP4/document_5978822543090393216.mp4` : séquence 3D de référence, utile pour le volume, les proportions, les appuis et la déformation en mouvement.

Contraintes de reconnaissance à respecter :

- corps plus trapu qu'un rectangle droit, aux coins très arrondis et au volume visible de croûte sur le dessus et les côtés ;
- mie frontale légèrement en retrait dans la croûte ;
- bras fins, souples et courbés, mains simples mais lisibles ;
- jambes très fines et courtes ;
- petites chaussures rouges avec semelle/partie jaune-orangé ;
- yeux noirs brillants, bouche minuscule ouverte, taches de cuisson discrètes ;
- ratio de silhouette, emplacement du visage et taille des chaussures à valider sur la référence avant d'ajouter les cosplays.

Le blockout procédural ne constitue pas le canon final. Il sert uniquement à préparer la reconstruction et l'architecture technique du futur asset maître.

## Architecture recommandée

```text
Bwed_Root
├── Bwed_Body
├── Bwed_Crust
├── Bwed_Face
├── Bwed_Arms
├── Bwed_Legs
├── Bwed_Shoes_Red
├── Bwed_Props_Sockets
└── Bwed_Rig
```

Le corps nu doit rester indépendant des costumes. Les chaussures rouges doivent être un objet séparé, afin de pouvoir les réutiliser et les remplacer sans modifier le rig principal.

## Déclinaisons à prévoir dès le départ

- pose neutre ;
- marche et course ;
- saut ;
- chute ;
- idle avec respiration légère ;
- expressions de base : joie, tristesse, colère, surprise, peur, sommeil ;
- sockets pour chapeau, lunettes, vêtements, outils et accessoires.

## Formats de livraison

1. fichier source Blender `.blend` ;
2. export `.glb` pour le web et les mini-jeux ;
3. export `.fbx` si nécessaire pour d'autres moteurs ;
4. textures séparées et version atlas si le jeu le demande ;
5. une version low-poly et une version render/promo si le budget le justifie.

## Méthode de fabrication

La méthode la plus sûre est de reconstruire manuellement un modèle stylisé dans Blender à partir des références visuelles existantes, puis de valider une silhouette frontale et trois-quarts avant de détailler le rig. Une génération automatique peut aider à explorer des formes, mais elle ne doit pas devenir la source maître sans nettoyage de topologie, UV, matériaux et proportions.

## Références locales secondaires

- `04_ANIMATION_AND_VIDEO/01_MP4/9F973250-7E81-4447-AAC9-2BF94D03213F.MP4` : variante 3D avec lunettes, utile pour vérifier que les accessoires peuvent se superposer au modèle de base.
- `01_CANON_BWED/01_CORE_IDENTITY/` : références de lecture du visage et de la silhouette historique.

## Validation avant production

- valider une vue face, profil et trois-quarts ;
- comparer la silhouette au Bwed naked historique ;
- vérifier que les chaussures rouges restent immédiatement visibles ;
- tester le modèle en très petite taille ;
- tester un cosplay en retirant complètement les accessoires ;
- vérifier l'export GLB dans un navigateur avant de produire une série de skins.
