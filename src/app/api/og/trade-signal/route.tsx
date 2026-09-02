import { ImageResponse } from "next/og";
import { splitPair } from "@/lib/ogIcons";
import {
  CallPoster,
  Instrument,
  Pill,
  BoxValue,
  WIDTH,
  HEIGHT,
  LABEL,
  VALUE,
  UP,
  DOWN,
} from "@/lib/ogPoster";

export const runtime = "edge";

// The opening call, written into the empty template's boxes. Geometry, colours
// and the shared pieces live in lib/ogPoster — see the header there for what
// each design file carries and what this route is responsible for.
//
// The template prints its own level names under the boxes, so this route draws
// no labels at all. It also fixes their order, which is NOT the order the
// close uses: Price, Take Profit, Stop Loss.
//
// This replaces a version that drew the whole card from the trade data. That
// one carried more of the trade — signal confidence, the rolling record, the
// lot ladder — because it had the room. The template does not: three boxes,
// one number each. Those numbers now live only in the Telegram caption, which
// still carries them.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const target1 = searchParams.get("target1");
  const stop = searchParams.get("stop");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL

  if (!pair) {
    return new Response("Missing required param: pair", { status: 400 });
  }

  // A price of 0 means the EA hadn't detected a real SL/TP yet when it read
  // the position (it only retries for ~3s after open) — never display that as
  // if it were an actual level.
  const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;

  // Locked means the caller withheld the levels, and the only thing that says
  // so is a missing entry. It must not also require a missing stop: a trade
  // opened with no stop loss set arrives with an entry and a target but no
  // stop, and testing for that locked the card while the caption below it
  // listed the levels in full.
  const locked = !entry;
  const hasTarget1 = !locked && isRealLevel(target1);
  const hasStop = !locked && isRealLevel(stop);

  // "EUR/USD" for an FX pair, "GOLD" for everything else — splitPair returns
  // an empty quote for the instruments that are not two currencies, and a
  // trailing slash on GOLD would read as a typo.
  const [base, quote] = splitPair(pair);
  const pairLabel = quote ? `${base}/${quote}` : pair;

  const isSell = direction === "SELL";
  const directionLabel = isSell ? "SELL" : direction === "BUY" ? "BUY" : "";

  // A withheld level says so in every box: the template's labels are printed
  // into it, so there is no way to relabel the row as a whole.
  const withheld = <BoxValue value="Üyelere özel" color={LABEL} />;

  return new ImageResponse(
    (
      <CallPoster
        instrument={<Instrument label={pairLabel} />}
        pill={directionLabel ? <Pill label={directionLabel} color={isSell ? DOWN : UP} /> : null}
        price={locked ? withheld : <BoxValue value={entry as string} color={VALUE} />}
        takeProfit={
          locked ? (
            withheld
          ) : (
            <BoxValue value={hasTarget1 ? (target1 as string) : "—"} color={hasTarget1 ? UP : LABEL} />
          )
        }
        stopLoss={
          locked ? (
            withheld
          ) : (
            <BoxValue value={hasStop ? (stop as string) : "—"} color={hasStop ? DOWN : LABEL} />
          )
        }
      />
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
