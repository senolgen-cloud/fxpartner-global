-- Generated education posts. Kept out of src/data/blog.ts on purpose — see
-- the note above educationPosts in src/db/schema.ts.
CREATE TABLE IF NOT EXISTS "education_post" (
  "id"           text PRIMARY KEY NOT NULL,
  "slug"         text NOT NULL UNIQUE,
  "topic"        text NOT NULL UNIQUE,
  "title"        text NOT NULL,
  "excerpt"      text NOT NULL,
  "body"         text NOT NULL,
  "translations" text,
  "published_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "education_post_published_idx" ON "education_post" ("published_at" DESC);
