# Bwed Hub & Crumb Run — Party & BwedWare Edition

This folder contains the static Bwedverse Hub (`index.html`) and **Crumb Run — BWED Party** (`party-board.html`), a 3D Mario Party board game combined with frantic 5-second WarioWare micro-games.

## What is included

- **17 Playable 3D GLB Pawns** in [`assets/pawns/`](file:///Users/eutelion/Desktop/bwed/06_BRAND_AND_HUB/03_HUB_SITE/assets/pawns), each with a custom role, lore description and once-per-party **Bakery Talent**.
- **Human & CPU Bot Support**: Toggle any slot between `HUMAN` and `CPU BOT` for solo play, couch co-op, or mixed parties (2 to 6 players), plus a 1-click **Randomize Party** button.
- **Rich 3D Bakery Grand Prix Board**:
  - Animated centerpiece **Retro Toaster** with popping Bwed toast slices, butter sticks, bread loaves, jam jars, and a 3D tumbling Dice Block.
  - 6 Mario Party tile types: `START` (+3c), `+2c` Fresh Crumb, `SHOP` (Bakery Boutique with 4 power-up items), `?` Mystery Portal, `VS` Instant BwedWare Micro-game, and `🔥` Hot Toaster Risk.
  - **★ Golden Crumb Jackpot** with rotating halo and distance tracker in the HUD.
  - **End-of-Game Bonus Stars** (*Rich Baker*, *BwedWare Champ*, *Chaos Explorer*) awarded during the Final Feast.
- **6 Fast-Paced WarioWare Micro-Games (`BWEDWARE`)**:
  - Triggered automatically at the end of every round, on `VS` tiles, via the in-game `⚡ PLAY BWEDWARE` button, or directly from the main menu in **BwedWare Rush** mode:
    1. `TOASTER REFLEX` — *Pop in Green!*
    2. `CRUMB FRENZY` — *Catch Crumbs!*
    3. `SOLANA ROCKET` — *Mash Space / Click!*
    4. `WHACK-A-BWED` — *Tap the Bweds!*
    5. `BUTTER SPREAD` — *Butter the Slice!*
    6. `BWED DETECTIVE` — *Find the Target!*
- **WebAudio Synthesizer (`BwedSoundEngine`)**: Procedural sound effects for dice, hops, coins, burns, stars, and WarioWare jingles.

## Run locally

From the Bwed project root:

```bash
python3 -m http.server 4173
```

Then open:
- Hub: `http://localhost:4173/06_BRAND_AND_HUB/03_HUB_SITE/`
- Crumb Run 3D Party: `http://localhost:4173/06_BRAND_AND_HUB/03_HUB_SITE/party-board.html`
