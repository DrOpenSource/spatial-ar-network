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
├── index.html                   # Zero-install WebAR client (Mobile camera stream + 3D layer)
├── package.json                 # Dev server setup (Vite)
├── vite.config.js               # HTTPS local dev server config for mobile camera testing
├── src/
│   ├── app.js                   # WebAR tracking, 3D entity loading & dynamic CTA overlays
│   └── style.css                # Glassmorphic HUD overlay & mobile responsive controls
├── assets/
│   ├── models/                  # 3D GLB/GLTF assets (Draco-compressed < 3.5 MB)
│   │   └── sample_hologram.json # Sample holographic asset definition
│   └── targets/                 # Compiled MindAR target markers (.mind files)
│       └── README.md            # How to compile QR stickers into .mind tracking targets
└── docs/
    ├── GTM_PLAYBOOK.md          # Complete Speculative Brand Hijack & Reverse-Pitch Playbook
    └── DELHI_NCR_PILOT_GUIDE.md # Step-by-step guide to run the ₹300 pilot in Delhi-NCR
```

---

## 🚀 Quick Start (Local Development)

### 1. Install & Run
```bash
npm install
npm run dev
```

### 2. Testing on Mobile Device (Camera Access requires HTTPS / LAN)
* Open the local IP URL shown in the terminal (e.g., `https://192.168.1.X:5173`) on your smartphone connected to the same Wi-Fi network.
* Accept the camera permission prompt.
* Point your camera at the target marker in `assets/targets/marker_sample.png` to watch the 3D hologram erupt in real time.

---

## 🎯 The First Pilot: Delhi-NCR (CyberHub & Qutub Minar)

Check [docs/DELHI_NCR_PILOT_GUIDE.md](docs/DELHI_NCR_PILOT_GUIDE.md) for the exact step-by-step instructions to print the sticker, record the satellite-to-street video, and execute the viral social drop.
