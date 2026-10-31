/**
 * Spatial AR Network — 3D Aerial Fleet & Asset Engine
 * High-fidelity, authentic 3D GLB aircraft and drones for landmark flyovers:
 * - Bell 206 JetRanger (Utility Helicopter)
 * - Supersonic Jet (High-Speed Fighter)
 * - MQ-9 Reaper (Autonomous Recon Drone / UAV)
 * - Cessna 172 Skyhawk (Aerobatic Light Aircraft)
 * - Cessna Citation II (Executive Twin-Jet)
 * - Boeing 787-9 Dreamliner (Commercial Flagship)
 *
 * All models share the project's standard convention:
 * glTF Y-up, nose facing -X, centered at origin in real-world meters.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const ASSET_CATALOG = {
  'bell-206': {
    id: 'bell-206',
    name: 'Bell 206 JetRanger',
    category: 'Utility Helicopter',
    credit: '3D model: “Bell 206 JetRanger” by terran4627, CC BY 4.0 (modified)',
    primaryColor: 0x00f0ff,
    accentColor: 0xffb800,
    kicker: 'HERITAGE HELI FLYOVER',
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/bell206.glb`,
    sizeRatio: 1.0,
    speed: 0.35,
    bank: 0.28,
    bob: 2.0,
    trailOffset: { x: 8, y: -0.5, z: 2.2 }
  },
  'supersonic-jet': {
    id: 'supersonic-jet',
    name: 'Supersonic Jet',
    category: 'High-Speed Fighter Jet',
    credit: '3D model: “Private Jet” by Nick the Name, CC BY 4.0 (modified)',
    primaryColor: 0x00f0ff,
    accentColor: 0xff2255,
    kicker: 'SUPERSONIC AIRSPACE PATROL',
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/jet.glb`,
    sizeRatio: 1.15,
    speed: 0.55,
    bank: 0.45,
    bob: 1.5,
    trailOffset: { x: 12, y: 0, z: 4.2 }
  },
  'reaper-drone': {
    id: 'reaper-drone',
    name: 'MQ-9 Reaper UAV',
    category: 'Autonomous Recon Drone',
    credit: '3D model: “MQ-9” by IProZenoN, CC BY 4.0 (modified)',
    primaryColor: 0x00ff88,
    accentColor: 0x00f0ff,
    kicker: 'AUTONOMOUS RECON PATROL',
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/mq9.glb`,
    sizeRatio: 1.25,
    speed: 0.38,
    bank: 0.22,
    bob: 1.8,
    trailOffset: { x: 10, y: 0.2, z: 7.5 }
  },
  'cessna-skyhawk': {
    id: 'cessna-skyhawk',
    name: 'Cessna 172 Skyhawk',
    category: 'Aerobatic Light Aircraft',
    credit: '3D model: “Cessna 172” by e737, CC BY 4.0 (modified)',
    primaryColor: 0xffb800,
    accentColor: 0xff2255,
    kicker: 'AEROBATIC FLIGHT EXHIBITION',
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/c172.glb`,
    sizeRatio: 1.0,
    speed: 0.42,
    bank: 0.32,
    bob: 2.2,
    trailOffset: { x: 9, y: 0.4, z: 5.2 }
  },
  'citation-jet': {
    id: 'citation-jet',
    name: 'Cessna Citation II',
    category: 'Executive Twin-Jet',
    credit: '3D model: “1990 Cessna Citation” by BlenderCommunityHead, CC BY 4.0 (modified)',
    primaryColor: 0xff2255,
    accentColor: 0xffb800,
    kicker: 'EXECUTIVE AIR CHARTER',
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/citation2.glb`,
    sizeRatio: 1.2,
    speed: 0.48,
    bank: 0.38,
    bob: 1.6,
    trailOffset: { x: 13, y: 0.3, z: 5.0 }
  },
  'dreamliner': {
    id: 'dreamliner',
    name: 'Boeing 787-9 Dreamliner',
    category: 'Commercial Skyliner',
    credit: '3D model: “Boeing 787-9” by Nobilis 2, CC BY 4.0 (modified)',
    primaryColor: 0x00f0ff,
    accentColor: 0xffffff,
    kicker: 'FLAGSHIP SKYLINER FLYOVER',
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/b789.glb`,
    sizeRatio: 1.5,
    speed: 0.30,
    bank: 0.18,
    bob: 1.2,
    trailOffset: { x: 16, y: 0.5, z: 10.5 }
  }
};

export const DEFAULT_ASSET_ID = 'bell-206';

/**
 * Creates an instance of a 3D aerial asset with dynamic underglow, contrails, and strobe lighting.
 * @param {typeof ASSET_CATALOG['bell-206']} assetConfig
 * @param {object} [customOptions]
 * @returns {{ object: THREE.Group, loaded: Promise<void>, update: (seconds: number) => void }}
 */
export function createAssetInstance(assetConfig, customOptions = {}) {
  const pColor = customOptions.primaryColor ?? assetConfig.primaryColor;
  const aColor = customOptions.accentColor ?? assetConfig.accentColor;

  const pivot = new THREE.Group();
  const flyer = new THREE.Group();
  flyer.position.x = customOptions.orbitRadius ?? 55;
  flyer.rotation.y = -Math.PI / 2; // Nose (-X) faces direction of orbit travel (-Z)

  const bankGroup = new THREE.Group();
  bankGroup.rotation.x = customOptions.bank ?? assetConfig.bank;
  flyer.add(bankGroup);
  pivot.add(flyer);

  // Dynamic Underglow PointLight: Illuminates the aircraft belly and airspace in the chosen AR color!
  const underglowLight = new THREE.PointLight(pColor, 4.0, 90);
  underglowLight.position.set(0, -2, 0);
  bankGroup.add(underglowLight);

  // Dynamic Navigation Strobe (Tail / Beacon)
  const strobeGeo = new THREE.SphereGeometry(0.4, 8, 8);
  const strobeMat = new THREE.MeshBasicMaterial({ color: aColor });
  const tailStrobe = new THREE.Mesh(strobeGeo, strobeMat);
  tailStrobe.position.set(8, 2, 0);
  bankGroup.add(tailStrobe);

  // Dynamic Glowing Contrail Ribbons trailing behind the aircraft in the primary color
  const trailOffset = assetConfig.trailOffset || { x: 10, y: 0, z: 4 };
  const trailGeo = new THREE.CylinderGeometry(0.18, 0.75, 26, 8);
  trailGeo.rotateZ(Math.PI / 2); // align along +X (behind the aircraft, since nose is -X)
  const trailMat = new THREE.MeshBasicMaterial({
    color: pColor,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const leftTrail = new THREE.Mesh(trailGeo, trailMat);
  leftTrail.position.set(trailOffset.x + 13, trailOffset.y, -trailOffset.z);

  const rightTrail = new THREE.Mesh(trailGeo, trailMat);
  rightTrail.position.set(trailOffset.x + 13, trailOffset.y, trailOffset.z);

  bankGroup.add(leftTrail, rightTrail);

  const loaded = new Promise((resolve, reject) => {
    new GLTFLoader().load(
      assetConfig.url,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const dims = box.getSize(new THREE.Vector3());
        model.position.sub(box.getCenter(new THREE.Vector3()));

        const wrapper = new THREE.Group();
        wrapper.add(model);
        const targetSize = (customOptions.size ?? 24) * (assetConfig.sizeRatio ?? 1.0);
        wrapper.scale.setScalar(targetSize / Math.max(dims.x, dims.y, dims.z));
        bankGroup.add(wrapper);
        resolve();
      },
      undefined,
      reject
    );
  });

  const update = (seconds) => {
    const spd = customOptions.speed ?? assetConfig.speed;
    pivot.rotation.y = seconds * spd;
    if (assetConfig.bob) {
      flyer.position.y = Math.sin(seconds * 1.5) * assetConfig.bob;
    }
    // Dynamic trail pulse
    trailMat.opacity = 0.5 + Math.sin(seconds * 5) * 0.18;
    // Strobe flash
    tailStrobe.visible = (Math.sin(seconds * 9) > 0.15);
  };

  return { object: pivot, loaded, update };
}
