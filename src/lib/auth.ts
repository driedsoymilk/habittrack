import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  session: { strategy: "database" },
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
    async session({ session, user, token }) {
      const id = user?.id ?? (typeof token.sub === "string" ? token.sub : undefined);
      if (session.user && id) (session.user as { id?: string }).id = id;
      return session;
    }
  }
};
