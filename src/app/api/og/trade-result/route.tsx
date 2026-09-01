import { ImageResponse } from "next/og";
import { TICK_UP, TICK_DOWN } from "@/lib/ogAssets";
import { splitPair } from "@/lib/ogIcons";
import {
  PosterCard,
  Badge,
  Pill,
  Column,
  pct,
  WIDTH,
  HEIGHT,
  LABEL,
  VALUE,
} from "@/lib/ogPoster";

export const runtime = "edge";

// The close, drawn into the same poster box as the opening call. Geometry,
// colours and the shared pieces live in lib/ogPoster.
//
// It used to be a square 1080 card of its own, built to double as an
// Instagram post. It follows /api/og/trade-signal onto the poster so that a
// call and its result arrive in a thread as one pair rather than two
// products — which is the same reason it was square before, pointing the
// other way.

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
  const badge = base.slice(0, 4);
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";

  const outcome = resolveOutcome(searchParams.get("outcome"), pips, profit);
  const outcomeColor =
    outcome === "LOSS" ? TICK_DOWN : outcome === "WIN" ? TICK_UP : LABEL;
  // "BERABERE" rather than "BE": the row has to hold the badge, the pair and
  // this pill inside 678px, and the long word only fits at the smaller size.
  const outcomeLabel =
    outcome === "WIN" ? "WIN" : outcome === "LOSS" ? "LOSS" : outcome === "BE" ? "BERABERE" : "KAPANDI";
  const outcomeSize = outcome === "WIN" || outcome === "LOSS" ? 30 : 24;

  // A zero here is a real breakeven result, not the "EA hadn't read it yet"
  // zero that isRealLevel guards against on a price — so a negative or zero
  // number still counts as present, and only a missing param does not.
  const hasPips = pips !== null && !Number.isNaN(parseFloat(pips));
  const hasProfit = profit !== null && !Number.isNaN(parseFloat(profit));

  // Pips lead when both are sent: they are the same number for every reader,
  // while a dollar figure silently assumes the account's lot size.
  const resultValue = hasPips
    ? `${signed(pips as string)} pip`
    : hasProfit
      ? `${signed(profit as string)} USD`
      : "—";
  const resultDelta = hasPips && hasProfit ? `${signed(profit as string)} USD` : "";

  const entryNum = parseFloat(entry);
  const closeIsReal = isRealLevel(close);

  return new ImageResponse(
    (
      <PosterCard>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Badge code={badge} />
          <span
            style={{
              display: "flex",
              marginLeft: 30,
              fontSize: 58,
              fontWeight: 700,
              color: VALUE,
              letterSpacing: -1,
            }}
          >
            {pairLabel}
          </span>
          <div style={{ display: "flex", marginLeft: 28 }}>
            <Pill label={outcomeLabel} color={outcomeColor} size={outcomeSize} />
          </div>
        </div>

        <div style={{ display: "flex" }}>
          {/* The direction rides under the entry rather than beside the pair:
              the outcome pill is what row one is for, and two pills side by
              side make the reader work out which one is the result. */}
          <Column
            label="GİRİŞ FİYATI"
            value={entry}
            delta={directionLabel}
            color={VALUE}
            ruled={false}
          />
          <Column
            label="ÇIKIŞ FİYATI"
            value={closeIsReal ? close : "—"}
            delta={closeIsReal ? pct(entryNum, parseFloat(close)) : ""}
            color={closeIsReal ? VALUE : LABEL}
            ruled
          />
          <Column
            label="SONUÇ"
            value={resultValue}
            delta={resultDelta}
            color={outcomeColor}
            ruled
          />
        </div>
      </PosterCard>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
