ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "notifications_seen_at" timestamp;
ALTER TABLE "cashback_account" ADD COLUMN IF NOT EXISTS "status_changed_at" timestamp;
