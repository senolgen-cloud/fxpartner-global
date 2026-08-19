import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getBrokerBySlug, getBrokerScores, type Broker } from "@/data/brokers";
import { getLiveCashbackProgram } from "@/data/cashback";

// Campaign creative generator: the same broker record that drives
// /brokers/[slug] rendered as a ready-to-post ad in three placements.
//
//   /api/og/broker-creative/lite-finance?v=ad      -> 1672x941  (site ad banner, 16:9 socials)
//   /api/og/broker-creative/lite-finance?v=square  -> 1080x1080 (Instagram feed)
//   /api/og/broker-creative/lite-finance?v=story   -> 1080x1920 (story / Reels cover)
//
// Headline and subline default to copy derived from the broker's own data
// and can be overridden per campaign with ?title= and ?subtitle=, so one
// route covers a whole creative rotation without new code.
//
// Node runtime (not edge) on purpose: the fonts and the AI-rendered
// background plate are read straight off disk instead of being fetched over
// the network at request time.
export const runtime = "nodejs";

const INK = "#05070a";
const LIME = "#8DC63F";
const LIME_BRIGHT = "#A9E85C";
const GOLD = "#C9A227";
const TEXT = "#F5F7F6";
const TEXT_MUTED = "#9AA8AC";
const HAIRLINE = "rgba(255,255,255,0.14)";

type VariantKey = "ad" | "square" | "story";

const VARIANTS: Record<
  VariantKey,
  { width: number; height: number; background: string; scale: number }
> = {
  ad: { width: 1672, height: 941, background: "litefinance-16x9.jpg", scale: 1 },
  square: { width: 1080, height: 1080, background: "litefinance-1x1.jpg", scale: 0.78 },
  story: { width: 1080, height: 1920, background: "litefinance-9x16.jpg", scale: 0.86 },
};

function isVariant(v: string | null): v is VariantKey {
  return v === "ad" || v === "square" || v === "story";
}

// The background plates are broker-specific art. A broker without one falls
// back to a flat ink panel rather than borrowing another broker's artwork.
async function backgroundDataUri(slug: string, file: string): Promise<string | null> {
  if (slug !== "lite-finance") return null;
  try {
    const buf = await readFile(join(process.cwd(), "public", "campaigns", "bg", file));
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

async function logoDataUri(broker: Broker): Promise<string | null> {
  // satori can't decode webp — those brokers get the text wordmark only.
  if (!broker.logo || broker.logo.toLowerCase().endsWith(".webp")) return null;
  try {
    const buf = await readFile(join(process.cwd(), "public", broker.logo));
    const mime = broker.logo.toLowerCase().endsWith(".jpg") || broker.logo.toLowerCase().endsWith(".jpeg")
      ? "image/jpeg"
      : "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

// "0.0 pipten itibaren" -> "0.0 pip": the chips need the number, not the
// sentence the review page prints.
function shortSpread(spread: string): string {
  return spread.replace(/'?ten itibaren|'?tan itibaren|\bitibaren\b/gi, "").trim();
}

function defaultTitle(broker: Broker): string {
  const cheapest = broker.deepDive?.accountTypes?.[0];
  const raw = broker.deepDive?.accountTypes?.find((a) => a.spread.startsWith("0.0"));
  if (cheapest && raw) {
    return `${cheapest.minDeposit} ile başla,\n${shortSpread(raw.spread)}'te devam et.`;
  }
  return `${broker.name}\n${broker.tagline}`;
}

function defaultSubtitle(broker: Broker): string {
  return `${broker.deepDive?.accountTypes?.length ?? broker.platforms.length} hesap türü · ${broker.platforms
    .slice(0, 3)
    .join(", ")} · kaldıraç ${broker.maxLeverage}`;
}

function Wordmark({ scale }: { scale: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 * scale }}>
      <div
        style={{
          display: "flex",
          width: 10 * scale,
          height: 30 * scale,
          borderRadius: 3 * scale,
          backgroundColor: LIME,
        }}
      />
      <span
        style={{
          fontSize: 27 * scale,
          fontWeight: 700,
          letterSpacing: 3 * scale,
          color: TEXT,
        }}
      >
        FXPARTNER
      </span>
    </div>
  );
}

function Chip({
  label,
  value,
  scale,
  tone = LIME_BRIGHT,
}: {
  label: string;
  value: string;
  scale: number;
  tone?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4 * scale,
        padding: `${14 * scale}px ${22 * scale}px`,
        borderRadius: 16 * scale,
        border: `1px solid ${HAIRLINE}`,
        backgroundColor: "rgba(6,10,12,0.66)",
      }}
    >
      <span
        style={{
          fontSize: 17 * scale,
          letterSpacing: 1.6 * scale,
          textTransform: "uppercase",
          color: TEXT_MUTED,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 34 * scale, fontWeight: 700, color: tone }}>{value}</span>
    </div>
  );
}

function AccountRow({
  account,
  scale,
  highlight,
}: {
  account: { name: string; spread: string; commission: string; minDeposit: string };
  scale: number;
  highlight: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${13 * scale}px ${24 * scale}px`,
        borderRadius: 14 * scale,
        border: `1px solid ${highlight ? "rgba(141,198,63,0.55)" : HAIRLINE}`,
        backgroundColor: highlight ? "rgba(141,198,63,0.12)" : "rgba(6,10,12,0.6)",
      }}
    >
      <span
        style={{
          fontSize: 30 * scale,
          fontWeight: 700,
          color: highlight ? LIME_BRIGHT : TEXT,
          width: 210 * scale,
        }}
      >
        {account.name}
      </span>
      <span style={{ fontSize: 26 * scale, color: TEXT_MUTED, width: 250 * scale }}>
        {shortSpread(account.spread)}
      </span>
      <span style={{ fontSize: 26 * scale, fontWeight: 700, color: TEXT }}>
        {account.minDeposit}
      </span>
    </div>
  );
}

function Cta({ label, url, scale }: { label: string; url: string; scale: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16 * scale,
        alignSelf: "flex-start",
        padding: `${16 * scale}px ${34 * scale}px`,
        borderRadius: 999,
        backgroundColor: LIME,
      }}
    >
      <span style={{ fontSize: 30 * scale, fontWeight: 700, color: "#06120a" }}>{label}</span>
      <span style={{ fontSize: 26 * scale, color: "rgba(6,18,10,0.72)" }}>{url}</span>
    </div>
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const broker = getBrokerBySlug(slug);
  if (!broker) return new Response("Broker not found", { status: 404 });

  const url = new URL(request.url);
  const vParam = url.searchParams.get("v");
  const variantKey: VariantKey = isVariant(vParam) ? vParam : "ad";
  const { width, height, background, scale } = VARIANTS[variantKey];

  const title = url.searchParams.get("title") ?? defaultTitle(broker);
  const subtitle = url.searchParams.get("subtitle") ?? defaultSubtitle(broker);

  const [poppinsRegular, poppinsSemiBold, poppinsBold, bgUri, logoUri] = await Promise.all([
    readFile(join(process.cwd(), "public", "fonts", "Poppins-Regular.ttf")),
    readFile(join(process.cwd(), "public", "fonts", "Poppins-SemiBold.ttf")),
    readFile(join(process.cwd(), "public", "fonts", "Poppins-Bold.ttf")),
    backgroundDataUri(slug, background),
    logoDataUri(broker),
  ]);

  const scores = getBrokerScores(broker);
  const accounts = broker.deepDive?.accountTypes ?? [];
  const siteHost = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://fxpartner.global").replace(
    /^https?:\/\//,
    ""
  );
  // ?cta=cashback points the creative at the rebate funnel instead of the
  // review — only for a broker whose program is actually confirmed, so a
  // creative can never promise a rate we haven't signed off.
  const wantsCashbackCta = url.searchParams.get("cta") === "cashback";
  const cashback = getLiveCashbackProgram(broker.slug);
  const useCashbackCta = wantsCashbackCta && Boolean(cashback);
  const ctaUrl = useCashbackCta
    ? `${siteHost}/cashback/${broker.slug}/setup`
    : `${siteHost}/brokers/${broker.slug}`;
  const ctaLabel = useCashbackCta ? "Nakit iadeyi başlat" : "İncelemeyi oku";
  const isWide = variantKey === "ad";
  const isStory = variantKey === "story";
  const pad = isWide ? 78 : 64;
  // Instagram's own UI (profile row, reply bar) eats roughly the top and
  // bottom 12% of a story, so the story variant keeps that space empty.
  const padTop = isStory ? 220 : pad;
  const padBottom = isStory ? 250 : isWide ? 56 : pad;

  // Text sits on the dark side of the plate; this scrim guarantees contrast
  // even if a future background plate is brighter than this one.
  const scrim = isWide
    ? "linear-gradient(90deg, rgba(5,7,10,0.96) 0%, rgba(5,7,10,0.9) 42%, rgba(5,7,10,0.35) 68%, rgba(5,7,10,0.1) 100%)"
    : "linear-gradient(180deg, rgba(5,7,10,0.94) 0%, rgba(5,7,10,0.55) 48%, rgba(5,7,10,0.9) 100%)";

  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          backgroundColor: INK,
          fontFamily: "Poppins",
        }}
      >
        {bgUri && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgUri}
            alt=""
            width={width}
            height={height}
            style={{ position: "absolute", top: 0, left: 0, width, height, objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
            display: "flex",
            backgroundImage: scrim,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            width: isWide ? width * 0.62 : width,
            height,
            paddingTop: padTop,
            paddingBottom: padBottom,
            paddingLeft: pad,
            paddingRight: pad,
            // A story is far taller than its content, so space-between there
            // would scatter four blocks across empty screen; it stacks from
            // the top instead and the CTA is pushed down by marginTop:auto.
            justifyContent: isStory ? "flex-start" : "space-between",
            // space-between alone lets the blocks touch when the copy runs
            // long; gap sets the floor, space-between shares out the rest.
            gap: isStory ? 52 : isWide ? 14 : 30 * scale,
          }}
        >
          {/* Header: who is publishing this, and about whom */}
          <div style={{ display: "flex", alignItems: "center", gap: 22 * scale }}>
            <Wordmark scale={scale} />
            <div
              style={{
                display: "flex",
                width: 1,
                height: 34 * scale,
                backgroundColor: HAIRLINE,
              }}
            />
            {logoUri && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUri}
                alt=""
                height={38 * scale}
                style={{ height: 38 * scale, objectFit: "contain" }}
              />
            )}
            <span style={{ fontSize: 27 * scale, fontWeight: 600, color: TEXT }}>
              {broker.name}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8 * scale,
                padding: `${8 * scale}px ${16 * scale}px`,
                borderRadius: 999,
                border: `1px solid ${GOLD}55`,
                backgroundColor: "rgba(201,162,39,0.12)",
              }}
            >
              <span style={{ fontSize: 20 * scale, color: GOLD, fontWeight: 700 }}>
                Endeks {scores.composite.toFixed(1)}/10
              </span>
            </div>
          </div>

          {/* Headline block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 * scale }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {title.split("\n").map((line, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: (isWide ? 74 : 76) * (isWide ? 1 : scale),
                    fontWeight: 700,
                    lineHeight: 1.08,
                    color: i === 0 ? TEXT : LIME_BRIGHT,
                  }}
                >
                  {line}
                </span>
              ))}
            </div>
            <span
              style={{
                fontSize: 28 * scale,
                lineHeight: 1.45,
                color: TEXT_MUTED,
                maxWidth: isWide ? 820 : width - pad * 2,
              }}
            >
              {subtitle}
            </span>

            <div style={{ display: "flex", gap: 14 * scale, flexWrap: "wrap" }}>
              <Chip label="Min. yatırım" value={broker.minDeposit} scale={scale} />
              <Chip label="Kaldıraç" value={broker.maxLeverage} scale={scale} />
              <Chip
                label="Platform"
                value={`${broker.platforms.length} adet`}
                scale={scale}
                tone={TEXT}
              />
            </div>
          </div>

          {/* Account ladder — the actual argument of the campaign */}
          {accounts.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 * scale }}>
              <span
                style={{
                  fontSize: 19 * scale,
                  letterSpacing: 2 * scale,
                  textTransform: "uppercase",
                  color: TEXT_MUTED,
                }}
              >
                Hesap · spread · minimum
              </span>
              {accounts.slice(0, 3).map((a, i) => (
                <AccountRow
                  key={a.name}
                  account={a}
                  scale={scale}
                  highlight={i === accounts.length - 1}
                />
              ))}
            </div>
          )}

          {/* A story has far more vertical room than the argument needs;
              the review's own strengths fill it rather than dead space. */}
          {isStory && broker.pros.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {broker.pros.slice(0, 4).map((pro) => (
                <div key={pro} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={LIME_BRIGHT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span style={{ fontSize: 30, lineHeight: 1.35, color: TEXT, maxWidth: 880 }}>
                    {pro}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* CTA + the disclaimer that has to travel with every creative */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18 * scale,
              marginTop: isStory ? "auto" : 0,
            }}
          >
            <Cta label={ctaLabel} url={ctaUrl} scale={scale} />
            <span style={{ fontSize: 18 * scale, lineHeight: 1.4, color: "rgba(154,168,172,0.85)" }}>
              Yatırım tavsiyesi değildir. Kaldıraçlı işlemler yüksek risk içerir ve sermayenizin
              tamamını kaybedebilirsiniz. Koşullar brokerin resmi sitesinden teyit edilmelidir.
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: "Poppins", data: new Uint8Array(poppinsRegular).buffer as ArrayBuffer, weight: 400, style: "normal" },
        { name: "Poppins", data: new Uint8Array(poppinsSemiBold).buffer as ArrayBuffer, weight: 600, style: "normal" },
        { name: "Poppins", data: new Uint8Array(poppinsBold).buffer as ArrayBuffer, weight: 700, style: "normal" },
      ],
    }
  );
}
