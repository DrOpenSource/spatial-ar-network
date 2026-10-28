# 🌐 Living Landmarks: Spatial AR Network
> **Zero-Install WebAR & Speculative Brand Hijack Engine**  
> Turn the world's most iconic physical landmarks into interactive, high-footfall 3D spatial media.

---

## ⚡ Overview

**Spatial AR Network** is a browser-native WebAR platform that transforms iconic physical real estate (heritage wonders, tourist overlooks, high-footfall commercial districts) into an augmented digital canvas.

* **Zero App Download**: Runs directly inside mobile Safari & Chrome using [MindAR.js](https://github.com/hiukim/mind-ar-js) (Open Source, WebAssembly + TensorFlow.js).
* **Speculative Brand Engine**: We feature recognizable global brands (Nike, LEGO, Red Bull, Apple) at iconic landmarks without upfront red tape—using viral UGC and social media reverse pitches to land six-figure partnerships.
* **Bootstrapped Cost**: Under **₹300 – ₹500 ($4 – $6)** to pilot locally in Delhi-NCR (Qutub Minar / DLF CyberHub).

---

## 📁 Repository Structure

```
spatial-ar-network/
├── index.html                    # Sticker mode: image-tracked AR on the Qutub sticker
├── geo.html                      # On-site mode: GPS + tap-to-lock AR on the real Minar
├── virtual.html                  # Virtual mode: experience over Google 3D tiles of the real place
├── vite.config.js                # Dev/preview server with self-signed HTTPS (needed for phone cameras)
├── src/
│   ├── app.js                    # Sticker mode: MindAR tracking, FLYOVER config, HUD actions
│   ├── geo.js                    # On-site mode: GPS, gyro, tap-to-lock calibration
│   ├── virtual.js                # Virtual mode: Google 3D tiles, ground alignment, orbit controls
│   ├── landmarks.js              # Landmark registry (name, coordinates, height)
│   ├── experience.js             # Shared landmark experience (halo, beacon, helicopter) in metres
│   ├── flyover.js                # Shared helicopter orbit
│   ├── models/qutub-minar.js     # Our 3D Qutub Minar (where Google has no 3D coverage)
│   └── style.css                 # HUD styling
├── public/                       # Served as-is and copied into builds
│   ├── models/                   # 3D GLB models + attribution (CC BY 4.0, see its README)
│   └── targets/qutub.mind        # Compiled tracking target for the Qutub sticker
├── assets/targets/
│   ├── qutub-sticker.png         # Printable sticker artwork (3×3 in @ 300 DPI)
│   └── README.md                 # How targets work, custom designs, QR code, printing tips
├── patches/                      # mind-ar+1.2.5.patch: MindAR fix for three.js ≥ 0.162 (applied on npm install)
├── tools/
│   ├── generate-sticker.mjs      # Draws the sticker artwork  (npm run sticker)
│   └── compile-target.mjs        # Compiles PNG → .mind offline (npm run target)
└── docs/
    ├── ROADMAP.md                # Task plan and status
    ├── GTM_PLAYBOOK.md           # Go-to-market playbook
    └── DELHI_NCR_PILOT_GUIDE.md  # Field guide for the Delhi-NCR pilot
```

---

## 🚀 Quick Start (Local Development)

### 1. Install & run
```bash
npm install
npm run dev
```
Requires Node.js 18+. The dev server runs over HTTPS with a self-signed certificate.

### 2. Test on your phone
1. Connect the phone to the same Wi-Fi as your computer.
2. Open the **Network** URL printed in the terminal (e.g. `https://192.168.1.X:5173`).
3. Accept the certificate warning (Chrome: *Advanced → Proceed*; Safari: *Show Details → visit this website*), then allow camera access.
4. Point the camera at [`assets/targets/qutub-sticker.png`](assets/targets/qutub-sticker.png) — printed, or open full-screen on your computer — from about 20–30 cm.
5. The badge turns **LOCKED** and a helicopter circles the minaret.

### 3. On-site mode (no sticker)
Open `/geo.html` on your phone near the Qutub Minar. Tap **Start AR**, allow camera, location and motion
access, put the crosshair on the very top of the tower, and tap **Lock on Minar**. The halo, beacon and
helicopter are then placed using GPS. Tap **Recalibrate** if it drifts.
Away from the Minar (more than 2 km), or with `/geo.html?demo`, it runs in demo mode: the Minar is placed
250 m ahead of wherever you aim, so you can try it at home.

### 4. Virtual mode (from anywhere)
Open `/virtual.html`: the same halo, beacon and helicopter over Google's real 3D map data. Drag to orbit,
pinch/scroll to zoom, and switch landmarks with the picker (or `?landmark=eiffel-tower`). Google has no 3D
buildings for Mehrauli, so the Qutub Minar is our own model (`src/models/qutub-minar.js`) standing on Google's
satellite ground; the Eiffel Tower uses Google's photorealistic 3D tiles. Needs a Google Maps Platform API key with the
**Map Tiles API** enabled, restricted to your site's URLs:
```bash
# .env.local (git-ignored). On Vercel, add the same variable under Project → Settings → Environment Variables
VITE_GOOGLE_MAPS_API_KEY=your-key
```

### 5. Customise
* **Sticker:** see [assets/targets/README.md](assets/targets/README.md). After any artwork change run `npm run target`.
* **3D model:** edit the `FLYOVER` block at the top of [src/app.js](src/app.js) (model file, credit, size, orbit, speed).

### 6. Production build
```bash
npm run build     # outputs dist/
npm run preview   # serves dist/ over HTTPS on your LAN
```

---

## 📜 Licensing

Source code is MIT (see [LICENSE](LICENSE)). The 3D models in `public/models/` are third-party works under
CC BY 4.0 — see [public/models/README.md](public/models/README.md); the active model's credit is shown in the app.

---

## 🎯 The First Pilot: Delhi-NCR (CyberHub & Qutub Minar)

Check [docs/DELHI_NCR_PILOT_GUIDE.md](docs/DELHI_NCR_PILOT_GUIDE.md) for the exact step-by-step instructions to print the sticker, record the satellite-to-street video, and execute the viral social drop.
