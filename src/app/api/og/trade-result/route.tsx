import { ImageResponse } from "next/og";
import { splitPair } from "@/lib/ogIcons";
import {
  ResultPoster,
  Instrument,
  Pill,
  ResultFigure,
  ResultDetail,
  WIDTH,
  HEIGHT,
  UP,
  DOWN,
  NEUTRAL,
} from "@/lib/ogPoster";

export const runtime = "edge";

// The close, written into its own empty template: the instrument up top, in
// the same box the opening call uses, and the result in the wide box under it.
// Geometry, colours and the shared pieces live in lib/ogPoster.
//
// Two pills would be one too many. The outcome is what this card is for, so it
// is the only coloured one; the direction rides in the head box in grey, as a
// statement of what was traded rather than of how it went.
//
// It used to be a square 1080 card of its own, built to double as an Instagram
// post. It follows /api/og/trade-signal onto a template so that a call and its
// result arrive in a thread as one pair rather than two products — which is
// the same reason it was square before, pointing the other way.

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
  // "BERABERE" rather than "BE": the box has the room and the two letters
  // read as an abbreviation nobody outside the desk knows.
  const outcomeLabel =
    outcome === "WIN" ? "WIN" : outcome === "LOSS" ? "LOSS" : outcome === "BE" ? "BERABERE" : "KAPANDI";

  // A zero here is a real breakeven result, not the "EA hadn't read it yet"
  // zero that isRealLevel guards against on a price — so a negative or zero
  // number still counts as present, and only a missing param does not.
  const hasPips = pips !== null && !Number.isNaN(parseFloat(pips));
  const hasProfit = profit !== null && !Number.isNaN(parseFloat(profit));

  // Pips lead when both are sent: they are the same number for every reader,
  // while a dollar figure silently assumes the account's lot size. The box
  // holds one figure, so when both arrive the USD one stays in the Telegram
  // caption, which carries it in full.
  const resultValue = hasPips
    ? `${signed(pips as string)} pip`
    : hasProfit
      ? `${signed(profit as string)} USD`
      : "—";

  const closeIsReal = isRealLevel(close);

  return new ImageResponse(
    (
      <ResultPoster
        instrument={<Instrument label={pairLabel} />}
        pill={directionLabel ? <Pill label={directionLabel} color={NEUTRAL} /> : null}
        outcome={<Pill label={outcomeLabel} color={outcomeColor} size={22} />}
        figure={<ResultFigure value={resultValue} color={outcomeColor} />}
        detail={<ResultDetail text={`${entry} → ${closeIsReal ? close : "—"}`} />}
      />
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
