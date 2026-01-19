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

    // Fetch customer's wardrobe items
    let wardrobeItems: any[] = []
    if (wardrobeUploaded) {
      // Use provided wardrobe items from request if available
      if (requestWardrobeItems && requestWardrobeItems.length > 0) {
        wardrobeItems = requestWardrobeItems
        console.log(`Using ${wardrobeItems.length} wardrobe items from request body`)
      } else if (customerId) {
        // Otherwise fetch from Firestore
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
          console.log(`Found ${wardrobeItems.length} wardrobe items for customer ${customerId} in plan API`)
        } catch (wardrobeError) {
          console.error("Error fetching wardrobe items:", wardrobeError)
          // Continue without wardrobe data if fetch fails
        }
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
- ONLY suggest purchasing new items if they don't already own suitable alternatives
- For each outfit suggestion, specify which items from their wardrobe to use
- If suggesting new purchases, explain why existing items aren't suitable
- If no suitable items exist for a specific outfit, clearly state: "You don't currently have suitable items in your wardrobe for this outfit"
- Reference specific wardrobe items by name and color when creating combinations

Be specific, practical, and consider the customer's profile, preferences, and existing wardrobe. Make sure the plan is actionable and easy to follow.

CRITICAL OUTPUT FORMAT REQUIREMENT:
- Format your outfit plan as a CLEAN TABLE with EXACTLY 3 columns: Day | Outfit | Extra Notes
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
    
    // Save the structured plan to Firestore
    try {
      await adminDb.collection('outfitPlans').doc(planId).set(planData)
      console.log(`Saved structured outfit plan ${planId} for customer ${customerId}`)
    } catch (saveError) {
      console.error("Error saving plan to Firestore:", saveError)
      // Continue even if save fails - we still have the preview
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