/**
 * Procedural 3D Qutub Minar at real-world scale (metres, base centre at the origin, y = up).
 * Stylised, not a scan: five tapering storeys (three fluted red sandstone, two marble), balconies
 * on carved corbels, inscription bands, and the flat railed top (the cupola fell in 1803).
 * Used where Google has no photorealistic 3D coverage (virtual mode) and for the on-site locked view.
 */

import * as THREE from 'three';

const BASE_RADIUS = 7.16;   // base diameter 14.32 m
const TOP_RADIUS = 1.375;   // top diameter 2.75 m
const SHAFT_HEIGHT = 71.4;  // storeys; the parapet brings it to 72.5 m

// Storey heights are approximate. Flutes: the ground storey alternates round and angular,
// the second is round, the third angular; the two marble storeys are banded with sandstone.
const STOREYS = [
  { height: 29.0, flutes: 24, style: 'mixed', stone: 'sandstone' },
  { height: 15.4, flutes: 20, style: 'round', stone: 'sandstone' },
  { height: 12.3, flutes: 16, style: 'angular', stone: 'sandstone' },
  { height: 8.0, flutes: 0, style: 'none', stone: 'marble' },
  { height: 6.7, flutes: 16, style: 'round', stone: 'marble' }
];

const FLUTE_DEPTH = 0.09;  // flute bulge as a fraction of the radius

const radiusAt = (y) => BASE_RADIUS - (BASE_RADIUS - TOP_RADIUS) * (y / SHAFT_HEIGHT);

const stoneMaterial = (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0 });
const MATERIALS = {
  sandstone: stoneMaterial(0xb2553a),
  sandstoneDark: stoneMaterial(0x7d3626),
  marble: stoneMaterial(0xece3d2),
  band: stoneMaterial(0xd9a07a),
  plinth: stoneMaterial(0x8c8073)
};

// Outward bulge (0..1) of a flute at fractional position u (0..1) across it
const fluteBulge = (style, u) => (style === 'angular' ? 1 - Math.abs(2 * u - 1) : Math.sin(Math.PI * u));

/** Open-ended tapering tube whose radius ripples into flutes around its circumference */
function flutedFrustum(y0, y1, flutes, style) {
  const radialSegments = Math.max(48, flutes * 8);
  const heightSegments = 4;
  const positions = [];
  const indices = [];

  for (let iy = 0; iy <= heightSegments; iy++) {
    const y = y0 + ((y1 - y0) * iy) / heightSegments;
    const r = radiusAt(y);
    for (let ix = 0; ix <= radialSegments; ix++) {
      const theta = (ix / radialSegments) * Math.PI * 2;
      let bulge = 0;
      if (flutes > 0) {
        const f = (theta / (Math.PI * 2)) * flutes;
        const index = Math.floor(f) % flutes;
        const fluteStyle = style === 'mixed' ? (index % 2 ? 'angular' : 'round') : style;
        bulge = fluteBulge(fluteStyle, f - Math.floor(f));
      }
      const rr = r * (1 + FLUTE_DEPTH * bulge);
      positions.push(Math.cos(theta) * rr, y, Math.sin(theta) * rr);
    }
  }

  const row = radialSegments + 1;
  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < radialSegments; ix++) {
      const a = iy * row + ix;
      const b = a + row;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// Thin ring hugging the shaft (inscription bands, marble/sandstone banding)
function band(y, height, material, outset) {
  const r = radiusAt(y) * (1 + FLUTE_DEPTH) + outset;
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, height, 64), material);
  mesh.position.y = y;
  return mesh;
}

// Balcony at height y: faceted corbel (muqarnas stand-in) under a deck with a parapet wall
function balcony(y) {
  const r = radiusAt(y) * (1 + FLUTE_DEPTH);
  const group = new THREE.Group();

  const corbelMaterial = MATERIALS.sandstoneDark.clone();
  corbelMaterial.flatShading = true;
  const corbel = new THREE.Mesh(new THREE.CylinderGeometry(r + 1.5, r + 0.1, 1.8, 24), corbelMaterial);
  corbel.position.y = y - 0.9;

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(r + 1.6, r + 1.6, 0.35, 48), MATERIALS.sandstone);
  deck.position.y = y + 0.17;

  const parapetMaterial = MATERIALS.sandstone.clone();
  parapetMaterial.side = THREE.DoubleSide;
  const parapet = new THREE.Mesh(new THREE.CylinderGeometry(r + 1.55, r + 1.55, 1.0, 48, 1, true), parapetMaterial);
  parapet.position.y = y + 0.85;

  group.add(corbel, deck, parapet);
  return group;
}

/** @returns {THREE.Group} the tower, base centre at the origin */
export function createQutubMinarModel() {
  const tower = new THREE.Group();
  tower.name = 'qutub-minar-model';

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(BASE_RADIUS + 1.6, BASE_RADIUS + 1.9, 0.8, 48), MATERIALS.plinth);
  plinth.position.y = 0.4;
  tower.add(plinth);

  let y = 0.8;
  STOREYS.forEach((storey, i) => {
    const top = y + storey.height - (i === 0 ? 0.8 : 0);
    tower.add(new THREE.Mesh(flutedFrustum(y, top, storey.flutes, storey.style), MATERIALS[storey.stone]));

    // Two carved inscription bands on sandstone storeys; sandstone banding on marble ones
    const span = top - y;
    if (storey.stone === 'sandstone') {
      tower.add(band(y + span * 0.3, 0.9, MATERIALS.band, 0.05), band(y + span * 0.62, 0.7, MATERIALS.band, 0.05));
    } else {
      tower.add(band(y + span * 0.5, 1.2, MATERIALS.sandstone, 0.02));
    }

    tower.add(balcony(top));
    y = top;
  });

  // Flat railed top
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(TOP_RADIUS + 0.4, TOP_RADIUS + 0.4, 0.4, 32), MATERIALS.sandstone);
  cap.position.y = y + 0.2;
  tower.add(cap);

  return tower;
}
