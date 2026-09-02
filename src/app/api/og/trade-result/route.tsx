import { ImageResponse } from "next/og";
import { splitPair } from "@/lib/ogIcons";
import {
  ResultPoster,
  ResultInstrument,
  Pill,
  ResultCell,
  WIDTH,
  HEIGHT,
  LABEL,
  VALUE,
  UP,
  DOWN,
  NEUTRAL,
} from "@/lib/ogPoster";

export const runtime = "edge";

// The close, painted over the filled design's two panels. Geometry, colours
// and the shared pieces live in lib/ogPoster.
//
// It runs on its own design file, not the empty template the opening call
// uses: that template prints "Price / Take Profit / Stop Loss" under its
// boxes, and a close has an exit price and a result to show, not a take
// profit. The filled design leaves its labels to us, so this card can name
// its own columns.
//
// It used to be a square 1080 card of its own, built to double as an
// Instagram post. It follows /api/og/trade-signal onto a poster so that a
// call and its result arrive in a thread as one pair rather than two
// products — which is the same reason it was square before, pointing the
// other way. Both posters are square, so it is both.

type Outcome = "WIN" | "LOSS" | "BE";

// Same 0-means-not-real convention as /api/og/trade-signal.
const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;

function resolveOutcome(
  outcomeParam: string | null,
  pips: string | null,
  profit: string | null
): Outcome | null {
  const fromParam = outcomeParam?.toUpperCase();
  if (fromParam === "WIN" || fromParam === "LOSS" || fromParam === "BE") return fromParam;
  const n = pips !== null ? parseFloat(pips) : profit !== null ? parseFloat(profit) : NaN;
  if (Number.isNaN(n)) return null;
  if (n > 0) return "WIN";
  if (n < 0) return "LOSS";
  return "BE";
}

/** "+52.4", "−30.1" — the sign is drawn, never left to the caller's string. */
function signed(raw: string): string {
  const n = parseFloat(raw);
  const body = Math.abs(n).toString();
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${body}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const close = searchParams.get("close");
  const pips = searchParams.get("pips");
  const profit = searchParams.get("profit");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL

  if (!pair || !entry || !close) {
    return new Response("Missing required params: pair, entry, close", { status: 400 });
  }

  const [base, quote] = splitPair(pair);
  const pairLabel = quote ? `${base}/${quote}` : pair;
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";

  const outcome = resolveOutcome(searchParams.get("outcome"), pips, profit);
  const outcomeColor = outcome === "LOSS" ? DOWN : outcome === "WIN" ? UP : NEUTRAL;
  // "BERABERE" rather than "BE": the head panel holds the instrument and this
  // pill inside 429px, and the long word only fits at the smaller size.
  const outcomeLabel =
    outcome === "WIN" ? "WIN" : outcome === "LOSS" ? "LOSS" : outcome === "BE" ? "BERABERE" : "KAPANDI";
  const outcomeSize = outcome === "WIN" || outcome === "LOSS" ? 30 : 22;

  // A zero here is a real breakeven result, not the "EA hadn't read it yet"
  // zero that isRealLevel guards against on a price — so a negative or zero
  // number still counts as present, and only a missing param does not.
  const hasPips = pips !== null && !Number.isNaN(parseFloat(pips));
  const hasProfit = profit !== null && !Number.isNaN(parseFloat(profit));

  // Pips lead when both are sent: they are the same number for every reader,
  // while a dollar figure silently assumes the account's lot size. The strip
  // has one line per column, so when both arrive the USD figure rides in the
  // caption rather than under the pips.
  const resultValue = hasPips
    ? `${signed(pips as string)} pip`
    : hasProfit
      ? `${signed(profit as string)} USD`
      : "—";

  const closeIsReal = isRealLevel(close);

  return new ImageResponse(
    (
      <ResultPoster
        instrument={<ResultInstrument label={pairLabel} />}
        pill={<Pill label={outcomeLabel} color={outcomeColor} size={outcomeSize} />}
        strip={
          <div style={{ display: "flex", width: "100%", height: "100%" }}>
            {/* The direction rides in the entry column's label: the head
                panel's pill is what the outcome is for, and two pills side by
                side make the reader work out which one is the result. */}
            <ResultCell
              label={directionLabel ? `GİRİŞ FİYATI · ${directionLabel}` : "GİRİŞ FİYATI"}
              value={entry}
              color={VALUE}
              index={0}
            />
            <ResultCell
              label="ÇIKIŞ FİYATI"
              value={closeIsReal ? close : "—"}
              color={closeIsReal ? VALUE : LABEL}
              index={1}
            />
            <ResultCell label="SONUÇ" value={resultValue} color={outcomeColor} index={2} />
          </div>
        }
      />
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
