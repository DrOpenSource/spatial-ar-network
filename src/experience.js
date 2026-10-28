/**
 * The landmark experience, defined once in metres around the landmark's base (y = up).
 * Rendered over the real camera view on-site (geo.js) and over Google's 3D city model (virtual.js).
 * Sizes are tuned for the Qutub Minar (72.5 m) and scale up for taller landmarks.
 */

import * as THREE from 'three';
import { BELL_206, createFlyover } from './flyover.js';

const REFERENCE_HEIGHT = 72.5;

// Units are metres; the orbit is centred on the landmark. Values here are for the reference height.
export const FLYOVER = {
  ...BELL_206,
  size: 24,          // 2× real size so it reads from a few hundred metres away
  orbitRadius: 55,
  clearance: 17.5,   // height above the landmark's top
  speed: 0.35,
  bank: 0.3,
  bob: 2
};

/**
 * @param {{ height: number, footprintRadius: number }} landmark
 * @returns {{ group: THREE.Group, flyover: ReturnType<typeof createFlyover>, update: (seconds: number) => void }}
 */
export function createLandmarkExperience(landmark) {
  const scale = Math.max(1, landmark.height / REFERENCE_HEIGHT);
  const group = new THREE.Group();

  // Base ring + crown halo bracket the real structure, which makes any misalignment obvious
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(landmark.footprintRadius + 3, 0.6 * scale, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 })
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.5;
  group.add(baseRing);

  const crown = new THREE.Group();
  crown.position.y = landmark.height + 3 * scale;
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(9 * scale, 0.9 * scale, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0xffb800, transparent: true, opacity: 0.9 })
  );
  halo.rotation.x = Math.PI / 2;
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(14 * scale, 0.5 * scale, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 })
  );
  outerRing.rotation.x = Math.PI / 2 + 0.3;
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5 * scale, 1.5 * scale, 300 * scale, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  beacon.position.y = 150 * scale;
  crown.add(halo, outerRing, beacon);
  group.add(crown);

  // The helicopter grows more slowly than the landmark so it stays plausible next to a 330 m tower
  const flyover = createFlyover({
    ...FLYOVER,
    size: FLYOVER.size * Math.sqrt(scale),
    orbitRadius: Math.max(FLYOVER.orbitRadius * scale, landmark.footprintRadius + 20)
  });
  flyover.object.position.y = landmark.height + FLYOVER.clearance * scale;
  group.add(flyover.object);

  const update = (seconds) => {
    flyover.update(seconds);
    outerRing.rotation.z = seconds * 0.4;
    halo.scale.setScalar(1 + Math.sin(seconds * 2) * 0.05);
  };

  return { group, flyover, update };
}
