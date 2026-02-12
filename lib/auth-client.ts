import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userSchema, type User, convertFirebaseTimestampToDate } from "@/models/user";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  onboarded: boolean;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Check if token has complete structure (client-side)
export function isTokenComplete(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return !!(payload.id && payload.email && payload.fullName && payload.role && payload.onboarded !== undefined);
  } catch (error) {
    return false;
  }
}

// Manually refresh token if needed
export async function refreshTokenIfNeeded(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });
    
    if (response.ok) {
      console.log("Token refreshed successfully");
      return true;
    } else {
      console.error("Token refresh failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
}