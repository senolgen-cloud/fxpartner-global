import type { ReactNode } from "react";

// The posters the two trade cards are composited over — /api/og/trade-signal
// for the opening call and /api/og/trade-result for its close.
//
// Both are empty templates the owner drew: outlined boxes over the world map
// with a coloured ring in each and nothing printed inside them. Neither
// carries a sample trade, so neither card masks anything — the routes write
// values into the boxes, and the names under them are drawn here.
//
//   public/trade-card-poster.png (the call) — the instrument box, and three
//   level boxes whose rings run cyan, green, red: entry, target, stop.
//
//   public/trade-card-result-poster.png (the close) — the same instrument box
//   in the same place, and one wide box under it for the result.
//
// The two templates share the instrument box to the pixel, which is why one
// call and its close read as a pair.
//
// This replaced a filled design that printed a sample trade into two panels
// and had to be painted over. Nothing is painted over any more; if a box ever
// comes back with content printed in it, that mechanism is in the history at
// "Draw the call on the owner's empty template".
//
// Both files are 1080x1080. Every coordinate below was measured off the PNGs
// by scanning for the frames — replace a design file and its geometry has to
// be measured again.

// Absolute, because Satori fetches these over HTTP rather than reading them
// off disk. The ASCII filenames matter: the design files were uploaded under
// Turkish names, and a non-ASCII path in a URL is a fragile thing to depend
// on here.
const origin = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

export const WIDTH = 1080;
export const HEIGHT = 1080;

// Sampled out of the design files, so what the routes draw sits in the same
// palette as the rings they draw it beside. They are a shade off ogAssets'
// TICK_UP / TICK_DOWN, which are the site's chart colours — on these cards
// the posters win.
export const LABEL = "#989ba0";
export const VALUE = "#f7f8fb";
export const DOWN = "#ee4f55";
export const UP = "#30c76c";
export const NEUTRAL = "#8b9096";

// The band between the logo and the instrument box. Measured the same way
// as everything else here: scanned across the full width of both PNGs,
// y=156..248 comes back with zero pixels above the map on either one. It
// is the only strip on these templates wide enough for a sentence, and it
// is in the same place on both — which is what lets the record read as a
// standing header over the pair of cards rather than as something bolted
// onto one of them.
const RECORD = { left: 60, top: 186, width: 960 };
// The instrument box, identical in both templates.
const HEAD = { left: 398, top: 250, width: 284, height: 86 };

// The call's three level boxes and the close's single wide one.
const CALL_BOXES = [
  { left: 91, top: 437, width: 267, height: 80 },
  { left: 406, top: 437, width: 268, height: 80 },
  { left: 722, top: 437, width: 267, height: 80 },
];
const RESULT_BOX = { left: 242, top: 388, width: 596, height: 176 };

// The call template first shipped with "Price / Take Profit / Stop Loss"
// printed under its boxes; that row came out of the design file, so the names
// are drawn here now and are Turkish, like the channel and the site. They sit
// where the printed ones sat, centred under each box.
//
// The call's order is fixed by the design, not by us: its boxes carry a cyan,
// a green and a red ring in that order, so the middle box is the target and
// the last one is the stop.
const CALL_LABELS = ["Giriş", "Kâr Al", "Zarar Durdur"];
const CALL_LABEL_TOP = 522;
const RESULT_LABEL = "Sonuç";
const RESULT_LABEL_TOP = 569;

const BOX_PAD_LEFT = 22;
// Every box carries a ring near its right edge. It is part of the design and
// text must not run under it, so each box reserves the width its ring takes:
// ~17px in the small boxes, 40px in the close's wide one.
const RING_RESERVE = 52;
const RESULT_RING_RESERVE = 103;

// Values sit over the map rather than over a panel, so they carry a shadow.
const OVER_MAP_SHADOW = "0 2px 8px rgba(0,0,0,0.75)";

/** The frame both cards share: the poster, and the instrument box on it. */
function Frame({
  poster,
  instrument,
  pill,
  record,
  children,
}: {
  poster: string;
  instrument: ReactNode;
  pill: ReactNode;
  record: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        display: "flex",
        position: "relative",
        fontFamily: "sans-serif",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${origin()}/${poster}`}
        width={WIDTH}
        height={HEIGHT}
        alt=""
        style={{ position: "absolute", left: 0, top: 0 }}
      />

      {record}

      <div
        style={{
          position: "absolute",
          left: HEAD.left,
          top: HEAD.top,
          width: HEAD.width,
          height: HEAD.height,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: BOX_PAD_LEFT,
          paddingRight: RING_RESERVE,
          // The box takes its two pieces as separate children, never wrapped
          // in a fragment: Satori counts a fragment as a single flex child,
          // which quietly kills both the space-between and the gap and seats
          // the pill against the last letter of the instrument name.
          gap: 12,
        }}
      >
        {instrument}
        {pill}
      </div>

      {children}
    </div>
  );
}

/**
 * The running record, drawn over both cards.
 *
 * WHY THE LOSSES ARE ON THE CARD. Every signal account on Telegram posts
 * its wins; the number that separates this one is the one beside it. A
 * card that travels without it is a screenshot of a win, indistinguishable
 * from everybody else's and worth about as much. So the loss count rides
 * along on every card — the winning ones included, which is the only way
 * it means anything.
 *
 * Coloured rather than flat: the eye reads a green figure and a red one
 * side by side as a ledger, and reads a grey run of digits as small print.
 * Same palette as the rings on the template.
 *
 * Drawn only when the caller has a record to draw — under
 * MIN_TRADES_FOR_RATE the stats query returns nothing and this renders
 * null, so a thin sample leaves the band empty instead of putting a
 * three-trade record on a poster.
 */
export function RecordLine({
  scope,
  days,
  trades,
  wins,
  losses,
}: {
  scope: string;
  days: number;
  trades: number;
  wins: number;
  losses: number;
}) {
  // Satori counts a fragment as one flex child, so every piece of this row
  // is its own element — the same trap the instrument box carries a note
  // about above.
  const dot = (key: string) => (
    <span key={key} style={{ display: "flex", color: NEUTRAL }}>
      ·
    </span>
  );
  const piece = (key: string, text: string, color: string) => (
    <span key={key} style={{ display: "flex", color, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: RECORD.left,
        top: RECORD.top,
        width: RECORD.width,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontSize: 24,
        letterSpacing: 1.5,
        textShadow: OVER_MAP_SHADOW,
      }}
    >
      {piece("scope", scope, LABEL)}
      {dot("d1")}
      {piece("days", `SON ${days} GÜN`, LABEL)}
      {dot("d2")}
      {piece("trades", `${trades} İŞLEM`, VALUE)}
      {dot("d3")}
      {piece("wins", `${wins} KAZANÇ`, UP)}
      {dot("d4")}
      {piece("losses", `${losses} KAYIP`, DOWN)}
    </div>
  );
}
/** A name drawn under a box, where the design file used to print one. */
function BoxLabel({ text, left, top, width }: { text: string; left: number; top: number; width: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          display: "flex",
          fontSize: 30,
          color: VALUE,
          whiteSpace: "nowrap",
          textShadow: OVER_MAP_SHADOW,
        }}
      >
        {text}
      </span>
    </div>
  );
}

/** The opening call: three levels written into the template's boxes. */
export function CallPoster({
  instrument,
  pill,
  record,
  price,
  takeProfit,
  stopLoss,
}: {
  instrument: ReactNode;
  pill: ReactNode;
  record: ReactNode;
  price: ReactNode;
  takeProfit: ReactNode;
  stopLoss: ReactNode;
}) {
  const cells = [price, takeProfit, stopLoss];
  return (
    <Frame
      poster="trade-card-poster.png"
      instrument={instrument}
      pill={pill}
      record={record}
    >
      {CALL_BOXES.map((box, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            display: "flex",
            alignItems: "center",
            paddingLeft: BOX_PAD_LEFT,
            paddingRight: RING_RESERVE,
          }}
        >
          {cells[i]}
        </div>
      ))}

      {CALL_BOXES.map((box, i) => (
        <BoxLabel
          key={`label-${i}`}
          text={CALL_LABELS[i]}
          left={box.left}
          top={CALL_LABEL_TOP}
          width={box.width}
        />
      ))}
    </Frame>
  );
}

/** The close: the outcome and the figure, in the template's one wide box. */
export function ResultPoster({
  instrument,
  pill,
  record,
  outcome,
  figure,
  detail,
}: {
  instrument: ReactNode;
  pill: ReactNode;
  record: ReactNode;
  outcome: ReactNode;
  figure: ReactNode;
  detail: ReactNode;
}) {
  return (
    <Frame
      poster="trade-card-result-poster.png"
      instrument={instrument}
      pill={pill}
      record={record}
    >
      <div
        style={{
          position: "absolute",
          left: RESULT_BOX.left,
          top: RESULT_BOX.top,
          width: RESULT_BOX.width,
          height: RESULT_BOX.height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 34,
          paddingRight: RESULT_RING_RESERVE,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {outcome}
          {figure}
        </div>
        {detail}
      </div>

      <BoxLabel
        text={RESULT_LABEL}
        left={RESULT_BOX.left}
        top={RESULT_LABEL_TOP}
        width={RESULT_BOX.width}
      />
    </Frame>
  );
}

/** A level written into one of the call template's boxes. */
export function BoxValue({ value, color }: { value: string; color: string }) {
  // 193px of room between the padding and the ring: seven digits fit at 44,
  // and the longer strings step down rather than run under the ring.
  const size = value.length <= 7 ? 44 : value.length <= 9 ? 36 : 28;
  return (
    <span
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 700,
        color,
        letterSpacing: -0.5,
        whiteSpace: "nowrap",
        textShadow: OVER_MAP_SHADOW,
      }}
    >
      {value}
    </span>
  );
}

/** The close's headline figure — the pips or the dollars it came to. */
export function ResultFigure({ value, color }: { value: string; color: string }) {
  // 459px of room, shared with the outcome pill beside it.
  const size = value.length <= 10 ? 60 : value.length <= 13 ? 50 : 42;
  return (
    <span
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 700,
        color,
        letterSpacing: -1,
        whiteSpace: "nowrap",
        textShadow: OVER_MAP_SHADOW,
      }}
    >
      {value}
    </span>
  );
}

/** The line under the close's figure: direction, and the prices it ran between. */
export function ResultDetail({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "flex",
        marginTop: 14,
        fontSize: 26,
        color: LABEL,
        whiteSpace: "nowrap",
        textShadow: OVER_MAP_SHADOW,
      }}
    >
      {text}
    </span>
  );
}

/** The instrument name in the head box, sized to fit its pill.
 *
 * The box gives 210px between its padding and its ring; the pill takes about
 * 83 of it and the gap 12, so the name has ~115px. nowrap is what keeps a name
 * that misjudges it visible: without it "EUR/USD" breaks after the slash and
 * the second line hangs out of an 86px box. */
export function Instrument({ label }: { label: string }) {
  const size = label.length <= 4 ? 42 : label.length <= 5 ? 36 : label.length <= 6 ? 30 : 26;
  return (
    <span
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 700,
        color: VALUE,
        letterSpacing: -0.5,
        whiteSpace: "nowrap",
        textShadow: OVER_MAP_SHADOW,
      }}
    >
      {label}
    </span>
  );
}

/** The filled pill — BUY/SELL on the call, WIN/LOSS on the close.
 *
 * Height and padding come off the text size rather than being fixed: the head
 * box calls it at 18 and the close's wide box at 22. */
export function Pill({ label, color, size = 18 }: { label: string; color: string; size?: number }) {
  const height = Math.round(size * 2.2);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        whiteSpace: "nowrap",
        height,
        padding: `0 ${Math.round(size * 1.05)}px`,
        borderRadius: Math.round(height / 2),
        background: color,
        color: "#ffffff",
        fontSize: size,
        fontWeight: 700,
        letterSpacing: 1,
      }}
    >
      {label}
    </div>
  );
}
