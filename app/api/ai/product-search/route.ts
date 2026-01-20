import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { adminDb } from "@/lib/firebase-admin"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ProductSearchRequest {
  query: string
  category?: string
  budget?: string
  style?: string
  customerId?: string
}

interface ProductSearchResponse {
  success: boolean
  products?: {
    name: string
    description: string
    priceRange: string
    category: string
    style: string
    whereToBuy: string[]
    whyRecommended: string
  }[]
  message?: string
}

interface CustomerData {
  profile?: any
  preferences?: any
  wardrobeItems?: any[]
}

async function fetchCustomerData(customerId: string): Promise<CustomerData> {
  try {
    // Fetch customer profile and preferences
    const customerDoc = await adminDb.collection('users').doc(customerId).get()
    const customerData = customerDoc.data()
    
    // Fetch wardrobe items
    const wardrobeSnapshot = await adminDb
      .collection('wardrobe')
      .where('customerId', '==', customerId)
      .get()
    
    const wardrobeItems = wardrobeSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || '',
        type: data.type || '',
        color: data.color || '',
        season: data.season || '',
        styles: data.styles || [],
        image: data.image || '',
      }
    })

    return {
      profile: customerData?.profile || null,
      preferences: customerData?.preferences || null,
      wardrobeItems: wardrobeItems || []
    }
  } catch (error) {
    console.error("Error fetching customer data:", error)
    return {
      profile: null,
      preferences: null,
      wardrobeItems: []
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, category, budget, style, customerId } = body as ProductSearchRequest

    if (!query) {
      return NextResponse.json({ 
        success: false, 
        message: "Search query is required" 
      }, { status: 400 })
    }

    // Fetch customer data if customerId is provided
    let customerContext = ""
    let wardrobeContext = ""
    
    if (customerId) {
      const customerData = await fetchCustomerData(customerId)
      
      // Build customer profile context
      if (customerData.profile) {
        const profile = customerData.profile
        const aiTraits = profile.aiExtractedTraits || {}
        
        customerContext = `
**Customer Profile:**
- Height: ${profile.height || 'Not specified'}
- Age: ${profile.age || 'Not specified'}
- Gender: ${profile.gender || 'Not specified'}
- Weight: ${profile.weight || 'Not specified'}${profile.weight ? ' kg' : ''}
- Hair Color: ${profile.hairColor || 'Not specified'}
- Fit Preference: ${Array.isArray(profile.fitPreference) ? profile.fitPreference.join(', ') : profile.fitPreference || 'Not specified'}
- Dressing Purpose: ${profile.dressingPurpose || 'Not specified'}
- Color Comfort: ${profile.colorComfort || 'Not specified'}
- Wears Most: ${profile.wearsMost?.join(', ') || 'Not specified'}
- Avoids: ${profile.avoids?.join(', ') || 'Not specified'}

**AI Extracted Traits:**
- Physique: ${aiTraits.physique || 'Not specified'}
- Skin Tone: ${aiTraits.skinTone || 'Not specified'}
- Personality Vibe: ${aiTraits.personalityVibe || 'Not specified'}
- Style Essence: ${aiTraits.styleEssence || 'Not specified'}
- Additional Notes: ${aiTraits.additionalNotes || 'Not specified'}
`
      }
      
      // Build wardrobe context
      if (customerData.wardrobeItems && customerData.wardrobeItems.length > 0) {
        wardrobeContext = `
**Customer's Current Wardrobe:**
${customerData.wardrobeItems.map(item => 
  `- ${item.name} (${item.type}, ${item.color}, ${item.season}, ${item.styles?.join(', ') || 'no specific styles'})`
).join('\n')}

**Recommendation Strategy:**
- Suggest items that complement their existing wardrobe
- Consider their preferred styles: ${customerData.wardrobeItems.map(item => item.styles).flat().filter(Boolean).join(', ')}
- Recommend colors that work with their skin tone and existing color palette
- Suggest items for seasons they need most based on current wardrobe gaps
`
      }
      
      // Add preferences context
      if (customerData.preferences) {
        customerContext += `
**Customer Preferences:**
- Budget Range: ${customerData.preferences.currency || 'INR'} ${customerData.preferences.budgetMin || 'Not specified'} - ${customerData.preferences.budgetMax || 'Not specified'}
`
      }
    }

    // Create detailed prompt for OpenAI to generate product recommendations
    const prompt = `
You are a professional fashion shopping assistant. Based on the user's search query and preferences, provide specific product recommendations with shopping guidance.

${customerContext}
${wardrobeContext}

**User Search:** ${query}
${category ? `**Category:** ${category}` : ''}
${budget ? `**Budget:** ${budget}` : ''}
${style ? `**Style Preference:** ${style}` : ''}

**Your Task:**
Provide 3-5 specific product recommendations that would work well for the user's needs. Be specific about brands, styles, and where to find them.

**Important Considerations:**
- Recommend items that complement their existing wardrobe
- Consider their body type (height, weight, physique) for proper fit
- Suggest colors that work with their skin tone and existing color palette
- Keep within their budget range
- Match their style essence and personality vibe
- Consider what they typically wear (wears most) and avoid what they don't like
- Suggest items for seasons they need based on current wardrobe gaps

**Response Format (JSON):**
{
  "products": [
    {
      "name": "Specific Product Name",
      "description": "Brief description of the item and why it works",
      "priceRange": "$50-100 or similar range",
      "category": "clothing type",
      "style": "style description",
      "whereToBuy": ["Store 1", "Store 2", "Online retailer"],
      "whyRecommended": "Why this specific item would work well"
    }
  ]
}

**Guidelines:**
- Be specific about actual products, not generic categories
- Include realistic price ranges
- Suggest well-known retailers and brands
- Explain why each item would work for their needs
- Consider their style preferences and budget
- Focus on versatile, high-quality items
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional fashion shopping assistant who provides specific product recommendations with detailed shopping guidance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content
    
    if (!aiResponse) {
      throw new Error("No response from OpenAI")
    }

    // Parse the AI response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(aiResponse)
    } catch (parseError) {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not parse AI response as JSON")
      }
    }

    return NextResponse.json({ 
      success: true, 
      products: parsedResponse.products || []
    })

  } catch (error) {
    console.error("Error generating product recommendations:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate product recommendations" 
    }, { status: 500 })
  }
}