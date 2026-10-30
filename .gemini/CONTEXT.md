# Spatial AR Network — Project Memory

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
- **Env var:** `VITE_GOOGLE_MAPS_API_KEY` set in Vercel (Production + Preview, saved as Config type not Sensitive — Vercel requires this for `VITE_` prefixed vars). Used by virtual mode for Google Map Tiles API.
- **Local dev:** `.env.local` (git-ignored) holds the same key locally
- **HTTPS:** Vite dev server uses `@vitejs/plugin-basic-ssl` for self-signed certs (phone cameras require secure context)

## Current Status (as of 2026-10-30)

### ✅ Completed
- Sticker MVP (tasks 1–9): MindAR tracking, custom sticker target, helicopter flyover, HUD, Vercel deploy
- On-site GPS mode (task 10): Built & verified in simulation. Lock error < 1px. LocAR.js not used (three.js version conflict)
- Virtual mode (task 11): Built & verified locally and in production. Custom Qutub Minar model for Mehrauli (no Google 3D coverage). Eiffel Tower uses Google's photorealistic tiles as reference
- All 6 commits pushed and deployed to Vercel — all three modes live and tested
- Qutub coordinates confirmed: 28.52443, 77.18546 (±2m from satellite check)
- **Expanded Landmark Registry**: Added 14 global & Indian pilot landmarks (Qutub Minar, DLF CyberHub, India Gate, Taj Mahal, Eiffel Tower, Big Ben, Colosseum, Statue of Liberty, Empire State Building, Space Needle, Tokyo Tower, Burj Khalifa, Marina Bay Sands, Sydney Opera House). Added regional optgroup pickers to both `virtual.html` and `geo.html`, with two-way cross linking (`?landmark=<id>`).

### 🔜 Next Steps (from ROADMAP.md — Product Vision)
1. **Field test at Qutub Minar** — on-site GPS mode needs real-world verification
2. **Verified lock** — combine GPS proximity + camera image match against reference photos + user tap
3. **Frozen lock** — GPS jitter no longer moves content after lock
4. **Locked screen view** — when phone looks away from landmark, auto-switch to virtual 3D model; switch back to camera overlay when pointed at it
5. **Social layer** (vision) — people leave drops at landmarks in a shared database, visible on-site and virtually

## Key Files to Know

| File | Purpose |
|------|---------|
| `vite.config.js` | Multi-page build, HTTPS dev server, chunk splitting |
| `src/landmarks.js` | Landmark registry (coordinates, height) |
| `src/experience.js` | Shared AR experience (halo, beacon, helicopter) in metres |
| `src/app.js` | Sticker mode: MindAR tracking, FLYOVER config, HUD |
| `src/geo.js` | On-site GPS mode: GPS, gyro, tap-to-lock |
| `src/virtual.js` | Virtual mode: Google 3D tiles, orbit, landmark picker |
| `src/models/qutub-minar.js` | Procedural 3D Qutub Minar model |
| `docs/ROADMAP.md` | Task plan and status |
| `docs/GTM_PLAYBOOK.md` | Go-to-market playbook |
| `docs/DELHI_NCR_PILOT_GUIDE.md` | Field guide for Delhi-NCR pilot |
| `assets/targets/qutub-sticker.png` | Printable sticker artwork |

## Design Principle

Define content once in real-world coordinates (lat/lng/altitude) and render it three ways — sticker miniature, on-site GPS, and virtual twin.

## Tech Stack

- **Three.js** — 3D rendering
- **MindAR.js** — image tracking (WebAssembly + TensorFlow.js)
- **Google Map Tiles API** — photorealistic 3D tiles (virtual mode)
- **Vite** — build tooling
- **Vercel** — hosting & CI/CD
- **Node.js 18+** required

