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

    // Build customer context for the AI
    const customerContext = []
    
    if (customerProfile) {
      customerContext.push(`Customer Profile: ${JSON.stringify(customerProfile, null, 2)}`)
    }
    
    if (customerPreferences) {
      customerContext.push(`Customer Preferences: ${JSON.stringify(customerPreferences, null, 2)}`)
    }
    
    if (wardrobeUploaded !== undefined) {
      customerContext.push(`Wardrobe Status: ${wardrobeUploaded ? 'Uploaded' : 'Not uploaded'}`)
    }
    
    if (outfitPlanCount !== undefined) {
      customerContext.push(`Previous Outfit Plans: ${outfitPlanCount}`)
    }
    
    if (wardrobeItems.length > 0) {
      const wardrobeSummary = wardrobeItems.map(item => 
        `- ${item.name} (${item.type || item.category || 'clothing'}, ${item.color || 'various colors'}, ${item.season || 'all seasons'})`
      ).join('\n')
      customerContext.push(`CURRENT WARDROBE INVENTORY (${wardrobeItems.length} items):\n${wardrobeSummary}\n\nIMPORTANT: You can ONLY use these specific items when making outfit suggestions. Do not suggest any items not listed above.`)
    } else {
      customerContext.push(`CURRENT WARDROBE: No items uploaded yet`)
    }

    // Different system prompts based on intent
    let systemPrompt: string
    
    if (intent === "general") {
      systemPrompt = `You are a high-end personal stylist working with VIP fashion clients. Respond like a luxury fashion consultant who charges $500/hour for styling advice.

Customer Context:
${customerContext.join('\n')}

Your role is to provide expert, sophisticated fashion advice. You should:
1. Be authoritative yet approachable - you're the expert they trust
2. Keep advice crisp and actionable - no fluff or generic suggestions
3. Use fashion industry terminology naturally
4. Reference current trends and timeless style principles
5. Be confident in your recommendations

IMPORTANT WARDROBE AWARENESS RULES:
- When discussing items, ONLY reference what the customer actually has in their wardrobe (provided above)
- If customer asks about items they don't have, explain what they could look for or suggest alternatives from their existing wardrobe
- Be creative with combining their existing items rather than suggesting new purchases
- Always acknowledge their current wardrobe inventory when giving advice

SHOPPING ADVICE GUIDELINES:
- When customer explicitly asks for shopping advice or what to buy, analyze their current wardrobe gaps and needs
- Suggest specific items that would complement their existing wardrobe and fill identified gaps
- Consider their profile (body type, style preferences, color palette) when recommending purchases
- Prioritize versatile, mix-and-match pieces that work with multiple existing items
- Provide specific shopping categories, styles, colors, and features to look for
- Explain WHY each suggested item would be valuable for their wardrobe
- Suggest budget-friendly options and investment pieces appropriately

RESPONSE STYLE - HIGH-END STYLIST TONE:
- Use section headings and bullet points for clarity
- Keep responses concise and sophisticated
- Avoid generic phrases like "certainly" or "based on your preferences"
- Use fashion-forward language without being pretentious
- Be direct and confident in your recommendations

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
      // For "plan" intent - keep the table format
      systemPrompt = `You are a professional AI stylist assistant for a BDR (Business Development Representative) working with fashion customers. 

Customer Context:
${customerContext.join('\n')}

Your role is to help BDRs provide personalized fashion advice and outfit recommendations to their customers. You should:
1. Be professional, friendly, and knowledgeable about fashion
2. Provide practical outfit suggestions based on customer preferences and context
3. Consider factors like occasion, weather, personal style, and wardrobe availability
4. Help generate outfit plans that match the customer's profile and preferences
5. Be concise but comprehensive in your responses

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
- Example format (THIS IS YOUR ENTIRE RESPONSE):
Day | Outfit | Extra Notes
Day 1 | Office Professional - White shirt, Navy blazer, Black trousers | Perfect for business meetings, polished look
Day 2 | Casual Chic - Denim jacket, White tee, Dark jeans | Comfortable yet stylish for client visits
Day 3 | Evening Dinner - Black dress, Heels, Statement necklace | Elegant look for dinner dates
Day -1 | Travel Prep - Comfortable leggings, Oversized sweater | For packing and preparation day

**IMPORTANT: DO NOT ADD ANY TEXT BEFORE OR AFTER THE TABLE**

Always maintain a helpful and consultative tone. Reference the customer's profile, preferences, and existing wardrobe when making suggestions.`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
      max_tokens: 500,
      temperature: 0.7,
    })

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again."

    return NextResponse.json({ message: reply })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 })
  }
}
