import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds timeout
  maxRetries: 3,  // Retry up to 3 times
})

function generatePersonalizedAdvice(traits: any): string {
  const {
    visualFramePresence,
    shoulderBalance,
    torsoToLegBalance,
    verticalEmphasis,
    horizontalEmphasis,
    silhouetteStructure,
    visualWeightDistribution,
    contrastLevel,
    fitObservation,
    stylingLevers = {}
  } = traits

  const {
    recommendedJacketLength,
    recommendedTrouserRise,
    lapelStrategy,
    taperStrategy,
    fabricWeightSuggestion,
    colorContrastStrategy
  } = stylingLevers

  let advice = "Here are styling suggestions based on your overall silhouette and outfit proportions.\n\n"

  const sections: string[] = []

  if (visualFramePresence || silhouetteStructure || fitObservation) {
    sections.push(
      `**Silhouette focus**: ${[
        visualFramePresence,
        silhouetteStructure,
        fitObservation
      ]
        .filter(Boolean)
        .join(" ")}`
    )
  }

  if (shoulderBalance || visualWeightDistribution || horizontalEmphasis) {
    sections.push(
      `**Upper body balance**: ${[
        shoulderBalance,
        visualWeightDistribution,
        horizontalEmphasis
      ]
        .filter(Boolean)
        .join(" ")}`
    )
  }

  if (torsoToLegBalance || verticalEmphasis) {
    sections.push(
      `**Proportion emphasis**: ${[
        torsoToLegBalance,
        verticalEmphasis
      ]
        .filter(Boolean)
        .join(" ")}`
    )
  }

  const leverParts: string[] = []

  if (recommendedJacketLength) {
    leverParts.push(`Jacket length: ${recommendedJacketLength}`)
  }
  if (recommendedTrouserRise) {
    leverParts.push(`Trouser rise: ${recommendedTrouserRise}`)
  }
  if (lapelStrategy) {
    leverParts.push(`Lapel strategy: ${lapelStrategy}`)
  }
  if (taperStrategy) {
    leverParts.push(`Taper strategy: ${taperStrategy}`)
  }
  if (fabricWeightSuggestion) {
    leverParts.push(`Fabric weight: ${fabricWeightSuggestion}`)
  }
  if (colorContrastStrategy || contrastLevel) {
    leverParts.push(
      `Color and contrast: ${[
        contrastLevel,
        colorContrastStrategy
      ]
        .filter(Boolean)
        .join(" ")}`
    )
  }

  if (leverParts.length > 0) {
    sections.push(
      `**Styling levers to adjust balance**:\n` +
        leverParts.map((part) => `- ${part}`).join("\n")
    )
  }

  if (sections.length === 0) {
    return (
      advice +
      "Focus on clean lines, balanced proportions, and comfortable tailoring that supports your day-to-day wardrobe."
    )
  }

  return advice + sections.join("\n\n")
}

export async function POST(req: NextRequest) {
  try {
    let facePhoto: string | File | null = null;
    let fullBodyPhoto: string | File | null = null;
    
    // Check content type to handle both JSON and FormData
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle direct file uploads (FormData)
      const formData = await req.formData();
      facePhoto = formData.get('facePhoto') as File | null;
      fullBodyPhoto = formData.get('fullBodyPhoto') as File | null;
    } else {
      // Handle existing base64 format (JSON)
      const jsonData = await req.json();
      facePhoto = jsonData.facePhoto || null;
      fullBodyPhoto = jsonData.fullBodyPhoto || null;
    }

    if (!facePhoto && !fullBodyPhoto) {
      return NextResponse.json({ error: "At least one photo is required" }, { status: 400 })
    }

    const content: any[] = []

    // Helper function to process images (File or base64 string)
    const processImage = async (image: string | File): Promise<string> => {
      if (typeof image === 'string') {
        // Handle existing base64 format
        if (!image.startsWith('data:')) {
          if (image.includes('base64,')) {
            return image;
          } else {
            return `data:image/jpeg;base64,${image}`;
          }
        }
        return image;
      } else {
        // Handle File object - convert to base64 for OpenAI
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:${image.type};base64,${base64}`;
      }
    };

    if (facePhoto) {
      const imageUrl = await processImage(facePhoto);
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
          detail: "low" // Reduced from "high" for faster processing
        }
      })
    }

    if (fullBodyPhoto) {
      const imageUrl = await processImage(fullBodyPhoto);
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
          detail: "low" // Reduced from "high" for faster processing
        }
      })
    }

    let traits: any | null = null

    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Vision model that supports images
        messages: [
          {
            role: "system",
            content: `You are a visual proportion and color-structure analyst.

Your task is to extract ONLY objective, observable physical structure and visible skin tone information from the provided image(s).
This output will be used by an automated styling engine.

CRITICAL RULES:
- Do NOT identify the person.
- Do NOT guess or infer race, ethnicity, nationality, culture, religion, gender identity, age, attractiveness, health, or personality.
- Do NOT describe clothing style or fashion choices.
- Do NOT give advice, recommendations, or explanations.
- Do NOT add commentary.
- Only extract visually observable structural and color characteristics.
- If something cannot be determined visually, choose the closest valid enum option.
- Be decisive. Do not hedge.
- Output MUST be valid JSON only.
- No markdown.
- No extra keys.
- No text outside the JSON object.

Skin tone must be described strictly as visual color properties:
- "depth" refers only to lightness/darkness.
- "undertone" refers only to visible color bias (cool, warm, neutral, olive).
- Do NOT associate tone with demographic groups.

Return EXACTLY this JSON structure:

{
  "visualFramePresence": "light|moderate|strong",
  "shoulderBalance": "narrow|balanced|broad",
  "torsoToLegBalance": "longer torso|balanced|longer legs",
  "verticalEmphasis": "low|moderate|strong",
  "horizontalEmphasis": "low|moderate|strong",
  "silhouetteStructure": "structured|moderate|relaxed",
  "visualWeightDistribution": "upper|midsection|lower|even",
  "contrastLevel": "low|medium|high",
  "fitObservation": "close-fitting|balanced|loose",

  "skinTone": {
    "depth": "very-light|light|medium|tan|deep",
    "undertone": "cool|warm|neutral|olive"
  },

  "styleEssence": "classic|minimal|modern|bold|relaxed",
  "colorHarmony": "neutral-dominant|warm-dominant|cool-dominant|mixed",

  "stylingLevers": {
    "recommendedJacketLength": "cropped|standard|elongated",
    "recommendedTrouserRise": "low|mid|high",
    "lapelStrategy": "narrow|medium|wide",
    "taperStrategy": "straight|moderate|aggressive",
    "fabricWeightSuggestion": "light|medium|heavy",
    "colorContrastStrategy": "low|medium|high"
  }
}`
          },
          {
            role: "user",
            content: content
          }
        ],
        max_tokens: 800, // Increased for complete analysis but still reasonable
        temperature: 0.2, // Slightly higher for better analysis
        top_p: 0.95, // More natural responses
        frequency_penalty: 0,
        presence_penalty: 0
      })

      const analysisResult = response.choices[0]?.message?.content

      if (!analysisResult) {
        console.error("Empty AI analysis response on attempt", attempt + 1)
        continue
      }

      console.log("AI Response attempt", attempt + 1, ":", analysisResult)
      console.log("Full AI response:", JSON.stringify(response, null, 2))

      let cleanedResult = analysisResult.trim()
      
      try {
        // Clean markdown formatting if present
        
        // Remove ```json ... ``` wrapping
        if (cleanedResult.includes('```json')) {
          cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        }
        // Remove ``` ... ``` wrapping (without json label)
        else if (cleanedResult.includes('```')) {
          cleanedResult = cleanedResult.replace(/```\n?/g, '').trim()
        }
        
        console.log("Cleaned AI response:", cleanedResult)
        
        const jsonMatch = cleanedResult.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          traits = JSON.parse(jsonMatch[0])
        } else {
          traits = JSON.parse(cleanedResult)
        }
        break
      } catch (parseError) {
        console.error("Failed to parse AI response on attempt", attempt + 1)
        console.error("Parse error:", parseError)
        console.error("Raw AI response content:", analysisResult)
        console.error("Cleaned response:", cleanedResult)
        console.error("Response structure:", JSON.stringify(response, null, 2))
      }
    }

    if (!traits) {
      console.warn("AI analysis did not return valid JSON after all attempts, falling back to questionnaire")
      return NextResponse.json({
        success: true,
        traits: {},
        message: "AI analysis failed - using default questionnaire data",
        suggestion: "Please complete the manual questionnaire below"
      })
    }

    traits.stylingAdvice = generatePersonalizedAdvice(traits)

    return NextResponse.json({
      success: true,
      traits
    })

  } catch (error) {
    console.error("AI profile analysis error:", error)
    
    // Handle OpenAI specific errors
    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.message.includes("Timeout")) {
        return NextResponse.json({ 
          error: "Analysis timeout",
          details: "Photo analysis is taking longer than expected",
          suggestion: "Try uploading a smaller image or wait a moment and retry"
        }, { status: 408 })
      }
      
      if (error.message.includes("unsupported image")) {
        return NextResponse.json({ 
          error: "Image format not supported",
          details: "Please upload a valid JPEG, PNG, or WebP image file",
          suggestion: "Try uploading a different image format"
        }, { status: 400 })
      }
      
      if (error.message.includes("rate limit")) {
        return NextResponse.json({ 
          error: "Rate limit exceeded",
          details: "Too many requests. Please try again later",
          suggestion: "Wait a few minutes before trying again"
        }, { status: 429 })
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to analyze profile",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

// Extend timeout for AI processing (Vercel Edge Functions)
export const maxDuration = 60; // 60 seconds
