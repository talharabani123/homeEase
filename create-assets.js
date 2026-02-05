const fs = require('fs');
const path = require('path');

// Create a simple PNG file (1x1 pixel) as placeholder
// PNG signature + IHDR chunk + IDAT chunk + IEND chunk
function createPlaceholderPNG(width, height, color) {
  // This creates a minimal valid PNG file
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(2, 17); // Color type (RGB)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace
  
  // Calculate CRC for IHDR
  const crc = require('zlib').crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(crc, 21);
  
  // Simple IDAT chunk with minimal data
  const idat = Buffer.from([
    0x00, 0x00, 0x00, 0x0C, // Length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0x99, 0x01, 0x01, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01,
    0xE5, 0x27, 0xDE, 0xFC // CRC
  ]);
  
  // IEND chunk
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, // Length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Create placeholder images
console.log('Creating placeholder images...');

// Icon (1024x1024)
fs.writeFileSync(
  path.join(assetsDir, 'icon.png'),
  createPlaceholderPNG(1024, 1024, '#7ED4AD')
);
console.log('✓ Created icon.png');

// Splash (1024x1024)
fs.writeFileSync(
  path.join(assetsDir, 'splash.png'),
  createPlaceholderPNG(1024, 1024, '#7ED4AD')
);
console.log('✓ Created splash.png');

// Adaptive icon (1024x1024)
fs.writeFileSync(
  path.join(assetsDir, 'adaptive-icon.png'),
  createPlaceholderPNG(1024, 1024, '#7ED4AD')
);
console.log('✓ Created adaptive-icon.png');

// Favicon (48x48)
fs.writeFileSync(
  path.join(assetsDir, 'favicon.png'),
  createPlaceholderPNG(48, 48, '#7ED4AD')
);
console.log('✓ Created favicon.png');

console.log('\nAll placeholder images created successfully!');
