-- Ekim 2026 gelir planı (docs/ekim-2026-yukselis-plani.md).

-- 3 aylık paket: bir siparişin kaç günlük erişim verdiği siparişin üstünde
-- duruyor. Mevcut her sipariş aylıktı.
ALTER TABLE "nowpayments_order" ADD COLUMN IF NOT EXISTS "period" text NOT NULL DEFAULT 'monthly';

-- Doğrulanmış ilk cashback hesabına bir kez verilen ücretsiz Pro ayı.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "pro_trial_granted_at" timestamp;

-- Siteden çıkan link tıklamaları (broker/prop referans linkleri vb.).
CREATE TABLE IF NOT EXISTS "outbound_click" (
  "id" text PRIMARY KEY NOT NULL,
  "href" text NOT NULL,
  "host" text NOT NULL,
  "path" text NOT NULL,
  "placement" text,
  "source" text,
  "campaign" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "outbound_click_created_at_idx" ON "outbound_click" ("created_at");
