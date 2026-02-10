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