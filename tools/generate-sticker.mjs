/**
 * Generate the Qutub Minar sticker artwork used as the MindAR image target.
 *
 *   node tools/generate-sticker.mjs [output.png] [--url https://…] [--qr qr.png]
 *
 * Output is 900x900 px = 3x3 inch at 300 DPI. The design is deliberately dense, high-contrast
 * and asymmetric (what MindAR's feature tracker needs). The bottom-right corner holds a QR code
 * drawn from --url (or a ready-made image via --qr); with neither, a marked placeholder.
 * Recompile the .mind target after ANY change to the artwork.
 */

import fs from 'node:fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';

const SIZE = 900;
const FRAME = 34;
const QR_BOX = { x: 612, y: 612, size: 250 };

const COLORS = {
  ink: '#2b120c',       // deep brown-black (outlines, text)
  red: '#a33a1e',       // red sandstone
  sand: '#d0703f',      // light sandstone
  cream: '#f4e6c8',     // marble / background
  white: '#ffffff'
};

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const qrUrl = flag('--url');
const qrPath = flag('--qr');
const outPath = args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) ?? 'assets/targets/qutub-sticker.png';

// Bold system fonts give the title crisp corners; fall back to the default sans if missing
const FONT_DIR = 'C:/Windows/Fonts';
let titleFont = 'sans-serif';
let labelFont = 'sans-serif';
if (fs.existsSync(`${FONT_DIR}/ariblk.ttf`)) {
  registerFont(`${FONT_DIR}/ariblk.ttf`, { family: 'StickerTitle' });
  titleFont = 'StickerTitle';
}
if (fs.existsSync(`${FONT_DIR}/arialbd.ttf`)) {
  registerFont(`${FONT_DIR}/arialbd.ttf`, { family: 'StickerLabel' });
  labelFont = 'StickerLabel';
}

// Seeded PRNG so the same script always produces the same sticker (and the same .mind)
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rand = mulberry32(1199);
const between = (min, max) => min + rand() * (max - min);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

const insideQrBox = (x, y, pad = 0) =>
  x > QR_BOX.x - pad && y > QR_BOX.y - pad;

// 8-point star (two overlapping squares), the classic Indo-Islamic tile motif
const star8 = (x, y, r, rotation, fill) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = fill;
  for (const offset of [0, Math.PI / 4]) {
    ctx.save();
    ctx.rotate(offset);
    ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
    ctx.restore();
  }
  ctx.fillStyle = COLORS.cream;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawBackground = () => {
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Scattered, non-repeating motifs: varied size, rotation and shape so no two regions look alike
  for (let i = 0; i < 420; i++) {
    const x = between(FRAME, SIZE - FRAME);
    const y = between(FRAME, SIZE - FRAME);
    if (insideQrBox(x, y, 20)) continue;
    const r = between(5, 26);
    const color = pick([COLORS.red, COLORS.sand, COLORS.ink, COLORS.red]);
    const kind = rand();
    if (kind < 0.45) {
      star8(x, y, r, between(0, Math.PI), color);
    } else if (kind < 0.7) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(between(0, Math.PI));
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.55, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.55, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } else if (kind < 0.88) {
      ctx.strokeStyle = color;
      ctx.lineWidth = between(2, 5);
      ctx.beginPath();
      const start = between(0, Math.PI * 2);
      ctx.arc(x, y, r, start, start + between(Math.PI * 0.6, Math.PI * 1.5));
      ctx.stroke();
    } else {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

// Sun disc with broken rings, behind the minaret's upper storeys
const drawSun = () => {
  const cx = 560;
  const cy = 210;
  for (let i = 0; i < 26; i++) {
    const angle = between(0, Math.PI * 2);
    const len = between(150, 200);
    const spread = between(0.04, 0.09);
    ctx.fillStyle = i % 3 === 0 ? COLORS.ink : COLORS.sand;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle - spread) * 120, cy + Math.sin(angle - spread) * 120);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.lineTo(cx + Math.cos(angle + spread) * 120, cy + Math.sin(angle + spread) * 120);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.arc(cx, cy, 125, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 6;
  ctx.stroke();

  for (const radius of [100, 78, 56, 36]) {
    ctx.strokeStyle = COLORS.cream;
    ctx.lineWidth = between(4, 8);
    let a = between(0, Math.PI * 2);
    const end = a + Math.PI * 2;
    while (a < end) {
      const seg = between(0.3, 1.2);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, a, Math.min(a + seg, end));
      ctx.stroke();
      a += seg + between(0.12, 0.45);
    }
  }
};

// Abstract inscription band: irregular marks evoking the minaret's carved bands (not real script)
const inscriptionBand = (left, right, top, height) => {
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(left, top, right - left, height);
  ctx.fillStyle = COLORS.ink;
  let x = left + 3;
  while (x < right - 6) {
    const w = between(2, 7);
    const h = between(height * 0.25, height * 0.85);
    const kind = rand();
    if (kind < 0.55) {
      ctx.fillRect(x, top + height - h - 2, w, h);
    } else if (kind < 0.8) {
      ctx.fillRect(x, top + height * 0.55, w * 2.2, 3);
      x += w;
    } else {
      ctx.beginPath();
      ctx.arc(x + 3, top + between(4, height - 4), 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    x += w + between(2, 6);
  }
};

// One storey of the minaret: tapered shaft with flutes, an inscription band and a balcony on top
const drawStorey = ({ yBottom, yTop, wBottom, wTop, cx, flute, marble }) => {
  const bodyColor = marble ? COLORS.cream : COLORS.red;
  const fluteColor = marble ? COLORS.sand : COLORS.ink;

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.moveTo(cx - wBottom / 2, yBottom);
  ctx.lineTo(cx - wTop / 2, yTop);
  ctx.lineTo(cx + wTop / 2, yTop);
  ctx.lineTo(cx + wBottom / 2, yBottom);
  ctx.closePath();
  ctx.fill();

  // Flutes: 'angular' gives chevrons, 'round' gives arched lobes, 'mixed' alternates (like the ground storey)
  const count = 7;
  for (let i = 0; i < count; i++) {
    const t0 = i / count;
    const t1 = (i + 1) / count;
    const xb0 = cx - wBottom / 2 + wBottom * t0;
    const xb1 = cx - wBottom / 2 + wBottom * t1;
    const xt0 = cx - wTop / 2 + wTop * t0;
    const xt1 = cx - wTop / 2 + wTop * t1;
    const style = flute === 'mixed' ? (i % 2 ? 'angular' : 'round') : flute;
    ctx.fillStyle = fluteColor;
    if (style === 'angular') {
      ctx.beginPath();
      ctx.moveTo(xb0 + (xb1 - xb0) * 0.5, yBottom);
      ctx.lineTo(xb1, yBottom);
      ctx.lineTo(xt1, yTop);
      ctx.lineTo(xt0 + (xt1 - xt0) * 0.5, yTop);
      ctx.closePath();
      ctx.fill();
      // chevrons across the shadowed face
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = 2;
      for (let y = yTop + between(6, 16); y < yBottom - 6; y += between(14, 26)) {
        const f = (y - yTop) / (yBottom - yTop);
        const xl = xt0 + (xb0 - xt0) * f;
        const xr = xt1 + (xb1 - xt1) * f;
        const xm = (xl + xr) / 2;
        ctx.beginPath();
        ctx.moveTo(xm, y);
        ctx.lineTo(xr - 1, y + 6);
        ctx.stroke();
      }
    } else {
      ctx.fillRect(xb1 - 3, yTop, 3, yBottom - yTop);
      ctx.beginPath();
      for (let y = yTop + between(8, 20); y < yBottom - 10; y += between(22, 40)) {
        const f = (y - yTop) / (yBottom - yTop);
        const xl = xt0 + (xb0 - xt0) * f;
        const xr = xt1 + (xb1 - xt1) * f;
        ctx.moveTo(xr - 4, y);
        ctx.arc((xl + xr) / 2, y, (xr - xl) / 2 - 4, 0, Math.PI, true);
      }
      ctx.strokeStyle = fluteColor;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - wBottom / 2, yBottom);
  ctx.lineTo(cx - wTop / 2, yTop);
  ctx.moveTo(cx + wTop / 2, yTop);
  ctx.lineTo(cx + wBottom / 2, yBottom);
  ctx.stroke();

  // Inscription band a third of the way down
  const bandY = yTop + (yBottom - yTop) * between(0.25, 0.4);
  const f = (bandY - yTop) / (yBottom - yTop);
  const w = wTop + (wBottom - wTop) * f;
  inscriptionBand(cx - w / 2 + 2, cx + w / 2 - 2, bandY, 16);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - w / 2 + 2, bandY, w - 4, 16);

  // Balcony: muqarnas teeth underneath, a solid ledge, then a crenellated railing
  const ledgeW = wTop + 46;
  const ledgeY = yTop - 10;
  let x = cx - ledgeW / 2 + 6;
  let row = 0;
  while (x < cx + ledgeW / 2 - 6) {
    const tw = between(8, 14);
    ctx.fillStyle = row++ % 2 ? COLORS.ink : COLORS.sand;
    ctx.beginPath();
    ctx.moveTo(x, ledgeY + 10);
    ctx.lineTo(x + tw, ledgeY + 10);
    ctx.lineTo(x + tw / 2, ledgeY + 10 + between(12, 22));
    ctx.closePath();
    ctx.fill();
    x += tw;
  }
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(cx - ledgeW / 2, ledgeY, ledgeW, 12);
  x = cx - ledgeW / 2;
  while (x < cx + ledgeW / 2 - 4) {
    const mw = between(5, 9);
    ctx.fillRect(x, ledgeY - between(8, 13), mw, 10);
    x += mw + between(4, 8);
  }
};

const drawMinaret = () => {
  const cx = 250;
  const base = SIZE - FRAME - 40;
  // Storey heights shrink upward; lower three are red sandstone, upper two marble, as on the real tower
  const storeys = [
    { h: 210, flute: 'mixed', marble: false },
    { h: 160, flute: 'round', marble: false },
    { h: 125, flute: 'angular', marble: false },
    { h: 95, flute: 'round', marble: true },
    { h: 80, flute: 'angular', marble: true }
  ];
  const widthAt = (y) => 66 + (190 - 66) * ((y - 120) / (base - 120));

  // Plinth
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(cx - 135, base, 270, 18);
  ctx.fillStyle = COLORS.sand;
  for (let x = cx - 128; x < cx + 125; x += between(14, 26)) {
    ctx.fillRect(x, base + 4, between(6, 10), 10);
  }

  let y = base;
  for (const s of storeys) {
    const yTop = y - s.h;
    drawStorey({ yBottom: y, yTop, wBottom: widthAt(y), wTop: widthAt(yTop), cx, flute: s.flute, marble: s.marble });
    y = yTop - 14;
  }

  // Cupola and finial
  ctx.fillStyle = COLORS.ink;
  ctx.beginPath();
  ctx.arc(cx, y + 6, 30, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 3, y - 52, 6, 30);
  ctx.beginPath();
  ctx.arc(cx, y - 56, 7, 0, Math.PI * 2);
  ctx.fill();
};

const drawTitle = () => {
  const x = 432;
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(x - 10, 372, SIZE - FRAME - x - 12, 212);

  ctx.fillStyle = COLORS.cream;
  ctx.font = `64px ${titleFont}`;
  ctx.fillText('LIVING', x + 6, 438);
  ctx.fillStyle = COLORS.sand;
  ctx.font = `46px ${titleFont}`;
  ctx.fillText('LANDMARKS', x + 6, 492);

  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(x + 6, 508, 160, 4);
  ctx.fillRect(x + 176, 508, 60, 4);
  ctx.fillRect(x + 246, 508, 24, 4);

  ctx.font = `26px ${labelFont}`;
  ctx.fillText('QUTUB MINAR', x + 6, 546);
  ctx.fillStyle = COLORS.sand;
  ctx.font = `17px ${labelFont}`;
  ctx.fillText('MEHRAULI · NEW DELHI · SCAN ME', x + 6, 572);
};

const drawQrArea = async () => {
  const { x, y, size } = QR_BOX;
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 6;
  ctx.strokeRect(x, y, size, size);

  if (qrUrl) {
    // Draw modules directly on whole-pixel boundaries: crisp edges scan more reliably once printed.
    // Error correction H tolerates scuffs/glare on a sticker that lives outdoors.
    const { modules } = QRCode.create(qrUrl, { errorCorrectionLevel: 'H' });
    const quiet = 2;
    const cell = Math.floor((size - 28) / (modules.size + quiet * 2));
    const offset = Math.floor((size - cell * modules.size) / 2);
    ctx.fillStyle = '#000000';
    for (let r = 0; r < modules.size; r++) {
      for (let c = 0; c < modules.size; c++) {
        if (modules.get(r, c)) ctx.fillRect(x + offset + c * cell, y + offset + r * cell, cell, cell);
      }
    }
    return;
  }

  if (qrPath) {
    const qr = await loadImage(qrPath);
    ctx.drawImage(qr, x + 14, y + 14, size - 28, size - 28);
    return;
  }

  // Placeholder: dashed inner box, corner brackets and instructions
  ctx.setLineDash([12, 8]);
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 18, y + 18, size - 36, size - 36);
  ctx.setLineDash([]);
  ctx.lineWidth = 7;
  const c = 34;
  for (const [px, py, dx, dy] of [[x + 30, y + 30, 1, 1], [x + size - 30, y + 30, -1, 1], [x + 30, y + size - 30, 1, -1]]) {
    ctx.beginPath();
    ctx.moveTo(px, py + c * dy);
    ctx.lineTo(px, py);
    ctx.lineTo(px + c * dx, py);
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.red;
  ctx.font = `30px ${titleFont}`;
  ctx.textAlign = 'center';
  ctx.fillText('QR CODE', x + size / 2, y + size / 2 - 4);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `16px ${labelFont}`;
  ctx.fillText('PLACEHOLDER', x + size / 2, y + size / 2 + 22);
  ctx.fillText('added after deploy', x + size / 2, y + size / 2 + 44);
  ctx.textAlign = 'left';
};

// Frame with an irregular notch rhythm and one solid corner triangle, so the target has a clear "up"
const drawFrame = () => {
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(0, 0, SIZE, FRAME);
  ctx.fillRect(0, SIZE - FRAME, SIZE, FRAME);
  ctx.fillRect(0, 0, FRAME, SIZE);
  ctx.fillRect(SIZE - FRAME, 0, FRAME, SIZE);

  ctx.fillStyle = COLORS.sand;
  for (const side of ['top', 'bottom', 'left', 'right']) {
    let p = FRAME + between(0, 30);
    while (p < SIZE - FRAME - 20) {
      const len = between(10, 42);
      const t = between(6, 12);
      if (side === 'top') ctx.fillRect(p, (FRAME - t) / 2, len, t);
      if (side === 'bottom') ctx.fillRect(p, SIZE - (FRAME + t) / 2, len, t);
      if (side === 'left') ctx.fillRect((FRAME - t) / 2, p, t, len);
      if (side === 'right') ctx.fillRect(SIZE - (FRAME + t) / 2, p, t, len);
      p += len + between(8, 34);
    }
  }

  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(110, 0);
  ctx.lineTo(0, 110);
  ctx.closePath();
  ctx.fill();
};

drawBackground();
drawSun();
drawMinaret();
drawTitle();
await drawQrArea();
drawFrame();

fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
const qrNote = qrUrl ? ` with QR → ${qrUrl}` : qrPath ? ' with QR image' : ' with QR placeholder';
console.log(`wrote ${outPath} (${SIZE}x${SIZE}px = 3x3 in @ 300 DPI)${qrNote}`);
