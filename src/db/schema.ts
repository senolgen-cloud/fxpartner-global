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
