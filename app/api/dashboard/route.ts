import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

interface ClothingItem {
  id: string;
  name: string;
  image: string;
  type: string;
  color: string;
  season: string;
  styles: string[];
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // Try to get wardrobe items first - this is what we need for preview
    let wardrobeItems: ClothingItem[] = [];

    try {
      // Fetch only wardrobe items for the preview - faster initial load
      const wardrobeSnapshot = await adminDb
        .collection("wardrobe")
        .where("customerId", "==", userId)

        .get();

      // Process wardrobe items immediately
      if (!wardrobeSnapshot.empty) {
        wardrobeItems = wardrobeSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            image: data.image || '',
            type: data.type || '',
            color: data.color || '',
            season: data.season || 'All Season',
            styles: data.styles || [],
            customerId: data.customerId || userId,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          };
        });
        // Sort by createdAt manually since we can't use orderBy without index
        wardrobeItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    } catch (error) {
      console.log("Wardrobe items collection not found or error, using mock data");
    }

    // If no wardrobe items, provide mock data for immediate display
    if (wardrobeItems.length === 0) {
      wardrobeItems = [
        {
          id: "mock-1",
          name: "Classic White Shirt",
          image: "https://via.placeholder.com/150x150/ffffff/000000?text=White+Shirt",
          type: "Tops",
          color: "White",
          season: "All Season",
          styles: ["Casual", "Formal"],
          customerId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "mock-2",
          name: "Blue Jeans",
          image: "https://via.placeholder.com/150x150/0000ff/ffffff?text=Blue+Jeans",
          type: "Bottoms",
          color: "Blue",
          season: "All Season",
          styles: ["Casual"],
          customerId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "mock-3",
          name: "Black Jacket",
          image: "https://via.placeholder.com/150x150/000000/ffffff?text=Black+Jacket",
          type: "Outerwear",
          color: "Black",
          season: "Winter",
          styles: ["Formal"],
          customerId: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }

    // Fetch user profile data to include styling advice
    let userData = null;
    try {
      const userDoc = await adminDb.collection("users").doc(userId).get();
      if (userDoc.exists) {
        const userDocData = userDoc.data();
        userData = {
          fullName: userDocData?.name || userDocData?.fullName || "User",
          email: userDocData?.email || "",
          onboarded: userDocData?.onboarded || false,
          profile: userDocData?.profile || null,
        };
      }
    } catch (error) {
      console.log("User profile not found or error:", error);
    }

    // Return wardrobe items immediately for faster preview load
    return NextResponse.json({
      data: {
        recentItems: wardrobeItems,
        // Other data can be loaded later or on demand
        recentOutfits: [],
        savedOutfits: [],
        userData: userData,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}