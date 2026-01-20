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
}

export async function GET() {
  const snapshot = await adminDb.collection("users").limit(20).get()

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
          height: "average",
          physique: "slim",
          skinTone: "wheatish",
          hairColor: "Black",
          fullBodyPhotoUrl: "https://example.com/demo1-full.jpg",
          facePhotoUrl: "https://example.com/demo1-face.jpg",
          wearsMost: ["Tops", "Bottoms"],
          fitPreference: "regular",
          colorComfort: "neutral",
          dressingPurpose: "work",
          avoids: ["sleeveless"],
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
          height: "tall",
          physique: "athletic",
          skinTone: "medium",
          hairColor: "Brown",
          fullBodyPhotoUrl: "https://example.com/demo2-full.jpg",
          facePhotoUrl: "https://example.com/demo2-face.jpg",
          wearsMost: ["Dresses", "Accessories"],
          fitPreference: "slim",
          colorComfort: "bold",
          dressingPurpose: "party",
          avoids: ["stripes"],
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
          height: "short",
          physique: "average",
          skinTone: "fair",
          hairColor: "Blonde",
          fullBodyPhotoUrl: "https://example.com/demo3-full.jpg",
          facePhotoUrl: "https://example.com/demo3-face.jpg",
          wearsMost: ["Tops", "Dresses"],
          fitPreference: "loose",
          colorComfort: "pastel",
          dressingPurpose: "casual",
          avoids: ["polka dots"],
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
      contactNumber?: string
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

    return {
      id: doc.id,
      name: data.name ?? "Unknown user",
      contactNumber: data.contactNumber ?? "",
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
