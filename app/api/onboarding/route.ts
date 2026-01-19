import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { profileSchema, preferencesSchema } from "@/models/user";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const profile = profileSchema.parse(body.profile);
    const preferences = preferencesSchema.parse(body.preferences);

    const userRef = adminDb.collection("users").doc(decoded.id);

    await userRef.update({
      profile,
      preferences,
      onboarded: true,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, userId: decoded.id });
  } catch (error) {
    console.error("Onboarding error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}