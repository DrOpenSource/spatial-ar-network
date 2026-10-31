/**
 * Landmark registry: every place the experience can be anchored to, on-site or virtually.
 * Coordinates are the centre of the structure's base (WGS84 degrees); sizes are in metres.
 *
 * - footprintRadius: half the width of the structure's base, so rings and orbits clear it
 * - groundEllipsoidHeight: rough ground height above the WGS84 ellipsoid (≈ sea level + geoid);
 *   virtual mode starts there and refines it by raycasting Google's tiles (within ±300 m)
 * - model: our own 3D model to show where Google has no photorealistic 3D coverage (null = rely on Google)
 * - hasGoogle3D: true when Google Photorealistic 3D Tiles includes detailed 3D building mesh
 * - meshType: 'google-3d' | 'custom-3d' | 'satellite-terrain'
 */

export const LANDMARKS = {
  // --- India (Delhi-NCR Pilot & Heritage) ---
  'qutub-minar': {
    id: 'qutub-minar',
    name: 'Qutub Minar',
    area: 'Mehrauli, New Delhi',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'India (Delhi-NCR)',
    lat: 28.52443,   // base centre, checked top-down against Google satellite imagery (±2 m)
    lon: 77.18546,
    height: 72.5,
    footprintRadius: 7.2,
    groundEllipsoidHeight: 200,  // ~240 m above sea level, geoid ~40 m below sea level
    model: 'qutub-minar',        // Google has no 3D buildings for Mehrauli, only flat imagery
    hasGoogle3D: false,
    meshType: 'custom-3d'
  },
  'india-gate': {
    id: 'india-gate',
    name: 'India Gate',
    area: 'New Delhi',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'India (Delhi-NCR)',
    lat: 28.61291,
    lon: 77.22951,
    height: 42.0,
    footprintRadius: 18.0,
    groundEllipsoidHeight: 170,
    model: null,
    hasGoogle3D: false,
    meshType: 'satellite-terrain'
  },
  'dlf-cyberhub': {
    id: 'dlf-cyberhub',
    name: 'DLF CyberHub',
    area: 'Gurgaon',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'India (Delhi-NCR)',
    lat: 28.49503,
    lon: 77.08906,
    height: 45.0,
    footprintRadius: 40.0,
    groundEllipsoidHeight: 180,
    model: null,
    hasGoogle3D: false,
    meshType: 'satellite-terrain'
  },
  'taj-mahal': {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    area: 'Agra',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'India (Heritage)',
    lat: 27.17514,
    lon: 78.04214,
    height: 73.0,
    footprintRadius: 55.0,
    groundEllipsoidHeight: 125,
    model: null,
    hasGoogle3D: false,
    meshType: 'satellite-terrain'
  },

  // --- United States ---
  'statue-of-liberty': {
    id: 'statue-of-liberty',
    name: 'Statue of Liberty',
    area: 'New York',
    country: 'United States',
    countryFlag: '🇺🇸',
    region: 'Americas',
    lat: 40.68925,
    lon: -74.04450,
    height: 93.0,
    footprintRadius: 32.0,
    groundEllipsoidHeight: -25,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'empire-state': {
    id: 'empire-state',
    name: 'Empire State Building',
    area: 'New York',
    country: 'United States',
    countryFlag: '🇺🇸',
    region: 'Americas',
    lat: 40.74844,
    lon: -73.98566,
    height: 381.0,
    footprintRadius: 45.0,
    groundEllipsoidHeight: -15,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'times-square': {
    id: 'times-square',
    name: 'Times Square',
    area: 'New York',
    country: 'United States',
    countryFlag: '🇺🇸',
    region: 'Americas',
    lat: 40.75800,
    lon: -73.98550,
    height: 110.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: -20,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'space-needle': {
    id: 'space-needle',
    name: 'Space Needle',
    area: 'Seattle',
    country: 'United States',
    countryFlag: '🇺🇸',
    region: 'Americas',
    lat: 47.62051,
    lon: -122.34928,
    height: 184.0,
    footprintRadius: 25.0,
    groundEllipsoidHeight: 20,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'venice-skatepark': {
    id: 'venice-skatepark',
    name: 'Venice Skatepark',
    area: 'Los Angeles',
    country: 'United States',
    countryFlag: '🇺🇸',
    region: 'Americas',
    lat: 33.98703,
    lon: -118.47352,
    height: 14.0,
    footprintRadius: 30.0,
    groundEllipsoidHeight: -35,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'huntington-beach-pier': {
    id: 'huntington-beach-pier',
    name: 'Huntington Beach Pier',
    area: 'California',
    country: 'United States',
    countryFlag: '🇺🇸',
    region: 'Americas',
    lat: 33.65530,
    lon: -117.99950,
    height: 18.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: -35,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },

  // --- United Kingdom ---
  'big-ben': {
    id: 'big-ben',
    name: 'Big Ben',
    area: 'London',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
    region: 'Europe',
    lat: 51.50073,
    lon: -0.12463,
    height: 96.0,
    footprintRadius: 14.0,
    groundEllipsoidHeight: 50,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'southbank-undercroft': {
    id: 'southbank-undercroft',
    name: 'Southbank Undercroft',
    area: 'London',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
    region: 'Europe',
    lat: 51.50650,
    lon: -0.11650,
    height: 35.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: 50,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'leicester-square': {
    id: 'leicester-square',
    name: 'Leicester Square',
    area: 'London',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
    region: 'Europe',
    lat: 51.51130,
    lon: -0.12840,
    height: 30.0,
    footprintRadius: 32.0,
    groundEllipsoidHeight: 55,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },

  // --- France ---
  'eiffel-tower': {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    area: 'Paris',
    country: 'France',
    countryFlag: '🇫🇷',
    region: 'Europe',
    lat: 48.85826,
    lon: 2.29448,
    height: 330.0,
    footprintRadius: 63.0,
    groundEllipsoidHeight: 80,   // ~35 m above sea level, geoid ~45 m above the ellipsoid
    model: null,                 // covered by Google Photorealistic 3D Tiles
    hasGoogle3D: true,
    meshType: 'google-3d'
  },

  // --- Italy ---
  'colosseum': {
    id: 'colosseum',
    name: 'Colosseum',
    area: 'Rome',
    country: 'Italy',
    countryFlag: '🇮🇹',
    region: 'Europe',
    lat: 41.89021,
    lon: 12.49223,
    height: 48.5,
    footprintRadius: 85.0,
    groundEllipsoidHeight: 70,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },

  // --- Germany ---
  'tempelhofer-feld': {
    id: 'tempelhofer-feld',
    name: 'Tempelhofer Feld',
    area: 'Berlin',
    country: 'Germany',
    countryFlag: '🇩🇪',
    region: 'Europe',
    lat: 52.47300,
    lon: 13.40400,
    height: 25.0,
    footprintRadius: 65.0,
    groundEllipsoidHeight: 85,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },

  // --- Japan ---
  'tokyo-tower': {
    id: 'tokyo-tower',
    name: 'Tokyo Tower',
    area: 'Tokyo',
    country: 'Japan',
    countryFlag: '🇯🇵',
    region: 'Asia & Middle East',
    lat: 35.65858,
    lon: 139.74543,
    height: 333.0,
    footprintRadius: 45.0,
    groundEllipsoidHeight: 65,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'shibuya-crossing': {
    id: 'shibuya-crossing',
    name: 'Shibuya Scramble Crossing',
    area: 'Tokyo',
    country: 'Japan',
    countryFlag: '🇯🇵',
    region: 'Asia & Middle East',
    lat: 35.65950,
    lon: 139.70055,
    height: 60.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: 50,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },
  'yoyogi-park': {
    id: 'yoyogi-park',
    name: 'Yoyogi Park & Harajuku',
    area: 'Tokyo',
    country: 'Japan',
    countryFlag: '🇯🇵',
    region: 'Asia & Middle East',
    lat: 35.66980,
    lon: 139.70290,
    height: 30.0,
    footprintRadius: 40.0,
    groundEllipsoidHeight: 65,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  },

  // --- United Arab Emirates ---
  'burj-khalifa': {
    id: 'burj-khalifa',
    name: 'Burj Khalifa',
    area: 'Dubai',
    country: 'United Arab Emirates',
    countryFlag: '🇦🇪',
    region: 'Asia & Middle East',
    lat: 25.19720,
    lon: 55.27438,
    height: 828.0,
    footprintRadius: 65.0,
    groundEllipsoidHeight: -10,
    model: null,
    hasGoogle3D: false,
    meshType: 'satellite-terrain'
  },

  // --- Singapore ---
  'marina-bay-sands': {
    id: 'marina-bay-sands',
    name: 'Marina Bay Sands',
    area: 'Singapore',
    country: 'Singapore',
    countryFlag: '🇸🇬',
    region: 'Asia & Middle East',
    lat: 1.28340,
    lon: 103.86070,
    height: 200.0,
    footprintRadius: 85.0,
    groundEllipsoidHeight: 15,
    model: null,
    hasGoogle3D: false,
    meshType: 'satellite-terrain'
  },

  // --- Australia ---
  'sydney-opera-house': {
    id: 'sydney-opera-house',
    name: 'Sydney Opera House',
    area: 'Sydney',
    country: 'Australia',
    countryFlag: '🇦🇺',
    region: 'Oceania',
    lat: -33.85678,
    lon: 151.21530,
    height: 65.0,
    footprintRadius: 60.0,
    groundEllipsoidHeight: 25,
    model: null,
    hasGoogle3D: true,
    meshType: 'google-3d'
  }
};

export const DEFAULT_LANDMARK = LANDMARKS['qutub-minar'];

// Landmark chosen by `?landmark=<id>`, falling back to the default
export const landmarkFromUrl = () =>
  LANDMARKS[new URLSearchParams(window.location.search).get('landmark')] ?? DEFAULT_LANDMARK;

/**
 * Two-tier Country -> Landmark selector helper for Virtual and On-Site AR HUDs.
 * @param {HTMLSelectElement} countrySelect
 * @param {HTMLSelectElement} landmarkSelect
 * @param {typeof DEFAULT_LANDMARK} currentLandmark
 * @param {(landmarkId: string) => void} onSelect
 */
export function setupLandmarkPicker(countrySelect, landmarkSelect, currentLandmark, onSelect) {
  if (!countrySelect || !landmarkSelect) return;

  // Extract unique countries in appearance order
  const countries = [];
  const countryFlags = {};
  for (const item of Object.values(LANDMARKS)) {
    if (!countries.includes(item.country)) {
      countries.push(item.country);
      countryFlags[item.country] = item.countryFlag || '';
    }
  }

  // Populate Country dropdown
  countrySelect.innerHTML = '';
  for (const country of countries) {
    const flag = countryFlags[country] ? `${countryFlags[country]} ` : '';
    countrySelect.add(new Option(`${flag}${country}`, country, false, country === currentLandmark.country));
  }

  // Populate Landmark dropdown for the chosen country
  const populateLandmarks = (country, selectedId) => {
    landmarkSelect.innerHTML = '';
    const items = Object.values(LANDMARKS).filter((l) => l.country === country);
    if (!items.some((l) => l.id === selectedId)) {
      landmarkSelect.add(new Option('— Select Landmark —', '', true, true));
      landmarkSelect.options[0].disabled = true;
    }
    for (const item of items) {
      const badge = item.hasGoogle3D ? ' 🌐3D' : item.model ? ' 🏛️3D' : '';
      landmarkSelect.add(new Option(`${item.name}${badge}`, item.id, false, item.id === selectedId));
    }
  };

  populateLandmarks(currentLandmark.country, currentLandmark.id);

  // When Country changes, update landmark options in-place WITHOUT reloading the page!
  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    populateLandmarks(selectedCountry, null);
  });

  // When Landmark changes, trigger callback
  landmarkSelect.addEventListener('change', () => {
    if (landmarkSelect.value && landmarkSelect.value !== currentLandmark.id) {
      onSelect(landmarkSelect.value);
    }
  });
}
