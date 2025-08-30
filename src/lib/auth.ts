import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

function hasStringId(u: unknown): u is { id: string } {
  return typeof u === "object" && u !== null && "id" in u && typeof (u as { id?: unknown }).id === "string";
}

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
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
        return { id: user.id, name: user.name ?? null, email: user.email ?? null, image: user.image ?? null };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (hasStringId(user)) token.sub = user.id;
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
