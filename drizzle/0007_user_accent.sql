-- Accent behind the member monogram. See the note in src/db/schema.ts for why
-- this is a colour rather than an uploaded avatar.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "accent_color" text;
