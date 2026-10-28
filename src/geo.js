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
import { BELL_206, createFlyover } from './flyover.js';

const LANDMARK = {
  name: 'Qutub Minar',
  lat: 28.52440,   // OpenStreetMap; confirm against satellite imagery before an event
  lon: 77.18550,
  height: 72.5     // metres
};

const SETTINGS = {
  eyeHeight: 1.6,            // metres above the ground the phone is held
  demoDistance: 250,         // demo mode places the landmark this far ahead
  maxOnSiteDistance: 2000,   // farther than this from the landmark → demo mode
  cameraLongSideFov: 67,     // degrees; typical phone main camera. Only affects off-centre alignment
  gpsSmoothing: 0.05,        // per-frame easing toward the newest GPS fix, hides GPS jumps
  orientationSmoothing: 0.35 // per-frame easing toward the newest gyro reading, hides jitter
};

// Units here are metres; the orbit is centred on the tower
const FLYOVER = {
  ...BELL_206,
  size: 24,          // 2× real size so it reads from a few hundred metres away
  orbitRadius: 55,
  altitude: 90,
  speed: 0.35,
  bank: 0.3,
  bob: 2
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

document.addEventListener('DOMContentLoaded', () => {
  const video = document.querySelector('#camera-feed');
  const container = document.querySelector('#ar-container');
  const trackingStatus = document.querySelector('#tracking-status');
  const crosshair = document.querySelector('#aim-crosshair');
  const kicker = document.querySelector('#geo-kicker');
  const headline = document.querySelector('#geo-headline');
  const subtext = document.querySelector('#geo-subtext');
  const readout = document.querySelector('#geo-readout');
  const btnAction = document.querySelector('#btn-geo-action');
  const modelCredit = document.querySelector('#model-credit');

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
  // `landmark` sits at the tower base, so everything inside it is in metres around the tower
  const calibrated = new THREE.Group();
  calibrated.visible = false;
  const landmark = new THREE.Group();
  calibrated.add(landmark);
  scene.add(calibrated);

  // Base ring + crown halo bracket the real tower, which makes any misalignment obvious
  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(10, 0.6, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 })
  );
  baseRing.rotation.x = Math.PI / 2;
  baseRing.position.y = 0.5;
  landmark.add(baseRing);

  const crown = new THREE.Group();
  crown.position.y = LANDMARK.height + 3;
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(9, 0.9, 12, 64),
    new THREE.MeshBasicMaterial({ color: 0xffb800, transparent: true, opacity: 0.9 })
  );
  halo.rotation.x = Math.PI / 2;
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(14, 0.5, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.7 })
  );
  outerRing.rotation.x = Math.PI / 2 + 0.3;
  const beacon = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.5, 300, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  beacon.position.y = 150;
  crown.add(halo, outerRing, beacon);
  landmark.add(crown);

  const flyover = createFlyover(FLYOVER);
  flyover.object.position.y = FLYOVER.altitude;
  landmark.add(flyover.object);
  flyover.loaded
    .then(() => { modelCredit.textContent = FLYOVER.credit; })
    .catch((err) => console.warn('Flyover model failed to load.', err));

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
  const landmarkTarget = new THREE.Vector3();  // tower base relative to the user, before calibration

  // A GPS error only forces demo mode if we never had a fix; after that we keep the last good one
  const usingDemo = () => demoMode || (!userFix && gpsError);

  const updateTarget = () => {
    if (userFix) {
      const { east, north } = offsetMetres(userFix, LANDMARK);
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
        const why = userFix ? `You're ${formatDistance(distance)} from the Minar` : 'Location is unavailable';
        subtext.innerText = forceDemo
          ? `Demo: the Minar will appear ${SETTINGS.demoDistance} m ahead of where you aim.`
          : `${why}, so the Minar will appear ${SETTINGS.demoDistance} m ahead of where you aim.`;
      } else {
        headline.innerText = 'Line up the top of the Minar';
        subtext.innerText = 'Hold the phone upright, put the crosshair on the very top of the tower, then tap Lock.';
      }
      const ready = hasOrientation && (userFix || demo);
      btnAction.disabled = !ready;
      btnAction.innerText = ready ? 'Lock on Minar' : 'Waiting for sensors…';
    }

    if (gpsError && !userFix && !forceDemo) readout.innerText = `GPS: ${gpsError}`;
    else if (forceDemo) readout.innerText = 'Demo mode (?demo)';
    else if (userFix) readout.innerText = `GPS ±${Math.round(userFix.accuracy)} m · ${formatDistance(distance)} to ${LANDMARK.name}`;
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
    setBadge('AIMING', '#ffb800');
    refreshUi();
  };

  const lock = () => {
    updateTarget();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    calibrated.rotation.y = yawOf(forward) - yawOf(landmarkTarget);
    landmark.position.copy(landmarkTarget);
    calibrated.visible = true;
    crosshair.hidden = true;
    state = 'locked';
    setBadge('LOCKED', '#00ff88');
    kicker.innerText = 'SPATIAL AIRSPACE UNLOCKED';
    headline.innerText = 'Heritage Heli Flyover';
    subtext.innerText = 'Drifted off the tower? Tap Recalibrate and line it up again.';
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
  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime();
    if (hasOrientation) camera.quaternion.slerp(deviceQuat, SETTINGS.orientationSmoothing);
    if (state === 'locked') landmark.position.lerp(landmarkTarget, SETTINGS.gpsSmoothing);

    flyover.update(t);
    outerRing.rotation.z = t * 0.4;
    halo.scale.setScalar(1 + Math.sin(t * 2) * 0.05);

    renderer.render(scene, camera);
  });
});
