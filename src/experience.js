/**
 * The landmark experience, defined once in metres around the landmark's base (y = up).
 * Rendered over the real camera view on-site (geo.js) and over Google's 3D city model (virtual.js).
 * Sizes are tuned for the Qutub Minar (72.5 m) and scale up for taller landmarks.
 */

import * as THREE from 'three';
import { ASSET_CATALOG, DEFAULT_ASSET_ID, createAssetInstance } from './assets.js';

const REFERENCE_HEIGHT = 72.5;

// Units are metres; the orbit is centred on the landmark. Values here are for the reference height.
export const FLYOVER = {
  size: 24,          // 2× real size so it reads from a few hundred metres away
  orbitRadius: 55,
  clearance: 17.5,   // height above the landmark's top
  speed: 0.35,
  bank: 0.3,
  bob: 2
};

/**
 * @param {{ height: number, footprintRadius: number, defaultAsset?: string }} landmark
 * @param {object} [options]
 * @returns {{ group: THREE.Group, flyover: ReturnType<typeof createAssetInstance>, assetConfig: typeof ASSET_CATALOG['bell-206'], update: (seconds: number) => void }}
 */
export function createLandmarkExperience(landmark, options = {}) {
  const scale = Math.max(1, landmark.height / REFERENCE_HEIGHT);
  const group = new THREE.Group();

  const assetId = options.assetId || landmark.defaultAsset || DEFAULT_ASSET_ID;
  const assetConfig = ASSET_CATALOG[assetId] || ASSET_CATALOG[DEFAULT_ASSET_ID];

  const primaryColor = options.primaryColor ?? assetConfig.primaryColor;
  const accentColor = options.accentColor ?? assetConfig.accentColor;

  // Base ring + ground radar bracket the real structure
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(landmark.footprintRadius + 3, 0.8 * scale, 12, 64),
    new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.85 })
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.5;
  group.add(baseRing);

  const groundRadar = new THREE.Mesh(
    new THREE.RingGeometry(landmark.footprintRadius + 1, landmark.footprintRadius + 7 * scale, 48),
    new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
  );
  groundRadar.rotation.x = -Math.PI / 2;
  groundRadar.position.y = 0.2;
  group.add(groundRadar);

  // Crown halo & intense vertical sky beacon
  const crown = new THREE.Group();
  crown.position.y = landmark.height + 3 * scale;

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(10 * scale, 1.2 * scale, 16, 64),
    new THREE.MeshBasicMaterial({ color: accentColor, transparent: true, opacity: 0.95 })
  );
  halo.rotation.x = Math.PI / 2;

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(15 * scale, 0.7 * scale, 12, 64),
    new THREE.MeshBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.85 })
  );
  outerRing.rotation.x = Math.PI / 2 + 0.35;

  // Dual-layer sky beacon: Inner dense core + outer atmospheric cylinder
  const innerBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6 * scale, 1.6 * scale, 450 * scale, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  innerBeacon.position.y = 225 * scale;

  const outerBeacon = new THREE.Mesh(
    new THREE.CylinderGeometry(5.0 * scale, 7.5 * scale, 450 * scale, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: primaryColor,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  outerBeacon.position.y = 225 * scale;

  crown.add(halo, outerRing, innerBeacon, outerBeacon);
  group.add(crown);

  // Dynamic Interactive Ground Shockwave Ring
  const shockwaveGeo = new THREE.RingGeometry(0.5, 3.5, 64);
  shockwaveGeo.rotateX(-Math.PI / 2);
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
  shockwave.position.y = 0.5;
  group.add(shockwave);

  let shockwaveActive = false;
  let shockwaveProgress = 0;

  const speed = (assetConfig.speed ?? FLYOVER.speed) * (options.speedMultiplier ?? 1.0);
  const orbitRadiusMultiplier = options.orbitRadiusMultiplier ?? 1.0;
  const orbitRadius = Math.max((FLYOVER.orbitRadius * scale) * orbitRadiusMultiplier, landmark.footprintRadius + 20);
  const clearance = (FLYOVER.clearance + (options.altitudeOffset ?? 0)) * scale;

  const flyover = createAssetInstance(assetConfig, {
    size: FLYOVER.size * Math.sqrt(scale),
    orbitRadius,
    speed,
    bank: assetConfig.bank ?? FLYOVER.bank,
    primaryColor,
    accentColor
  });

  if (assetConfig.isGroundColossus) {
    flyover.object.position.set(0, 0, 0);
  } else {
    flyover.object.position.y = landmark.height + clearance;
  }
  group.add(flyover.object);

  const triggerStunt = () => {
    flyover.triggerStunt();
    shockwaveActive = true;
    shockwaveProgress = 0;
  };

  const update = (seconds) => {
    flyover.update(seconds);
    outerRing.rotation.z = seconds * 0.4;
    halo.scale.setScalar(1 + Math.sin(seconds * 2) * 0.05);

    // Expand interactive shockwave ripples across ground
    if (shockwaveActive) {
      shockwaveProgress += 0.025;
      const radius = 1 + shockwaveProgress * 28 * scale;
      shockwave.scale.setScalar(radius);
      shockwaveMat.opacity = Math.max(0, (1 - shockwaveProgress) * 0.95);
      if (shockwaveProgress >= 1.0) {
        shockwaveActive = false;
        shockwaveMat.opacity = 0;
      }
    }
  };

  return { group, flyover, assetConfig, update, triggerStunt };
}
