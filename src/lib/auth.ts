import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  // Credentials requires JWT sessions
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Demo",
      credentials: {},
      async authorize() {
        const user = await prisma.user.upsert({
          where: { email: "demo@habit.local" },
          update: {},
          create: { email: "demo@habit.local", name: "Demo User" }
        });
        // Must return an object with an id so token.sub is set
        return { id: user.id, name: user.name ?? null, email: user.email ?? null, image: user.image ?? null };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof (user as any).id === "string") token.sub = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.sub === "string") {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    }
  }
};
