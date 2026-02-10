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

  let advice = `**Strategic Styling Recommendations**\n\n`;
  
  // Premium introduction based on their style essence
  if (personalityVibe?.includes('classic')) {
    advice += `Your ${personalityVibe} essence creates the foundation for timeless sophistication. Let's translate your natural elegance into strategic wardrobe decisions that command respect while feeling authentically you. `;
  } else if (personalityVibe?.includes('bohemian')) {
    advice += `Your ${personalityVibe} spirit provides the perfect canvas for authentic self-expression. We'll channel your free-spirited energy into strategic styling that creates memorable presence. `;
  } else {
    advice += `Your ${personalityVibe} personality offers unique positioning opportunities. Let's transform your authentic energy into strategic styling decisions that enhance your natural charisma. `;
  }

  // Strategic recommendations with WHY explanations
  advice += `\n\n**Here are my strategic recommendations:**\n\n`;
  
  // 1. Silhouette strategy
  if (recommendedSilhouettes) {
    advice += `**1. Strategic Silhouettes**: ${recommendedSilhouettes}. This approach enhances your ${physique} by creating visual harmony that amplifies your presence in any setting.\n\n`;
  }

  // 2. Color strategy
  if (colorSeason) {
    advice += `**2. Power Color Strategy**: Your ${colorSeason} coloring creates natural authority. These hues don't just complement you—they amplify your presence while creating sophisticated visual impact that commands attention appropriately.\n\n`;
  }

  // 3. Pattern and fabric strategy
  if (patternGuidance && fabricRecommendations) {
    advice += `**3. Textile & Pattern Strategy**: ${patternGuidance}. ${fabricRecommendations} creates the perfect balance of comfort and presence, ensuring you feel confident while looking effortlessly polished.\n\n`;
  }

  // 4. Accessory strategy
  if (accessoryNotes) {
    advice += `**4. Strategic Accessories**: ${accessoryNotes}. These pieces become your signature elements—conversation starters that showcase your personality while elevating every outfit from basic to memorable.\n\n`;
  }

  // 5. What to avoid with strategic alternatives
  if (avoidSilhouettes) {
    advice += `**5. Strategic Avoidances**: ${avoidSilhouettes}. Instead, choose pieces that follow your natural architecture—this creates effortless elegance while honoring your body's unique structure.\n\n`;
  }

  // Strategic closing
  advice += `**Strategic Wardrobe Building**: Focus on versatile foundation pieces in your power colors, then add personality through carefully chosen statement pieces. This approach creates maximum impact with minimum effort, ensuring you always feel confident and look memorable.\n\n**Remember**: The most successful wardrobes work as strategic systems where every piece enhances your natural presence while supporting your lifestyle goals.`;

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

    const analysisPrompt = `You are a high-end personal stylist.

You are given:

1. Structured body and color analysis 
2. Personality and lifestyle attributes 
3. Style goals requested by the user

Your job:
Generate tailored advice that harmonizes:
- Body proportions 
- Coloring 
- Personality energy 
- Lifestyle reality

Do NOT re-analyze the image.
Do NOT repeat stored attributes verbatim.
Instead, translate them into strategic styling decisions.

Explain WHY each recommendation enhances visual balance or presence.
Keep tone empowering and premium.
Return structured JSON.

**Analysis Approach:**
1. First, identify key physical characteristics and coloring from the photos
2. Then, provide specific, personalized advice that goes beyond generic recommendations
3. Use language that feels encouraging and confidence-building
4. Connect recommendations to real wardrobe scenarios and lifestyle needs
5. Explain WHY each recommendation enhances visual balance or presence

**Personalization Guidelines:**
- Avoid generic fashion advice - be specific to what you observe
- Use "you" language to make it feel like a personal consultation
- Include practical examples of how to implement suggestions
- Consider different contexts (work, casual, social events)
- Balance current trends with timeless style principles
- Focus on strategic styling decisions, not just observations
- Harmonize body proportions, coloring, personality and lifestyle

**Return a JSON object with exactly these fields:**
{
  "physique": "Strategic body type analysis with WHY explanations (e.g., 'Your balanced proportions create natural symmetry - structured pieces will enhance this inherent harmony', 'Your athletic build creates strong vertical lines that tailored pieces will amplify')",
  "bodyProportions": "Proportion-based styling strategy with visual impact reasoning (e.g., 'Your longer torso creates elegant vertical flow - high-waisted pieces will visually lengthen your legs while maintaining your natural grace', 'Your balanced upper and lower body means most silhouettes will work, but defined waistlines will create the most sophisticated presence')",
  "skinTone": "Coloring strategy with visual enhancement reasoning (e.g., 'Your warm undertones create natural luminosity - rich earth tones will amplify this glow while creating sophisticated depth', 'Cool undertones give you porcelain clarity - jewel tones will enhance this radiance while adding luxurious dimension')",
  "colorSeason": "Color season strategy with confidence-building presence (e.g., 'As an Autumn, you possess golden-hour radiance - rust, olive, and burnt orange will create commanding presence while feeling authentically you', 'Spring coloring means you embody fresh vibrancy - coral, mint, and butter yellow will amplify your natural energy')",
  "personalityVibe": "Style personality with strategic positioning (e.g., 'Classic elegance with modern edge - you command respect in timeless pieces while thoughtful updates keep your look current and influential', 'Bohemian spirit who values authenticity - flowing silhouettes and artisanal details will amplify your free-spirited presence')",
  "styleEssence": "Core style identity with empowerment strategy (e.g., 'Natural elegance that feels effortless yet commanding - your presence is enhanced when comfort meets sophistication', 'Romantic sophistication that celebrates feminine power - delicate details create memorable impact without overwhelming')",
  "recommendedSilhouettes": "Strategic silhouette recommendations with visual reasoning (e.g., 'Structured blazers will define your waist while honoring your shoulder line - creating powerful presence in professional settings', 'A-line skirts will create beautiful movement and balance - perfect for social events where you want to feel feminine and confident')",
  "avoidSilhouettes": "Strategic guidance with positive alternatives (e.g., 'Instead of boxy oversized pieces that hide your shape, choose relaxed fits with strategic tailoring - this maintains comfort while showcasing your natural structure', 'Avoid unflattering cuts by selecting pieces that follow your natural lines - this creates effortless elegance while honoring your body's architecture')",
  "fabricRecommendations": "Fabric strategy with sensory and visual impact (e.g., 'Structured fabrics like quality cotton and lightweight wool will hold shape beautifully - creating polished presence that commands respect', 'Flowy materials like silk and rayon will create elegant movement - perfect for occasions where you want to feel graceful and feminine')",
  "patternGuidance": "Pattern strategy with visual enhancement reasoning (e.g., 'Vertical lines will elongate your frame while small prints add sophisticated interest - creating height and refinement simultaneously', 'Solid colors in rich hues will create sophisticated foundation - perfect for building memorable outfits around statement accessories')",
  "accessoryNotes": "Accessory strategy with presence-building reasoning (e.g., 'Statement pieces like a bold watch or structured bag will reflect your confident style - these become conversation starters that showcase your personality', 'Delicate jewelry works beautifully for everyday elegance, but don't shy away from bolder pieces for special occasions where you want memorable impact')",
  "styleConfidence": "Confidence-building strategy with practical application (e.g., 'You're confident in bold choices when they feel authentic - start with one statement piece per outfit to build presence gradually', 'You prefer classic pieces but can elevate them with unique details - this creates memorable style while maintaining your sophisticated foundation')",
  "lifestyleAdaptation": "Lifestyle-specific strategy with versatility reasoning (e.g., 'Versatile pieces that transition from work to weekend - quality basics in your best colors create multiple outfits while maintaining your polished presence', 'Professional foundation pieces that mix and match effortlessly - this creates capsule wardrobe efficiency while ensuring you always look put-together')",
  "additionalNotes": "Strategic styling observations with empowerment focus (e.g., 'Your coloring and proportions give you incredible versatility - experiment with both classic foundations and trend-forward accents to create memorable presence', 'Focus on building cohesive wardrobe around your best colors and most flattering silhouettes - this creates effortless style while maximizing your visual impact')"
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
          content: `You are a high-end personal stylist working with VIP fashion clients who charges $500/hour for styling advice.
          
**Your Approach:**
1. **Strategic Analysis**: Translate observations into strategic styling decisions
2. **Harmonization**: Balance body proportions, coloring, personality energy, and lifestyle reality
3. **Premium Positioning**: Frame recommendations as luxury styling strategies
4. **Visual Impact**: Explain WHY each recommendation enhances visual balance and presence
5. **Empowerment**: Build confidence through strategic style positioning

**Key Principles:**
- Do NOT re-analyze the image - focus on strategic styling decisions
- Do NOT repeat stored attributes verbatim - translate them into actionable strategies
- Explain WHY each recommendation enhances visual balance or presence
- Keep tone empowering and premium
- Harmonize all elements for cohesive personal brand

**Writing Style**:
- High-end, premium tone that commands respect
- Strategic explanations with visual impact reasoning
- Luxury positioning with confidence-building language
- Professional authority with approachable expertise
- Focus on presence-building and memorable impact

**Response Structure**: Create strategic styling recommendations that position the client for success in their personal and professional life.`
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
