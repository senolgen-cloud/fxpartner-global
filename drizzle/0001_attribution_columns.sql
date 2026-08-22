-- First-touch attribution columns for every table that records someone
-- entering the funnel. Written once at insert time from the fxp_attr cookie
-- (src/proxy.ts) and never updated afterwards — see src/lib/visitor.ts and
-- docs/utm-standard.md.
--
-- Additive and nullable on purpose: every row that already exists keeps
-- working, and a visitor who arrives with no UTM and no referrer legitimately
-- has no source. Postgres adds a nullable column without rewriting the table,
-- so this is instant on tables of any size.
--
-- IF NOT EXISTS so re-running is harmless.

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "source" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "campaign" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "landing_path" text;

ALTER TABLE "cashback_account" ADD COLUMN IF NOT EXISTS "source" text;
ALTER TABLE "cashback_account" ADD COLUMN IF NOT EXISTS "campaign" text;
ALTER TABLE "cashback_account" ADD COLUMN IF NOT EXISTS "landing_path" text;

ALTER TABLE "cashback_lead" ADD COLUMN IF NOT EXISTS "source" text;
ALTER TABLE "cashback_lead" ADD COLUMN IF NOT EXISTS "campaign" text;
ALTER TABLE "cashback_lead" ADD COLUMN IF NOT EXISTS "landing_path" text;

ALTER TABLE "vip_subscription" ADD COLUMN IF NOT EXISTS "source" text;
ALTER TABLE "vip_subscription" ADD COLUMN IF NOT EXISTS "campaign" text;
ALTER TABLE "vip_subscription" ADD COLUMN IF NOT EXISTS "landing_path" text;
