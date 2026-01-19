import { z } from "zod";

export const profileSchema = z.object({
  height: z.enum(["short", "average", "tall"]).optional(),
  physique: z.enum(["slim", "average", "athletic", "broad", "heavy"]).optional(),
  skinTone: z.enum(["fair", "medium", "wheatish", "dark"]).optional(),
  hairColor: z.string().min(1).optional(),
  fullBodyPhotoUrl: z.string().url().optional(),
  facePhotoUrl: z.string().url().optional(),
  wearsMost: z.array(z.string()).min(1).optional(),
  fitPreference: z.enum(["slim", "regular", "loose"]).optional(),
  colorComfort: z.enum(["neutral", "pastel", "bold"]).optional(),
  dressingPurpose: z.enum(["work", "casual", "party", "travel", "wedding"]).optional(),
  avoids: z.array(z.string()).optional(),
});

export const preferencesSchema = z.object({
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().max(100000).optional(),
  currency: z.enum(["INR", "USD"]).default("INR").optional(),
});

// Firebase timestamp transformer and converter
export function convertFirebaseTimestampToDate(timestamp: any): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  if (timestamp && typeof timestamp === 'object') {
    // Firestore Timestamp object
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Firestore Timestamp with _seconds and _nanoseconds
    if (timestamp._seconds !== undefined) {
      return new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
    }
  }
  
  return new Date();
}

const firebaseTimestampSchema = z.union([
  z.date(),
  z.object({
    _seconds: z.number(),
    _nanoseconds: z.number(),
  }),
  z.custom((val) => {
    // Check if it's a Firestore Timestamp object
    return val && typeof val === 'object' && val.toDate && typeof val.toDate === 'function';
  }, "Must be a Firestore Timestamp"),
]);

export const userSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  profile: profileSchema.optional(),
  preferences: preferencesSchema.optional(),
  onboarded: z.boolean().default(false),
  role: z.enum(["USER", "ADMIN", "BDR"]).default("USER"),
  createdAt: firebaseTimestampSchema,
  updatedAt: firebaseTimestampSchema,
  lastLoginAt: firebaseTimestampSchema.optional(),
  emailVerified: z.boolean().default(false),
  phoneVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type Profile = z.infer<typeof profileSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type User = z.infer<typeof userSchema>;