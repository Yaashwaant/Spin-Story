import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { adminDb } from "@/lib/firebase-admin"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log("Chat API received body:", JSON.stringify(body, null, 2))
  
  const customerId = body.customerId as string | undefined
  const role = body.role as string | undefined
  const intent = body.intent as string | undefined
  const message = body.message as string | undefined
  const customerProfile = body.customerProfile as any | undefined
  const customerPreferences = body.customerPreferences as any | undefined
  const wardrobeUploaded = body.wardrobeUploaded as boolean | undefined
  const outfitPlanCount = body.outfitPlanCount as number | undefined

  console.log("Chat API extracted values:", { customerId, role, intent, message, hasProfile: !!customerProfile, hasPreferences: !!customerPreferences, wardrobeUploaded, outfitPlanCount })

  if (!customerId || customerId === "unknown" || !role || !intent || !message) {
    console.log("Chat API validation failed - missing required fields:", { customerId, role, intent, message })
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing from environment variables")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Fetch customer's wardrobe items
    let wardrobeItems: any[] = []
    if (wardrobeUploaded && customerId) {
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
          }
        })
        console.log(`Found ${wardrobeItems.length} wardrobe items for customer ${customerId}`)
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
      customerContext.push(`Current Wardrobe Items (${wardrobeItems.length} items):\n${JSON.stringify(wardrobeItems, null, 2)}`)
    }

    const systemPrompt = `You are a professional AI stylist assistant for a BDR (Business Development Representative) working with fashion customers. 

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

