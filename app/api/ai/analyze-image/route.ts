import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { imageData, imageUrl, customerId } = await req.json()

    if (!imageData && !imageUrl) {
      return NextResponse.json({ error: "Image data or URL is required" }, { status: 400 })
    }

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const analysisPrompt = `Analyze this clothing image and provide detailed information in JSON format. Be specific and accurate.

Return a JSON object with exactly these fields:
{
  "name": "Specific item name (e.g., 'Blue Denim Jacket', 'Black Leather Boots')",
  "type": "Category: shirt, pants, dress, jacket, shoes, accessories, etc.",
  "color": "Primary color(s) - be specific (e.g., 'navy blue', 'burgundy red', 'black and white stripes')",
  "season": "Best season(s): Spring, Summer, Fall, Winter, or All Season",
  "styles": ["List of style tags: casual, formal, business, sporty, elegant, vintage, modern, etc."],
  "description": "Brief description of the item including fabric, pattern, and notable features"
}

Analyze the image carefully and provide accurate, detailed information.`

    // Determine image content based on available data
    let imageContent
    if (imageData) {
      // Use base64 encoded image data directly
      imageContent = {
        type: "image_url" as const,
        image_url: {
          url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}`,
          detail: "high" as const
        }
      }
    } else {
      // Fallback to using URL
      imageContent = {
        type: "image_url" as const,
        image_url: {
          url: imageUrl,
          detail: "high" as const
        }
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            imageContent
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    const analysisResult = response.choices[0]?.message?.content
    
    if (!analysisResult) {
      return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
    }

    // Parse the JSON response
    let wardrobeData
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        wardrobeData = JSON.parse(jsonMatch[0])
      } else {
        wardrobeData = JSON.parse(analysisResult)
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisResult)
      return NextResponse.json({ error: "Invalid analysis response format" }, { status: 500 })
    }

    // Validate required fields
    const requiredFields = ['name', 'type', 'color', 'season', 'styles']
    for (const field of requiredFields) {
      if (!wardrobeData[field]) {
        return NextResponse.json({ 
          error: `Missing required field: ${field}`,
          details: "AI analysis incomplete"
        }, { status: 500 })
      }
    }

    // Ensure styles is an array
    if (!Array.isArray(wardrobeData.styles)) {
      wardrobeData.styles = [wardrobeData.styles].filter(Boolean)
    }

    return NextResponse.json({
      success: true,
      data: {
        ...wardrobeData,
        image: imageUrl || "", // Use provided URL or empty string
        customerId: customerId,
        aiAnalyzed: true
      }
    })

  } catch (error) {
    console.error("AI image analysis error:", error)
    return NextResponse.json({ 
      error: "Failed to analyze image",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}