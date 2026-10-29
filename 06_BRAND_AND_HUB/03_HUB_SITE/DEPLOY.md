# Crumb Run deployment

This folder is a static Vercel-ready site. It has no build step and no package installation.

## Vercel dashboard

When importing the repository, set the project Root Directory to:

```text
06_BRAND_AND_HUB/03_HUB_SITE
```

Use the `Other` framework preset, leave Build Command empty, and leave Output Directory as the project root (`.`).

The default URL opens the Bwed hub. The 3D party game is available at:

```text
/party-board
```

All game GLBs live in `assets/pawns/`, and the bakery reference image used by the menu lives in `assets/references/`. The game does not depend on the original project folders outside this deployment root.

## Vercel CLI

From this folder:

```bash
vercel --prod
```

No `file://` opening is needed after deployment: Vercel serves the page over HTTPS, so the GLB assets can load normally.
