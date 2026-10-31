/**
 * Living Landmarks: On-Site GPS Mode
 * Places 3D content at the Qutub Minar's real coordinates, no sticker needed.
 *
 * GPS gives the user's position. The gyroscope gives the phone's orientation, but only relative to
 * where it started, so the user puts the crosshair on the top of the real tower and taps Lock once:
 * knowing both positions, we rotate the content until the tower lines up with the crosshair.
 * No compass is used, so metal railings and magnetic interference can't skew it.
 */

import * as THREE from 'three';
import { FLYOVER, createLandmarkExperience } from './experience.js';
import { LANDMARKS, landmarkFromUrl, setupLandmarkPicker } from './landmarks.js';
import { createQutubMinarModel } from './models/qutub-minar.js';
import { initAdminStudio, getActiveAssetConfig } from './admin.js';

const SETTINGS = {
  eyeHeight: 1.6,            // metres above the ground the phone is held
  demoDistance: 250,         // demo mode places the landmark this far ahead
  maxOnSiteDistance: 2000,   // farther than this from the landmark → demo mode
  cameraLongSideFov: 67,     // degrees; typical phone main camera. Only affects off-centre alignment
  gpsSmoothing: 0.05,        // per-frame easing toward the newest GPS fix, hides GPS jumps
  orientationSmoothing: 0.35 // per-frame easing toward the newest gyro reading, hides jitter
};

const EARTH_RADIUS = 6378137;
const toRad = THREE.MathUtils.degToRad;

// Offset of `to` from `from` in metres on a flat local plane; error < 0.1% within a few km
const offsetMetres = (from, to) => ({
  east: toRad(to.lon - from.lon) * EARTH_RADIUS * Math.cos(toRad(from.lat)),
  north: toRad(to.lat - from.lat) * EARTH_RADIUS
});

const formatDistance = (metres) => (metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`);

// Heading of a direction in the horizontal plane, counter-clockwise from −Z (the same sense as rotation.y)
const yawOf = (v) => Math.atan2(-v.x, -v.z);

function createDigitalTwin(lm) {
  if (lm.model === 'qutub-minar') {
    return createQutubMinarModel();
  }
  const group = new THREE.Group();
  const rBase = Math.max(5, lm.footprintRadius);
  const rTop = Math.max(2, rBase * 0.4);
  const h = lm.height;

  const wireGeo = new THREE.CylinderGeometry(rTop, rBase, h, 20, 8, true);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  wire.position.y = h / 2;

  const coreGeo = new THREE.CylinderGeometry(rTop * 0.96, rBase * 0.96, h, 20, 1, false);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x081525,
    roughness: 0.3,
    metalness: 0.7,
    transparent: true,
    opacity: 0.8
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = h / 2;

  group.add(core, wire);
  return group;
}

document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('#camera-feed');
  const container = document.querySelector('#ar-container');
  const trackingStatus = document.querySelector('#tracking-status');
  const crosshair = document.querySelector('#aim-crosshair');
  const targetRadarPill = document.querySelector('#target-radar-pill');
  const radarArrow = document.querySelector('#radar-arrow');
  const radarLabel = document.querySelector('#radar-label');
  const viewToggleRow = document.querySelector('#view-toggle-row');
  const btnViewAuto = document.querySelector('#btn-view-auto');
  const btnViewCamera = document.querySelector('#btn-view-camera');
  const btnViewTwin = document.querySelector('#btn-view-twin');
  const kicker = document.querySelector('#geo-kicker');
  const headline = document.querySelector('#geo-headline');
  const subtext = document.querySelector('#geo-subtext');
  const readout = document.querySelector('#geo-readout');
  const btnAction = document.querySelector('#btn-geo-action');
  const modelCredit = document.querySelector('#model-credit');
  const landmarkTitle = document.querySelector('#landmark-name');
  const countrySelect = document.querySelector('#country-select');
  const landmarkSelect = document.querySelector('#landmark-select');
  const btnVirtualView = document.querySelector('#btn-virtual-view');

  let landmark = landmarkFromUrl();
  let assetConfig = getActiveAssetConfig(landmark);
  let experience = null;
  let digitalTwin = null;

  let viewMode = 'auto'; // 'auto' | 'camera' | 'twin'
  let isLookingAway = false;

  const setViewMode = (mode) => {
    viewMode = mode;
    btnViewAuto?.classList.toggle('active', mode === 'auto');
    btnViewCamera?.classList.toggle('active', mode === 'camera');
    btnViewTwin?.classList.toggle('active', mode === 'twin');
  };

  btnViewAuto?.addEventListener('click', () => setViewMode('auto'));
  btnViewCamera?.addEventListener('click', () => setViewMode('camera'));
  btnViewTwin?.addEventListener('click', () => setViewMode('twin'));

  if (landmarkTitle) {
    landmarkTitle.innerText = `${landmark.name} · ${landmark.area}`.toUpperCase();
  }

  if (btnVirtualView) {
    btnVirtualView.href = `./virtual.html?landmark=${encodeURIComponent(landmark.id)}`;
  }

  // Seamless in-place landmark switcher without dropping the camera feed
  const switchLandmark = (chosenId) => {
    if (!LANDMARKS[chosenId]) return;
    landmark = LANDMARKS[chosenId];

    const url = new URL(window.location.href);
    url.searchParams.set('landmark', chosenId);
    window.history.replaceState(null, '', url.toString());

    if (landmarkTitle) {
      landmarkTitle.innerText = `${landmark.name} · ${landmark.area}`.toUpperCase();
    }
    if (btnVirtualView) {
      btnVirtualView.href = `./virtual.html?landmark=${encodeURIComponent(landmark.id)}`;
    }

    landmarkGroup.clear();
    assetConfig = getActiveAssetConfig(landmark);
    experience = createLandmarkExperience(landmark, assetConfig);
    landmarkGroup.add(experience.group);

    digitalTwin = createDigitalTwin(landmark);
    digitalTwin.visible = false;
    landmarkGroup.add(digitalTwin);

    experience.flyover.loaded
      .then(() => { modelCredit.textContent = experience.assetConfig.credit; })
      .catch((err) => console.warn('Flyover model failed to load.', err));

    initAdminStudio({
      landmark,
      onChange: (newConfig) => {
        assetConfig = newConfig;
        landmarkGroup.remove(experience.group);
        experience = createLandmarkExperience(landmark, assetConfig);
        landmarkGroup.add(experience.group);
        experience.flyover.loaded
          .then(() => { modelCredit.textContent = experience.assetConfig.credit; })
          .catch((err) => console.warn('Flyover model failed to load.', err));
      }
    });

    updateTarget();
    if (state === 'locked') {
      landmarkGroup.position.copy(landmarkTarget);
      headline.innerText = `${landmark.name} Flyover`;
      subtext.innerText = `Drifted off ${landmark.name}? Tap Recalibrate and line it up again.`;
    } else {
      headline.innerText = `Stand where you can see ${landmark.name}`;
      subtext.innerText = 'We find you with GPS, then you confirm the structure with one tap.';
    }
    refreshUi();
  };

  // Two-tier Country -> Landmark selector
  setupLandmarkPicker(countrySelect, landmarkSelect, landmark, (chosenId) => {
    switchLandmark(chosenId);
  });

  headline.innerText = `Stand where you can see ${landmark.name}`;
  subtext.innerText = 'We find you with GPS, then you confirm the structure with one tap.';

  const forceDemo = new URLSearchParams(window.location.search).has('demo');

  // --- Scene. World axes: x = east, y = up, z = south; the user stands at the origin ---
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.5, 5000);
  camera.position.y = SETTINGS.eyeHeight;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(100, 200, 100);
  scene.add(sun);

  // `calibrated` turns the content around the user to match the gyro's arbitrary heading (set on Lock);
  // `landmarkGroup` sits at the landmark base, so everything inside it is in metres around the structure
  const calibrated = new THREE.Group();
  calibrated.visible = false;
  const landmarkGroup = new THREE.Group();
  calibrated.add(landmarkGroup);
  scene.add(calibrated);

  experience = createLandmarkExperience(landmark, assetConfig);
  landmarkGroup.add(experience.group);

  digitalTwin = createDigitalTwin(landmark);
  digitalTwin.visible = false;
  landmarkGroup.add(digitalTwin);

  experience.flyover.loaded
    .then(() => { modelCredit.textContent = experience.assetConfig.credit; })
    .catch((err) => console.warn('Flyover model failed to load.', err));

  initAdminStudio({
    landmark,
    onChange: (newConfig) => {
      assetConfig = newConfig;
      landmarkGroup.remove(experience.group);
      experience = createLandmarkExperience(landmark, assetConfig);
      landmarkGroup.add(experience.group);
      experience.flyover.loaded
        .then(() => { modelCredit.textContent = experience.assetConfig.credit; })
        .catch((err) => console.warn('Flyover model failed to load.', err));
      if (stuntLabel && experience.assetConfig.actionLabel) {
        stuntLabel.textContent = experience.assetConfig.actionLabel;
      }
    }
  });

  // Stunt & Capture wiring for on-site mode
  const btnStunt = document.querySelector('#btn-stunt-trigger');
  const stuntLabel = document.querySelector('#stunt-label');
  const btnCapture = document.querySelector('#btn-capture-drop');

  if (stuntLabel && assetConfig.actionLabel) {
    stuntLabel.textContent = assetConfig.actionLabel;
  }

  if (btnStunt) {
    btnStunt.addEventListener('click', () => {
      if (experience && experience.triggerStunt) {
        experience.triggerStunt();
      }
    });
  }

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
        ctx.fillText(`${landmark.name.toUpperCase()} · ${landmark.area.toUpperCase()}`, 24, c.height - bannerH + bannerH * 0.42);

        const assetCfg = experience.assetConfig;
        ctx.fillStyle = '#00f0ff';
        ctx.font = `600 ${Math.max(11, bannerH * 0.2)}px monospace`;
        ctx.fillText(`${assetCfg.kicker} · ${landmark.lat.toFixed(4)}° N, ${landmark.lon.toFixed(4)}° E`, 24, c.height - bannerH + bannerH * 0.78);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.font = `700 ${Math.max(12, bannerH * 0.22)}px sans-serif`;
        ctx.fillText('SPATIAL AR NETWORK', c.width - 24, c.height - bannerH + bannerH * 0.55);

        const link = document.createElement('a');
        link.download = `${landmark.id}-${assetCfg.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-drop.png`;
        link.href = c.toDataURL('image/png');
        link.click();
      };
      img.src = dataUrl;
    });
  }

  // --- Collapsible Footer Controls Drawer ---
  const footerDrawer = document.querySelector('#hud-footer');
  const footerCollapseBtn = document.querySelector('#footer-collapse-btn');
  const drawerToggleLabel = document.querySelector('#drawer-toggle-label');

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

  // Match the 3D camera's field of view to the real camera as displayed (object-fit: cover crops it)
  const updateViewport = () => {
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    camera.aspect = sw / sh;
    if (video.videoWidth && video.videoHeight) {
      const longSide = Math.max(video.videoWidth, video.videoHeight);
      const focal = longSide / 2 / Math.tan(toRad(SETTINGS.cameraLongSideFov) / 2);  // in video pixels
      const scale = Math.max(sw / video.videoWidth, sh / video.videoHeight);
      camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(sh / 2 / (focal * scale)));
    }
    camera.updateProjectionMatrix();
    renderer.setSize(sw, sh);
  };
  window.addEventListener('resize', updateViewport);
  video.addEventListener('loadedmetadata', updateViewport);
  updateViewport();

  // --- Orientation (gyro). Standard device-orientation → camera mapping, as in three.js's old DeviceOrientationControls ---
  const deviceQuat = new THREE.Quaternion();
  const euler = new THREE.Euler();
  const zee = new THREE.Vector3(0, 0, 1);
  const screenTwist = new THREE.Quaternion();
  const lookOutOfBack = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));  // −90° about X
  let hasOrientation = false;

  window.addEventListener('deviceorientation', (e) => {
    if (e.alpha === null) return;
    const screenAngle = toRad(screen.orientation?.angle ?? window.orientation ?? 0);
    euler.set(toRad(e.beta), toRad(e.alpha), -toRad(e.gamma), 'YXZ');
    deviceQuat.setFromEuler(euler).multiply(lookOutOfBack).multiply(screenTwist.setFromAxisAngle(zee, -screenAngle));
    if (!hasOrientation) {
      camera.quaternion.copy(deviceQuat);
      hasOrientation = true;
      refreshUi();
    }
  });

  // --- Position (GPS) ---
  let userFix = null;  // { lat, lon, accuracy }
  let gpsError = null;
  let demoMode = forceDemo;
  let distance = null;
  const landmarkTarget = new THREE.Vector3();  // landmark base relative to the user, before calibration

  // A GPS error only forces demo mode if we never had a fix; after that we keep the last good one
  const usingDemo = () => demoMode || (!userFix && gpsError);

  const updateTarget = () => {
    if (userFix) {
      const { east, north } = offsetMetres(userFix, landmark);
      distance = Math.hypot(east, north);
      demoMode = forceDemo || distance > SETTINGS.maxOnSiteDistance;
      if (!demoMode) landmarkTarget.set(east, 0, -north);
    }
    if (usingDemo()) landmarkTarget.set(0, 0, -SETTINGS.demoDistance);
  };

  // --- UI state machine: idle → aiming → locked (→ aiming on Recalibrate) ---
  let state = 'idle';

  const setBadge = (text, color) => {
    trackingStatus.innerText = text;
    trackingStatus.style.color = color;
  };

  const refreshUi = () => {
    const demo = usingDemo();
    if (state === 'aiming') {
      kicker.innerText = demo ? 'DEMO MODE' : 'GPS LANDMARK LOCK';
      if (demo) {
        headline.innerText = 'Aim at the horizon';
        const why = userFix ? `You're ${formatDistance(distance)} from ${landmark.name}` : 'Location is unavailable';
        subtext.innerText = forceDemo
          ? `Demo: ${landmark.name} will appear ${SETTINGS.demoDistance} m ahead of where you aim.`
          : `${why}, so ${landmark.name} will appear ${SETTINGS.demoDistance} m ahead of where you aim.`;
      } else {
        headline.innerText = `Line up the top of ${landmark.name}`;
        subtext.innerText = `Hold the phone upright, put the crosshair on the very top of ${landmark.name}, then tap Lock.`;
      }
      const ready = hasOrientation && (userFix || demo);
      btnAction.disabled = !ready;
      btnAction.innerText = ready ? `Lock on ${landmark.name}` : 'Waiting for sensors…';
    }

    if (gpsError && !userFix && !forceDemo) readout.innerText = `GPS: ${gpsError}`;
    else if (forceDemo) readout.innerText = 'Demo mode (?demo)';
    else if (userFix) readout.innerText = `GPS ±${Math.round(userFix.accuracy)} m · ${formatDistance(distance)} to ${landmark.name}`;
    else if (state !== 'idle') readout.innerText = 'Waiting for GPS…';
  };

  const showError = (message) => {
    state = 'error';
    setBadge('ERROR', '#ff4d4d');
    headline.innerText = "Can't start on-site AR";
    subtext.innerText = message;
    btnAction.disabled = true;
    crosshair.hidden = true;
  };

  const startAiming = () => {
    state = 'aiming';
    calibrated.visible = false;
    crosshair.hidden = false;
    if (viewToggleRow) viewToggleRow.hidden = true;
    if (targetRadarPill) targetRadarPill.hidden = true;
    digitalTwin.visible = false;
    video.style.opacity = '1';
    video.style.filter = 'none';
    scene.background = null;
    setBadge('AIMING', '#ffb800');
    refreshUi();
  };

  const lock = () => {
    updateTarget();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    calibrated.rotation.y = yawOf(forward) - yawOf(landmarkTarget);
    landmarkGroup.position.copy(landmarkTarget);
    calibrated.visible = true;
    crosshair.hidden = true;
    if (viewToggleRow) viewToggleRow.hidden = false;
    state = 'locked';
    setBadge('LOCKED', '#00ff88');
    kicker.innerText = 'SPATIAL AIRSPACE UNLOCKED';
    headline.innerText = `${landmark.name} Flyover`;
    subtext.innerText = `Drifted off ${landmark.name}? Tap Recalibrate and line it up again.`;
    btnAction.innerText = 'Recalibrate';
  };

  const start = async () => {
    btnAction.disabled = true;
    btnAction.innerText = 'Starting…';

    // iOS only grants motion access from inside a tap, so ask before any other await
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission !== 'granted') throw new Error('Motion access was denied. Allow it in your browser settings and reload.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
    await video.play();

    if (!forceDemo) {
      navigator.geolocation.watchPosition(
        (pos) => {
          userFix = { lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy };
          gpsError = null;
          updateTarget();
          refreshUi();
        },
        (err) => {
          gpsError = err.code === err.PERMISSION_DENIED ? 'permission denied' : 'no signal';
          updateTarget();
          refreshUi();
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
      );
    } else {
      updateTarget();
    }

    startAiming();
    setTimeout(() => {
      if (!hasOrientation) showError('No motion sensor found. On-site AR needs a phone with a gyroscope.');
    }, 3000);
  };

  btnAction.addEventListener('click', () => {
    if (state === 'idle') {
      start().catch((err) => {
        console.error('On-site AR failed to start:', err);
        showError(err.name === 'NotAllowedError' ? 'Camera access was denied. Allow it in your browser settings and reload.' : err.message);
      });
    } else if (state === 'aiming') {
      lock();
    } else if (state === 'locked') {
      startAiming();
    }
  });

  // --- Render loop ---
  renderer.setAnimationLoop((timeMs) => {
    const t = timeMs / 1000;
    if (hasOrientation) camera.quaternion.slerp(deviceQuat, SETTINGS.orientationSmoothing);
    if (state === 'locked') {
      landmarkGroup.position.lerp(landmarkTarget, SETTINGS.gpsSmoothing);

      // --- Locked screen view: detect when user looks away from the landmark ---
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const landmarkWorld = new THREE.Vector3();
      landmarkGroup.getWorldPosition(landmarkWorld);
      const toLandmark = landmarkWorld.clone().sub(camera.position).normalize();

      const cosAngle = forward.dot(toLandmark);
      const angleDeg = THREE.MathUtils.radToDeg(Math.acos(Math.min(1, Math.max(-1, cosAngle))));

      const cross = new THREE.Vector3().crossVectors(forward, toLandmark);
      const isLeft = cross.y > 0;
      const arrowSymbol = isLeft ? '←' : '→';

      // Hysteresis: trigger off-target when > 42°, recover when < 30°
      if (!isLookingAway && angleDeg > 42) {
        isLookingAway = true;
      } else if (isLookingAway && angleDeg < 30) {
        isLookingAway = false;
      }

      const showTwin = viewMode === 'twin' || (viewMode === 'auto' && isLookingAway);

      if (showTwin) {
        digitalTwin.visible = true;
        video.style.opacity = '0.12';
        video.style.filter = 'blur(6px)';
        scene.background = new THREE.Color(0x060c18);
        if (targetRadarPill) {
          targetRadarPill.hidden = false;
          if (radarArrow) radarArrow.textContent = arrowSymbol;
          if (radarLabel) radarLabel.textContent = `3D TWIN · ${arrowSymbol} TURN ${Math.round(angleDeg)}° TO ${landmark.name.toUpperCase()}`;
        }
        kicker.innerText = '3D DIGITAL TWIN VIEW';
      } else {
        digitalTwin.visible = false;
        video.style.opacity = '1';
        video.style.filter = 'none';
        scene.background = null;
        if (targetRadarPill) targetRadarPill.hidden = true;
        kicker.innerText = 'SPATIAL AIRSPACE UNLOCKED';
      }
    }

    experience.update(t);

    renderer.render(scene, camera);
  });
});
