import { getJwtSecret } from '@/lib/jwt';
import { SignJWT } from 'jose';
import { adminDb } from '@/lib/firebase-admin';
import { sendPasswordResetEmail } from '@/lib/mail';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return Response.json({ error: 'Email required' }, { status: 400 });

  const snap = await adminDb.collection('users').where('email', '==', email).get();
  if (snap.empty) return Response.json({ error: 'User not found' }, { status: 404 });

  const uid = snap.docs[0].id;

  // secret is obtained **only here** and discarded afterwards
  const token = await new SignJWT({ uid, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getJwtSecret());          // ← call the getter

  await sendPasswordResetEmail(email, token);
  return Response.json({ success: true });
}