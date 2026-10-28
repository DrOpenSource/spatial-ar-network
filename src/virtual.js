/**
 * Living Landmarks: Virtual Mode
 * Shows the landmark experience over Google Photorealistic 3D Tiles of the real place, so it can be
 * explored from anywhere. Later reused as the on-site "locked screen view" when the phone looks away.
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
import { landmarkFromUrl } from './landmarks.js';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

// Starting viewpoint, in metres from the landmark's base (x = east, y = up, z = south)
const START_VIEW = { x: 160, y: 110, z: 220 };
const GROUND_PROBE_OFFSET = 25;  // probe the ground this far from the centre, clear of the structure itself

// Tiles measure height from the WGS84 ellipsoid, not sea level. Start near the real ground so the camera
// isn't underground (where only coarse tiles load), then refine by raycasting the detailed tiles.
const GROUND_ELLIPSOID_HEIGHT_ESTIMATE = 200;  // Mehrauli: ~240 m above sea level, geoid ~40 m below sea level
const MAX_GROUND_CORRECTION = 300;             // larger "corrections" come from coarse placeholder tiles; ignore them

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#ar-container');
  const trackingStatus = document.querySelector('#tracking-status');
  const landmarkName = document.querySelector('#landmark-name');
  const subtext = document.querySelector('#virtual-subtext');
  const btnReset = document.querySelector('#btn-reset-view');
  const modelCredit = document.querySelector('#model-credit');
  const mapAttribution = document.querySelector('#map-attribution');

  const landmark = landmarkFromUrl();
  landmarkName.innerText = `${landmark.name} · ${landmark.area}`.toUpperCase();

  const setBadge = (text, color) => {
    trackingStatus.innerText = text;
    trackingStatus.style.color = color;
  };

  if (!API_KEY) {
    setBadge('NO KEY', '#ff4d4d');
    subtext.innerText = 'Virtual mode needs a Google Maps API key (VITE_GOOGLE_MAPS_API_KEY). See README.';
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fc3e8);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(300, 500, 200);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.set(START_VIEW.x, START_VIEW.y, START_VIEW.z);

  // --- Google 3D tiles, re-centred so the landmark's base is the origin ---
  const tiles = new TilesRenderer();
  tiles.registerPlugin(new GoogleCloudAuthPlugin({ apiToken: API_KEY, autoRefreshToken: true }));
  const dracoLoader = new DRACOLoader().setDecoderPath(DRACO_DECODER_PATH);
  tiles.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader }));
  tiles.registerPlugin(new TilesFadePlugin());
  tiles.registerPlugin(new ReorientationPlugin({
    lat: THREE.MathUtils.degToRad(landmark.lat),
    lon: THREE.MathUtils.degToRad(landmark.lon),
    height: GROUND_ELLIPSOID_HEIGHT_ESTIMATE
  }));
  tiles.setCamera(camera);

  // The plugin faces X west / Z north; turn it 180° to match our x = east, z = south convention.
  // `globe` is also shifted vertically so the real ground sits at y = 0 (see probeGround).
  const globe = new THREE.Group();
  globe.rotation.y = Math.PI;
  globe.add(tiles.group);
  scene.add(globe);

  tiles.addEventListener('load-error', ({ error }) => {
    console.error('3D tiles failed to load:', error);
    setBadge('ERROR', '#ff4d4d');
    subtext.innerText = 'Could not load Google 3D tiles. Check the API key, its website restrictions and that the Map Tiles API is enabled.';
  });

  const experience = createLandmarkExperience(landmark);
  scene.add(experience.group);
  experience.flyover.loaded
    .then(() => { modelCredit.textContent = FLYOVER.credit; })
    .catch((err) => console.warn('Flyover model failed to load.', err));

  // --- Ground alignment: tiles use ellipsoid heights, so find the real ground by raycasting down ---
  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  const hitHeightAt = (x, z) => {
    raycaster.set(new THREE.Vector3(x, MAX_GROUND_CORRECTION + 500, z), down);
    const [hit] = raycaster.intersectObject(tiles.group, true);
    return hit ? hit.point.y : null;
  };

  let tilesChanged = false;
  let lastProbe = 0;
  tiles.addEventListener('load-model', () => { tilesChanged = true; });

  // Average a few probes around the structure; shift the globe so that ground lands on y = 0
  const probeGround = () => {
    const d = GROUND_PROBE_OFFSET;
    const heights = [[d, 0], [-d, 0], [0, d], [0, -d]].map(([x, z]) => hitHeightAt(x, z)).filter((h) => h !== null);
    if (heights.length === 0) return;
    heights.sort((a, b) => a - b);
    const ground = heights[Math.floor(heights.length / 2)];
    const totalCorrection = globe.position.y - ground;
    if (Math.abs(ground) > 0.2 && Math.abs(totalCorrection) < MAX_GROUND_CORRECTION) globe.position.y = totalCorrection;

    // Diagnostic: height of the model directly above the base, i.e. the structure's top if coordinates are right
    const top = hitHeightAt(0, 0);
    window.__virtualDiagnostics = { groundOffset: globe.position.y, measuredTop: top, expectedTop: landmark.height };
    if (trackingStatus.innerText === 'LOADING') setBadge('LIVE', '#00ff88');
  };

  // --- Controls: orbit around the structure's mid-height; slow auto-orbit until the user takes over ---
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, landmark.height / 2, 0);
  controls.enableDamping = true;
  controls.minDistance = 40;
  controls.maxDistance = 2000;
  controls.maxPolarAngle = THREE.MathUtils.degToRad(85);  // stay above the ground
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.6;
  controls.addEventListener('start', () => { controls.autoRotate = false; });

  btnReset.addEventListener('click', () => {
    camera.position.set(START_VIEW.x, START_VIEW.y, START_VIEW.z);
    controls.target.set(0, landmark.height / 2, 0);
    controls.autoRotate = true;
  });

  const updateViewport = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    tiles.setResolutionFromRenderer(camera, renderer);
  };
  window.addEventListener('resize', updateViewport);
  updateViewport();

  // Google's terms require showing the data attributions of the tiles currently on screen
  let lastAttribution = '';
  const updateAttribution = () => {
    const text = tiles.getAttributions()
      .filter((a) => a.type === 'string')
      .map((a) => a.value)
      .join(' ');
    const line = text ? `Map data: Google · ${text}` : 'Map data: Google';
    if (line !== lastAttribution) mapAttribution.textContent = line;
    lastAttribution = line;
  };

  renderer.setAnimationLoop((timeMs) => {
    controls.update();
    camera.updateMatrixWorld();
    tiles.update();

    // Re-probe the ground at most twice a second while new tiles keep arriving
    if (tilesChanged && timeMs - lastProbe > 500) {
      tilesChanged = false;
      lastProbe = timeMs;
      probeGround();
      updateAttribution();
    }

    experience.update(timeMs / 1000);
    renderer.render(scene, camera);
  });
});
