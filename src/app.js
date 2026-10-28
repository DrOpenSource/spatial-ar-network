/**
 * Living Landmarks WebAR Engine
 * Powered by MindAR.js & Three.js (Zero App Download Required)
 */

import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { BELL_206, createFlyover } from './flyover.js';

// Model that circles the minaret drawn on the sticker. Any GLB in public/models works (meter scale,
// Y-up, nose toward −X). Units are sticker widths; the sticker's centre is the origin, +Y is up the
// minaret, +Z points out of the sticker.
const FLYOVER = {
  ...BELL_206,
  size: 0.3,                               // longest side of the model
  center: { x: -0.22, y: 0.12, z: 0.35 },  // minaret axis, pushed out so the orbit stays in front of the sticker
  orbitRadius: 0.3,
  speed: 0.7,                              // radians per second
  bank: 0.25,                              // roll into the turn, radians
  bob: 0.03
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#ar-container');
  const trackingStatus = document.querySelector('#tracking-status');
  const scanReticle = document.querySelector('#scan-reticle');
  const btnClaim = document.querySelector('#btn-claim-pass');
  const btnShare = document.querySelector('#btn-record-snap');
  const modelCredit = document.querySelector('#model-credit');

  // Initialize MindAR with Three.js
  // Target compiled from assets/targets/qutub-sticker.png (see assets/targets/README.md)
  const mindarThree = new MindARThree({
    container: container,
    imageTargetSrc: `${import.meta.env.BASE_URL}targets/qutub.mind`,
    uiLoading: 'no',
    uiScanning: 'no'
  });

  const { renderer, scene, camera } = mindarThree;

  // Add Dynamic Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
  directionalLight.position.set(0, 5, 5);
  scene.add(directionalLight);

  // Create an Anchor Group linked to target 0
  const anchor = mindarThree.addAnchor(0);

  // 1. Procedural 3D Holographic Monument/Mecha (Always renders even without external .glb)
  const holoGroup = new THREE.Group();

  // Floating Cyber Pillar / Holographic Core
  const coreGeometry = new THREE.OctahedronGeometry(0.35, 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    wireframe: true,
    emissive: 0x0077ff,
    emissiveIntensity: 0.6
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  holoGroup.add(coreMesh);

  // Surrounding Rotating Energy Rings
  const ringGeo1 = new THREE.TorusGeometry(0.55, 0.015, 16, 100);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xffb800 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  holoGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(0.7, 0.012, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.rotation.x = Math.PI / 3;
  holoGroup.add(ring2);

  // Particle Swarm
  const particleCount = 120;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePositions[i] = (Math.random() - 0.5) * 1.5;
    particlePositions[i + 1] = (Math.random() - 0.5) * 1.5;
    particlePositions[i + 2] = (Math.random() - 0.5) * 1.5;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.025,
    transparent: true,
    opacity: 0.8
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  holoGroup.add(particles);

  holoGroup.position.set(0, 0, 0.1);
  anchor.group.add(holoGroup);

  // 2. GLB Flyover Model orbiting the hologram (the hologram stays as a fallback if loading fails)
  // Neutral key light so the model keeps its true colours under the cyan hologram light
  const keyLight = new THREE.DirectionalLight(0xffffff, 2);
  keyLight.position.set(1, -1, 3);
  scene.add(keyLight);

  const flyover = createFlyover(FLYOVER);
  flyover.object.position.set(FLYOVER.center.x, FLYOVER.center.y, FLYOVER.center.z);
  anchor.group.add(flyover.object);
  flyover.loaded
    .then(() => {
      holoGroup.visible = false;  // keep the drawn minaret clear; the hologram is only the fallback
      modelCredit.textContent = FLYOVER.credit;
    })
    .catch((err) => console.warn('Flyover model failed to load; showing hologram only.', err));

  // Tracking Events
  anchor.onTargetFound = () => {
    trackingStatus.innerText = 'LOCKED';
    trackingStatus.style.color = '#00ff88';
    scanReticle.classList.add('locked');
  };

  anchor.onTargetLost = () => {
    trackingStatus.innerText = 'SEARCHING';
    trackingStatus.style.color = '#ffb800';
    scanReticle.classList.remove('locked');
  };

  // User Actions
  // Placeholder until a real partner offer (coupon link, wallet pass) is wired in
  btnClaim.addEventListener('click', () => {
    alert('Demo: in a live campaign, this unlocks the partner\'s offer.');
  });

  btnShare.addEventListener('click', async () => {
    const shareData = {
      title: 'I just unlocked the Living Landmark in AR!',
      text: 'Found this hidden spatial drop at Qutub Minar. Check it out:',
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard! Share on Instagram / X.');
      }
    } catch (err) {
      // AbortError = user closed the share sheet, which is not a failure
      if (err.name !== 'AbortError') alert(`Couldn't share. Copy this link: ${shareData.url}`);
    }
  });

  // Start WebAR Loop
  const start = async () => {
    await mindarThree.start();
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      flyover.update(clock.getElapsedTime());

      // Rotate 3D Hologram
      coreMesh.rotation.y += 0.015;
      coreMesh.rotation.x += 0.008;
      ring1.rotation.y -= 0.02;
      ring2.rotation.z += 0.015;
      particles.rotation.y += 0.004;

      renderer.render(scene, camera);
    });
  };

  start().catch((err) => {
    // Camera denied, insecure context (non-HTTPS), or target file failed to load
    console.error('WebAR failed to start:', err);
    trackingStatus.innerText = 'CAMERA ERROR';
    trackingStatus.style.color = '#ff4d4d';
  });
});
