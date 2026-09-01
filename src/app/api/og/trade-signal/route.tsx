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
  GOLD,
  LABEL,
  VALUE,
} from "@/lib/ogPoster";

export const runtime = "edge";

// The opening call, drawn into the poster's box. Geometry, colours and the
// shared pieces live in lib/ogPoster — see the header there for what the
// design file carries and what this route is responsible for.
//
// This replaces a version that drew the whole card from the trade data. That
// one carried more of the trade — signal confidence, the rolling record, the
// lot ladder — because it had the room. The poster does not: between the box
// and the laptop mockup there are about twenty-five pixels. Those numbers now
// live only in the Telegram caption, which still carries them.

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

  const entryNum = entry ? parseFloat(entry) : 0;
  // "EUR/USD" for an FX pair, "GOLD" for everything else — splitPair returns
  // an empty quote for the instruments that are not two currencies, and a
  // trailing slash on GOLD would read as a typo.
  const [base, quote] = splitPair(pair);
  const pairLabel = quote ? `${base}/${quote}` : pair;
  // The design file's badge holds a gold-bars glyph, which is only true of
  // one instrument. The base code is the generic version of the same thing.
  const badge = base.slice(0, 4);

  // The draft draws BUY in gold. SELL is not drawn in the draft at all, and a
  // sell that looks exactly like a buy is the one difference on this card a
  // reader cannot afford to miss — so the pill keeps the drafted shape and
  // takes the direction's colour.
  const isSell = direction === "SELL";
  const directionLabel = isSell ? "SELL" : direction === "BUY" ? "BUY" : "";

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
          {directionLabel && (
            <div style={{ display: "flex", marginLeft: 32 }}>
              <Pill label={directionLabel} color={isSell ? TICK_DOWN : GOLD} />
            </div>
          )}
        </div>

        {locked ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ display: "flex", fontSize: 20, letterSpacing: 2, color: LABEL }}>
              GİRİŞ · ZARAR DURDUR · KÂR AL
            </span>
            <span
              style={{ display: "flex", marginTop: 14, fontSize: 38, fontWeight: 700, color: GOLD }}
            >
              Seviyeler üyelere özel
            </span>
            <span style={{ display: "flex", marginTop: 8, fontSize: 21, color: LABEL }}>
              fxpartner.global/paketler
            </span>
          </div>
        ) : (
          <div style={{ display: "flex" }}>
            <Column
              label="GİRİŞ FİYATI"
              value={entry as string}
              delta=""
              color={VALUE}
              ruled={false}
            />
            <Column
              label="ZARAR DURDUR"
              value={hasStop ? (stop as string) : "—"}
              delta={hasStop ? pct(entryNum, parseFloat(stop as string)) : ""}
              color={hasStop ? TICK_DOWN : LABEL}
              ruled
            />
            <Column
              label="KÂR AL"
              value={hasTarget1 ? (target1 as string) : "—"}
              delta={hasTarget1 ? pct(entryNum, parseFloat(target1 as string)) : ""}
              color={hasTarget1 ? TICK_UP : LABEL}
              ruled
            />
          </div>
        )}
      </PosterCard>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
