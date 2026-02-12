import { NextRequest, NextResponse } from "next/server";
import { getUserById, updateUser, verifyToken, isTokenComplete, generateToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    
    console.log("Auth me - cookies:", req.cookies.getAll());
    console.log("Auth me - token:", token);
    
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    console.log("Auth me - decoded token:", decoded);
    
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Check if token has complete structure - if not, refresh it
    if (!isTokenComplete(token)) {
      console.log("Auth me - token incomplete, refreshing...");
      const user = await getUserById(decoded.id);
      if (user) {
        const newToken = await generateToken({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          onboarded: user.onboarded,
        });
        
        // Create response with new token
        const response = NextResponse.json({
          success: true,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            onboarded: user.onboarded,
          },
        });
        
        response.cookies.set("auth-token", newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
        });
        
        console.log("Auth me - token refreshed with onboarded:", user.onboarded);
        return response;
      }
    }

    const user = await getUserById(decoded.id);
    
    console.log("Auth me - user from DB:", user);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        onboarded: user.onboarded,
        profile: user.profile,
        preferences: user.preferences,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { fullName, email, phoneNumber, profile } = body;

    // Validate input
    if (fullName && !email) {
      return NextResponse.json(
        { error: "Email is required when updating name" },
        { status: 400 }
      );
    }

    if (email && !fullName) {
      return NextResponse.json(
        { error: "Full name is required when updating email" },
        { status: 400 }
      );
    }

    // Update user data
    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (profile) updateData.profile = profile;

    const updatedUser = await updateUser(decoded.id, updateData);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        onboarded: updatedUser.onboarded,
        profile: updatedUser.profile,
        preferences: updatedUser.preferences,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}