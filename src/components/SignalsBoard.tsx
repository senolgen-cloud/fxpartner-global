"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { tradeSignals, TradeSignalOutcome } from "@/db/schema";
import { canViewSignal, requiredTierForPair, type PackageTier } from "@/lib/signalAccess";
import TradingViewChart from "./TradingViewChart";

type Signal = typeof tradeSignals.$inferSelect;
type SignalJson = Omit<Signal, "createdAt" | "closedAt"> & {
  createdAt: string;
  closedAt: string | null;
};

const TICK_UP = "#22c55e";
const TICK_DOWN = "#e5484d";
const POLL_MS = 15000;

function toSignal(s: SignalJson): Signal {
  return { ...s, createdAt: new Date(s.createdAt), closedAt: s.closedAt ? new Date(s.closedAt) : null };
}

// Two-tone chime via Web Audio — no audio file to ship/host, and it sounds
// identical everywhere. Browsers block audio until the page has seen a user
// gesture, so the AudioContext is created lazily on first click/keydown
// rather than on mount; until that first gesture fires, a signal arriving
// won't audibly chime (the push notification below still covers that case).
let sharedAudioCtx: AudioContext | null = null;

function unlockAudio() {
  if (sharedAudioCtx) return;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (Ctx) sharedAudioCtx = new Ctx();
}

function playSignalChime() {
  if (!sharedAudioCtx) return;
  const ctx = sharedAudioCtx;
  if (ctx.state === "suspended") ctx.resume();
  const now = ctx.currentTime;
  [880, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = now + i * 0.14;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

const TIER_LABEL: Record<PackageTier, string> = { starter: "Starter", pro: "Pro", vip: "VIP" };

// SVG donut mirroring the poster's "73% Başarı Oranı" ring — plain text
// couldn't carry that at-a-glance read, and TrustGauge's version is styled
// for broker trust scores (0-10, different color scale), not a win rate.
function PerformanceRing({ rate }: { rate: number | null }) {
  const size = 96;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = rate ?? 0;
  const offset = circumference * (1 - pct / 100);
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-hairline"
        />
        {rate !== null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-signal transition-[stroke-dashoffset] duration-700 ease-out"
          />
        )}
      </svg>
      <span className="absolute font-display text-xl font-semibold">
        {rate !== null ? `${rate}%` : "—"}
      </span>
    </div>
  );
}

function LockBadge({ pair }: { pair: string }) {
  const tier = TIER_LABEL[requiredTierForPair(pair)];
  return (
    <Link
      href="/paketler"
      title={`${tier} üyelere özel — yükseltmek için tıklayın`}
      className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/20"
    >
      🔒 {tier}
    </Link>
  );
}

function outcomeColor(outcome: TradeSignalOutcome | null) {
  if (outcome === "WIN") return TICK_UP;
  if (outcome === "LOSS") return TICK_DOWN;
  return "var(--text-on-ink-muted)";
}

// Raw entry -> close price movement, in the trade's favor. We show this
// instead of the EA's "pips" field — pip size varies wildly across
// instruments (BTCUSD, indices, XAU vs. forex majors) and the EA's pip
// math doesn't account for that, so its numbers are unreliable.
function priceDiff(entry: string | null, closePrice: string | null, direction: string | null): number | null {
  if (!entry || !closePrice) return null;
  const entryNum = parseFloat(entry);
  const closeNum = parseFloat(closePrice);
  if (Number.isNaN(entryNum) || Number.isNaN(closeNum)) return null;
  const diff = closeNum - entryNum;
  return direction === "SELL" ? -diff : diff;
}

function decimalsOf(value: string | null): number {
  if (!value) return 2;
  const idx = value.indexOf(".");
  return idx === -1 ? 0 : value.length - idx - 1;
}

function formatDiff(diff: number, decimals: number): string {
  return `${diff > 0 ? "+" : ""}${diff.toFixed(decimals)}`;
}

// Aggregate numbers mix wildly different price scales (BTCUSD moves in
// hundreds, forex majors in thousandths) — a fixed 2-decimal format would
// round small forex diffs down to 0.00, so use more precision for small
// values and less for large ones.
function aggDecimals(value: number): number {
  return Math.abs(value) >= 10 ? 2 : Math.abs(value) >= 1 ? 3 : 5;
}

function Level({ label, value, color }: { label: string; value: string | null; color: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between text-sm">
      <span className="text-text-on-ink-muted">{label}</span>
      <span className="font-mono font-medium" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

function LevelPair({ target1, stop }: { target1: string | null; stop: string | null }) {
  if (!target1 && !stop) return <span className="text-text-on-ink-muted">—</span>;
  return (
    <span className="font-mono">
      {stop ? <span style={{ color: TICK_DOWN }}>{stop}</span> : <span className="text-text-on-ink-muted">—</span>}
      <span className="text-text-on-ink-muted"> / </span>
      {target1 ? <span style={{ color: TICK_UP }}>{target1}</span> : <span className="text-text-on-ink-muted">—</span>}
    </span>
  );
}

function SignalTable({
  title,
  signals,
  closedView,
  viewerTier,
}: {
  title: string;
  signals: Signal[];
  closedView?: boolean;
  viewerTier: PackageTier | null;
}) {
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-hairline bg-ink-soft md:block">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-text-on-ink">{title}</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal">
          <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
          Canlı
        </span>
      </div>
      {signals.length === 0 ? (
        <p className="px-6 py-8 text-sm text-text-on-ink-muted">Henüz gösterilecek bir şey yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                <th className="px-6 py-3 font-medium">Saat</th>
                <th className="px-4 py-3 font-medium">Parite</th>
                <th className="px-4 py-3 font-medium">Yön</th>
                <th className="px-4 py-3 font-medium">Giriş</th>
                <th className="px-4 py-3 font-medium">{closedView ? "Kapanış" : "SL / TP"}</th>
                <th className="px-4 py-3 font-medium">Lot</th>
                <th className="px-6 py-3 text-right font-medium">{closedView ? "Sonuç" : "Durum"}</th>
              </tr>
            </thead>
            <tbody>
              {signals.map((s) => {
                const isSell = s.direction === "SELL";
                const directionColor = isSell ? TICK_DOWN : TICK_UP;
                const diff = priceDiff(s.entry, s.closePrice, s.direction);
                const resultLine =
                  diff !== null
                    ? formatDiff(diff, decimalsOf(s.entry))
                    : s.profit
                      ? `${parseFloat(s.profit) > 0 ? "+" : ""}${s.profit} USD`
                      : null;
                // Past performance is public regardless of package — only
                // closedView's live/active counterpart is the gated product.
                const locked = closedView ? false : !canViewSignal(viewerTier, s.pair);
                return (
                  <tr key={s.id} className="border-b border-hairline last:border-0">
                    <td className="whitespace-nowrap px-6 py-3.5 font-mono text-xs text-text-on-ink-muted">
                      {(closedView ? s.closedAt : s.createdAt)?.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-display font-semibold text-text-on-ink">
                      {s.pair}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {s.direction ? (
                        <span
                          className="rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                          style={{ borderColor: directionColor, color: directionColor }}
                        >
                          {s.direction}
                        </span>
                      ) : (
                        <span className="text-text-on-ink-muted">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-text-on-ink">
                      {locked ? "••••••" : s.entry}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      {locked ? (
                        <span className="font-mono text-text-on-ink-muted">•••• / ••••</span>
                      ) : closedView ? (
                        <span className="font-mono text-text-on-ink">{s.closePrice ?? "—"}</span>
                      ) : (
                        <LevelPair target1={s.target1} stop={s.stop} />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-text-on-ink-muted">
                      {locked ? "—" : s.volume ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      {locked ? (
                        <LockBadge pair={s.pair} />
                      ) : closedView ? (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-semibold text-on-signal"
                          style={{ background: outcomeColor(s.outcome) }}
                        >
                          {resultLine ?? s.outcome ?? "CLOSED"}
                        </span>
                      ) : (
                        <span className="rounded-full border border-signal px-2.5 py-1 text-xs font-semibold text-signal">
                          Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatDuration(ms: number) {
  if (!ms || ms <= 0) return "—";
  const totalMinutes = Math.round(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}g ${hours}s`;
  if (hours > 0) return `${hours}s ${minutes}dk`;
  return `${minutes}dk`;
}

function useCountUp(target: number, durationMs = 1400, decimals = 0) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    // setTimeout instead of requestAnimationFrame — rAF is paused by the
    // browser while the tab is backgrounded/not compositing, which would
    // leave the counter stuck at 0 indefinitely; setTimeout keeps firing
    // (just throttled) so the count always reaches its target.
    let timer: ReturnType<typeof setTimeout>;
    const start = performance.now();
    const from = 0;
    function tick() {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) timer = setTimeout(tick, 16);
    }
    tick();
    return () => clearTimeout(timer);
     
  }, [started, target, durationMs]);

  const display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  return { ref, display };
}

function PipsStats({ closed }: { closed: Signal[] }) {
  const decisive = closed
    .filter((s) => (s.outcome === "WIN" || s.outcome === "LOSS") && priceDiff(s.entry, s.closePrice, s.direction) !== null)
    .slice()
    .sort((a, b) => (a.closedAt?.getTime() ?? 0) - (b.closedAt?.getTime() ?? 0));

  const pipsValues = decisive.map((s) => priceDiff(s.entry, s.closePrice, s.direction) as number);
  const totalPips = pipsValues.reduce((sum, p) => sum + p, 0);
  const wins = decisive.filter((s) => s.outcome === "WIN");
  const losses = decisive.filter((s) => s.outcome === "LOSS");
  const bestTrade = pipsValues.length ? Math.max(...pipsValues) : 0;
  const worstTrade = pipsValues.length ? Math.min(...pipsValues) : 0;

  const totalCount = useCountUp(totalPips, 1400, aggDecimals(totalPips));
  const bestCount = useCountUp(bestTrade, 1200, aggDecimals(bestTrade));
  const worstCount = useCountUp(Math.abs(worstTrade), 1200, aggDecimals(worstTrade));

  // Cumulative pips series for the sparkline.
  let running = 0;
  const cumulative = pipsValues.map((p) => (running += p));
  const points = cumulative.length > 0 ? cumulative : [0];
  const minY = Math.min(0, ...points);
  const maxY = Math.max(0, ...points);
  const rangeY = maxY - minY || 1;
  const W = 600;
  const H = 140;
  const stepX = points.length > 1 ? W / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? i * stepX : W / 2;
    const y = H - ((p - minY) / rangeY) * H;
    return [x, y] as const;
  });
  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const areaPath =
    coords.length > 0
      ? `${linePath} L${coords[coords.length - 1][0].toFixed(1)} ${H} L${coords[0][0].toFixed(1)} ${H} Z`
      : "";
  const zeroY = H - ((0 - minY) / rangeY) * H;
  const isPositive = totalPips >= 0;
  const lineColor = isPositive ? TICK_UP : TICK_DOWN;

  // Average trade duration, entry -> close.
  const durations = decisive
    .filter((s) => s.createdAt && s.closedAt)
    .map((s) => s.closedAt!.getTime() - s.createdAt.getTime());
  const avgDurationMs = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const avgDurationLabel = formatDuration(avgDurationMs);

  // Monthly pips breakdown.
  const monthlyMap = new Map<string, number>();
  for (const s of decisive) {
    const d = s.closedAt ?? s.createdAt;
    if (!d) continue;
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + (priceDiff(s.entry, s.closePrice, s.direction) ?? 0));
  }
  const monthly = Array.from(monthlyMap.entries());
  const monthlyMax = Math.max(1, ...monthly.map(([, v]) => Math.abs(v)));

  // Per-pair breakdown.
  type PairStat = { pair: string; total: number; count: number; wins: number };
  const pairMap = new Map<string, PairStat>();
  for (const s of decisive) {
    const key = s.pair;
    const entry = pairMap.get(key) ?? { pair: key, total: 0, count: 0, wins: 0 };
    entry.total += priceDiff(s.entry, s.closePrice, s.direction) ?? 0;
    entry.count += 1;
    if (s.outcome === "WIN") entry.wins += 1;
    pairMap.set(key, entry);
  }
  const pairStats = Array.from(pairMap.values()).sort((a, b) => b.total - a.total);
  const pairMax = Math.max(1, ...pairStats.map((p) => Math.abs(p.total)));

  if (decisive.length === 0) return null;

  return (
    <div
      ref={totalCount.ref}
      className="mt-10 overflow-hidden rounded-2xl border border-hairline bg-ink-soft p-6 md:p-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
            Toplam Fiyat Farkı (Kapanan İşlemler)
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="font-display text-5xl font-bold tabular-stat md:text-6xl"
              style={{ color: lineColor }}
            >
              {isPositive ? "+" : "-"}
              {totalCount.display}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">En İyi</div>
            <div ref={bestCount.ref} className="mt-1 font-display text-xl font-semibold" style={{ color: TICK_UP }}>
              +{bestCount.display}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">En Kötü</div>
            <div
              ref={worstCount.ref}
              className="mt-1 font-display text-xl font-semibold"
              style={{ color: TICK_DOWN }}
            >
              -{worstCount.display}
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">W / L</div>
            <div className="mt-1 font-display text-xl font-semibold text-text-on-ink">
              <span style={{ color: TICK_UP }}>{wins.length}</span>
              <span className="text-text-on-ink-muted"> / </span>
              <span style={{ color: TICK_DOWN }}>{losses.length}</span>
            </div>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
              Ort. Süre
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-text-on-ink">{avgDurationLabel}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full md:h-40" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pipsFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1={zeroY}
            x2={W}
            y2={zeroY}
            stroke="var(--text-on-ink-muted)"
            strokeOpacity="0.25"
            strokeDasharray="4 4"
          />
          {areaPath && (
            <path d={areaPath} fill="url(#pipsFade)" className="pips-area-in" />
          )}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pips-line-in"
              pathLength={1}
            />
          )}
          {coords.length > 0 && (
            <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r="4" fill={lineColor} />
          )}
        </svg>
        <div className="mt-2 flex justify-between font-mono text-[10px] text-text-on-ink-muted">
          <span>{decisive[0]?.closedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span>{decisive.length} işlem</span>
          <span>
            {decisive[decisive.length - 1]?.closedAt?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      </div>

      {monthly.length > 1 && (
        <div className="mt-8 border-t border-hairline pt-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
            Aylık Fiyat Farkı
          </span>
          <div className="mt-4 flex items-end gap-3">
            {monthly.map(([month, value], i) => {
              const barColor = value >= 0 ? TICK_UP : TICK_DOWN;
              const heightPct = Math.max(4, (Math.abs(value) / monthlyMax) * 100);
              return (
                <div key={month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="font-mono text-[11px] font-medium" style={{ color: barColor }}>
                    {value >= 0 ? "+" : ""}
                    {value.toFixed(aggDecimals(value))}
                  </span>
                  <div className="flex h-24 w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 rounded-t-md monthly-bar-in"
                      style={{
                        height: `${heightPct}%`,
                        background: barColor,
                        animationDelay: `${i * 80}ms`,
                      }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-text-on-ink-muted">{month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pairStats.length > 0 && (
        <div className="mt-8 border-t border-hairline pt-6">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-on-ink-muted">
            Parite Bazında Performans
          </span>
          <div className="mt-4 space-y-3">
            {pairStats.map((p, i) => {
              const barColor = p.total >= 0 ? TICK_UP : TICK_DOWN;
              const widthPct = Math.max(3, (Math.abs(p.total) / pairMax) * 100);
              const pairWinRate = Math.round((p.wins / p.count) * 100);
              return (
                <div key={p.pair} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 font-display text-sm font-semibold text-text-on-ink">
                    {p.pair}
                  </span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-ink">
                    <div
                      className="pair-bar-in h-full rounded-md"
                      style={
                        {
                          "--final-width": `${widthPct}%`,
                          background: `${barColor}4d`,
                          borderRight: `2px solid ${barColor}`,
                          animationDelay: `${i * 70}ms`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <span
                    className="w-20 shrink-0 text-right font-mono text-xs font-semibold"
                    style={{ color: barColor }}
                  >
                    {p.total >= 0 ? "+" : ""}
                    {p.total.toFixed(aggDecimals(p.total))}
                  </span>
                  <span className="w-20 shrink-0 text-right font-mono text-[11px] text-text-on-ink-muted">
                    {p.count} işlem
                  </span>
                  <span className="w-12 shrink-0 text-right font-mono text-[11px] text-text-on-ink-muted">
                    %{pairWinRate}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal, viewerTier }: { signal: Signal; viewerTier: PackageTier | null }) {
  const isBuy = signal.direction === "BUY";
  const isSell = signal.direction === "SELL";
  const directionColor = isSell ? TICK_DOWN : TICK_UP;
  const isClosed = signal.status === "closed";
  // Past performance is public regardless of package — only open/active
  // signals are gated.
  const locked = isClosed ? false : !canViewSignal(viewerTier, signal.pair);

  const cardDiff = priceDiff(signal.entry, signal.closePrice, signal.direction);
  const resultLine =
    cardDiff !== null
      ? formatDiff(cardDiff, decimalsOf(signal.entry))
      : signal.profit
        ? `${parseFloat(signal.profit) > 0 ? "+" : ""}$${signal.profit}`
        : null;
  const resultUnit = null;
  const resultColor = outcomeColor(signal.outcome);

  // Purely decorative — same as the homepage hero card's sparkline, never
  // meant to represent a real intraday price series (we don't have one
  // for most instruments), just a visual accent matching direction.
  const sparklinePath = isSell
    ? "M0 8 L20 10 L40 6 L60 18 L80 14 L100 26 L120 22 L140 32 L160 28 L180 36 L200 34"
    : "M0 32 L20 30 L40 34 L60 22 L80 26 L100 14 L120 18 L140 8 L160 12 L180 4 L200 6";

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-gradient-to-b from-ink-soft to-ink p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.7)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="notranslate font-display text-lg font-semibold text-text-on-ink">{signal.pair}</span>
          {(isBuy || isSell) && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{ background: `${directionColor}26`, color: directionColor }}
            >
              {signal.direction}
            </span>
          )}
        </div>
        {locked ? (
          <LockBadge pair={signal.pair} />
        ) : isClosed ? (
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-on-signal"
            style={{ background: outcomeColor(signal.outcome) }}
          >
            {signal.outcome ?? "KAPANDI"}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal">
            <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
            Canlı
          </span>
        )}
      </div>

      {locked ? (
        <p className="mt-2 font-display text-2xl font-bold tabular-stat text-text-on-ink-muted">••••••</p>
      ) : isClosed && resultLine ? (
        <p className="mt-2 font-display text-2xl font-bold tabular-stat" style={{ color: resultColor }}>
          {resultLine} {resultUnit && <span className="text-sm font-medium text-text-on-ink-muted">{resultUnit}</span>}
        </p>
      ) : (
        <p className="mt-2 font-display text-2xl font-bold tabular-stat text-text-on-ink">
          {signal.entry}
          <span className="ml-2 text-sm font-medium text-text-on-ink-muted">giriş</span>
        </p>
      )}

      <svg viewBox="0 0 200 40" className="mt-3 h-9 w-full" style={{ color: locked ? "var(--text-on-ink-muted)" : directionColor }} fill="none">
        <path d={sparklinePath} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={locked ? 0.35 : 1} />
      </svg>

      {locked ? (
        <Link
          href="/paketler"
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-hairline border-dashed pt-3 pb-2 font-mono text-[11px] text-text-on-ink-muted transition-colors hover:border-gold hover:text-gold"
        >
          Bu sinyal {TIER_LABEL[requiredTierForPair(signal.pair)]} üyelere özel — Yükselt →
        </Link>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 font-mono text-[11px]">
            <span className="text-text-on-ink-muted">
              {isClosed ? "Kapanış" : "Giriş"}{" "}
              <span className="text-text-on-ink">{isClosed ? signal.closePrice : signal.entry}</span>
            </span>
            {signal.target1 && <span style={{ color: TICK_UP }}>TP {signal.target1}</span>}
            {signal.stop && <span style={{ color: TICK_DOWN }}>SL {signal.stop}</span>}
          </div>

          {(signal.target2 || (isClosed && signal.volume)) && (
            <div className="mt-3 space-y-1.5 border-t border-hairline pt-3">
              {signal.target2 && <Level label="Kâr Al 2" value={signal.target2} color={TICK_UP} />}
              {isClosed && signal.volume && (
                <Level label="Hacim" value={`${signal.volume} lot`} color="var(--text-on-ink-muted)" />
              )}
            </div>
          )}
        </>
      )}

      <p className="mt-3 font-mono text-[11px] text-text-on-ink-muted">
        {(isClosed ? signal.closedAt : signal.createdAt)?.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        })}
      </p>
    </div>
  );
}

export default function SignalsBoard({
  initialActive,
  initialClosed,
  liveMarkets,
  viewerTier,
}: {
  initialActive: Signal[];
  initialClosed: Signal[];
  liveMarkets?: ReactNode;
  viewerTier: PackageTier | null;
}) {
  const [active, setActive] = useState(initialActive);
  const [closed, setClosed] = useState(initialClosed);
  const knownIds = useRef(new Set([...initialActive, ...initialClosed].map((s) => s.id)));

  const chartPairs = useMemo(() => {
    const seen = new Set<string>();
    const pairs: string[] = [];
    for (const s of active) {
      const p = s.pair.toUpperCase();
      if (!seen.has(p)) {
        seen.add(p);
        pairs.push(p);
      }
    }
    // Falls back to majors when there's no active signal yet, so the chart
    // panel still has something meaningful to show instead of going empty.
    return pairs.length > 0 ? pairs.slice(0, 6) : ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY"];
  }, [active]);
  const [chartSymbol, setChartSymbol] = useState(chartPairs[0]);

  // Keeps the chart pointed at a still-active pair — if the selected pair's
  // signal closes and drops off chartPairs, snap back to the new first pair
  // rather than silently charting a symbol that's no longer being traded.
  useEffect(() => {
    if (!chartPairs.includes(chartSymbol)) setChartSymbol(chartPairs[0]);
  }, [chartPairs, chartSymbol]);

  // Unlocks the chime's AudioContext on the visitor's first interaction
  // anywhere on the page — required by browser autoplay policy, and cheap
  // to attach unconditionally since unlockAudio() no-ops after the first call.
  useEffect(() => {
    document.addEventListener("pointerdown", unlockAudio, { once: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/signals", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data: { active: SignalJson[]; closed: SignalJson[] } = await res.json();
        if (cancelled) return;
        // Chime only for brand-new active signals — a new closed-trade
        // result isn't something a member needs to react to immediately,
        // and it would fire on every result the moment the board loads.
        const hasNewActiveSignal = data.active.some((s) => !knownIds.current.has(s.id));
        if (hasNewActiveSignal) playSignalChime();
        setActive(data.active.map(toSignal));
        setClosed(data.closed.map(toSignal));
        for (const s of [...data.active, ...data.closed]) knownIds.current.add(s.id);
      } catch {
        // Transient fetch failure — next poll tick will retry.
      }
    }

    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Only WIN/LOSS count toward the win rate — a breakeven close is neither.
  const decisive = closed.filter((s) => s.outcome === "WIN" || s.outcome === "LOSS");
  const wins = decisive.filter((s) => s.outcome === "WIN").length;
  const winRate = decisive.length > 0 ? Math.round((wins / decisive.length) * 100) : null;

  return (
    <>
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Canlı Sinyaller</span>
            <h1 className="mt-3 font-display text-3xl font-semibold md:text-4xl">Gerçek Zamanlı İşlem Sinyalleri</h1>
            <p className="mt-4 max-w-2xl text-text-on-ink-muted">
              Aşağıdaki her sinyal, otomatik bir EA aracılığıyla doğrudan takip edilen MT5 hesabımızdan gelir —
              Telegram kanalımızda ve X&apos;te paylaşılanlarla aynı girişler, her işlem kapandığında gerçek ve
              doğrulanmış bir sonuçla birlikte. Burada hiçbir şey simüle edilmemiş veya sonradan eklenmemiştir.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-10">
              <div>
                <div className="font-display text-3xl font-semibold">{active.length}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  Aktif Sinyaller
                </div>
              </div>
              <div>
                <div className="font-display text-3xl font-semibold">{decisive.length}</div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  Kapanan İşlemler
                </div>
              </div>
              <div className="flex flex-col items-center">
                <PerformanceRing rate={winRate} />
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-text-on-ink-muted">
                  Kazanma Oranı{decisive.length > 0 && decisive.length < 10 ? " (erken veri)" : ""}
                </div>
              </div>
            </div>
          </div>

          <PipsStats closed={closed} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Aktif Sinyaller</h2>
          <span className="hidden items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-signal md:flex">
            <span className="signal-dot h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />
            Canlı
          </span>
        </div>
        {active.length === 0 ? (
          <p className="text-text-on-ink-muted">
            Şu anda açık sinyal yok — bir sonrakini paylaşıldığı anda almak için{" "}
            <a href="https://t.me/fxpartnerglobal" className="text-signal hover:text-signal-strong">
              Telegram kanalımızı
            </a>{" "}
            takip edin.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-5">
            {active.map((s) => (
              <div key={s.id} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)]">
                <SignalCard signal={s} viewerTier={viewerTier} />
              </div>
            ))}
          </div>
        )}
      </section>

      {liveMarkets}

      <section className="border-b border-hairline bg-ink-soft/30">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">Canlı Grafik</h2>
            <div className="flex flex-wrap gap-2">
              {chartPairs.map((pair) => (
                <button
                  key={pair}
                  type="button"
                  onClick={() => setChartSymbol(pair)}
                  className={`notranslate rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.1em] transition-colors ${
                    chartSymbol === pair
                      ? "border-signal bg-signal/15 text-signal"
                      : "border-hairline text-text-on-ink-muted hover:border-text-on-ink hover:text-text-on-ink"
                  }`}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <TradingViewChart symbol={chartSymbol} />
            <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-hairline bg-ink p-6">
              <span className="font-mono text-xs uppercase tracking-[0.15em] text-text-on-ink-muted">
                Performans
              </span>
              <PerformanceRing rate={winRate} />
              <div className="grid w-full grid-cols-3 gap-2 border-t border-hairline pt-5 text-center">
                <div>
                  <div className="tabular-stat font-display text-xl font-semibold">
                    {active.length + closed.length}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                    Toplam Sinyal
                  </div>
                </div>
                <div>
                  <div className="tabular-stat font-display text-xl font-semibold text-tick-up">
                    {wins}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                    Kazanılan
                  </div>
                </div>
                <div>
                  <div className="tabular-stat font-display text-xl font-semibold text-tick-down">
                    {decisive.length - wins}
                  </div>
                  <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-text-on-ink-muted">
                    Kaybedilen
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold md:hidden">Son Sinyaller</h2>
          <SignalTable title="Son Sinyaller" signals={closed} closedView viewerTier={viewerTier} />
          {closed.length === 0 ? (
            <p className="mt-4 text-text-on-ink-muted md:hidden">
              Henüz kapanan sinyal yok — işlemler kapandıkça sonuçlar burada görünecek.
            </p>
          ) : (
            <div className="mt-6 flex flex-wrap justify-center gap-5 md:hidden">
              {closed.map((s) => (
                <div key={s.id} className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
                  <SignalCard signal={s} viewerTier={viewerTier} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
