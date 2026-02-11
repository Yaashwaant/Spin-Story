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

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
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

// Server-side only functions - these should only be used in API routes
let adminDb: any = null;

// Lazy load Firebase Admin to prevent browser bundling issues
async function getAdminDb() {
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin can only be used server-side');
  }
  
  if (!adminDb) {
    try {
      // Import the firebase-admin module
      const adminModule = await import("@/lib/firebase-admin");
      if (adminModule && adminModule.adminDb) {
        adminDb = adminModule.adminDb;
        console.log('✅ Firebase Admin loaded successfully');
      } else {
        throw new Error('Firebase Admin module not found or invalid');
      }
    } catch (error) {
      console.error('Failed to load Firebase Admin:', error);
      throw new Error(`Firebase Admin not available: ${error.message}`);
    }
  }
  
  return adminDb;
}

export async function createUser(data: any): Promise<User> {
  const db = await getAdminDb();
  const hashedPassword = await hashPassword(data.password);
  
  const userRef = db.collection("users").doc();
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
  
  return userSchema.parse(userData);
}

export async function authenticateUser(emailOrPhone: string, password: string): Promise<User | null> {
  const db = await getAdminDb();
  
  const isEmail = emailOrPhone.includes("@");
  const field = isEmail ? "email" : "phoneNumber";
  const value = isEmail ? emailOrPhone.toLowerCase() : emailOrPhone;
  
  const userSnapshot = await db
    .collection("users")
    .where(field, "==", value)
    .limit(1)
    .get();
  
  if (userSnapshot.empty) {
    return null;
  }
  
  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();
  
  const isPasswordValid = await verifyPassword(password, userData.password);
  if (!isPasswordValid) {
    return null;
  }
  
  return userSchema.parse(userData);
}

export async function getUserById(userId: string): Promise<User | null> {
  const db = await getAdminDb();
  
  const userDoc = await db.collection("users").doc(userId).get();
  
  if (!userDoc.exists) {
    return null;
  }
  
  return userSchema.parse(userDoc.data());
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  const db = await getAdminDb();
  
  const userRef = db.collection("users").doc(userId);
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };
  
  await userRef.update(updateData);
  
  const updatedDoc = await userRef.get();
  return userSchema.parse(updatedDoc.data());
}