
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const hasServiceAccountEnv =
  !!process.env.FIREBASE_PROJECT_ID &&
  !!process.env.FIREBASE_CLIENT_EMAIL &&
  !!process.env.FIREBASE_PRIVATE_KEY

if (!admin.apps.length) {
  if (hasServiceAccountEnv) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || ""
    privateKey = privateKey.replace(/\\n/g, "\n")
    privateKey = privateKey.replace(/^"|"$/g, "")
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      })
    });
  } else {
    console.error("Missing environment variables");
    process.exit(1);
  }
}

const db = admin.firestore();

async function createBDRUser() {
  const email = "bdr@stylize.ai";
  const password = "bdrpassword123";
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Check if user already exists
  const snapshot = await db.collection("users").where("email", "==", email).get();
  
  let userRef;
  if (!snapshot.empty) {
    console.log("User already exists, updating...");
    userRef = snapshot.docs[0].ref;
  } else {
    console.log("Creating new user...");
    userRef = db.collection("users").doc();
  }
  
  const now = new Date();
  
  const userData = {
    id: userRef.id,
    fullName: "BDR User",
    email: email,
    phoneNumber: "+15555555555",
    password: hashedPassword,
    role: "BDR",
    onboarded: true,
    emailVerified: true,
    phoneVerified: true,
    isActive: true,
    updatedAt: now,
  };

  if (snapshot.empty) {
    userData.createdAt = now;
  }

  await userRef.set(userData, { merge: true });
  console.log(`BDR user set up: ${email} / ${password}`);
  console.log(`User ID: ${userRef.id}`);
}

createBDRUser().catch(console.error);
