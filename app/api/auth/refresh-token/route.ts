import { NextRequest, NextResponse } from "next/server";
import { getUserById, generateToken, verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    console.log("Refresh-token - endpoint called");
    const token = req.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    console.log("Refresh-token - decoded token:", decoded);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Fetch fresh user data from DB
    const user = await getUserById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate new token with fresh data
    const newToken = await generateToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      onboarded: user.onboarded,
    });

    const resp = NextResponse.json({ success: true });
    resp.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("Refresh-token - new cookie set with onboarded:", user.onboarded);
    return resp;
  } catch (error) {
    console.error("Refresh-token error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}