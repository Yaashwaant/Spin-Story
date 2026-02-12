import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
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

    const userRef = adminDb.collection("users").doc(decoded.id);

    console.log("Onboarding complete - setting onboarded: true for user:", decoded.id);
    
    await userRef.update({
      onboarded: true,
      updatedAt: new Date(),
    });

    // Fetch updated user data
    const updatedUserDoc = await userRef.get();
    console.log("Onboarding complete - updated user data:", updatedUserDoc.data());
    console.log("Onboarding complete - updated onboarded field:", updatedUserDoc.data()?.onboarded);
    
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

    const response = NextResponse.json({ 
      success: true, 
      userId: decoded.id,
      onboarded: updatedUser.onboarded 
    });
    
    // Set new cookie with updated token
    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("Onboarding complete - setting new cookie with onboarded:", updatedUser.onboarded);

    return response;
  } catch (error) {
    console.error("Onboarding complete error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}