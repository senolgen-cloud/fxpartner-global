import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { sendRegistrationNotification } from "@/lib/notify";
import { translateChrome } from "@/lib/chrome";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

// The sign-in link carries the page the reader started from, so the mail can
// answer in the language they were reading. Without this a Ukrainian visitor
// signs up on /ua and gets a Turkish email.
function localeFromCallbackUrl(url: string): Locale {
  try {
    const callback = new URL(url).searchParams.get("callbackUrl");
    const first = new URL(callback ?? url).pathname.split("/")[1];
    return isLocale(first) ? first : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // Sign in once per device, then stay signed in on it.
  //
  // The default was 30 days from issue, which logs out a member who has been
  // reading the board every week — the session ages even while it is in use.
  // updateAge makes the window roll: any visit more than a day after the last
  // refresh pushes the expiry back out to a full year. So a device that has
  // signed in once never meets the login page again, and a device that has
  // not is the only one asked for a magic link. Someone who stops visiting
  // still ages out.
  //
  // A year is defensible here because this panel holds no money: no
  // withdrawal, no stored card, no transfer. The riskiest action behind it is
  // starting a crypto checkout, which hands off to the payment provider's own
  // authenticated flow. Sign-out deletes the row immediately, on whichever
  // device it is pressed.
  session: {
    strategy: "database",
    maxAge: 365 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    // Only when it is actually configured. A Google button that opens an
    // OAuth error page is worse than no Google button, and this file is
    // imported by every request — it must not throw because an env var is
    // missing on a preview deployment.
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            // The adapter links this to an existing row when the address
            // matches, so signing in with Google after having used a magic
            // link lands in the same account rather than a second one.
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: "FXPARTNER <no-reply@fxpartner.global>",
      // Auth.js sends a plain unbranded default otherwise: one sentence and a
      // bare link. On a magic-link site that mail IS the front door, so it
      // gets the logo, an obvious button, and enough of what is behind the
      // door to be worth walking through.
      async sendVerificationRequest({ identifier, url, provider }) {
        const { welcomeEmailHtml, welcomeEmailText } = await import("@/lib/welcomeEmail");
        const locale = localeFromCallbackUrl(url);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: translateChrome(locale, "FXPARTNER — giriş bağlantınız"),
            html: welcomeEmailHtml(url, locale),
            text: welcomeEmailText(url, locale),
          }),
        });
        if (!res.ok) {
          // Throwing is what tells Auth.js to show the user an error instead
          // of a "check your inbox" page for a mail that never left.
          throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/account/login",
    verifyRequest: "/account/verify",
  },
  callbacks: {
    async session({ session, user }) {
      const u = user as typeof user & {
        country?: string | null;
        phone?: string | null;
        preferredBroker?: string | null;
        isVip?: boolean;
      };
      session.user.id = user.id;
      session.user.country = u.country ?? null;
      session.user.phone = u.phone ?? null;
      session.user.preferredBroker = u.preferredBroker ?? null;
      session.user.isVip = u.isVip ?? false;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      await sendRegistrationNotification(user);
    },
  },
});
