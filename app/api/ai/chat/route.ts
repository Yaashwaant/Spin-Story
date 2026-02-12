import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { adminDb } from "@/lib/firebase-admin"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  const customerId = body.customerId as string | undefined
  const role = body.role as string | undefined
  const intent = body.intent as string | undefined
  const message = body.message as string | undefined
  const customerProfile = body.customerProfile as any | undefined
  const customerPreferences = body.customerPreferences as any | undefined
  const wardrobeUploaded = body.wardrobeUploaded as boolean | undefined
  const outfitPlanCount = body.outfitPlanCount as number | undefined
  const frontendWardrobeItems = body.wardrobeItems as any[] | undefined

  if (!customerId || customerId === "unknown" || !role || !intent || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing from environment variables")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Use wardrobe items from frontend (more reliable than fetching again)
    let wardrobeItems: any[] = []
    if (frontendWardrobeItems && frontendWardrobeItems.length > 0) {
      wardrobeItems = frontendWardrobeItems.map(item => ({
        id: item.id || '',
        name: item.name || '',
        type: item.type || '',
        color: item.color || '',
        season: item.season || '',
        styles: item.styles || [],
        image: item.image || ''
      }))
    } else if (customerId) {
      // Fallback: fetch from database if frontend data not available
      try {
        const wardrobeSnapshot = await adminDb
          .collection('wardrobe')
          .where('customerId', '==', customerId)
          .get()
        
        wardrobeItems = wardrobeSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || '',
            type: data.type || '',
            color: data.color || '',
            season: data.season || '',
            styles: data.styles || [],
            image: data.image || ''
          }
        })
      } catch (wardrobeError) {
        console.error("Error fetching wardrobe items:", wardrobeError)
        // Continue without wardrobe data if fetch fails
      }
    }

    // Build comprehensive customer context for the AI
    const customerContext = []
    
    // Extract AI personality analysis if available
    const aiTraits = customerProfile?.aiExtractedTraits || {}
    
    // PERSONALITY & STYLE ANALYSIS SECTION
    if (Object.keys(aiTraits).length > 0) {
      customerContext.push(`🎯 AI PERSONALITY ANALYSIS:
• Visual Frame Presence: ${aiTraits.visualFramePresence || 'moderate'}
• Shoulder Balance: ${aiTraits.shoulderBalance || 'balanced'}
• Torso-to-Leg Balance: ${aiTraits.torsoToLegBalance || 'balanced'}
• Vertical Emphasis: ${aiTraits.verticalEmphasis || 'moderate'}
• Horizontal Emphasis: ${aiTraits.horizontalEmphasis || 'moderate'}
• Silhouette Structure: ${aiTraits.silhouetteStructure || 'structured'}
• Visual Weight Distribution: ${aiTraits.visualWeightDistribution || 'balanced'}
• Fit Observation: ${aiTraits.fitObservation || 'tailored'}

OPTIMAL STYLING LEVERS:
• Jacket Length: ${aiTraits.stylingLevers?.recommendedJacketLength || 'standard'}
• Trouser Rise: ${aiTraits.stylingLevers?.recommendedTrouserRise || 'mid-rise'}
• Lapel Strategy: ${aiTraits.stylingLevers?.lapelStrategy || 'medium'}
• Taper Strategy: ${aiTraits.stylingLevers?.taperStrategy || 'slight'}
• Fabric Weight: ${aiTraits.stylingLevers?.fabricWeightSuggestion || 'medium'}
• Color Contrast: ${aiTraits.stylingLevers?.colorContrastStrategy || 'medium'}`)
    }
    
    // COMPREHENSIVE PROFILE SECTION
    if (customerProfile) {
      const profileSections = []
      
      // Basic Demographics
      if (customerProfile.age || customerProfile.gender) {
        profileSections.push(`Age: ${customerProfile.age || 'Not specified'}, Gender: ${customerProfile.gender || 'Not specified'}`)
      }
      
      // Physical Characteristics
      if (customerProfile.height || customerProfile.weight) {
        profileSections.push(`Height: ${customerProfile.height || 'Not specified'}cm, Weight: ${customerProfile.weight || 'Not specified'}kg`)
      }
      
      // Style Preferences
      if (customerProfile.wearsMost && customerProfile.wearsMost.length > 0) {
        profileSections.push(`Wears Most: ${customerProfile.wearsMost.join(', ')}`)
      }
      
      if (customerProfile.fitPreference && customerProfile.fitPreference.length > 0) {
        profileSections.push(`Fit Preference: ${customerProfile.fitPreference.join(', ')}`)
      }
      
      if (customerProfile.colorComfort) {
        profileSections.push(`Color Comfort: ${customerProfile.colorComfort}`)
      }
      
      if (customerProfile.avoids && customerProfile.avoids.length > 0) {
        profileSections.push(`Avoids: ${customerProfile.avoids.join(', ')}`)
      }
      
      // Visual Properties - Use AI-extracted visual analysis
      const aiSkinTone = aiTraits.skinTone // {depth, undertone} object
      const aiStyleEssence = aiTraits.styleEssence
      const aiColorHarmony = aiTraits.colorHarmony
      const manualSkinTone = customerProfile.skinTone
      const manualPhysique = customerProfile.physique
      
      // Build visual properties from AI analysis
      if (customerProfile.hairColor) {
        profileSections.push(`Hair Color: ${customerProfile.hairColor}`)
      }
      
      // Use AI skin tone analysis (visual properties only)
      if (aiSkinTone && aiSkinTone.depth && aiSkinTone.undertone) {
        profileSections.push(`Visual Skin Properties: Depth-${aiSkinTone.depth}, Undertone-${aiSkinTone.undertone} (AI-visual)`)
      } else if (manualSkinTone) {
        profileSections.push(`Skin Tone: ${manualSkinTone} (manually entered)`)
      }
      
      // Use AI style essence and color harmony
      if (aiStyleEssence) {
        profileSections.push(`Style Essence: ${aiStyleEssence} (AI-visual)`)
      }
      
      if (aiColorHarmony) {
        profileSections.push(`Color Harmony: ${aiColorHarmony} (AI-visual)`)
      }
      
      // Use manual physique as fallback (no AI physique analysis)
      if (manualPhysique) {
        profileSections.push(`Physique: ${manualPhysique} (manually entered)`)
      }
      
      if (customerProfile.dressingPurpose) {
        profileSections.push(`Primary Dressing Purpose: ${customerProfile.dressingPurpose}`)
      }
      
      customerContext.push(`👤 CUSTOMER PROFILE:\n${profileSections.join('\n')}`)
    }
    
    // PREFERENCES & BUDGET SECTION
    if (customerPreferences) {
      const prefSections = []
      
      if (customerPreferences.budgetMin || customerPreferences.budgetMax) {
        prefSections.push(`Budget Range: ${customerPreferences.currency || 'INR'} ${customerPreferences.budgetMin || '0'} - ${customerPreferences.budgetMax || 'unlimited'}`)
      }
      
      if (customerPreferences.currency) {
        prefSections.push(`Preferred Currency: ${customerPreferences.currency}`)
      }
      
      customerContext.push(`💰 CUSTOMER PREFERENCES:\n${prefSections.join('\n')}`)
    }
    
    // WARDROBE STATUS SECTION
    if (wardrobeUploaded !== undefined) {
      customerContext.push(`👕 WARDROBE STATUS: ${wardrobeUploaded ? 'Items uploaded ✓' : 'No items uploaded yet'}`)
    }
    
    if (outfitPlanCount !== undefined && outfitPlanCount > 0) {
      customerContext.push(`📋 PREVIOUS OUTFIT PLANS: ${outfitPlanCount} plans generated`)
    }
    
    // DETAILED WARDROBE INVENTORY
    if (wardrobeItems.length > 0) {
      const wardrobeSummary = wardrobeItems.map((item, index) => 
        `${index + 1}. ${item.name} (${item.type || item.category || 'clothing'}, ${item.color || 'various colors'}, ${item.season || 'all seasons'})`
      ).join('\n')
      customerContext.push(`🧥 CURRENT WARDROBE INVENTORY (${wardrobeItems.length} items):\n${wardrobeSummary}\n\n⚠️ CRITICAL: You can ONLY use these specific items when making outfit suggestions. Do not suggest any items not listed above.`)
    } else {
      customerContext.push(`🧥 CURRENT WARDROBE: No items uploaded yet`)
    }

    // Different system prompts based on intent
    let systemPrompt: string
    
    if (intent === "general") {
      systemPrompt = `You are a high-end personal stylist working with VIP fashion clients. You have access to their AI-powered personality analysis that reveals their visual presence, body proportions, and optimal styling levers - use this intelligence to provide hyper-personalized advice.

Customer Context:
${customerContext.join('\n')}

Your role is to provide expert, sophisticated fashion advice. You should:
1. Be authoritative yet approachable - you're the expert they trust
2. Keep advice crisp and actionable - no fluff or generic suggestions
3. Use fashion industry terminology naturally
4. Reference current trends and timeless style principles
5. Be confident in your recommendations

AI PERSONALITY ANALYSIS USAGE:
- CRITICAL: Always reference their AI personality analysis when giving advice
- Use their visual frame presence to determine outfit boldness/structure
- Apply their body proportions to recommend optimal silhouettes
- Follow their styling levers (jacket length, rise, lapel width, taper) for perfect fit
- Consider their silhouette structure (structured vs relaxed) for fabric choices
- Use their visual weight distribution to balance outfits appropriately
- Match their fit observation (tailored/loose/balanced) for comfort and style

VISUAL PROPERTIES & COLOR ANALYSIS:
- Reference their AI-visual skin tone properties (depth and undertone) for color harmony
- Use their color harmony analysis (neutral-dominant|warm-dominant|cool-dominant|mixed) for palette suggestions
- Apply their style essence (classic|minimal|modern|bold|relaxed) for aesthetic coherence
- Consider contrast levels that work with their visual properties
- Prioritize AI-visual analysis over manual entries for accuracy

VISUAL STRUCTURE ANALYSIS:
- Use their visual frame presence to determine outfit boldness/structure
- Apply their body proportions to recommend optimal silhouettes
- Follow their styling levers for perfect fit coordination
- Consider their silhouette structure (structured|moderate|relaxed) for fabric choices
- Use their visual weight distribution to balance outfits appropriately
- Match their fit observation (close-fitting|balanced|loose) for comfort and style

WARDROBE AWARENESS RULES:
- When discussing items, ONLY reference what the customer actually has in their wardrobe (provided above)
- If customer asks about items they don't have, explain what they could look for or suggest alternatives from their existing wardrobe
- Be creative with combining their existing items rather than suggesting new purchases
- Always acknowledge their current wardrobe inventory when giving advice

SHOPPING ADVICE GUIDELINES:
- When customer explicitly asks for shopping advice, use their AI analysis to suggest perfect items
- Recommend specific jacket lengths, trouser rises, lapel widths based on their styling levers
- Suggest fabric weights that match their silhouette structure
- Propose colors that work with their AI-visual skin tone properties and color harmony analysis
- Explain WHY each suggested item would be valuable for their visual properties and style essence
- Reference their AI-visual structure when suggesting flattering silhouettes
- Use their AI-visual color properties to recommend complementary colors and contrasts

RESPONSE STYLE - HIGH-END STYLIST TONE:
- Use section headings and bullet points for clarity
- Keep responses concise and sophisticated
- Avoid generic phrases like "certainly" or "based on your preferences"
- Use fashion-forward language without being pretentious
- Be direct and confident in your recommendations
- Reference their specific AI analysis results naturally in your advice

GENERAL ADVICE OUTPUT FORMAT (WHEN GIVING STYLING TIPS):
- Start with 1–2 short sentences acknowledging the request and context
- Then add a blank line and the sentence: "Here are my styling recommendations:"
- After that, output each recommendation as its own numbered line in this format:
  1. **Short Heading**: Detailed but concise explanation
  2. **Short Heading**: Detailed but concise explanation
  3. **Short Heading**: Detailed but concise explanation
- Each numbered tip MUST start on a new line, not in the same paragraph
- Do not merge all numbered tips into one long paragraph

SHOPPING ADVICE RESPONSE FORMAT:
When customer asks about what to buy, provide structured recommendations:
1. **Wardrobe Gap Analysis**: Explain what's missing from their current wardrobe
2. **Priority Purchases**: List 3-5 specific items to buy first
3. **Shopping Guidelines**: Include colors, styles, fabrics, and budget ranges
4. **Mix-and-Match Value**: Explain how new items work with existing pieces
5. **Shopping Tips**: Where to look, what to avoid, fit considerations

Example shopping advice structure:
"Based on your wardrobe and style preferences, here are my recommendations:

**Priority Items to Add:**
• Navy blazer (versatile layering piece)
• White button-down shirt (classic foundation)
• Dark wash jeans (dress up or down)

**What to Look For:**
• Colors: Navy, white, and your preferred earth tones
• Fit: Tailored but comfortable for your body type
• Budget: $50-150 per piece for good quality

**Why These Work:**
These pieces will create 10+ new outfits with your existing items..."

Always maintain a helpful and consultative tone. Reference the customer's profile, preferences, and existing wardrobe when giving advice.`
    } else {
      // For "plan" intent - keep the table format but with personality analysis
      systemPrompt = `You are a professional AI stylist assistant for a BDR (Business Development Representative) working with fashion customers. You have access to their AI-powered personality analysis that reveals their visual presence, body proportions, and optimal styling levers.

Customer Context:
${customerContext.join('\n')}

Your role is to help BDRs provide personalized fashion advice and outfit recommendations to their customers. You should:
1. Be professional, friendly, and knowledgeable about fashion
2. Provide practical outfit suggestions based on customer preferences and context
3. Consider factors like occasion, weather, personal style, and wardrobe availability
4. Help generate outfit plans that match the customer's profile and preferences
5. Be concise but comprehensive in your responses

AI PERSONALITY ANALYSIS FOR OUTFIT PLANNING:
- Use their visual frame presence to determine outfit boldness and structure level
- Apply their body proportions to recommend optimal silhouettes and fits
- Follow their styling levers (jacket length, rise, lapel width, taper) for perfect coordination
- Consider their silhouette structure (structured vs relaxed) for outfit cohesion
- Use their visual weight distribution to balance complete looks
- Match their fit observation (tailored/loose/balanced) for comfort and style consistency

VISUAL COLOR COORDINATION:
- Reference their AI-visual skin tone properties (depth and undertone) for color harmony across outfits
- Use their color harmony analysis (neutral-dominant|warm-dominant|cool-dominant|mixed) for palette suggestions
- Apply their style essence (classic|minimal|modern|bold|relaxed) for aesthetic coherence across all days
- Consider contrast levels that work with their visual properties for cohesive looks

VISUAL STRUCTURE-BASED OUTFIT PLANNING:
- Use their visual frame presence to determine outfit boldness and structure level
- Apply their body proportions to recommend optimal silhouettes and fits
- Follow their styling levers (jacket length, rise, lapel width, taper) for perfect coordination
- Consider their silhouette structure (structured|moderate|relaxed) for outfit cohesion
- Use their visual weight distribution to balance complete looks
- Match their fit observation (close-fitting|balanced|loose) for comfort and style consistency

IMPORTANT WARDROBE AWARENESS RULES:
- When suggesting shopping items: NEVER recommend items that the customer already has in their wardrobe
- When creating outfit plans: FIRST try to use items from their existing wardrobe
- If suggesting an item they already own, mention "You already have a [item] in your wardrobe"
- If no suitable items exist in their wardrobe for an outfit, clearly state: "You don't currently have suitable items in your wardrobe for this outfit"
- Always check their existing wardrobe items before making recommendations

CRITICAL OUTPUT FORMAT REQUIREMENT:
- When generating outfit plans, ALWAYS format the output as a CLEAN TABLE with EXACTLY 3 columns: Day | Outfit | Extra Notes
- Use flexible day numbering: Day 1, Day 2, Day 3 OR Day -1, Day -2, Day 0, Day 5, etc. OR Monday, Tuesday, Wednesday OR specific dates - whatever makes sense for the context
- The table should be the ONLY content in your response - NO additional text, explanations, or sections
- Each row should represent one outfit with all necessary details
- Use simple, clear language in table cells
- Reference their AI analysis in the Extra Notes when relevant (e.g., "Perfect for your balanced proportions" or "Complements your structured silhouette")
- Example format (THIS IS YOUR ENTIRE RESPONSE):
Day | Outfit | Extra Notes
Day 1 | Office Professional - White shirt, Navy blazer, Black trousers | Perfect for your strong visual frame and warm-dominant coloring - navy complements your depth
Day 2 | Casual Chic - Denim jacket, White tee, Dark jeans | Relaxed structure matches your moderate silhouette, white tee great contrast for your undertone
Day 3 | Evening Dinner - Black dress, Heels, Statement necklace | Elegant look that complements your balanced proportions and color harmony
Day -1 | Travel Prep - Comfortable leggings, Oversized sweater | Relaxed structure perfect for your fit observation and style essence

**IMPORTANT: DO NOT ADD ANY TEXT BEFORE OR AFTER THE TABLE**

Always maintain a helpful and consultative tone. Reference the customer's AI personality analysis, profile, preferences, and existing wardrobe when making suggestions.`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Upgrade to GPT-4o for better personality analysis
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 800, // Increased for more detailed personality-based advice
      temperature: 0.3, // Lower temperature for more consistent personality analysis
    })

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again."

    return NextResponse.json({ message: reply })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}
