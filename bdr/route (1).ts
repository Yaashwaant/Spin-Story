import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"
import { cookies } from "next/headers"

const chatRequestSchema = z.object({
  message: z.string().min(1),
  userId: z.string().min(1),
  userProfile: z.object({}).optional(),
  userPreferences: z.object({}).optional(),
  wardrobeItems: z.array(z.object({})).optional(),
  wardrobeUploaded: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = chatRequestSchema.parse(body)
    
    const { message, userProfile, userPreferences, wardrobeItems, wardrobeUploaded } = validatedData

    // Generate context-aware response based on user data
    const response = generateOutfitPlannerResponse(message, {
      userProfile,
      userPreferences,
      wardrobeItems,
      wardrobeUploaded,
      userName: user.fullName
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Outfit planner chat error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }
    
    return NextResponse.json({ 
      response: "I'm sorry, I encountered an error processing your request. Please try again." 
    }, { status: 500 })
  }
}

function generateOutfitPlannerResponse(message: string, context: {
  userProfile?: any
  userPreferences?: any
  wardrobeItems?: any[]
  wardrobeUploaded?: boolean
  userName: string
}): string {
  const { userProfile, userPreferences, wardrobeItems, wardrobeUploaded, userName } = context
  
  const lowerMessage = message.toLowerCase()
  
  // Handle different types of queries
  if (lowerMessage.includes('casual') || lowerMessage.includes('day out')) {
    return generateCasualOutfitResponse(userProfile, userPreferences, wardrobeUploaded, wardrobeItems)
  }
  
  if (lowerMessage.includes('business') || lowerMessage.includes('meeting')) {
    return generateBusinessOutfitResponse(userProfile, userPreferences, wardrobeUploaded, wardrobeItems)
  }
  
  if (lowerMessage.includes('color') || lowerMessage.includes('suit')) {
    return generateColorAdviceResponse(userProfile, userPreferences)
  }
  
  if (lowerMessage.includes('organize') || lowerMessage.includes('wardrobe')) {
    return generateOrganizationAdviceResponse(userProfile, userPreferences, wardrobeItems)
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return generateGreetingResponse(userProfile, userPreferences, userName)
  }
  
  // Default response
  return generateDefaultResponse(userProfile, userPreferences, wardrobeUploaded, wardrobeItems)
}

function generateCasualOutfitResponse(userProfile?: any, userPreferences?: any, wardrobeUploaded?: boolean, wardrobeItems?: any[]): string {
  let response = "For a casual day out, here's what I'd recommend:"
  
  if (userProfile) {
    response += `\n\nGiven your ${userProfile.height || 'average'} height and ${userProfile.physique || 'average'} build, `
    response += `with a preference for ${userProfile.fitPreference || 'regular'} fit, `
    response += `I'd suggest comfortable yet stylish pieces.`
  }
  
  response += `\n\n**Casual Outfit Suggestions:**`
  response += `\n| Item | Recommendation |`
  response += `\n|------|----------------|`
  response += `\n| Top | Well-fitted t-shirt or casual button-down |`
  response += `\n| Bottoms | Comfortable jeans or chinos |`
  response += `\n| Footwear | Clean sneakers or casual loafers |`
  response += `\n| Accessories | Minimal watch, sunglasses if sunny |`
  
  if (userProfile?.colorComfort === "bold") {
    response += `\n\nSince you're comfortable with bold colors, consider adding a pop of color with your top or accessories.`
  } else if (userProfile?.colorComfort === "neutral") {
    response += `\n\nStick to neutral tones like white, gray, navy, or black for a timeless casual look.`
  }
  
  if (wardrobeUploaded && wardrobeItems && wardrobeItems.length > 0) {
    response += `\n\nBased on your wardrobe, I can see you have ${wardrobeItems.length} items to work with. `
    response += `Let me know if you'd like me to suggest specific combinations from your existing clothes!`
  }
  
  return response
}

function generateBusinessOutfitResponse(userProfile?: any, userPreferences?: any, wardrobeUploaded?: boolean, wardrobeItems?: any[]): string {
  let response = "For a business meeting, here's my recommendation:"
  
  response += `\n\n**Professional Outfit Suggestions:**`
  response += `\n| Item | Recommendation |`
  response += `\n|------|----------------|`
  response += `\n| Top | Crisp dress shirt or blouse |`
  response += `\n| Bottoms | Tailored trousers or pencil skirt |`
  response += `\n| Outerwear | Blazer or structured jacket |`
  response += `\n| Footwear | Closed-toe dress shoes |`
  response += `\n| Accessories | Minimal jewelry, professional watch |`
  
  if (userProfile?.dressingPurpose === "work") {
    response += `\n\nPerfect! Since you primarily dress for work, you'll want to invest in versatile pieces that can be mixed and matched.`
  }
  
  if (userPreferences?.budgetMin && userPreferences?.budgetMax) {
    response += `\n\nWith your budget range of ₹${userPreferences.budgetMin} - ₹${userPreferences.budgetMax}, `
    response += `focus on quality basics that will last longer and maintain their professional appearance.`
  }
  
  return response
}

function generateColorAdviceResponse(userProfile?: any, userPreferences?: any): string {
  let response = "Here are my color recommendations for you:"
  
  if (userProfile?.skinTone) {
    response += `\n\nBased on your ${userProfile.skinTone} skin tone:`
    
    switch (userProfile.skinTone) {
      case "fair":
        response += "\n- **Best colors**: Navy, burgundy, forest green, soft pastels"
        response += "\n- **Avoid**: Very light colors that might wash you out"
        break
      case "medium":
        response += "\n- **Best colors**: Most colors work well, especially rich jewel tones"
        response += "\n- **Great options**: Emerald, sapphire, ruby, amber"
        break
      case "wheatish":
        response += "\n- **Best colors**: Earth tones, jewel tones, rich autumn colors"
        response += "\n- **Excellent choices**: Rust, olive, teal, maroon"
        break
      case "dark":
        response += "\n- **Best colors**: Bright, vibrant colors and rich jewel tones"
        response += "\n- **Standout options**: Royal blue, emerald green, bright orange, white"
        break
      default:
        response += "\n- Most colors will work well with your skin tone."
    }
  }
  
  if (userProfile?.hairColor) {
    response += `\n\nWith ${userProfile.hairColor} hair:`
    response += "\n- Consider colors that complement your hair color"
    response += "\n- Neutral colors often work well with any hair color"
  }
  
  if (userProfile?.colorComfort) {
    response += `\n\nGiven your comfort level with ${userProfile.colorComfort} colors:`
    
    switch (userProfile.colorComfort) {
      case "neutral":
        response += "\n- Stick to whites, blacks, grays, navys, and beiges"
        response += "\n- These are timeless and easy to mix and match"
        break
      case "pastel":
        response += "\n- Soft pinks, baby blues, mint greens, lavender"
        response += "\n- These gentle colors are perfect for a subtle look"
        break
      case "bold":
        response += "\n- Don't shy away from bright reds, electric blues, vibrant yellows"
        response += "\n- Use bold colors as statement pieces or accents"
        break
    }
  }
  
  return response
}

function generateOrganizationAdviceResponse(userProfile?: any, userPreferences?: any, wardrobeItems?: any[]): string {
  let response = "Here are my wardrobe organization tips:"
  
  response += `

**Organization Strategy:**`
  response += `
| Category | Organization Method |`
  response += `
|----------|---------------------|`
  response += `
| Tops | Group by color, then by sleeve length |`
  response += `
| Bottoms | Separate by type (jeans, trousers, skirts) |`
  response += `
| Outerwear | Seasonal rotation, heavy to light |`
  response += `
| Shoes | Daily wear vs. special occasion |`
  
  if (wardrobeItems && wardrobeItems.length > 0) {
    response += `

You currently have ${wardrobeItems.length} items in your digital wardrobe. `
    response += `Consider organizing them by:`
    response += "\n1. **Season**: Keep current season items accessible"
    response += "\n2. **Occasion**: Work, casual, formal, special events"
    response += "\n3. **Color**: Makes it easier to create coordinated outfits"
    response += "\n4. **Frequency**: Most-worn items should be most accessible"
  } else {
    response += `

Start building your digital wardrobe by uploading photos of your favorite pieces. `
    response += `This will help me give you more personalized organization and styling advice!`
  }
  
  if (userProfile?.wearsMost) {
    response += `

Since you wear ${userProfile.wearsMost.join(', ')} most often, `
    response += `make sure these categories are the most organized and accessible in your wardrobe.`
  }
  
  return response
}

function generateGreetingResponse(userProfile?: any, userPreferences?: any, userName: string): string {
  let response = `Hello ${userName}! `
  
  if (userProfile) {
    response += `I can see you're ${userProfile.height || 'average height'} with ${userProfile.physique || 'average'} build. `
    response += `Your style preferences include ${userProfile.fitPreference || 'regular'} fit and ${userProfile.colorComfort || 'neutral'} colors. `
  }
  
  if (userPreferences) {
    response += `Your budget range is ₹${userPreferences.budgetMin || '0'} - ₹${userPreferences.budgetMax || 'unlimited'}. `
  }
  
  response += `

How can I help you with your outfit planning today? You can ask me about:`
  response += `
• Casual outfit suggestions`
  response += `
• Business or formal wear`
  response += `
• Color recommendations`
  response += `
• Wardrobe organization`
  response += `
• Styling for specific occasions`
  
  return response
}

function generateDefaultResponse(userProfile?: any, userPreferences?: any, wardrobeUploaded?: boolean, wardrobeItems?: any[]): string {
  let response = "I'd be happy to help you with outfit planning! "
  
  if (userProfile) {
    response += `Based on your profile (${userProfile.height || 'average'} height, ${userProfile.physique || 'average'} build, ${userProfile.fitPreference || 'regular'} fit preference), `
  }
  
  response += "here are some things you can ask me about:"
  response += `

• **Outfit suggestions**: "What should I wear for a casual day out?"`
  response += `
• **Business attire**: "Help me plan for a business meeting"`
  response += `
• **Color advice**: "What colors suit me best?"`
  response += `
• **Wardrobe help**: "Help me organize my wardrobe"`
  
  if (wardrobeUploaded && wardrobeItems && wardrobeItems.length > 0) {
    response += `

I can also work with your existing wardrobe of ${wardrobeItems.length} items to create specific outfit combinations!`
  }
  
  return response
}
