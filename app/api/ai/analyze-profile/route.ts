import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { facePhoto, fullBodyPhoto } = await req.json()

    if (!facePhoto && !fullBodyPhoto) {
      return NextResponse.json({ error: "At least one photo is required" }, { status: 400 })
    }

    const analysisPrompt = `Analyze these fashion/style photos and provide styling characteristics in JSON format. Focus on observable elements only.

Return a JSON object with exactly these fields:
{
  "physique": "Body silhouette description (e.g., 'balanced proportions', 'athletic build', 'petite frame')",
  "skinTone": "Color palette recommendations (e.g., 'warm undertones', 'cool undertones', 'neutral palette')",
  "personalityVibe": "Style aesthetic (e.g., 'classic', 'modern', 'bohemian', 'minimalist', 'edgy')",
  "styleEssence": "Fashion category (e.g., 'dramatic', 'natural', 'romantic', 'gamine', 'classic')",
  "additionalNotes": "Any other styling observations"
}`

    const content: any[] = [
      { type: "text", text: analysisPrompt }
    ]

    if (facePhoto) {
      content.push({
        type: "image_url",
        image_url: {
          url: facePhoto.startsWith('data:') ? facePhoto : `data:image/jpeg;base64,${facePhoto}`,
          detail: "high"
        }
      })
    }

    if (fullBodyPhoto) {
      content.push({
        type: "image_url",
        image_url: {
          url: fullBodyPhoto.startsWith('data:') ? fullBodyPhoto : `data:image/jpeg;base64,${fullBodyPhoto}`,
          detail: "high"
        }
      })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    })

    const analysisResult = response.choices[0]?.message?.content
    
    if (!analysisResult) {
      return NextResponse.json({ error: "Failed to analyze profile photos" }, { status: 500 })
    }

    // Parse the JSON response
    let traits
    try {
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        traits = JSON.parse(jsonMatch[0])
      } else {
        traits = JSON.parse(analysisResult)
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisResult)
      return NextResponse.json({ error: "Invalid analysis response format" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      traits
    })

  } catch (error) {
    console.error("AI profile analysis error:", error)
    return NextResponse.json({ 
      error: "Failed to analyze profile",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
