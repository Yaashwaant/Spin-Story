import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export interface WardrobeItem {
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

// GET: Fetch wardrobe items for a customer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId')

    console.log('=== WARDROBE API: GET request with customerId:', customerId);

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const snapshot = await adminDb
      .collection('wardrobe')
      .where('customerId', '==', customerId)
      .get()

    console.log('=== WARDROBE API: Found', snapshot.docs.length, 'items for customerId:', customerId);

    const wardrobeItems: WardrobeItem[] = snapshot.docs.map(doc => {
      const data = doc.data()
      console.log('=== WARDROBE API: Item data:', data);
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

    return NextResponse.json({ items: wardrobeItems })
  } catch (error) {
    console.error("Error fetching wardrobe items:", error)
    return NextResponse.json({ error: "Failed to fetch wardrobe items" }, { status: 500 })
  }
}

// POST: Add a new wardrobe item
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, image, type, color, season, styles, customerId } = body

    console.log('=== WARDROBE API: POST request with data:', { name, image, type, color, season, styles, customerId });

    if (!customerId || !name || !type || !color) {
      return NextResponse.json({ 
        error: "Missing required fields: customerId, name, type, color are required" 
      }, { status: 400 })
    }

    const now = new Date()
    const wardrobeData = {
      name,
      image: image || '',
      type: type || '',
      color: color || '',
      season: season || 'All Season',
      styles: styles || [],
      customerId,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = await adminDb.collection('wardrobe').add(wardrobeData)

    console.log('=== WARDROBE API: Item saved successfully with ID:', docRef.id);
    console.log('=== WARDROBE API: Saved data:', wardrobeData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      message: "Wardrobe item added successfully" 
    })
  } catch (error) {
    console.error("Error adding wardrobe item:", error)
    return NextResponse.json({ error: "Failed to add wardrobe item" }, { status: 500 })
  }
}