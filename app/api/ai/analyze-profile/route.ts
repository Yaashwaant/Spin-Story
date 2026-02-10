import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Helper function to generate personalized styling advice
function generatePersonalizedAdvice(traits: any): string {
  const {
    physique,
    colorSeason,
    personalityVibe,
    recommendedSilhouettes,
    avoidSilhouettes,
    fabricRecommendations,
    patternGuidance,
    accessoryNotes
  } = traits;

  let advice = `Of course! I'd be happy to provide you with some styling advice based on your profile and preferences. `;
  
  // Personal introduction based on their style
  if (personalityVibe?.includes('classic')) {
    advice += `Since you have that ${personalityVibe} style vibe, let's focus on enhancing your timeless aesthetic with some key pieces. `;
  } else if (personalityVibe?.includes('bohemian')) {
    advice += `With your ${personalityVibe} spirit, let's build on your free-spirited style foundation. `;
  } else {
    advice += `With your ${personalityVibe} style personality, let's create recommendations that feel authentic to you. `;
  }

  // Numbered recommendations
  advice += `\n\n**Here are my personalized recommendations:**\n\n`;
  
  // 1. Silhouette recommendations
  if (recommendedSilhouettes) {
    advice += `**1. Structured Pieces**: ${recommendedSilhouettes}. Focus on pieces that enhance your ${physique} and create the most flattering lines for your body.\n\n`;
  }

  // 2. Color recommendations
  if (colorSeason) {
    advice += `**2. Your Best Colors**: Stick to colors that complement your ${colorSeason} coloring. These hues will make you look radiant and put-together effortlessly.\n\n`;
  }

  // 3. Pattern and fabric guidance
  if (patternGuidance && fabricRecommendations) {
    advice += `**3. Patterns & Fabrics**: ${patternGuidance}. Choose ${fabricRecommendations.toLowerCase()} for the most comfortable and flattering results.\n\n`;
  }

  // 4. Accessories
  if (accessoryNotes) {
    advice += `**4. Accessories**: ${accessoryNotes}. The right accessories can transform basic outfits into signature looks.\n\n`;
  }

  // 5. What to avoid (gently)
  if (avoidSilhouettes) {
    advice += `**5. Fit Considerations**: ${avoidSilhouettes}. Instead, focus on pieces that follow your natural lines and enhance your best features.\n\n`;
  }

  // Closing encouragement
  advice += `**Building Your Wardrobe**: Start with versatile foundation pieces in your best colors, then add personality through accessories and statement pieces. Remember, the most important thing is that you feel confident and comfortable in what you wear!`;

  return advice;
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

    const analysisPrompt = `You are an expert fashion stylist with deep knowledge of body type analysis, color theory, and personal styling. Analyze the provided photos to create highly personalized styling recommendations that feel authentic and actionable.

**Analysis Approach:**
1. First, identify key physical characteristics and coloring from the photos
2. Then, provide specific, personalized advice that goes beyond generic recommendations
3. Use language that feels encouraging and confidence-building
4. Connect recommendations to real wardrobe scenarios and lifestyle needs

**Personalization Guidelines:**
- Avoid generic fashion advice - be specific to what you observe
- Use "you" language to make it feel like a personal consultation
- Include practical examples of how to implement suggestions
- Consider different contexts (work, casual, social events)
- Balance current trends with timeless style principles

**Return a JSON object with exactly these fields:**
{
  "physique": "Specific body type analysis with flattering focus (e.g., 'You have beautifully balanced proportions that work well with both fitted and flowing silhouettes', 'Your athletic build creates strong lines that structured pieces will enhance')",
  "bodyProportions": "Detailed proportion insights with styling solutions (e.g., 'Your longer torso creates elegant lines - high-waisted pieces will showcase this beautifully', 'Balanced upper and lower body means most silhouettes will work well on you')",
  "skinTone": "Coloring analysis with emotional connection (e.g., 'Your warm undertones create a natural glow that rich earth tones will amplify', 'Cool undertones give you that porcelain quality that jewel tones will enhance')",
  "colorSeason": "Color season with confidence building (e.g., 'As an Autumn, you have that golden-hour radiance that makes rust, olive, and burnt orange look incredible on you', 'Spring coloring means you light up in fresh, vibrant colors')",
  "personalityVibe": "Style personality with authentic voice (e.g., 'Classic elegance with modern edge - you appreciate timeless pieces but aren't afraid of thoughtful updates', 'Bohemian spirit who values comfort without sacrificing style')",
  "styleEssence": "Core style identity with empowerment (e.g., 'Natural elegance that feels effortless yet put-together', 'Romantic sophistication that celebrates feminine details')",
  "recommendedSilhouettes": "Specific silhouette recommendations with why (e.g., 'Structured blazers will define your waist while honoring your shoulders', 'A-line skirts will create beautiful movement and balance')",
  "avoidSilhouettes": "Gentle guidance on what to skip with alternatives (e.g., 'Instead of boxy oversized pieces that hide your shape, try relaxed fits with strategic tailoring', 'Avoid unflattering cuts by choosing pieces that follow your natural lines')",
  "fabricRecommendations": "Fabric suggestions with sensory details (e.g., 'Structured fabrics like quality cotton and lightweight wool will hold shape beautifully on you', 'Flowy materials like silk and rayon will create elegant movement')",
  "patternGuidance": "Pattern advice with visual impact (e.g., 'Vertical lines will elongate your frame while small prints add interest without overwhelming', 'Solid colors in rich hues will create that sophisticated foundation you can build on')",
  "accessoryNotes": "Accessory strategy with personality (e.g., 'Statement pieces like a bold watch or structured bag will reflect your confident style', 'Delicate jewelry works beautifully for everyday, but don't shy away from bolder pieces for special occasions')",
  "styleConfidence": "Confidence building with practical application (e.g., 'You're confident in bold choices when they feel authentic - start with one statement piece per outfit', 'You prefer classic pieces but can elevate them with unique details')",
  "lifestyleAdaptation": "Lifestyle-specific recommendations (e.g., 'Versatile pieces that transition from work to weekend - think quality basics you can dress up or down', 'Professional foundation pieces in your best colors that mix and match effortlessly')",
  "additionalNotes": "Personalized styling observations with encouragement (e.g., 'Your coloring and proportions give you incredible versatility - experiment with both classic and trend-forward pieces', 'Focus on building a cohesive wardrobe around your best colors and most flattering silhouettes')"
}`

    const content: any[] = [
      { type: "text", text: analysisPrompt }
    ]

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
          detail: "high"
        }
      })
    }

    if (fullBodyPhoto) {
      const imageUrl = await processImage(fullBodyPhoto);
      content.push({
        type: "image_url",
        image_url: {
          url: imageUrl,
          detail: "high"
        }
      })
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert personal stylist who creates highly personalized, encouraging fashion advice. Your approach:
          
1. **Personal Connection**: Use "you" language and make observations feel like a personal consultation
2. **Specific Examples**: Provide concrete, actionable advice with real wardrobe scenarios
3. **Confidence Building**: Frame recommendations in empowering, positive language
4. **Contextual Advice**: Consider different life contexts (work, casual, social)
5. **Practical Implementation**: Suggest how to start building or updating their wardrobe

**Writing Style**:
- Warm, encouraging tone that builds confidence
- Specific garment examples rather than vague categories
- Mix of immediate wins and long-term wardrobe building
- Balance of current trends with timeless principles
- Always explain WHY something works for them specifically

**Response Structure**: Create advice that flows naturally like a stylist's personalized recommendations, not a checklist.`
        },
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 1200,
      temperature: 0.3
    })

    const analysisResult = response.choices[0]?.message?.content
    
    if (!analysisResult) {
      return NextResponse.json({ error: "Failed to analyze profile photos" }, { status: 500 })
    }

    console.log("AI Response:", analysisResult)

    // Check if AI is refusing to analyze
    if (analysisResult && (analysisResult.includes("unable to analyze") || analysisResult.includes("cannot analyze") || analysisResult.includes("I'm unable"))) {
      console.log("AI refused to analyze photo")
      
      return NextResponse.json({ 
        error: "Unable to analyze photo",
        details: "The AI was unable to analyze this photo. Please upload a different and clear photo of yourself.",
        suggestion: "Try uploading a well-lit, clear photo where your face and/or body are clearly visible. Avoid blurry, dark, or heavily filtered images."
      }, { status: 400 })
    }

    // Parse the JSON response and enhance with personalized advice
    let traits
    try {
      const jsonMatch = analysisResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        traits = JSON.parse(jsonMatch[0])
      } else {
        traits = JSON.parse(analysisResult)
      }
      
      // Enhance the response with personalized styling advice
      traits.stylingAdvice = generatePersonalizedAdvice(traits);
      
    } catch (parseError) {
      console.error("Failed to parse AI response:", analysisResult)
      console.error("Parse error:", parseError)
      return NextResponse.json({ 
        error: "Invalid analysis response format", 
        details: "AI response was not in expected JSON format",
        response: analysisResult 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      traits
    })

  } catch (error) {
    console.error("AI profile analysis error:", error)
    
    // Handle OpenAI specific errors
    if (error instanceof Error) {
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
