# Sticker Targets

MindAR doesn't "see" a picture — it finds **feature points** (sharp corners, high-contrast details)
and stores their layout in a compiled `.mind` file. When the camera sees the same layout, the 3D
content is anchored to it. Every target therefore has two files:

| File | Purpose |
|---|---|
| `assets/targets/qutub-sticker.png` | The artwork you print (900×900 px = 3×3 in @ 300 DPI) |
| `public/targets/qutub.mind` | Its compiled feature fingerprint, loaded by `src/app.js` |

> **Golden rule:** after *any* change to the PNG, recompile the `.mind` file. A stale `.mind` won't track.

## Commands

```bash
npm run sticker   # regenerate the artwork (QR → https://spatial-ar-network.vercel.app)
npm run target    # compile assets/targets/qutub-sticker.png → public/targets/qutub.mind
```

`npm run target` prints feature-point counts. For reference, MindAR's own demo card scores
~600 matching points; the Qutub sticker scores ~4,000. Below ~300, expect slow or flaky detection.

## The QR code

The bottom-right QR opens the live app, so people can scan it with their normal camera app first.
It is drawn by the generator (error correction H, so it survives scuffs and glare). If the URL
changes, update the `--url` in the `sticker` script in `package.json`, then run `npm run sticker`
and `npm run target`. A ready-made QR image also works: `--qr path/to/qr.png`.

## Using your own design instead

Design it in Canva/Figma, export a PNG, save it over `assets/targets/qutub-sticker.png`, and run
`npm run target`. What makes a design track well:

- ✅ Dense detail everywhere: edges, corners, varied shapes, text
- ✅ Strong light/dark contrast (tracking runs in greyscale — two colours of similar brightness look identical)
- ✅ Asymmetric, so it looks different when rotated
- ❌ Large plain areas, soft gradients, blurry photos
- ❌ Repeating patterns (grids, stripes, tiled wallpaper) — and a bare QR code is exactly that, so
  only ever use a QR *inside* a detailed design

## Printing & scanning

- Print **matte** (glossy vinyl reflects light and hides features).
- Detection needs the sticker to fill roughly **a third of the camera frame's width**. At 3×3 in
  that means scanning from ≤ ~30 cm; a 5×5 in print works from ~50 cm. Bigger prints scan from further away.
- Testing without printing: open the PNG full-screen on a laptop and point your phone at it.
