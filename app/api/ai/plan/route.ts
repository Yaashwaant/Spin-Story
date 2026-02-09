import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { adminDb } from "@/lib/firebase-admin"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type PlanType = "week" | "trip" | "occasion"

interface OutfitPlanData {
  planId: string
  customerId: string
  planType: string
  triggeredBy: string
  conversationNotes: string
  contextTitle?: string
  preview: string
  outfits: Array<{
    name: string
    items: Array<{
      name: string
      type: string
      color: string
      styles: string[]
    }>
    colorCoordination: string
  }>
  styleRecommendations: string
  practicalConsiderations: string
  mixAndMatchOptions: string[]
  budgetConsiderations: string
  createdAt: string
  updatedAt: string
}

function parsePlanContent(content: string): Partial<OutfitPlanData> {
  // This is a simple parser - in a production app, you'd want more robust parsing
  const lines = content.split('\n').filter(line => line.trim())
  
  const outfits: OutfitPlanData['outfits'] = []
  let currentOutfit: any = null
  let styleRecommendations = ''
  let practicalConsiderations = ''
  let mixAndMatchOptions: string[] = []
  let budgetConsiderations = ''
  
  let section = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.includes('Outfit') && trimmedLine.includes(':')) {
      if (currentOutfit) {
        outfits.push(currentOutfit)
      }
      currentOutfit = {
        name: trimmedLine.replace(':', '').trim(),
        items: [],
        colorCoordination: ''
      }
    } else if (trimmedLine.includes('Color Coordination:')) {
      if (currentOutfit) {
        currentOutfit.colorCoordination = trimmedLine.replace('Color Coordination:', '').trim()
      }
    } else if (trimmedLine.includes('-') && trimmedLine.includes('(') && currentOutfit) {
      // Parse item like "- Blue Jeans (blue)"
      const itemMatch = trimmedLine.match(/^-\s*(.+?)\s*\((.+?)\)/)
      if (itemMatch) {
        currentOutfit.items.push({
          name: itemMatch[1].trim(),
          type: 'clothing', // Default type
          color: itemMatch[2].trim(),
          styles: []
        })
      }
    } else if (trimmedLine.includes('Style Recommendations:')) {
      section = 'style'
    } else if (trimmedLine.includes('Practical Considerations:')) {
      section = 'practical'
    } else if (trimmedLine.includes('Mix-and-Match Options:')) {
      section = 'mixmatch'
    } else if (trimmedLine.includes('Budget Considerations:')) {
      section = 'budget'
    } else if (trimmedLine.startsWith('-') && section) {
      const content = trimmedLine.substring(1).trim()
      switch (section) {
        case 'style':
          styleRecommendations += content + ' '
          break
        case 'practical':
          practicalConsiderations += content + ' '
          break
        case 'mixmatch':
          mixAndMatchOptions.push(content)
          break
        case 'budget':
          budgetConsiderations += content + ' '
          break
      }
    } else if (section && trimmedLine) {
      switch (section) {
        case 'style':
          styleRecommendations += trimmedLine + ' '
          break
        case 'practical':
          practicalConsiderations += trimmedLine + ' '
          break
        case 'budget':
          budgetConsiderations += trimmedLine + ' '
          break
      }
    }
  }
  
  if (currentOutfit) {
    outfits.push(currentOutfit)
  }
  
  return {
    outfits,
    styleRecommendations: styleRecommendations.trim(),
    practicalConsiderations: practicalConsiderations.trim(),
    mixAndMatchOptions,
    budgetConsiderations: budgetConsiderations.trim()
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const customerId = body.customerId as string | undefined
  const triggeredBy = body.triggeredBy as string | undefined
  const planType = body.planType as PlanType | undefined
  const conversationNotes = body.conversationNotes as string | undefined
  const contextTitle = body.contextTitle as string | null | undefined
  const customerProfile = body.customerProfile as any | undefined
  const customerPreferences = body.customerPreferences as any | undefined
  const wardrobeUploaded = body.wardrobeUploaded as boolean | undefined
  const outfitPlanCount = body.outfitPlanCount as number | undefined
  const requestWardrobeItems = body.wardrobeItems as any[] | undefined

  if (!customerId || !triggeredBy || !planType || !conversationNotes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is missing from environment variables")
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    let wardrobeItems: any[] = []
    if (requestWardrobeItems && requestWardrobeItems.length > 0) {
      wardrobeItems = requestWardrobeItems
    } else if (customerId) {
      try {
        const wardrobeSnapshot = await adminDb.collection("wardrobe").where("customerId", "==", customerId).get()

        wardrobeItems = wardrobeSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "",
            image: data.image || "",
            type: data.type || "",
            color: data.color || "",
            season: data.season || "",
            styles: data.styles || [],
          }
        })
      } catch (wardrobeError) {
        console.error("Error fetching wardrobe items:", wardrobeError)
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
      const wardrobeSummary = wardrobeItems.map((item) => 
        `- ${item.name} (${item.type || item.category || 'clothing'}, ${item.color || 'various colors'}, ${item.season || 'all seasons'})`
      ).join('\n')
      customerContext.push(
        `CURRENT WARDROBE INVENTORY (${wardrobeItems.length} items):\n${wardrobeSummary}\n\nIMPORTANT: You can ONLY use these specific items when making outfit suggestions in the Outfit column. Do not invent new clothing items that are not listed here.`
      )
    }

    const planPrompt = `You are a professional AI stylist creating personalized outfit plans for customers.

Customer Context:
${customerContext.join('\n')}

Plan Type: ${planType}
Conversation Notes: ${conversationNotes}
${contextTitle ? `Plan Title: ${contextTitle}` : ''}

Create a detailed outfit plan that includes:
1. Specific outfit combinations for different occasions/days
2. Color coordination suggestions
3. Style recommendations based on customer preferences
4. Practical considerations for the plan type (${planType})
5. Mix-and-match options to maximize wardrobe utility

IMPORTANT WARDROBE AWARENESS RULES:
- PRIORITIZE using items from the customer's existing wardrobe for outfit suggestions
- Aim to provide COMPLETE outfits with AT LEAST 3 categories: TOP + BOTTOM + FOOTWEAR from existing wardrobe whenever possible
- The Outfit column MUST ONLY contain items that come from the current wardrobe inventory listed above. Do NOT include any new or imaginary items in the Outfit column.
- ONLY suggest new purchase ideas in the "Extra Notes" column, always paired with the best matching existing outfit combination
- If the wardrobe does not have enough items to build a fully complete outfit, still create the best possible outfit using available items and clearly mention missing categories in the "Extra Notes" column
- NEVER skip a day or output placeholders like "[SKIP]" or "No suitable outfit" – always suggest at least one outfit using the available wardrobe
- Reference specific wardrobe items by name and color when creating combinations
- USE EXACT ITEM NAMES from the wardrobe list to ensure proper linking to item photos
- Focus on creating practical, wearable outfits that work with what they already own

Be specific, practical, and consider the customer's profile, preferences, and existing wardrobe. Make sure the plan is actionable and easy to follow.

CRITICAL OUTPUT FORMAT REQUIREMENT:
- Format your outfit plan as a CLEAN TABLE with EXACTLY 3 columns: Day | Outfit | Extra Notes
- Use flexible day numbering: Day 1, Day 2, Day 3 OR Day -1, Day -2, Day 0, Day 5, etc. OR Monday, Tuesday, Wednesday OR specific dates - whatever makes sense for the context
- The table should be the ONLY content in your response - NO additional text, explanations, or sections
- Each row should represent one outfit with all necessary details
- In the Outfit column, list only items taken from the CURRENT WARDROBE INVENTORY above. Any potential new purchases must be described only in the Extra Notes column.
- Use simple, clear language in table cells
- Example format (THIS IS YOUR ENTIRE RESPONSE):
Day | Outfit | Extra Notes
Day 1 | Office Professional - White button-down shirt, Navy tailored trousers, Black leather loafers | Perfect for business meetings. Add navy blazer for extra polish
Day 2 | Casual Friday - Light blue denim shirt, Dark wash jeans, White sneakers | Comfortable yet put-together for relaxed office day
Day 3 | Weekend Brunch - Floral blouse, Beige chinos, Brown ankle boots | Fresh spring look. Layer with cardigan if chilly
Day 4 | Evening Out - Black silk top, Grey dress pants, Black heels | Sophisticated dinner look. Add statement earrings
Day 5 | Minimal Wardrobe Day - White tee, Dark jeans | Best possible outfit with current wardrobe. Missing dedicated footwear; customer can consider adding simple white sneakers to enhance this look
Day -1 | Travel Day - Oversized sweater, Black leggings, Comfortable flats | Airport-friendly outfit with easy layers

**IMPORTANT: DO NOT ADD ANY TEXT BEFORE OR AFTER THE TABLE**
- Include ALL details (color coordination, style recommendations, practical considerations, mix-and-match options, budget considerations) WITHIN the table cells
- Keep the "Extra Notes" column concise but comprehensive
- Use line breaks within cells if needed, but maintain the 3-column structure
- No bullet points, no separate sections, just the table`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: planPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const planContent = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate the outfit plan. Please try again."
    
    const planId = crypto.randomUUID()
    const previewTitle = contextTitle && contextTitle.trim().length > 0 ? contextTitle : `${planType.charAt(0).toUpperCase() + planType.slice(1)} outfit plan`
    
    // Parse the plan content to extract structured data
    const structuredData = parsePlanContent(planContent)
    
    // Create the complete plan data
    const planData: OutfitPlanData = {
      planId,
      customerId,
      planType,
      triggeredBy,
      conversationNotes,
      preview: planContent,
      outfits: structuredData.outfits || [],
      styleRecommendations: structuredData.styleRecommendations || '',
      practicalConsiderations: structuredData.practicalConsiderations || '',
      mixAndMatchOptions: structuredData.mixAndMatchOptions || [],
      budgetConsiderations: structuredData.budgetConsiderations || 'Budget-friendly options using existing wardrobe items.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    try {
      await adminDb.collection('outfitPlans').doc(planId).set(planData)
    } catch (saveError) {
      console.error("Error saving plan to Firestore:", saveError)
    }

    return NextResponse.json({
      planId,
      preview: planContent,
      structured: planData
    })
  } catch (error) {
    console.error("OpenAI API error:", error)
    return NextResponse.json({ error: "Failed to generate outfit plan" }, { status: 500 })
  }
}
