'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/manifest.json'), 'utf8'));
if (manifest.format !== 'classic-script-fragments-v1' || !Array.isArray(manifest.order) || manifest.order.length === 0) {
  throw new Error('Unsupported or empty source manifest');
}
const seen = new Set();
const parts = manifest.order.map((name) => {
  if (seen.has(name) || path.basename(name) !== name || !name.endsWith('.js')) throw new Error('Invalid/duplicate source part: ' + name);
  seen.add(name);
  return fs.readFileSync(path.join(root, 'src', name));
});
const output = Buffer.concat(parts);
const artifactPath = path.join(root, 'tseOptionZharfa.js');
if (process.argv.includes('--check')) {
  const artifact = fs.readFileSync(artifactPath);
  if (!artifact.equals(output)) {
    console.error('Parity failure: tseOptionZharfa.js is not the deterministic concatenation of src/manifest.json');
    process.exit(1);
  }
  console.log('Parity OK — ' + manifest.order.length + ' ordered source fragments, ' + output.length + ' bytes');
} else {
  fs.writeFileSync(artifactPath, output);
  console.log('Built tseOptionZharfa.js — ' + manifest.order.length + ' ordered source fragments, ' + output.length + ' bytes');
}
