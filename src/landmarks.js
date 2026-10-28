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
  'qutub-minar': {
    id: 'qutub-minar',
    name: 'Qutub Minar',
    area: 'Mehrauli',
    lat: 28.52443,   // base centre, checked top-down against Google satellite imagery (±2 m)
    lon: 77.18546,
    height: 72.5,
    footprintRadius: 7.2,
    groundEllipsoidHeight: 200,  // ~240 m above sea level, geoid ~40 m below sea level
    model: 'qutub-minar'         // Google has no 3D buildings for Mehrauli, only flat imagery
  },
  'eiffel-tower': {
    id: 'eiffel-tower',
    name: 'Eiffel Tower',
    area: 'Paris',
    lat: 48.85826,
    lon: 2.29448,
    height: 330,
    footprintRadius: 63,
    groundEllipsoidHeight: 80,   // ~35 m above sea level, geoid ~45 m above the ellipsoid
    model: null                  // covered by Google Photorealistic 3D Tiles
  }
};

export const DEFAULT_LANDMARK = LANDMARKS['qutub-minar'];

// Landmark chosen by `?landmark=<id>`, falling back to the default
export const landmarkFromUrl = () =>
  LANDMARKS[new URLSearchParams(window.location.search).get('landmark')] ?? DEFAULT_LANDMARK;
