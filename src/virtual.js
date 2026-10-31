/**
 * Living Landmarks: Virtual Mode
 * Shows the landmark experience over Google Photorealistic 3D Tiles of the real place, so it can be
 * explored from anywhere with a realistic spy/recon satellite zoom dive.
 *
 * Needs VITE_GOOGLE_MAPS_API_KEY (Map Tiles API enabled) in .env.local, or in the host's env settings.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { TilesRenderer } from '3d-tiles-renderer';
import { GoogleCloudAuthPlugin } from '3d-tiles-renderer/core/plugins';
import { GLTFExtensionsPlugin, ReorientationPlugin, TilesFadePlugin } from '3d-tiles-renderer/three/plugins';
import { FLYOVER, createLandmarkExperience } from './experience.js';
import { LANDMARKS, landmarkFromUrl, setupLandmarkPicker } from './landmarks.js';
import { createQutubMinarModel } from './models/qutub-minar.js';
import { initAdminStudio, getActiveAssetConfig } from './admin.js';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

// Custom models for landmarks Google has no photorealistic 3D building coverage for
const MODELS = { 'qutub-minar': createQutubMinarModel };

// Baseline orbit viewpoint for a 72.5 m landmark (x = east, y = up, z = south)
const START_VIEW = new THREE.Vector3(160, 110, 220);
const REFERENCE_HEIGHT = 72.5;
const GROUND_PROBE_OFFSET = 1.5;

const MAX_GROUND_CORRECTION = 300;
const MAX_PROBE_TILE_ERROR = 20;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#ar-container');
  const trackingStatus = document.querySelector('#tracking-status');
  const landmarkName = document.querySelector('#landmark-name');
  const countrySelect = document.querySelector('#country-select');
  const landmarkSelect = document.querySelector('#landmark-select');
  const subtext = document.querySelector('#virtual-subtext');
  const btnReset = document.querySelector('#btn-reset-view');
  const btnOnSite = document.querySelector('#btn-on-site');
  const modelCredit = document.querySelector('#model-credit');
  const mapAttribution = document.querySelector('#map-attribution');

  // Realistic Satellite Recon HUD Elements
  const reconOverlay = document.querySelector('#satellite-recon-overlay');
  const reconScope = document.querySelector('#recon-center-scope');
  const reconPhaseBadge = document.querySelector('#recon-phase-badge');
  const reconTargetName = document.querySelector('#recon-target-name');
  const reconTargetMeta = document.querySelector('#recon-target-meta');
  const reconAltVal = document.querySelector('#recon-alt-val');
  const reconZoomVal = document.querySelector('#recon-zoom-val');
  const reconLockVal = document.querySelector('#recon-lock-val');
  const reconCoordsBl = document.querySelector('#recon-coords-bl');
  const reconStatusBadge = document.querySelector('#recon-status-badge');

  let activeLandmark = landmarkFromUrl();
  let activeModel = null;
  let experience = null;
  let tiles = null;
  let pickerController = null;
  let zoomState = null;

  const setBadge = (text, color) => {
    trackingStatus.innerText = text;
    trackingStatus.style.color = color;
  };

  if (!API_KEY) {
    setBadge('NO KEY', '#ff4d4d');
    subtext.innerText = 'Virtual mode needs a Google Maps API key (VITE_GOOGLE_MAPS_API_KEY). See README.';
    return;
  }

  // --- Viewpoint & Satellite Altitude Trajectory Math ---
  function getViewpoints(lm) {
    const scale = Math.max(1, lm.height / REFERENCE_HEIGHT);
    const targetOrbitPos = START_VIEW.clone().multiplyScalar(scale);
    const targetLookAt = new THREE.Vector3(0, lm.height / 2, 0);

    // Realistic satellite altitude in metres (15,000m to 25,000m above base)
    const satAlt = Math.max(14000, lm.height * 140);
    const satellitePos = new THREE.Vector3(
      targetOrbitPos.x * 0.12,
      satAlt,
      targetOrbitPos.z * 0.12 + satAlt * 0.22
    );
    const satelliteLookAt = new THREE.Vector3(0, 0, 0);

    return { targetOrbitPos, targetLookAt, satellitePos, satelliteLookAt, satAlt };
  }

  const initialVp = getViewpoints(activeLandmark);

  // --- Three.js WebGL Setup ---
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fc3e8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(300, 500, 200);
  scene.add(sun);

  // Far clip set to 100,000m so high satellite vantage views render the horizon cleanly
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.copy(initialVp.satellitePos);

  const dracoLoader = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH);

  // Globe container for Google 3D Tiles
  const globe = new THREE.Group();
  globe.rotation.y = Math.PI;
  scene.add(globe);

  function createTilesForLandmark(lm) {
    const t = new TilesRenderer();
    t.registerPlugin(new GoogleCloudAuthPlugin({ apiToken: API_KEY, autoRefreshToken: true }));
    t.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader }));
    t.registerPlugin(new TilesFadePlugin());
    t.registerPlugin(new ReorientationPlugin({
      lat: THREE.MathUtils.degToRad(lm.lat),
      lon: THREE.MathUtils.degToRad(lm.lon),
      height: lm.groundEllipsoidHeight
    }));
    t.setCamera(camera);
    t.setResolutionFromRenderer(camera, renderer);

    t.addEventListener('load-error', ({ error }) => {
      console.error('3D tiles failed to load:', error);
      setBadge('ERROR', '#ff4d4d');
      subtext.innerText = 'Could not load Google 3D tiles. Check the API key and website restrictions.';
    });

    t.addEventListener('load-model', () => { tilesChanged = true; });
    return t;
  }

  // --- Controls Setup ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(initialVp.satelliteLookAt);
  controls.enableDamping = true;
  controls.minDistance = Math.max(30, activeLandmark.footprintRadius * 1.2);
  controls.maxDistance = Math.max(2500, activeLandmark.height * 15);
  controls.maxPolarAngle = THREE.MathUtils.degToRad(85);
  controls.autoRotate = false; // Disabled during satellite dive
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    // Allow touch/drag to interrupt zoom dive if in progress
    if (zoomState) completeSatelliteZoom();
  });

  const applyExperienceCredit = (exp) => {
    exp.flyover.loaded
      .then(() => { modelCredit.textContent = exp.assetConfig.credit; })
      .catch((err) => console.warn('Flyover model failed to load.', err));
  };

  function setLandmarkContent(lm) {
    activeLandmark = lm;
    landmarkName.innerText = `${lm.name} · ${lm.area}`.toUpperCase();

    if (btnOnSite) {
      btnOnSite.href = `./geo.html?landmark=${encodeURIComponent(lm.id)}`;
    }

    const params = new URLSearchParams(window.location.search);
    params.set('landmark', lm.id);
    history.replaceState(null, '', `?${params.toString()}`);

    // Update custom model if needed
    if (activeModel) {
      scene.remove(activeModel);
      activeModel = null;
    }
    if (lm.model && MODELS[lm.model]) {
      activeModel = MODELS[lm.model]();
      scene.add(activeModel);
    }

    // Recreate experience
    if (experience) {
      scene.remove(experience.group);
    }
    const assetConfig = getActiveAssetConfig(lm);
    experience = createLandmarkExperience(lm, assetConfig);
    scene.add(experience.group);
    applyExperienceCredit(experience);

    const kickerEl = document.querySelector('.cta-kicker');
    if (kickerEl && assetConfig.campaignKicker) {
      kickerEl.textContent = assetConfig.campaignKicker;
    }

    const headlineEl = document.querySelector('#cta-headline');
    if (headlineEl && (assetConfig.headline || experience.assetConfig.headline)) {
      headlineEl.textContent = assetConfig.headline || experience.assetConfig.headline;
    }

    const stuntLabel = document.querySelector('#stunt-label');
    if (stuntLabel && assetConfig.actionLabel) {
      stuntLabel.textContent = assetConfig.actionLabel.replace(/^TRIGGER\s+/i, '');
    }

    // Spec Studio hot reload
    initAdminStudio({
      landmark: lm,
      onChange: (newConfig) => {
        scene.remove(experience.group);
        experience = createLandmarkExperience(lm, newConfig);
        scene.add(experience.group);
        applyExperienceCredit(experience);
        if (kickerEl && newConfig.campaignKicker) {
          kickerEl.textContent = newConfig.campaignKicker;
        }
        if (headlineEl && experience.assetConfig.headline) {
          headlineEl.textContent = experience.assetConfig.headline;
        }
        if (stuntLabel && experience.assetConfig.actionLabel) {
          stuntLabel.textContent = experience.assetConfig.actionLabel.replace(/^TRIGGER\s+/i, '');
        }
      }
    });

    if (pickerController) {
      pickerController.syncLandmark(lm);
    }
  }

  function performLandmarkSwap(nextLm) {
    if (tiles) {
      tiles.dispose();
      globe.remove(tiles.group);
    }
    tiles = createTilesForLandmark(nextLm);
    globe.position.set(0, 0, 0);
    globe.add(tiles.group);
    setLandmarkContent(nextLm);
  }

  // Initial load
  tiles = createTilesForLandmark(activeLandmark);
  globe.add(tiles.group);
  setLandmarkContent(activeLandmark);

  // Setup two-tier Country -> Landmark selector with in-memory satellite retargeting
  pickerController = setupLandmarkPicker(countrySelect, landmarkSelect, activeLandmark, (chosenId) => {
    const nextLm = LANDMARKS[chosenId];
    if (nextLm && nextLm.id !== activeLandmark.id) {
      triggerSatelliteTransition(nextLm);
    }
  });

  // --- Realistic Satellite Zoom Dive Engine ---
  function triggerSatelliteDescent(lm, isInitial = false) {
    const vp = getViewpoints(lm);
    if (isInitial) {
      camera.position.copy(vp.satellitePos);
      controls.target.copy(vp.satelliteLookAt);
    }

    reconOverlay.classList.add('active');
    reconScope.classList.remove('locked');
    reconPhaseBadge.textContent = 'SATELLITE ACQUISITION // DESCENT VECTOR';
    reconTargetName.textContent = lm.name.toUpperCase();
    reconTargetMeta.textContent = `${lm.lat.toFixed(4)}° N, ${lm.lon.toFixed(4)}° E · ${lm.area.toUpperCase()}`;
    reconCoordsBl.textContent = `${lm.lat.toFixed(4)}° N, ${lm.lon.toFixed(4)}° E`;
    reconStatusBadge.textContent = 'DESCENDING';
    reconStatusBadge.style.color = '#00f0ff';
    reconLockVal.textContent = 'DIVING';
    reconLockVal.style.color = '#ffb800';

    controls.enabled = false;
    controls.autoRotate = false;

    zoomState = {
      phase: 'descent',
      startTime: performance.now(),
      duration: 2600,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: vp.targetOrbitPos.clone(),
      toTarget: vp.targetLookAt.clone(),
      landmark: lm
    };
  }

  function triggerSatelliteTransition(nextLm) {
    if (zoomState) completeSatelliteZoom();

    const currentVp = getViewpoints(activeLandmark);
    reconOverlay.classList.add('active');
    reconScope.classList.remove('locked');
    reconPhaseBadge.textContent = 'ORBITAL RELOCATION // ASCENDING';
    reconTargetName.textContent = `RETARGETING: ${nextLm.name.toUpperCase()}`;
    reconTargetMeta.textContent = 'REPOSITIONING SATELLITE OPTICS...';
    reconCoordsBl.textContent = `${nextLm.lat.toFixed(4)}° N, ${nextLm.lon.toFixed(4)}° E`;
    reconStatusBadge.textContent = 'ASCENDING';
    reconStatusBadge.style.color = '#ffb800';
    reconLockVal.textContent = 'RELOCATING';
    reconLockVal.style.color = '#ffb800';

    controls.enabled = false;
    controls.autoRotate = false;

    zoomState = {
      phase: 'ascent',
      startTime: performance.now(),
      duration: 750,
      fromPos: camera.position.clone(),
      fromTarget: controls.target.clone(),
      toPos: currentVp.satellitePos.clone(),
      toTarget: currentVp.satelliteLookAt.clone(),
      nextLandmark: nextLm
    };
  }

  function completeSatelliteZoom() {
    if (!zoomState) return;

    const lm = zoomState.landmark || zoomState.nextLandmark || activeLandmark;
    const vp = getViewpoints(lm);

    camera.position.copy(vp.targetOrbitPos);
    controls.target.copy(vp.targetLookAt);

    reconAltVal.textContent = Math.round(lm.height * 2.5).toLocaleString() + ' M';
    reconZoomVal.textContent = '48.0X';
    reconLockVal.textContent = 'LOCKED';
    reconLockVal.style.color = '#00ff88';
    reconPhaseBadge.textContent = 'TARGET LOCKED // AIRSPACE SYNCHRONIZED';
    reconStatusBadge.textContent = 'LOCKED';
    reconStatusBadge.style.color = '#00ff88';
    reconScope.classList.add('locked');
    reconScope.style.transform = 'scale(1.0)';

    controls.minDistance = Math.max(30, lm.footprintRadius * 1.2);
    controls.maxDistance = Math.max(2500, lm.height * 15);
    controls.enabled = true;
    controls.autoRotate = true;

    zoomState = null;

    setTimeout(() => {
      reconOverlay.classList.remove('active');
      reconScope.classList.remove('locked');
    }, 450);
  }

  // Tap anywhere on viewfinder to instantly skip zoom dive
  reconOverlay.addEventListener('click', () => {
    if (zoomState) {
      if (zoomState.phase === 'ascent') {
        performLandmarkSwap(zoomState.nextLandmark);
      }
      completeSatelliteZoom();
    }
  });

  // Replay satellite zoom when Reset View button is clicked
  btnReset.addEventListener('click', () => {
    triggerSatelliteDescent(activeLandmark, true);
  });

  const btnResetHeader = document.querySelector('#btn-reset-view-header');
  if (btnResetHeader) {
    btnResetHeader.addEventListener('click', () => {
      triggerSatelliteDescent(activeLandmark, true);
    });
  }

  // --- Collapsible Footer Controls Drawer ---
  const footerDrawer = document.querySelector('#hud-footer');
  const footerCollapseBtn = document.querySelector('#footer-collapse-btn');
  const drawerToggleLabel = document.querySelector('#drawer-toggle-label');
  const locationChip = document.querySelector('#hud-location-chip');

  if (footerDrawer && footerCollapseBtn) {
    let isCollapsed = false;
    const toggleFooter = (forceState) => {
      isCollapsed = typeof forceState === 'boolean' ? forceState : !isCollapsed;
      footerDrawer.classList.toggle('is-collapsed', isCollapsed);
      footerCollapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
      if (drawerToggleLabel) {
        drawerToggleLabel.textContent = isCollapsed ? 'CONTROLS ▲' : 'COLLAPSE ▼';
      }
    };

    footerCollapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFooter();
    });

    if (locationChip) {
      locationChip.addEventListener('click', () => {
        // Tapping location pill opens the drawer so user can switch landmarks
        toggleFooter(false);
      });
    }

    // Touch swipe down on handle collapses, swipe up expands
    let touchStartY = 0;
    footerCollapseBtn.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    footerCollapseBtn.addEventListener('touchend', (e) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchEndY - touchStartY;
      if (diff > 25 && !isCollapsed) {
        toggleFooter(true);
      } else if (diff < -25 && isCollapsed) {
        toggleFooter(false);
      }
    }, { passive: true });
  }

  // --- Interactive Stunt Trigger ---
  const btnStunt = document.querySelector('#btn-stunt-trigger');
  if (btnStunt) {
    btnStunt.addEventListener('click', () => {
      if (experience && experience.triggerStunt) {
        experience.triggerStunt();
      }
    });
  }

  // Tap-to-Stunt Raycaster on 3D viewport
  const tapRaycaster = new THREE.Raycaster();
  const tapPointer = new THREE.Vector2();

  renderer.domElement.addEventListener('pointerup', (e) => {
    if (Math.abs(e.movementX) > 4 || Math.abs(e.movementY) > 4) return;
    tapPointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    tapPointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    tapRaycaster.setFromCamera(tapPointer, camera);
    if (experience && experience.group) {
      const hits = tapRaycaster.intersectObject(experience.group, true);
      if (hits.length > 0) {
        experience.triggerStunt();
      }
    }
  });

  // --- One-Tap Viral AR Capture Button ---
  const btnCapture = document.querySelector('#btn-capture-drop');
  if (btnCapture) {
    btnCapture.addEventListener('click', () => {
      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Watermark Banner for Social Media Drops
        const bannerH = Math.max(76, c.height * 0.1);
        ctx.fillStyle = 'rgba(6, 14, 28, 0.9)';
        ctx.fillRect(0, c.height - bannerH, c.width, bannerH);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, c.height - bannerH);
        ctx.lineTo(c.width, c.height - bannerH);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(16, bannerH * 0.28)}px sans-serif`;
        ctx.fillText(`${activeLandmark.name.toUpperCase()} · ${activeLandmark.area.toUpperCase()}`, 24, c.height - bannerH + bannerH * 0.42);

        const assetCfg = ASSET_CATALOG[experience.assetConfig.id] || experience.assetConfig;
        ctx.fillStyle = '#00f0ff';
        ctx.font = `600 ${Math.max(11, bannerH * 0.2)}px monospace`;
        ctx.fillText(`${assetCfg.kicker} · ${activeLandmark.lat.toFixed(4)}° N, ${activeLandmark.lon.toFixed(4)}° E`, 24, c.height - bannerH + bannerH * 0.78);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.font = `700 ${Math.max(12, bannerH * 0.22)}px sans-serif`;
        ctx.fillText('SPATIAL AR NETWORK', c.width - 24, c.height - bannerH + bannerH * 0.55);

        const link = document.createElement('a');
        link.download = `${activeLandmark.id}-${assetCfg.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-drop.png`;
        link.href = c.toDataURL('image/png');
        link.click();
      };
      img.src = dataUrl;
    });
  }

  // Start initial satellite descent dive on page load
  triggerSatelliteDescent(activeLandmark, true);

  // --- Ground Alignment ---
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);

  const hitHeightAt = (x, z) => {
    if (!tiles) return null;
    raycaster.set(new THREE.Vector3(x, MAX_GROUND_CORRECTION + 500, z), down);
    const [hit] = raycaster.intersectObject(tiles.group, true);
    const tileError = hit?.object.userData.tile?.geometricError ?? Infinity;
    return hit && tileError <= MAX_PROBE_TILE_ERROR ? hit.point.y : null;
  };

  let tilesChanged = false;
  let lastProbe = 0;

  const probeGround = () => {
    if (!tiles) return;
    const d = activeLandmark.footprintRadius * GROUND_PROBE_OFFSET + 10;
    const heights = [[d, 0], [-d, 0], [0, d], [0, -d]].map(([x, z]) => hitHeightAt(x, z)).filter((h) => h !== null);
    if (heights.length === 0) return;
    heights.sort((a, b) => a - b);
    const ground = heights[Math.floor(heights.length / 2)];
    const totalCorrection = globe.position.y - ground;
    if (Math.abs(ground) > 0.2 && Math.abs(totalCorrection) < MAX_GROUND_CORRECTION) globe.position.y = totalCorrection;

    const top = hitHeightAt(0, 0);
    window.__virtualDiagnostics = { groundOffset: globe.position.y, measuredTop: top, expectedTop: activeLandmark.height };
    if (trackingStatus.innerText === 'LOADING') setBadge('LIVE', '#00ff88');
  };

  const updateViewport = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (tiles) tiles.setResolutionFromRenderer(camera, renderer);
  };
  window.addEventListener('resize', updateViewport);
  updateViewport();

  let lastAttribution = '';
  const updateAttribution = () => {
    if (!tiles) return;
    const text = tiles.getAttributions()
      .filter((a) => a.type === 'string')
      .map((a) => a.value)
      .join(' ');
    const line = text ? `Map data: Google · ${text}` : 'Map data: Google';
    if (line !== lastAttribution) mapAttribution.textContent = line;
    lastAttribution = line;
  };

  // --- Master WebGL Animation Loop ---
  renderer.setAnimationLoop((timeMs) => {
    const now = performance.now();

    // Satellite Zoom Dive State Machine
    if (zoomState) {
      const elapsed = now - zoomState.startTime;

      if (zoomState.phase === 'ascent') {
        const p = Math.min(1, elapsed / zoomState.duration);
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        camera.position.lerpVectors(zoomState.fromPos, zoomState.toPos, ease);
        controls.target.lerpVectors(zoomState.fromTarget, zoomState.toTarget, ease);

        const currentAlt = Math.round(camera.position.y * 10);
        reconAltVal.textContent = currentAlt.toLocaleString() + ' M';
        reconZoomVal.textContent = Math.max(1, 48 * (1 - ease)).toFixed(1) + 'X';
        reconScope.style.transform = `scale(${1.0 + ease * 0.6})`;

        if (p >= 1) {
          const nextLm = zoomState.nextLandmark;
          performLandmarkSwap(nextLm);

          const nextVp = getViewpoints(nextLm);
          camera.position.copy(nextVp.satellitePos);
          controls.target.copy(nextVp.satelliteLookAt);

          reconPhaseBadge.textContent = 'SATELLITE ACQUISITION // DESCENT VECTOR';
          reconTargetName.textContent = nextLm.name.toUpperCase();
          reconTargetMeta.textContent = `${nextLm.lat.toFixed(4)}° N, ${nextLm.lon.toFixed(4)}° E · ${nextLm.area.toUpperCase()}`;
          reconCoordsBl.textContent = `${nextLm.lat.toFixed(4)}° N, ${nextLm.lon.toFixed(4)}° E`;
          reconStatusBadge.textContent = 'DESCENDING';
          reconStatusBadge.style.color = '#00f0ff';
          reconLockVal.textContent = 'DIVING';
          reconLockVal.style.color = '#ffb800';

          zoomState = {
            phase: 'descent',
            startTime: now,
            duration: 2500,
            fromPos: nextVp.satellitePos.clone(),
            fromTarget: nextVp.satelliteLookAt.clone(),
            toPos: nextVp.targetOrbitPos.clone(),
            toTarget: nextVp.targetLookAt.clone(),
            landmark: nextLm
          };
        }
      } else if (zoomState.phase === 'descent') {
        const p = Math.min(1, elapsed / zoomState.duration);
        // Quartic ease out for thrilling dive deceleration
        const ease = 1 - Math.pow(1 - p, 4);
        camera.position.lerpVectors(zoomState.fromPos, zoomState.toPos, ease);
        controls.target.lerpVectors(zoomState.fromTarget, zoomState.toTarget, ease);

        const currentAlt = Math.round(camera.position.y * 10);
        reconAltVal.textContent = Math.max(Math.round(zoomState.landmark.height * 2.5), currentAlt).toLocaleString() + ' M';
        reconZoomVal.textContent = (1.0 + ease * 47).toFixed(1) + 'X';
        reconLockVal.textContent = `DIVING ${Math.round(ease * 100)}%`;
        reconScope.style.transform = `scale(${1.6 - ease * 0.6})`;

        if (p >= 1) {
          completeSatelliteZoom();
        }
      }
    }

    controls.update();
    camera.updateMatrixWorld();
    if (tiles) tiles.update();

    if (tilesChanged && timeMs - lastProbe > 500) {
      tilesChanged = false;
      lastProbe = timeMs;
      probeGround();
      updateAttribution();
    }

    if (experience) experience.update(timeMs / 1000);
    renderer.render(scene, camera);
  });
});
