-- Who asked, so a free member's daily allowance can be counted.
--
-- The AI assistant used to be Pro-only, so there was nobody to attribute a
-- question to and the log needed no owner. Opening the answer to any signed-in
-- member means the cost is now driven by people who pay nothing, and an
-- uncapped free tier on a metered API is an unbounded bill.
--
-- Nullable: every row written before this existed has no owner, and questions
-- asked by a visitor who never signs in are not stored against anyone.

ALTER TABLE "ai_assistant_log" ADD COLUMN IF NOT EXISTS "user_id" text;

CREATE INDEX IF NOT EXISTS "ai_assistant_log_user_created_idx"
  ON "ai_assistant_log" ("user_id", "created_at");
