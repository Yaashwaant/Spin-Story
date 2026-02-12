import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { profileSchema, preferencesSchema } from "@/models/user";
import { verifyToken, generateToken } from "@/lib/auth";

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
    
    console.log("Onboarding API - decoded token:", decoded);
    console.log("Onboarding API - user ID from token:", decoded.id);
    console.log("Onboarding API - user email from token:", decoded.email);

    const body = await req.json();
    console.log("Onboarding API - received body:", body);
    console.log("Onboarding API - received aiExtractedTraits:", body.profile?.aiExtractedTraits);
    
    const profile = profileSchema.parse(body.profile);
    const preferences = preferencesSchema.parse(body.preferences);
    
    console.log("Onboarding API - parsed aiExtractedTraits:", profile.aiExtractedTraits);

    const userRef = adminDb.collection("users").doc(decoded.id);
    console.log("Onboarding API - looking for user document with ID:", decoded.id);
    console.log("Onboarding API - userRef path:", userRef.path);
    
    // Also try to find user by email to check for ID mismatch
    const userByEmail = await adminDb.collection("users").where("email", "==", decoded.email).limit(1).get();
    console.log("Onboarding API - users found by email:", userByEmail.docs.length);
    if (!userByEmail.empty) {
      console.log("Onboarding API - user found by email:", userByEmail.docs[0].id, userByEmail.docs[0].data());
    }

    console.log("Onboarding - updating user with profile and preferences (NOT setting onboarded yet)");
    
    // Check if user document exists
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log("Onboarding - user document exists, updating profile and preferences");
      console.log("Onboarding - current user document:", userDoc.data());
      console.log("Onboarding - current profile:", userDoc.data()?.profile);
      console.log("Onboarding - current preferences:", userDoc.data()?.preferences);
      // Update existing document
      await userRef.update({
        profile,
        preferences,
        updatedAt: new Date(),
      });
    } else {
      console.log("Onboarding - user document doesn't exist, creating with profile and preferences");
      // Create new document with required fields
      await userRef.set({
        id: decoded.id,
        email: decoded.email,
        fullName: decoded.fullName,
        role: decoded.role || "USER",
        onboarded: false,
        profile,
        preferences,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Fetch updated user data
    const updatedUserDoc = await userRef.get();
    console.log("Onboarding - updated user data (onboarded should still be false):", updatedUserDoc.data());
    console.log("Onboarding - updated profile:", updatedUserDoc.data()?.profile);
    console.log("Onboarding - updated preferences:", updatedUserDoc.data()?.preferences);
    console.log("Onboarding - document ID:", updatedUserDoc.id);
    console.log("Onboarding - document exists:", updatedUserDoc.exists);
    
    if (!updatedUserDoc.exists) {
      return NextResponse.json({ error: "User not found after update" }, { status: 404 });
    }
    const updatedUser = updatedUserDoc.data()!;

    // Regenerate token with updated user data
    const newToken = await generateToken({
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      role: updatedUser.role,
      onboarded: updatedUser.onboarded,
    });

    const response = NextResponse.json({ success: true, userId: decoded.id });
    
    // Set new cookie with updated token
    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("Onboarding - setting new cookie with onboarded:", updatedUser.onboarded);
    console.log("Onboarding - response cookies:", response.cookies.getAll());

    return response;
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