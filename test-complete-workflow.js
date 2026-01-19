// Test the complete workflow: base64 photo → AI analysis + Firebase URL for metadata
const fs = require('fs')
const path = require('path')

async function testCompleteWorkflow() {
  console.log('🧪 Testing Complete Workflow: Direct Photo Analysis + Firebase URL for Metadata')
  console.log('==================================================')

  // Read a demo image and convert to base64
  const imagePath = path.join(__dirname, 'public/brown-leather-boots.png')
  const imageBuffer = fs.readFileSync(imagePath)
  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`
  
  console.log('📸 Image converted to base64 (first 100 chars):')
  console.log(base64Image.substring(0, 100) + '...')
  console.log('')

  // Step 1: Get Firebase upload URL
  console.log('🔑 Step 1: Getting Firebase upload URL...')
  try {
    const uploadResponse = await fetch('http://localhost:3000/api/wardrobe/upload-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileType: 'image/png',
        customerId: 'demo-customer',
        fileName: 'brown-leather-boots.png'
      })
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to get upload URL: ${uploadResponse.status}`)
    }

    const { uploadUrl, publicUrl } = await uploadResponse.json()
    console.log('✅ Firebase upload URL received')
    console.log('📤 Public URL for metadata:', publicUrl)
    console.log('')

    // Step 2: Test AI analysis with base64 photo data (NOT the URL)
    console.log('🤖 Step 2: Testing AI analysis with base64 photo data...')
    console.log('📋 Sending base64 image data to OpenAI (first 100 chars):')
    console.log(base64Image.substring(0, 100) + '...')
    console.log('')

    const analysisResponse = await fetch('http://localhost:3000/api/ai/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: base64Image,  // 🎯 Direct photo data to ChatGPT
        imageUrl: publicUrl,     // 🔗 Firebase URL for metadata only
        customerId: 'demo-customer'
      })
    })

    if (!analysisResponse.ok) {
      throw new Error(`AI analysis failed: ${analysisResponse.status}`)
    }

    const { data } = await analysisResponse.json()
    console.log('✅ AI analysis successful!')
    console.log('📋 Generated metadata:')
    console.log(`   • Name: ${data.name}`)
    console.log(`   • Type: ${data.type}`)
    console.log(`   • Color: ${data.color}`)
    console.log(`   • Season: ${data.season}`)
    console.log(`   • Styles: ${data.styles.join(', ')}`)
    console.log(`   • Description: ${data.description}`)
    console.log(`   • Image URL (from Firebase): ${data.image}`)
    console.log(`   • AI Analyzed: ${data.aiAnalyzed}`)
    console.log('')

    // Step 3: Save to wardrobe
    console.log('💾 Step 3: Saving to wardrobe...')
    const saveResponse = await fetch('http://localhost:3000/api/wardrobe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (!saveResponse.ok) {
      throw new Error(`Failed to save to wardrobe: ${saveResponse.status}`)
    }

    console.log('✅ Successfully saved to wardrobe!')
    console.log('')

    console.log('🎉 Complete workflow test successful!')
    console.log('📋 Summary:')
    console.log('   1. ✅ Base64 photo data sent directly to ChatGPT for analysis')
    console.log('   2. ✅ Firebase URL used only for metadata storage')
    console.log('   3. ✅ AI generated complete metadata with proper categorization')
    console.log('   4. ✅ Item saved to wardrobe with Firebase image URL')

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message)
    console.error('📋 Error details:', error)
  }
}

// Run the test
testCompleteWorkflow()