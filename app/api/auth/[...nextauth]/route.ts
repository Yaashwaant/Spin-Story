import NextAuth from "next-auth";
import { FirestoreAdapter } from "@auth/firebase-adapter";
import GoogleProvider from "next-auth/providers/google";
import { adminDb } from "@/lib/firebase-admin";

const handler = NextAuth({
  adapter: FirestoreAdapter(adminDb),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role || "USER";
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = (token as any).role;
      return session;
    },
  },
  pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };