/**
 * Landmark registry: every place the experience can be anchored to, on-site or virtually.
 * Coordinates are the centre of the structure's base (WGS84 degrees); height is in metres.
 */

export const LANDMARKS = {
  'qutub-minar': {
    id: 'qutub-minar',
    name: 'Qutub Minar',
    area: 'Mehrauli',
    lat: 28.52440,   // OpenStreetMap; cross-checked against Google 3D tiles in virtual mode
    lon: 77.18550,
    height: 72.5
  }
};

export const DEFAULT_LANDMARK = LANDMARKS['qutub-minar'];

// Landmark chosen by `?landmark=<id>`, falling back to the default
export const landmarkFromUrl = () =>
  LANDMARKS[new URLSearchParams(window.location.search).get('landmark')] ?? DEFAULT_LANDMARK;
