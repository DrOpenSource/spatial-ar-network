/**
 * A GLB model flying a banked circle around a vertical (Y) axis.
 * Shared by the sticker mode (units = sticker widths) and the on-site GPS mode (units = metres).
 * Models must follow the public/models convention: glTF Y-up, nose toward −X.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const BELL_206 = {
  url: `${import.meta.env.BASE_URL}models/bell206.glb`,
  credit: '3D model: “Bell 206 JetRanger” by terran4627, CC BY 4.0 (modified)'  // keep in sync with public/models/README.md
};

/**
 * @param {object} options
 * @param {string} options.url      GLB to load
 * @param {number} options.size     longest side of the model
 * @param {number} options.orbitRadius
 * @param {number} options.speed    radians per second
 * @param {number} options.bank     roll into the turn, radians
 * @param {number} [options.bob=0]  amplitude of the gentle up/down drift
 * @returns {{ object: THREE.Group, loaded: Promise<void>, update: (seconds: number) => void }}
 *   Add `object` to the scene at the orbit centre; call `update` each frame with elapsed time.
 */
export function createFlyover({ url, size, orbitRadius, speed, bank, bob = 0 }) {
  // Nesting keeps each transform simple: pivot spins around Y → flyer sits on the circle facing
  // along it → bankGroup rolls toward the centre of the turn
  const pivot = new THREE.Group();
  const flyer = new THREE.Group();
  flyer.position.x = orbitRadius;
  flyer.rotation.y = -Math.PI / 2;  // nose (−X) → direction of travel (−Z at the start of the orbit)
  const bankGroup = new THREE.Group();
  bankGroup.rotation.x = bank;
  flyer.add(bankGroup);
  pivot.add(flyer);

  const loaded = new Promise((resolve, reject) => {
    new GLTFLoader().load(
      url,
      (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const dims = box.getSize(new THREE.Vector3());
        model.position.sub(box.getCenter(new THREE.Vector3()));

        const wrapper = new THREE.Group();
        wrapper.add(model);
        wrapper.scale.setScalar(size / Math.max(dims.x, dims.y, dims.z));
        bankGroup.add(wrapper);
        resolve();
      },
      undefined,
      reject
    );
  });

  // Driven by elapsed time so speed is the same on 30fps and 60fps phones
  const update = (seconds) => {
    pivot.rotation.y = seconds * speed;
    flyer.position.y = Math.sin(seconds * 1.3) * bob;
  };

  return { object: pivot, loaded, update };
}
