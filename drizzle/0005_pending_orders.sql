-- Pending orders announced before they fill. Separate from trade_signal on
-- purpose — see the note above pendingOrders in src/db/schema.ts.
CREATE TABLE IF NOT EXISTS "pending_order" (
  "ticket"              text PRIMARY KEY NOT NULL,
  "pair"                text NOT NULL,
  "order_type"          text NOT NULL,
  "direction"           text,
  "price"               text NOT NULL,
  "stop"                text,
  "target1"             text,
  "volume"              text,
  "state"               text NOT NULL DEFAULT 'waiting',
  "telegram_message_id" text,
  "created_at"          timestamp NOT NULL DEFAULT now(),
  "resolved_at"         timestamp
);
