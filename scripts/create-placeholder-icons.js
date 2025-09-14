/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');

// Simple 1x1 green PNG in base64
const greenPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Create a proper green square icon base64
const createGreenIcon = (size) => {
  // This is a simple green square - in production you'd want proper icons
  const canvas = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#059669"/>
  <rect x="${size * 0.125}" y="${size * 0.25}" width="${size * 0.75}" height="${size * 0.5}" fill="none" stroke="white" stroke-width="${size * 0.008}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.094}" fill="none" stroke="white" stroke-width="${size * 0.008}"/>
  <line x1="${size * 0.5}" y1="${size * 0.25}" x2="${size * 0.5}" y2="${size * 0.75}" stroke="white" stroke-width="${size * 0.008}"/>
</svg>`;
  return canvas;
};

// Write SVG files that browsers can use as icons
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icon files
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.svg'), createGreenIcon(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.svg'), createGreenIcon(512));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), createGreenIcon(180));

console.log('Placeholder SVG icons created successfully!');
console.log('For production, replace with proper PNG icons.');