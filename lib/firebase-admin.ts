import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getStorage } from "firebase-admin/storage"
import { getAuth } from "firebase-admin/auth"

const hasServiceAccountEnv =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY

if (!getApps().length) {
  console.log('🔥 Initializing Firebase Admin SDK...')
  console.log('Has service account env:', hasServiceAccountEnv)
  
  if (hasServiceAccountEnv) {
    console.log('✅ Using service account credentials')
    console.log('📋 Project ID:', process.env.FIREBASE_PROJECT_ID)
    console.log('📧 Client Email:', process.env.FIREBASE_CLIENT_EMAIL)
    
    try {
      // Fix private key formatting - remove quotes and replace \n with actual newlines
      let privateKey = process.env.FIREBASE_PRIVATE_KEY || ""
      privateKey = privateKey.replace(/\\n/g, "\n") // Replace escaped newlines
      privateKey = privateKey.replace(/^"|"$/g, "") // Remove surrounding quotes
      
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
      console.log('✅ Firebase Admin SDK initialized successfully with service account')
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin with service account:', error)
      console.log('🔄 Falling back to default credentials')
      initializeApp()
      console.log('✅ Firebase Admin SDK initialized with default credentials')
    }
  } else {
    console.log('⚠️  No service account credentials found, using default credentials')
    initializeApp()
    console.log('✅ Firebase Admin SDK initialized with default credentials')
  }
} else {
  console.log('✅ Firebase Admin SDK already initialized')
}

export const adminDb = getFirestore()
export const adminStorage = getStorage()
export const adminAuth = getAuth()

// Test the connection
adminDb.collection('test').doc('connection').get().then(() => {
  console.log('✅ Firebase Firestore connection successful')
}).catch((error) => {
  console.error('❌ Firebase Firestore connection failed:', error)
})