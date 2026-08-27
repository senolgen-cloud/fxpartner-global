CREATE TABLE IF NOT EXISTS "consent_record" (
  "id" text PRIMARY KEY,
  "decision" text NOT NULL,
  "policy_version" text NOT NULL,
  "locale" text,
  "country" text,
  "user_agent" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "consent_record_created_at_idx" ON "consent_record" ("created_at");
