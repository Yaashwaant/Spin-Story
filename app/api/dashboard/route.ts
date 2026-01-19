import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

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

    // Get user data first
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();

    console.log('=== DASHBOARD API: userId from token:', userId);
    console.log('=== DASHBOARD API: Using userId as customerId for query');

    // Try to get wardrobe items, but handle if collection doesn't exist
    let wardrobeItems = [];
    let recentOutfits = [];
    let savedOutfits = [];

    try {
      console.log('=== DASHBOARD API: Querying wardrobe with customerId:', userId);
      const wardrobeSnapshot = await adminDb
        .collection("wardrobe")
        .where("customerId", "==", userId)
        .limit(6)
        .get();
      
      console.log('=== DASHBOARD API: Found', wardrobeSnapshot.docs.length, 'wardrobe items');
      wardrobeItems = wardrobeSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('=== DASHBOARD API: Item data:', data);
        return {
          id: doc.id,
          name: data.name,
          imageUrl: data.image,
          category: data.type,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });
      
      // Sort by createdAt manually since we can't use orderBy without index
      wardrobeItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.log("Wardrobe items collection not found or empty, using mock data");
      console.log('=== DASHBOARD API: Error querying wardrobe:', error);
      // Mock wardrobe items for new users
      wardrobeItems = [
        {
          id: "mock-1",
          name: "Classic White Shirt",
          imageUrl: "https://via.placeholder.com/150x150/ffffff/000000?text=White+Shirt",
          category: "Tops",
          createdAt: new Date(),
        },
        {
          id: "mock-2",
          name: "Blue Jeans",
          imageUrl: "https://via.placeholder.com/150x150/0000ff/ffffff?text=Blue+Jeans",
          category: "Bottoms",
          createdAt: new Date(),
        },
        {
          id: "mock-3",
          name: "Black Jacket",
          imageUrl: "https://via.placeholder.com/150x150/000000/ffffff?text=Black+Jacket",
          category: "Outerwear",
          createdAt: new Date(),
        },
      ];
    }

    try {
      const outfitsSnapshot = await adminDb
        .collection("outfits")
        .where("userId", "==", userId)
        .limit(4)
        .get();
      
      recentOutfits = outfitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      
      // Sort by createdAt manually since we can't use orderBy without index
      recentOutfits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.log("Outfits collection not found or empty, using mock data");
      // Mock recent outfits for new users
      recentOutfits = [
        {
          id: "mock-outfit-1",
          name: "Casual Friday",
          imageUrl: "https://via.placeholder.com/200x200/4CAF50/ffffff?text=Casual+Friday",
          occasion: "Casual",
          createdAt: new Date(),
        },
        {
          id: "mock-outfit-2",
          name: "Business Meeting",
          imageUrl: "https://via.placeholder.com/200x200/2196F3/ffffff?text=Business+Meeting",
          occasion: "Work",
          createdAt: new Date(),
        },
      ];
    }

    try {
      const savedSnapshot = await adminDb
        .collection("savedOutfits")
        .where("userId", "==", userId)
        .limit(4)
        .get();
      
      savedOutfits = savedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      
      // Sort by createdAt manually since we can't use orderBy without index
      savedOutfits.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.log("Saved outfits collection not found or empty, using mock data");
      // Mock saved outfits for new users
      savedOutfits = [
        {
          id: "mock-saved-1",
          name: "Date Night Look",
          imageUrl: "https://via.placeholder.com/200x200/E91E63/ffffff?text=Date+Night",
          occasion: "Date",
          createdAt: new Date(),
        },
        {
          id: "mock-saved-2",
          name: "Weekend Vibes",
          imageUrl: "https://via.placeholder.com/200x200/FF9800/ffffff?text=Weekend+Vibes",
          occasion: "Casual",
          createdAt: new Date(),
        },
      ];
    }

    const dashboardData = {
      user: {
        fullName: decoded.fullName,
        email: decoded.email,
        onboarded: userData?.onboarded || false,
      },
      stats: {
        totalItems: wardrobeItems.length,
        recentOutfits: recentOutfits.length,
        savedOutfits: savedOutfits.length,
      },
      recentItems: wardrobeItems,
      recentOutfits: recentOutfits,
      savedOutfits: savedOutfits,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}