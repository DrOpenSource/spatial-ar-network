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
├── index.html                    # WebAR client: camera view + glassmorphic HUD
├── vite.config.js                # Dev/preview server with self-signed HTTPS (needed for phone cameras)
├── src/
│   ├── app.js                    # MindAR tracking, helicopter flyover (FLYOVER config), HUD actions
│   └── style.css                 # HUD styling
├── public/                       # Served as-is and copied into builds
│   ├── models/                   # 3D GLB models + attribution (CC BY 4.0, see its README)
│   └── targets/qutub.mind        # Compiled tracking target for the Qutub sticker
├── assets/targets/
│   ├── qutub-sticker.png         # Printable sticker artwork (3×3 in @ 300 DPI)
│   └── README.md                 # How targets work, custom designs, QR code, printing tips
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

### 3. Customise
* **Sticker:** see [assets/targets/README.md](assets/targets/README.md). After any artwork change run `npm run target`.
* **3D model:** edit the `FLYOVER` block at the top of [src/app.js](src/app.js) (model file, credit, size, orbit, speed).

### 4. Production build
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
