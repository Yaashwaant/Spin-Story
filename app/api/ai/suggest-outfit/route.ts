import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

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
    title: string
    summary: string
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

    // Intelligent outfit matching algorithm
    const matchedItems = matchOutfitItems(wardrobeItems, mood, season, occasion)

    if (matchedItems.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "No suitable items found for the selected criteria" 
      })
    }

    // Generate suggestion based on matched items
    const suggestion = generateOutfitSuggestion(matchedItems, mood, season, occasion)

    return NextResponse.json({ 
      success: true, 
      suggestion 
    })

  } catch (error) {
    console.error("Error generating outfit suggestion:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to generate outfit suggestion" 
    }, { status: 500 })
  }
}

function matchOutfitItems(items: WardrobeItem[], mood: string, season: string, occasion: string): WardrobeItem[] {
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

  return selectedOutfit
}

function generateOutfitSuggestion(matchedItems: WardrobeItem[], mood: string, season: string, occasion: string) {
  const itemNames = matchedItems.map(item => item.name)
  const itemImages = matchedItems.map(item => item.image)
  
  return {
    title: `${mood} ${season} Look from Your Wardrobe`,
    summary: `For ${occasion || "your plans"} • ${mood} mood • ${matchedItems.length} items from your wardrobe`,
    items: itemNames,
    itemImages: itemImages,
    matchedItems: matchedItems
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