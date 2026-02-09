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

    const analysisPrompt = `You are an experienced professional fashion stylist with expertise in body type analysis, color theory, and personal styling. Analyze these photos to extract comprehensive styling characteristics that will help create the perfect wardrobe for this person.

Focus on observable physical characteristics, style essence, and fashion recommendations. Be detailed and specific in your analysis.

Return a JSON object with exactly these fields:
{
  "physique": "Detailed body type analysis (e.g., 'hourglass figure with balanced shoulders and hips', 'rectangular build with athletic shoulders', 'pear shape with narrow shoulders and fuller hips', 'inverted triangle with broad shoulders and slim legs')",
  "bodyProportions": "Specific proportion notes (e.g., 'long torso with shorter legs', 'balanced upper and lower body', 'shorter waist with longer legs', 'broad shoulders with narrow waist')",
  "skinTone": "Comprehensive color analysis (e.g., 'warm golden undertones - looks best in earth tones, coral, peach, and warm reds', 'cool pink undertones - excels in jewel tones, silver jewelry, and cool blues', 'neutral undertones - versatile with both warm and cool palettes')",
  "colorSeason": "Color season classification if determinable (e.g., 'Spring - warm and light', 'Summer - cool and soft', 'Autumn - warm and deep', 'Winter - cool and bright', 'Not clearly determinable from photos')",
  "personalityVibe": "Style personality assessment (e.g., 'classic elegance with modern sophistication', 'bohemian free-spirit with artistic flair', 'minimalist with attention to clean lines', 'edgy and bold with statement pieces', 'romantic and feminine with delicate details')",
  "styleEssence": "Primary style essence (e.g., 'dramatic - bold and striking pieces', 'natural - relaxed and effortless looks', 'romantic - soft and feminine details', 'gamine - playful and quirky elements', 'classic - timeless and refined pieces')",
  "recommendedSilhouettes": "Most flattering silhouettes (e.g., 'fitted waistlines and A-line skirts', 'structured blazers and straight-leg pants', 'empire waist and flowy fabrics', 'peplum tops and bootcut jeans')",
  "avoidSilhouettes": "Less flattering silhouettes to avoid (e.g., 'boxy oversized pieces that hide waist', 'high-neck tops that shorten neck', 'horizontal stripes on lower body', 'pleated pants that add bulk')",
  "fabricRecommendations": "Recommended fabric types (e.g., 'structured cotton and wool for definition', 'flowy silk and chiffon for movement', 'stretch jersey for comfort', 'linen for breathable elegance')",
  "patternGuidance": "Pattern recommendations (e.g., 'vertical stripes to elongate', 'small-scale prints for proportional balance', 'solid colors as foundation pieces', 'geometric patterns for modern edge')",
  "accessoryNotes": "Jewelry and accessory guidance (e.g., 'statement earrings to draw attention upward', 'long necklaces to create vertical lines', 'medium-width belts to define waist', 'delicate pieces for feminine touch')",
  "styleConfidence": "Apparent confidence level (e.g., 'appears confident and would suit bold choices', 'seems reserved - recommend starting with classic pieces', 'shows personality - can handle unique elements')",
  "lifestyleAdaptation": "Style adaptation for lifestyle (e.g., 'versatile pieces that transition day-to-night', 'comfortable yet polished for active lifestyle', 'professional wardrobe foundation needed')",
  "additionalNotes": "Any other detailed styling observations or recommendations"
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
      max_tokens: 800,
      temperature: 0.2
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
