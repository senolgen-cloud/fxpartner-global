import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// First-touch attribution, shared by every table that records someone
// entering the funnel. Written once at insert time from the fxp_attr
// cookie (set in src/proxy.ts) and never updated afterwards — a later
// visit through a different channel must not rewrite where a person
// originally came from. All three are nullable on purpose: every row
// created before this existed, and every visitor who arrives with no
// UTM and no referrer, legitimately has no source.
const attribution = {
  source: text("source"),
  campaign: text("campaign"),
  landingPath: text("landing_path"),
};

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
  // The accent behind the member monogram. A name and a colour is the whole
  // of personalisation here, deliberately: an avatar upload needs storage,
  // moderation and a broken-image state, and none of that buys more than a
  // member seeing their own initial in a colour they picked. Null means the
  // signal default.
  accentColor: text("accent_color"),
  // How far the member has read their notifications. One watermark rather
  // than a row per notification per member: the events themselves already
  // live in trade_signal and cashback_record with their own timestamps, so
  // a notifications table would be a second copy of data we already have,
  // kept in sync by hand. Null means the bell has never been opened.
  notificationsSeenAt: timestamp("notifications_seen_at"),
  // When the member finished or skipped the panel tour. Kept here rather
  // than in localStorage so it follows them to their next device instead of
  // greeting them a second time on the phone they signed in on later.
  tourSeenAt: timestamp("tour_seen_at"),
  ...attribution,
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
  // Nullable as of 2026-08-09: commenting no longer requires an account
  // (WordPress-style guest comments), so a comment either has a userId
  // (signed-in) or a guestName (anonymous) — never neither, enforced in
  // the submitComment action, not at the DB level.
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  guestName: text("guest_name"),
  rating: integer("rating"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),

  // Structured review fields, added 2026-08-27. EVERY ONE IS NULLABLE and
  // must stay that way: the twenty reviews collected before this date have
  // a rating and a body and nothing else, and they are real reviews that
  // must keep rendering rather than being back-filled with invented detail.
  // The display degrades to the old shape whenever these are absent.
  //
  // `body` keeps its meaning as the overall verdict, so a legacy review is
  // simply one where only the overall was ever asked for.
  title: text("title"),
  // How long they have used this broker: "<1", "1-3", "3-5", "5+" (years).
  // Free text rather than an enum so a value the form stops offering does
  // not break rows already carrying it.
  experience: text("experience"),
  liked: text("liked"),
  improved: text("improved"),
  // Per-axis scores, 1-5. Deliberately the same four axes the FXPARTNER
  // Index scores editorially — regulation is not among them because a
  // trader cannot observe it, and asking them to rate it would produce a
  // number that reads as evidence and is not.
  ratingPlatform: integer("rating_platform"),
  ratingPricing: integer("rating_pricing"),
  ratingService: integer("rating_service"),
  ratingWithdrawal: integer("rating_withdrawal"),
  // The broker's own answer, entered by an admin. Nothing here is written
  // by the broker directly.
  brokerReply: text("broker_reply"),
  brokerReplyAt: timestamp("broker_reply_at"),
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
  // When the status last moved. Without it a verification is invisible to
  // the member's notifications: created_at is when they applied, which is
  // not when we answered.
  statusChangedAt: timestamp("status_changed_at"),
  ...attribution,
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
  ...attribution,
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

// "manual" is for comp/test access granted directly by an admin (no real
// payment) — kept honest in the record rather than misattributed to
// whichever paid provider happened to be closest.
export const vipProviderValues = ["nowpayments", "manual"] as const;
export type VipProvider = (typeof vipProviderValues)[number];

// One row per user (NOWPayments itself is the history/audit trail, not this
// table) — the source of truth for paid VIP access. `users.isVip` is only a
// cached convenience flag derived from `status === "active"`; anything that
// gates paid functionality (discount eligibility, push targeting) must query
// this table, never the cached flag.
//
// NOWPayments is the only paid rail — Stripe doesn't support Turkey, so the
// card path was removed entirely. It has no auto-renewal: each period is its
// own crypto payment, so currentPeriodEnd here is simply "access granted
// through this date" and a cron (once built) will need to prompt for renewal
// before it lapses. `tier` is therefore the only place a subscriber's
// package is recorded — there is no price-ID indirection to fall back on.
export const vipSubscriptions = pgTable("vip_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").$type<VipProvider>().notNull().default("nowpayments"),
  tier: text("tier"),
  // NOWPayments' own payment id for the most recent successful payment —
  // the natural idempotency key for the IPN webhook (a resent callback for
  // the same payment_id should not re-extend the period).
  nowpaymentsPaymentId: text("nowpayments_payment_id"),
  status: text("status").$type<VipSubscriptionStatus>().notNull().default("incomplete"),
  // The verified cashbackAccounts row that justified the 50% discount at
  // checkout time, if any — null for full-price subscribers. Kept even if
  // the linked account is later un-verified, as a record of what applied.
  discountAccountId: text("discount_account_id").references(() => cashbackAccounts.id, {
    onDelete: "set null",
  }),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  ...attribution,
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Duplicated from src/lib/vip.ts's PackageTier rather than imported, to
// avoid a circular import (vip.ts already imports from this file). Only the
// purchasable tiers appear here — "free" is granted by having an account and
// never goes through checkout, so it can never be an order's tier.
type NowPaymentsTier = "pro" | "vip";

// One row per NOWPayments checkout attempt, created right before redirecting
// to the invoice page — the IPN webhook has no other way to know which user/
// tier a payment_id belongs to, since that context never round-trips through
// NOWPayments itself. `id` is what we hand to NOWPayments as `order_id`.
export const nowpaymentsOrders = pgTable("nowpayments_order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tier: text("tier").$type<NowPaymentsTier>().notNull(),
  discountAccountId: text("discount_account_id").references(() => cashbackAccounts.id, {
    onDelete: "set null",
  }),
  // Set once the IPN webhook processes a "finished"/"confirmed" payment for
  // this order — guards against a resent IPN callback re-extending the
  // period twice for the same order.
  fulfilledAt: timestamp("fulfilled_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  // Which language tree the reader was on when they allowed notifications.
  // Without it every push went out in Turkish to everyone, including the
  // /en, /ua and /ar readers — the Telegram side of the same routes was
  // already localised, push was simply never wired to a locale.
  //
  // Null on every row written before this existed, and read as Turkish,
  // which is what those readers have been getting all along.
  locale: text("locale"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tradeSignalStatusValues = ["active", "closed"] as const;
export type TradeSignalStatus = (typeof tradeSignalStatusValues)[number];

export const tradeSignalOutcomeValues = ["WIN", "LOSS", "BE"] as const;
export type TradeSignalOutcome = (typeof tradeSignalOutcomeValues)[number];

// One row per MT5 trade the EA reports via /api/trade-signal, keyed by the
// broker-assigned position ticket. Lets /api/trade-result look up the
// original Telegram/X post so the closing result can reply to (quote) it
// instead of appearing as an unrelated standalone card. Also the backing
// data for the public /signals page — status/outcome/close fields are only
// ever filled in from real EA-reported close data, never estimated.
export const tradeSignals = pgTable("trade_signal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ticket: text("ticket").notNull().unique(),
  pair: text("pair").notNull(),
  direction: text("direction"),
  entry: text("entry").notNull(),
  target1: text("target1"),
  target2: text("target2"),
  stop: text("stop"),
  volume: text("volume"),
  status: text("status").$type<TradeSignalStatus>().notNull().default("active"),
  outcome: text("outcome").$type<TradeSignalOutcome>(),
  closePrice: text("close_price"),
  pips: text("pips"),
  profit: text("profit"),
  telegramMessageId: text("telegram_message_id"),
  xTweetId: text("x_tweet_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

// Dedup store for /api/cron/economic-calendar-alert — id is a stable hash
// of (title, country, date) from the calendar feed, so a released event
// only ever triggers one push even across multiple cron runs.
export const economicCalendarAlerts = pgTable("economic_calendar_alert", {
  id: text("id").primaryKey(),
  notifiedAt: timestamp("notified_at").notNull().defaultNow(),
});

// Single-row shared cache of the raw ForexFactory feed response — the
// free feed rate-limits hard, so every caller (page loads, /api polling,
// the cron) shares this instead of each hitting the feed independently.
// See src/lib/economicCalendar.ts.
export const economicCalendarCache = pgTable("economic_calendar_cache", {
  id: text("id").primaryKey(),
  payload: text("payload").notNull(),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
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

// One row per /api/ai-assistant call — the visitor's latest message and
// Gemini's reply, for the /admin/ai-sorulari log. Not a full transcript
// (the client resends prior turns each request, so logging every request
// would duplicate earlier turns); just the new question/answer pair.
export const aiAssistantLogs = pgTable("ai_assistant_log", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  question: text("question").notNull(),
  reply: text("reply").notNull(),
  // Null on every row written while the assistant was Pro-only, and on any
  // answer given to someone without an account. Counted per day to enforce a
  // free member's allowance — see AI_FREE_DAILY_LIMIT.
  userId: text("user_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sentimentVoteValues = ["bullish", "bearish"] as const;
export type SentimentVote = (typeof sentimentVoteValues)[number];

// One real vote per (pair, visitor) — keyed by the anonymous fxp_vid
// cookie (src/lib/visitor.ts) so a visitor can change their vote but not
// stuff the poll. Aggregated live on /topluluk; starts at 0/0, never
// seeded with fake numbers.
export const sentimentVotes = pgTable(
  "sentiment_vote",
  {
    pair: text("pair").notNull(),
    visitorId: text("visitor_id").notNull(),
    vote: text("vote").$type<SentimentVote>().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.pair, table.visitorId] })]
);

// An owned distribution channel independent of Telegram (which the site
// has zero control over if the account/channel is ever suspended). Kept
// intentionally simple for now: single-opt-in email capture only, no
// double opt-in flow or bulk-send integration yet — that's a follow-up
// once there's an actual list worth mailing.
export const newsletterSubscribers = pgTable("newsletter_subscriber", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  // Where on the site the signup happened (e.g. "footer", "signals-page"),
  // so we can tell which placements actually convert.
  source: text("source"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Published on /haber-bulteni/[slug] first, then announced to Telegram
// linking back to that page — replaces the old news-update behavior of
// linking straight to each external publisher's own article. The `body`
// is an LLM-synthesized rewrite grounded ONLY in the fetched title/
// description of each source item (see lib/bulletin.ts) — never new
// facts/numbers/predictions the sources didn't already state — and
// `sources` credits every publisher actually used, satisfying attribution
// without reproducing/linking to their copyrighted text directly.
export const newsBulletins = pgTable("news_bulletin", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  sources: text("sources").notNull(), // JSON-encoded string[] of publisher names
  // JSON-encoded { <locale>: { title, excerpt, body } }, written by the
  // news-update cron at publish time — see src/lib/translateContent.ts.
  // Null on every row written before translation existed, and on any row
  // whose translation failed; both fall back to the Turkish above.
  translations: text("translations"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

// Live bid/ask pushed by the MT5 EA, one row per instrument, overwritten in
// place — this is a "what is the price right now" cache, not a price series.
//
// The EA is the source on purpose. The free APIs behind src/lib/rates.ts give
// a real spot price for gold and BTC but only the ECB's once-a-day reference
// fix for FX, and a day-old number printed next to a live signal's stop-loss
// is worse than no number at all. The EA is already attached to the account
// these signals come from, so its quote is the same feed that produced the
// entry — the two can never disagree.
//
// `symbol` is whatever the EA calls the instrument in its report (GOLD,
// GBPUSD, US100CASH), identical to trade_signal.pair, so matching a quote to
// a signal is string equality and the site needs no symbol map of its own.
//
// Prices are text for the same reason trade_signal's are: the EA formats to
// the instrument's own digit count, and a float round-trip would quietly turn
// 1.16677 into 1.1667700000000001.
export const liveQuotes = pgTable("live_quote", {
  symbol: text("symbol").primaryKey(),
  bid: text("bid").notNull(),
  ask: text("ask").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pendingOrderStateValues = ["waiting", "filled", "cancelled"] as const;
export type PendingOrderState = (typeof pendingOrderStateValues)[number];

// Pending orders the EA has placed but the market has not reached yet.
//
// Deliberately its own table rather than a third status on trade_signal. A
// pending order is not a trade: it has no entry fill, no outcome, and it must
// never reach getRecentSignalStats or the active board. Sixteen files read
// trade_signal.status; adding "pending" there would have made every one of
// them a place where an unfilled order could quietly join the published win
// rate. Here it cannot, because nothing that counts trades looks in this
// table at all.
//
// `state` closes the loop the announcement opens. Telling the channel about
// an order and never saying it was cancelled leaves a signal standing that
// never happened — on a page whose whole claim is that no result is quietly
// removed, that is the one failure mode worth building around.
export const pendingOrders = pgTable("pending_order", {
  ticket: text("ticket").primaryKey(),
  pair: text("pair").notNull(),
  // BUY_LIMIT, SELL_LIMIT, BUY_STOP, SELL_STOP, …
  orderType: text("order_type").notNull(),
  direction: text("direction"),
  price: text("price").notNull(),
  stop: text("stop"),
  target1: text("target1"),
  volume: text("volume"),
  state: text("state").$type<PendingOrderState>().notNull().default("waiting"),
  telegramMessageId: text("telegram_message_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Education posts, generated on a schedule and stored here rather than in
// src/data/blog.ts.
//
// That file is 285 KB for 28 hand-written posts — roughly 10 KB each. At four
// posts a day it would pass a megabyte within a month and fifteen within a
// year, in a single TypeScript module that a dozen pages import. Editorial
// posts someone actually wrote belong in source, where they can be reviewed
// in a diff; generated ones belong in a table, the same way news_bulletin
// already works.
//
// `topic` is the curated subject the post was written from, and it is unique:
// the generator draws from a fixed list in src/lib/educationTopics.ts and
// never revisits one. Unbounded generation drifts and repeats itself, and
// nothing looks worse on a site selling judgement than the same article
// twice under two titles.
//
// `translations` holds { <locale>: { title, excerpt, body } }, written at
// publish time by the same helper the news bulletins use. Null when
// translation failed, which falls back to Turkish rather than shipping half
// a post.
export const educationPosts = pgTable("education_post", {
  // Which lesson of FXPARTNER Akademi this is. Stored rather than derived
  // from the topic list index, so reordering or retiring a subject never
  // renumbers a lesson somebody has already been linked to.
  lessonNo: integer("lesson_no"),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  topic: text("topic").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  translations: text("translations"),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

// Proof that a reader was asked and what they answered.
//
// The cookie in their browser records the decision so the middleware can
// honour it; this table records that the decision happened, which is what
// an authority asks for and what a cookie alone can never show — a cookie
// is written by us and can be edited by anyone.
//
// `id` is generated per answer and stored in the fxp_consent cookie
// alongside the decision, so a specific browser's answer can be traced
// back to its row. It is deliberately NOT fxp_vid: that is one of the very
// cookies being consented to, and identifying the consent by it would mean
// tracking someone in order to record that they refused tracking. A
// consent-record id is itself strictly necessary, so it needs no consent.
//
// Nothing here identifies a person. No IP address: the country header is
// enough to evidence which regime applied, without storing an identifier.
// The user agent is kept truncated as evidence of which browser answered,
// not as something to look anyone up by.
//
// `policyVersion` is what makes a consent expirable. When the cookie list
// on the privacy page changes materially, bump POLICY_VERSION and every
// older answer stops counting — consent is to a specific set of cookies,
// not to the idea of cookies.
export const consentRecords = pgTable("consent_record", {
  id: text("id").primaryKey(),
  decision: text("decision").notNull(), // "all" | "essential"
  policyVersion: text("policy_version").notNull(),
  locale: text("locale"),
  country: text("country"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
