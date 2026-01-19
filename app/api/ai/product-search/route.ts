import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ProductSearchRequest {
  query: string
  category?: string
  budget?: string
  style?: string
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, category, budget, style } = body as ProductSearchRequest

    if (!query) {
      return NextResponse.json({ 
        success: false, 
        message: "Search query is required" 
      }, { status: 400 })
    }

    // Create detailed prompt for OpenAI to generate product recommendations
    const prompt = `
You are a professional fashion shopping assistant. Based on the user's search query and preferences, provide specific product recommendations with shopping guidance.

**User Search:** ${query}
${category ? `**Category:** ${category}` : ''}
${budget ? `**Budget:** ${budget}` : ''}
${style ? `**Style Preference:** ${style}` : ''}

**Your Task:**
Provide 3-5 specific product recommendations that would work well for the user's needs. Be specific about brands, styles, and where to find them.

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