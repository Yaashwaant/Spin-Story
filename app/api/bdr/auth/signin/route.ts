import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAndGenerateToken } from "@/lib/auth-edge";
import { cookies } from "next/headers";

const signInSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInInput = z.infer<typeof signInSchema>;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = signInSchema.parse(body);
    
    // Authenticate user and generate token
    const authResult = await authenticateAndGenerateToken(validatedData.emailOrPhone, validatedData.password);
    
    if (!authResult) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Check if user is a BDR or ADMIN (BDR-only authentication)
    if (authResult.user.role !== "BDR" && authResult.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. BDR or ADMIN role required." },
        { status: 403 }
      );
    }
    
    // Use the token from the authentication result
    const token = authResult.token;
    
    // Set HTTP-only cookie
    (await cookies()).set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    
    // Return user data (excluding sensitive information)
    return NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        fullName: authResult.user.fullName,
        email: authResult.user.email,
        phoneNumber: authResult.user.phoneNumber,
        role: authResult.user.role,
        onboarded: authResult.user.onboarded,
      },
    });
    
  } catch (error) {
    console.error("BDR Sign-in error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}