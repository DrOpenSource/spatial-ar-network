/**
 * Spatial AR Network — 3D Asset Engine & Speculative Brand Drops
 * Supports high-fidelity 3D models with interactive stunt sequences,
 * real SI meter scaling, and Web Audio spatial sound effects:
 * - PlayStation Cyber-Titan (45m Colossal Boss Mech over Shibuya 109)
 * - Nike Kinetic Spatial Sneaker (35m PBR Sneaker with sonic shockwaves)
 * - Red Bull Aerobatic Stunt Racer (Acrobatic flight with barrel-roll dives)
 * - Heritage Bell 206 Helicopter (Aerial surveillance flyover)
 * - Supersonic Fighter Jet (Mach 2 interceptor with sonic booms)
 * - MQ-9 Reaper Recon Drone (Autonomous surveillance UAV)
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { playStuntSound } from './audio.js';

export const ASSET_CATALOG = {
  'cyber-titan': {
    id: 'cyber-titan',
    name: 'PlayStation Cyber-Titan',
    category: 'Colossal 45m Boss Mech',
    brand: 'PlayStation',
    kicker: 'PLAYSTATION // PLAY HAS NO LIMITS',
    actionLabel: '⚡ TRIGGER BOSS RAID',
    credit: '3D model: Rigged Animated Robot by Three.js (CC0)',
    primaryColor: 0x0070d1, // Official PlayStation Azure Blue
    accentColor: 0x00f0ff,
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/robot.glb`,
    isGroundColossus: true,
    heightMeters: 45,
    speed: 0,
    bank: 0,
    bob: 0
  },
  'colossal-sneaker': {
    id: 'colossal-sneaker',
    name: 'Nike Kinetic Spatial Sneaker',
    category: '35m Holographic Footwear',
    brand: 'Nike',
    kicker: 'NIKE // THERE IS NO FINISH LINE',
    actionLabel: '⚡ TRIGGER SPRINT PULSE',
    credit: '3D model: MaterialsVariantsShoe by Shopify (CC BY 4.0)',
    primaryColor: 0x00f0ff,
    accentColor: 0xff3b00,
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/shoe.glb`,
    isGroundColossus: false,
    sizeRatio: 1.4,
    speed: 0.28,
    bank: 0.2,
    bob: 3.0
  },
  'stunt-plane': {
    id: 'stunt-plane',
    name: 'Red Bull Aerobatic Stunt Racer',
    category: 'Extreme Stunt Aircraft',
    brand: 'Red Bull',
    kicker: 'RED BULL // GIVES YOU WINGS',
    actionLabel: '⚡ PULL BARREL-ROLL DIVE',
    credit: '3D model: Cessna 172 Aerobatic Spec by e737 (CC BY 4.0)',
    primaryColor: 0xff1844,
    accentColor: 0xffcc00,
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/c172.glb`,
    isGroundColossus: false,
    sizeRatio: 1.1,
    speed: 0.52,
    bank: 0.45,
    bob: 2.2,
    trailOffset: { x: 9, y: 0.4, z: 5.2 }
  },
  'bell-206': {
    id: 'bell-206',
    name: 'Bell 206 JetRanger',
    category: 'Utility Helicopter',
    brand: 'Heritage Aviation',
    kicker: 'HERITAGE HELI FLYOVER',
    actionLabel: '⚡ ROTOR SPEED BOOST',
    credit: '3D model: “Bell 206 JetRanger” by terran4627 (CC BY 4.0)',
    primaryColor: 0x00f0ff,
    accentColor: 0xffb800,
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/bell206.glb`,
    isGroundColossus: false,
    sizeRatio: 1.0,
    speed: 0.35,
    bank: 0.28,
    bob: 2.0,
    trailOffset: { x: 8, y: -0.5, z: 2.2 }
  },
  'supersonic-jet': {
    id: 'supersonic-jet',
    name: 'Supersonic Jet',
    category: 'Mach 2 Interceptor',
    brand: 'Aero Defense',
    kicker: 'SUPERSONIC AIRSPACE PATROL',
    actionLabel: '⚡ SONIC BOOM PASS',
    credit: '3D model: “Private Jet” by Nick the Name (CC BY 4.0)',
    primaryColor: 0x00f0ff,
    accentColor: 0xff2255,
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/jet.glb`,
    isGroundColossus: false,
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
    brand: 'Cyber Warfare',
    kicker: 'AUTONOMOUS RECON PATROL',
    actionLabel: '⚡ TARGET LOCK SCAN',
    credit: '3D model: “MQ-9” by IProZenoN (CC BY 4.0)',
    primaryColor: 0x00ff88,
    accentColor: 0x00f0ff,
    type: 'glb',
    url: `${import.meta.env.BASE_URL}models/mq9.glb`,
    isGroundColossus: false,
    sizeRatio: 1.25,
    speed: 0.38,
    bank: 0.22,
    bob: 1.8,
    trailOffset: { x: 10, y: 0.2, z: 7.5 }
  }
};

export const DEFAULT_ASSET_ID = 'cyber-titan';

/**
 * Creates an instance of a 3D asset with interactive stunts, animation mixer, and audio triggers.
 * @param {typeof ASSET_CATALOG['cyber-titan']} assetConfig
 * @param {object} [customOptions]
 * @returns {{ object: THREE.Group, loaded: Promise<void>, update: (seconds: number, delta: number) => void, triggerStunt: () => void }}
 */
export function createAssetInstance(assetConfig, customOptions = {}) {
  const pColor = customOptions.primaryColor ?? assetConfig.primaryColor;
  const aColor = customOptions.accentColor ?? assetConfig.accentColor;

  const pivot = new THREE.Group();
  let triggerStunt = () => {};

  // Case 1: Colossal Ground-Anchored Mech (PlayStation Cyber-Titan)
  if (assetConfig.isGroundColossus) {
    const colossusGroup = new THREE.Group();
    pivot.add(colossusGroup);

    let mixer = null;
    let actions = {};
    let isStunting = false;

    // Glowing Eye Visor PointLight
    const eyeLight = new THREE.PointLight(pColor, 4.0, 70);
    eyeLight.position.set(0, 36, 6);
    colossusGroup.add(eyeLight);

    // Twin shoulder energy antennas
    const antGeo = new THREE.CylinderGeometry(0.3, 0.3, 12, 8);
    const antMat = new THREE.MeshBasicMaterial({ color: pColor });
    const antL = new THREE.Mesh(antGeo, antMat);
    antL.position.set(-8, 38, 0);
    const antR = new THREE.Mesh(antGeo, antMat);
    antR.position.set(8, 38, 0);
    colossusGroup.add(antL, antR);

    const loaded = new Promise((resolve, reject) => {
      new GLTFLoader().load(
        assetConfig.url,
        (gltf) => {
          const model = gltf.scene;
          mixer = new THREE.AnimationMixer(model);

          if (gltf.animations && gltf.animations.length) {
            gltf.animations.forEach((clip) => {
              actions[clip.name] = mixer.clipAction(clip);
            });
            if (actions['Idle']) {
              actions['Idle'].play();
            }
          }

          // Scale to true 45m height
          const box = new THREE.Box3().setFromObject(model);
          const sizeY = box.getSize(new THREE.Vector3()).y || 1;
          const targetHeight = assetConfig.heightMeters || 45;
          model.scale.setScalar(targetHeight / sizeY);

          // Center on X and Z, align feet to ground y = 0
          box.setFromObject(model);
          model.position.x = -(box.min.x + box.max.x) / 2;
          model.position.z = -(box.min.z + box.max.z) / 2;
          model.position.y = -box.min.y;

          // Face toward the street intersection (+Z)
          model.rotation.y = Math.PI;

          colossusGroup.add(model);
          resolve();
        },
        undefined,
        reject
      );
    });

    triggerStunt = () => {
      if (isStunting) return;
      isStunting = true;

      // Play audio
      playStuntSound('boss-raid');
      setTimeout(() => playStuntSound('laser'), 300);

      // Flash eye light
      eyeLight.intensity = 15.0;

      // Trigger Jump / Punch animation
      const animName = actions['Jump'] ? 'Jump' : actions['Punch'] ? 'Punch' : null;
      if (animName && actions[animName]) {
        const stuntAction = actions[animName];
        stuntAction.reset();
        stuntAction.setLoop(THREE.LoopOnce, 1);
        stuntAction.clampWhenFinished = false;
        stuntAction.play();
        if (actions['Idle']) {
          actions['Idle'].crossFadeTo(stuntAction, 0.2, true);
        }

        setTimeout(() => {
          if (actions['Idle']) {
            actions['Idle'].reset().play();
          }
          eyeLight.intensity = 4.0;
          isStunting = false;
        }, 1800);
      } else {
        setTimeout(() => {
          eyeLight.intensity = 4.0;
          isStunting = false;
        }, 1500);
      }
    };

    let prevTime = 0;
    const update = (seconds) => {
      const delta = prevTime ? seconds - prevTime : 0.016;
      prevTime = seconds;

      if (mixer) {
        mixer.update(delta);
      }

      // Subtle atmospheric breathing pulse on eye visor
      if (!isStunting) {
        eyeLight.intensity = 3.0 + Math.sin(seconds * 3) * 1.5;
      }
    };

    return { object: pivot, loaded, update, triggerStunt };
  }

  // Case 2: Flying / Orbiting Vehicles & Spatial Kinetic Holograms
  const flyer = new THREE.Group();
  flyer.position.x = customOptions.orbitRadius ?? 55;
  flyer.rotation.y = -Math.PI / 2;

  const bankGroup = new THREE.Group();
  bankGroup.rotation.x = customOptions.bank ?? assetConfig.bank;
  flyer.add(bankGroup);
  pivot.add(flyer);

  // Dynamic Underglow Light
  const underglowLight = new THREE.PointLight(pColor, 4.0, 90);
  underglowLight.position.set(0, -2, 0);
  bankGroup.add(underglowLight);

  // Dynamic Strobe Beacon
  const strobeGeo = new THREE.SphereGeometry(0.4, 8, 8);
  const strobeMat = new THREE.MeshBasicMaterial({ color: aColor });
  const tailStrobe = new THREE.Mesh(strobeGeo, strobeMat);
  tailStrobe.position.set(8, 2, 0);
  bankGroup.add(tailStrobe);

  // Dynamic Contrails
  const trailOffset = assetConfig.trailOffset || { x: 10, y: 0, z: 4 };
  const trailGeo = new THREE.CylinderGeometry(0.18, 0.8, 28, 8);
  trailGeo.rotateZ(Math.PI / 2);
  const trailMat = new THREE.MeshBasicMaterial({
    color: pColor,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  const leftTrail = new THREE.Mesh(trailGeo, trailMat);
  leftTrail.position.set(trailOffset.x + 14, trailOffset.y, -trailOffset.z);

  const rightTrail = new THREE.Mesh(trailGeo, trailMat);
  rightTrail.position.set(trailOffset.x + 14, trailOffset.y, trailOffset.z);

  bankGroup.add(leftTrail, rightTrail);

  const wrapper = new THREE.Group();
  bankGroup.add(wrapper);

  let isPerformingStunt = false;
  let stuntProgress = 0;

  const loaded = new Promise((resolve, reject) => {
    new GLTFLoader().load(
      assetConfig.url,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const dims = box.getSize(new THREE.Vector3());
        model.position.sub(box.getCenter(new THREE.Vector3()));

        wrapper.add(model);
        const targetSize = (customOptions.size ?? 24) * (assetConfig.sizeRatio ?? 1.0);
        wrapper.scale.setScalar(targetSize / Math.max(dims.x, dims.y, dims.z));
        resolve();
      },
      undefined,
      reject
    );
  });

  triggerStunt = () => {
    if (isPerformingStunt) return;
    isPerformingStunt = true;
    stuntProgress = 0;

    if (assetConfig.id === 'colossal-sneaker') {
      playStuntSound('chime');
      setTimeout(() => playStuntSound('sonic-boom'), 200);
    } else {
      playStuntSound('whoosh');
    }
  };

  const update = (seconds) => {
    const spd = (customOptions.speed ?? assetConfig.speed) * (isPerformingStunt ? 1.8 : 1.0);
    pivot.rotation.y = seconds * spd;

    if (assetConfig.bob) {
      flyer.position.y = Math.sin(seconds * 1.5) * assetConfig.bob;
    }

    // Dynamic Barrel-roll / Stunt animation
    if (isPerformingStunt) {
      stuntProgress += 0.04;
      bankGroup.rotation.z = Math.sin(stuntProgress * Math.PI) * Math.PI * 2;
      underglowLight.intensity = 8.0;
      trailMat.opacity = 1.0;

      if (stuntProgress >= 1.0) {
        isPerformingStunt = false;
        stuntProgress = 0;
        bankGroup.rotation.z = 0;
        underglowLight.intensity = 4.0;
      }
    } else {
      trailMat.opacity = 0.5 + Math.sin(seconds * 5) * 0.18;
    }

    tailStrobe.visible = Math.sin(seconds * 9) > 0.15;
  };

  return { object: pivot, loaded, update, triggerStunt };
}
