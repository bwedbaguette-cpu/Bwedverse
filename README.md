# Bwedverse & Crumb Run 3D

> **The Living Slice — Official 3D Hub & Board Game**  
> Solana Contract Address: `5nfDdZFMsDz34y6p1PAm1yN4FpXrGjFRj2V48dgPpump`

---

## Overview

**Bwedverse** is the interactive universe of Bwed, the legendary living bread slice. What began on Solana as a lone slice with red sneakers has evolved into a complete digital ecosystem featuring:

1. **Crumb Run 3D**: A turn-based diorama board game built on Three.js featuring overhead physics dice, 18 collectible 3D GLB vinyl heroes, 12 architectural town buildings, animated spectators, and procedural mini-games.
2. **Collector Showcase**: An illuminated 3D figurine cabinet displaying all 18 playable vinyl pawns on mahogany pedestals with rotating inspection modals.
3. **Living Bread Mosaic**: An infinite multi-track scrolling wallpaper featuring canonical community memes and artwork.
4. **MemeDepot Vault**: A community archive of 160+ pieces of Bwed art with persistent visitor upvotes, search, filtering, and one-click high-res downloads.
5. **Official Bakery Soundtrack**: An embedded 7-track lo-fi OST player with play/pause, volume control, and mute toggles.
6. **Visitor Clicker**: A discreet interactive Bwed counter displaying *"{X} Bwed was here"* with spring physics and crumb particles.

---

## Official Links

- **Dexscreener Chart**: [Live Solana Chart](https://dexscreener.com/solana/bnttpswsrsvl2dphptsuqkkujbr8fprtb2ejrfbhgjev)
- **Pump.fun**: [Coin Overview](https://pump.fun/coin/5nfDdZFMsDz34y6p1PAm1yN4FpXrGjFRj2V48dgPpump?clip=20261023_161922%3A2605966_20261023_161852)
- **Telegram Community**: [Join Bwed Telegram](https://t.me/+wK2gsh6QGrk2N2Nh)

---

## Project Structure

```text
bwed/
├── 00_DOCUMENTATION/          # Lore bibles, design tokens, and style guides
├── 01_CANON_BWED/             # Official 2D & 3D hero renders and turnarounds
├── 02_WORLD_AND_STORIES/      # Narrative comics, adventures, and backstories
├── 03_MEMES_AND_SOCIAL/       # High-res community meme archive & fan art
├── 04_ANIMATION_AND_VIDEO/    # Motion assets, animations, and video clips
├── 05_PHYSICAL_AND_MERCH/     # Vinyl toy and merchandise concept designs
├── 06_BRAND_AND_HUB/
│   └── 03_HUB_SITE/           # Production web application (Hub & Game)
│       ├── assets/            # 3D GLB pawns, buildings, textures, and music
│       ├── index.html         # Main Bwedverse Hub landing page
│       ├── styles.css         # Custom dark-bakery & gold visual design
│       ├── app.js             # Interactive showcase, clicker & MemeDepot logic
│       ├── depot-data.js      # Meme catalog and building definitions
│       ├── party-board.html   # Crumb Run 3D board game
│       ├── party-board.css    # Board game HUD and mini-game styling
│       └── party-board.js     # Three.js board engine & turn sequence
├── 07_3D_MODEL/               # Source GLB 3D pawns, buildings, and props
├── index.html                 # Root redirect bridge
├── vercel.json                # Vercel deployment routing and cache rules
└── README.md
```

---

## Local Development

Run any static HTTP server from the root of the repository:

```bash
# Using Python 3
python3 -m http.server 4173
```

Then visit:
- Hub Page: `http://localhost:4173/` or `http://localhost:4173/06_BRAND_AND_HUB/03_HUB_SITE/`
- Crumb Run 3D: `http://localhost:4173/06_BRAND_AND_HUB/03_HUB_SITE/party-board.html`

---

## Deployment on Vercel

This repository is preconfigured for automatic deployment on Vercel.

### Option A: Root Import (Recommended)
1. Import the repository in your Vercel dashboard.
2. Leave the **Root Directory** as `./`.
3. Framework preset: **Other** (no build command needed).
4. `vercel.json` will automatically route visitors to the Hub and Board Game.

### Option B: Subdirectory Import
1. Set the **Root Directory** in Vercel to `06_BRAND_AND_HUB/03_HUB_SITE`.
2. Framework preset: **Other**.
3. Deploy!

---

## License & Community

Created with love for the Bwed community. Keep the slice alive.
