// Script to generate PNG icons from SVG
// Run with: node scripts/generate-icons.mjs
// Requires: npm install sharp (or use any online SVG-to-PNG converter)
//
// ALTERNATIF MUDAH (tanpa install apapun):
// 1. Buka https://cloudconvert.com/svg-to-png
// 2. Upload public/icons/icon.svg
// 3. Convert ke 512x512, 192x192, 180x180
// 4. Simpan sebagai icon-512x512.png, icon-192x192.png, icon-180x180.png
// 5. Letakkan di folder public/icons/

import { readFileSync, writeFileSync } from 'fs'

// If you have 'sharp' installed, uncomment below:
/*
import sharp from 'sharp'
const svgBuffer = readFileSync('./public/icons/icon.svg')
const sizes = [512, 192, 180, 152, 144, 128, 96, 72]
for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`./public/icons/icon-${size}x${size}.png`)
  console.log(`Generated icon-${size}x${size}.png`)
}
*/

console.log('See comments above for icon generation instructions')
