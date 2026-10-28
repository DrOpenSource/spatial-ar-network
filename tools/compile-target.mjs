/**
 * Compile an image into a MindAR .mind tracking target (offline, no browser needed).
 *
 *   node tools/compile-target.mjs <image.png> <output.mind>
 *   node tools/compile-target.mjs --stats <file.mind>    # inspect an existing target
 */

import fs from 'node:fs';
import { loadImage } from 'canvas';
import * as msgpack from '@msgpack/msgpack';
import { OfflineCompiler } from 'mind-ar/src/image-target/offline-compiler.js';

// Feature-point counts per target: matching = detection from afar, tracking = lock-on stability
const printStats = (buffer) => {
  const { dataList } = msgpack.decode(new Uint8Array(buffer));
  dataList.forEach(({ targetImage, matchingData, trackingData }, i) => {
    const matching = matchingData.map((s) => s.maximaPoints.length + s.minimaPoints.length);
    const tracking = trackingData.map((s) => s.points.length);
    const sum = (arr) => arr.reduce((a, b) => a + b, 0);
    console.log(`target ${i}: ${targetImage.width}x${targetImage.height}`);
    console.log(`  matching points: ${sum(matching)}  (per scale: ${matching.join(', ')})`);
    console.log(`  tracking points: ${sum(tracking)}  (per scale: ${tracking.join(', ')})`);
  });
};

const [, , first, second] = process.argv;

if (first === '--stats' && second) {
  printStats(fs.readFileSync(second));
} else if (first && second) {
  const image = await loadImage(first);
  const compiler = new OfflineCompiler();
  let lastLogged = -10;
  await compiler.compileImageTargets([image], (percent) => {
    if (percent - lastLogged >= 10) {
      process.stdout.write(`compiling… ${Math.floor(percent)}%\r`);
      lastLogged = percent;
    }
  });
  const buffer = compiler.exportData();
  fs.writeFileSync(second, buffer);
  console.log(`\nwrote ${second} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  printStats(buffer);
} else {
  console.error('usage: node tools/compile-target.mjs <image> <output.mind> | --stats <file.mind>');
  process.exit(1);
}
