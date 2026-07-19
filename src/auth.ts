import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { sendRegistrationNotification } from "@/lib/notify";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "FXPARTNER <no-reply@fxpartner.global>",
    }),
  ],
  pages: {
    signIn: "/account/login",
    verifyRequest: "/account/verify",
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.country = (user as typeof user & { country?: string | null }).country ?? null;
      session.user.isVip = (user as typeof user & { isVip?: boolean }).isVip ?? false;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await sendRegistrationNotification(user);
    },
  },
});
