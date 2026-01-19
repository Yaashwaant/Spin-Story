// Create a small test image for upload testing
const fs = require('fs')

// Create a simple 1x1 red pixel PNG in base64
const redPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
const buffer = Buffer.from(redPixelBase64, 'base64')

fs.writeFileSync('test-red-pixel.png', buffer)
console.log('✅ Created test image: test-red-pixel.png')