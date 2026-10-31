/**
 * Spatial AR Network — 3D Asset Registry & Generators
 * Modular catalog of branded 3D aerial spectacles:
 * - Bell 206 Helicopter (Heritage Aviation)
 * - Aerobatic Stunt Aircraft (Red Bull Racing)
 * - Holographic Kinetic Sneaker (Nike Air Max)
 * - Cyber Titan Mech (PlayStation Boss Raid)
 * - Cosmic Quantum Core (Tech Energy Core)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const ASSET_CATALOG = {
  'bell-206': {
    id: 'bell-206',
    name: 'Heritage Helicopter',
    subname: 'Bell 206 JetRanger',
    brand: 'Heritage Aviation',
    credit: '3D model: “Bell 206 JetRanger” by terran4627, CC BY 4.0 (modified)',
    primaryColor: 0x00f0ff,
    accentColor: 0xffb800,
    kicker: 'HERITAGE HELI FLYOVER',
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/bell206.glb`,
    sizeRatio: 1.0,
    speed: 0.35,
    bank: 0.3,
    bob: 2
  },
  'stunt-plane': {
    id: 'stunt-plane',
    name: 'Aerobatic Stunt Aircraft',
    subname: 'Red Bull Racing Stunt Spec',
    brand: 'Red Bull Action Sports',
    credit: 'Procedural Aerobatic Racer with Dynamic Smoke Trails',
    primaryColor: 0xff1844,
    accentColor: 0xffcc00,
    kicker: 'RED BULL ENDLESS DROP',
    type: 'procedural',
    sizeRatio: 1.1,
    speed: 0.52,
    bank: 0.55,
    bob: 3.5
  },
  'neon-sneaker': {
    id: 'neon-sneaker',
    name: 'Kinetic Spatial Sneaker',
    subname: 'Nike Air Max Hologram',
    brand: 'Nike Streetwear',
    credit: 'Holographic Kinetic Footwear Projection',
    primaryColor: 0x00f0ff,
    accentColor: 0xff4800,
    kicker: 'NIKE PHANTOM RUNNER',
    type: 'procedural',
    sizeRatio: 1.25,
    speed: 0.3,
    bank: 0.2,
    bob: 4.0
  },
  'cyber-titan': {
    id: 'cyber-titan',
    name: 'Cyber Titan Mech',
    subname: 'PlayStation Shibuya Boss Raid',
    brand: 'PlayStation / Gaming',
    credit: 'Autonomous Heavy Combat Mech',
    primaryColor: 0x9d4edd,
    accentColor: 0x00f5d4,
    kicker: 'PLAYSTATION BOSS RAID',
    type: 'procedural',
    sizeRatio: 1.4,
    speed: 0.24,
    bank: 0.12,
    bob: 1.8
  },
  'energy-core': {
    id: 'energy-core',
    name: 'Cosmic Quantum Core',
    subname: 'Futuristic Energy Matrix',
    brand: 'DLF CyberHub / Tech Hub',
    credit: 'Quantum Fusion Energy Core',
    primaryColor: 0x00f0ff,
    accentColor: 0xff007f,
    kicker: 'FUTURISTIC ENERGY CORE',
    type: 'procedural',
    sizeRatio: 1.3,
    speed: 0.38,
    bank: 0.0,
    bob: 2.2
  }
};

export const DEFAULT_ASSET_ID = 'bell-206';

/**
 * Procedural Aerobatic Stunt Plane (Red Bull style)
 */
function buildStuntPlane(primaryColor = 0xff1844, accentColor = 0xffcc00) {
  const group = new THREE.Group();
  group.name = 'stunt-plane-model';

  // Fuselage
  const fuseMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.25, metalness: 0.6 });
  const fuseGeo = new THREE.ConeGeometry(1.6, 12, 16);
  fuseGeo.rotateZ(Math.PI / 2);
  const fuselage = new THREE.Mesh(fuseGeo, fuseMat);
  fuselage.position.x = 2;
  group.add(fuselage);

  // Cockpit canopy
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x223344,
    roughness: 0.1,
    metalness: 0.1,
    transmission: 0.7,
    transparent: true,
    opacity: 0.8
  });
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 12), canopyMat);
  canopy.scale.set(2.2, 0.8, 0.9);
  canopy.position.set(2, 0.9, 0);
  group.add(canopy);

  // Wings
  const wingMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.3, metalness: 0.5 });
  const wingGeo = new THREE.BoxGeometry(2.4, 0.2, 14);
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.position.set(2, 0, 0);
  group.add(wings);

  // Wingtip winglets
  const wingletGeo = new THREE.BoxGeometry(0.8, 1.2, 0.15);
  const leftWinglet = new THREE.Mesh(wingletGeo, fuseMat);
  leftWinglet.position.set(2, 0.5, 7);
  const rightWinglet = new THREE.Mesh(wingletGeo, fuseMat);
  rightWinglet.position.set(2, 0.5, -7);
  group.add(leftWinglet, rightWinglet);

  // Tail fin & stabilizers
  const finGeo = new THREE.BoxGeometry(1.5, 2.2, 0.2);
  const fin = new THREE.Mesh(finGeo, fuseMat);
  fin.position.set(-3.2, 1.1, 0);
  const hStabGeo = new THREE.BoxGeometry(1.2, 0.15, 4.5);
  const hStab = new THREE.Mesh(hStabGeo, wingMat);
  hStab.position.set(-3.2, 0.4, 0);
  group.add(fin, hStab);

  // Propeller spinning disc
  const propMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
  const propDisc = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), propMat);
  propDisc.rotateY(Math.PI / 2);
  propDisc.position.x = 8.1;
  group.add(propDisc);

  // Smoke trails from wingtips
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  const smokeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1.4, 18, 8, 1, true), smokeMat);
  smokeLeft.rotateZ(Math.PI / 2);
  smokeLeft.position.set(-8, 0.5, 7);
  const smokeRight = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1.4, 18, 8, 1, true), smokeMat);
  smokeRight.rotateZ(Math.PI / 2);
  smokeRight.position.set(-8, 0.5, -7);
  group.add(smokeLeft, smokeRight);

  // Model faces -X conventionally
  group.rotation.y = Math.PI;

  const update = (seconds) => {
    propDisc.rotation.z = seconds * 45;
    // Dynamic smoke pulse
    const s = 1 + Math.sin(seconds * 10) * 0.15;
    smokeLeft.scale.set(s, 1, s);
    smokeRight.scale.set(s, 1, s);
  };

  return { object: group, update };
}

/**
 * Procedural Kinetic Neon Sneaker (Nike Air Max style)
 */
function buildNeonSneaker(primaryColor = 0x00f0ff, accentColor = 0xff4800) {
  const group = new THREE.Group();
  group.name = 'neon-sneaker-model';

  // Chunky sole with air bubble window
  const soleMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });
  const soleGeo = new THREE.BoxGeometry(9, 1.2, 4);
  const sole = new THREE.Mesh(soleGeo, soleMat);
  sole.position.y = 0.6;
  group.add(sole);

  // Air bubble unit (glowing translucent)
  const airBubbleMat = new THREE.MeshPhysicalMaterial({
    color: accentColor,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.85
  });
  const airBubble = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.8, 3.6), airBubbleMat);
  airBubble.position.set(-1.6, 0.6, 0);
  group.add(airBubble);

  // Upper shoe chassis
  const upperMat = new THREE.MeshStandardMaterial({ color: 0x1a2233, roughness: 0.4, metalness: 0.3 });
  const upperGeo = new THREE.BoxGeometry(8, 2.5, 3.6);
  const upper = new THREE.Mesh(upperGeo, upperMat);
  upper.position.set(-0.2, 2.3, 0);
  group.add(upper);

  // Ankle collar
  const collarGeo = new THREE.CylinderGeometry(1.6, 1.9, 2.4, 16);
  const collar = new THREE.Mesh(collarGeo, upperMat);
  collar.position.set(-1.8, 3.8, 0);
  group.add(collar);

  // Neon glowing Swoosh / energy streak on both sides
  const swooshMat = new THREE.MeshBasicMaterial({ color: primaryColor });
  const swooshGeo = new THREE.TorusGeometry(2.2, 0.22, 8, 24, Math.PI / 1.5);
  swooshGeo.rotateZ(-Math.PI / 6);
  const leftSwoosh = new THREE.Mesh(swooshGeo, swooshMat);
  leftSwoosh.position.set(-0.2, 2.3, 1.9);
  const rightSwoosh = new THREE.Mesh(swooshGeo, swooshMat);
  rightSwoosh.position.set(-0.2, 2.3, -1.9);
  group.add(leftSwoosh, rightSwoosh);

  // Glowing halo ring around the ankle
  const haloMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.15, 8, 32), haloMat);
  haloRing.rotation.x = Math.PI / 2;
  haloRing.position.set(-1.8, 4.4, 0);
  group.add(haloRing);

  // Align direction
  group.rotation.y = Math.PI / 2;

  const update = (seconds) => {
    haloRing.rotation.z = seconds * 2;
    haloRing.scale.setScalar(1 + Math.sin(seconds * 3) * 0.08);
    // Subtle kinetic pitch tilt
    group.rotation.z = Math.sin(seconds * 2) * 0.12;
  };

  return { object: group, update };
}

/**
 * Procedural Cyber Titan Mech (PlayStation Shibuya boss style)
 */
function buildCyberTitan(primaryColor = 0x9d4edd, accentColor = 0x00f5d4) {
  const group = new THREE.Group();
  group.name = 'cyber-titan-model';

  const armorMat = new THREE.MeshStandardMaterial({ color: 0x161b26, roughness: 0.3, metalness: 0.8 });
  const glowMat = new THREE.MeshBasicMaterial({ color: accentColor });
  const coreMat = new THREE.MeshBasicMaterial({ color: primaryColor, blending: THREE.AdditiveBlending });

  // Main armored torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.0, 3.2), armorMat);
  torso.position.y = 3;
  group.add(torso);

  // Heavy shoulder pauldron blocks
  const leftPauldron = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 2.4), armorMat);
  leftPauldron.position.set(0, 4.2, 2.6);
  const rightPauldron = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 2.4), armorMat);
  rightPauldron.position.set(0, 4.2, -2.6);
  group.add(leftPauldron, rightPauldron);

  // Glowing central reactor eye (cyclops visor)
  const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.4, 16), coreMat);
  visor.rotateX(Math.PI / 2);
  visor.position.set(-2.0, 3.5, 0);
  group.add(visor);

  // Targeting scanning cone projected downward
  const beamMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
  const scanBeam = new THREE.Mesh(new THREE.ConeGeometry(6, 25, 16, 1, true), beamMat);
  scanBeam.position.set(-12, -8, 0);
  scanBeam.rotation.z = Math.PI / 3;
  group.add(scanBeam);

  // Hover energy shield ring around base
  const shield = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.15, 8, 32), glowMat);
  shield.rotation.x = Math.PI / 2;
  shield.position.y = 0.8;
  group.add(shield);

  const update = (seconds) => {
    shield.rotation.z = -seconds * 1.5;
    scanBeam.rotation.y = Math.sin(seconds * 1.5) * 0.4;
  };

  return { object: group, update };
}

/**
 * Procedural Cosmic Quantum Energy Core (Tech Fusion Reactor)
 */
function buildEnergyCore(primaryColor = 0x00f0ff, accentColor = 0xff007f) {
  const group = new THREE.Group();
  group.name = 'energy-core-model';

  // Glowing center plasma sphere
  const coreMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    blending: THREE.AdditiveBlending
  });
  const coreSphere = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 24), coreMat);
  group.add(coreSphere);

  // Inner corona aura
  const auraMat = new THREE.MeshBasicMaterial({
    color: accentColor,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });
  const auraSphere = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 24), auraMat);
  group.add(auraSphere);

  // Three gyroscopic quantum gimbal rings
  const ringMat1 = new THREE.MeshBasicMaterial({ color: primaryColor, wireframe: true });
  const ringMat2 = new THREE.MeshBasicMaterial({ color: accentColor, wireframe: true });
  const ringMat3 = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(4.4, 0.2, 8, 48), ringMat1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.2, 8, 48), ringMat2);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(6.4, 0.2, 8, 48), ringMat3);

  group.add(ring1, ring2, ring3);

  const update = (seconds) => {
    coreSphere.scale.setScalar(1 + Math.sin(seconds * 4) * 0.1);
    auraSphere.scale.setScalar(1 + Math.cos(seconds * 3) * 0.12);

    ring1.rotation.x = seconds * 1.2;
    ring1.rotation.y = seconds * 0.8;

    ring2.rotation.y = -seconds * 1.0;
    ring2.rotation.z = seconds * 0.9;

    ring3.rotation.x = -seconds * 0.6;
    ring3.rotation.z = -seconds * 1.4;
  };

  return { object: group, update };
}

/**
 * Creates the active aerial asset based on catalog config and options.
 * @param {object} assetConfig
 * @param {object} [customOptions]
 * @returns {{ object: THREE.Group, loaded: Promise<void>, update: (seconds: number) => void }}
 */
export function createAssetInstance(assetConfig, customOptions = {}) {
  const pColor = customOptions.primaryColor ?? assetConfig.primaryColor;
  const aColor = customOptions.accentColor ?? assetConfig.accentColor;

  if (assetConfig.type === 'glb') {
    // Standard GLB loader (Bell 206)
    const pivot = new THREE.Group();
    const flyer = new THREE.Group();
    flyer.position.x = customOptions.orbitRadius ?? 55;
    flyer.rotation.y = -Math.PI / 2;

    const bankGroup = new THREE.Group();
    bankGroup.rotation.x = customOptions.bank ?? assetConfig.bank;
    flyer.add(bankGroup);
    pivot.add(flyer);

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
          wrapper.scale.setScalar((customOptions.size ?? 24) / Math.max(dims.x, dims.y, dims.z));
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
        flyer.position.y = Math.sin(seconds * 1.8) * assetConfig.bob;
      }
    };

    return { object: pivot, loaded, update };
  }

  // Procedural 3D Generators
  let builder = buildStuntPlane;
  if (assetConfig.id === 'stunt-plane') builder = buildStuntPlane;
  else if (assetConfig.id === 'neon-sneaker') builder = buildNeonSneaker;
  else if (assetConfig.id === 'cyber-titan') builder = buildCyberTitan;
  else if (assetConfig.id === 'energy-core') builder = buildEnergyCore;

  const generated = builder(pColor, aColor);

  const pivot = new THREE.Group();
  const flyer = new THREE.Group();
  flyer.position.x = customOptions.orbitRadius ?? 55;
  flyer.rotation.y = -Math.PI / 2;

  const bankGroup = new THREE.Group();
  bankGroup.rotation.x = customOptions.bank ?? assetConfig.bank;
  flyer.add(bankGroup);
  pivot.add(flyer);

  const wrapper = new THREE.Group();
  wrapper.add(generated.object);
  const size = (customOptions.size ?? 24) * (assetConfig.sizeRatio ?? 1.0);
  wrapper.scale.setScalar(size / 10);
  bankGroup.add(wrapper);

  const loaded = Promise.resolve();

  const update = (seconds) => {
    const spd = customOptions.speed ?? assetConfig.speed;
    pivot.rotation.y = seconds * spd;
    if (assetConfig.bob) {
      flyer.position.y = Math.sin(seconds * 1.8) * assetConfig.bob;
    }
    generated.update(seconds);
  };

  return { object: pivot, loaded, update };
}
