import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

// Test the AI image analysis with a public image
export async function GET(request: NextRequest) {
  try {
    const imageUrl = "http://localhost:3000/classic-denim-jacket.png"
    const customerId = "demo-customer"

    console.log("Testing AI image analysis with URL:", imageUrl)

    const analysisResponse = await fetch('http://localhost:3000/api/ai/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: imageUrl,
        customerId: customerId
      })
    })

    if (!analysisResponse.ok) {
      const error = await analysisResponse.json()
      return NextResponse.json({ 
        error: "AI analysis failed",
        details: error 
      }, { status: 500 })
    }

    const result = await analysisResponse.json()
    
    // Save the analyzed item to wardrobe
    const saveResponse = await fetch('http://localhost:3000/api/wardrobe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data)
    })

    if (!saveResponse.ok) {
      const error = await saveResponse.json()
      return NextResponse.json({ 
        error: "Failed to save to wardrobe",
        details: error 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "AI analysis test completed successfully",
      analysis: result.data,
      saved: await saveResponse.json()
    })

  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json({ 
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}