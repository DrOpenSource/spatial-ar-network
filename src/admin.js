/**
 * Living Landmarks: Speculative Brand Studio & Admin Control
 * Real-time control drawer to swap 3D brand assets, colors, flight dynamics, and campaign tags.
 * Persists overrides to localStorage for pitches and social drops.
 */

import { ASSET_CATALOG, DEFAULT_ASSET_ID } from './assets.js';

const STORAGE_KEY_PREFIX = 'spatial_ar_studio_';

export const BRAND_PRESETS = [
  { name: 'Cyan Electric', primary: '#00f0ff', accent: '#ffb800' },
  { name: 'Red Bull Racing', primary: '#ff1844', accent: '#ffcc00' },
  { name: 'Nike Infrared', primary: '#00f0ff', accent: '#ff4800' },
  { name: 'PlayStation Neon', primary: '#9d4edd', accent: '#00f5d4' },
  { name: 'Gold Luxury', primary: '#ffd700', accent: '#ffffff' }
];

export function getActiveAssetConfig(landmark) {
  const defaultId = landmark.defaultAsset || DEFAULT_ASSET_ID;
  const baseAsset = ASSET_CATALOG[defaultId] || ASSET_CATALOG[DEFAULT_ASSET_ID];

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${landmark.id}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const chosenAsset = ASSET_CATALOG[parsed.assetId] || baseAsset;
      return {
        assetId: chosenAsset.id,
        primaryColor: parsed.primaryColor ? parseInt(parsed.primaryColor.replace('#', '0x'), 16) : chosenAsset.primaryColor,
        accentColor: parsed.accentColor ? parseInt(parsed.accentColor.replace('#', '0x'), 16) : chosenAsset.accentColor,
        speedMultiplier: parsed.speedMultiplier ?? 1.0,
        orbitRadiusMultiplier: parsed.orbitRadiusMultiplier ?? 1.0,
        altitudeOffset: parsed.altitudeOffset ?? 0,
        campaignKicker: parsed.campaignKicker || chosenAsset.kicker,
        primaryHex: parsed.primaryColor || `#${chosenAsset.primaryColor.toString(16).padStart(6, '0')}`,
        accentHex: parsed.accentColor || `#${chosenAsset.accentColor.toString(16).padStart(6, '0')}`
      };
    }
  } catch (err) {
    console.warn('Could not read studio storage:', err);
  }

  return {
    assetId: baseAsset.id,
    primaryColor: baseAsset.primaryColor,
    accentColor: baseAsset.accentColor,
    speedMultiplier: 1.0,
    orbitRadiusMultiplier: 1.0,
    altitudeOffset: 0,
    campaignKicker: baseAsset.kicker,
    primaryHex: `#${baseAsset.primaryColor.toString(16).padStart(6, '0')}`,
    accentHex: `#${baseAsset.accentColor.toString(16).padStart(6, '0')}`
  };
}

export function saveActiveAssetConfig(landmarkId, config) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${landmarkId}`, JSON.stringify(config));
  } catch (err) {
    console.warn('Could not save studio config:', err);
  }
}

export function resetActiveAssetConfig(landmarkId) {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${landmarkId}`);
  } catch (err) {
    console.warn('Could not reset studio config:', err);
  }
}

/**
 * Initializes the Admin Studio Drawer UI.
 * @param {object} params
 * @param {object} params.landmark
 * @param {(newConfig: ReturnType<typeof getActiveAssetConfig>) => void} params.onChange
 */
export function initAdminStudio({ landmark, onChange }) {
  const drawer = document.querySelector('#admin-drawer');
  const btnToggle = document.querySelector('#btn-studio-toggle');
  const btnClose = document.querySelector('#btn-close-studio');
  const btnReset = document.querySelector('#btn-reset-studio');

  const assetSelect = document.querySelector('#studio-asset-select');
  const primaryInput = document.querySelector('#studio-primary-color');
  const accentInput = document.querySelector('#studio-accent-color');
  const speedSlider = document.querySelector('#studio-speed-slider');
  const speedVal = document.querySelector('#studio-speed-val');
  const radiusSlider = document.querySelector('#studio-radius-slider');
  const radiusVal = document.querySelector('#studio-radius-val');
  const kickerInput = document.querySelector('#studio-kicker-input');
  const presetContainer = document.querySelector('#studio-presets-row');

  if (!drawer || !btnToggle) return;

  let current = getActiveAssetConfig(landmark);

  // Sync controls with current config
  const syncUi = (cfg) => {
    if (assetSelect) assetSelect.value = cfg.assetId;
    if (primaryInput) primaryInput.value = cfg.primaryHex;
    if (accentInput) accentInput.value = cfg.accentHex;
    if (speedSlider) speedSlider.value = cfg.speedMultiplier;
    if (speedVal) speedVal.textContent = `${cfg.speedMultiplier.toFixed(1)}x`;
    if (radiusSlider) radiusSlider.value = cfg.orbitRadiusMultiplier;
    if (radiusVal) radiusVal.textContent = `${cfg.orbitRadiusMultiplier.toFixed(1)}x`;
    if (kickerInput) kickerInput.value = cfg.campaignKicker;
  };

  // Populate Asset select
  if (assetSelect) {
    assetSelect.innerHTML = '';
    for (const asset of Object.values(ASSET_CATALOG)) {
      assetSelect.add(new Option(`${asset.name} (${asset.brand})`, asset.id, false, asset.id === current.assetId));
    }
  }

  // Populate Presets
  if (presetContainer) {
    presetContainer.innerHTML = '';
    BRAND_PRESETS.forEach((preset) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'studio-preset-pill';
      pill.innerHTML = `<span class="preset-dot" style="background:${preset.primary}"></span>${preset.name}`;
      pill.addEventListener('click', () => {
        primaryInput.value = preset.primary;
        accentInput.value = preset.accent;
        applyChanges();
      });
      presetContainer.appendChild(pill);
    });
  }

  syncUi(current);

  const applyChanges = () => {
    const chosenAsset = ASSET_CATALOG[assetSelect.value] || ASSET_CATALOG[DEFAULT_ASSET_ID];
    const newConfig = {
      assetId: chosenAsset.id,
      primaryColor: parseInt(primaryInput.value.replace('#', '0x'), 16),
      accentColor: parseInt(accentInput.value.replace('#', '0x'), 16),
      primaryHex: primaryInput.value,
      accentHex: accentInput.value,
      speedMultiplier: parseFloat(speedSlider.value),
      orbitRadiusMultiplier: parseFloat(radiusSlider.value),
      altitudeOffset: 0,
      campaignKicker: kickerInput.value || chosenAsset.kicker
    };

    saveActiveAssetConfig(landmark.id, newConfig);
    current = newConfig;
    syncUi(current);
    onChange(current);
  };

  // Attach control listeners
  assetSelect?.addEventListener('change', () => {
    const chosen = ASSET_CATALOG[assetSelect.value];
    if (chosen) {
      primaryInput.value = `#${chosen.primaryColor.toString(16).padStart(6, '0')}`;
      accentInput.value = `#${chosen.accentColor.toString(16).padStart(6, '0')}`;
      kickerInput.value = chosen.kicker;
    }
    applyChanges();
  });

  primaryInput?.addEventListener('input', applyChanges);
  accentInput?.addEventListener('input', applyChanges);
  speedSlider?.addEventListener('input', applyChanges);
  radiusSlider?.addEventListener('input', applyChanges);
  kickerInput?.addEventListener('input', applyChanges);

  btnReset?.addEventListener('click', () => {
    resetActiveAssetConfig(landmark.id);
    current = getActiveAssetConfig(landmark);
    syncUi(current);
    onChange(current);
  });

  // Drawer toggles
  btnToggle.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  btnClose?.addEventListener('click', () => {
    drawer.classList.remove('open');
  });
}

