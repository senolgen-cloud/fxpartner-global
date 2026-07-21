import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      country?: string | null;
      phone?: string | null;
      preferredBroker?: string | null;
      isVip?: boolean;
    } & DefaultSession["user"];
  }
}
