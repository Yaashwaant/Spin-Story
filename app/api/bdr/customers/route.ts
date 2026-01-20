import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { Profile, Preferences } from "@/models/user"

interface BdrCustomerSummary {
  id: string
  name: string
  contactNumber: string
  wardrobeUploaded: boolean
  outfitPlanCount: number
  isDemo: boolean
  createdAt: string
  updatedAt: string
  profile?: Profile
  preferences?: Preferences
  fullName?: string
  phoneNumber?: string
}

export async function GET() {
  const snapshot = await adminDb.collection("users").limit(20).get()

  // Debug: Log the actual data structure
  if (!snapshot.empty) {
    console.log(`Found ${snapshot.size} users in database`)
    snapshot.forEach((doc) => {
      const data = doc.data()
      console.log(`User ${doc.id}:`, {
        name: data.name,
        contactNumber: data.contactNumber,
        hasProfile: !!data.profile,
        hasPreferences: !!data.preferences
      })
    })
  }

  if (snapshot.empty) {
    const now = new Date()
    const demoUsers: Array<Omit<BdrCustomerSummary, "id">> = [
      {
        name: "Demo user one",
        contactNumber: "+91 90000 00001",
        wardrobeUploaded: true,
        outfitPlanCount: 3,
        isDemo: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        profile: {
          height: 170,
          weight: 65,
          hairColor: "Black",
          fullBodyPhotoUrl: "https://example.com/demo1-full.jpg",
          facePhotoUrl: "https://example.com/demo1-face.jpg",
          wearsMost: ["Tops", "Bottoms"],
          fitPreference: ["regular"],
          colorComfort: "neutral",
          avoids: ["sleeveless"],
          gender: "female",
          age: 25,
          aiExtractedTraits: {
            physique: "slim",
            skinTone: "wheatish",
            dressingPurpose: "work"
          }
        },
        preferences: {
          budgetMin: 500,
          budgetMax: 5000,
          currency: "INR",
        },
      },
      {
        name: "Demo user two",
        contactNumber: "+91 90000 00002",
        wardrobeUploaded: false,
        outfitPlanCount: 0,
        isDemo: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        profile: {
          height: 185,
          weight: 75,
          hairColor: "Brown",
          fullBodyPhotoUrl: "https://example.com/demo2-full.jpg",
          facePhotoUrl: "https://example.com/demo2-face.jpg",
          wearsMost: ["Dresses", "Accessories"],
          fitPreference: ["slim"],
          colorComfort: "bold",
          avoids: ["stripes"],
          gender: "female",
          age: 28,
          aiExtractedTraits: {
            physique: "athletic",
            skinTone: "medium",
            dressingPurpose: "party"
          }
        },
        preferences: {
          budgetMin: 1000,
          budgetMax: 8000,
          currency: "INR",
        },
      },
      {
        name: "Demo user three",
        contactNumber: "+91 90000 00003",
        wardrobeUploaded: true,
        outfitPlanCount: 1,
        isDemo: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        profile: {
          height: 160,
          weight: 60,
          hairColor: "Blonde",
          fullBodyPhotoUrl: "https://example.com/demo3-full.jpg",
          facePhotoUrl: "https://example.com/demo3-face.jpg",
          wearsMost: ["Tops", "Dresses"],
          fitPreference: ["loose"],
          colorComfort: "pastel",
          avoids: ["polka dots"],
          gender: "female",
          age: 22,
          aiExtractedTraits: {
            physique: "average",
            skinTone: "fair",
            dressingPurpose: "casual"
          }
        },
        preferences: {
          budgetMin: 300,
          budgetMax: 3000,
          currency: "INR",
        },
      },
    ]

    const batch = adminDb.batch()
    const usersCollection = adminDb.collection("users")

    demoUsers.forEach((demoUser) => {
      const ref = usersCollection.doc()
      batch.set(ref, {
        name: demoUser.name,
        contactNumber: demoUser.contactNumber,
        wardrobeUploaded: demoUser.wardrobeUploaded,
        outfitPlanCount: demoUser.outfitPlanCount,
        isDemo: demoUser.isDemo,
        createdAt: now,
        updatedAt: now,
        profile: demoUser.profile,
        preferences: demoUser.preferences,
      })
    })

    await batch.commit()
  }

  const afterSeedSnapshot = await adminDb.collection("users").limit(20).get()

  const customers: BdrCustomerSummary[] = afterSeedSnapshot.docs.map((doc) => {
    const data = doc.data() as {
      name?: string
      fullName?: string
      contactNumber?: string
      phoneNumber?: string
      wardrobeUploaded?: boolean
      outfitPlanCount?: number
      isDemo?: boolean
      createdAt?: unknown
      updatedAt?: unknown
      profile?: Profile
      preferences?: Preferences
    }

    const createdAt =
      data.createdAt instanceof Date
        ? data.createdAt.toISOString()
        : typeof data.createdAt === "string"
          ? data.createdAt
          : ""

    const updatedAt =
      data.updatedAt instanceof Date
        ? data.updatedAt.toISOString()
        : typeof data.updatedAt === "string"
          ? data.updatedAt
          : ""

    // Try to get a meaningful name from multiple sources
    let customerName = data.name || data.fullName || ""
    
    // If no name is found, create one from contact info
    if (!customerName || customerName === "Unknown user") {
      const contact = data.contactNumber || data.phoneNumber || ""
      if (contact) {
        customerName = `Customer ${contact.slice(-4)}`
      } else {
        customerName = `Customer ${doc.id.slice(-4)}`
      }
    }

    return {
      id: doc.id,
      name: customerName,
      contactNumber: data.contactNumber || data.phoneNumber || "",
      wardrobeUploaded: data.wardrobeUploaded ?? false,
      outfitPlanCount: data.outfitPlanCount ?? 0,
      isDemo: data.isDemo ?? false,
      createdAt,
      updatedAt,
      profile: data.profile,
      preferences: data.preferences,
    }
  })

  return NextResponse.json({ customers })
}
