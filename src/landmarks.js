/**
 * Landmark registry: every place the experience can be anchored to, on-site or virtually.
 * Coordinates are the centre of the structure's base (WGS84 degrees); sizes are in metres.
 *
 * - footprintRadius: half the width of the structure's base, so rings and orbits clear it
 * - groundEllipsoidHeight: rough ground height above the WGS84 ellipsoid (≈ sea level + geoid);
 *   virtual mode starts there and refines it by raycasting Google's tiles (within ±300 m)
 * - model: our own 3D model to show where Google has no photorealistic 3D coverage (null = rely on Google)
 */

export const LANDMARKS = {
  // --- India & Delhi-NCR Pilot ---
  'qutub-minar': {
    id: 'qutub-minar',
    name: 'Qutub Minar',
    area: 'Mehrauli, New Delhi',
    region: 'India (Delhi-NCR)',
    lat: 28.52443,   // base centre, checked top-down against Google satellite imagery (±2 m)
    lon: 77.18546,
    height: 72.5,
    footprintRadius: 7.2,
    groundEllipsoidHeight: 200,  // ~240 m above sea level, geoid ~40 m below sea level
    model: 'qutub-minar'         // Google has no 3D buildings for Mehrauli, only flat imagery
  },
  'india-gate': {
    id: 'india-gate',
    name: 'India Gate',
    area: 'New Delhi',
    region: 'India (Delhi-NCR)',
    lat: 28.61291,
    lon: 77.22951,
    height: 42.0,
    footprintRadius: 18.0,
    groundEllipsoidHeight: 170,
    model: null
  },
  'dlf-cyberhub': {
    id: 'dlf-cyberhub',
    name: 'DLF CyberHub',
    area: 'Gurgaon',
    region: 'India (Delhi-NCR)',
    lat: 28.49503,
    lon: 77.08906,
    height: 45.0,
    footprintRadius: 40.0,
    groundEllipsoidHeight: 180,
    model: null
  },
  'taj-mahal': {
    id: 'taj-mahal',
    name: 'Taj Mahal',
    area: 'Agra',
    region: 'India (Heritage)',
    lat: 27.17514,
    lon: 78.04214,
    height: 73.0,
    footprintRadius: 55.0,
    groundEllipsoidHeight: 125,
    model: null
  },

  // --- Europe ---
  'eiffel-tower': {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    area: 'Paris',
    region: 'Europe',
    lat: 48.85826,
    lon: 2.29448,
    height: 330.0,
    footprintRadius: 63.0,
    groundEllipsoidHeight: 80,   // ~35 m above sea level, geoid ~45 m above the ellipsoid
    model: null                  // covered by Google Photorealistic 3D Tiles
  },
  'big-ben': {
    id: 'big-ben',
    name: 'Big Ben',
    area: 'London',
    region: 'Europe',
    lat: 51.50073,
    lon: -0.12463,
    height: 96.0,
    footprintRadius: 14.0,
    groundEllipsoidHeight: 50,
    model: null
  },
  'colosseum': {
    id: 'colosseum',
    name: 'Colosseum',
    area: 'Rome',
    region: 'Europe',
    lat: 41.89021,
    lon: 12.49223,
    height: 48.5,
    footprintRadius: 85.0,
    groundEllipsoidHeight: 70,
    model: null
  },
  'southbank-undercroft': {
    id: 'southbank-undercroft',
    name: 'Southbank Undercroft',
    area: 'London',
    region: 'Europe',
    lat: 51.50650,
    lon: -0.11650,
    height: 35.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: 50,
    model: null
  },
  'leicester-square': {
    id: 'leicester-square',
    name: 'Leicester Square',
    area: 'London',
    region: 'Europe',
    lat: 51.51130,
    lon: -0.12840,
    height: 30.0,
    footprintRadius: 32.0,
    groundEllipsoidHeight: 55,
    model: null
  },
  'tempelhofer-feld': {
    id: 'tempelhofer-feld',
    name: 'Tempelhofer Feld',
    area: 'Berlin',
    region: 'Europe',
    lat: 52.47300,
    lon: 13.40400,
    height: 25.0,
    footprintRadius: 65.0,
    groundEllipsoidHeight: 85,
    model: null
  },

  // --- Americas ---
  'statue-of-liberty': {
    id: 'statue-of-liberty',
    name: 'Statue of Liberty',
    area: 'New York',
    region: 'Americas',
    lat: 40.68925,
    lon: -74.04450,
    height: 93.0,
    footprintRadius: 32.0,
    groundEllipsoidHeight: -25,
    model: null
  },
  'empire-state': {
    id: 'empire-state',
    name: 'Empire State Building',
    area: 'New York',
    region: 'Americas',
    lat: 40.74844,
    lon: -73.98566,
    height: 381.0,
    footprintRadius: 45.0,
    groundEllipsoidHeight: -15,
    model: null
  },
  'times-square': {
    id: 'times-square',
    name: 'Times Square',
    area: 'New York',
    region: 'Americas',
    lat: 40.75800,
    lon: -73.98550,
    height: 110.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: -20,
    model: null
  },
  'space-needle': {
    id: 'space-needle',
    name: 'Space Needle',
    area: 'Seattle',
    region: 'Americas',
    lat: 47.62051,
    lon: -122.34928,
    height: 184.0,
    footprintRadius: 25.0,
    groundEllipsoidHeight: 20,
    model: null
  },
  'venice-skatepark': {
    id: 'venice-skatepark',
    name: 'Venice Skatepark',
    area: 'Los Angeles',
    region: 'Americas',
    lat: 33.98703,
    lon: -118.47352,
    height: 14.0,
    footprintRadius: 30.0,
    groundEllipsoidHeight: -35,
    model: null
  },
  'huntington-beach-pier': {
    id: 'huntington-beach-pier',
    name: 'Huntington Beach Pier',
    area: 'California',
    region: 'Americas',
    lat: 33.65530,
    lon: -117.99950,
    height: 18.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: -35,
    model: null
  },

  // --- Asia & Middle East ---
  'tokyo-tower': {
    id: 'tokyo-tower',
    name: 'Tokyo Tower',
    area: 'Tokyo',
    region: 'Asia & Middle East',
    lat: 35.65858,
    lon: 139.74543,
    height: 333.0,
    footprintRadius: 45.0,
    groundEllipsoidHeight: 65,
    model: null
  },
  'shibuya-crossing': {
    id: 'shibuya-crossing',
    name: 'Shibuya Scramble Crossing',
    area: 'Tokyo',
    region: 'Asia & Middle East',
    lat: 35.65950,
    lon: 139.70055,
    height: 60.0,
    footprintRadius: 35.0,
    groundEllipsoidHeight: 50,
    model: null
  },
  'yoyogi-park': {
    id: 'yoyogi-park',
    name: 'Yoyogi Park & Harajuku',
    area: 'Tokyo',
    region: 'Asia & Middle East',
    lat: 35.66980,
    lon: 139.70290,
    height: 30.0,
    footprintRadius: 40.0,
    groundEllipsoidHeight: 65,
    model: null
  },
  'burj-khalifa': {
    id: 'burj-khalifa',
    name: 'Burj Khalifa',
    area: 'Dubai',
    region: 'Asia & Middle East',
    lat: 25.19720,
    lon: 55.27438,
    height: 828.0,
    footprintRadius: 65.0,
    groundEllipsoidHeight: -10,
    model: null
  },
  'marina-bay-sands': {
    id: 'marina-bay-sands',
    name: 'Marina Bay Sands',
    area: 'Singapore',
    region: 'Asia & Middle East',
    lat: 1.28340,
    lon: 103.86070,
    height: 200.0,
    footprintRadius: 85.0,
    groundEllipsoidHeight: 15,
    model: null
  },

  // --- Oceania ---
  'sydney-opera-house': {
    id: 'sydney-opera-house',
    name: 'Sydney Opera House',
    area: 'Sydney',
    region: 'Oceania',
    lat: -33.85678,
    lon: 151.21530,
    height: 65.0,
    footprintRadius: 60.0,
    groundEllipsoidHeight: 25,
    model: null
  }
};

export const DEFAULT_LANDMARK = LANDMARKS['qutub-minar'];

// Landmark chosen by `?landmark=<id>`, falling back to the default
export const landmarkFromUrl = () =>
  LANDMARKS[new URLSearchParams(window.location.search).get('landmark')] ?? DEFAULT_LANDMARK;
