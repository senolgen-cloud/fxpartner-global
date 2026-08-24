-- Live bid/ask per instrument, pushed by the MT5 EA and overwritten in place.
-- See the note above liveQuotes in src/db/schema.ts for why the EA is the
-- source rather than the public rate APIs.
CREATE TABLE IF NOT EXISTS "live_quote" (
  "symbol"     text PRIMARY KEY NOT NULL,
  "bid"        text NOT NULL,
  "ask"        text NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
