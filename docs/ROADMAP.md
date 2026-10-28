# Roadmap

Status as of 2026-10-28.

## Sticker MVP

| # | Task | Status |
|---|---|---|
| 1 | Load MindAR + three.js as ES modules (fix start-up crash) | ✅ Done |
| 2 | HTTPS dev/preview server for phone camera access | ✅ Done |
| 3 | Phone test with demo target | ✅ Done |
| 4 | Custom Qutub Minar sticker target + offline compile tooling | ✅ Done |
| 5 | GLB helicopter flyover around the sticker's minaret | ✅ Done |
| 6 | Repo cleanup: README, LICENSE, HUD copy, honest CTA messages | ✅ Done |
| 7 | Verify production build (`npm run build` / `preview`) | ✅ Done |
| 8 | Deploy to Vercel (https://spatial-ar-network.vercel.app, auto-deploys from main); QR code on the sticker | ✅ Done |
| 9 | Decide on brand/location risks | ✅ Decided: on-site activations use GPS mode (task 10), so nothing is placed on the monument. Open items: a commercial promo shoot inside the ticketed complex may need ASI filming permission; GTM playbook brand wording left as-is by owner choice |

## Landmark lock-on (after 6–8)

There is currently no web-based VPS (8th Wall's hosting ends Feb 2027 and its open-source release
excludes VPS), so centimetre-accurate lock-on to the real tower requires a native app. These two
tasks get as close as possible in the browser.

| # | Task | Notes |
|---|---|---|
| 10 | **On-site GPS mode** (`geo.html`): GPS position + gyroscope orientation, with a "line up the top of the Minar and tap Lock" calibration that fixes the heading (no compass, so magnetic interference can't skew it). Auto demo mode beyond 2 km, or with `?demo` | ✅ Built and verified in simulation (lock error < 1 px). 🟡 Needs a field test at the Minar. LocAR.js was not used: it now hard-depends on three.js 0.181, which conflicts with MindAR. Tower coordinates (28.52440, 77.18550) are from OpenStreetMap; confirm on satellite imagery. |
| 11 | **Virtual digital-twin mode**: same content rendered over Google Photorealistic 3D Tiles at the Qutub coordinates, viewable from anywhere | First confirm 3D Tiles coverage for Mehrauli; needs a Map Tiles API key and Google attribution. Possibly reuse the God's Eye View project. |

Design principle for 10–11: define content once in real-world coordinates (lat/lng/altitude) and
render it three ways — sticker miniature, on-site GPS, and virtual twin.
