# Spatial AR Network — Project Context

> Last updated: 2026-10-29

## What This Project Is

**Spatial AR Network** is a zero-install WebAR platform that turns iconic physical landmarks into interactive 3D spatial media. Built with MindAR.js + Three.js, it runs directly in mobile browsers — no app download required.

**Repo:** https://github.com/DrOpenSource/spatial-ar-network
**Live site:** https://spatial-ar-network.vercel.app/

## Three Modes (All Live & Working)

| Mode | Entry Point | Description |
|------|-------------|-------------|
| **Sticker** | `index.html` → `src/app.js` | Image-tracked AR on a printed Qutub Minar sticker using MindAR |
| **On-site GPS** | `geo.html` → `src/geo.js` | GPS + gyro + tap-to-lock calibration at the real landmark. Demo mode beyond 2 km or with `?demo` |
| **Virtual** | `virtual.html` → `src/virtual.js` | Google 3D Map Tiles with orbit controls, landmark picker. Works from anywhere |

## Architecture

- **Shared landmark registry:** `src/landmarks.js` (name, coordinates, height)
- **Shared experience:** `src/experience.js` (halo, beacon, helicopter — defined once in metres)
- **Shared flyover:** `src/flyover.js` (helicopter orbit logic)
- **Custom 3D model:** `src/models/qutub-minar.js` (procedural, because Google has no 3D buildings for Mehrauli)
- **Build:** Vite multi-page (`index.html`, `geo.html`, `virtual.html`) via `vite.config.js`
- **Patches:** `patches/mind-ar+1.2.5.patch` fixes MindAR for Three.js ≥ 0.162 (applied on `npm install` via patch-package)

## Deployment

- **Host:** Vercel, auto-deploys from `main` branch
- **Env var:** `VITE_GOOGLE_MAPS_API_KEY` set in Vercel (Production + Preview, saved as Config type not Sensitive). Used by virtual mode for Google Map Tiles API.
- **Local dev:** `.env.local` (git-ignored) holds the same key locally
- **HTTPS:** Vite dev server uses `@vitejs/plugin-basic-ssl` for self-signed certs (phone cameras require secure context)

## Current Status (as of 2026-10-31)

### Completed
- Sticker MVP (tasks 1–9): MindAR tracking, custom sticker target, helicopter flyover, HUD, Vercel deploy
- On-site GPS mode (task 10): Built & verified in simulation. Lock error < 1px
- Virtual mode (task 11): Built & verified locally and in production. Custom Qutub Minar model for Mehrauli (no Google 3D coverage). Eiffel Tower uses Google's photorealistic tiles as reference
- All commits pushed and deployed to Vercel — all three modes live and tested
- Qutub coordinates confirmed: 28.52443, 77.18546 (±2m from satellite check)
- **Expanded Landmark & Hotspot Registry (22 Locations)**: Added 22 global landmarks and high-footfall street/action brand hijack hotspots. Updated `docs/GTM_PLAYBOOK.md` with creative 3D AR projection strategies for target brands (Red Bull, Nike, PlayStation, Burger King, Vans, etc.).
- **Two-Tier Country -> Landmark Pickers**: Replaced giant 22-item single dropdown with a clean two-tier Country -> Landmark selector on both `virtual.html` and `geo.html`. In-memory landmark hot-swapping in `geo.html` (prevents camera drops and gyro resets).
- **Realistic Spy/Recon Satellite Zoom Dive (`virtual.html`)**: Replaced the opaque 2D loading screen with an authentic 3D satellite reconnaissance dive. Camera starts high in the stratosphere/orbit (15,000m–25,000m) and executes a cinematic deceleration dive into the landmark. Features a transparent optical HUD with tactical corner sensors, live dynamic altitude counting (`ALT: 180,000 M` -> `180 M`), real-time optical zoom factor (`1.0X` -> `48.0X`), scanning laser line, and clamping target brackets that lock in neon green (`[ TARGET LOCKED ]`). Supports in-memory hot-swapping across all landmarks and instant tap-to-skip.
- **Locked Screen View (Smart View-Switching)**: Built into `geo.html`. When phone turns away from the landmark (> 42° off-target), camera video blurs and 3D digital twin model appears with dynamic turn radar (`←/→ TURN X° TO LANDMARK`). Snaps back to live camera AR when facing the landmark (< 30°). Also includes manual toggles (Auto View / Camera AR / 3D Twin).
- **Google 3D Photorealistic Tiles Coverage Audit**: Identified true 3D photogrammetric building meshes (16 locations across US, UK, France, Italy, Germany, Japan, Australia) vs. 2D satellite orthophotos on terrain (6 locations: India, UAE, Singapore).
- **GTM Speculative Brand Drops Engine (`src/assets.js`, `src/audio.js`)**: Built the flagship **Shibuya Scramble $\leftrightarrow$ PlayStation Cyber-Titan Boss Raid** drop. Features an articulated 45-meter bipedal mech standing directly on the Tokyo crosswalk street mesh with skeletal animations (`Idle`, `Jump`, `Punch`).
- **Interactive Stunt & Shockwave Engine**: Tap anywhere on the 3D model or click `⚡ TRIGGER BOSS RAID` to trigger a jump/stomp sequence, expanding a 120m neon ground shockwave across Google's 3D Tokyo buildings with synthesized Web Audio sub-bass rumbles and laser sound effects. Also includes the 35m Nike Kinetic Spatial Sneaker (`shoe.glb`) and Red Bull Aerobatic Stunt Racer (`stunt-plane`).
- **One-Tap Viral AR Capture (`virtual.html`, `geo.html`)**: Added a `📸 CAPTURE DROP` button that renders a high-res social media snapshot watermarked with GPS coordinates, landmark name, and official brand campaign kicker for TikTok, Instagram Reels, and X sharing.

### Next Steps (from docs/ROADMAP.md — Product Vision)
1. **Field test at Qutub Minar** — on-site GPS mode needs real-world verification
2. **Verified lock** — combine GPS proximity + camera image match against reference photos + user tap
3. **Frozen lock** — GPS jitter no longer moves content after lock
4. **Social layer** (vision) — people leave drops at landmarks in a shared database, visible on-site and virtually

## Key Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Multi-page build, HTTPS dev server, chunk splitting |
| `src/landmarks.js` | Landmark registry (coordinates, height, defaultAsset) |
| `src/assets.js` | Modular 3D asset catalog & procedural Three.js generators |
| `src/admin.js` | Admin Spec Studio drawer (live asset & brand color tuner) |
| `src/experience.js` | Shared AR experience (halo, beacon, asset flyover) in metres |
| `src/app.js` | Sticker mode: MindAR tracking, FLYOVER config, HUD |
| `src/geo.js` | On-site GPS mode: GPS, gyro, tap-to-lock |
| `src/virtual.js` | Virtual mode: Google 3D tiles, orbit, landmark picker |
| `src/models/qutub-minar.js` | Procedural 3D Qutub Minar model |
| `docs/ROADMAP.md` | Task plan and status |
| `docs/GTM_PLAYBOOK.md` | Go-to-market playbook |
| `docs/DELHI_NCR_PILOT_GUIDE.md` | Field guide for Delhi-NCR pilot |

## Design Principle

Define content once in real-world coordinates (lat/lng/altitude) and render it three ways — sticker miniature, on-site GPS, and virtual twin.

## Tech Stack

- **Three.js** — 3D rendering
- **MindAR.js** — image tracking (WebAssembly + TensorFlow.js)
- **Google Map Tiles API** — photorealistic 3D tiles (virtual mode)
- **Vite** — build tooling
- **Vercel** — hosting & CI/CD
- **Node.js 18+** required

## Commands

```bash
npm install          # Install dependencies (also applies MindAR patch)
npm run dev          # HTTPS dev server on :5173
npm run build        # Production build → dist/
npm run preview      # Serve dist/ over HTTPS
npm run sticker      # Regenerate sticker artwork
npm run target       # Recompile .mind tracking target from PNG
```

