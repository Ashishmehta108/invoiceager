import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  type DefaultSession,
  type NextAuthConfig,
  type Session,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  }

  interface User {
    id: string;
  }
}

/**
 * ✅ Ensures no undefined values
 */
function sanitizeUser(user: {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: string | null;
}) {
  return {
    id: user.id ?? "",
    name: user.name ?? "",
    email: user.email ?? "",
    emailVerified: user.emailVerified ?? "",
    image: user.image ?? null, // null allowed
  };
}

export const authConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.query.users.findFirst({
          where: (tbl, { eq }) => eq(tbl.email, credentials.email as string),
        });

        if (!user?.passwordHash) return null;

        const bcrypt = await import("bcryptjs");
        const ok = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );
        if (!ok) return null;

        return sanitizeUser({
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          image: null,
        });
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      //@ts-ignore
      session.user = sanitizeUser({
        id: token.id as string,
        name: session.user?.name,
        email: session.user?.email,
        image: session.user?.image,
        emailVerified: session.user?.emailVerified
          ? typeof session.user.emailVerified === "string"
            ? session.user.emailVerified
            : session.user.emailVerified.toISOString()
          : null,
      });
      return session;
    },
  },
} satisfies NextAuthConfig;
