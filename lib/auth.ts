import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { adminDb } from "./firebase-admin";
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
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function createUser(data: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const hashedPassword = await hashPassword(data.password);
  
  const userRef = adminDb.collection("users").doc();
  const now = new Date();
  
  const userData = {
    id: userRef.id,
    fullName: data.fullName,
    email: data.email.toLowerCase(),
    phoneNumber: data.phoneNumber,
    password: hashedPassword,
    role: "USER",
    onboarded: false,
    emailVerified: false,
    phoneVerified: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  await userRef.set(userData);
  
  const user = userSchema.parse(userData);
  const token = generateToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    onboarded: user.onboarded,
  });

  return { user, token };
}

export async function authenticateUser(emailOrPhone: string, password: string): Promise<{ user: User; token: string } | null> {
  const isEmail = emailOrPhone.includes("@");
  const field = isEmail ? "email" : "phoneNumber";
  const value = isEmail ? emailOrPhone.toLowerCase() : emailOrPhone;
  
  const userSnapshot = await adminDb
    .collection("users")
    .where(field, "==", value)
    .limit(1)
    .get();

  if (userSnapshot.empty) {
    return null;
  }

  const userDoc = userSnapshot.docs[0];
  const userData = userDoc.data();
  
  if (!userData.password) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, userData.password);
  if (!isValidPassword) {
    return null;
  }

  const user = userSchema.parse({
    ...userData,
    id: userDoc.id,
  });

  await userDoc.ref.update({ lastLoginAt: new Date() });

  const token = generateToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    onboarded: user.onboarded,
  });

  return { user, token };
}

export async function getUserById(userId: string): Promise<User | null> {
  const userDoc = await adminDb.collection("users").doc(userId).get();
  
  if (!userDoc.exists) {
    return null;
  }

  const userData = userDoc.data();
  
  // Convert Firebase timestamps to proper format
  const processedData = {
    ...userData,
    id: userDoc.id,
    createdAt: convertFirebaseTimestampToDate(userData?.createdAt),
    updatedAt: convertFirebaseTimestampToDate(userData?.updatedAt),
    lastLoginAt: userData?.lastLoginAt ? convertFirebaseTimestampToDate(userData.lastLoginAt) : undefined,
  };

  return userSchema.parse(processedData);
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  const userRef = adminDb.collection("users").doc(userId);
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  await userRef.update(updateData);
  
  const userDoc = await userRef.get();
  const userData = userDoc.data();
  
  // Convert Firebase timestamps to proper format
  const processedData = {
    ...userData,
    id: userDoc.id,
    createdAt: convertFirebaseTimestampToDate(userData?.createdAt),
    updatedAt: convertFirebaseTimestampToDate(userData?.updatedAt),
    lastLoginAt: userData?.lastLoginAt ? convertFirebaseTimestampToDate(userData.lastLoginAt) : undefined,
  };

  return userSchema.parse(processedData);
}