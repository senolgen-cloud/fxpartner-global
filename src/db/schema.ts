import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  country: text("country"),
  phone: text("phone"),
  preferredBroker: text("preferred_broker"),
  isVip: boolean("is_vip").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

export const comments = pgTable("comment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  brokerSlug: text("broker_slug").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cashbackAccountStatusValues = ["pending", "verified", "rejected"] as const;
export type CashbackAccountStatus = (typeof cashbackAccountStatusValues)[number];

export const cashbackAccounts = pgTable("cashback_account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  // Nullable: the per-broker setup form is public and doesn't require an
  // account. If the visitor happens to be signed in, we still link it.
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  brokerSlug: text("broker_slug").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  accountNumber: text("account_number").notNull(),
  // Separate from account processing — only true if the visitor explicitly
  // opted in to marketing/campaign emails, never assumed.
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
  status: text("status").$type<CashbackAccountStatus>().notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One entry per period (e.g. a calendar month) that the site owner enters
// manually after checking the real IB/partner dashboard for that account —
// there is no live broker API, so this is never auto-computed or guessed.
export const cashbackRecords = pgTable("cashback_record", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: text("account_id")
    .notNull()
    .references(() => cashbackAccounts.id, { onDelete: "cascade" }),
  period: text("period").notNull(), // e.g. "2026-07"
  amountUsd: text("amount_usd").notNull(), // stored as text to keep exact decimal input
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cashbackLeadStatusValues = ["new", "contacted", "converted"] as const;
export type CashbackLeadStatus = (typeof cashbackLeadStatusValues)[number];

// Top-of-funnel interest capture from the homepage hero form — just
// contact details, no broker/account number yet. Distinct from
// cashbackAccounts, which is filled in later via /cashback/[slug]/setup
// once the visitor has picked a broker and opened an account.
export const cashbackLeads = pgTable("cashback_lead", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  status: text("status").$type<CashbackLeadStatus>().notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Dedup log for department cron jobs that post to Telegram but don't
// need Upstash (no translation/news-feed involved) — e.g. announcing a
// new /piyasa-analizi post once. `key` is a namespaced string per job
// (e.g. "market-analysis:piyasa-ozeti-2026-07-24") so multiple crons
// can share this one table without colliding.
export const telegramPosts = pgTable("telegram_post", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  key: text("key").notNull().unique(),
  postedAt: timestamp("posted_at").notNull().defaultNow(),
});

export const partnerApplicationStatusValues = ["new", "contacted", "approved", "rejected"] as const;
export type PartnerApplicationStatus = (typeof partnerApplicationStatusValues)[number];

// Sub-IB partner applications: visitors who want to refer their own
// clients to a broker under FXPARTNER's master IB agreement, distinct
// from cashbackAccounts (which is for a trader linking their own
// account to get a rebate, not for building a referral business).
export const partnerApplications = pgTable("partner_application", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  // How they plan to bring clients — free-form-ish but constrained to a
  // fixed set of options in the form so replies stay easy to scan.
  audienceType: text("audience_type").notNull(),
  brokerSlug: text("broker_slug"),
  message: text("message").notNull(),
  status: text("status").$type<PartnerApplicationStatus>().notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const vipSubscriptionStatusValues = ["active", "past_due", "canceled", "incomplete"] as const;
export type VipSubscriptionStatus = (typeof vipSubscriptionStatusValues)[number];

// One row per user (Stripe itself is the history/audit trail, not this
// table) — the source of truth for paid VIP access. `users.isVip` is only
// a cached convenience flag derived from `status === "active"`; anything
// that gates paid functionality (discount eligibility, push targeting,
// /account/vip rendering) must query this table, never the cached flag.
export const vipSubscriptions = pgTable("vip_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: text("status").$type<VipSubscriptionStatus>().notNull().default("incomplete"),
  // The verified cashbackAccounts row that justified the 50% discount at
  // checkout time, if any — null for full-price subscribers. Kept even if
  // the linked account is later un-verified, as a record of what applied.
  discountAccountId: text("discount_account_id").references(() => cashbackAccounts.id, {
    onDelete: "set null",
  }),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// One row per browser/device push subscription. `endpoint` is the natural
// dedup key — the same browser re-subscribing (e.g. after clearing data)
// gets a new endpoint, an existing one is just refreshed in place.
// `userId` is nullable (like cashbackAccounts.userId) — notification opt-in
// is a public, anonymous-by-default prompt like FXStreet's, not gated
// behind an account; it's only linked when the visitor happens to be
// signed in.
export const pushSubscriptions = pgTable("push_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// One row per MT5 trade the EA reports via /api/trade-signal, keyed by the
// broker-assigned position ticket. Lets /api/trade-result look up the
// original Telegram/X post so the closing result can reply to (quote) it
// instead of appearing as an unrelated standalone card.
export const tradeSignals = pgTable("trade_signal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ticket: text("ticket").notNull().unique(),
  pair: text("pair").notNull(),
  direction: text("direction"),
  entry: text("entry").notNull(),
  telegramMessageId: text("telegram_message_id"),
  xTweetId: text("x_tweet_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const complaintStatusValues = ["new", "in_progress", "resolved", "closed"] as const;
export type ComplaintStatus = (typeof complaintStatusValues)[number];

export const complaints = pgTable("complaint", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  brokerSlug: text("broker_slug"),
  brokerName: text("broker_name").notNull(),
  description: text("description").notNull(),
  status: text("status").$type<ComplaintStatus>().notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
