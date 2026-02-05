const fs = require('fs');
const path = require('path');

// Try both possible locations for the externals.js file
const possiblePaths = [
  path.join(__dirname, 'node_modules/@expo/cli/build/src/start/server/metro/externals.js'),
  path.join(__dirname, 'node_modules/expo/node_modules/@expo/cli/build/src/start/server/metro/externals.js')
];

let filePath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    filePath = p;
    break;
  }
}

if (!filePath) {
  console.log('⚠ Expo CLI externals.js not found. Patch may not be needed for SDK 54+');
  process.exit(0);
}

console.log('Patching Expo CLI to fix Windows path issue...');
console.log('File location:', filePath);

let content = fs.readFileSync(filePath, 'utf8');

// Replace the problematic line that creates directories with colons
const oldCode = `const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, moduleId);`;
const newCode = `const shimDir = _path.default.join(projectRoot, METRO_EXTERNALS_FOLDER, moduleId.replace(/:/g, '_'));`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Successfully patched Expo CLI!');
  console.log('  Fixed: Replaced colons with underscores in module paths');
} else {
  console.log('⚠ Patch already applied or file structure changed');
}
