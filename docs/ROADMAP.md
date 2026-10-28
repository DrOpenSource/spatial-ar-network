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
| 9 | Decide on brand/location risks (unlicensed brand use in GTM playbook; ASI rules at Qutub Minar) | 🟡 Needs owner decision |

## Landmark lock-on (after 6–8)

There is currently no web-based VPS (8th Wall's hosting ends Feb 2027 and its open-source release
excludes VPS), so centimetre-accurate lock-on to the real tower requires a native app. These two
tasks get as close as possible in the browser.

| # | Task | Notes |
|---|---|---|
| 10 | **On-site GPS mode**: content placed at the minaret's coordinates using GPS + compass ([LocAR.js](https://www.npmjs.com/package/locar)), with a "line up the top of the Minar and tap" calibration to cancel compass error | Best for large, sky-scale content (e.g. helicopter orbiting ~100 m up). Check LocAR's three.js version against MindAR's `<0.162` constraint — may need a separate page. iOS needs motion/orientation permission. Confirm exact tower coordinates on a map. |
| 11 | **Virtual digital-twin mode**: same content rendered over Google Photorealistic 3D Tiles at the Qutub coordinates, viewable from anywhere | First confirm 3D Tiles coverage for Mehrauli; needs a Map Tiles API key and Google attribution. Possibly reuse the God's Eye View project. |

Design principle for 10–11: define content once in real-world coordinates (lat/lng/altitude) and
render it three ways — sticker miniature, on-site GPS, and virtual twin.
