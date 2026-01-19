import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface WardrobeItem {
  id: string
  name: string
  image: string
  type: string
  color: string
  season: string
  styles: string[]
  customerId: string
  createdAt: string
  updatedAt: string
}

interface OutfitSuggestionRequest {
  customerId: string
  mood: string
  season: string
  occasion: string
}

interface OutfitSuggestionResponse {
  success: boolean
  suggestion?: {
    items: string[]
    itemImages: string[]
    matchedItems: WardrobeItem[]
  }
  message?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { customerId, mood, season, occasion } = body as OutfitSuggestionRequest

    if (!customerId) {
      return NextResponse.json({ 
        success: false, 
        message: "Customer ID is required" 
      }, { status: 400 })
    }

    // Fetch user's wardrobe items
    const wardrobeSnapshot = await adminDb
      .collection('wardrobe')
      .where('customerId', '==', customerId)
      .get()

    const wardrobeItems: WardrobeItem[] = wardrobeSnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || '',
        image: data.image || '',
        type: data.type || '',
        color: data.color || '',
        season: data.season || '',
        styles: data.styles || [],
        customerId: data.customerId || '',
        createdAt: data.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
      }
    })

    if (wardrobeItems.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No items found in wardrobe" 
      })
    }

    // Use OpenAI to intelligently select the best outfit
    const aiSuggestion = await generateCleanOpenAIOutfitSuggestion(
      wardrobeItems, 
      mood, 
      season, 
      occasion
    )

    return NextResponse.json({ 
      success: true, 
      suggestion: aiSuggestion
    })

  } catch (error) {
    console.error("Error generating AI outfit suggestion:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate AI outfit suggestion" 
    }, { status: 500 })
  }
}

async function generateCleanOpenAIOutfitSuggestion(
  items: WardrobeItem[], 
  mood: string, 
  season: string, 
  occasion: string
): Promise<{
  items: string[]
  itemImages: string[]
  matchedItems: WardrobeItem[]
}> {
  
  // Prepare wardrobe data for OpenAI
  const wardrobeData = items.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    color: item.color,
    season: item.season,
    styles: item.styles,
    image: item.image
  }))

  // Create clean prompt for OpenAI - focus only on item selection
  const prompt = `
You are a professional fashion stylist AI. Select the perfect outfit combination from the user's wardrobe.

**User Context:**
- Mood: ${mood}
- Season: ${season}
- Occasion: ${occasion || "casual wear"}

**Available Wardrobe Items:**
${JSON.stringify(wardrobeData, null, 2)}

**Your Task:**
Select 4-6 items that create a cohesive outfit. Consider color coordination, style compatibility, and appropriateness.

**Return ONLY the item IDs in JSON format:**
{
  "selectedItemIds": ["item_id_1", "item_id_2", "item_id_3", "item_id_4", "item_id_5", "item_id_6"]
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a fashion AI that selects outfit items. Return only item IDs in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
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

    // Find the selected items in the wardrobe
    const selectedItems = items.filter(item => 
      parsedResponse.selectedItemIds.includes(item.id)
    )

    if (selectedItems.length === 0) {
      throw new Error("No matching items found in wardrobe")
    }

    return {
      items: selectedItems.map(item => item.name),
      itemImages: selectedItems.map(item => item.image),
      matchedItems: selectedItems
    }

  } catch (error) {
    console.error("OpenAI API error:", error)
    // Fallback to traditional matching if OpenAI fails
    return fallbackToCleanTraditionalMatching(items, mood, season, occasion)
  }
}

function fallbackToCleanTraditionalMatching(
  items: WardrobeItem[], 
  mood: string, 
  season: string, 
  occasion: string
): {
  items: string[]
  itemImages: string[]
  matchedItems: WardrobeItem[]
} {
  
  // Define outfit composition rules
  const outfitRules = {
    tops: ['shirt', 't-shirt', 'blouse', 'sweater', 'jacket', 'top'],
    bottoms: ['pants', 'jeans', 'trousers', 'shorts', 'skirt'],
    shoes: ['sneakers', 'shoes', 'boots', 'sandals'],
    accessories: ['watch', 'bag', 'scarf', 'hat', 'belt']
  }

  // Filter items by season
  const seasonFiltered = items.filter(item => 
    item.season === season || item.season === 'All Season'
  )

  // Filter by mood
  const moodFiltered = seasonFiltered.filter(item => {
    const moodStyles = getMoodStyles(mood)
    return item.styles.some(style => 
      moodStyles.includes(style.toLowerCase()) ||
      style.toLowerCase().includes(mood.toLowerCase())
    )
  })

  // Filter by occasion
  const occasionFiltered = moodFiltered.filter(item => {
    if (!occasion) return true
    
    const occasionLower = occasion.toLowerCase()
    const occasionStyles = getOccasionStyles(occasionLower)
    
    return item.styles.some(style => 
      occasionStyles.includes(style.toLowerCase())
    )
  })

  // Group by type and select best items
  const groupedItems = {
    tops: occasionFiltered.filter(item => outfitRules.tops.includes(item.type.toLowerCase())),
    bottoms: occasionFiltered.filter(item => outfitRules.bottoms.includes(item.type.toLowerCase())),
    shoes: occasionFiltered.filter(item => outfitRules.shoes.includes(item.type.toLowerCase())),
    accessories: occasionFiltered.filter(item => outfitRules.accessories.includes(item.type.toLowerCase()))
  }

  // Select one item from each category (prioritize by creation date)
  const selectedOutfit: WardrobeItem[] = []
  
  // Sort each category by creation date (newest first)
  Object.keys(groupedItems).forEach(category => {
    groupedItems[category as keyof typeof groupedItems].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  // Select items
  if (groupedItems.tops.length > 0) {
    selectedOutfit.push(groupedItems.tops[0])
  }
  if (groupedItems.bottoms.length > 0) {
    selectedOutfit.push(groupedItems.bottoms[0])
  }
  if (groupedItems.shoes.length > 0) {
    selectedOutfit.push(groupedItems.shoes[0])
  }
  if (groupedItems.accessories.length > 0) {
    selectedOutfit.push(groupedItems.accessories[0])
  }

  return {
    items: selectedOutfit.map(item => item.name),
    itemImages: selectedOutfit.map(item => item.image),
    matchedItems: selectedOutfit
  }
}

function getMoodStyles(mood: string): string[] {
  const moodStyleMap: Record<string, string[]> = {
    'Relaxed': ['casual', 'comfortable', 'laid-back'],
    'Playful': ['casual', 'modern', 'fun'],
    'Elegant': ['formal', 'classic', 'sophisticated'],
    'Confident': ['formal', 'modern', 'bold']
  }
  return moodStyleMap[mood] || ['casual']
}

function getOccasionStyles(occasion: string): string[] {
  if (occasion.includes('work') || occasion.includes('office')) {
    return ['formal', 'classic', 'professional']
  } else if (occasion.includes('casual') || occasion.includes('weekend')) {
    return ['casual', 'comfortable']
  } else if (occasion.includes('party') || occasion.includes('event') || occasion.includes('night')) {
    return ['formal', 'modern', 'elegant']
  } else if (occasion.includes('date')) {
    return ['casual', 'modern', 'elegant']
  } else if (occasion.includes('sport') || occasion.includes('gym')) {
    return ['casual', 'comfortable', 'sporty']
  }
  return ['casual']
}