import { NextRequest, NextResponse } from "next/server";
import { mockUserStore } from "@/lib/mock-users";

export async function GET(req: NextRequest) {
  try {
    const users = await mockUserStore.getAllUsers();
    
    // Remove passwords for security
    const safeUsers = users.map(user => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      onboarded: user.onboarded,
      createdAt: user.createdAt,
    }));
    
    return NextResponse.json({ users: safeUsers });
  } catch (error) {
    console.error("Debug users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await mockUserStore.clearUsers();
    return NextResponse.json({ message: "All users cleared" });
  } catch (error) {
    console.error("Clear users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}