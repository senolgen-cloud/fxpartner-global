import { ImageResponse } from "next/og";
import {
  INK,
  INK_SOFT,
  HAIRLINE,
  TEXT_ON_INK,
  TEXT_ON_INK_MUTED,
  SIGNAL,
  TICK_UP,
  TICK_DOWN,
  LOGO_DATA_URI,
} from "@/lib/ogAssets";
import {
  Sparkline,
  TelegramIcon,
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
  SocialIcon,
} from "@/lib/ogIcons";
import { LOT_LADDER, favorableMove, moneyForMove } from "@/lib/contractSizes";
import { splitPair } from "@/lib/ogIcons";

export const runtime = "edge";

// The card the signal post carries, drawn here rather than composited over a
// design file.
//
// It used to be public/trade-card-bg.png with one 332px-wide column left
// blank for this route to fill in — which meant the trade itself, the whole
// reason the post exists, occupied about a fifteenth of the image while the
// rest repeated the same static marketing on every signal. Everything on the
// card is now drawn from the trade, so the card is the trade.
//
// Square on purpose. The result card (/api/og/trade-result) is square and the
// two appear together in a thread — an opening call in 4:5 followed by its
// result in 1:1 reads as two different products. Portrait would suit the
// group better than the old 1.91:1 preview shape, but not at the cost of the
// pair, so if it moves both move.
const SIZE = 1254;
const PAD = 64;

// Deterministic thousands grouping, rather than toLocaleString("tr-TR").
// Intl locale data on the edge runtime is not guaranteed, and the failure is
// silent and expensive: a fallback to en-US grouping renders $4.670,00 as
// $4,670.00 — the same glyphs, a different number to a Turkish reader.
function money(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  const abs = Math.abs(value);
  const [whole, frac] = abs.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${sign}$${grouped},${frac}`;
}

function pct(from: number, to: number): string {
  if (!from) return "";
  const v = ((to - from) / from) * 100;
  return `${v > 0 ? "+" : v < 0 ? "−" : ""}%${Math.abs(v).toFixed(2)}`;
}

function Label({ children }: { children: string }) {
  // Pre-uppercased in the source, never via textTransform: CSS uppercasing
  // runs under a non-Turkish locale here and turns "Sinyal Detayı" into
  // "SINYAL DETAYI", dropping the dotted İ.
  return (
    <span style={{ display: "flex", fontSize: 15, letterSpacing: 2, color: TEXT_ON_INK_MUTED }}>
      {children}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 14,
      }}
    >
      <span style={{ fontSize: 22, color: TEXT_ON_INK_MUTED }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: TEXT_ON_INK }}>{value}</span>
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pair = (searchParams.get("pair") ?? "").toUpperCase();
  const entry = searchParams.get("entry");
  const target1 = searchParams.get("target1");
  const stop = searchParams.get("stop");
  const direction = (searchParams.get("direction") ?? "").toUpperCase(); // BUY | SELL
  const confidence = searchParams.get("confidence");
  const volume = searchParams.get("volume");
  // Pre-formatted by the caller. The card is re-fetched by Telegram long
  // after the post, so a time computed here would drift away from the trade
  // it describes; and formatting a date in a time zone needs ICU data the
  // edge runtime does not promise.
  const opened = searchParams.get("opened");
  // Rolling track record, passed in by the caller rather than queried here —
  // this route is edge/`ImageResponse` and gets re-fetched on every post, so
  // it stays a pure renderer with no DB round-trip.
  // Source of the numbers: lib/signalStats.ts (count-based only).
  const statTrades = searchParams.get("statTrades");
  const statWinRate = searchParams.get("statWinRate");
  const statDays = searchParams.get("statDays") ?? "30";
  const hasStats = Boolean(statTrades && statWinRate);

  if (!pair) {
    return new Response("Missing required param: pair", { status: 400 });
  }

  // A price of 0 means the EA hadn't detected a real SL/TP yet when it read
  // the position (it only retries for ~3s after open) — never display that
  // as if it were an actual level.
  const isRealLevel = (v: string | null): v is string => v !== null && parseFloat(v) > 0;

  // Locked means the caller withheld the levels, and the only thing that says
  // so is a missing entry.
  //
  // This also required a missing stop, and that was a real bug on a real
  // post: a trade opened with no stop loss set arrives with entry and target
  // but no stop, so the caller sends no stop param and the card locked
  // itself — a padlock reading "seviyeler üyelere özel" printed directly
  // above a caption listing the entry and the target. The post contradicted
  // itself, and neither half was wrong on its own.
  //
  // A trade genuinely running without a stop is worth showing as such. It
  // renders "—" under ZARAR DURDUR, which is the true statement.
  const locked = !entry;
  const hasTarget1 = !locked && isRealLevel(target1);
  const hasStop = !locked && isRealLevel(stop);

  const directionColor = direction === "SELL" ? TICK_DOWN : TICK_UP;
  const directionLabel = direction === "SELL" ? "SELL" : direction === "BUY" ? "BUY" : "";
  const entryNum = entry ? parseFloat(entry) : 0;
  // "EUR/USD" for an FX pair, "GOLD" for everything else — splitPair returns
  // an empty quote for the instruments that are not two currencies, and a
  // trailing slash on GOLD would read as a typo.
  const [base, quote] = splitPair(pair);
  const pairLabel = quote ? `${base}/${quote}` : pair;

  // "What this move is worth per lot" — the same ladder the site shows under
  // a signal, and the one number a reader actually converts into a decision.
  // Empty when the instrument has no contract spec: an invented dollar figure
  // is worse than no dollar figure.
  const move = hasTarget1 ? favorableMove(entry, target1, direction) : null;
  const ladder =
    move === null
      ? []
      : LOT_LADDER.map((lots) => ({
          lots: lots as number,
          value: moneyForMove(pair, move, lots),
        })).filter((r): r is { lots: number; value: number } => r.value !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          padding: PAD,
          background: INK,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_DATA_URI} height={54} alt="" />
          <span style={{ fontSize: 22, color: TEXT_ON_INK_MUTED }}>fxpartner.global</span>
        </div>

        {/* The card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            marginTop: 30,
            padding: 44,
            borderRadius: 28,
            border: `1px solid ${HAIRLINE}`,
            background: INK_SOFT,
          }}
        >
          {/* Instrument + direction + live marker */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 62, fontWeight: 800, color: TEXT_ON_INK, letterSpacing: -1 }}>
                {pairLabel}
              </span>
              {directionLabel && (
                <div
                  style={{
                    display: "flex",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: "#ffffff",
                    background: directionColor,
                    borderRadius: 999,
                    padding: "8px 26px",
                  }}
                >
                  {directionLabel}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", width: 12, height: 12, borderRadius: 999, background: TICK_UP }} />
              <span style={{ fontSize: 24, color: TICK_UP }}>Aktif</span>
            </div>
          </div>

          {/* Levels, or the locked stand-in */}
          {locked ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 1,
                textAlign: "center",
              }}
            >
              {confidence ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Label>SİNYAL GÜVENİ</Label>
                  <span style={{ fontSize: 120, fontWeight: 800, color: SIGNAL, letterSpacing: -3 }}>
                    %{confidence}
                  </span>
                </div>
              ) : (
                <span style={{ fontSize: 90 }}>🔒</span>
              )}
              <span style={{ fontSize: 30, color: TEXT_ON_INK_MUTED, marginTop: 18 }}>
                Giriş, kâr al ve zarar durdur seviyeleri üyelere özel
              </span>
              {hasStats && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 26 }}>
                  <span style={{ fontSize: 40, fontWeight: 800, color: TICK_UP }}>%{statWinRate} isabet</span>
                  <span style={{ fontSize: 22, color: TEXT_ON_INK_MUTED, marginTop: 4 }}>
                    son {statDays} günde {statTrades} işlem
                  </span>
                </div>
              )}
            </div>
          ) : (
            // A real element, not a fragment: Satori flattens fragments in a
            // way that dropped this whole block onto the header's row the
            // first time round — levels, detail and sparkline all laid out
            // side by side and half of it off the canvas.
            <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <div style={{ display: "flex", marginTop: 40 }}>
                <div style={{ display: "flex", flexDirection: "column", width: 340 }}>
                  <Label>GİRİŞ FİYATI</Label>
                  <span style={{ fontSize: 62, fontWeight: 800, color: TEXT_ON_INK, marginTop: 8 }}>
                    {entry}
                  </span>
                </div>
                <div style={{ display: "flex", width: 1, background: HAIRLINE, marginRight: 36 }} />
                <div style={{ display: "flex", flexDirection: "column", width: 330 }}>
                  <Label>ZARAR DURDUR</Label>
                  <span style={{ fontSize: 62, fontWeight: 800, color: TICK_DOWN, marginTop: 8 }}>
                    {hasStop ? stop : "—"}
                  </span>
                  {hasStop && (
                    <span style={{ fontSize: 24, color: TICK_DOWN, marginTop: 2 }}>
                      {pct(entryNum, parseFloat(stop))}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", width: 1, background: HAIRLINE, marginRight: 36 }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Label>KÂR AL</Label>
                  <span style={{ fontSize: 62, fontWeight: 800, color: TICK_UP, marginTop: 8 }}>
                    {hasTarget1 ? target1 : "—"}
                  </span>
                  {hasTarget1 && (
                    <span style={{ fontSize: 24, color: TICK_UP, marginTop: 2 }}>
                      {pct(entryNum, parseFloat(target1))}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", height: 1, background: HAIRLINE, marginTop: 40 }} />

              {/* Detail on the left, the shape of the move on the right */}
              <div style={{ display: "flex", flexGrow: 1, marginTop: 34 }}>
                <div style={{ display: "flex", flexDirection: "column", width: 600 }}>
                  <Label>SİNYAL DETAYI</Label>
                  {opened && <DetailRow label="Açılış zamanı" value={opened} />}
                  {volume && <DetailRow label="Hacim" value={`${volume} lot`} />}
                  {confidence && <DetailRow label="Sinyal güveni" value={`%${confidence}`} />}
                  {hasStats && (
                    <DetailRow
                      label={`Son ${statDays} gün`}
                      value={`${statTrades} işlem · %${statWinRate} isabet`}
                    />
                  )}

                  {ladder.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
                      <Label>KÂR AL SEVİYESİNDE, LOT BAŞINA</Label>
                      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 12 }}>
                        {ladder.map(({ lots, value }) => (
                          <div
                            key={lots}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              width: 290,
                              marginTop: 10,
                              paddingRight: 20,
                            }}
                          >
                            <span style={{ fontSize: 22, color: TEXT_ON_INK_MUTED }}>
                              {lots.toFixed(2)} lot
                            </span>
                            <span style={{ fontSize: 22, fontWeight: 700, color: TICK_UP }}>
                              {money(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    flexGrow: 1,
                  }}
                >
                  <Sparkline
                    seed={`${pair}-${entry}-${direction}`}
                    color={directionColor}
                    trendUp={direction !== "SELL"}
                    width={440}
                    height={330}
                  />
                </div>
              </div>
            </div>
          )}

          <span style={{ display: "flex", fontSize: 20, color: TEXT_ON_INK_MUTED, marginTop: 26 }}>
            Bu sinyal, takip edilen FXPARTNER MT5 hesabından otomatik olarak iletildi. Yatırım
            tavsiyesi değildir.
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 26,
          }}
        >
          <span style={{ fontSize: 22, color: TEXT_ON_INK_MUTED }}>
            İşlem risk içerir. Yatırım tavsiyesi değildir.
          </span>
          <div style={{ display: "flex", gap: 14 }}>
            <SocialIcon>
              <TelegramIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
            <SocialIcon>
              <YoutubeIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
            <SocialIcon>
              <InstagramIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
            <SocialIcon>
              <FacebookIcon color={TEXT_ON_INK_MUTED} />
            </SocialIcon>
          </div>
        </div>
      </div>
    ),
    { width: SIZE, height: SIZE }
  );
}
