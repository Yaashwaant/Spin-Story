import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { signInSchema, signUpSchema } from "@/models/auth";
import { authenticateUser, hashPassword } from "@/lib/auth";
import { userSchema, type User } from "@/models/user";
import { z } from "zod";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// Generate token using jose (Edge Runtime compatible)
export async function generateToken(user: AuthUser): Promise<string> {
  return await new SignJWT({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

// Verify token using jose (Edge Runtime compatible)
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: payload.role as string
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Get token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

// Create new user (Edge Runtime compatible)
export async function createUser(data: any): Promise<{ user: User; token: string }> {
  // Import Firebase Admin dynamically to avoid Edge Runtime issues
  const { adminDb } = await import("@/lib/firebase-admin");
  
  const hashedPassword = await hashPassword(data.password);
  
  const userRef = adminDb.collection("users").doc();
  const now = new Date();
  
  const userData = {
    id: userRef.id,
    email: data.email.toLowerCase(),
    fullName: data.fullName,
    phoneNumber: data.phoneNumber || "",
    password: hashedPassword,
    role: "USER",
    onboarded: false,
    createdAt: now,
    updatedAt: now,
    profile: data.profile || {},
    preferences: data.preferences || {},
  };

  await userRef.set(userData);
  
  const user = userSchema.parse(userData);
  const token = await generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return { user, token };
}

// Authenticate user and generate token
export async function authenticateAndGenerateToken(emailOrPhone: string, password: string) {
  const user = await authenticateUser(emailOrPhone, password);
  
  if (!user) {
    return null;
  }

  const token = await generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return { user, token };
}