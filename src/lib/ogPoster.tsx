import type { ReactNode } from "react";

// The posters the two trade cards are composited over — /api/og/trade-signal
// for the opening call and /api/og/trade-result for its close.
//
// There are two design files because the owner drew two, and they work in
// opposite ways:
//
//   public/trade-card-poster.png (the call) is an empty template. Four
//   outlined boxes over the world map, a coloured ring in each, and the three
//   level names — "Price", "Take Profit", "Stop Loss" — printed under them.
//   Nothing to cover: the route writes values into the boxes and the design
//   file supplies the labels. Note the order, which is not the order the
//   result card uses: price, then TAKE PROFIT, then STOP LOSS.
//
//   public/trade-card-result-poster.png (the close) is the filled design: one
//   head panel and one three-column strip, both printed with a sample trade.
//   The route paints over both panels and draws its own labels and values.
//
// Both are 1080x1080. Every number below was measured off the PNGs by
// scanning for the frames and the panel fills — replace either design file
// and its half of this module has to be measured again.

// Absolute, because Satori fetches these over HTTP rather than reading them
// off disk. The ASCII filenames matter: both design files were uploaded under
// Turkish names, and a non-ASCII path in a URL is a fragile thing to depend
// on here.
const origin = () => process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global";

export const WIDTH = 1080;
export const HEIGHT = 1080;

// Sampled out of the design files, so what the routes draw sits in the same
// palette as what they draw it into. They are a shade off ogAssets' TICK_UP /
// TICK_DOWN, which are the site's chart colours — on these cards the posters
// win.
export const LABEL = "#989ba0";
export const VALUE = "#f7f8fb";
export const DOWN = "#ee4f55";
export const UP = "#30c76c";
export const NEUTRAL = "#8b9096";

// ---------------------------------------------------------------- the call

// The empty template's boxes. Measured to the frame, so anything drawn inside
// gets its own padding.
const CALL_HEAD = { left: 398, top: 250, width: 284, height: 86 };
const CALL_BOXES = [
  { left: 91, top: 437, width: 267, height: 80 },
  { left: 406, top: 437, width: 268, height: 80 },
  { left: 722, top: 437, width: 267, height: 80 },
];
// The template used to print "Price / Take Profit / Stop Loss" under the
// boxes; that row was taken out of the design file, so the names are ours to
// draw — and in Turkish, which is what the channel and the site speak. They
// go back exactly where the printed ones sat, centred under each box.
//
// The order is fixed by the design, not by us: the boxes carry a cyan, a
// green and a red ring in that order, so the middle box is the target and the
// last one is the stop. It is not the order the close uses.
const CALL_LABELS = ["Giriş", "Kâr Al", "Zarar Durdur"];
const CALL_LABEL_TOP = 522;
// Each box carries a ~17px ring near its right edge. It is part of the design
// and text must not run under it, so every box reserves its width.
const RING_RESERVE = 52;
const BOX_PAD_LEFT = 22;

// Values sit over the map rather than over a panel, so they carry a shadow the
// filled design does not need.
const OVER_MAP_SHADOW = "0 2px 8px rgba(0,0,0,0.75)";

/** The opening call: an empty template with values written into its boxes. */
export function CallPoster({
  instrument,
  pill,
  price,
  takeProfit,
  stopLoss,
}: {
  instrument: ReactNode;
  pill: ReactNode;
  price: ReactNode;
  takeProfit: ReactNode;
  stopLoss: ReactNode;
}) {
  const cells = [price, takeProfit, stopLoss];
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
        src={`${origin()}/trade-card-poster.png`}
        width={WIDTH}
        height={HEIGHT}
        alt=""
        style={{ position: "absolute", left: 0, top: 0 }}
      />

      <div
        style={{
          position: "absolute",
          left: CALL_HEAD.left,
          top: CALL_HEAD.top,
          width: CALL_HEAD.width,
          height: CALL_HEAD.height,
          display: "flex",
          alignItems: "center",
          // The head's ring is reserved the same way the level boxes reserve
          // theirs, and the gap is what keeps the name off the pill.
          paddingLeft: BOX_PAD_LEFT,
          paddingRight: RING_RESERVE,
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        {instrument}
        {pill}
      </div>

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
        <div
          key={`label-${i}`}
          style={{
            position: "absolute",
            left: box.left,
            top: CALL_LABEL_TOP,
            width: box.width,
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
            {CALL_LABELS[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

/** A level written into one of the template's boxes. */
export function BoxValue({ value, color }: { value: string; color: string }) {
  // 209px of room between the padding and the ring: seven digits fit at 40,
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

/** The instrument name in the template's head box, sized to fit its pill.
 *
 * The head box gives 210px between its padding and its ring; the pill takes
 * about 83 of it and the gap 12, so the name has ~115px. nowrap is what keeps
 * a name that misjudges it visible: without it "EUR/USD" breaks after the
 * slash and the second line hangs out of an 86px box. */
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
 * Height and padding come off the text size rather than being fixed: the two
 * posters call it at very different scales (20 inside the template's head box,
 * 30 inside the filled design's roomier panel), and the drafted pill in the
 * filled design is 67px tall around 30px text — which is where 2.2 comes
 * from. */
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

// --------------------------------------------------------------- the close

// The filled design's two panels. Both are one flat fill, so the sample trade
// is covered by repainting the panel rather than by masking inside a frame.
const RESULT_HEAD = { left: 331, top: 249, width: 429, height: 97 };
const RESULT_STRIP = { left: 79, top: 423, width: 921, height: 99 };
// The strip's three columns are split by two hairline rules painted into the
// design file — repainting the strip covers them, so ResultCell draws them
// back. Widths come from where the rules sit: 79 | 389 | 691 | 1000.
const RESULT_COLS = [310, 301, 308];
const PANEL_FILL = "#0e1116";
const RULE = "#202328";

/** The close: the filled design with both of its panels repainted. */
export function ResultPoster({
  instrument,
  pill,
  strip,
}: {
  instrument: ReactNode;
  pill: ReactNode;
  strip: ReactNode;
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
        src={`${origin()}/trade-card-result-poster.png`}
        width={WIDTH}
        height={HEIGHT}
        alt=""
        style={{ position: "absolute", left: 0, top: 0 }}
      />

      <div
        style={{
          position: "absolute",
          left: RESULT_HEAD.left,
          top: RESULT_HEAD.top,
          width: RESULT_HEAD.width,
          height: RESULT_HEAD.height,
          background: PANEL_FILL,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          // The head takes its two pieces as separate children, never wrapped
          // in a fragment: Satori counts a fragment as a single flex child,
          // which quietly kills both the space-between and the gap and seats
          // the pill against the last letter of the instrument name.
          gap: 16,
          padding: "0 10px 0 16px",
        }}
      >
        {instrument}
        {pill}
      </div>

      <div
        style={{
          position: "absolute",
          left: RESULT_STRIP.left,
          top: RESULT_STRIP.top,
          width: RESULT_STRIP.width,
          height: RESULT_STRIP.height,
          background: PANEL_FILL,
          display: "flex",
        }}
      >
        {strip}
      </div>
    </div>
  );
}

/** The instrument name in the filled design's head panel, which is roomier. */
export function ResultInstrument({ label }: { label: string }) {
  const size = label.length <= 4 ? 76 : label.length <= 5 ? 60 : label.length <= 6 ? 52 : 44;
  return (
    <span
      style={{ display: "flex", fontSize: size, fontWeight: 700, color: VALUE, letterSpacing: -1 }}
    >
      {label}
    </span>
  );
}

/** One column of the close's strip. */
export function ResultCell({
  label,
  value,
  color,
  index,
}: {
  label: string;
  value: string;
  color: string;
  index: 0 | 1 | 2;
}) {
  // The value is one line of digits in a 99px panel — there is no room for
  // the percentage and USD lines the portrait card carried under them. They
  // still go out in full in the Telegram caption.
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: RESULT_COLS[index],
        height: "100%",
        paddingLeft: index === 0 ? 32 : 31,
        paddingTop: 10,
        borderLeft: index === 0 ? "none" : `1px solid ${RULE}`,
      }}
    >
      {/* Labels are pre-uppercased at the call site, never via textTransform:
          CSS uppercasing runs under a non-Turkish locale here and turns
          "Giriş" into "GIRIS", dropping the dotted İ and the ş. */}
      <span style={{ display: "flex", fontSize: 16, letterSpacing: 2, color: LABEL }}>{label}</span>
      <span style={{ display: "flex", marginTop: 14, fontSize: 52, fontWeight: 700, color }}>
        {value}
      </span>
    </div>
  );
}
