// Debug Firebase upload issue
const fs = require('fs')

async function debugFirebaseUpload() {
  console.log("🔍 Debugging Firebase Upload Issue")
  console.log("=====================================")

  try {
    // Step 1: Get Firebase upload URL
    console.log("1️⃣ Getting Firebase upload URL...")
    const uploadResponse = await fetch('http://localhost:3000/api/wardrobe/upload-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileType: 'image/png',
        customerId: 'demo-customer',
        fileName: 'test-debug.png'
      })
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json()
      throw new Error(`Failed to get upload URL: ${error.error}`)
    }

    const { uploadUrl, publicUrl } = await uploadResponse.json()
    console.log("✅ Got Firebase upload URL:", publicUrl)

    // Step 2: Create a simple test image
    const redPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    const imageBuffer = Buffer.from(redPixelBase64, 'base64')

    // Step 3: Try to upload to Firebase
    console.log("\n2️⃣ Attempting Firebase upload...")
    console.log("Upload URL:", uploadUrl.substring(0, 100) + "...")
    
    const uploadResult = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      body: imageBuffer
    })

    console.log("Upload response status:", uploadResult.status)
    console.log("Upload response headers:", Object.fromEntries(uploadResult.headers.entries()))
    
    if (!uploadResult.ok) {
      const errorText = await uploadResult.text()
      console.log("Upload error response:", errorText)
      throw new Error(`Upload failed with status ${uploadResult.status}`)
    }

    console.log("✅ Firebase upload successful!")
    console.log("Public URL:", publicUrl)

  } catch (error) {
    console.error("❌ Debug failed:", error.message)
  }
}

debugFirebaseUpload().catch(console.error)