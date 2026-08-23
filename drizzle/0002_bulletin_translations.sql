-- Translations for content written by a job rather than by a person.
--
-- The static catalogue (src/data/i18n) cannot reach a bulletin composed at
-- 07:00 by the news-update cron: there is no entry for it and never will be.
-- So the cron translates at write time and stores the result here, next to
-- the Turkish it was generated from.
--
-- One JSON column rather than six typed ones, matching how "sources" is
-- already stored in this table: a fourth locale then needs no migration,
-- and a row that was written before a locale existed simply has no key for
-- it and falls back to Turkish.
--
-- Nullable on purpose. Every bulletin already in the table has no
-- translation, and a translation failure must never block the news going
-- out — see translateBulletin() in src/lib/translateContent.ts.

ALTER TABLE "news_bulletin" ADD COLUMN IF NOT EXISTS "translations" text;
