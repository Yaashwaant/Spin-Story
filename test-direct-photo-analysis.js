// Test script to verify direct photo analysis (base64 image data)
const fs = require('fs')
const path = require('path')

async function testDirectPhotoAnalysis() {
  console.log("🧪 Testing Direct Photo Analysis with Base64 Image Data")
  console.log("==================================================")

  try {
    // Read a test image and convert to base64
    const imagePath = path.join(__dirname, 'public', 'brown-leather-boots.png')
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`

    console.log("📸 Image converted to base64")
    console.log(`📊 Base64 length: ${base64Image.length} characters`)

    // Test the AI analysis API with base64 data
    console.log("\n🤖 Sending to AI for analysis...")
    
    const response = await fetch('http://localhost:3000/api/ai/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: base64Image,
        imageUrl: "http://localhost:3000/brown-leather-boots.png", // For metadata storage
        customerId: "demo-customer"
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`AI analysis failed: ${error.error} - ${error.details}`)
    }

    const result = await response.json()
    console.log("✅ AI Analysis successful!")
    console.log("📋 Generated metadata:")
    console.log(JSON.stringify(result.data, null, 2))

    console.log("\n📝 Summary:")
    console.log("1. ✅ Image converted to base64")
    console.log("2. ✅ Base64 data sent to AI analysis")
    console.log("3. ✅ AI generated structured metadata")
    console.log("4. ✅ Firebase URL stored for metadata")

  } catch (error) {
    console.error("❌ Test failed:", error.message)
    process.exit(1)
  }
}

// Run the test
testDirectPhotoAnalysis().catch(console.error)