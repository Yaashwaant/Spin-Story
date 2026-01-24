import { getJwtSecret } from '@/lib/jwt';
import { jwtVerify } from 'jose';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();
  if (!token || !newPassword)
    return Response.json({ error: 'Missing fields' }, { status: 400 });

  try {
    // secret is obtained **only here** and discarded afterwards
    const { payload } = await jwtVerify(token, getJwtSecret()); // ← call the getter
    const uid = payload.uid as string;

    await adminAuth.updateUser(uid, { password: newPassword });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
}