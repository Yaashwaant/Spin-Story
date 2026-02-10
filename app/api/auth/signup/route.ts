import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { signUpSchema } from "@/models/auth";
import { createUser } from "@/lib/auth-edge";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const validatedData = signUpSchema.parse(body);
    
    // Check if user already exists using Firebase
    const existingUser = await adminDb
      .collection("users")
      .where("email", "==", validatedData.email.toLowerCase())
      .limit(1)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    const existingPhone = await adminDb
      .collection("users")
      .where("phoneNumber", "==", validatedData.phoneNumber)
      .limit(1)
      .get();

    if (!existingPhone.empty) {
      return NextResponse.json(
        { error: "User with this phone number already exists" },
        { status: 409 }
      );
    }

    const { user, token } = await createUser({
      fullName: validatedData.fullName,
      email: validatedData.email,
      phoneNumber: validatedData.phoneNumber,
      password: validatedData.password,
    });

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
      token,
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    // Handle specific Firebase errors
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      
      // Return the actual error message for better debugging
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}