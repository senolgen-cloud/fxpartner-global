-- Structured broker reviews. Every column is nullable on purpose: the
-- reviews collected before this migration carry a rating and a body and
-- nothing else, and they stay valid rows that the page still renders.
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "experience" text;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "liked" text;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "improved" text;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "rating_platform" integer;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "rating_pricing" integer;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "rating_service" integer;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "rating_withdrawal" integer;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "broker_reply" text;
ALTER TABLE "comment" ADD COLUMN IF NOT EXISTS "broker_reply_at" timestamp;
