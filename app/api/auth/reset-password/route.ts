import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/models/auth";
import { adminDb } from "@/lib/firebase-admin";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    
    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    const validatedData = resetPasswordSchema.parse(body);
    
    const userSnapshot = await adminDb
      .collection("users")
      .where("resetToken", "==", token)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    if (!userData.resetTokenExpiry || new Date() > userData.resetTokenExpiry.toDate()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(validatedData.password);

    await userDoc.ref.update({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}